-- ==============================================================
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

  -- Existing Product 1: WordPress Starter Toolkit 2026
  UPDATE public.products SET
    name = 'WordPress Starter Toolkit 2026',
    short_description = 'Complete starter bundle including premium starter templates, speed optimization guide, and essential setup tools.',
    description = 'The WordPress Starter Toolkit is an all-in-one package crafted for web developers, freelancers, and agency owners. It includes pre-configured theme templates, best-practice security configurations, essential speed optimization snippets, and a step-by-step launch checklist to set up high-converting WordPress websites in minutes.',
    thumbnail_url = 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    price = 590,
    compare_at_price = 1990,
    version = '2026.1',
    status = 'published',
    updated_at = now()
  WHERE id = 'f6dfc90c-7e00-4f25-b67b-6a5a1006ab54';

  DELETE FROM public.product_images WHERE product_id = 'f6dfc90c-7e00-4f25-b67b-6a5a1006ab54';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'WordPress Starter Toolkit 2026 - Cover', 0),
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'WordPress Starter Toolkit 2026 - Overview', 1),
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'WordPress Starter Toolkit 2026 - Details', 2);

  DELETE FROM public.product_features WHERE product_id = 'f6dfc90c-7e00-4f25-b67b-6a5a1006ab54';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'Verified, authentic digital package and documentation', 1),
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'Instant digital delivery upon confirmed payment', 2),
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'Production-ready resources tested for efficiency', 3),
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'Comprehensive setup & configuration guide included', 4),
  ('f6dfc90c-7e00-4f25-b67b-6a5a1006ab54', 'Dedicated priority technical support from bdBeginner', 5);

  -- Existing Product 2: Modern Landing Page Template Pack
  UPDATE public.products SET
    name = 'Modern Landing Page Template Pack',
    short_description = 'High-converting responsive landing page templates built for Elementor, HTML5, and TailwindCSS.',
    description = 'Accelerate your digital campaigns with our Modern Landing Page Template Pack. Designed with conversion-rate optimization principles, clean responsive grids, and stunning micro-interactions. Perfect for SaaS launches, digital products, consulting services, and agency portfolios.',
    thumbnail_url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    price = 790,
    compare_at_price = 2490,
    version = '3.4.0',
    status = 'published',
    updated_at = now()
  WHERE id = 'b727ec52-c52e-452f-a19a-3cb784333751';

  DELETE FROM public.product_images WHERE product_id = 'b727ec52-c52e-452f-a19a-3cb784333751';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Modern Landing Page Template Pack - Cover', 0),
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Modern Landing Page Template Pack - Overview', 1),
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Modern Landing Page Template Pack - Details', 2);

  DELETE FROM public.product_features WHERE product_id = 'b727ec52-c52e-452f-a19a-3cb784333751';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'Verified, authentic digital package and documentation', 1),
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'Instant digital delivery upon confirmed payment', 2),
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'Production-ready resources tested for efficiency', 3),
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'Comprehensive setup & configuration guide included', 4),
  ('b727ec52-c52e-452f-a19a-3cb784333751', 'Dedicated priority technical support from bdBeginner', 5);

  -- Existing Product 3: Productivity Software Suite License
  UPDATE public.products SET
    name = 'Productivity Software Suite License',
    short_description = 'Premium developer & office productivity suite license with cloud sync, workflow automation, and lifetime access.',
    description = 'Boost your daily efficiency with the Productivity Software Suite. Featuring advanced task management, automated clipboard synchronization, markdown note-taking with cloud backup, and hotkey automation tools tested for Windows and macOS environments.',
    thumbnail_url = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    price = 1290,
    compare_at_price = 3990,
    version = '5.2.0',
    status = 'published',
    updated_at = now()
  WHERE id = 'ccec4485-e365-4a32-b9de-9118bf316043';

  DELETE FROM public.product_images WHERE product_id = 'ccec4485-e365-4a32-b9de-9118bf316043';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Productivity Software Suite License - Cover', 0),
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Productivity Software Suite License - Overview', 1),
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Productivity Software Suite License - Details', 2);

  DELETE FROM public.product_features WHERE product_id = 'ccec4485-e365-4a32-b9de-9118bf316043';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'Verified, authentic digital package and documentation', 1),
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'Instant digital delivery upon confirmed payment', 2),
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'Production-ready resources tested for efficiency', 3),
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'Comprehensive setup & configuration guide included', 4),
  ('ccec4485-e365-4a32-b9de-9118bf316043', 'Dedicated priority technical support from bdBeginner', 5);

  -- Existing Product 4: AI Workflow & Prompt Engineering Resource Pack
  UPDATE public.products SET
    name = 'AI Workflow & Prompt Engineering Resource Pack',
    short_description = 'Curated library of 1,500+ production-tested AI prompts, automated agents, and workflow integrations.',
    description = 'Master generative AI for business, coding, and marketing. Contains verified prompt systems for ChatGPT, Claude, and Midjourney, alongside automated Zapier and Make.com blueprints to put your repetitive content generation on autopilot.',
    thumbnail_url = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    price = 690,
    compare_at_price = 2190,
    version = '2.5.0',
    status = 'published',
    updated_at = now()
  WHERE id = 'ff700be6-2531-4dea-b14d-6fd8e95bd09f';

  DELETE FROM public.product_images WHERE product_id = 'ff700be6-2531-4dea-b14d-6fd8e95bd09f';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'AI Workflow & Prompt Engineering Resource Pack - Cover', 0),
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80', 'AI Workflow & Prompt Engineering Resource Pack - Overview', 1),
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'AI Workflow & Prompt Engineering Resource Pack - Details', 2);

  DELETE FROM public.product_features WHERE product_id = 'ff700be6-2531-4dea-b14d-6fd8e95bd09f';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'Verified, authentic digital package and documentation', 1),
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'Instant digital delivery upon confirmed payment', 2),
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'Production-ready resources tested for efficiency', 3),
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'Comprehensive setup & configuration guide included', 4),
  ('ff700be6-2531-4dea-b14d-6fd8e95bd09f', 'Dedicated priority technical support from bdBeginner', 5);

  -- Existing Product 5: SEO & Technical Growth Masterclass
  UPDATE public.products SET
    name = 'SEO & Technical Growth Masterclass',
    short_description = 'Actionable video course covering technical SEO audits, core web vitals optimization, and high-ranking content strategies.',
    description = 'Learn modern search engine optimization from industry practitioners. Covers schema markup, crawl budget optimization, Core Web Vitals speed tuning, programmatic SEO with AI, and backlink outreach strategies tailored for Bangladeshi and international markets.',
    thumbnail_url = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    price = 990,
    compare_at_price = 3490,
    version = '2026 Edition',
    status = 'published',
    updated_at = now()
  WHERE id = '405f1b1a-82a1-48c4-89ae-185b415adbfe';

  DELETE FROM public.product_images WHERE product_id = '405f1b1a-82a1-48c4-89ae-185b415adbfe';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80', 'SEO & Technical Growth Masterclass - Cover', 0),
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', 'SEO & Technical Growth Masterclass - Overview', 1),
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'SEO & Technical Growth Masterclass - Details', 2);

  DELETE FROM public.product_features WHERE product_id = '405f1b1a-82a1-48c4-89ae-185b415adbfe';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'Verified, authentic digital package and documentation', 1),
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'Instant digital delivery upon confirmed payment', 2),
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'Production-ready resources tested for efficiency', 3),
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'Comprehensive setup & configuration guide included', 4),
  ('405f1b1a-82a1-48c4-89ae-185b415adbfe', 'Dedicated priority technical support from bdBeginner', 5);

  -- Existing Product 6: Creator Design Asset & Iconography Bundle
  UPDATE public.products SET
    name = 'Creator Design Asset & Iconography Bundle',
    short_description = 'Thousands of high-res 3D icons, vector illustrations, mockups, and social media layout packs.',
    description = 'A comprehensive creative kit for digital creators, YouTubers, and UI designers. Includes Figma components, Adobe Illustrator vectors, transparent 3D render icons, and editable social media canvas templates.',
    thumbnail_url = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    price = 490,
    compare_at_price = 1890,
    version = '4.1',
    status = 'published',
    updated_at = now()
  WHERE id = '1a54b4cf-d841-4560-91c6-a6fc7e04df7a';

  DELETE FROM public.product_images WHERE product_id = '1a54b4cf-d841-4560-91c6-a6fc7e04df7a';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80', 'Creator Design Asset & Iconography Bundle - Cover', 0),
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80', 'Creator Design Asset & Iconography Bundle - Overview', 1),
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Creator Design Asset & Iconography Bundle - Details', 2);

  DELETE FROM public.product_features WHERE product_id = '1a54b4cf-d841-4560-91c6-a6fc7e04df7a';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'Verified, authentic digital package and documentation', 1),
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'Instant digital delivery upon confirmed payment', 2),
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'Production-ready resources tested for efficiency', 3),
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'Comprehensive setup & configuration guide included', 4),
  ('1a54b4cf-d841-4560-91c6-a6fc7e04df7a', 'Dedicated priority technical support from bdBeginner', 5);

  -- Existing Product 7: Digital Developer Tools Access Pass
  UPDATE public.products SET
    name = 'Digital Developer Tools Access Pass',
    short_description = 'All-inclusive pass for premium development tools, APIs, code generators, and dev cloud servers.',
    description = 'Get verified access to premium software and developer tools under one unified subscription. Enjoy guaranteed uptime, regular license token renewals, and dedicated priority support from bdBeginner.',
    thumbnail_url = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    price = 1490,
    compare_at_price = 4990,
    version = 'Annual Access',
    status = 'published',
    updated_at = now()
  WHERE id = '8a30a7d7-f0bb-4c81-a6aa-42587508731f';

  DELETE FROM public.product_images WHERE product_id = '8a30a7d7-f0bb-4c81-a6aa-42587508731f';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Digital Developer Tools Access Pass - Cover', 0),
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Digital Developer Tools Access Pass - Overview', 1),
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Digital Developer Tools Access Pass - Details', 2);

  DELETE FROM public.product_features WHERE product_id = '8a30a7d7-f0bb-4c81-a6aa-42587508731f';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'Verified, authentic digital package and documentation', 1),
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'Instant digital delivery upon confirmed payment', 2),
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'Production-ready resources tested for efficiency', 3),
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'Comprehensive setup & configuration guide included', 4),
  ('8a30a7d7-f0bb-4c81-a6aa-42587508731f', 'Dedicated priority technical support from bdBeginner', 5);

  -- Existing Product 8: WordPress Website Setup & Performance Service
  UPDATE public.products SET
    name = 'WordPress Website Setup & Performance Service',
    short_description = 'Complete end-to-end WordPress installation, security hardening, CDN setup, and 90+ PageSpeed optimization.',
    description = 'Let our expert engineers build and optimize your WordPress website. We install your chosen premium theme, configure essential plugins, implement enterprise Cloudflare CDN caching, set up automated daily cloud backups, and guarantee 90+ Google PageSpeed score on mobile and desktop.',
    thumbnail_url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    price = 2990,
    compare_at_price = 7500,
    version = 'Service',
    status = 'published',
    updated_at = now()
  WHERE id = '018b3e8c-8511-4ebc-8806-03c0352ef23a';

  DELETE FROM public.product_images WHERE product_id = '018b3e8c-8511-4ebc-8806-03c0352ef23a';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'WordPress Website Setup & Performance Service - Cover', 0),
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'WordPress Website Setup & Performance Service - Overview', 1),
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'WordPress Website Setup & Performance Service - Details', 2);

  DELETE FROM public.product_features WHERE product_id = '018b3e8c-8511-4ebc-8806-03c0352ef23a';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'Verified, authentic digital package and documentation', 1),
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'Instant digital delivery upon confirmed payment', 2),
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'Production-ready resources tested for efficiency', 3),
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'Comprehensive setup & configuration guide included', 4),
  ('018b3e8c-8511-4ebc-8806-03c0352ef23a', 'Dedicated priority technical support from bdBeginner', 5);

  -- Theme 1: Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'c198a150-6322-42d6-a44d-d826c5aabc6a', v_wp_cat, 'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme', 'salient-wordpress-theme', 'WP-THM-SALIENTWORD-1',
    'Salient which incorporates perfect blend of features and styles that helps users to best showcase business and personal projects.', 'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    490, 2490, 'https://weadown.com/wp-content/uploads/2025/12/salient-17-4-1-creative-multipurpose-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '18.4.1', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme Download | bdBeginner', 'Salient which incorporates perfect blend of features and styles that helps users to best showcase business and personal projects.',
    10, now()
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

  DELETE FROM public.product_images WHERE product_id = 'c198a150-6322-42d6-a44d-d826c5aabc6a';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'https://weadown.com/wp-content/uploads/2025/12/salient-17-4-1-creative-multipurpose-woocommerce-theme.jpg', 'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme - Cover Banner', 0),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme - Layout Showcase', 1),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme - Builder & Customizer', 2),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'c198a150-6322-42d6-a44d-d826c5aabc6a';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 2: Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'b305dc15-8999-4473-9e14-2a880bb89426', v_wp_cat, 'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme', 'kapee-wordpress-theme', 'WP-THM-KAPEEWORDPR-2',
    'Kapee is fast, clean, highly customizable and responsive WordPress theme. Kapee Theme is a professional WordPress WooCommerce theme.', 'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    450, 1990, 'https://weadown.com/wp-content/uploads/2023/05/kapee-1-6-0-fashion-store-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '1.7.5', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme Download | bdBeginner', 'Kapee is fast, clean, highly customizable and responsive WordPress theme. Kapee Theme is a professional WordPress WooCommerce theme.',
    11, now()
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

  DELETE FROM public.product_images WHERE product_id = 'b305dc15-8999-4473-9e14-2a880bb89426';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'https://weadown.com/wp-content/uploads/2023/05/kapee-1-6-0-fashion-store-woocommerce-theme.jpg', 'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme - Cover Banner', 0),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme - Layout Showcase', 1),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme - Builder & Customizer', 2),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'b305dc15-8999-4473-9e14-2a880bb89426';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 3: Bricks 2.4.3 - Visual Site Builder for WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '2a054432-b89f-4398-bc60-34910b00443b', v_wp_cat, 'Bricks 2.4.3 - Visual Site Builder for WordPress', 'bricks-build-wordpress-sites', 'WP-THM-BRICKSBUILD-3',
    'Bricks an innovative, community-driven, visual site builder theme for your self-hosted WordPress website. Empowering you to design unique, performant, and', 'Bricks 2.4.3 - Visual Site Builder for WordPress is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Bricks 2.4.3 - Visual Site Builder for WordPress offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    590, 2990, 'https://weadown.com/wp-content/uploads/2026/07/Bricks-Visual-Site-Builder-for-WordPress.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '2.4.3', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Bricks 2.4.3 - Visual Site Builder for WordPress Download | bdBeginner', 'Bricks an innovative, community-driven, visual site builder theme for your self-hosted WordPress website. Empowering you to design unique, performant, and',
    12, now()
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

  DELETE FROM public.product_images WHERE product_id = '2a054432-b89f-4398-bc60-34910b00443b';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('2a054432-b89f-4398-bc60-34910b00443b', 'https://weadown.com/wp-content/uploads/2026/07/Bricks-Visual-Site-Builder-for-WordPress.jpg', 'Bricks 2.4.3 - Visual Site Builder for WordPress - Cover Banner', 0),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Bricks 2.4.3 - Visual Site Builder for WordPress - Layout Showcase', 1),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Bricks 2.4.3 - Visual Site Builder for WordPress - Builder & Customizer', 2),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Bricks 2.4.3 - Visual Site Builder for WordPress - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '2a054432-b89f-4398-bc60-34910b00443b';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 4: Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'beeaa408-d450-4184-9a25-4dd544b7b0a4', v_wp_cat, 'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL', 'xtra-wordpress-website-builder', 'WP-THM-XTRAWORDPRE-4',
    'XTRA is a creative, responsive, live drag and drop and easy-to-use WordPress theme for any kind of websites. XTRA Theme allows you to create sites for a wide', 'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    550, 2750, 'https://weadown.com/wp-content/uploads/2025/01/xtra-4-9-12-wordpress-website-builder-rtl.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '6.2', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL Download | bdBeginner', 'XTRA is a creative, responsive, live drag and drop and easy-to-use WordPress theme for any kind of websites. XTRA Theme allows you to create sites for a wide',
    13, now()
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

  DELETE FROM public.product_images WHERE product_id = 'beeaa408-d450-4184-9a25-4dd544b7b0a4';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'https://weadown.com/wp-content/uploads/2025/01/xtra-4-9-12-wordpress-website-builder-rtl.jpg', 'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL - Cover Banner', 0),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL - Layout Showcase', 1),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL - Builder & Customizer', 2),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'beeaa408-d450-4184-9a25-4dd544b7b0a4';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 5: Traveler 3.4 - Travel Booking WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'fae32b9b-ec25-4712-974a-0e36e0deff45', v_wp_cat, 'Traveler 3.4 - Travel Booking WordPress Theme', 'traveler-travel-booking-wordpress-theme', 'WP-THM-TRAVELERTRA-5',
    'Traveler helps you Save Time, Save Money, Save Face, Save everything can Save to make online booking with fully customizable booking form, flexible online', 'Traveler 3.4 - Travel Booking WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Traveler 3.4 - Travel Booking WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    390, 1800, 'https://weadown.com/wp-content/uploads/2023/04/traveler-3-0-7-travel-booking-wordpress-theme.png',
    'digital_download', 'digital_download', 'published', true, true,
    '3.4', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Traveler 3.4 - Travel Booking WordPress Theme Download | bdBeginner', 'Traveler helps you Save Time, Save Money, Save Face, Save everything can Save to make online booking with fully customizable booking form, flexible online',
    14, now()
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

  DELETE FROM public.product_images WHERE product_id = 'fae32b9b-ec25-4712-974a-0e36e0deff45';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'https://weadown.com/wp-content/uploads/2023/04/traveler-3-0-7-travel-booking-wordpress-theme.png', 'Traveler 3.4 - Travel Booking WordPress Theme - Cover Banner', 0),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Traveler 3.4 - Travel Booking WordPress Theme - Layout Showcase', 1),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Traveler 3.4 - Travel Booking WordPress Theme - Builder & Customizer', 2),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Traveler 3.4 - Travel Booking WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'fae32b9b-ec25-4712-974a-0e36e0deff45';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 6: Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', v_wp_cat, 'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress', 'divi-wordpress-theme', 'WP-THM-DIVIWORDPRE-6',
    'Divi Theme is the smartest, most flexible theme in our collection. With Divi, the sky’s the limit. Divi Pro is fast, lean, and packed with modern features to', 'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    490, 2500, 'https://weadown.com/wp-content/uploads/2024/11/Divi-WordPress-Theme-Visual-Page-Builder.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '5.15.1', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress Download | bdBeginner', 'Divi Theme is the smartest, most flexible theme in our collection. With Divi, the sky’s the limit. Divi Pro is fast, lean, and packed with modern features to',
    15, now()
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

  DELETE FROM public.product_images WHERE product_id = 'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'https://weadown.com/wp-content/uploads/2024/11/Divi-WordPress-Theme-Visual-Page-Builder.jpg', 'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress - Cover Banner', 0),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress - Layout Showcase', 1),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress - Builder & Customizer', 2),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 7: Finbiz 2.2.3 - Consulting Business WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'ea956669-cae8-4b29-af71-5ea1c7eb0ac0', v_wp_cat, 'Finbiz 2.2.3 - Consulting Business WordPress Theme', 'finbiz-wordpress-theme', 'WP-THM-FINBIZWORDP-7',
    'Finbiz is a clean and minimalist design that is perfect for showcasing financial services, human resources, insurance, consulting, corporate, IT solutions,', 'Finbiz 2.2.3 - Consulting Business WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Finbiz 2.2.3 - Consulting Business WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    450, 2200, 'https://weadown.com/wp-content/uploads/2025/03/finbiz-2-1-5-consulting-business-wordpress-theme.png',
    'digital_download', 'digital_download', 'published', true, true,
    '2.2.3', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Finbiz 2.2.3 - Consulting Business WordPress Theme Download | bdBeginner', 'Finbiz is a clean and minimalist design that is perfect for showcasing financial services, human resources, insurance, consulting, corporate, IT solutions,',
    16, now()
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

  DELETE FROM public.product_images WHERE product_id = 'ea956669-cae8-4b29-af71-5ea1c7eb0ac0';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'https://weadown.com/wp-content/uploads/2025/03/finbiz-2-1-5-consulting-business-wordpress-theme.png', 'Finbiz 2.2.3 - Consulting Business WordPress Theme - Cover Banner', 0),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Finbiz 2.2.3 - Consulting Business WordPress Theme - Layout Showcase', 1),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Finbiz 2.2.3 - Consulting Business WordPress Theme - Builder & Customizer', 2),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Finbiz 2.2.3 - Consulting Business WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'ea956669-cae8-4b29-af71-5ea1c7eb0ac0';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 8: Voxel 1.7.11 - Create WordPress Dynamic Sites
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'b83b399b-94a4-47d6-9687-a4e28d19d291', v_wp_cat, 'Voxel 1.7.11 - Create WordPress Dynamic Sites', 'voxel-create-wordpress-dynamic-sites', 'WP-THM-VOXELCREATE-8',
    'Voxel create WordPress Dynamic Sites, Directory & Listing sites and more with Voxel & Elementor page builder.', 'Voxel 1.7.11 - Create WordPress Dynamic Sites is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Voxel 1.7.11 - Create WordPress Dynamic Sites offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    590, 2900, 'https://weadown.com/wp-content/uploads/2024/12/Voxel-Create-WordPress-Dynamic-Sites.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '1.7.11', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Voxel 1.7.11 - Create WordPress Dynamic Sites Download | bdBeginner', 'Voxel create WordPress Dynamic Sites, Directory & Listing sites and more with Voxel & Elementor page builder.',
    17, now()
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

  DELETE FROM public.product_images WHERE product_id = 'b83b399b-94a4-47d6-9687-a4e28d19d291';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'https://weadown.com/wp-content/uploads/2024/12/Voxel-Create-WordPress-Dynamic-Sites.jpg', 'Voxel 1.7.11 - Create WordPress Dynamic Sites - Cover Banner', 0),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Voxel 1.7.11 - Create WordPress Dynamic Sites - Layout Showcase', 1),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Voxel 1.7.11 - Create WordPress Dynamic Sites - Builder & Customizer', 2),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Voxel 1.7.11 - Create WordPress Dynamic Sites - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'b83b399b-94a4-47d6-9687-a4e28d19d291';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 9: Infinite 5.0.1 - Corporate Business WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'b51bed97-799d-43bc-9c15-b6dcc7fb2d21', v_wp_cat, 'Infinite 5.0.1 - Corporate Business WordPress Theme', 'infinite-wordpress-theme', 'WP-THM-INFINITEWOR-9',
    'Infinite is well designed WordPress theme for multi-purpose. Featured with the latest version of super powerful & customizable framework by GoodLayers.', 'Infinite 5.0.1 - Corporate Business WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Infinite 5.0.1 - Corporate Business WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    390, 1750, 'https://weadown.com/wp-content/uploads/2023/08/infinite-4-0-4-multipurpose-wordpress-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '5.0.1', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Infinite 5.0.1 - Corporate Business WordPress Theme Download | bdBeginner', 'Infinite is well designed WordPress theme for multi-purpose. Featured with the latest version of super powerful & customizable framework by GoodLayers.',
    18, now()
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

  DELETE FROM public.product_images WHERE product_id = 'b51bed97-799d-43bc-9c15-b6dcc7fb2d21';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'https://weadown.com/wp-content/uploads/2023/08/infinite-4-0-4-multipurpose-wordpress-theme.jpg', 'Infinite 5.0.1 - Corporate Business WordPress Theme - Cover Banner', 0),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Infinite 5.0.1 - Corporate Business WordPress Theme - Layout Showcase', 1),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Infinite 5.0.1 - Corporate Business WordPress Theme - Builder & Customizer', 2),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Infinite 5.0.1 - Corporate Business WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'b51bed97-799d-43bc-9c15-b6dcc7fb2d21';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 10: Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', v_wp_cat, 'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme', 'bellevue-hotel-wordpress-theme', 'WP-THM-BELLEVUEHOT-10',
    'Bellevue includes everything you would expect from a premium WordPress theme and it will help you to build an awesome Hotel or Bed and Breakfast website.', 'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    490, 2400, 'https://weadown.com/wp-content/uploads/2024/12/bellevue-4-2-6-hotel-bed-and-breakfast-booking-calendar-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '4.2.24', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme Download | bdBeginner', 'Bellevue includes everything you would expect from a premium WordPress theme and it will help you to build an awesome Hotel or Bed and Breakfast website.',
    19, now()
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

  DELETE FROM public.product_images WHERE product_id = '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'https://weadown.com/wp-content/uploads/2024/12/bellevue-4-2-6-hotel-bed-and-breakfast-booking-calendar-theme.jpg', 'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme - Cover Banner', 0),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme - Layout Showcase', 1),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme - Builder & Customizer', 2),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 11: Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'fb87dcf3-a559-47f2-896e-cd39fef73a3b', v_wp_cat, 'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme', 'savoy-woocommerce-theme', 'WP-THM-SAVOYWOOCOM-11',
    'Savoy creates the basis for an amazing online store. Its modern minimalist design puts your products in focus, and our built-in AJAX functionality gives your', 'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    550, 2800, 'https://weadown.com/wp-content/uploads/2023/06/savoy-2-8-2-minimalist-ajax-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '3.2.3', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme Download | bdBeginner', 'Savoy creates the basis for an amazing online store. Its modern minimalist design puts your products in focus, and our built-in AJAX functionality gives your',
    20, now()
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

  DELETE FROM public.product_images WHERE product_id = 'fb87dcf3-a559-47f2-896e-cd39fef73a3b';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'https://weadown.com/wp-content/uploads/2023/06/savoy-2-8-2-minimalist-ajax-woocommerce-theme.jpg', 'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme - Cover Banner', 0),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme - Layout Showcase', 1),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme - Builder & Customizer', 2),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'fb87dcf3-a559-47f2-896e-cd39fef73a3b';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 12: Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '7a0f93d5-966d-409c-baca-699af8571514', v_wp_cat, 'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support', 'elessi-wordpress-theme', 'WP-THM-ELESSIWORDP-12',
    'Elessi is clean, modern, user-friendly WooCommerce Theme with many of functions theme just perfect for your eCommerce project.', 'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    450, 2300, 'https://weadown.com/wp-content/uploads/2023/04/elessi-5-1-8-woocommerce-ajax-wordpress-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '6.6.4.1', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support Download | bdBeginner', 'Elessi is clean, modern, user-friendly WooCommerce Theme with many of functions theme just perfect for your eCommerce project.',
    21, now()
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

  DELETE FROM public.product_images WHERE product_id = '7a0f93d5-966d-409c-baca-699af8571514';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('7a0f93d5-966d-409c-baca-699af8571514', 'https://weadown.com/wp-content/uploads/2023/04/elessi-5-1-8-woocommerce-ajax-wordpress-theme.jpg', 'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support - Cover Banner', 0),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support - Layout Showcase', 1),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support - Builder & Customizer', 2),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '7a0f93d5-966d-409c-baca-699af8571514';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 13: Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'a5a9f55e-970d-4474-8324-40c01b47b6a5', v_wp_cat, 'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme', 'bridge-wordpress-theme', 'WP-THM-BRIDGEWORDP-13',
    'Bridge is a responsive retina multipurpose WordPress theme perfect for just about anyone. Whether you are a creative, a corporate team, a lawyer, a medical', 'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    490, 2500, 'https://weadown.com/wp-content/uploads/2024/02/bridge-30-2-creative-multipurpose-wordpress-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '30.9', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme Download | bdBeginner', 'Bridge is a responsive retina multipurpose WordPress theme perfect for just about anyone. Whether you are a creative, a corporate team, a lawyer, a medical',
    22, now()
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

  DELETE FROM public.product_images WHERE product_id = 'a5a9f55e-970d-4474-8324-40c01b47b6a5';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'https://weadown.com/wp-content/uploads/2024/02/bridge-30-2-creative-multipurpose-wordpress-theme.jpg', 'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme - Cover Banner', 0),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme - Layout Showcase', 1),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme - Builder & Customizer', 2),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'a5a9f55e-970d-4474-8324-40c01b47b6a5';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 14: Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'd994ef6e-cdaf-4ef5-a98f-05140cc9b894', v_wp_cat, 'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme', 'zota-wordpress-theme', 'WP-THM-ZOTAWORDPRE-14',
    'Zota is a flexible and customizable WooCommerce Multi-Purpose WordPress Theme that installs and changes any item in a matter of minutes via Powerful Theme', 'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    590, 3100, 'https://weadown.com/wp-content/uploads/2023/05/zota-1-2-9-elementor-multi-purpose-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '1.3.21', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme Download | bdBeginner', 'Zota is a flexible and customizable WooCommerce Multi-Purpose WordPress Theme that installs and changes any item in a matter of minutes via Powerful Theme',
    23, now()
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

  DELETE FROM public.product_images WHERE product_id = 'd994ef6e-cdaf-4ef5-a98f-05140cc9b894';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'https://weadown.com/wp-content/uploads/2023/05/zota-1-2-9-elementor-multi-purpose-woocommerce-theme.jpg', 'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme - Cover Banner', 0),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme - Layout Showcase', 1),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme - Builder & Customizer', 2),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'd994ef6e-cdaf-4ef5-a98f-05140cc9b894';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 15: Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'dc80ae85-5ef3-49ad-b803-34ec59dc3014', v_wp_cat, 'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme', 'ecom-multipurpose-woocommerce-wordpress-theme', 'WP-THM-ECOMMULTIPU-15',
    'Ecom is a conversion-focused WooCommerce theme built for modern online stores. Fully compatible with Elementor and WPBakery. Perfect for Fashion, Clothing,', 'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    450, 2100, 'https://weadown.com/wp-content/uploads/2026/10/ecom-1-3-2-multipurpose-woocommerce-wordpress-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '1.3.2', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme Download | bdBeginner', 'Ecom is a conversion-focused WooCommerce theme built for modern online stores. Fully compatible with Elementor and WPBakery. Perfect for Fashion, Clothing,',
    24, now()
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

  DELETE FROM public.product_images WHERE product_id = 'dc80ae85-5ef3-49ad-b803-34ec59dc3014';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'https://weadown.com/wp-content/uploads/2026/10/ecom-1-3-2-multipurpose-woocommerce-wordpress-theme.jpg', 'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme - Cover Banner', 0),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme - Layout Showcase', 1),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme - Builder & Customizer', 2),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'dc80ae85-5ef3-49ad-b803-34ec59dc3014';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 16: Trueman 1.5.0 - Resume WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'e88a22ee-313e-4ecf-8112-d3f783aa45ae', v_wp_cat, 'Trueman 1.5.0 - Resume WordPress Theme', 'trueman-cv-resume-wordpress-theme', 'WP-THM-TRUEMANCVR-16',
    'Trueman – CV Resume WordPress Theme is best suited for developer, designer, programmer, freelancer, artist, coder, photography or any other digital', 'Trueman 1.5.0 - Resume WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Trueman 1.5.0 - Resume WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    390, 1650, 'https://weadown.com/wp-content/uploads/2025/01/trueman-1-3-1-cv-resume-wordpress-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '1.5.0', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Trueman 1.5.0 - Resume WordPress Theme Download | bdBeginner', 'Trueman – CV Resume WordPress Theme is best suited for developer, designer, programmer, freelancer, artist, coder, photography or any other digital',
    25, now()
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

  DELETE FROM public.product_images WHERE product_id = 'e88a22ee-313e-4ecf-8112-d3f783aa45ae';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'https://weadown.com/wp-content/uploads/2025/01/trueman-1-3-1-cv-resume-wordpress-theme.jpg', 'Trueman 1.5.0 - Resume WordPress Theme - Cover Banner', 0),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Trueman 1.5.0 - Resume WordPress Theme - Layout Showcase', 1),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Trueman 1.5.0 - Resume WordPress Theme - Builder & Customizer', 2),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Trueman 1.5.0 - Resume WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'e88a22ee-313e-4ecf-8112-d3f783aa45ae';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 17: Porto 7.9.5 - AI Powered WordPress Website & Shop Builder
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', v_wp_cat, 'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder', 'porto-wordpress-theme', 'WP-THM-PORTOWORDPR-17',
    'Porto is extremely customizable, easy to use and fully responsive. Suitable for every type of business, portfolio, blog and ecommerce sites. Porto guarantees', 'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Porto 7.9.5 - AI Powered WordPress Website & Shop Builder offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    490, 2400, 'https://weadown.com/wp-content/uploads/2024/05/porto-7-1-2-multipurpose-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '7.9.5', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder Download | bdBeginner', 'Porto is extremely customizable, easy to use and fully responsive. Suitable for every type of business, portfolio, blog and ecommerce sites. Porto guarantees',
    26, now()
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

  DELETE FROM public.product_images WHERE product_id = '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'https://weadown.com/wp-content/uploads/2024/05/porto-7-1-2-multipurpose-woocommerce-theme.jpg', 'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder - Cover Banner', 0),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder - Layout Showcase', 1),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder - Builder & Customizer', 2),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 18: Hub 7.0 - Responsive Multi-Purpose WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '4ebcc049-02cc-47fc-8b07-0ab3340ffff5', v_wp_cat, 'Hub 7.0 - Responsive Multi-Purpose WordPress Theme', 'hub-wordpress-theme', 'WP-THM-HUBWORDPRES-18',
    'Hub is the all-in-one builder with ultra high performance, an intuitive editor, exclusive features, and an award-winning design collection. It includes 80', 'Hub 7.0 - Responsive Multi-Purpose WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Hub 7.0 - Responsive Multi-Purpose WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    550, 2850, 'https://weadown.com/wp-content/uploads/2023/11/hub-4-2-1-responsive-multi-purpose-wordpress-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '7.0', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Hub 7.0 - Responsive Multi-Purpose WordPress Theme Download | bdBeginner', 'Hub is the all-in-one builder with ultra high performance, an intuitive editor, exclusive features, and an award-winning design collection. It includes 80',
    27, now()
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

  DELETE FROM public.product_images WHERE product_id = '4ebcc049-02cc-47fc-8b07-0ab3340ffff5';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'https://weadown.com/wp-content/uploads/2023/11/hub-4-2-1-responsive-multi-purpose-wordpress-theme.jpg', 'Hub 7.0 - Responsive Multi-Purpose WordPress Theme - Cover Banner', 0),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Hub 7.0 - Responsive Multi-Purpose WordPress Theme - Layout Showcase', 1),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Hub 7.0 - Responsive Multi-Purpose WordPress Theme - Builder & Customizer', 2),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Hub 7.0 - Responsive Multi-Purpose WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '4ebcc049-02cc-47fc-8b07-0ab3340ffff5';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 19: Besa 2.3.24 - Elementor Marketplace WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '16ed112a-289f-4d86-a1f1-29f68ce3e996', v_wp_cat, 'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme', 'besa-elementor-marketplace-woocommerce-theme', 'WP-THM-BESAELEMENT-19',
    'Besa rocks a handy mobile menu which will take your shoppers to their desired product effortlessly. Besa in total, you receive a whopping three hundred pages', 'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Besa 2.3.24 - Elementor Marketplace WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    450, 2200, 'https://weadown.com/wp-content/uploads/2023/04/besa-2-2-10-elementor-marketplace-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '2.3.24', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme Download | bdBeginner', 'Besa rocks a handy mobile menu which will take your shoppers to their desired product effortlessly. Besa in total, you receive a whopping three hundred pages',
    28, now()
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

  DELETE FROM public.product_images WHERE product_id = '16ed112a-289f-4d86-a1f1-29f68ce3e996';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'https://weadown.com/wp-content/uploads/2023/04/besa-2-2-10-elementor-marketplace-woocommerce-theme.jpg', 'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme - Cover Banner', 0),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme - Layout Showcase', 1),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme - Builder & Customizer', 2),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '16ed112a-289f-4d86-a1f1-29f68ce3e996';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 20: Machic 1.6.7 - Electronics Store WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '72f8bff7-0af4-4390-94c1-6d193e397ade', v_wp_cat, 'Machic 1.6.7 - Electronics Store WooCommerce Theme', 'machic-wordpress-theme', 'WP-THM-MACHICWORDP-20',
    'Machic theme can help you to build your own electronics store, fashion store, accessories shop, phone store, mobile shop, electronics multivendor, electronics', 'Machic 1.6.7 - Electronics Store WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Machic 1.6.7 - Electronics Store WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    390, 1850, 'https://weadown.com/wp-content/uploads/2023/06/machic-1-2-5-electronics-store-woocommerce-theme.png',
    'digital_download', 'digital_download', 'published', false, true,
    '1.6.7', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Machic 1.6.7 - Electronics Store WooCommerce Theme Download | bdBeginner', 'Machic theme can help you to build your own electronics store, fashion store, accessories shop, phone store, mobile shop, electronics multivendor, electronics',
    29, now()
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

  DELETE FROM public.product_images WHERE product_id = '72f8bff7-0af4-4390-94c1-6d193e397ade';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'https://weadown.com/wp-content/uploads/2023/06/machic-1-2-5-electronics-store-woocommerce-theme.png', 'Machic 1.6.7 - Electronics Store WooCommerce Theme - Cover Banner', 0),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Machic 1.6.7 - Electronics Store WooCommerce Theme - Layout Showcase', 1),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Machic 1.6.7 - Electronics Store WooCommerce Theme - Builder & Customizer', 2),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Machic 1.6.7 - Electronics Store WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '72f8bff7-0af4-4390-94c1-6d193e397ade';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 21: XStore 9.7.9 - Multipurpose WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', v_wp_cat, 'XStore 9.7.9 - Multipurpose WooCommerce Theme', 'xstore-wordpress-theme', 'WP-THM-XSTOREWORDP-21',
    'XStore is carefully developed and includes that set of pages, tools and settings that will help you create a professional looking and trustworthy online shop.', 'XStore 9.7.9 - Multipurpose WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, XStore 9.7.9 - Multipurpose WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    590, 2990, 'https://weadown.com/wp-content/uploads/2025/11/xstore-9-6-1-multipurpose-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '9.7.9', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'XStore 9.7.9 - Multipurpose WooCommerce Theme Download | bdBeginner', 'XStore is carefully developed and includes that set of pages, tools and settings that will help you create a professional looking and trustworthy online shop.',
    30, now()
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

  DELETE FROM public.product_images WHERE product_id = '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'https://weadown.com/wp-content/uploads/2025/11/xstore-9-6-1-multipurpose-woocommerce-theme.jpg', 'XStore 9.7.9 - Multipurpose WooCommerce Theme - Cover Banner', 0),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'XStore 9.7.9 - Multipurpose WooCommerce Theme - Layout Showcase', 1),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'XStore 9.7.9 - Multipurpose WooCommerce Theme - Builder & Customizer', 2),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'XStore 9.7.9 - Multipurpose WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 22: Masterstudy 4.8.161 - Education WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'd3c23ede-9163-4d57-827c-6a07068fdc6d', v_wp_cat, 'Masterstudy 4.8.161 - Education WordPress Theme', 'masterstudy-education-wordpress-theme', 'WP-THM-MASTERSTUDY-22',
    'MasterStudy is the best solution for Online Coaching, Instructors, Tutors, Courses marketplace, Language schools, private schools, universities and colleges.', 'Masterstudy 4.8.161 - Education WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, Masterstudy 4.8.161 - Education WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    490, 2500, 'https://weadown.com/wp-content/uploads/2023/07/masterstudy-4-8-7-education-wordpress-theme.png',
    'digital_download', 'digital_download', 'published', false, true,
    '4.8.161', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Masterstudy 4.8.161 - Education WordPress Theme Download | bdBeginner', 'MasterStudy is the best solution for Online Coaching, Instructors, Tutors, Courses marketplace, Language schools, private schools, universities and colleges.',
    31, now()
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

  DELETE FROM public.product_images WHERE product_id = 'd3c23ede-9163-4d57-827c-6a07068fdc6d';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'https://weadown.com/wp-content/uploads/2023/07/masterstudy-4-8-7-education-wordpress-theme.png', 'Masterstudy 4.8.161 - Education WordPress Theme - Cover Banner', 0),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Masterstudy 4.8.161 - Education WordPress Theme - Layout Showcase', 1),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Masterstudy 4.8.161 - Education WordPress Theme - Builder & Customizer', 2),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'Masterstudy 4.8.161 - Education WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'd3c23ede-9163-4d57-827c-6a07068fdc6d';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 23: BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '0a25d164-3bb4-4567-95a4-2ca231c6f173', v_wp_cat, 'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme', 'betheme-wordpress-theme', 'WP-THM-BETHEMEWORD-23',
    'BeTheme is the best product we ever did. This is more than just WordPress theme. Such advanced options panel and Drag & Drop builder tool give unlimited', 'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    550, 2800, 'https://weadown.com/wp-content/uploads/2025/02/betheme-27-6-3-responsive-multipurpose-wordpress-woocommerce-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '29.0.2.1', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme Download | bdBeginner', 'BeTheme is the best product we ever did. This is more than just WordPress theme. Such advanced options panel and Drag & Drop builder tool give unlimited',
    32, now()
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

  DELETE FROM public.product_images WHERE product_id = '0a25d164-3bb4-4567-95a4-2ca231c6f173';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'https://weadown.com/wp-content/uploads/2025/02/betheme-27-6-3-responsive-multipurpose-wordpress-woocommerce-theme.jpg', 'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme - Cover Banner', 0),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme - Layout Showcase', 1),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme - Builder & Customizer', 2),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = '0a25d164-3bb4-4567-95a4-2ca231c6f173';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Theme 24: GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'fce98fd7-d839-4229-8a0c-c8a3ba7408ad', v_wp_cat, 'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme', 'greenmart-wordpress-theme', 'WP-THM-GREENMARTWO-24',
    'GreenMart is an Organic & Food WooCommerce Theme that is flexible and customizable for setting and changing any elements within minutes via Powerful Theme', 'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme is a high-performance, professional WordPress theme engineered for speed, conversion, and creative flexibility. Built with modern web development standards, it seamlessly supports Elementor, Gutenberg block builder, and WooCommerce.

