const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sbAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Check tables privileges for authenticated role
  const { data: privs, error: errPrivs } = await sbAdmin.rpc('get_order_receipt', {
    p_order_number: 'BDB-20261020-000044',
    p_access_token: '00000000-0000-0000-0000-000000000000'
  });
  
  // Find order_items for order d382eaef-d288-4287-9761-6af78f68d06f
  const { data: oi, error: oiErr } = await sbAdmin
    .from('order_items')
    .select('id, order_id, product_id')
    .eq('order_id', 'd382eaef-d288-4287-9761-6af78f68d06f');
  console.log('order_items via service role:', oi);
}
check();
