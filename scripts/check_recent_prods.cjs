const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sbAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRecentProducts() {
  const { data: prods, error } = await sbAdmin
    .from('products')
    .select('id, name, slug, featured, updated_at, created_at, delivery_type, product_type')
    .order('updated_at', { ascending: false })
    .limit(10);

  console.log('Recent products:', { error, prods });
}

checkRecentProducts();