Whether you are launching an online store, a corporate business site, a personal portfolio, or a high-traffic blog, GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme offers pre-built responsive templates and one-click demo imports to launch your project effortlessly.

All theme files are 100% genuine and verified clean under the GNU General Public License (GPL). No license key is required for unlimited domain installations.',
    450, 2250, 'https://weadown.com/wp-content/uploads/2023/05/greenmart-4-1-2-organic-food-woocommerce-wordpress-theme.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '4.3.5', 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme Download | bdBeginner', 'GreenMart is an Organic & Food WooCommerce Theme that is flexible and customizable for setting and changing any elements within minutes via Powerful Theme',
    33, now()
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

  DELETE FROM public.product_images WHERE product_id = 'fce98fd7-d839-4229-8a0c-c8a3ba7408ad';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'https://weadown.com/wp-content/uploads/2023/05/greenmart-4-1-2-organic-food-woocommerce-wordpress-theme.jpg', 'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme - Cover Banner', 0),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80', 'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme - Layout Showcase', 1),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme - Builder & Customizer', 2),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme - Mobile Responsive View', 3);

  DELETE FROM public.product_features WHERE product_id = 'fce98fd7-d839-4229-8a0c-c8a3ba7408ad';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Mobile responsive layouts optimized for fast loading and Core Web Vitals', 2),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Elementor and WordPress block editor (Gutenberg) drag-and-drop ready', 3),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Built-in search engine optimization (SEO) and schema markup integration', 4),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Pre-built demo layouts and templates ready for 1-click import', 5),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Fully compatible with WooCommerce for modern online stores', 6);

  -- Plugin 1: Yoast Seo Premium 28.7 – WordPress SEO Plugin
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '108cb608-d31d-44c5-add0-10c80b04ea70', v_wp_cat, 'Yoast Seo Premium 28.7 – WordPress SEO Plugin', 'yoast-seo-premium-plugin', 'WP-PLG-YOASTSEOPR-1',
    'Yoast SEO Premium ensures that your site meets the highest technical SEO standards. Yoast SEO for WordPress also gives...', 'Yoast Seo Premium 28.7 – WordPress SEO Plugin is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Yoast SEO Premium ensures that your site meets the highest technical SEO standards. Yoast SEO for WordPress also gives...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1800, 'https://weadown.com/wp-content/uploads/2026/08/Yoast-Seo-Premium-WordPress-SEO-Plugin.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '28.7', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Yoast Seo Premium 28.7 – WordPress SEO Plugin Download | bdBeginner', 'Yoast SEO Premium ensures that your site meets the highest technical SEO standards. Yoast SEO for WordPress also gives...',
    40, now()
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

  DELETE FROM public.product_images WHERE product_id = '108cb608-d31d-44c5-add0-10c80b04ea70';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'https://weadown.com/wp-content/uploads/2026/08/Yoast-Seo-Premium-WordPress-SEO-Plugin.jpg', 'Yoast Seo Premium 28.7 – WordPress SEO Plugin - Cover Banner', 0),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Yoast Seo Premium 28.7 – WordPress SEO Plugin - Admin Dashboard Preview', 1),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Yoast Seo Premium 28.7 – WordPress SEO Plugin - Settings & Controls', 2),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Yoast Seo Premium 28.7 – WordPress SEO Plugin - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '108cb608-d31d-44c5-add0-10c80b04ea70';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'All premium features unlocked without domain restrictions', 2),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'Lightweight, clean code optimized for server speed and security', 3),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('108cb608-d31d-44c5-add0-10c80b04ea70', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 2: Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '0e14c91a-4e99-4956-aa43-9de79a68aabe', v_wp_cat, 'Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress', 'dokan-pro-wordpress-plugin', 'WP-PLG-DOKANPROWO-2',
    'Dokan Pro enables you to build multi-seller or multi-vendor e-commerce solution with WordPress. Dokan Business can start your own...', 'Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Dokan Pro enables you to build multi-seller or multi-vendor e-commerce solution with WordPress. Dokan Business can start your own...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    450, 2200, 'https://weadown.com/wp-content/uploads/2025/03/Dokan-Pro-Multivendor-Marketplace-Plugin-for-WordPress.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '5.3.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress Download | bdBeginner', 'Dokan Pro enables you to build multi-seller or multi-vendor e-commerce solution with WordPress. Dokan Business can start your own...',
    41, now()
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

  DELETE FROM public.product_images WHERE product_id = '0e14c91a-4e99-4956-aa43-9de79a68aabe';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'https://weadown.com/wp-content/uploads/2025/03/Dokan-Pro-Multivendor-Marketplace-Plugin-for-WordPress.jpg', 'Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress - Cover Banner', 0),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress - Admin Dashboard Preview', 1),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress - Settings & Controls', 2),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Dokan Pro 5.3.1 + Booking 1.4.5 + Theme – Multivendor Marketplace Plugin for WordPress - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '0e14c91a-4e99-4956-aa43-9de79a68aabe';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'All premium features unlocked without domain restrictions', 2),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'Lightweight, clean code optimized for server speed and security', 3),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('0e14c91a-4e99-4956-aa43-9de79a68aabe', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 3: Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '816e96a9-4792-4c0d-a163-8f4977da0881', v_wp_cat, 'Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin', 'divi-supreme-pro-plugin', 'WP-PLG-DIVISUPREME-3',
    'Divi Supreme Pro design and create creative digital products and child themes for Divi. Take Divi to the next...', 'Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Divi Supreme Pro design and create creative digital products and child themes for Divi. Take Divi to the next...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    490, 2500, 'https://weadown.com/wp-content/uploads/2023/07/divi-supreme-pro-4961-divi-plugin-for-building-amazing-divi-websites.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '5.0.83', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin Download | bdBeginner', 'Divi Supreme Pro design and create creative digital products and child themes for Divi. Take Divi to the next...',
    42, now()
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

  DELETE FROM public.product_images WHERE product_id = '816e96a9-4792-4c0d-a163-8f4977da0881';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'https://weadown.com/wp-content/uploads/2023/07/divi-supreme-pro-4961-divi-plugin-for-building-amazing-divi-websites.jpg', 'Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin - Cover Banner', 0),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin - Admin Dashboard Preview', 1),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin - Settings & Controls', 2),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Divi Supreme Pro 5.0.83 – Modules & Extensions Plugin - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '816e96a9-4792-4c0d-a163-8f4977da0881';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'All premium features unlocked without domain restrictions', 2),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'Lightweight, clean code optimized for server speed and security', 3),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('816e96a9-4792-4c0d-a163-8f4977da0881', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 4: Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '005e4992-f1a3-42ac-abcb-968742ae5b11', v_wp_cat, 'Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin', 'ultimate-dashboard-pro', 'WP-PLG-ULTIMATEDAS-4',
    'Ultimate Dashboard Pro you can completely change the look of the admin area.
Demo Ultimate Dashboard Pro WordPress Plugin

Ultimate Dashboard...', 'Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Ultimate Dashboard Pro you can completely change the look of the admin area.
Demo Ultimate Dashboard Pro WordPress Plugin

Ultimate Dashboard...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1900, 'https://weadown.com/wp-content/uploads/2024/01/ultimate-dashboard-pro-380-custom-wordpress-dashboard-plugin.png',
    'digital_download', 'digital_download', 'published', true, true,
    '3.11.4', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin Download | bdBeginner', 'Ultimate Dashboard Pro you can completely change the look of the admin area.
Demo Ultimate Dashboard Pro WordPress Plugin

Ultimate Dashboard...',
    43, now()
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

  DELETE FROM public.product_images WHERE product_id = '005e4992-f1a3-42ac-abcb-968742ae5b11';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'https://weadown.com/wp-content/uploads/2024/01/ultimate-dashboard-pro-380-custom-wordpress-dashboard-plugin.png', 'Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin - Cover Banner', 0),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin - Admin Dashboard Preview', 1),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin - Settings & Controls', 2),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Ultimate Dashboard Pro 3.11.4 – Custom WordPress Dashboard Plugin - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '005e4992-f1a3-42ac-abcb-968742ae5b11';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'All premium features unlocked without domain restrictions', 2),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'Lightweight, clean code optimized for server speed and security', 3),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('005e4992-f1a3-42ac-abcb-968742ae5b11', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 5: CheckoutWC 11.4.1 – Woocommerce Checkout Plugin
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '5f630469-f9b0-436b-a02d-2fbb9a3d2849', v_wp_cat, 'CheckoutWC 11.4.1 – Woocommerce Checkout Plugin', 'checkoutwc-woocommerce-plugin', 'WP-PLG-CHECKOUTWCW-5',
    'CheckoutWC is a plugin for WooCommerce that replaces your checkout page with a Shopify-style cart and checkout page. Proven to increase sales and...', 'CheckoutWC 11.4.1 – Woocommerce Checkout Plugin is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

CheckoutWC is a plugin for WooCommerce that replaces your checkout page with a Shopify-style cart and checkout page. Proven to increase sales and...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    450, 2300, 'https://weadown.com/wp-content/uploads/2023/04/checkoutwc-7108-woocommerce-checkout-plugin.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '11.4.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'CheckoutWC 11.4.1 – Woocommerce Checkout Plugin Download | bdBeginner', 'CheckoutWC is a plugin for WooCommerce that replaces your checkout page with a Shopify-style cart and checkout page. Proven to increase sales and...',
    44, now()
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

  DELETE FROM public.product_images WHERE product_id = '5f630469-f9b0-436b-a02d-2fbb9a3d2849';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'https://weadown.com/wp-content/uploads/2023/04/checkoutwc-7108-woocommerce-checkout-plugin.jpg', 'CheckoutWC 11.4.1 – Woocommerce Checkout Plugin - Cover Banner', 0),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'CheckoutWC 11.4.1 – Woocommerce Checkout Plugin - Admin Dashboard Preview', 1),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'CheckoutWC 11.4.1 – Woocommerce Checkout Plugin - Settings & Controls', 2),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'CheckoutWC 11.4.1 – Woocommerce Checkout Plugin - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '5f630469-f9b0-436b-a02d-2fbb9a3d2849';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'All premium features unlocked without domain restrictions', 2),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'Lightweight, clean code optimized for server speed and security', 3),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('5f630469-f9b0-436b-a02d-2fbb9a3d2849', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 6: Unlimited Elements for Elementor Premium 2.0.24
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'dea7a6df-212b-447e-a631-279ec350c8dc', v_wp_cat, 'Unlimited Elements for Elementor Premium 2.0.24', 'unlimited-elements-for-elementor', 'WP-PLG-UNLIMITEDEL-6',
    'Unlimited Elements for Elementor Premium is the biggest and best elements library now available for both Elementor and WordPress,...', 'Unlimited Elements for Elementor Premium 2.0.24 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Unlimited Elements for Elementor Premium is the biggest and best elements library now available for both Elementor and WordPress,...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    590, 2900, 'https://weadown.com/wp-content/uploads/2023/11/unlimited-elements-for-elementor-premium-1588.jpg',
    'digital_download', 'digital_download', 'published', true, true,
    '2.0.24', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Unlimited Elements for Elementor Premium 2.0.24 Download | bdBeginner', 'Unlimited Elements for Elementor Premium is the biggest and best elements library now available for both Elementor and WordPress,...',
    45, now()
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

  DELETE FROM public.product_images WHERE product_id = 'dea7a6df-212b-447e-a631-279ec350c8dc';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'https://weadown.com/wp-content/uploads/2023/11/unlimited-elements-for-elementor-premium-1588.jpg', 'Unlimited Elements for Elementor Premium 2.0.24 - Cover Banner', 0),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Unlimited Elements for Elementor Premium 2.0.24 - Admin Dashboard Preview', 1),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Unlimited Elements for Elementor Premium 2.0.24 - Settings & Controls', 2),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Unlimited Elements for Elementor Premium 2.0.24 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'dea7a6df-212b-447e-a631-279ec350c8dc';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'All premium features unlocked without domain restrictions', 2),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'Lightweight, clean code optimized for server speed and security', 3),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('dea7a6df-212b-447e-a631-279ec350c8dc', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 7: Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'ab897a7f-42f3-4a73-a765-6bc8012c4312', v_wp_cat, 'Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58', 'slider-revolution-wordpress-plugin', 'WP-PLG-SLIDERREVOL-7',
    'Slider Revolution is a new way to build rich & dynamic content for your websites. With our powerful visual...', 'Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Slider Revolution is a new way to build rich & dynamic content for your websites. With our powerful visual...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    490, 2400, 'https://weadown.com/wp-content/uploads/2026/03/Slider-Revolution-Responsive-WordPress-Plugin.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '7.2.4', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58 Download | bdBeginner', 'Slider Revolution is a new way to build rich & dynamic content for your websites. With our powerful visual...',
    46, now()
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

  DELETE FROM public.product_images WHERE product_id = 'ab897a7f-42f3-4a73-a765-6bc8012c4312';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'https://weadown.com/wp-content/uploads/2026/03/Slider-Revolution-Responsive-WordPress-Plugin.jpg', 'Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58 - Cover Banner', 0),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58 - Admin Dashboard Preview', 1),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58 - Settings & Controls', 2),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Slider Revolution Responsive WordPress Plugin 7.2.4 + RevSlider 6.7.58 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'ab897a7f-42f3-4a73-a765-6bc8012c4312';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'All premium features unlocked without domain restrictions', 2),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'Lightweight, clean code optimized for server speed and security', 3),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('ab897a7f-42f3-4a73-a765-6bc8012c4312', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 8: MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '2f1d4eb0-a1de-42ba-a244-66076557a821', v_wp_cat, 'MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress', 'mailpoet-wordpress-plugin-5-14-0', 'WP-PLG-MAILPOETWOR-8',
    'MailPoet Pro Better Email for WordPress-Powered Websites. Send beautiful emails that reach inboxes every time, and create loyal subscribers.
Demo...', 'MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

MailPoet Pro Better Email for WordPress-Powered Websites. Send beautiful emails that reach inboxes every time, and create loyal subscribers.
Demo...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1850, 'https://weadown.com/wp-content/uploads/2024/10/MailPoet-Premium-Email-Marketing-Plugin-for-WordPress.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '5.42.0', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress Download | bdBeginner', 'MailPoet Pro Better Email for WordPress-Powered Websites. Send beautiful emails that reach inboxes every time, and create loyal subscribers.
Demo...',
    47, now()
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

  DELETE FROM public.product_images WHERE product_id = '2f1d4eb0-a1de-42ba-a244-66076557a821';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'https://weadown.com/wp-content/uploads/2024/10/MailPoet-Premium-Email-Marketing-Plugin-for-WordPress.jpg', 'MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress - Cover Banner', 0),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress - Admin Dashboard Preview', 1),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress - Settings & Controls', 2),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'MailPoet Pro 5.42.0 – Email Marketing Plugin for WordPress - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '2f1d4eb0-a1de-42ba-a244-66076557a821';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'All premium features unlocked without domain restrictions', 2),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'Lightweight, clean code optimized for server speed and security', 3),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('2f1d4eb0-a1de-42ba-a244-66076557a821', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 9: Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'bf10f39c-bb9e-4c17-a917-c3d7224be6c9', v_wp_cat, 'Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin', 'element-pack-pro-addon', 'WP-PLG-ELEMENTPACK-9',
    'Element Pack Free Download Latest Version ultimate essential addons for Elementor Page Builder with 185 of the most popular...', 'Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Element Pack Free Download Latest Version ultimate essential addons for Elementor Page Builder with 185 of the most popular...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    450, 2250, 'https://weadown.com/wp-content/uploads/2023/11/element-pack-7-6-1-addon-for-elementor-page-builder-wordpress-plugin.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '10.0.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin Download | bdBeginner', 'Element Pack Free Download Latest Version ultimate essential addons for Elementor Page Builder with 185 of the most popular...',
    48, now()
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

  DELETE FROM public.product_images WHERE product_id = 'bf10f39c-bb9e-4c17-a917-c3d7224be6c9';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'https://weadown.com/wp-content/uploads/2023/11/element-pack-7-6-1-addon-for-elementor-page-builder-wordpress-plugin.jpg', 'Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin - Cover Banner', 0),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin - Admin Dashboard Preview', 1),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin - Settings & Controls', 2),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Element Pack 10.0.1 – Addon for Elementor Page Builder WordPress Plugin - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'bf10f39c-bb9e-4c17-a917-c3d7224be6c9';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'All premium features unlocked without domain restrictions', 2),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'Lightweight, clean code optimized for server speed and security', 3),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('bf10f39c-bb9e-4c17-a917-c3d7224be6c9', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 10: CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'd8aa9655-f496-4a85-af48-8626fd40e765', v_wp_cat, 'CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress', 'crocobuilder-wordpress-builder-plugin', 'WP-PLG-CROCOBUILDER-10',
    'CrocoBuilder is an AI-native frontend builder for WordPress that provides developers with atomic DOM output, unified CSS control, and...', 'CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

CrocoBuilder is an AI-native frontend builder for WordPress that provides developers with atomic DOM output, unified CSS control, and...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    490, 2600, 'https://weadown.com/wp-content/uploads/2026/07/CrocoBuilder-WordPress-AI-Native-Frontend-Builder-Plugin.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '1.0.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress Download | bdBeginner', 'CrocoBuilder is an AI-native frontend builder for WordPress that provides developers with atomic DOM output, unified CSS control, and...',
    49, now()
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

  DELETE FROM public.product_images WHERE product_id = 'd8aa9655-f496-4a85-af48-8626fd40e765';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'https://weadown.com/wp-content/uploads/2026/07/CrocoBuilder-WordPress-AI-Native-Frontend-Builder-Plugin.jpg', 'CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress - Cover Banner', 0),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress - Admin Dashboard Preview', 1),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress - Settings & Controls', 2),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'CrocoBuilder 1.0.1 – AI-Native Frontend Builder for WordPress - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'd8aa9655-f496-4a85-af48-8626fd40e765';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'All premium features unlocked without domain restrictions', 2),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'Lightweight, clean code optimized for server speed and security', 3),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('d8aa9655-f496-4a85-af48-8626fd40e765', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 11: FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '0eae177f-5c8d-4b2b-affb-8157b8182761', v_wp_cat, 'FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin', 'fluentcrm-pro-wordpress-plugin', 'WP-PLG-FLUENTCRMPR-11',
    'FluentCRM Pro is a Self Hosted Email Marketing Automation Plugin for WordPress. Manage your leads and customers, email campaigns,...', 'FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

