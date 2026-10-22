const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sbAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Check if AIMOTION50 exists
  const { data: existing } = await sbAdmin
    .from('coupons')
    .select('*')
    .eq('code', 'AIMOTION50')
    .maybeSingle();

  if (existing) {
    console.log('AIMOTION50 already exists:', existing);
  } else {
    const { data, error } = await sbAdmin
      .from('coupons')
      .insert({
        code: 'AIMOTION50',
        name: 'AI মোশন স্পেশাল অফার (৳৫০ ছাড়)',
        description: 'AI মোশন গ্রাফিক্স মাস্টারক্লাস ৫০ টাকা এক্সক্লুসিভ ডিসকাউন্ট',
        discount_type: 'fixed',
        discount_value: 50,
        minimum_subtotal: 200,
        scope: 'all',
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AIMOTION50:', error);
    } else {
      console.log('Created AIMOTION50 coupon successfully:', data);
    }
  }

  // Now test calculate_checkout_pricing with AIMOTION50!
  const { data: pricing, error: pErr } = await sbAdmin.rpc('calculate_checkout_pricing', {
    p_items: [{ product_id: 'c0000001-0000-4000-8000-000000000001', quantity: 1 }],
    p_coupon_code: 'AIMOTION50',
    p_customer_email: null
  });

  console.log('calculate_checkout_pricing with AIMOTION50:', pricing, 'error:', pErr);
}

run();
