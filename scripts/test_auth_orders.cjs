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
  const { data: user, error: uErr } = await sbAdmin.auth.admin.getUserById('484cd133-2f27-44f1-af69-6acdb26224c9');
  console.log('User found:', user?.user?.email);

  // Generate a magic link or token
  const { data: link, error: lErr } = await sbAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'sumonkhan111122@gmail.com'
  });
  
  if (link && link.properties) {
    // Verify token to get an authenticated session
    const sbUser = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
    const { data: sessionData, error: sErr } = await sbUser.auth.verifyOtp({
      token_hash: link.properties.hashed_token,
      type: 'magiclink'
    });
    console.log('Authenticated session obtained?', !!sessionData?.session);

    if (sessionData?.session) {
      // Test querying orders as this authenticated user
      const { data: orders, error: oErr } = await sbUser
        .from('orders')
        .select('id, order_number, user_id, customer_email, payment_status, created_at, order_items(id, product_id, product_slug)')
        .eq('payment_status', 'paid');
      console.log('Orders query as AUTHENTICATED user:', { error: oErr, count: orders?.length, data: orders });
    }
  }
}
check();
