const crypto = require('crypto');

/**
 * Unified Download Extractor
 * 
 * Supports 2 execution tiers:
 * - Tier 1: Fast, lightweight HTTP extraction (Zero browser overhead, 100% Vercel Serverless Function native).
 * - Tier 2: Browser automation fallback (Remote Browser CDP / Browserless / Local Playwright).
 */
class UnifiedExtractor {
  constructor(options = {}) {
    this.timeout = options.timeout || 35000;
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    this.remoteBrowserWs = process.env.REMOTE_BROWSER_WS_ENDPOINT || options.remoteBrowserWs || null;
    this.preferBrowser = options.preferBrowser || false;
  }

  generateRequestId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Main extract method. Tries Lightweight HTTP first, falls back to Browser automation if needed.
   */
  async extract(sourcePostUrl) {
    if (!sourcePostUrl || !sourcePostUrl.startsWith('http')) {
      return {
        success: false,
        sourcePostUrl,
        downloadPageUrl: null,
        finalDownloadUrl: null,
        packageName: null,
        fileSize: null,
        error: 'Invalid source post URL'
      };
    }

    // If preferBrowser is explicitly true, skip to browser
    if (this.preferBrowser) {
      return this.extractViaBrowser(sourcePostUrl);
    }

    // Tier 1: Try Lightweight HTTP Extraction
    try {
      const httpResult = await this.extractViaHttp(sourcePostUrl);
      if (httpResult.success && httpResult.finalDownloadUrl) {
        httpResult.extractionEngine = 'lightweight_http';
        return httpResult;
      }
      console.warn(`[UnifiedExtractor] HTTP extraction did not yield a final URL for ${sourcePostUrl}. Reason: ${httpResult.error}. Falling back to browser automation.`);
    } catch (httpErr) {
      console.warn(`[UnifiedExtractor] HTTP extraction error for ${sourcePostUrl}: ${httpErr.message}. Falling back to browser automation.`);
    }

    // Tier 2: Fallback to Browser Automation
    try {
      const browserResult = await this.extractViaBrowser(sourcePostUrl);
      browserResult.extractionEngine = this.remoteBrowserWs ? 'remote_browser_cdp' : 'playwright_browser';
      return browserResult;
    } catch (browserErr) {
      return {
        success: false,
        sourcePostUrl,
        downloadPageUrl: null,
        finalDownloadUrl: null,
        packageName: null,
        fileSize: null,
        error: `Both HTTP and Browser extraction failed: ${browserErr.message}`
      };
    }
  }

