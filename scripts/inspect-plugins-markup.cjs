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
  console.log('Length:', html.length);
  const divs = [...html.matchAll(/class="([^"]*(?:post|entry|item|card)[^"]*)"/gi)].slice(0, 20);
  console.log('Post class samples:', divs.map(d => d[1]));
  const titles = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)].slice(0, 10);
  console.log('Titles found:', titles.map(t => t[1].trim().slice(0, 80)));
});
