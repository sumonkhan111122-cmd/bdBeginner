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

fetchUrl('https://weadown.com/').then(html => {
  const navLinks = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi)];
  const categories = navLinks.filter(l => l[1].includes('weadown.com') && (l[2].toLowerCase().includes('plugin') || l[2].toLowerCase().includes('theme') || l[2].toLowerCase().includes('wordpress') || l[2].toLowerCase().includes('script')));
  console.log('Categories found:', categories.map(c => ({ text: c[2].trim(), url: c[1] })));
});
