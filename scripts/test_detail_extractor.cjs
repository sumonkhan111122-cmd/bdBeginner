const fs = require('fs');

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

async function extractDetail(url) {
  const fullUrl = url.startsWith('http') ? url : `https://www.idcardscannerpro.com${url}`;
  const res = await fetch(fullUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const text = await res.text();

  const start = text.indexOf("class='post-body");
  if (start === -1) return { description: '', features: [], images: [] };

  const postBodyStart = text.indexOf(">", start) + 1;
  const postBodyEnd = text.indexOf("<div class='post-bottom", postBodyStart);
  let html = text.slice(postBodyStart, postBodyEnd !== -1 ? postBodyEnd : postBodyStart + 30000);

  // Clean html
  let content = html.replace(/<style[\s\S]*?<\/style>/gi, '')
                    .replace(/<script[\s\S]*?<\/script>/gi, '')
                    .replace(/<!--[\s\S]*?-->/gi, '');

  // Extract images
  const images = [];
  const imgMatches = content.match(/<img[^>]+src=["']([^"']+)["']/gi) || [];
  for (const im of imgMatches) {
    const src = im.match(/src=["']([^"']+)["']/i)?.[1];
    if (src && !src.includes('dmca_protected') && !src.includes('blogger_badge') && !images.includes(src)) {
      images.push(src);
    }
  }

  // Extract list items & bullet points
  const features = [];
  const liMatches = content.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
  for (const li of liMatches) {
    const clean = decodeHtml(li.replace(/<[^>]+>/g, '').trim());
    if (clean && clean.length > 3 && clean.length < 200 && !features.includes(clean)) {
      features.push(clean);
    }
  }

  // Extract paragraphs
  const pMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const paragraphs = [];
  for (const p of pMatches) {
    const clean = decodeHtml(p.replace(/<[^>]+>/g, '').trim());
    if (clean && clean.length > 25 && !paragraphs.includes(clean)) {
      paragraphs.push(clean);
    }
  }

  // Also check divs with text or specific headings
  const headings = [];
  const hMatches = content.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi) || [];
  for (const h of hMatches) {
    const clean = decodeHtml(h.replace(/<[^>]+>/g, '').trim());
    if (clean && clean.length > 3 && !headings.includes(clean)) {
      headings.push(clean);
    }
  }

  return {
    headings,
    paragraphs,
    features,
    images
  };
}

async function test() {
  const urls = ['/p/sa.html', '/p/voter.html', '/p/idmpc.html', '/p/win.html', '/p/rem.html'];
  for (const u of urls) {
    const res = await extractDetail(u);
    console.log(`\n=================== ${u} ===================`);
    console.log('Headings:', res.headings);
    console.log('Paragraphs:', res.paragraphs.slice(0, 3));
    console.log('Features count:', res.features.length, res.features.slice(0, 4));
    console.log('Images:', res.images);
  }
}
test();
