const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sbAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testExactUpdate() {
  const { data: link } = await sbAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'sumonkhan111122@gmail.com'
  });

  const sbClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  await sbClient.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: 'magiclink'
  });

  // Get a few products to test
  const { data: prods } = await sbClient.from('products').select('*').limit(5);
  for (const prod of prods) {
    console.log(`\n--- Testing product: ${prod.id} (${prod.name}) ---`);
    const input = {
      name: prod.name,
      slug: prod.slug,
      sku: prod.sku,
      short_description: prod.short_description,
      description: prod.description,
      category_id: prod.category_id,
      price: Number(prod.price),
      compare_at_price: prod.compare_at_price,
      thumbnail_url: prod.thumbnail_url,
      product_type: prod.product_type,
      delivery_type: prod.delivery_type,
      status: prod.status,
      featured: !prod.featured, // toggling featured
      new_product: prod.new_product,
      version: prod.version,
      compatibility: prod.compatibility,
      requirements: prod.requirements,
      support_period: prod.support_period,
      update_policy: prod.update_policy,
      delivery_description: prod.delivery_description,
      seo_title: prod.seo_title,
      seo_description: prod.seo_description,
      sort_order: prod.sort_order || 0,
    };

    const { data: updated, error } = await sbClient
      .from('products')
      .update(input)
      .eq('id', prod.id)
      .select()
      .single();

    if (error) {
      console.error(`ERROR updating product ${prod.id}:`, error);
    } else {
      console.log(`SUCCESS updating product ${prod.id}: featured is now ${updated.featured}`);
    }
  }
}

testExactUpdate();
