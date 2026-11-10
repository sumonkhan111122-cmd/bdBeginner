const crypto = require('crypto');

async function test() {
  const sourceUrl = 'https://weadown.com/res/kadence-pro-premium-addon/';
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
  
  console.log('1. Visiting article...');
  const res1 = await fetch(sourceUrl, { headers: { 'User-Agent': userAgent } });
  const cookies1 = (res1.headers.getSetCookie ? res1.headers.getSetCookie() : [res1.headers.get('set-cookie')]).filter(Boolean);
  const html1 = await res1.text();
  const fileLinkMatch = html1.match(/href=["'](https?:\/\/weadown\.com\/files\/[^"']+)["']/i);
  console.log('File page URL:', fileLinkMatch ? fileLinkMatch[1] : 'NOT FOUND');
  console.log('Cookies from article:', cookies1);

  if (!fileLinkMatch) return;
  const fileUrl = fileLinkMatch[1];
  
  let cookieMap = {};
  cookies1.forEach(c => {
    const [kv] = c.split(';');
    const [k, ...v] = kv.split('=');
    cookieMap[k.trim()] = v.join('=').trim();
  });

  console.log('2. Visiting file page with cookies...');
  const cookieHeader1 = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');
  const res2 = await fetch(fileUrl, {
    headers: {
      'User-Agent': userAgent,
      'Referer': sourceUrl,
      'Cookie': cookieHeader1
    }
  });
  const cookies2 = (res2.headers.getSetCookie ? res2.headers.getSetCookie() : [res2.headers.get('set-cookie')]).filter(Boolean);
  cookies2.forEach(c => {
    const [kv] = c.split(';');
    const [k, ...v] = kv.split('=');
    cookieMap[k.trim()] = v.join('=').trim();
  });

  const finalCookieHeader = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');
  console.log('Combined cookies:', finalCookieHeader);

  const html2 = await res2.text();
  const slugMatch = html2.match(/data-slug=["']([^"']+)["']/i);
  console.log('Data slug:', slugMatch ? slugMatch[1] : 'NOT FOUND');
  if (!slugMatch) return;

  console.log('3. Calling /zmk/start/ ...');
  const startUrl = 'https://weadown.com/zmk/start/?link_type=file';
  const startRes = await fetch(startUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': userAgent,
      'Referer': fileUrl,
      'Origin': 'https://weadown.com',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': finalCookieHeader
    },
    body: new URLSearchParams({
      request_id: crypto.randomBytes(16).toString('hex'),
      slugs: slugMatch[1]
    }).toString()
  });

  const startData = await startRes.json();
  console.log('Start Data:', JSON.stringify(startData, null, 2));

  if (startData.items && startData.items[0] && startData.items[0].token) {
    const token = startData.items[0].token;
    const waitSeconds = Math.max(1, parseInt(startData.items[0].wait_seconds || 10, 10));
    console.log(`Waiting ${waitSeconds} seconds for countdown...`);
    await new Promise(r => setTimeout(r, (waitSeconds + 1) * 1000));

    console.log('4. Calling /zmk/complete/ ...');
    const completeUrl = 'https://weadown.com/zmk/complete/?link_type=file';
    const completeRes = await fetch(completeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': userAgent,
        'Referer': fileUrl,
        'Origin': 'https://weadown.com',
        'X-Requested-With': 'XMLHttpRequest',
        'Cookie': finalCookieHeader
      },
      body: new URLSearchParams({
        tokens: token
      }).toString()
    });

    const completeData = await completeRes.json();
    console.log('Complete Data:', JSON.stringify(completeData, null, 2));

    if (completeData.items && completeData.items[0] && completeData.items[0].go_url) {
      const goUrl = completeData.items[0].go_url;
      console.log('5. Following go_url:', goUrl);
      const goRes = await fetch(goUrl, {
        headers: {
          'User-Agent': userAgent,
          'Referer': fileUrl,
          'Cookie': finalCookieHeader
        },
        redirect: 'follow'
      });
      console.log('Final resolved URL:', goRes.url);
    }
  }
}

test().catch(console.error);

