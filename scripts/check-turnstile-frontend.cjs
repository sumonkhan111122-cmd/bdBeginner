async function check() {
  const res = await fetch('https://weadown.com/files/kNZkw3cChY7put2z776GYp5k4R8LeI/');
  const html = await res.text();
  console.log('HTTP:', res.status);
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log('Scripts:', scripts.filter(s => s.includes('weadown') || s.includes('zmk') || s.includes('cloudflare')));

  // Look for inline scripts mentioning turnstile or zmk
  const inlines = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => m[1])
    .filter(s => s.includes('zmk') || s.includes('turnstile'));
  console.log('Inline scripts count:', inlines.length);
  if (inlines.length > 0) {
    console.log('Sample inline:', inlines[0].slice(0, 300));
  }
}

check().catch(console.error);

