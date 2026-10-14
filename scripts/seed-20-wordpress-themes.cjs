const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env and .env.local
const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let env = {};
let envLocal = {};
try { env = parseEnv(fs.readFileSync('.env', 'utf-8')); } catch(e) {}
try { envLocal = parseEnv(fs.readFileSync('.env.local', 'utf-8')); } catch(e) {}

const mergedEnv = { ...env, ...envLocal, ...process.env };

const SUPABASE_URL = mergedEnv.VITE_SUPABASE_URL || 'https://ldmpxupslnfgzmmtpyat.supabase.co';
const SERVICE_KEY = mergedEnv.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = mergedEnv.VITE_SUPABASE_ANON_KEY || mergedEnv.VITE_SUPABASE_PUBLISHABLE_KEY;

const WP_CATEGORY_ID = 'c7e89885-df81-4d5e-8353-70990cc57041'; // WordPress category

const uuids = [
  'c198a150-6322-42d6-a44d-d826c5aabc6a',
  'b305dc15-8999-4473-9e14-2a880bb89426',
  '2a054432-b89f-4398-bc60-34910b00443b',
  'beeaa408-d450-4184-9a25-4dd544b7b0a4',
  'fae32b9b-ec25-4712-974a-0e36e0deff45',
  'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd',
  'ea956669-cae8-4b29-af71-5ea1c7eb0ac0',
  'b83b399b-94a4-47d6-9687-a4e28d19d291',
  'b51bed97-799d-43bc-9c15-b6dcc7fb2d21',
  '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6',
  'fb87dcf3-a559-47f2-896e-cd39fef73a3b',
  '7a0f93d5-966d-409c-baca-699af8571514',
  'a5a9f55e-970d-4474-8324-40c01b47b6a5',
  'd994ef6e-cdaf-4ef5-a98f-05140cc9b894',
  'dc80ae85-5ef3-49ad-b803-34ec59dc3014',
  'e88a22ee-313e-4ecf-8112-d3f783aa45ae',
  '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b',
  '4ebcc049-02cc-47fc-8b07-0ab3340ffff5',
  '16ed112a-289f-4d86-a1f1-29f68ce3e996',
  '72f8bff7-0af4-4390-94c1-6d193e397ade',
  '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e',
  'd3c23ede-9163-4d57-827c-6a07068fdc6d',
  '0a25d164-3bb4-4567-95a4-2ca231c6f173',
  'fce98fd7-d839-4229-8a0c-c8a3ba7408ad'
];

const rawItems = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-weadown-themes.json'), 'utf-8'));
const prices = [490, 450, 590, 550, 390, 490, 450, 590, 390, 490, 550, 450, 490, 590, 450, 390, 490, 550, 450, 390, 590, 490, 550, 450];
const comparePrices = [2490, 1990, 2990, 2750, 1800, 2500, 2200, 2900, 1750, 2400, 2800, 2300, 2500, 3100, 2100, 1650, 2400, 2850, 2200, 1850, 2990, 2500, 2800, 2250];