FluentCRM Pro is a Self Hosted Email Marketing Automation Plugin for WordPress. Manage your leads and customers, email campaigns,...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    550, 2800, 'https://weadown.com/wp-content/uploads/2026/07/FluentCRM-Pro-Marketing-Automation-For-WordPress-Plugin.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '3.2.6', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin Download | bdBeginner', 'FluentCRM Pro is a Self Hosted Email Marketing Automation Plugin for WordPress. Manage your leads and customers, email campaigns,...',
    50, now()
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

  DELETE FROM public.product_images WHERE product_id = '0eae177f-5c8d-4b2b-affb-8157b8182761';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'https://weadown.com/wp-content/uploads/2026/07/FluentCRM-Pro-Marketing-Automation-For-WordPress-Plugin.jpg', 'FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin - Cover Banner', 0),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin - Admin Dashboard Preview', 1),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin - Settings & Controls', 2),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'FluentCRM Pro 3.2.6 – Marketing Automation For WordPress Plugin - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '0eae177f-5c8d-4b2b-affb-8157b8182761';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'All premium features unlocked without domain restrictions', 2),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'Lightweight, clean code optimized for server speed and security', 3),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('0eae177f-5c8d-4b2b-affb-8157b8182761', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 12: Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '384a87f1-97c4-4489-a5d6-292425236a92', v_wp_cat, 'Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress', 'fluent-boards-pro-wordpress-plugin', 'WP-PLG-FLUENTBOARD-12',
    'Gain complete control over your projects with Fluent Boards Pro, the simplest solution specifically crafted for WordPress. Get it...', 'Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Gain complete control over your projects with Fluent Boards Pro, the simplest solution specifically crafted for WordPress. Get it...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1950, 'https://weadown.com/wp-content/uploads/2024/07/Fluent-Boards-Pro-1.20-Project-Management-Plugin-for-WordPress.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '2.2.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress Download | bdBeginner', 'Gain complete control over your projects with Fluent Boards Pro, the simplest solution specifically crafted for WordPress. Get it...',
    51, now()
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

  DELETE FROM public.product_images WHERE product_id = '384a87f1-97c4-4489-a5d6-292425236a92';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'https://weadown.com/wp-content/uploads/2024/07/Fluent-Boards-Pro-1.20-Project-Management-Plugin-for-WordPress.jpg', 'Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress - Cover Banner', 0),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress - Admin Dashboard Preview', 1),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress - Settings & Controls', 2),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Fluent Boards Pro 2.2.1 – Project Management Plugin for WordPress - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '384a87f1-97c4-4489-a5d6-292425236a92';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'All premium features unlocked without domain restrictions', 2),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'Lightweight, clean code optimized for server speed and security', 3),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('384a87f1-97c4-4489-a5d6-292425236a92', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 13: JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '6908790c-deab-4023-adff-a9c377bd1a5e', v_wp_cat, 'JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor', 'jet-engine-plugin-elementor', 'WP-PLG-JETENGINEP-13',
    'JetEngine – Adding & Editing Dynamic Content with Elementor is a must-have plugin for Elementor Page Builder allowing to...', 'JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

JetEngine – Adding & Editing Dynamic Content with Elementor is a must-have plugin for Elementor Page Builder allowing to...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    450, 2350, 'https://weadown.com/wp-content/uploads/2023/04/JetEngine-3.1.4-–-WordPress-Dynamic-Content-Plugin-for-Elementor.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '3.9.0', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor Download | bdBeginner', 'JetEngine – Adding & Editing Dynamic Content with Elementor is a must-have plugin for Elementor Page Builder allowing to...',
    52, now()
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

  DELETE FROM public.product_images WHERE product_id = '6908790c-deab-4023-adff-a9c377bd1a5e';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'https://weadown.com/wp-content/uploads/2023/04/JetEngine-3.1.4-–-WordPress-Dynamic-Content-Plugin-for-Elementor.jpg', 'JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor - Cover Banner', 0),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor - Admin Dashboard Preview', 1),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor - Settings & Controls', 2),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'JetEngine 3.9.0 + External Modules – WordPress Dynamic Content Plugin for Elementor - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '6908790c-deab-4023-adff-a9c377bd1a5e';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'All premium features unlocked without domain restrictions', 2),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'Lightweight, clean code optimized for server speed and security', 3),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('6908790c-deab-4023-adff-a9c377bd1a5e', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 14: Instagram Feed Pro WordPress Plugin 6.14.1
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '4a983b63-794d-4c0c-a9ae-014891488419', v_wp_cat, 'Instagram Feed Pro WordPress Plugin 6.14.1', 'instagram-feed-pro-plugin-full', 'WP-PLG-INSTAGRAMFE-14',
    'Instagram Feed Pro Keep your website looking fresh with new Instagram content.
