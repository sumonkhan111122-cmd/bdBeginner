const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => l.trim().split('='))
);

const sbAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testGoStore() {
  const { data: link } = await sbAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: 'sumonkhan111122@gmail.com'
  });

  const sbClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  await sbClient.auth.verifyOtp({
    token_hash: link.properties.hashed_token,
    type: 'magiclink'
  });

  const targetId = 'fe5798f8-03c9-48eb-8579-fb148629eb6d';
  console.log('Testing GoStore:', targetId);

  // 1. Fetch product as ProductEditor does
  const { data: p, error: pErr } = await sbClient
    .from('products')
    .select('*, product_features(*), product_includes(*), product_faqs(*), product_images(*)')
    .eq('id', targetId)
    .single();

  if (pErr) {
    console.error('Fetch error:', pErr);
    return;
  }

  const { data: links } = await sbClient
    .from('product_download_links')
    .select('*')
    .eq('product_id', targetId);

  console.log('Features count:', p.product_features?.length);
  console.log('Includes count:', p.product_includes?.length);
  console.log('Faqs count:', p.product_faqs?.length);
  console.log('Images count:', p.product_images?.length);
  console.log('Download links:', links);

  // Now simulate handleSave
  // buildInput:
  const input = {
    name: p.name.trim(),
    slug: p.slug.trim(),
    sku: p.sku ? p.sku.trim() : null,
    short_description: p.short_description ? p.short_description.trim() : null,
    description: p.description ? p.description.trim() : null,
    category_id: p.category_id,
    price: Number(p.price),
    compare_at_price: p.compare_at_price !== null ? Number(p.compare_at_price) : null,
    thumbnail_url: p.thumbnail_url ? p.thumbnail_url.trim() : null,
    product_type: p.product_type,
    delivery_type: p.delivery_type,
    status: p.status,
    featured: true, // toggling to true
    new_product: p.new_product,
    version: p.version ? p.version.trim() : null,
    compatibility: p.compatibility ? p.compatibility.trim() : null,
    requirements: p.requirements ? p.requirements.trim() : null,
    support_period: p.support_period ? p.support_period.trim() : null,
    update_policy: p.update_policy ? p.update_policy.trim() : null,
    delivery_description: p.delivery_description ? p.delivery_description.trim() : null,
    seo_title: p.seo_title ? p.seo_title.trim() : null,
    seo_description: p.seo_description ? p.seo_description.trim() : null,
    sort_order: Number(p.sort_order) || 0,
  };

  try {
    console.log('Updating product table...');
    const { data: updated, error: uErr } = await sbClient
      .from('products')
      .update(input)
      .eq('id', targetId)
      .select()
      .single();

    if (uErr) {
      console.error('FAIL on products update:', uErr);
      return;
    }
    console.log('products update SUCCESS');

    // sync features
    console.log('syncing features...');
    const { error: delFeat } = await sbClient.from('product_features').delete().eq('product_id', targetId);
    if (delFeat) console.error('FAIL on features del:', delFeat);
    
    // sync includes
    console.log('syncing includes...');
    const { error: delInc } = await sbClient.from('product_includes').delete().eq('product_id', targetId);
    if (delInc) console.error('FAIL on includes del:', delInc);

    // sync faqs
    console.log('syncing faqs...');
    const { error: delFaq } = await sbClient.from('product_faqs').delete().eq('product_id', targetId);
    if (delFaq) console.error('FAIL on faqs del:', delFaq);

    // sync images
    console.log('syncing images...');
    const { error: delImg } = await sbClient.from('product_images').delete().eq('product_id', targetId);
    if (delImg) console.error('FAIL on images del:', delImg);

    // sync download links
    console.log('syncing download links...');
    for (const l of links || []) {
      const { error: dlErr } = await sbClient
        .from('product_download_links')
        .update({
          title: l.title,
          download_url: l.download_url,
          version: l.version || null,
          sort_order: l.sort_order,
          is_active: l.is_active,
        })
        .eq('id', l.id);
      if (dlErr) console.error('FAIL on link update:', dlErr);
    }
    console.log('ALL DONE!');
  } catch (err) {
    console.error('CATCH error:', err);
  }
}

testGoStore();
