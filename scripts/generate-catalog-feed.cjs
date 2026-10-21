const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let env = {};
let envLocal = {};
try { env = parseEnv(fs.readFileSync('.env', 'utf-8')); } catch(e) {}
try { envLocal = parseEnv(fs.readFileSync('.env.local', 'utf-8')); } catch(e) {}
const mergedEnv = { ...env, ...envLocal };

const url = mergedEnv.VITE_SUPABASE_URL || 'https://ldmpxupslnfgzmmtpyat.supabase.co';
const key = mergedEnv.SUPABASE_SERVICE_ROLE_KEY || mergedEnv.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);

function cleanText(text, maxLen = 5000) {
  if (!text) return '';
  let clean = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length > maxLen) {
    clean = clean.substring(0, maxLen - 3) + '...';
  }
  return clean;
}

function cleanPrice(val) {
  const num = parseFloat(val) || 0;
  return Math.max(0, num).toFixed(2);
}

async function generate() {
  console.log('Generating Facebook Product Catalog XML...');
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, short_description, description, thumbnail_url, categories(name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products for catalog feed:', error);
    process.exit(1);
  }

  const baseUrl = 'https://bdbeginner.com';
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>bdBeginner Products Catalog</title>
    <link>${baseUrl}</link>
    <description>bdBeginner — Premium Digital Products, Themes, Plugins &amp; Web Services</description>
`;

  for (const p of products) {
    const slug = p.slug || '';
    const link = `${baseUrl}/products/${encodeURIComponent(slug)}`;
    const image = p.thumbnail_url || `${baseUrl}/favicon.svg`;
    
    const regularPrice = p.compare_at_price ? cleanPrice(p.compare_at_price) : cleanPrice(p.price);
    const salePrice = (p.compare_at_price && parseFloat(p.price) < parseFloat(p.compare_at_price)) ? cleanPrice(p.price) : null;
    
    const desc = cleanText(p.short_description || p.description || p.name);
    const catName = (p.categories && p.categories.name) ? cleanText(p.categories.name) : 'Digital Goods';

    xml += `    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${cleanText(p.name, 150)}]]></g:title>
      <g:description><![CDATA[${desc}]]></g:description>
      <g:link>${link}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:brand>bdBeginner</g:brand>
      <g:condition>new</g:condition>
      <g:availability>in stock</g:availability>
      <g:price>${regularPrice} BDT</g:price>
${salePrice ? `      <g:sale_price>${salePrice} BDT</g:sale_price>\n` : ''}      <g:product_type><![CDATA[${catName}]]></g:product_type>
      <g:google_product_category>Software &gt; Digital Goods</g:google_product_category>
      <g:fb_product_category>software</g:fb_product_category>
    </item>\n`;
  }

  xml += `  </channel>
</rss>`;

  const outPath = path.join(__dirname, '..', 'public', 'facebook-catalog.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Generated facebook-catalog.xml successfully with ${products.length} products.`);
}

generate();
