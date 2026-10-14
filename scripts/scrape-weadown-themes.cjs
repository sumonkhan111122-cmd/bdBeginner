const fs = require('fs');
const path = require('path');

const THEMES_PAGE_URL = 'https://weadown.com/wordpress-theme/';

function decodeHtml(value) {
  if (!value) return '';
  const named = {
    amp: '&',
    apos: "'",
    quot: '"',
    lt: '<',
    gt: '>',
    nbsp: ' ',
    ndash: '–',
    mdash: '—',
    hellip: '…',
  };
  return value
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function stripTags(value) {
  return decodeHtml((value || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html, property) {
  const reg = new RegExp(`<meta\\s+property=["']${property}["']\\s+content=["'](.*?)["']`, 'i');
  const match = html.match(reg);
  if (match) return decodeHtml(match[1]);
  const reg2 = new RegExp(`<meta\\s+name=["']${property}["']\\s+content=["'](.*?)["']`, 'i');
  const match2 = html.match(reg2);
  return match2 ? decodeHtml(match2[1]) : null;
}

function extractVersion(title) {
  const version = title.match(/(?:^|\s)v?(\d+(?:\.\d+){1,4})(?=\s|\+|–|-|$)/i);
  return version ? version[1] : null;
}

async function fetchUrl(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    }
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status} for ${url}`);
  return res.text();
}

async function run() {
  console.log('Fetching themes listing from:', THEMES_PAGE_URL);
  const mainHtml = await fetchUrl(THEMES_PAGE_URL);
  
  // Find all post links matching https://weadown.com/res/...
  const urlMatches = mainHtml.match(/https:\/\/weadown\.com\/res\/[a-z0-9\-]+\//gi) || [];
  const uniqueUrls = [...new Set(urlMatches.map(u => u.toLowerCase()))];
  
  console.log(`Found ${uniqueUrls.length} unique theme URLs on page.`);
  const targetUrls = uniqueUrls.slice(0, 24); // Get up to 24 themes

  const scrapedProducts = [];

  for (let i = 0; i < targetUrls.length; i++) {
    const themeUrl = targetUrls[i];
    const slug = themeUrl.replace('https://weadown.com/res/', '').replace(/\/$/, '');
    console.log(`[${i + 1}/${targetUrls.length}] Scraping ${slug}...`);

    try {
      const pageHtml = await fetchUrl(themeUrl);

      const ogTitle = extractMeta(pageHtml, 'og:title') || '';
      const cleanTitle = ogTitle.replace(/\s*[|–-]\s*WeaDown\s*$/i, '').trim();
      const rawDesc = extractMeta(pageHtml, 'og:description') || '';
      const ogImage = extractMeta(pageHtml, 'og:image');
      const version = extractVersion(cleanTitle) || '1.0.0';

      // Clean short description
      const shortDesc = stripTags(rawDesc).slice(0, 160) || 'Premium WordPress theme with clean design, performance optimizations, and responsive layouts.';
      const fullDesc = stripTags(rawDesc) || shortDesc;

      scrapedProducts.push({
        sourceUrl: themeUrl,
        slug: slug,
        name: cleanTitle || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        version: version,
        imageUrl: ogImage,
        shortDescription: shortDesc,
        description: fullDesc
      });
    } catch (err) {
      console.error(`Failed to scrape ${themeUrl}:`, err.message);
    }
  }

  console.log(`\nSuccessfully scraped ${scrapedProducts.length} real products!`);
  fs.writeFileSync(path.join(__dirname, 'scraped-weadown-themes.json'), JSON.stringify(scrapedProducts, null, 2));
  console.log('Saved to scripts/scraped-weadown-themes.json');
}

run().catch(console.error);