  /**
   * Tier 1: Lightweight HTTP Extractor (Vercel Serverless Native)
   */
  async extractViaHttp(sourcePostUrl) {
    // Step 1: Fetch source product post
    const postRes = await fetch(sourcePostUrl, {
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!postRes.ok) {
      throw new Error(`Failed to load product page (HTTP ${postRes.status})`);
    }

    const postHtml = await postRes.text();

    // Look for intermediate download page link (e.g. /files/<slug>/)
    const fileLinkMatch = postHtml.match(/href=["'](https?:\/\/weadown\.com\/files\/[^"']+)["']/i);
    if (!fileLinkMatch) {
      // Check if there is a direct download link already
      const directMatch = postHtml.match(/href=["'](https?:\/\/(?:drive\.google\.com|mediafire\.com|mega\.nz|zifury\.com)[^"']+)["']/i);
      if (directMatch) {
        return {
          success: true,
          sourcePostUrl,
          downloadPageUrl: null,
          finalDownloadUrl: directMatch[1],
          packageName: this.extractFilenameFromUrl(directMatch[1]),
          fileSize: null
        };
      }
      throw new Error('No download file page link found on product post');
    }

    const downloadPageUrl = fileLinkMatch[1];

    // Step 2: Fetch intermediate download page
    const filePageRes = await fetch(downloadPageUrl, {
      headers: {
        'User-Agent': this.userAgent,
        'Referer': sourcePostUrl,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!filePageRes.ok) {
      throw new Error(`Failed to load download page (HTTP ${filePageRes.status})`);
    }

    const setCookie = filePageRes.headers.get('set-cookie');
    const cookieHeader = setCookie ? setCookie.split(';')[0] : '';
    const fileHtml = await filePageRes.text();

    // Check for package filename in page text if available
    let packageName = null;
    let fileSize = null;
    const pkgMatch = fileHtml.match(/([a-zA-Z0-9_-]+\.(?:zip|rar|tar\.gz|7z))/i);
    if (pkgMatch) packageName = pkgMatch[1];

    // Extract data-slug
    const slugMatch = fileHtml.match(/data-slug="([^"]+)"/i);
    if (!slugMatch) {
      throw new Error('data-slug not found on download page');
    }
    const slug = slugMatch[1];

    // Step 3: Trigger /zmk/start/
    const startUrl = 'https://weadown.com/zmk/start/?link_type=file';
    const startPayload = new URLSearchParams({
      request_id: this.generateRequestId(),
      slugs: slug
    }).toString();

    const startRes = await fetch(startUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': this.userAgent,
        'Referer': downloadPageUrl,
        'Origin': 'https://weadown.com',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookieHeader
      },
      body: startPayload,
      signal: AbortSignal.timeout(15000)
    });

    const startData = await startRes.json();
    if (!startData.items || !startData.items[0] || !startData.items[0].token) {
      const msg = startData.message || (startData.items && startData.items[0] && startData.items[0].message) || 'Start session failed';
      throw new Error(`Session start rejected: ${msg}`);
    }

    const item = startData.items[0];
    const token = item.token;
    const waitSeconds = Math.max(1, Math.min(20, parseInt(item.wait_seconds || 10, 10)));

    // Non-blocking wait for the source countdown
    await new Promise(r => setTimeout(r, (waitSeconds + 1) * 1000));

    // Step 4: Trigger /zmk/complete/
    const completeUrl = 'https://weadown.com/zmk/complete/?link_type=file';
    const completePayload = new URLSearchParams({
      tokens: token
    }).toString();

    const completeRes = await fetch(completeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': this.userAgent,
        'Referer': downloadPageUrl,
        'Origin': 'https://weadown.com',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': cookieHeader
      },
      body: completePayload,
      signal: AbortSignal.timeout(15000)
    });

    const completeData = await completeRes.json();
    if (!completeData.items || !completeData.items[0] || !completeData.items[0].go_url) {
      const msg = completeData.message || (completeData.items && completeData.items[0] && completeData.items[0].message) || 'Complete session failed';
      throw new Error(`Session complete rejected: ${msg}`);
    }

    const goUrl = completeData.items[0].go_url;

    // Step 5: Follow go_url redirect to get the final download URL
    const goRes = await fetch(goUrl, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'User-Agent': this.userAgent,
        'Referer': downloadPageUrl,
        'Cookie': cookieHeader
      },
      signal: AbortSignal.timeout(15000)
    });

    let finalDownloadUrl = goRes.headers.get('location') || goUrl;

    // If redirected to an external host (e.g. Zifury), inspect metadata without downloading file body
    if (finalDownloadUrl.includes('zifury.com')) {
      try {
        const zifuryRes = await fetch(finalDownloadUrl, {
          headers: {
            'User-Agent': this.userAgent,
            'Referer': downloadPageUrl
          },
          signal: AbortSignal.timeout(10000)
        });
        if (zifuryRes.ok) {
          const zifuryHtml = await zifuryRes.text();
          const sizeMatch = zifuryHtml.match(/Filesize\s*:?\s*([0-9.]+\s*(?:KB|MB|GB))/i);
          if (sizeMatch) fileSize = sizeMatch[1];
          const titleMatch = zifuryHtml.match(/<title>([^<]+?)\s*-\s*zifury<\/title>/i);
          if (titleMatch && titleMatch[1].trim()) packageName = titleMatch[1].trim();
        }
      } catch (e) {
        // Non-fatal
      }
    } else if (finalDownloadUrl.includes('weadown.com') || finalDownloadUrl.startsWith('http')) {
      try {
        const headRes = await fetch(finalDownloadUrl, {
          method: 'HEAD',
          redirect: 'manual',
          headers: {
            'User-Agent': this.userAgent,
            'Referer': downloadPageUrl
          },
          signal: AbortSignal.timeout(10000)
        });
        const nextLoc = headRes.headers.get('location');
        if (nextLoc) finalDownloadUrl = nextLoc;

        const contentDisposition = headRes.headers.get('content-disposition');
        if (contentDisposition) {
          const fnMatch = contentDisposition.match(/filename=["']?([^"';]+)["']?/i);
          if (fnMatch) packageName = fnMatch[1];
        }

        const contentLength = headRes.headers.get('content-length');
        if (contentLength && !fileSize) {
          const bytes = parseInt(contentLength, 10);
          if (bytes > 1024 * 1024) {
            fileSize = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
          } else {
            fileSize = `${(bytes / 1024).toFixed(2)} KB`;
          }
        }
      } catch (e) {
        // HEAD error is non-fatal
      }
    }

    if (!packageName) {
      packageName = this.extractFilenameFromUrl(finalDownloadUrl);
    }

    return {
      success: true,
      sourcePostUrl,
      downloadPageUrl,
      finalDownloadUrl,
      packageName,
      fileSize
    };
  }

  /**
   * Tier 2: Browser Automation Fallback (Remote Browser CDP or Local Playwright)
   */
  async extractViaBrowser(sourcePostUrl) {
    let playwright;
    try {
      playwright = require('playwright');
    } catch (e) {
      try {
        playwright = require('playwright-core');
      } catch (e2) {
        throw new Error('Playwright is not installed for browser fallback');
      }
    }

    let browser;
    if (this.remoteBrowserWs) {
      // Connect to remote browser service (Browserless / Bright Data / etc.)
      browser = await playwright.chromium.connect(this.remoteBrowserWs);
    } else {
      // Launch local Chromium
      browser = await playwright.chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled'
        ]
      });
    }

    const context = await browser.newContext({
      userAgent: this.userAgent,
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();
    let downloadPageUrl = null;
    let finalDownloadUrl = null;
    let packageName = null;
    let fileSize = null;

    try {
      // 1. Open post
      await page.goto(sourcePostUrl, { waitUntil: 'domcontentloaded', timeout: this.timeout });

      // Find file page link
      const fileLink = await page.$('a[href*="/files/"]');
      if (fileLink) {
        downloadPageUrl = await fileLink.getAttribute('href');
      }

      if (!downloadPageUrl) {
        throw new Error('Could not find download page link on product page');
      }

      // 2. Open intermediate download page
      await page.goto(downloadPageUrl, { waitUntil: 'domcontentloaded', timeout: this.timeout });

      // Intercept file download events immediately to prevent large downloads
      page.on('download', async (download) => {
        finalDownloadUrl = download.url();
        packageName = download.suggestedFilename();
        try {
          await download.cancel();
        } catch (e) {}
      });

      // 3. Click initial button
      const startButton = page.locator('.zmk-action-button, a[data-start-url], button:has-text("Generate Secure Link")').first();
      await startButton.waitFor({ state: 'visible', timeout: 10000 });
      await startButton.click();

      // 4. Wait for countdown
      await page.waitForFunction(() => {
        const btn = document.querySelector('.zmk-action-button, a[data-complete-url]');
        if (!btn) return false;
        return btn.classList.contains('zmk-is-ready') ||
               btn.classList.contains('zmk-is-complete') ||
               btn.getAttribute('aria-disabled') === 'false';
      }, { timeout: 25000 });

      // 5. Click the ready button
      const readyButton = page.locator('.zmk-is-ready, .zmk-action-button[aria-disabled="false"], a:has-text("Download")').first();
      
      const [popup] = await Promise.all([
        page.waitForEvent('popup', { timeout: 10000 }).catch(() => null),
        readyButton.click({ timeout: 5000 }).catch(() => null)
      ]);

      const targetPage = popup || page;
      await targetPage.waitForTimeout(3000);

      const targetUrl = targetPage.url();
      if (targetUrl && !targetUrl.includes('weadown.com/files/') && !finalDownloadUrl) {
        finalDownloadUrl = targetUrl;
      }

      if (!finalDownloadUrl) {
        finalDownloadUrl = targetPage.url();
      }

      if (!packageName) {
        packageName = this.extractFilenameFromUrl(finalDownloadUrl);
      }

      return {
        success: true,
        sourcePostUrl,
        downloadPageUrl,
        finalDownloadUrl,
        packageName,
        fileSize
      };
    } finally {
      await context.close().catch(() => {});
      await browser.close().catch(() => {});
    }
  }

  extractFilenameFromUrl(url) {
    if (!url) return null;
    try {
      const pathname = new URL(url).pathname;
      const parts = pathname.split('/').filter(Boolean);
      const last = parts[parts.length - 1];
      if (last && (last.endsWith('.zip') || last.endsWith('.rar') || last.endsWith('.gz') || last.endsWith('.7z'))) {
        return last;
      }
      return last || 'download-package.zip';
    } catch (e) {
      return 'download-package.zip';
    }
  }
}

// Singleton instance
const unifiedExtractor = new UnifiedExtractor();

module.exports = {
  UnifiedExtractor,
  unifiedExtractor
};
