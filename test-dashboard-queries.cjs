const fs = require('fs');
const { createClient } = require('./node_modules/@supabase/supabase-js');

const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

const mergedEnv = { ...parseEnv(fs.readFileSync('.env', 'utf-8') || ''), ...parseEnv(fs.readFileSync('.env.local', 'utf-8') || '') };
const supabase = createClient(mergedEnv.VITE_SUPABASE_URL, mergedEnv.VITE_SUPABASE_ANON_KEY ?? mergedEnv.VITE_SUPABASE_PUBLISHABLE_KEY);

async function test() {
  const [productsRes, categoriesRes, imagesRes, siteRes, seoRes] = await Promise.all([
    supabase.from('products').select('id, name, slug, status, updated_at, featured, thumbnail_url, seo_title, seo_description, short_description, delivery_description, category_id, price, product_features(id), product_faqs(id)'),
    supabase.from('categories').select('*'),
    supabase.from('product_images').select('id', { count: 'exact', head: true }),
    supabase.from('site_settings').select('*').maybeSingle(),
    supabase.from('seo_settings').select('*').maybeSingle(),
  ]);
  
  if (productsRes.error) console.error('productsRes.error', productsRes.error);
  console.log('products count', productsRes.data?.length);
  console.log('categories count', categoriesRes.data?.length);
  console.log('imagesRes', imagesRes.count);
  console.log('siteRes', !!siteRes.data);
  console.log('seoRes', !!seoRes.data);
}

test();
