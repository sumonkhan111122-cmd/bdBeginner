const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let env = {};
let envLocal = {};
try { env = parseEnv(fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')); } catch(e) {}
try { envLocal = parseEnv(fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')); } catch(e) {}

const mergedEnv = { ...env, ...envLocal };
const url = mergedEnv.VITE_SUPABASE_URL;
const serviceKey = mergedEnv.SUPABASE_SERVICE_ROLE_KEY || mergedEnv.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing Supabase service role credentials');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  console.log('--- Fetching categories ---');
  const { data: cats, error: catErr } = await supabase.from('categories').select('*');
  if (catErr) {
    console.error('Error fetching categories:', catErr);
    return;
  }

  const freeSlugs = ['wordpress', 'plugins', 'scripts', 'gpl-research-imports'];
  const targetCategoryIds = cats
    .filter(c => freeSlugs.includes(c.slug))
    .map(c => c.id);

  console.log('Target category slugs:', freeSlugs);
  console.log('Target category IDs:', targetCategoryIds);

  console.log('--- Fetching products in target categories ---');
  const { data: prods, error: prodErr } = await supabase
    .from('products')
    .select('id, name, slug, price, compare_at_price, category_id, categories(slug)')
    .in('category_id', targetCategoryIds);

  if (prodErr) {
    console.error('Error fetching products:', prodErr);
    return;
  }

  console.log(`Found ${prods.length} products to make FREE.`);

  // Update in batches of 50
  const batchSize = 50;
  let updatedCount = 0;

  for (let i = 0; i < prods.length; i += batchSize) {
    const batch = prods.slice(i, i + batchSize);
    for (const prod of batch) {
      const oldPrice = prod.price || 99;
      const comparePrice = prod.compare_at_price && prod.compare_at_price > oldPrice
        ? prod.compare_at_price
        : (oldPrice > 0 ? oldPrice : 499);

      const { error: updErr } = await supabase
        .from('products')
        .update({
          price: 0,
          compare_at_price: comparePrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', prod.id);

      if (updErr) {
        console.error(`Failed to update ${prod.slug}:`, updErr);
      } else {
        updatedCount++;
      }
    }
    console.log(`Updated ${updatedCount} / ${prods.length} products to 0 BDT...`);
  }

  console.log(`\nSUCCESS! Total ${updatedCount} products updated to 0 BDT (100% FREE).`);
}

run();
