const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sbAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDistinctTypes() {
  const { data: prods } = await sbAdmin.from('products').select('delivery_type, product_type');
  const dTypes = new Set(prods.map(p => p.delivery_type));
  const pTypes = new Set(prods.map(p => p.product_type));
  console.log('Distinct delivery_type in DB:', Array.from(dTypes));
  console.log('Distinct product_type in DB:', Array.from(pTypes));
}

checkDistinctTypes();
