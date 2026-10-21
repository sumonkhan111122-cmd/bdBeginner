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
  const { data: link } = await sbAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'sumonkhan111122@gmail.com'
  });
  
  const sbUser = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const { data: sessionData } = await sbUser.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: 'magiclink'
  });

  const user = sessionData.session.user;
  const product = {
    id: '636d51bf-1081-42bf-9181-5402fa8fc091',
    name: 'ভিসা প্রসেসিং ও এয়ার টিকিট বুকিং মাস্টার কোর্স'
  };

  try {
    // 1. checkUserMembership
    let query = sbUser
      .from('orders')
      .select('id, order_number, user_id, customer_email, payment_status, created_at, order_items(id, product_id, product_slug)')
      .eq('payment_status', 'paid');
    query = query.or(`user_id.eq.${user.id},customer_email.eq.${user.email}`);
    const { data: orders } = await query;
    console.log('1. User is VIP? Orders found:', orders?.length);

    // 2. create_checkout_order_priced
    const { data: orderData } = await sbUser.rpc('create_checkout_order_priced', {
      p_customer_name: 'VIP Member',
      p_customer_email: user.email,
      p_customer_phone: '01700000000',
      p_customer_note: `VIP Membership Claim: ${product.name}`,
      p_items: [{ product_id: product.id, quantity: 1 }],
      p_coupon_code: 'VIP_PASS_FREE',
    });
    const orderResult = Array.isArray(orderData) ? orderData[0] : orderData;
    console.log('2. Order created:', orderResult?.order_number);

    // 3. listOrderDownloadsGuest
    const { data: dlData } = await sbUser.functions.invoke('external-downloads', {
      body: { action: 'list', orderNumber: orderResult.order_number, accessToken: orderResult.access_token }
    });
    console.log('3. external-downloads list:', dlData);

    const links = dlData?.links || [];
    if (links.length > 0) {
      const firstLink = links[0];
      
      // Get receipt using RPC instead of direct order_items select
      const { data: receipt } = await sbUser.rpc('get_order_receipt', {
        p_order_number: orderResult.order_number,
        p_access_token: orderResult.access_token
      });

      const matchedItem = receipt.items?.find((i) => i.product_id === product.id) || receipt.items?.[0];
      const orderItemId = matchedItem?.id;
      console.log('4. orderItemId from receipt:', orderItemId);

      const { data: openData, error: openErr } = await sbUser.functions.invoke('external-downloads', {
        body: {
          action: 'open',
          orderNumber: orderResult.order_number,
          accessToken: orderResult.access_token,
          orderItemId,
          linkId: firstLink.id
        }
      });
      console.log('5. open link result:', { error: openErr, openData });
    }
  } catch (e) {
    console.error('Fatal in test:', e);
  }
}
run();