Demo Instagram Feed Pro WordPress Plugin

Instagram Feed Pro...', 'Instagram Feed Pro WordPress Plugin 6.14.1 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Instagram Feed Pro Keep your website looking fresh with new Instagram content.
Demo Instagram Feed Pro WordPress Plugin

Instagram Feed Pro...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    490, 2500, 'https://weadown.com/wp-content/uploads/2023/05/instagram-feed-pro-623-instagram-feeds-wordpress-plugin.webp',
    'digital_download', 'digital_download', 'published', false, true,
    '6.14.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Instagram Feed Pro WordPress Plugin 6.14.1 Download | bdBeginner', 'Instagram Feed Pro Keep your website looking fresh with new Instagram content.
Demo Instagram Feed Pro WordPress Plugin

Instagram Feed Pro...',
    53, now()
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

  DELETE FROM public.product_images WHERE product_id = '4a983b63-794d-4c0c-a9ae-014891488419';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'https://weadown.com/wp-content/uploads/2023/05/instagram-feed-pro-623-instagram-feeds-wordpress-plugin.webp', 'Instagram Feed Pro WordPress Plugin 6.14.1 - Cover Banner', 0),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Instagram Feed Pro WordPress Plugin 6.14.1 - Admin Dashboard Preview', 1),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Instagram Feed Pro WordPress Plugin 6.14.1 - Settings & Controls', 2),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Instagram Feed Pro WordPress Plugin 6.14.1 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '4a983b63-794d-4c0c-a9ae-014891488419';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'All premium features unlocked without domain restrictions', 2),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'Lightweight, clean code optimized for server speed and security', 3),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('4a983b63-794d-4c0c-a9ae-014891488419', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 15: WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'cbd06589-9a3b-4188-aba4-138c3d78f0e8', v_wp_cat, 'WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress', 'wp-funnels-pro-wordpress-plugin', 'WP-PLG-WPFUNNELSP-15',
    'WPFunnels Pro to create high converting landing pages, sales funnels, and checkout flows in minutes. Drag & Drop Sales...', 'WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

WPFunnels Pro to create high converting landing pages, sales funnels, and checkout flows in minutes. Drag & Drop Sales...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    590, 3100, 'https://weadown.com/wp-content/uploads/2024/11/WP-Funnels-Pro-Marketing-Funnel-Automation-In-WordPress.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '2.10.3', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress Download | bdBeginner', 'WPFunnels Pro to create high converting landing pages, sales funnels, and checkout flows in minutes. Drag & Drop Sales...',
    54, now()
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

  DELETE FROM public.product_images WHERE product_id = 'cbd06589-9a3b-4188-aba4-138c3d78f0e8';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'https://weadown.com/wp-content/uploads/2024/11/WP-Funnels-Pro-Marketing-Funnel-Automation-In-WordPress.jpg', 'WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress - Cover Banner', 0),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress - Admin Dashboard Preview', 1),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress - Settings & Controls', 2),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'WP Funnels Pro 2.10.3 – Marketing Funnel Automation In WordPress - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'cbd06589-9a3b-4188-aba4-138c3d78f0e8';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'All premium features unlocked without domain restrictions', 2),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'Lightweight, clean code optimized for server speed and security', 3),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('cbd06589-9a3b-4188-aba4-138c3d78f0e8', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 16: WP Security Ninja Premium 5.305
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', v_wp_cat, 'WP Security Ninja Premium 5.305', 'wp-security-ninja-premium', 'WP-PLG-WPSECURITY-16',
    'WP Security Ninja Pro steps in as your silent guardian. With its hassle-free setup and comprehensive coverage, you can...', 'WP Security Ninja Premium 5.305 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

