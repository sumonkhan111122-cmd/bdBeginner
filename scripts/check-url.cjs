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

const parts = html.split('<div class="product-card">');
parts.shift();

const items = [];
for (let i = 0; i < parts.length; i++) {
  const chunk = parts[i];
  const titleMatch = chunk.match(/<h3[^>]*class=["']product-title["'][^>]*>([\s\S]*?)<\/h3>/i);
  const linkMatch = chunk.match(/<a[^>]*class=["']btn-order["'][^>]*href=["']([^"']+)["']/i);
  const title = titleMatch ? decodeHtml(titleMatch[1].trim()) : '';
  const url = linkMatch ? linkMatch[1].trim() : '';
  items.push({ i: i + 1, title, url });
}

console.log('Total items:', items.length);
items.forEach(it => {
  console.log(`${it.i}: [${it.title.slice(0, 30)}] -> ${it.url}`);
});
