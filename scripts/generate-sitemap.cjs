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

const BASE_URL = 'https://bdbeginner.com';

function formatDate(dateStr) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    return new Date(dateStr).toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateSitemap() {
  console.log('Fetching products and categories for Sitemap generation...');
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch products
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, slug, updated_at, created_at, thumbnail_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (prodErr) {
    console.error('Error fetching products:', prodErr);
    process.exit(1);
  }

  // 2. Fetch categories
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (catErr) {
    console.warn('Warning fetching categories:', catErr);
  }

  console.log(`Fetched ${products.length} published products and ${(categories || []).length} categories.`);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Core Storefront & Landing Pages -->
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${BASE_URL}/products</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${BASE_URL}/categories</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${BASE_URL}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/support</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${BASE_URL}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/privacy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/refund-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${BASE_URL}/delivery-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`;

  // 3. Category archive pages
  if (categories && categories.length > 0) {
    xml += `\n  <!-- Product Category Archives -->\n`;
    for (const cat of categories) {
      if (!cat.slug) continue;
      xml += `  <url>
    <loc>${BASE_URL}/products?category=${encodeURIComponent(cat.slug)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    }
  }

  // 4. Products detail pages with Google Image extensions
  xml += `\n  <!-- Published Products & Tools (${products.length} items) -->\n`;
  for (const p of products) {
    if (!p.slug) continue;
    const loc = `${BASE_URL}/products/${encodeURIComponent(p.slug)}`;
    const lastmod = formatDate(p.updated_at || p.created_at);
    const image = p.thumbnail_url;

    xml += `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

    if (image && image.startsWith('http')) {
      xml += `
    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
      <image:title><![CDATA[${p.name || ''}]]></image:title>
    </image:image>`;
    }

    xml += `
  </url>\n`;
  }

  xml += `</urlset>\n`;

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf8');
  console.log(`Successfully generated public/sitemap.xml with ${12 + (categories?.length || 0) + products.length} URLs!`);
}

generateSitemap();