WP Security Ninja Pro steps in as your silent guardian. With its hassle-free setup and comprehensive coverage, you can...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1800, 'https://weadown.com/wp-content/uploads/2024/06/WP-Security-Ninja-Premium-5.188.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '5.305', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'WP Security Ninja Premium 5.305 Download | bdBeginner', 'WP Security Ninja Pro steps in as your silent guardian. With its hassle-free setup and comprehensive coverage, you can...',
    55, now()
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

  DELETE FROM public.product_images WHERE product_id = '8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'https://weadown.com/wp-content/uploads/2024/06/WP-Security-Ninja-Premium-5.188.jpg', 'WP Security Ninja Premium 5.305 - Cover Banner', 0),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'WP Security Ninja Premium 5.305 - Admin Dashboard Preview', 1),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'WP Security Ninja Premium 5.305 - Settings & Controls', 2),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'WP Security Ninja Premium 5.305 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'All premium features unlocked without domain restrictions', 2),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'Lightweight, clean code optimized for server speed and security', 3),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('8fc116c7-3c9c-4c3c-a9aa-b18969e9d49f', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 17: PowerPack Pro for Elementor 3.1.1
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'de53733b-a2fd-4801-a774-8293298bdc1d', v_wp_cat, 'PowerPack Pro for Elementor 3.1.1', 'powerpack-for-elements', 'WP-PLG-POWERPACKFO-17',
    'PowerPack Pro for Elementor  is extends the Elementor Page Builder plugin with custom widgets, features, and templates. Get access...', 'PowerPack Pro for Elementor 3.1.1 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

