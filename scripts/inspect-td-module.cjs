const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

fetchUrl('https://weadown.com/wordpress-plugins/').then(html => {
  const modules = [...html.matchAll(/<div[^>]*class="[^"]*td_module_[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi)];
  console.log('td_module blocks:', modules.length);
  if (modules.length > 0) {
    const sample = modules[0][1];
    const link = sample.match(/<a\s+href="([^"]+)"[^>]*title="([^"]+)"/i);
    const img = sample.match(/data-img-url="([^"]+)"/i) || sample.match(/src="([^"]+)"/i);
    const desc = sample.match(/<div[^>]*class="[^"]*td-excerpt[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    console.log({
      link: link ? link[1] : null,
      title: link ? link[2] : null,
      img: img ? img[1] : null,
      desc: desc ? desc[1].trim() : null
    });
  }
});
