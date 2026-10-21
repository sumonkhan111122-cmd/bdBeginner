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
  const { data, error } = await sbAdmin.rpc('exec_sql', {
    sql: "SELECT pg_get_functiondef(oid) FROM pg_proc WHERE proname = 'create_checkout_order_priced';"
  });
  if (data) {
    console.log(data);
  } else {
    // try finding order 44 vs 46 user_id
    const { data: o44 } = await sbAdmin.from('orders').select('order_number, user_id, customer_email').eq('order_number', 'BDB-20261020-000044').single();
    const { data: o46 } = await sbAdmin.from('orders').select('order_number, user_id, customer_email').eq('order_number', 'BDB-20261020-000046').single();
    console.log('Order 44:', o44);
    console.log('Order 46:', o46);
  }
}
check();