PowerPack Pro for Elementor  is extends the Elementor Page Builder plugin with custom widgets, features, and templates. Get access...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    450, 2200, 'https://weadown.com/wp-content/uploads/2023/11/powerpack-for-elements-2105-addons-for-elementor.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '3.1.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'PowerPack Pro for Elementor 3.1.1 Download | bdBeginner', 'PowerPack Pro for Elementor  is extends the Elementor Page Builder plugin with custom widgets, features, and templates. Get access...',
    56, now()
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

  DELETE FROM public.product_images WHERE product_id = 'de53733b-a2fd-4801-a774-8293298bdc1d';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'https://weadown.com/wp-content/uploads/2023/11/powerpack-for-elements-2105-addons-for-elementor.jpg', 'PowerPack Pro for Elementor 3.1.1 - Cover Banner', 0),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'PowerPack Pro for Elementor 3.1.1 - Admin Dashboard Preview', 1),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'PowerPack Pro for Elementor 3.1.1 - Settings & Controls', 2),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'PowerPack Pro for Elementor 3.1.1 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'de53733b-a2fd-4801-a774-8293298bdc1d';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'All premium features unlocked without domain restrictions', 2),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'Lightweight, clean code optimized for server speed and security', 3),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('de53733b-a2fd-4801-a774-8293298bdc1d', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 18: Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', v_wp_cat, 'Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits', 'elementor-pro-builder-template-kits', 'WP-PLG-ELEMENTORPR-18',
    'Elementor Pro with your favorite or customized theme. Change themes and still keep all your designs. Landing pages, homepages, posts,...', 'Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.

