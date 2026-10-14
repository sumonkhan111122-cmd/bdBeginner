const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function decodeHtml(html) {
  return html
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8230;/g, '...')
    .replace(/<[^>]+>/g, '')
    .trim();
}

async function scrapePlugins() {
  const plugins = [];
  for (let page = 1; page <= 3; page++) {
    const url = page === 1 ? 'https://weadown.com/wordpress-plugins/' : `https://weadown.com/wordpress-plugins/page/${page}/`;
    console.log('Fetching', url);
    const html = await fetchUrl(url);
    const articles = [...html.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/gi)];
    console.log(`Page ${page} articles:`, articles.length);

    for (const art of articles) {
      const content = art[1];
      const titleMatch = content.match(/<h2[^>]*class="[^"]*entry-title[^"]*"[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
                         content.match(/<h2[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
      const imgMatch = content.match(/<img[^>]+src="([^"]+)"/i) || content.match(/data-src="([^"]+)"/i);
      const descMatch = content.match(/<div[^>]*class="[^"]*entry-summary[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        content.match(/<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
                        content.match(/<p>([\s\S]*?)<\/p>/i);

      if (titleMatch) {
        const rawTitle = decodeHtml(titleMatch[2]);
        const postUrl = titleMatch[1];
        const rawImg = imgMatch ? imgMatch[1] : '';
        const rawDesc = descMatch ? decodeHtml(descMatch[1]) : '';
        const slug = postUrl.replace(/^https?:\/\/[^\/]+\/res\//, '').replace(/\/$/, '');
        const verMatch = rawTitle.match(/(?:v|version\s*)?(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/i);

        plugins.push({
          name: rawTitle,
          postUrl,
          slug: slug || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          imageUrl: rawImg,
          shortDescription: rawDesc.slice(0, 200),
          description: rawDesc,
          version: verMatch ? verMatch[1] : 'Latest'
        });
      }
    }
  }

  console.log(`Total plugins scraped: ${plugins.length}`);
  fs.writeFileSync('scripts/scraped-weadown-plugins.json', JSON.stringify(plugins, null, 2));
}

scrapePlugins().catch(console.error);
