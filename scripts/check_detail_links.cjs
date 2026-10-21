const fs = require('fs');

async function checkLinks(url) {
  const res = await fetch(url);
  const text = await res.text();
  // Find all a hrefs in the page
  const matches = [...text.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  const external = matches.map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
                          .filter(l => !l.href.startsWith('#') && !l.href.includes('javascript') && !l.href.includes('blogger.com') && !l.href.includes('idcardscannerpro.com'));
  console.log('=== URL:', url);
  console.log('External links found:', external);
}

async function run() {
  await checkLinks('https://www.idcardscannerpro.com/p/sa.html');
  await checkLinks('https://www.idcardscannerpro.com/p/visa.html');
  await checkLinks('https://www.idcardscannerpro.com/p/idmpc.html');
}
run();
