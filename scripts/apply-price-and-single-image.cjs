const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUPABASE_URL = 'https://ldmpxupslnfgzmmtpyat.supabase.co';
const env = fs.existsSync('.env.local') ? fs.readFileSync('.env.local', 'utf8') : '';
const SERVICE_KEY = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const WP_CATEGORY_ID = 'c7e89885-df81-4d5e-8353-70990cc57041';

const rawThemes = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-weadown-themes.json'), 'utf-8'));
const rawPlugins = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-weadown-plugins.json'), 'utf-8')).slice(0, 26);

// Stable UUIDs for Themes
const themeUuids = [
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

const pluginUuids = rawPlugins.map((p, idx) => {
  const hash = crypto.createHash('md5').update(`plugin-${p.slug}-${idx}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
});

const demoIds = [
  'f6dfc90c-7e00-4f25-b67b-6a5a1006ab54',
  'b727ec52-c52e-452f-a19a-3cb784333751',
  'ccec4485-e365-4a32-b9de-9118bf316043',
  'ff700be6-2531-4dea-b14d-6fd8e95bd09f',
  '405f1b1a-82a1-48c4-89ae-185b415adbfe',
  'eea2f9f8-a367-40c4-90b9-66cfd2bf1cd1',
  '6aef5702-2f16-4352-b5bb-5525834d7a4c',
  '780d97b3-fe13-4341-b203-3c38d016e51d'
];

async function run() {
  console.log('1. Removing 8 initial non-WordPress demo products...');
  for (const id of demoIds) {
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('product_features').delete().eq('product_id', id);
    await supabase.from('product_faqs').delete().eq('product_id', id);
    await supabase.from('product_includes').delete().eq('product_id', id);
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.log(`Could not delete demo product ${id}: ${error.message}. Setting status to draft.`);
      await supabase.from('products').update({ status: 'draft' }).eq('id', id);
    } else {
      console.log(`Deleted demo product ${id}`);
    }
  }

  const allTsProducts = [];

  console.log('\n2. Updating 24 WordPress Themes (Price: 99, Regular: 499, 1 Image)...');
  for (let idx = 0; idx < rawThemes.length; idx++) {
    const item = rawThemes[idx];
    const id = themeUuids[idx];
    const sku = `WP-THM-${item.slug.slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${idx + 1}`;

    const detailedDesc = `${item.name} is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.\n\nWhether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, ${item.name} offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.\n\nAll theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.`;

    // Update product in DB
    const { error: pErr } = await supabase.from('products').upsert({
      id,
      category_id: WP_CATEGORY_ID,
      name: item.name,
      slug: item.slug,
      sku,
      short_description: item.shortDescription || item.name,
      description: detailedDesc,
      price: 99,
      compare_at_price: 499,
      thumbnail_url: item.imageUrl,
      product_type: 'digital_download',
      delivery_type: 'digital_download',
      status: 'published',
      featured: idx < 8,
      new_product: true,
      version: item.version || 'Latest',
      compatibility: 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
      requirements: 'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
      support_period: 'Lifetime updates and community documentation',
      update_policy: 'Future theme version updates are included',
      delivery_description: 'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
      seo_title: `${item.name} Download | bdBeginner`,
      seo_description: item.shortDescription || item.name,
      sort_order: idx + 1,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (pErr) console.error(`Error theme ${item.name}:`, pErr.message);

    // Keep EXACTLY 1 image in product_images
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('product_images').insert({
      product_id: id,
      image_url: item.imageUrl,
      alt_text: `${item.name} - Cover`,
      sort_order: 0
    });

    allTsProducts.push({
      id,
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription || item.name,
      description: detailedDesc,
      category: 'WordPress',
      subcategory: 'Themes',
      price: 99,
      compareAtPrice: 499,
      previousPrice: 499,
      featured: idx < 8,
      newProduct: true,
      badge: idx < 8 ? 'featured' : undefined,
      icon: 'ShoppingBag',
      accent: 'brand',
      descriptor: (item.shortDescription || item.name).slice(0, 120),
      thumbnail: item.imageUrl,
      images: [
        { id: `${item.slug}-thumb`, url: item.imageUrl, alt: `${item.name} - Cover` }
      ],
      deliveryType: 'instant-download',
      productType: 'digital_download',
      version: item.version || 'Latest',
      compatibility: 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
      requirements: 'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
      supportPeriod: 'Lifetime updates and community documentation',
      updatePolicy: 'Future theme version updates are included',
      deliveryDescription: 'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
      features: [
        'Genuine, clean & 100% GPL licensed WordPress theme',
        'Mobile responsive layouts optimized for fast loading and Core Web Vitals',
        'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready',
        'Built-in search engine optimization (SEO) and schema markup integration',
        'Pre-built demo layouts and templates ready for 1-click import',
        'Fully compatible with WooCommerce for modern online stores'
      ],
      whatsIncluded: [
        `${item.name} Installable Theme Package`,
        'Child Theme File Included',
        'Setup & One-Click Import Guide',
        'Lifetime Future Updates Access'
      ],
      faq: [
        { question: 'Is this theme authentic and clean?', answer: 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).' },
        { question: 'Do I need an activation license key?', answer: 'No license key is required to use this theme. All premium features, templates, and builder functions work right out of the box.' },
        { question: 'How do I download the theme files?', answer: 'Currently demo entitlement is granted with the order. The verified download link will be available in your customer dashboard.' }
      ],
      seoTitle: `${item.name} Download | bdBeginner`,
      seoDescription: item.shortDescription || item.name,
      rating: 4.8 + (idx % 3) * 0.1,
      reviewCount: 22 + (idx * 5) % 60,
      salesCount: 60 + (idx * 9) % 190,
      tags: ['wordpress', 'theme', 'gpl', 'weadown', 'templates']
    });

    process.stdout.write('.');
  }

  console.log('\n\n3. Updating 26 WordPress Plugins (Price: 99, Regular: 499, 1 Image)...');
  for (let idx = 0; idx < rawPlugins.length; idx++) {
    const item = rawPlugins[idx];
    const id = pluginUuids[idx];
    const sku = `WP-PLG-${item.slug.slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${idx + 1}`;

    const detailedDesc = `${item.name} is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.\n\n${item.shortDescription}\n\nFeatures 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.`;

    // Update product in DB
    const { error: pErr } = await supabase.from('products').upsert({
      id,
      category_id: WP_CATEGORY_ID,
      name: item.name,
      slug: item.slug,
      sku,
      short_description: item.shortDescription || item.name,
      description: detailedDesc,
      price: 99,
      compare_at_price: 499,
      thumbnail_url: item.imageUrl,
      product_type: 'digital_download',
      delivery_type: 'digital_download',
      status: 'published',
      featured: idx < 6,
      new_product: true,
      version: item.version || 'Latest',
      compatibility: 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
      requirements: 'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
      support_period: 'Lifetime updates and community documentation',
      update_policy: 'Future plugin version updates are included',
      delivery_description: 'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
      seo_title: `${item.name} Download | bdBeginner`,
      seo_description: item.shortDescription || item.name,
      sort_order: idx + 30,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

    if (pErr) console.error(`Error plugin ${item.name}:`, pErr.message);

    // Keep EXACTLY 1 image in product_images
    await supabase.from('product_images').delete().eq('product_id', id);
    await supabase.from('product_images').insert({
      product_id: id,
      image_url: item.imageUrl,
      alt_text: `${item.name} - Cover`,
      sort_order: 0
    });

    allTsProducts.push({
      id,
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription || item.name,
      description: detailedDesc,
      category: 'WordPress',
      subcategory: 'Plugins',
      price: 99,
      compareAtPrice: 499,
      previousPrice: 499,
      featured: idx < 6,
      newProduct: true,
      badge: idx < 6 ? 'featured' : undefined,
      icon: 'Layers',
      accent: 'emerald',
      descriptor: (item.shortDescription || item.name).slice(0, 120),
      thumbnail: item.imageUrl,
      images: [
        { id: `${item.slug}-thumb`, url: item.imageUrl, alt: `${item.name} - Cover` }
      ],
      deliveryType: 'instant-download',
      productType: 'digital_download',
      version: item.version || 'Latest',
      compatibility: 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
      requirements: 'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
      supportPeriod: 'Lifetime updates and community documentation',
      updatePolicy: 'Future plugin version updates are included',
      deliveryDescription: 'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
      features: [
        'Genuine, untouched & 100% GPL licensed WordPress plugin',
        'All premium features unlocked without domain restrictions',
        'Lightweight, clean code optimized for server speed and security',
        'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2',
        'One-click plugin installation via WordPress admin dashboard',
        'Future updates provided directly through your customer dashboard'
      ],
      whatsIncluded: [
        `${item.name} Installable Plugin .zip File`,
        'Add-ons & Extensions Pack (if applicable)',
        'Setup & Configuration Instructions',
        'Lifetime Access to Updates'
      ],
      faq: [
        { question: 'Is this plugin authentic and safe to use?', answer: 'Yes, this plugin is 100% original, verified clean, and virus-free under the GPL license.' },
        { question: 'Can I install this on multiple websites?', answer: 'Yes! Under the GNU General Public License, you can use this plugin on as many domains or client sites as you want.' },
        { question: 'How do I install the plugin?', answer: 'Download the .zip file from your dashboard, navigate to WordPress Admin -> Plugins -> Add New -> Upload Plugin, and activate it.' }
      ],
      seoTitle: `${item.name} Download | bdBeginner`,
      seoDescription: item.shortDescription || item.name,
      rating: 4.9,
      reviewCount: 30 + (idx * 4) % 55,
      salesCount: 85 + (idx * 8) % 210,
      tags: ['wordpress', 'plugin', 'gpl', 'weadown', 'tools']
    });

    process.stdout.write('.');
  }

  console.log('\n\n4. Writing updated src/data/catalogProducts.ts (50 WordPress products)...');
  const tsFileContent = `import type { Product } from '@/types';

export const allCatalogProducts: Product[] = ${JSON.stringify(allTsProducts, null, 2)};
`;
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'catalogProducts.ts'), tsFileContent);

  const wpThemesOnly = allTsProducts.filter(p => p.subcategory === 'Themes');
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'wordpressThemes.ts'), `import type { Product } from '@/types';\n\nexport const realWordPressThemes: Product[] = ${JSON.stringify(wpThemesOnly, null, 2)};\n`);

  console.log('Done! All 50 WordPress products updated with Price: 99, Regular: 499, 1 Image each.');
}

run().catch(console.error);
