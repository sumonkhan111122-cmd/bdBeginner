const fs = require('fs');

const html = fs.readFileSync('C:/Users/MD SUMON MIA/.gemini/antigravity-ide/brain/e5943006-e407-4c33-be17-2bde2bfc65e1/.system_generated/steps/875/content.md', 'utf8');

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function bnToEnDigits(str) {
  if (!str) return '';
  const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return str.replace(/[০-৯]/g, (d) => bn.indexOf(d));
}

const parts = html.split('<div class="product-card">');
parts.shift(); // remove everything before first card

const products = [];

for (let i = 0; i < parts.length; i++) {
  // Take up to the end of product-info or next card
  const chunk = parts[i];
  
  const imgSrcMatch = chunk.match(/<img[^>]+src=["']([^"']+)["']/i);
  const imgAltMatch = chunk.match(/<img[^>]+alt=["']([^"']+)["']/i);
  const titleMatch = chunk.match(/<h3[^>]*class=["']product-title["'][^>]*>([\s\S]*?)<\/h3>/i);
  const currentPriceMatch = chunk.match(/<span[^>]*class=["']current-price["'][^>]*>([\s\S]*?)<\/span>/i);
  const originalPriceMatch = chunk.match(/<span[^>]*class=["']original-price["'][^>]*>([\s\S]*?)<\/span>/i);
  const linkMatch = chunk.match(/<a[^>]*class=["']btn-order["'][^>]*href=["']([^"']+)["']/i);

  const rawTitle = titleMatch ? decodeHtml(titleMatch[1].trim()) : '';
  const rawCurrentPrice = currentPriceMatch ? decodeHtml(currentPriceMatch[1].trim()) : '';
  const rawOriginalPrice = originalPriceMatch ? decodeHtml(originalPriceMatch[1].trim()) : '';

  const priceDigits = bnToEnDigits(rawCurrentPrice).replace(/[^\d]/g, '');
  const origPriceDigits = bnToEnDigits(rawOriginalPrice).replace(/[^\d]/g, '');

  const price = priceDigits ? parseInt(priceDigits, 10) : 0;
  let originalPrice = origPriceDigits ? parseInt(origPriceDigits, 10) : 0;

  // If no original price or lower, calculate a higher markup price for nice discount display
  if (!originalPrice || originalPrice <= price) {
    if (price <= 200) originalPrice = price + 150;
    else if (price <= 500) originalPrice = Math.round(price * 1.5);
    else if (price <= 1000) originalPrice = Math.round(price * 1.4);
    else originalPrice = Math.round(price * 1.3);
  }

  if (rawTitle) {
    products.push({
      id: i + 1,
      name: rawTitle,
      image: imgSrcMatch ? imgSrcMatch[1] : '',
      alt: imgAltMatch ? imgAltMatch[1] : '',
      price,
      originalPrice,
      detailUrl: linkMatch ? linkMatch[1] : '',
    });
  }
}

console.log(`Successfully extracted ${products.length} products!\n`);
products.forEach(p => {
  console.log(`[#${String(p.id).padStart(2, '0')}] ৳${p.price} (was ৳${p.originalPrice}) | ${p.name.slice(0, 48)}... | ${p.detailUrl}`);
});
