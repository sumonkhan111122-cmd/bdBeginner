const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      console.log('Status code:', res.statusCode);
      console.log('Headers:', res.headers.location || '');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

fetchUrl('https://weadown.com/wordpress-plugin/').then(html => {
  console.log('HTML snippet:', html.slice(0, 500));
});
