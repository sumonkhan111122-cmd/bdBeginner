const { chromium } = require('playwright');

/**
 * Multi-Step Download Link Extractor using Playwright
 * 
 * Process:
 * 1. Open the original product post.
 * 2. Find and open the intermediate download page (e.g. /files/<slug>/).
 * 3. Click the initial download button ("Generate Secure Link").
 * 4. Dynamically detect when countdown finishes (class changes to zmk-is-ready, text changes to "View & Download File", or API response).
 * 5. Trigger the ready button / follow the legitimate redirect with full session & referer.
 * 6. Settle on the final download URL (or stable hosting URL) without downloading large files.
 */
class DownloadExtractor {
  constructor(options = {}) {
    this.headless = options.headless ?? true;
    this.timeout = options.timeout ?? 35000;
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {}
      this.browser = null;
    }
  }

  /**
   * Extract download link for a single source product
   * @param {string} sourcePostUrl - URL of the product page (e.g. https://weadown.com/res/.../)
   * @returns {Promise<{
   *   success: boolean,
   *   sourcePostUrl: string,
   *   downloadPageUrl: string | null,
   *   finalDownloadUrl: string | null,
   *   packageName: string | null,
   *   fileSize: string | null,
   *   error?: string
   * }>}
   */
  async extract(sourcePostUrl) {
    const browser = await this.initBrowser();
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();
    let downloadPageUrl = null;
    let goUrlFromApi = null;
    let finalDownloadUrl = null;
    let packageName = null;
    let fileSize = null;

    try {
      // Step 1: Open the original product post
      await page.goto(sourcePostUrl, {
        waitUntil: 'domcontentloaded',
        timeout: this.timeout
      });

      // Step 2: Find intermediate download page link
      const fileLinks = await page.locator('a[href*="/files/"]').all();
      if (fileLinks.length > 0) {
        for (const link of fileLinks) {
          const href = await link.getAttribute('href');
          const text = (await link.innerText().catch(() => '')).trim();
          if (href && href.includes('/files/')) {
            downloadPageUrl = href;
            packageName = text || null;
            break;
          }
        }
      }

      // Fallback: check if sourcePostUrl itself is already a /files/ page
      if (!downloadPageUrl && sourcePostUrl.includes('/files/')) {
        downloadPageUrl = sourcePostUrl;
      }

      if (!downloadPageUrl) {
        throw new Error('No download page link found on product post');
      }

      // Step 3: Open the intermediate download page
      await page.goto(downloadPageUrl, {
        waitUntil: 'domcontentloaded',
        timeout: this.timeout
      });

      // Check for any access challenges / bot protection
      const pageTitle = await page.title();
      if (/just a moment|security check|cloudflare|access denied/i.test(pageTitle)) {
        throw new Error('Blocked by access challenge or Cloudflare security check');
      }

      // Listen for network API response for /zmk/complete
      page.on('response', async (response) => {
        const resUrl = response.url();
        if (resUrl.includes('/zmk/complete')) {
          try {
            const json = await response.json();
            if (json.items && json.items[0]?.go_url) {
              goUrlFromApi = json.items[0].go_url;
            }
          } catch (e) {}
        }
      });

      // Step 4: Find the action button
      const actionButton = page.locator('a.zmk-file-link, a.zmk-action-button, [data-link-type="file"]').first();
      const hasButton = await actionButton.count();

      if (!hasButton) {
        throw new Error('Download action button not found on download page');
      }

      // Click initial download button to start the countdown
      await actionButton.click({ timeout: 5000 });

      // Step 5: Dynamically detect countdown completion
      await page.waitForFunction(() => {
        const btn = document.querySelector('a.zmk-file-link, a.zmk-action-button');
        if (!btn) return false;
        const isReady = btn.classList.contains('zmk-is-ready') || btn.classList.contains('zmk-is-complete');
        const text = (btn.innerText || '').toLowerCase();
        const hasReadyText = text.includes('view') || text.includes('download');
        const notCounting = !text.includes('verifying') && !text.includes('waiting') && !text.includes('second');
        return isReady || (hasReadyText && notCounting);
      }, { timeout: 25000 });

      // Step 6: Follow the redirect with full browser session & referer
      // Wait up to 3 seconds for goUrlFromApi to populate if not already
      let waited = 0;
      while (!goUrlFromApi && waited < 3000) {
        await page.waitForTimeout(300);
        waited += 300;
      }

      if (goUrlFromApi) {
        const targetPage = await context.newPage();
        await targetPage.setExtraHTTPHeaders({ 'Referer': downloadPageUrl });

        // Listen for direct download events without saving file to disk
        targetPage.on('download', async (dl) => {
          finalDownloadUrl = dl.url();
          await dl.cancel();
        });

        const navRes = await targetPage.goto(goUrlFromApi, {
          waitUntil: 'domcontentloaded',
          timeout: this.timeout
        });

        // The current settled URL of targetPage
        const settledUrl = targetPage.url();
        if (settledUrl && !settledUrl.includes('/files/go/')) {
          finalDownloadUrl = settledUrl;
        }

        // Try extracting filename & size if landed on host (e.g. Zifury)
        try {
          const bodyText = await targetPage.innerText('body').catch(() => '');
          const sizeMatch = bodyText.match(/Filesize\s*\n*\s*([\d\.]+\s*(?:MB|KB|GB))/i);
          if (sizeMatch) fileSize = sizeMatch[1];
          const zipMatch = bodyText.match(/([\w\.\-]+\.(?:zip|rar|tar\.gz))/i);
          if (zipMatch) packageName = zipMatch[1];
        } catch (e) {}

        await targetPage.close().catch(() => {});
      } else {
        // Fallback: check if button updated href
        const hrefAfter = await actionButton.getAttribute('href');
        if (hrefAfter && hrefAfter !== '#' && !hrefAfter.startsWith('javascript:')) {
          finalDownloadUrl = hrefAfter;
        } else {
          // Trigger click and wait for navigation/popup
          const [popup] = await Promise.all([
            context.waitForEvent('page', { timeout: 10000 }).catch(() => null),
            actionButton.click({ force: true }).catch(() => {})
          ]);
          if (popup) {
            await popup.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
            finalDownloadUrl = popup.url();
            await popup.close().catch(() => {});
          }
        }
      }

      if (!finalDownloadUrl) {
        throw new Error('Could not resolve final download link after countdown');
      }

      await context.close().catch(() => {});

      return {
        success: true,
        sourcePostUrl,
        downloadPageUrl,
        finalDownloadUrl,
        packageName,
        fileSize
      };

    } catch (err) {
      await context.close().catch(() => {});
      return {
        success: false,
        sourcePostUrl,
        downloadPageUrl,
        finalDownloadUrl: null,
        packageName,
        fileSize: null,
        error: err.message || 'Download link extraction failed'
      };
    }
  }
}

module.exports = {
  DownloadExtractor
};
