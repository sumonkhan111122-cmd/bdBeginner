const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env and .env.local
const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let envLocal = {};
try { envLocal = parseEnv(fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')); } catch(e) {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || envLocal.VITE_SUPABASE_URL || 'https://ldmpxupslnfgzmmtpyat.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envLocal.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Read catalog data
const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'catalogProducts.ts'), 'utf-8');
const json = content.replace(/^import [^;]+;\s*export const allCatalogProducts: Product\[\] = /, '').replace(/;\s*$/, '');
const products = JSON.parse(json);

console.log(`Loaded ${products.length} products to sync to Supabase...`);

const CATEGORIES = {
  'WordPress': 'c7e89885-df81-4d5e-8353-70990cc57041',
  'Software': '4c9fd83b-2ead-488b-8652-4eff6b87c212',
  'AI Tools': '46e77cdb-bc84-4658-b6f1-3af0b9833a6d',
  'Courses': '9658a4a6-c141-433a-8e0a-964a081b3455',
  'Digital Resources': 'd7ac2ba6-4368-4adf-b314-d7e6b4c14956',
  'Web Services': 'dd5fe544-7b50-46d0-8d9b-4ed4588f6c8f'
};

async function sync() {
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const categoryId = CATEGORIES[p.category] || CATEGORIES['Digital Resources'];
    const sku = `BDB-${p.category.slice(0, 2).toUpperCase()}-${p.slug.slice(0, 10).toUpperCase()}-${i + 1}`;

    process.stdout.write(`[${i + 1}/${products.length}] Syncing "${p.name.slice(0, 35)}"... `);

    // 1. Upsert Product
    const { error: prodErr } = await supabase.from('products').upsert({
      id: p.id,
      category_id: categoryId,
      name: p.name,
      slug: p.slug,
      sku: sku,
      short_description: p.shortDescription,
      description: p.description,
      price: p.price,
      compare_at_price: p.compareAtPrice || null,
      thumbnail_url: p.thumbnail,
      product_type: 'digital_download',
      delivery_type: 'digital_download',
      status: 'published',
      featured: !!p.featured,
      new_product: !!p.newProduct,
      version: p.version || 'Latest',
      compatibility: p.compatibility || 'WordPress 6.0+, PHP 8.0+',
      requirements: p.requirements || 'Standard hosting requirements',
      support_period: p.supportPeriod || 'Lifetime updates & documentation',
      update_policy: p.updatePolicy || 'Future updates included',
      delivery_description: p.deliveryDescription || 'Instant demo access. Verified link provided in dashboard.',
      seo_title: p.seoTitle || `${p.name} | bdBeginner`,
      seo_description: p.seoDescription || p.shortDescription,
      sort_order: i + 1,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (prodErr) {
      console.log(`FAILED prod: ${prodErr.message}`);
      errorCount++;
      continue;
    }

    // 2. Sync Images (3 to 4 images per product)
    await supabase.from('product_images').delete().eq('product_id', p.id);
    if (p.images && p.images.length > 0) {
      const imgRows = p.images.map((img, idx) => ({
        product_id: p.id,
        image_url: img.url,
        alt_text: img.alt || `${p.name} image ${idx + 1}`,
        sort_order: idx
      }));
      const { error: imgErr } = await supabase.from('product_images').insert(imgRows);
      if (imgErr) console.warn(`   (Warning images: ${imgErr.message})`);
    }

    // 3. Sync Features
    await supabase.from('product_features').delete().eq('product_id', p.id);
    if (p.features && p.features.length > 0) {
      const featRows = p.features.map((feat, idx) => ({
        product_id: p.id,
        feature: feat,
        sort_order: idx + 1
      }));
      const { error: featErr } = await supabase.from('product_features').insert(featRows);
      if (featErr) console.warn(`   (Warning features: ${featErr.message})`);
    }

    // 4. Sync FAQs
    await supabase.from('product_faqs').delete().eq('product_id', p.id);
    if (p.faq && p.faq.length > 0) {
      const faqRows = p.faq.map((item, idx) => ({
        product_id: p.id,
        question: item.question,
        answer: item.answer,
        sort_order: idx + 1
      }));
      const { error: faqErr } = await supabase.from('product_faqs').insert(faqRows);
      if (faqErr) console.warn(`   (Warning faqs: ${faqErr.message})`);
    }

    console.log(`DONE (${p.images?.length || 0} images, ${p.features?.length || 0} features)`);
    successCount++;
  }

  console.log(`\n========================================`);
  console.log(`Sync Finished: ${successCount} successful, ${errorCount} errors.`);
  console.log(`========================================`);
}

sync().catch(console.error);
