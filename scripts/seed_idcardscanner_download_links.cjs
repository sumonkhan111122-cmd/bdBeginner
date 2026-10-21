const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const { scrapeStoreProducts } = require('./idcardscannerService.cjs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log('Seeding download links for ID Card Scanner Pro products...');
  const scraped = await scrapeStoreProducts();
  const slugMap = new Map();
  scraped.forEach(p => slugMap.set(p.slug, p));

  const { data: idcProducts, error: pErr } = await sb
    .from('products')
    .select('id, name, slug')
    .ilike('sku', 'IDC%');

  if (pErr) throw pErr;
  console.log(`Found ${idcProducts.length} IDC products in database.`);

  let insertedCount = 0;
  for (const prod of idcProducts) {
    // Check if download link already exists
    const { data: existingLinks } = await sb
      .from('product_download_links')
      .select('id')
      .eq('product_id', prod.id);

    if (!existingLinks || existingLinks.length === 0) {
      const scrapedItem = slugMap.get(prod.slug);
      const targetUrl = scrapedItem?.detailUrl || `https://www.idcardscannerpro.com/p/${prod.slug.replace(/-pro$/, '')}.html`;
      
      const { error: insErr } = await sb
        .from('product_download_links')
        .insert({
          product_id: prod.id,
          title: `${prod.name} (Official Instant Access)`,
          download_url: targetUrl,
          version: '1.0',
          sort_order: 0,
          is_active: true
        });

      if (insErr) {
        console.error(`Failed to insert link for ${prod.name}:`, insErr.message);
      } else {
        insertedCount++;
        console.log(`✓ Inserted access link for: ${prod.name} -> ${targetUrl}`);
      }
    }
  }

  console.log(`\nSuccessfully added download links for ${insertedCount} products!`);
}

seed().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});