const themes = rawItems.map((item, idx) => ({
  id: uuids[idx],
  name: item.name,
  slug: item.slug,
  sku: `WP-THM-${item.slug.slice(0, 15).toUpperCase()}`,
  price: prices[idx % prices.length],
  compare_at_price: comparePrices[idx % comparePrices.length],
  version: item.version,
  thumbnail_url: item.imageUrl,
  short_description: item.shortDescription,
  description: item.description,
  features: [
    'Genuine, clean & 100% GPL licensed WordPress theme',
    'Modern, mobile-responsive layout for all devices',
    'Elementor and WordPress block editor (Gutenberg) ready',
    'Built-in performance and search engine optimization (SEO)',
    'Pre-built demo layouts and templates ready for 1-click import'
  ],
  faqs: [
    { question: 'Is this theme authentic and clean?', answer: 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).' },
    { question: 'How do I download the theme files?', answer: 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.' }
  ]
}));

async function seed(adminAuth) {
  let client;
  
  if (SERVICE_KEY) {
    console.log('Using SUPABASE_SERVICE_ROLE_KEY to connect...');
    client = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } else if (adminAuth && adminAuth.email && adminAuth.password) {
    console.log(`Signing in as admin (${adminAuth.email})...`);
    client = createClient(SUPABASE_URL, ANON_KEY);
    const { data: sessionData, error: authErr } = await client.auth.signInWithPassword({
      email: adminAuth.email,
      password: adminAuth.password
    });
    if (authErr) {
      console.error('Admin sign-in failed:', authErr.message);
      process.exit(1);
    }
    console.log('Admin signed in successfully! User ID:', sessionData.user.id);
  } else {
    console.log('Using standard Supabase connection...');
    client = createClient(SUPABASE_URL, ANON_KEY);
  }

  console.log(`Starting to insert ${themes.length} real WordPress themes into database...`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < themes.length; i++) {
    const item = themes[i];
    console.log(`[${i + 1}/${themes.length}] Processing "${item.name}" (${item.slug})...`);

    // Check if product already exists
    const { data: existing, error: checkError } = await client
      .from('products')
      .select('id, name')
      .eq('slug', item.slug)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking existing product "${item.name}":`, checkError.message);
      continue;
    }

    if (existing) {
      console.log(`  -> Already exists with ID ${existing.id}. Skipping.`);
      skippedCount++;
      continue;
    }

    // Prepare insert payload
    const payload = {
      id: item.id,
      category_id: WP_CATEGORY_ID,
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      price: item.price,
      compare_at_price: item.compare_at_price,
      short_description: item.short_description,
      description: item.description,
      thumbnail_url: item.thumbnail_url,
      product_type: 'digital_download',
      delivery_type: 'digital_download',
      status: 'published',
      featured: i < 8, // Mark first 8 as featured for homepage
      new_product: true,
      version: item.version,
      compatibility: 'WordPress 6.0+, WooCommerce 9.0+, Elementor, Gutenberg',
      requirements: 'WordPress 6.0 or higher, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
      support_period: 'Lifetime updates and community documentation',
      update_policy: 'Future theme version updates are included',
      delivery_description: 'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
      seo_title: `${item.name} Download | bdBeginner`,
      seo_description: `Get ${item.name} at an affordable price from bdBeginner. 100% clean, verified, and secure WordPress theme.`,
      sort_order: i + 10,
      published_at: new Date().toISOString()
    };

    const { data: newProd, error: insertError } = await client
      .from('products')
      .insert(payload)
      .select()
      .single();

    if (insertError) {
      console.error(`  -> Failed to insert "${item.name}":`, insertError.message);
      if (insertError.code === '42501') {
        console.error('\n*** PERMISSION DENIED ***');
        console.error('Supabase RLS requires an admin user or SUPABASE_SERVICE_ROLE_KEY.');
        console.error('Please run with: node scripts/seed-20-wordpress-themes.cjs <adminEmail> <adminPassword>');
        console.error('Or set SUPABASE_SERVICE_ROLE_KEY=<key> in .env.local');
        return;
      }
      continue;
    }

    console.log(`  -> Created product ID: ${newProd.id}`);
    insertedCount++;

    // Insert image in product_images
    if (item.thumbnail_url) {
      await client.from('product_images').insert({
        product_id: newProd.id,
        image_url: item.thumbnail_url,
        alt_text: item.name,
        sort_order: 1
      });
    }

    // Insert features
    if (item.features && item.features.length > 0) {
      const featureRows = item.features.map((feat, idx) => ({
        product_id: newProd.id,
        feature: feat,
        sort_order: idx + 1
      }));
      await client.from('product_features').insert(featureRows);
    }

    // Insert FAQs
    if (item.faqs && item.faqs.length > 0) {
      const faqRows = item.faqs.map((faq, idx) => ({
        product_id: newProd.id,
        question: faq.question,
        answer: faq.answer,
        sort_order: idx + 1
      }));
      await client.from('product_faqs').insert(faqRows);
    }

    // Insert What's included
    const includesRows = [
      { product_id: newProd.id, item: `${item.name} Installable Package`, sort_order: 1 },
      { product_id: newProd.id, item: 'Demo Download Entitlement (Test Verification)', sort_order: 2 },
      { product_id: newProd.id, item: 'Complete Setup & Installation Guide', sort_order: 3 },
      { product_id: newProd.id, item: 'Lifetime Future Updates Access', sort_order: 4 }
    ];
    await client.from('product_includes').insert(includesRows);
  }

  console.log(`\n========================================`);
  console.log(`FINISHED!`);
  console.log(`Successfully inserted: ${insertedCount} real themes`);
  console.log(`Skipped (already exists): ${skippedCount}`);
  console.log(`========================================\n`);
}

const args = process.argv.slice(2);
const adminAuth = (args[0] && args[1]) ? { email: args[0], password: args[1] } : null;

seed(adminAuth);