Elementor Pro with your favorite or customized theme. Change themes and still keep all your designs. Landing pages, homepages, posts,...

Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    490, 2450, 'https://weadown.com/wp-content/uploads/2026/07/Elementor-Pro-–-WordPress-Page-Builder-Plugin.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '4.3.2', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits Download | bdBeginner', 'Elementor Pro with your favorite or customized theme. Change themes and still keep all your designs. Landing pages, homepages, posts,...',
    57, now()
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

  DELETE FROM public.product_images WHERE product_id = '7072eaf1-b35f-440d-a1fc-7ab1e8740ea7';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'https://weadown.com/wp-content/uploads/2026/07/Elementor-Pro-–-WordPress-Page-Builder-Plugin.jpg', 'Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits - Cover Banner', 0),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits - Admin Dashboard Preview', 1),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits - Settings & Controls', 2),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Elementor Pro 4.3.2 – WordPress Page Builder Plugin – Template Kits - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '7072eaf1-b35f-440d-a1fc-7ab1e8740ea7';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'All premium features unlocked without domain restrictions', 2),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'Lightweight, clean code optimized for server speed and security', 3),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('7072eaf1-b35f-440d-a1fc-7ab1e8740ea7', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 19: WP Courseware 4.18.4 – Course Builder for WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', v_wp_cat, 'WP Courseware 4.18.4 – Course Builder for WordPress', 'wp-courseware-plugin', 'WP-PLG-WPCOURSEWAR-19',
    'WP Courseware 4.18.4 – Course Builder for WordPress', 'WP Courseware 4.18.4 – Course Builder for WordPress is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1900, 'https://weadown.com/wp-content/uploads/2023/06/wp-courseware-4-9-11-wordpress-lms-plugin-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '4.18.4', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'WP Courseware 4.18.4 – Course Builder for WordPress Download | bdBeginner', 'WP Courseware 4.18.4 – Course Builder for WordPress',
    58, now()
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

  DELETE FROM public.product_images WHERE product_id = '989eb7d5-b23a-4a7e-a20b-7c8f03cfac56';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'https://weadown.com/wp-content/uploads/2023/06/wp-courseware-4-9-11-wordpress-lms-plugin-300x153.jpg', 'WP Courseware 4.18.4 – Course Builder for WordPress - Cover Banner', 0),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'WP Courseware 4.18.4 – Course Builder for WordPress - Admin Dashboard Preview', 1),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'WP Courseware 4.18.4 – Course Builder for WordPress - Settings & Controls', 2),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'WP Courseware 4.18.4 – Course Builder for WordPress - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '989eb7d5-b23a-4a7e-a20b-7c8f03cfac56';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'All premium features unlocked without domain restrictions', 2),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'Lightweight, clean code optimized for server speed and security', 3),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('989eb7d5-b23a-4a7e-a20b-7c8f03cfac56', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 20: FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '01f31bb5-8ac3-417f-ae81-03d72f4085ac', v_wp_cat, 'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin', 'fibofilters-pro-woocommerce-product-filters', 'WP-PLG-FIBOFILTERS-20',
    'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin', 'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    450, 2300, 'https://weadown.com/wp-content/uploads/2025/03/FiboFilters-Pro-WooCommerce-Product-Filters-Plugin-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '1.13.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin Download | bdBeginner', 'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin',
    59, now()
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

  DELETE FROM public.product_images WHERE product_id = '01f31bb5-8ac3-417f-ae81-03d72f4085ac';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'https://weadown.com/wp-content/uploads/2025/03/FiboFilters-Pro-WooCommerce-Product-Filters-Plugin-300x153.jpg', 'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin - Cover Banner', 0),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin - Admin Dashboard Preview', 1),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin - Settings & Controls', 2),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'FiboFilters Pro 1.13.1 – WooCommerce Product Filters Plugin - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '01f31bb5-8ac3-417f-ae81-03d72f4085ac';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'All premium features unlocked without domain restrictions', 2),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'Lightweight, clean code optimized for server speed and security', 3),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('01f31bb5-8ac3-417f-ae81-03d72f4085ac', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 21: UPS Shipping Method for WooCommerce 3.9.18
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'ce86197c-8343-4297-a5c1-7380cf6d818c', v_wp_cat, 'UPS Shipping Method for WooCommerce 3.9.18', 'woocommerce-ups-shipping-method', 'WP-PLG-WOOCOMMERCE-21',
    'UPS Shipping Method for WooCommerce 3.9.18', 'UPS Shipping Method for WooCommerce 3.9.18 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    550, 2750, 'https://weadown.com/wp-content/uploads/2025/01/UPS-Shipping-Method-for-WooCommerce-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '3.9.18', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'UPS Shipping Method for WooCommerce 3.9.18 Download | bdBeginner', 'UPS Shipping Method for WooCommerce 3.9.18',
    60, now()
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

  DELETE FROM public.product_images WHERE product_id = 'ce86197c-8343-4297-a5c1-7380cf6d818c';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'https://weadown.com/wp-content/uploads/2025/01/UPS-Shipping-Method-for-WooCommerce-300x153.jpg', 'UPS Shipping Method for WooCommerce 3.9.18 - Cover Banner', 0),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'UPS Shipping Method for WooCommerce 3.9.18 - Admin Dashboard Preview', 1),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'UPS Shipping Method for WooCommerce 3.9.18 - Settings & Controls', 2),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'UPS Shipping Method for WooCommerce 3.9.18 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'ce86197c-8343-4297-a5c1-7380cf6d818c';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'All premium features unlocked without domain restrictions', 2),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'Lightweight, clean code optimized for server speed and security', 3),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('ce86197c-8343-4297-a5c1-7380cf6d818c', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 22: FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '889677f4-1732-4a56-ada5-9ef11f5bc527', v_wp_cat, 'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5', 'fox-woocommerce-currency-switcher-professional-multi-currency-woocs', 'WP-PLG-FOXWOOCOMME-22',
    'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5', 'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    490, 2500, 'https://weadown.com/wp-content/uploads/2023/08/fox-2-4-1-woocommerce-currency-switcher-professional-multi-currency-woocs-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '2.5.5', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5 Download | bdBeginner', 'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5',
    61, now()
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

  DELETE FROM public.product_images WHERE product_id = '889677f4-1732-4a56-ada5-9ef11f5bc527';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'https://weadown.com/wp-content/uploads/2023/08/fox-2-4-1-woocommerce-currency-switcher-professional-multi-currency-woocs-300x153.jpg', 'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5 - Cover Banner', 0),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5 - Admin Dashboard Preview', 1),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5 - Settings & Controls', 2),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'FOX – WooCommerce Currency Switcher Professional – Multi Currency [WOOCS] 2.5.5 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '889677f4-1732-4a56-ada5-9ef11f5bc527';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'All premium features unlocked without domain restrictions', 2),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'Lightweight, clean code optimized for server speed and security', 3),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('889677f4-1732-4a56-ada5-9ef11f5bc527', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 23: Media Cleaner Pro 7.3.1
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '9f049b26-d4e9-44b3-a195-4e585bfbddad', v_wp_cat, 'Media Cleaner Pro 7.3.1', 'media-cleaner-pro', 'WP-PLG-MEDIACLEANE-23',
    'Media Cleaner Pro 7.3.1', 'Media Cleaner Pro 7.3.1 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1850, 'https://weadown.com/wp-content/uploads/2023/06/media-cleaner-pro-664-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '7.3.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Media Cleaner Pro 7.3.1 Download | bdBeginner', 'Media Cleaner Pro 7.3.1',
    62, now()
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

  DELETE FROM public.product_images WHERE product_id = '9f049b26-d4e9-44b3-a195-4e585bfbddad';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'https://weadown.com/wp-content/uploads/2023/06/media-cleaner-pro-664-300x153.jpg', 'Media Cleaner Pro 7.3.1 - Cover Banner', 0),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'Media Cleaner Pro 7.3.1 - Admin Dashboard Preview', 1),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Media Cleaner Pro 7.3.1 - Settings & Controls', 2),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Media Cleaner Pro 7.3.1 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '9f049b26-d4e9-44b3-a195-4e585bfbddad';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'All premium features unlocked without domain restrictions', 2),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'Lightweight, clean code optimized for server speed and security', 3),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('9f049b26-d4e9-44b3-a195-4e585bfbddad', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 24: Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'bb45cd33-a935-4ddc-ace6-06ac4d88adc9', v_wp_cat, 'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce', 'flexible-shipping-pro-woocommerce', 'WP-PLG-FLEXIBLESHI-24',
    'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce', 'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    450, 2250, 'https://weadown.com/wp-content/uploads/2023/06/flexible-shipping-pro-woocommerce-2-16-1-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '4.1.4', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce Download | bdBeginner', 'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce',
    63, now()
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

  DELETE FROM public.product_images WHERE product_id = 'bb45cd33-a935-4ddc-ace6-06ac4d88adc9';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'https://weadown.com/wp-content/uploads/2023/06/flexible-shipping-pro-woocommerce-2-16-1-300x153.jpg', 'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce - Cover Banner', 0),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80', 'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce - Admin Dashboard Preview', 1),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce - Settings & Controls', 2),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Flexible Shipping Pro 4.1.4 – Table Rate Shipping for WooCommerce - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = 'bb45cd33-a935-4ddc-ace6-06ac4d88adc9';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'All premium features unlocked without domain restrictions', 2),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'Lightweight, clean code optimized for server speed and security', 3),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('bb45cd33-a935-4ddc-ace6-06ac4d88adc9', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 25: Wallet for WooCommerce 6.8.0
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '0564e78f-6134-48bc-af34-17d76b0ea15d', v_wp_cat, 'Wallet for WooCommerce 6.8.0', 'wallet-for-woocommerce', 'WP-PLG-WALLETFORW-25',
    'Wallet for WooCommerce 6.8.0', 'Wallet for WooCommerce 6.8.0 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    490, 2400, 'https://weadown.com/wp-content/uploads/2025/02/Wallet-for-WooCommerce-1-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '6.8.0', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'Wallet for WooCommerce 6.8.0 Download | bdBeginner', 'Wallet for WooCommerce 6.8.0',
    64, now()
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

  DELETE FROM public.product_images WHERE product_id = '0564e78f-6134-48bc-af34-17d76b0ea15d';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'https://weadown.com/wp-content/uploads/2025/02/Wallet-for-WooCommerce-1-300x153.jpg', 'Wallet for WooCommerce 6.8.0 - Cover Banner', 0),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', 'Wallet for WooCommerce 6.8.0 - Admin Dashboard Preview', 1),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'Wallet for WooCommerce 6.8.0 - Settings & Controls', 2),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Wallet for WooCommerce 6.8.0 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '0564e78f-6134-48bc-af34-17d76b0ea15d';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'All premium features unlocked without domain restrictions', 2),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'Lightweight, clean code optimized for server speed and security', 3),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('0564e78f-6134-48bc-af34-17d76b0ea15d', 'Future updates provided directly through your customer dashboard', 6);

  -- Plugin 26: WooCommerce Memberships 1.30.1
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', v_wp_cat, 'WooCommerce Memberships 1.30.1', 'woocommerce-memberships', 'WP-PLG-WOOCOMMERCE-26',
    'WooCommerce Memberships 1.30.1', 'WooCommerce Memberships 1.30.1 is an indispensable WordPress plugin built to empower your website with enterprise-grade functionality, top-tier performance, and seamless user experiences.



