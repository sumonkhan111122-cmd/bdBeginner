const fs = require('fs');
const path = require('path');

const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-weadown-themes.json'), 'utf-8'));

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

const prices = [490, 450, 590, 550, 390, 490, 450, 590, 390, 490, 550, 450, 490, 590, 450, 390, 490, 550, 450, 390, 590, 490, 550, 450];
const comparePrices = [2490, 1990, 2990, 2750, 1800, 2500, 2200, 2900, 1750, 2400, 2800, 2300, 2500, 3100, 2100, 1650, 2400, 2850, 2200, 1850, 2990, 2500, 2800, 2250];

const escapeSql = (str) => {
  if (!str) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
};

let sql = `-- ==============================================================
-- INSERT 24 REAL WORDPRESS THEMES DIRECTLY INTO SUPABASE
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================

DO $$
DECLARE
  v_category_id uuid;
BEGIN
  -- 1. Ensure WordPress category exists
  SELECT id INTO v_category_id FROM public.categories WHERE slug = 'wordpress' LIMIT 1;
  IF v_category_id IS NULL THEN
    INSERT INTO public.categories (id, name, slug, description, sort_order, is_active)
    VALUES ('c7e89885-df81-4d5e-8353-70990cc57041', 'WordPress', 'wordpress', 'WordPress tools, templates and website resources.', 1, true)
    RETURNING id INTO v_category_id;
  END IF;

`;

const tsProducts = [];

raw.forEach((item, idx) => {
  const id = uuids[idx];
  const price = prices[idx % prices.length];
  const comparePrice = comparePrices[idx % comparePrices.length];
  const sku = `WP-THM-${item.slug.slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${idx + 1}`;
  const shortDesc = item.shortDescription || item.description || item.name;
  const desc = item.description || item.shortDescription || item.name;
  const sortOrder = idx + 1;
  const isFeatured = idx < 8;

  sql += `  -- Product ${idx + 1}: ${item.name.replace(/'/g, '')}
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '${id}',
    v_category_id,
    ${escapeSql(item.name)},
    ${escapeSql(item.slug)},
    '${sku}',
    ${escapeSql(shortDesc)},
    ${escapeSql(desc)},
    ${price},
    ${comparePrice},
    ${escapeSql(item.imageUrl)},
    'digital_download',
    'digital_download',
    'published',
    ${isFeatured},
    true,
    ${escapeSql(item.version || 'Latest')},
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    ${escapeSql(item.name + ' Download | bdBeginner')},
    ${escapeSql(shortDesc)},
    ${sortOrder},
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    thumbnail_url = EXCLUDED.thumbnail_url,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    status = 'published',
    updated_at = now();

  -- Images
  DELETE FROM public.product_images WHERE product_id = '${id}';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('${id}', ${escapeSql(item.imageUrl)}, ${escapeSql(item.name)}, 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '${id}';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('${id}', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('${id}', 'Modern, mobile-responsive layout for all devices', 2),
  ('${id}', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('${id}', 'Built-in performance and search engine optimization (SEO)', 4),
  ('${id}', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '${id}';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('${id}', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('${id}', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

`;

  tsProducts.push({
    id,
    name: item.name,
    slug: item.slug,
    shortDescription: shortDesc,
    description: desc,
    category: 'WordPress',
    subcategory: 'Themes',
    price,
    compareAtPrice: comparePrice,
    previousPrice: comparePrice,
    featured: isFeatured,
    newProduct: true,
    badge: isFeatured ? 'featured' : undefined,
    icon: 'ShoppingBag',
    accent: 'brand',
    descriptor: shortDesc.slice(0, 120),
    thumbnail: item.imageUrl,
    images: [{ id: `${item.slug}-thumb`, url: item.imageUrl, alt: item.name }],
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
      'Modern, mobile-responsive layout for all devices',
      'Elementor and WordPress block editor (Gutenberg) ready',
      'Built-in performance and search engine optimization (SEO)',
      'Pre-built demo layouts and templates ready for 1-click import'
    ],
    whatsIncluded: [
      `${item.name} Installable Package`,
      'Demo Download Entitlement (Test Verification)',
      'Complete Setup & Installation Guide',
      'Lifetime Future Updates Access'
    ],
    faq: [
      {
        question: 'Is this theme authentic and clean?',
        answer: 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).'
      },
      {
        question: 'How do I download the theme files?',
        answer: 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.'
      }
    ],
    seoTitle: `${item.name} Download | bdBeginner`,
    seoDescription: shortDesc,
    rating: 4.8 + (idx % 3) * 0.1,
    reviewCount: 15 + (idx * 7) % 65,
    salesCount: 40 + (idx * 11) % 180,
    tags: ['wordpress', 'theme', 'gpl', 'weadown', 'templates']
  });
});

sql += `
END $$;
`;

fs.writeFileSync(path.join(__dirname, 'insert-real-wordpress-themes.sql'), sql);
console.log('Generated insert-real-wordpress-themes.sql');

const tsFileContent = `import type { Product } from '@/types';

export const realWordPressThemes: Product[] = ${JSON.stringify(tsProducts, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'wordpressThemes.ts'), tsFileContent);
console.log('Updated src/data/wordpressThemes.ts with UUIDs');
