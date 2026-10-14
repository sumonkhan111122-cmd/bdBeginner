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
  const urls = [
    'https://weadown.com/wordpress-plugins/',
    'https://weadown.com/wordpress-plugins/page/2/'
  ];

  for (const pageUrl of urls) {
    console.log('Fetching', pageUrl);
    const html = await fetchUrl(pageUrl);
    const modules = [...html.matchAll(/<div[^>]*class="[^"]*td_module_[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi)];
    console.log('Modules found on page:', modules.length);

    for (const mod of modules) {
      const block = mod[1];
      const linkMatch = block.match(/<h[23][^>]*class="[^"]*entry-title[^"]*"[^>]*>\s*<a\s+href="([^"]+)"[^>]*title="([^"]+)"/i) ||
                        block.match(/<a\s+href="([^"]+)"[^>]*title="([^"]+)"/i);
      const imgMatch = block.match(/data-img-url="([^"]+)"/i) ||
                       block.match(/src="([^"]+)"/i);
      const descMatch = block.match(/<div[^>]*class="[^"]*td-excerpt[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

      if (linkMatch && imgMatch) {
        const postUrl = linkMatch[1];
        const title = decodeHtml(linkMatch[2]);
        const imageUrl = imgMatch[1];
        const desc = descMatch ? decodeHtml(descMatch[1]) : '';
        const slug = postUrl.replace(/^https?:\/\/[^\/]+\/res\//, '').replace(/\/$/, '');
        const verMatch = title.match(/(?:v|version\s*)?(\d+\.\d+(?:\.\d+)?(?:\.\d+)?)/i);

        plugins.push({
          name: title,
          postUrl,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          imageUrl,
          shortDescription: desc,
          version: verMatch ? verMatch[1] : 'Latest'
        });
      }
    }
  }

  console.log(`Total plugins collected: ${plugins.length}`);
  fs.writeFileSync('scripts/scraped-weadown-plugins.json', JSON.stringify(plugins, null, 2));
}

scrapePlugins().catch(console.error);
