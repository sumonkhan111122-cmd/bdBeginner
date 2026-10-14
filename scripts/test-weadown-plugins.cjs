const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const html = await fetchUrl('https://weadown.com/wordpress-plugin/');
  const matches = [...html.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/gi)];
  console.log('Plugin articles found:', matches.length);
  for (let i = 0; i < Math.min(5, matches.length); i++) {
    const raw = matches[i][1];
    const linkMatch = raw.match(/<a\s+href="([^"]+)"[^>]*rel="bookmark">([^<]+)<\/a>/i) ||
                     raw.match(/<h2[^>]*>\s*<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/i);
    const imgMatch = raw.match(/<img[^>]+src="([^"]+)"/i);
    console.log(`Plugin ${i + 1}:`, {
      title: linkMatch ? linkMatch[2].trim() : 'No title',
      url: linkMatch ? linkMatch[1] : 'No url',
      img: imgMatch ? imgMatch[1] : 'No img'
    });
  }
}

main().catch(console.error);
