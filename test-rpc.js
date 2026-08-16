import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching a published product...');
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, name, status, product_type, delivery_type, price')
    .eq('status', 'published')
    .limit(1);

  if (pError) {
    console.error('Error fetching product:', pError);
    return;
  }

  if (!products || products.length === 0) {
    console.error('No published products found.');
    return;
  }

  const product = products[0];
  console.log('Found product:', product);

  console.log('\nTesting create_checkout_order...');
  const { data, error } = await supabase.rpc('create_checkout_order', {
    p_customer_name: 'Test Customer',
    p_customer_email: 'test@example.com',
    p_customer_phone: null,
    p_customer_note: 'Test note',
    p_items: [
      {
        product_id: product.id,
        quantity: 1,
        currency_code: 'BDT'
      }
    ]
  });

  if (error) {
    console.error("create_checkout_order failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
  } else {
    console.log('create_checkout_order success:', data);
  }
}

main();
