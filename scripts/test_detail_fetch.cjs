const fs = require('fs');

async function check(url) {
  const res = await fetch(url);
  const t = await res.text();
  const start = t.indexOf("class='post-body");
  if (start === -1) return;
  const postBodyStart = t.indexOf(">", start) + 1;
  const postBodyEnd = t.indexOf("<div class='post-bottom", postBodyStart);
  let html = t.slice(postBodyStart, postBodyEnd !== -1 ? postBodyEnd : postBodyStart + 15000);
  
  // Strip style and script
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '')
             .replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<!--[\s\S]*?-->/gi, '');
  
  // Extract headings
  const headings = (html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi) || [])
    .map(h => h.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  // Extract list items or feature points
  const items = (html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [])
    .map(li => li.replace(/<[^>]+>/g, '').trim())
    .filter(Boolean);

  // Extract paragraphs
  const paras = (html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [])
    .map(p => p.replace(/<[^>]+>/g, '').trim())
    .filter(p => p.length > 20);

  // Extract images
  const imgs = (html.match(/<img[^>]+src=["']([^"']+)["']/gi) || [])
    .map(img => {
      const m = img.match(/src=["']([^"']+)["']/i);
      return m ? m[1] : '';
    })
    .filter(Boolean);

  console.log('===', url);
  console.log('Headings:', headings.slice(0, 3));
  console.log('Paras:', paras.slice(0, 2));
  console.log('Items:', items.slice(0, 4));
  console.log('Images:', imgs.slice(0, 3));
}

async function run() {
  await check('https://www.idcardscannerpro.com/p/voter.html');
  await check('https://www.idcardscannerpro.com/p/idmpc.html');
}
run();
