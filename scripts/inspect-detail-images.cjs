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

async function inspect(url) {
  const html = await fetchUrl(url);
  const imgs = [...html.matchAll(/<img\s+[^>]*>/gi)].map(m => m[0]);
  console.log(`Image tags count for ${url}:`, imgs.length);
  imgs.forEach((tag, idx) => console.log(`Tag ${idx + 1}:`, tag));
}

inspect('https://weadown.com/res/salient-wordpress-theme/');
