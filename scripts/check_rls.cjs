const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sb = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  // Query information schema or pg_catalog via an RPC or query directly
  const { data, error } = await sb
    .rpc('get_order_receipt', { p_order_number: 'BDB-20261020-000044', p_access_token: '00000000-0000-0000-0000-000000000000' });
  console.log('get_order_receipt test:', { error, data });
}
check();
