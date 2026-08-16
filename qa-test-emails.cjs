const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let env = {};
let envLocal = {};
try { env = parseEnv(fs.readFileSync('.env', 'utf-8')); } catch (e) {}
try { envLocal = parseEnv(fs.readFileSync('.env.local', 'utf-8')); } catch (e) {}

const mergedEnv = { ...env, ...envLocal };
const url = mergedEnv.VITE_SUPABASE_URL;
const key = mergedEnv.VITE_SUPABASE_ANON_KEY ?? mergedEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(url, key);

function firstRecord(value) {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === 'object' ? first : null;
  }
  return value && typeof value === 'object' ? value : null;
}

function unwrapRpcRecord(value, functionName) {
  const record = firstRecord(value);
  if (!record) return null;
  return firstRecord(record[functionName]) ?? record;
}

async function runQaTests(email) {
  console.log(`Starting QA Email Test for ${email}...`);

  // 1. Trigger Auth OTP email
  console.log('Triggering Auth OTP Email...');
  const { error: otpError } = await supabase.auth.signInWithOtp({ email });
  if (otpError) {
    if (otpError.message.includes('56 seconds')) {
       console.log('Auth OTP Email already triggered recently.');
    } else {
       console.error('Auth OTP Error:', otpError.message);
    }
  } else {
    console.log('Auth OTP Email triggered.');
  }

  // 2. Trigger Password reset email
  // Wait to avoid rate limits
  console.log('Waiting 60 seconds before triggering Password Reset (Rate Limit)...');
  await new Promise(r => setTimeout(r, 60000));
  
  console.log('Triggering Password Reset Email...');
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
  if (resetError) console.error('Password Reset Error:', resetError.message);
  else console.log('Password Reset Email triggered.');

  // Find a product to buy
  console.log('Fetching a product...');
  const { data: products, error: productError } = await supabase.from('products').select('id').eq('status', 'published').limit(1);
  if (productError) {
    console.error('Product Fetch Error:', productError);
    process.exit(1);
  }
  if (!products || products.length === 0) {
    console.error('No products found for test order');
    process.exit(1);
  }
  const productId = products[0].id;

  // 3. Create a test order (this might also trigger Account activation if the user doesn't exist)
  console.log('Creating Test Order...');
  const { data: rawOrderData, error: orderError } = await supabase.rpc('create_checkout_order', {
    p_customer_name: 'QA Test User',
    p_customer_email: email,
    p_customer_phone: '01711111111',
    p_customer_note: 'QA Test Order - DO NOT PROCESS',
    p_items: [{ product_id: productId, quantity: 1 }],
  });

  if (orderError) {
    console.error('Create Order Error:', orderError.message);
    process.exit(1);
  }

  const orderData = unwrapRpcRecord(rawOrderData, 'create_checkout_order');
  
  if (!orderData || !orderData.order_number) {
    console.error('Could not parse order_number from response:', rawOrderData);
    process.exit(1);
  }

  const { order_number, access_token } = orderData;
  console.log(`Created Order ${order_number}.`);

  // Helper to trigger notification
  const triggerEmail = async (event_type, reason) => {
    console.log(`Triggering ${event_type}...`);
    const payload = { event_type, order_number, access_token };
    if (reason) payload.reason = reason;
    
    const { data, error } = await supabase.functions.invoke('order-notification', {
      body: payload
    });
    if (error) console.error(`${event_type} Error:`, error.message);
    else console.log(`${event_type} triggered successfully. Response:`, data);
  };

  // Wait 2 seconds to let the DB settle
  await new Promise(r => setTimeout(r, 2000));

  // Trigger emails sequentially
  await triggerEmail('order_received');
  
  // Update order status manually because some emails check the DB
  console.log('Updating order status to pending verification...');
  await supabase.from('orders').update({ payment_status: 'pending_verification' }).eq('order_number', order_number);
  await triggerEmail('manual_payment_submitted');
  
  console.log('Updating order status to paid...');
  await supabase.from('orders').update({ payment_status: 'paid' }).eq('order_number', order_number);
  await triggerEmail('payment_confirmed');

  console.log('Updating order status to failed...');
  await supabase.from('orders').update({ payment_status: 'failed' }).eq('order_number', order_number);
  await triggerEmail('payment_rejected', 'QA Test Rejection Reason Verification');

  console.log('QA Test triggers completed.');
}

const testEmail = process.argv[2];
if (!testEmail) {
  console.error('Usage: node qa-test-emails.cjs <test-email@gmail.com>');
  process.exit(1);
}

runQaTests(testEmail);
