const crypto = require('crypto');

/**
 * Fast Programmatic Download Link Extractor for WeaDown
 * Uses lightweight HTTP with Cookie preservation & session negotiation.
 */
async function extractDirectDownloadLink(sourcePostUrl, options = {}) {
  const timeoutMs = options.timeout || 20000;
  const userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  // 1. Visit article page
  const res1 = await fetch(sourcePostUrl, {
    headers: {
      'User-Agent': userAgent,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!res1.ok) {
    throw new Error(`Article HTTP ${res1.status}`);
  }

  const cookies1 = (res1.headers.getSetCookie ? res1.headers.getSetCookie() : [res1.headers.get('set-cookie')]).filter(Boolean);
  const html1 = await res1.text();

  // Find intermediate /files/ download page
  const fileLinkMatch = html1.match(/href=["'](https?:\/\/weadown\.com\/files\/[^"']+)["']/i);
  if (!fileLinkMatch) {
    // Check if direct link exists
    const directMatch = html1.match(/href=["'](https?:\/\/(?:zifury\.com|drive\.google\.com|mediafire\.com|mega\.nz)[^"']+)["']/i);
    if (directMatch) {
      return {
        success: true,
        downloadUrl: directMatch[1],
        title: 'Direct Product Package',
        downloadPageUrl: null
      };
    }
    throw new Error('No download page link found on article');
  }

  const fileUrl = fileLinkMatch[1];
  const cookieMap = {};
  cookies1.forEach(c => {
    const [kv] = c.split(';');
    const [k, ...v] = kv.split('=');
    if (k && v.length) cookieMap[k.trim()] = v.join('=').trim();
  });

  // 2. Visit /files/ intermediate download page
  const cookieHeader1 = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');
  const res2 = await fetch(fileUrl, {
    headers: {
      'User-Agent': userAgent,
      'Referer': sourcePostUrl,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Cookie': cookieHeader1
    },
    signal: AbortSignal.timeout(timeoutMs)
  });

  if (!res2.ok) {
    throw new Error(`File page HTTP ${res2.status}`);
  }

  const cookies2 = (res2.headers.getSetCookie ? res2.headers.getSetCookie() : [res2.headers.get('set-cookie')]).filter(Boolean);
  cookies2.forEach(c => {
    const [kv] = c.split(';');
    const [k, ...v] = kv.split('=');
    if (k && v.length) cookieMap[k.trim()] = v.join('=').trim();
  });

  const finalCookieHeader = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');
  const html2 = await res2.text();

  // Extract data-slug
  const slugMatch = html2.match(/data-slug=["']([^"']+)["']/i);
  if (!slugMatch) {
    throw new Error('data-slug not found on download page');
  }
  const slug = slugMatch[1];

  // Try extracting package filename
  let packageName = null;
  const pkgMatch = html2.match(/([a-zA-Z0-9_.-]+\.(?:zip|rar|tar\.gz|7z))/i);
  if (pkgMatch) packageName = pkgMatch[1];

  // 3. Initiate countdown via /zmk/start/
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
      slugs: slug
    }).toString(),
    signal: AbortSignal.timeout(timeoutMs)
  });

  const startData = await startRes.json();
  if (!startData.items || !startData.items[0] || !startData.items[0].token) {
    const msg = startData.message || (startData.items?.[0]?.message) || 'Start session failed';
    throw new Error(`Countdown start rejected: ${msg}`);
  }

  const token = startData.items[0].token;
  const waitSeconds = Math.max(1, Math.min(15, parseInt(startData.items[0].wait_seconds || 5, 10)));

  // Wait countdown duration
  await new Promise(r => setTimeout(r, (waitSeconds + 0.5) * 1000));

  // 4. Request final go_url via /zmk/complete/
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
    body: new URLSearchParams({ tokens: token }).toString(),
    signal: AbortSignal.timeout(timeoutMs)
  });

  const completeData = await completeRes.json();
  if (!completeData.items || !completeData.items[0] || !completeData.items[0].go_url) {
    const msg = completeData.message || (completeData.items?.[0]?.message) || 'Go URL not returned';
    throw new Error(`Countdown complete rejected: ${msg}`);
  }

  const goUrl = completeData.items[0].go_url;

  // 5. Follow redirect to target file host (e.g. Zifury)
  const goRes = await fetch(goUrl, {
    headers: {
      'User-Agent': userAgent,
      'Referer': fileUrl,
      'Cookie': finalCookieHeader
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs)
  });

  const finalDownloadUrl = goRes.url;
  const urlFilename = finalDownloadUrl.split('/').pop().split('?')[0];
  const finalPackageName = (urlFilename.includes('.zip') || urlFilename.includes('.rar')) ? urlFilename : packageName;

  return {
    success: true,
    downloadUrl: finalDownloadUrl,
    title: finalPackageName ? `${finalPackageName} (Direct Download)` : `${slug}.zip (Direct Download)`,
    packageName: finalPackageName || `${slug}.zip`,
    downloadPageUrl: fileUrl
  };
}

module.exports = {
  extractDirectDownloadLink
};
