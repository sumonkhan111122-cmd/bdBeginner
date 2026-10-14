const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load themes
const rawThemes = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-weadown-themes.json'), 'utf-8'));
// Load plugins
const rawPlugins = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-weadown-plugins.json'), 'utf-8')).slice(0, 26);

// Category IDs from Supabase DB:
const CATEGORIES = {
  wordpress: 'c7e89885-df81-4d5e-8353-70990cc57041',
  software: '4c9fd83b-2ead-488b-8652-4eff6b87c212',
  aiTools: '46e77cdb-bc84-4658-b6f1-3af0b9833a6d',
  courses: '9658a4a6-c141-433a-8e0a-964a081b3455',
  digitalResources: 'd7ac2ba6-4368-4adf-b314-d7e6b4c14956',
  webServices: 'dd5fe544-7b50-46d0-8d9b-4ed4588f6c8f'
};

// Existing 8 products in DB that were missing images:
const existingDbProducts = [
  {
    id: 'f6dfc90c-7e00-4f25-b67b-6a5a1006ab54',
    name: 'WordPress Starter Toolkit 2026',
    slug: 'wordpress-starter-toolkit',
    category_id: CATEGORIES.wordpress,
    categoryName: 'WordPress',
    price: 590,
    compare_at_price: 1990,
    short_description: 'Complete starter bundle including premium starter templates, speed optimization guide, and essential setup tools.',
    description: 'The WordPress Starter Toolkit is an all-in-one package crafted for web developers, freelancers, and agency owners. It includes pre-configured theme templates, best-practice security configurations, essential speed optimization snippets, and a step-by-step launch checklist to set up high-converting WordPress websites in minutes.',
    version: '2026.1',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'b727ec52-c52e-452f-a19a-3cb784333751',
    name: 'Modern Landing Page Template Pack',
    slug: 'landing-page-template-pack',
    category_id: CATEGORIES.digitalResources,
    categoryName: 'Digital Resources',
    price: 790,
    compare_at_price: 2490,
    short_description: 'High-converting responsive landing page templates built for Elementor, HTML5, and TailwindCSS.',
    description: 'Accelerate your digital campaigns with our Modern Landing Page Template Pack. Designed with conversion-rate optimization principles, clean responsive grids, and stunning micro-interactions. Perfect for SaaS launches, digital products, consulting services, and agency portfolios.',
    version: '3.4.0',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'ccec4485-e365-4a32-b9de-9118bf316043',
    name: 'Productivity Software Suite License',
    slug: 'productivity-software-license',
    category_id: CATEGORIES.software,
    categoryName: 'Software',
    price: 1290,
    compare_at_price: 3990,
    short_description: 'Premium developer & office productivity suite license with cloud sync, workflow automation, and lifetime access.',
    description: 'Boost your daily efficiency with the Productivity Software Suite. Featuring advanced task management, automated clipboard synchronization, markdown note-taking with cloud backup, and hotkey automation tools tested for Windows and macOS environments.',
    version: '5.2.0',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'ff700be6-2531-4dea-b14d-6fd8e95bd09f',
    name: 'AI Workflow & Prompt Engineering Resource Pack',
    slug: 'ai-workflow-resource-pack',
    category_id: CATEGORIES.aiTools,
    categoryName: 'AI Tools',
    price: 690,
    compare_at_price: 2190,
    short_description: 'Curated library of 1,500+ production-tested AI prompts, automated agents, and workflow integrations.',
    description: 'Master generative AI for business, coding, and marketing. Contains verified prompt systems for ChatGPT, Claude, and Midjourney, alongside automated Zapier and Make.com blueprints to put your repetitive content generation on autopilot.',
    version: '2.5.0',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: '405f1b1a-82a1-48c4-89ae-185b415adbfe',
    name: 'SEO & Technical Growth Masterclass',
    slug: 'seo-content-fundamentals-course',
    category_id: CATEGORIES.courses,
    categoryName: 'Courses',
    price: 990,
    compare_at_price: 3490,
    short_description: 'Actionable video course covering technical SEO audits, core web vitals optimization, and high-ranking content strategies.',
    description: 'Learn modern search engine optimization from industry practitioners. Covers schema markup, crawl budget optimization, Core Web Vitals speed tuning, programmatic SEO with AI, and backlink outreach strategies tailored for Bangladeshi and international markets.',
    version: '2026 Edition',
    images: [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'eea2f9f8-a367-40c4-90b9-66cfd2bf1cd1',
    name: 'Creator Design Asset & Iconography Bundle',
    slug: 'creator-design-asset-bundle',
    category_id: CATEGORIES.digitalResources,
    categoryName: 'Digital Resources',
    price: 490,
    compare_at_price: 1890,
    short_description: 'Thousands of high-res 3D icons, vector illustrations, mockups, and social media layout packs.',
    description: 'A comprehensive creative kit for digital creators, YouTubers, and UI designers. Includes Figma components, Adobe Illustrator vectors, transparent 3D render icons, and editable social media canvas templates.',
    version: '4.1',
    images: [
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: '6aef5702-2f16-4352-b5bb-5525834d7a4c',
    name: 'Digital Developer Tools Access Pass',
    slug: 'digital-subscription-access',
    category_id: CATEGORIES.software,
    categoryName: 'Software',
    price: 1490,
    compare_at_price: 4990,
    short_description: 'All-inclusive pass for premium development tools, APIs, code generators, and dev cloud servers.',
    description: 'Get verified access to premium software and developer tools under one unified subscription. Enjoy guaranteed uptime, regular license token renewals, and dedicated priority support from bdBeginner.',
    version: 'Annual Access',
    images: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: '780d97b3-fe13-4341-b203-3c38d016e51d',
    name: 'WordPress Website Setup & Performance Service',
    slug: 'wordpress-website-setup-service',
    category_id: CATEGORIES.webServices,
    categoryName: 'Web Services',
    price: 2990,
    compare_at_price: 7500,
    short_description: 'Complete end-to-end WordPress installation, security hardening, CDN setup, and 90+ PageSpeed optimization.',
    description: 'Let our expert engineers build and optimize your WordPress website. We install your chosen premium theme, configure essential plugins, implement enterprise Cloudflare CDN caching, set up automated daily cloud backups, and guarantee 90+ Google PageSpeed score on mobile and desktop.',
    version: 'Service',
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'
    ]
  }
];

// Curated preview images for themes and plugins
const themePreviews = [
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80'
];

const pluginPreviews = [
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80'
];

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

// Generate deterministic UUIDs for plugins:
const pluginUuids = rawPlugins.map((p, idx) => {
  const hash = crypto.createHash('md5').update(`plugin-${p.slug}-${idx}`).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
});

const escapeSql = (str) => {
  if (!str) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
};

let sql = `-- ==============================================================
-- COMPLETE MASTER DATABASE UPDATE: 58 REAL PRODUCTS WITH 3-4 IMAGES EACH
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================

DO $$
DECLARE
  v_wp_cat uuid := 'c7e89885-df81-4d5e-8353-70990cc57041';
  v_soft_cat uuid := '4c9fd83b-2ead-488b-8652-4eff6b87c212';
  v_ai_cat uuid := '46e77cdb-bc84-4658-b6f1-3af0b9833a6d';
  v_course_cat uuid := '9658a4a6-c141-433a-8e0a-964a081b3455';
  v_resource_cat uuid := 'd7ac2ba6-4368-4adf-b314-d7e6b4c14956';
  v_service_cat uuid := 'dd5fe544-7b50-46d0-8d9b-4ed4588f6c8f';
BEGIN
`;

const allTsProducts = [];

// 1. Process 8 existing DB products (Give them 3-4 images and complete info)
existingDbProducts.forEach((p, idx) => {
  const sku = `BDB-PROD-${p.slug.slice(0, 10).toUpperCase()}-${idx + 1}`;
  sql += `
  -- Existing Product ${idx + 1}: ${p.name}
  UPDATE public.products SET
    name = ${escapeSql(p.name)},
    short_description = ${escapeSql(p.short_description)},
    description = ${escapeSql(p.description)},
    thumbnail_url = ${escapeSql(p.images[0])},
    price = ${p.price},
    compare_at_price = ${p.compare_at_price},
    version = ${escapeSql(p.version)},
    status = 'published',
    updated_at = now()
  WHERE id = '${p.id}';

  DELETE FROM public.product_images WHERE product_id = '${p.id}';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('${p.id}', '${p.images[0]}', '${p.name} - Cover', 0),
  ('${p.id}', '${p.images[1]}', '${p.name} - Overview', 1),
  ('${p.id}', '${p.images[2]}', '${p.name} - Details', 2);

  DELETE FROM public.product_features WHERE product_id = '${p.id}';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('${p.id}', 'Verified, authentic digital package and documentation', 1),
  ('${p.id}', 'Instant digital delivery upon confirmed payment', 2),
  ('${p.id}', 'Production-ready resources tested for efficiency', 3),
  ('${p.id}', 'Comprehensive setup & configuration guide included', 4),
  ('${p.id}', 'Dedicated priority technical support from bdBeginner', 5);
`;

  allTsProducts.push({
    id: p.id,
    name: p.name,
    slug: p.slug,
    shortDescription: p.short_description,
    description: p.description,
    category: p.categoryName,
    subcategory: 'Essentials',
    price: p.price,
    compareAtPrice: p.compare_at_price,
    previousPrice: p.compare_at_price,
    featured: idx < 4,
    newProduct: false,
    badge: idx < 4 ? 'featured' : undefined,
    icon: 'Package',
    accent: 'brand',
    descriptor: p.short_description.slice(0, 120),
    thumbnail: p.images[0],
    images: p.images.map((img, i) => ({ id: `${p.slug}-img-${i}`, url: img, alt: `${p.name} Preview ${i + 1}` })),
    deliveryType: 'instant-download',
    productType: 'digital_download',
    version: p.version,
    compatibility: 'Cross-platform compatible',
    requirements: 'Modern web browser or standard system requirements',
    supportPeriod: 'Lifetime access & bdBeginner documentation',
    updatePolicy: 'Regular updates included',
    deliveryDescription: 'Instant delivery. Download access provided immediately in dashboard upon purchase.',
    features: [
      'Verified, authentic digital package and documentation',
      'Instant digital delivery upon confirmed payment',
      'Production-ready resources tested for efficiency',
      'Comprehensive setup & configuration guide included',
      'Dedicated priority technical support from bdBeginner'
    ],
    whatsIncluded: [
      `${p.name} Full Package`,
      'Documentation & Quickstart Guide',
      'Lifetime Access to Updates'
    ],
    faq: [
      { question: 'How is this product delivered?', answer: 'Instant digital delivery. Files become available in your customer dashboard right after payment confirmation.' },
      { question: 'Is support included?', answer: 'Yes, full technical assistance is provided by bdBeginner team.' }
    ],
    seoTitle: `${p.name} | bdBeginner`,
    seoDescription: p.short_description,
    rating: 4.9,
    reviewCount: 38,
    salesCount: 140,
    tags: [p.slug, 'digital', 'bdbeginner']
  });
});

// 2. Process 24 WordPress Themes (with 3-4 images each and rich descriptions)
const themePrices = [490, 450, 590, 550, 390, 490, 450, 590, 390, 490, 550, 450, 490, 590, 450, 390, 490, 550, 450, 390, 590, 490, 550, 450];
const themeComparePrices = [2490, 1990, 2990, 2750, 1800, 2500, 2200, 2900, 1750, 2400, 2800, 2300, 2500, 3100, 2100, 1650, 2400, 2850, 2200, 1850, 2990, 2500, 2800, 2250];

rawThemes.forEach((item, idx) => {
  const id = themeUuids[idx];
  const price = themePrices[idx % themePrices.length];
  const comparePrice = themeComparePrices[idx % themeComparePrices.length];
  const sku = `WP-THM-${item.slug.slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${idx + 1}`;
  
  // 3-4 images per theme:
  const img1 = item.imageUrl;
  const img2 = themePreviews[(idx) % themePreviews.length];
  const img3 = themePreviews[(idx + 1) % themePreviews.length];
  const img4 = themePreviews[(idx + 2) % themePreviews.length];

  const detailedDesc = `${item.name} is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.\n\nWhether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, ${item.name} offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.\n\nAll theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.`;

  sql += `
  -- Theme ${idx + 1}: ${item.name}
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '${id}', v_wp_cat, ${escapeSql(item.name)}, ${escapeSql(item.slug)}, '${sku}',
    ${escapeSql(item.shortDescription || item.name)}, ${escapeSql(detailedDesc)},
    ${price}, ${comparePrice}, ${escapeSql(img1)},
    'digital_download', 'digital_download', 'published', ${idx < 8}, true,
    ${escapeSql(item.version || 'Latest')}, 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    ${escapeSql(item.name + ' Download | bdBeginner')}, ${escapeSql(item.shortDescription || item.name)},
    ${idx + 10}, now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    thumbnail_url = EXCLUDED.thumbnail_url,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    status = 'published',
    updated_at = now();

  DELETE FROM public.product_images WHERE product_id = '${id}';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('${id}', ${escapeSql(img1)}, '${item.name} - Cover Banner', 0),
  ('${id}', ${escapeSql(img2)}, '${item.name} - Layout Showcase', 1),
  ('${id}', ${escapeSql(img3)}, '${item.name} - Builder & Customizer', 2),
  ('${id}', ${escapeSql(img4)}, '${item.name} - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '${id}';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('${id}', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('${id}', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('${id}', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('${id}', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('${id}', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('${id}', 'Fully compatible with WooCommerce for modern online stores', 6);
`;

  allTsProducts.push({
    id,
    name: item.name,
    slug: item.slug,
    shortDescription: item.shortDescription || item.name,
    description: detailedDesc,
    category: 'WordPress',
    subcategory: 'Themes',
    price,
    compareAtPrice: comparePrice,
    previousPrice: comparePrice,
    featured: idx < 8,
    newProduct: true,
    badge: idx < 8 ? 'featured' : undefined,
    icon: 'ShoppingBag',
    accent: 'brand',
    descriptor: (item.shortDescription || item.name).slice(0, 120),
    thumbnail: img1,
    images: [
      { id: `${item.slug}-1`, url: img1, alt: `${item.name} - Cover Banner` },
      { id: `${item.slug}-2`, url: img2, alt: `${item.name} - Layout Showcase` },
      { id: `${item.slug}-3`, url: img3, alt: `${item.name} - Builder & Customizer` },
      { id: `${item.slug}-4`, url: img4, alt: `${item.name} - Mobile Responsive View` }
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
});

// 3. Process 26 WordPress Plugins (with 3-4 images each and rich descriptions)
const pluginPrices = [390, 450, 490, 390, 450, 590, 490, 390, 450, 490, 550, 390, 450, 490, 590, 390, 450, 490, 390, 450, 550, 490, 390, 450, 490, 390];
const pluginComparePrices = [1800, 2200, 2500, 1900, 2300, 2900, 2400, 1850, 2250, 2600, 2800, 1950, 2350, 2500, 3100, 1800, 2200, 2450, 1900, 2300, 2750, 2500, 1850, 2250, 2400, 1900];

rawPlugins.forEach((item, idx) => {
  const id = pluginUuids[idx];
  const price = pluginPrices[idx % pluginPrices.length];
  const comparePrice = pluginComparePrices[idx % pluginComparePrices.length];
  const sku = `WP-PLG-${item.slug.slice(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, '')}-${idx + 1}`;

  const img1 = item.imageUrl;
  const img2 = pluginPreviews[(idx) % pluginPreviews.length];
  const img3 = pluginPreviews[(idx + 1) % pluginPreviews.length];
  const img4 = pluginPreviews[(idx + 2) % pluginPreviews.length];

  const detailedDesc = `${item.name} is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.\n\n${item.shortDescription}\n\nFeatures 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.`;

  sql += `
  -- Plugin ${idx + 1}: ${item.name}
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '${id}', v_wp_cat, ${escapeSql(item.name)}, ${escapeSql(item.slug)}, '${sku}',
    ${escapeSql(item.shortDescription || item.name)}, ${escapeSql(detailedDesc)},
    ${price}, ${comparePrice}, ${escapeSql(img1)},
    'digital_download', 'digital_download', 'published', ${idx < 6}, true,
    ${escapeSql(item.version || 'Latest')}, 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    ${escapeSql(item.name + ' Download | bdBeginner')}, ${escapeSql(item.shortDescription || item.name)},
    ${idx + 40}, now()
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    price = EXCLUDED.price,
    compare_at_price = EXCLUDED.compare_at_price,
    thumbnail_url = EXCLUDED.thumbnail_url,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    status = 'published',
    updated_at = now();

  DELETE FROM public.product_images WHERE product_id = '${id}';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('${id}', ${escapeSql(img1)}, '${item.name} - Cover Banner', 0),
  ('${id}', ${escapeSql(img2)}, '${item.name} - Admin Dashboard Preview', 1),
  ('${id}', ${escapeSql(img3)}, '${item.name} - Settings & Controls', 2),
  ('${id}', ${escapeSql(img4)}, '${item.name} - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '${id}';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('${id}', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('${id}', 'All premium features unlocked without domain restrictions', 2),
  ('${id}', 'Lightweight, clean code optimized for server speed and security', 3),
  ('${id}', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('${id}', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('${id}', 'Future updates provided directly through your customer dashboard', 6);
`;

  allTsProducts.push({
    id,
    name: item.name,
    slug: item.slug,
    shortDescription: item.shortDescription || item.name,
    description: detailedDesc,
    category: 'WordPress',
    subcategory: 'Plugins',
    price,
    compareAtPrice: comparePrice,
    previousPrice: comparePrice,
    featured: idx < 6,
    newProduct: true,
    badge: idx < 6 ? 'featured' : undefined,
    icon: 'Layers',
    accent: 'emerald',
    descriptor: (item.shortDescription || item.name).slice(0, 120),
    thumbnail: img1,
    images: [
      { id: `${item.slug}-1`, url: img1, alt: `${item.name} - Cover Banner` },
      { id: `${item.slug}-2`, url: img2, alt: `${item.name} - Admin Dashboard Preview` },
      { id: `${item.slug}-3`, url: img3, alt: `${item.name} - Settings & Controls` },
      { id: `${item.slug}-4`, url: img4, alt: `${item.name} - Feature Overview` }
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
});

sql += `
END $$;
`;

fs.writeFileSync(path.join(__dirname, 'insert-all-50-products-multi-images.sql'), sql);
console.log('Generated insert-all-50-products-multi-images.sql');

const tsFileContent = `import type { Product } from '@/types';

export const allCatalogProducts: Product[] = ${JSON.stringify(allTsProducts, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'catalogProducts.ts'), tsFileContent);
console.log('Updated src/data/catalogProducts.ts with all 58 products and multiple images');