Features 100% clean and verified code under the GNU General Public License (GPL). Install on unlimited websites without domain restrictions or recurring subscription fees. Comes with complete documentation and instant download access.',
    390, 1900, 'https://weadown.com/wp-content/uploads/2026/08/WooCommerce-Memberships-300x153.jpg',
    'digital_download', 'digital_download', 'published', false, true,
    '1.30.1', 'WordPress 6.0+, PHP 8.0+, WooCommerce & Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation', 'Future plugin version updates are included',
    'Instant demo access. Verified plugin file link will be provided in your dashboard upon review.',
    'WooCommerce Memberships 1.30.1 Download | bdBeginner', 'WooCommerce Memberships 1.30.1',
    65, now()
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

  DELETE FROM public.product_images WHERE product_id = '4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order) VALUES
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'https://weadown.com/wp-content/uploads/2026/08/WooCommerce-Memberships-300x153.jpg', 'WooCommerce Memberships 1.30.1 - Cover Banner', 0),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', 'WooCommerce Memberships 1.30.1 - Admin Dashboard Preview', 1),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'WooCommerce Memberships 1.30.1 - Settings & Controls', 2),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80', 'WooCommerce Memberships 1.30.1 - Feature Overview', 3);

  DELETE FROM public.product_features WHERE product_id = '4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'Genuine, untouched & 100% GPL licensed WordPress plugin', 1),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'All premium features unlocked without domain restrictions', 2),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'Lightweight, clean code optimized for server speed and security', 3),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'Fully compatible with WordPress 6.x and PHP 8.0 / 8.1 / 8.2', 4),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'One-click plugin installation via WordPress admin dashboard', 5),
  ('4c5e7437-b9fb-42e3-a5a0-39afb0c7cc1a', 'Future updates provided directly through your customer dashboard', 6);

END $$;
