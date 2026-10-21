const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

// Test with ANON KEY as a customer would in the browser
const sbAnon = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const userId = '484cd133-2f27-44f1-af69-6acdb26224c9';
  const email = 'sumonkhan111122@gmail.com';

  let query = sbAnon
    .from('orders')
    .select('id, order_number, user_id, customer_email, payment_status, created_at, order_items(id, product_id, product_slug)')
    .eq('payment_status', 'paid');

  if (userId && email) {
    query = query.or(`user_id.eq.${userId},customer_email.eq.${email}`);
  }

  const { data, error } = await query;
  console.log('Result with ANON key:', { error, data });
}
check();
