-- ==============================================================
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

  -- Product 1: Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'c198a150-6322-42d6-a44d-d826c5aabc6a',
    v_category_id,
    'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme',
    'salient-wordpress-theme',
    'WP-THM-SALIENTWORD-1',
    'Salient which incorporates perfect blend of features and styles that helps users to best showcase business and personal projects.',
    'Salient which incorporates perfect blend of features and styles that helps users to best showcase business and personal projects.',
    490,
    2490,
    'https://weadown.com/wp-content/uploads/2025/12/salient-17-4-1-creative-multipurpose-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '18.4.1',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme Download | bdBeginner',
    'Salient which incorporates perfect blend of features and styles that helps users to best showcase business and personal projects.',
    1,
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
  DELETE FROM public.product_images WHERE product_id = 'c198a150-6322-42d6-a44d-d826c5aabc6a';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'https://weadown.com/wp-content/uploads/2025/12/salient-17-4-1-creative-multipurpose-woocommerce-theme.jpg', 'Salient 18.4.1 - Creative Multipurpose & WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'c198a150-6322-42d6-a44d-d826c5aabc6a';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Modern, mobile-responsive layout for all devices', 2),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Built-in performance and search engine optimization (SEO)', 4),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'c198a150-6322-42d6-a44d-d826c5aabc6a';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('c198a150-6322-42d6-a44d-d826c5aabc6a', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 2: Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'b305dc15-8999-4473-9e14-2a880bb89426',
    v_category_id,
    'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme',
    'kapee-wordpress-theme',
    'WP-THM-KAPEEWORDPR-2',
    'Kapee is fast, clean, highly customizable and responsive WordPress theme. Kapee Theme is a professional WordPress WooCommerce theme.',
    'Kapee is fast, clean, highly customizable and responsive WordPress theme. Kapee Theme is a professional WordPress WooCommerce theme.',
    450,
    1990,
    'https://weadown.com/wp-content/uploads/2023/05/kapee-1-6-0-fashion-store-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '1.7.5',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme Download | bdBeginner',
    'Kapee is fast, clean, highly customizable and responsive WordPress theme. Kapee Theme is a professional WordPress WooCommerce theme.',
    2,
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
  DELETE FROM public.product_images WHERE product_id = 'b305dc15-8999-4473-9e14-2a880bb89426';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('b305dc15-8999-4473-9e14-2a880bb89426', 'https://weadown.com/wp-content/uploads/2023/05/kapee-1-6-0-fashion-store-woocommerce-theme.jpg', 'Kapee 1.7.5 - Modern Multipurpose WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'b305dc15-8999-4473-9e14-2a880bb89426';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Modern, mobile-responsive layout for all devices', 2),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Built-in performance and search engine optimization (SEO)', 4),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'b305dc15-8999-4473-9e14-2a880bb89426';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('b305dc15-8999-4473-9e14-2a880bb89426', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 3: Bricks 2.4.3 - Visual Site Builder for WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '2a054432-b89f-4398-bc60-34910b00443b',
    v_category_id,
    'Bricks 2.4.3 - Visual Site Builder for WordPress',
    'bricks-build-wordpress-sites',
    'WP-THM-BRICKSBUILD-3',
    'Bricks an innovative, community-driven, visual site builder theme for your self-hosted WordPress website. Empowering you to design unique, performant, and',
    'Bricks an innovative, community-driven, visual site builder theme for your self-hosted WordPress website. Empowering you to design unique, performant, and',
    590,
    2990,
    'https://weadown.com/wp-content/uploads/2026/07/Bricks-Visual-Site-Builder-for-WordPress.jpg',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '2.4.3',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Bricks 2.4.3 - Visual Site Builder for WordPress Download | bdBeginner',
    'Bricks an innovative, community-driven, visual site builder theme for your self-hosted WordPress website. Empowering you to design unique, performant, and',
    3,
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
  DELETE FROM public.product_images WHERE product_id = '2a054432-b89f-4398-bc60-34910b00443b';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('2a054432-b89f-4398-bc60-34910b00443b', 'https://weadown.com/wp-content/uploads/2026/07/Bricks-Visual-Site-Builder-for-WordPress.jpg', 'Bricks 2.4.3 - Visual Site Builder for WordPress', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '2a054432-b89f-4398-bc60-34910b00443b';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Modern, mobile-responsive layout for all devices', 2),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Built-in performance and search engine optimization (SEO)', 4),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '2a054432-b89f-4398-bc60-34910b00443b';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('2a054432-b89f-4398-bc60-34910b00443b', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('2a054432-b89f-4398-bc60-34910b00443b', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 4: Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'beeaa408-d450-4184-9a25-4dd544b7b0a4',
    v_category_id,
    'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL',
    'xtra-wordpress-website-builder',
    'WP-THM-XTRAWORDPRE-4',
    'XTRA is a creative, responsive, live drag and drop and easy-to-use WordPress theme for any kind of websites. XTRA Theme allows you to create sites for a wide',
    'XTRA is a creative, responsive, live drag and drop and easy-to-use WordPress theme for any kind of websites. XTRA Theme allows you to create sites for a wide',
    550,
    2750,
    'https://weadown.com/wp-content/uploads/2025/01/xtra-4-9-12-wordpress-website-builder-rtl.jpg',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '6.2',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL Download | bdBeginner',
    'XTRA is a creative, responsive, live drag and drop and easy-to-use WordPress theme for any kind of websites. XTRA Theme allows you to create sites for a wide',
    4,
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
  DELETE FROM public.product_images WHERE product_id = 'beeaa408-d450-4184-9a25-4dd544b7b0a4';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'https://weadown.com/wp-content/uploads/2025/01/xtra-4-9-12-wordpress-website-builder-rtl.jpg', 'Xtra 6.2 - Multipurpose WordPress & WooCommerce Theme + RTL', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'beeaa408-d450-4184-9a25-4dd544b7b0a4';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Modern, mobile-responsive layout for all devices', 2),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Built-in performance and search engine optimization (SEO)', 4),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'beeaa408-d450-4184-9a25-4dd544b7b0a4';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('beeaa408-d450-4184-9a25-4dd544b7b0a4', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 5: Traveler 3.4 - Travel Booking WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'fae32b9b-ec25-4712-974a-0e36e0deff45',
    v_category_id,
    'Traveler 3.4 - Travel Booking WordPress Theme',
    'traveler-travel-booking-wordpress-theme',
    'WP-THM-TRAVELERTRA-5',
    'Traveler helps you Save Time, Save Money, Save Face, Save everything can Save to make online booking with fully customizable booking form, flexible online',
    'Traveler helps you Save Time, Save Money, Save Face, Save everything can Save to make online booking with fully customizable booking form, flexible online',
    390,
    1800,
    'https://weadown.com/wp-content/uploads/2023/04/traveler-3-0-7-travel-booking-wordpress-theme.png',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '3.4',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Traveler 3.4 - Travel Booking WordPress Theme Download | bdBeginner',
    'Traveler helps you Save Time, Save Money, Save Face, Save everything can Save to make online booking with fully customizable booking form, flexible online',
    5,
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
  DELETE FROM public.product_images WHERE product_id = 'fae32b9b-ec25-4712-974a-0e36e0deff45';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'https://weadown.com/wp-content/uploads/2023/04/traveler-3-0-7-travel-booking-wordpress-theme.png', 'Traveler 3.4 - Travel Booking WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'fae32b9b-ec25-4712-974a-0e36e0deff45';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Modern, mobile-responsive layout for all devices', 2),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Built-in performance and search engine optimization (SEO)', 4),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'fae32b9b-ec25-4712-974a-0e36e0deff45';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('fae32b9b-ec25-4712-974a-0e36e0deff45', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 6: Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd',
    v_category_id,
    'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress',
    'divi-wordpress-theme',
    'WP-THM-DIVIWORDPRE-6',
    'Divi Theme is the smartest, most flexible theme in our collection. With Divi, the sky’s the limit. Divi Pro is fast, lean, and packed with modern features to',
    'Divi Theme is the smartest, most flexible theme in our collection. With Divi, the sky’s the limit. Divi Pro is fast, lean, and packed with modern features to',
    490,
    2500,
    'https://weadown.com/wp-content/uploads/2024/11/Divi-WordPress-Theme-Visual-Page-Builder.jpg',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '5.15.1',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress Download | bdBeginner',
    'Divi Theme is the smartest, most flexible theme in our collection. With Divi, the sky’s the limit. Divi Pro is fast, lean, and packed with modern features to',
    6,
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
  DELETE FROM public.product_images WHERE product_id = 'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'https://weadown.com/wp-content/uploads/2024/11/Divi-WordPress-Theme-Visual-Page-Builder.jpg', 'Divi 5.15.1 + 4.27.6 - The Essential Site Building Framework For WordPress', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Modern, mobile-responsive layout for all devices', 2),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Built-in performance and search engine optimization (SEO)', 4),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('f8c16eaf-d3b1-4ca2-a0ce-29c5382896cd', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 7: Finbiz 2.2.3 - Consulting Business WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'ea956669-cae8-4b29-af71-5ea1c7eb0ac0',
    v_category_id,
    'Finbiz 2.2.3 - Consulting Business WordPress Theme',
    'finbiz-wordpress-theme',
    'WP-THM-FINBIZWORDP-7',
    'Finbiz is a clean and minimalist design that is perfect for showcasing financial services, human resources, insurance, consulting, corporate, IT solutions,',
    'Finbiz is a clean and minimalist design that is perfect for showcasing financial services, human resources, insurance, consulting, corporate, IT solutions,',
    450,
    2200,
    'https://weadown.com/wp-content/uploads/2025/03/finbiz-2-1-5-consulting-business-wordpress-theme.png',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '2.2.3',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Finbiz 2.2.3 - Consulting Business WordPress Theme Download | bdBeginner',
    'Finbiz is a clean and minimalist design that is perfect for showcasing financial services, human resources, insurance, consulting, corporate, IT solutions,',
    7,
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
  DELETE FROM public.product_images WHERE product_id = 'ea956669-cae8-4b29-af71-5ea1c7eb0ac0';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'https://weadown.com/wp-content/uploads/2025/03/finbiz-2-1-5-consulting-business-wordpress-theme.png', 'Finbiz 2.2.3 - Consulting Business WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'ea956669-cae8-4b29-af71-5ea1c7eb0ac0';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Modern, mobile-responsive layout for all devices', 2),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Built-in performance and search engine optimization (SEO)', 4),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'ea956669-cae8-4b29-af71-5ea1c7eb0ac0';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('ea956669-cae8-4b29-af71-5ea1c7eb0ac0', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 8: Voxel 1.7.11 - Create WordPress Dynamic Sites
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'b83b399b-94a4-47d6-9687-a4e28d19d291',
    v_category_id,
    'Voxel 1.7.11 - Create WordPress Dynamic Sites',
    'voxel-create-wordpress-dynamic-sites',
    'WP-THM-VOXELCREATE-8',
    'Voxel create WordPress Dynamic Sites, Directory & Listing sites and more with Voxel & Elementor page builder.',
    'Voxel create WordPress Dynamic Sites, Directory & Listing sites and more with Voxel & Elementor page builder.',
    590,
    2900,
    'https://weadown.com/wp-content/uploads/2024/12/Voxel-Create-WordPress-Dynamic-Sites.jpg',
    'digital_download',
    'digital_download',
    'published',
    true,
    true,
    '1.7.11',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Voxel 1.7.11 - Create WordPress Dynamic Sites Download | bdBeginner',
    'Voxel create WordPress Dynamic Sites, Directory & Listing sites and more with Voxel & Elementor page builder.',
    8,
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
  DELETE FROM public.product_images WHERE product_id = 'b83b399b-94a4-47d6-9687-a4e28d19d291';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'https://weadown.com/wp-content/uploads/2024/12/Voxel-Create-WordPress-Dynamic-Sites.jpg', 'Voxel 1.7.11 - Create WordPress Dynamic Sites', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'b83b399b-94a4-47d6-9687-a4e28d19d291';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Modern, mobile-responsive layout for all devices', 2),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Built-in performance and search engine optimization (SEO)', 4),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'b83b399b-94a4-47d6-9687-a4e28d19d291';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('b83b399b-94a4-47d6-9687-a4e28d19d291', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 9: Infinite 5.0.1 - Corporate Business WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'b51bed97-799d-43bc-9c15-b6dcc7fb2d21',
    v_category_id,
    'Infinite 5.0.1 - Corporate Business WordPress Theme',
    'infinite-wordpress-theme',
    'WP-THM-INFINITEWOR-9',
    'Infinite is well designed WordPress theme for multi-purpose. Featured with the latest version of super powerful & customizable framework by GoodLayers.',
    'Infinite is well designed WordPress theme for multi-purpose. Featured with the latest version of super powerful & customizable framework by GoodLayers.',
    390,
    1750,
    'https://weadown.com/wp-content/uploads/2023/08/infinite-4-0-4-multipurpose-wordpress-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '5.0.1',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Infinite 5.0.1 - Corporate Business WordPress Theme Download | bdBeginner',
    'Infinite is well designed WordPress theme for multi-purpose. Featured with the latest version of super powerful & customizable framework by GoodLayers.',
    9,
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
  DELETE FROM public.product_images WHERE product_id = 'b51bed97-799d-43bc-9c15-b6dcc7fb2d21';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'https://weadown.com/wp-content/uploads/2023/08/infinite-4-0-4-multipurpose-wordpress-theme.jpg', 'Infinite 5.0.1 - Corporate Business WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'b51bed97-799d-43bc-9c15-b6dcc7fb2d21';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Modern, mobile-responsive layout for all devices', 2),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Built-in performance and search engine optimization (SEO)', 4),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'b51bed97-799d-43bc-9c15-b6dcc7fb2d21';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('b51bed97-799d-43bc-9c15-b6dcc7fb2d21', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 10: Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6',
    v_category_id,
    'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme',
    'bellevue-hotel-wordpress-theme',
    'WP-THM-BELLEVUEHOT-10',
    'Bellevue includes everything you would expect from a premium WordPress theme and it will help you to build an awesome Hotel or Bed and Breakfast website.',
    'Bellevue includes everything you would expect from a premium WordPress theme and it will help you to build an awesome Hotel or Bed and Breakfast website.',
    490,
    2400,
    'https://weadown.com/wp-content/uploads/2024/12/bellevue-4-2-6-hotel-bed-and-breakfast-booking-calendar-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '4.2.24',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme Download | bdBeginner',
    'Bellevue includes everything you would expect from a premium WordPress theme and it will help you to build an awesome Hotel or Bed and Breakfast website.',
    10,
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
  DELETE FROM public.product_images WHERE product_id = '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'https://weadown.com/wp-content/uploads/2024/12/bellevue-4-2-6-hotel-bed-and-breakfast-booking-calendar-theme.jpg', 'Bellevue 4.2.24 - Hotel + Bed and Breakfast Booking Calendar Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Modern, mobile-responsive layout for all devices', 2),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Built-in performance and search engine optimization (SEO)', 4),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '44ba0747-2b7c-490b-ba5a-0e7b2eef16a6';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('44ba0747-2b7c-490b-ba5a-0e7b2eef16a6', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 11: Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'fb87dcf3-a559-47f2-896e-cd39fef73a3b',
    v_category_id,
    'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme',
    'savoy-woocommerce-theme',
    'WP-THM-SAVOYWOOCOM-11',
    'Savoy creates the basis for an amazing online store. Its modern minimalist design puts your products in focus, and our built-in AJAX functionality gives your',
    'Savoy creates the basis for an amazing online store. Its modern minimalist design puts your products in focus, and our built-in AJAX functionality gives your',
    550,
    2800,
    'https://weadown.com/wp-content/uploads/2023/06/savoy-2-8-2-minimalist-ajax-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '3.2.3',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme Download | bdBeginner',
    'Savoy creates the basis for an amazing online store. Its modern minimalist design puts your products in focus, and our built-in AJAX functionality gives your',
    11,
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
  DELETE FROM public.product_images WHERE product_id = 'fb87dcf3-a559-47f2-896e-cd39fef73a3b';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'https://weadown.com/wp-content/uploads/2023/06/savoy-2-8-2-minimalist-ajax-woocommerce-theme.jpg', 'Savoy 3.2.3 - Minimalist AJAX WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'fb87dcf3-a559-47f2-896e-cd39fef73a3b';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Modern, mobile-responsive layout for all devices', 2),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Built-in performance and search engine optimization (SEO)', 4),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'fb87dcf3-a559-47f2-896e-cd39fef73a3b';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('fb87dcf3-a559-47f2-896e-cd39fef73a3b', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 12: Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '7a0f93d5-966d-409c-baca-699af8571514',
    v_category_id,
    'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support',
    'elessi-wordpress-theme',
    'WP-THM-ELESSIWORDP-12',
    'Elessi is clean, modern, user-friendly WooCommerce Theme with many of functions theme just perfect for your eCommerce project.',
    'Elessi is clean, modern, user-friendly WooCommerce Theme with many of functions theme just perfect for your eCommerce project.',
    450,
    2300,
    'https://weadown.com/wp-content/uploads/2023/04/elessi-5-1-8-woocommerce-ajax-wordpress-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '6.6.4.1',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support Download | bdBeginner',
    'Elessi is clean, modern, user-friendly WooCommerce Theme with many of functions theme just perfect for your eCommerce project.',
    12,
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
  DELETE FROM public.product_images WHERE product_id = '7a0f93d5-966d-409c-baca-699af8571514';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('7a0f93d5-966d-409c-baca-699af8571514', 'https://weadown.com/wp-content/uploads/2023/04/elessi-5-1-8-woocommerce-ajax-wordpress-theme.jpg', 'Elessi 6.6.4.1 - WooCommerce AJAX WordPress Theme - RTL support', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '7a0f93d5-966d-409c-baca-699af8571514';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Modern, mobile-responsive layout for all devices', 2),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Built-in performance and search engine optimization (SEO)', 4),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '7a0f93d5-966d-409c-baca-699af8571514';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('7a0f93d5-966d-409c-baca-699af8571514', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('7a0f93d5-966d-409c-baca-699af8571514', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 13: Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'a5a9f55e-970d-4474-8324-40c01b47b6a5',
    v_category_id,
    'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme',
    'bridge-wordpress-theme',
    'WP-THM-BRIDGEWORDP-13',
    'Bridge is a responsive retina multipurpose WordPress theme perfect for just about anyone. Whether you are a creative, a corporate team, a lawyer, a medical',
    'Bridge is a responsive retina multipurpose WordPress theme perfect for just about anyone. Whether you are a creative, a corporate team, a lawyer, a medical',
    490,
    2500,
    'https://weadown.com/wp-content/uploads/2024/02/bridge-30-2-creative-multipurpose-wordpress-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '30.9',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme Download | bdBeginner',
    'Bridge is a responsive retina multipurpose WordPress theme perfect for just about anyone. Whether you are a creative, a corporate team, a lawyer, a medical',
    13,
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
  DELETE FROM public.product_images WHERE product_id = 'a5a9f55e-970d-4474-8324-40c01b47b6a5';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'https://weadown.com/wp-content/uploads/2024/02/bridge-30-2-creative-multipurpose-wordpress-theme.jpg', 'Bridge 30.9 - Creative Elementor and WooCommerce WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'a5a9f55e-970d-4474-8324-40c01b47b6a5';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Modern, mobile-responsive layout for all devices', 2),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Built-in performance and search engine optimization (SEO)', 4),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'a5a9f55e-970d-4474-8324-40c01b47b6a5';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('a5a9f55e-970d-4474-8324-40c01b47b6a5', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 14: Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'd994ef6e-cdaf-4ef5-a98f-05140cc9b894',
    v_category_id,
    'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme',
    'zota-wordpress-theme',
    'WP-THM-ZOTAWORDPRE-14',
    'Zota is a flexible and customizable WooCommerce Multi-Purpose WordPress Theme that installs and changes any item in a matter of minutes via Powerful Theme',
    'Zota is a flexible and customizable WooCommerce Multi-Purpose WordPress Theme that installs and changes any item in a matter of minutes via Powerful Theme',
    590,
    3100,
    'https://weadown.com/wp-content/uploads/2023/05/zota-1-2-9-elementor-multi-purpose-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '1.3.21',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme Download | bdBeginner',
    'Zota is a flexible and customizable WooCommerce Multi-Purpose WordPress Theme that installs and changes any item in a matter of minutes via Powerful Theme',
    14,
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
  DELETE FROM public.product_images WHERE product_id = 'd994ef6e-cdaf-4ef5-a98f-05140cc9b894';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'https://weadown.com/wp-content/uploads/2023/05/zota-1-2-9-elementor-multi-purpose-woocommerce-theme.jpg', 'Zota 1.3.21 - Elementor Multi-Purpose WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'd994ef6e-cdaf-4ef5-a98f-05140cc9b894';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Modern, mobile-responsive layout for all devices', 2),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Built-in performance and search engine optimization (SEO)', 4),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'd994ef6e-cdaf-4ef5-a98f-05140cc9b894';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('d994ef6e-cdaf-4ef5-a98f-05140cc9b894', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 15: Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'dc80ae85-5ef3-49ad-b803-34ec59dc3014',
    v_category_id,
    'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme',
    'ecom-multipurpose-woocommerce-wordpress-theme',
    'WP-THM-ECOMMULTIPU-15',
    'Ecom is a conversion-focused WooCommerce theme built for modern online stores. Fully compatible with Elementor and WPBakery. Perfect for Fashion, Clothing,',
    'Ecom is a conversion-focused WooCommerce theme built for modern online stores. Fully compatible with Elementor and WPBakery. Perfect for Fashion, Clothing,',
    450,
    2100,
    'https://weadown.com/wp-content/uploads/2026/10/ecom-1-3-2-multipurpose-woocommerce-wordpress-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '1.3.2',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme Download | bdBeginner',
    'Ecom is a conversion-focused WooCommerce theme built for modern online stores. Fully compatible with Elementor and WPBakery. Perfect for Fashion, Clothing,',
    15,
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
  DELETE FROM public.product_images WHERE product_id = 'dc80ae85-5ef3-49ad-b803-34ec59dc3014';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'https://weadown.com/wp-content/uploads/2026/10/ecom-1-3-2-multipurpose-woocommerce-wordpress-theme.jpg', 'Ecom 1.3.2 - Multipurpose WooCommerce WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'dc80ae85-5ef3-49ad-b803-34ec59dc3014';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Modern, mobile-responsive layout for all devices', 2),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Built-in performance and search engine optimization (SEO)', 4),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'dc80ae85-5ef3-49ad-b803-34ec59dc3014';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('dc80ae85-5ef3-49ad-b803-34ec59dc3014', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 16: Trueman 1.5.0 - Resume WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'e88a22ee-313e-4ecf-8112-d3f783aa45ae',
    v_category_id,
    'Trueman 1.5.0 - Resume WordPress Theme',
    'trueman-cv-resume-wordpress-theme',
    'WP-THM-TRUEMANCVR-16',
    'Trueman – CV Resume WordPress Theme is best suited for developer, designer, programmer, freelancer, artist, coder, photography or any other digital',
    'Trueman – CV Resume WordPress Theme is best suited for developer, designer, programmer, freelancer, artist, coder, photography or any other digital',
    390,
    1650,
    'https://weadown.com/wp-content/uploads/2025/01/trueman-1-3-1-cv-resume-wordpress-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '1.5.0',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Trueman 1.5.0 - Resume WordPress Theme Download | bdBeginner',
    'Trueman – CV Resume WordPress Theme is best suited for developer, designer, programmer, freelancer, artist, coder, photography or any other digital',
    16,
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
  DELETE FROM public.product_images WHERE product_id = 'e88a22ee-313e-4ecf-8112-d3f783aa45ae';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'https://weadown.com/wp-content/uploads/2025/01/trueman-1-3-1-cv-resume-wordpress-theme.jpg', 'Trueman 1.5.0 - Resume WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'e88a22ee-313e-4ecf-8112-d3f783aa45ae';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Modern, mobile-responsive layout for all devices', 2),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Built-in performance and search engine optimization (SEO)', 4),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'e88a22ee-313e-4ecf-8112-d3f783aa45ae';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('e88a22ee-313e-4ecf-8112-d3f783aa45ae', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 17: Porto 7.9.5 - AI Powered WordPress Website & Shop Builder
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b',
    v_category_id,
    'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder',
    'porto-wordpress-theme',
    'WP-THM-PORTOWORDPR-17',
    'Porto is extremely customizable, easy to use and fully responsive. Suitable for every type of business, portfolio, blog and ecommerce sites. Porto guarantees',
    'Porto is extremely customizable, easy to use and fully responsive. Suitable for every type of business, portfolio, blog and ecommerce sites. Porto guarantees',
    490,
    2400,
    'https://weadown.com/wp-content/uploads/2024/05/porto-7-1-2-multipurpose-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '7.9.5',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder Download | bdBeginner',
    'Porto is extremely customizable, easy to use and fully responsive. Suitable for every type of business, portfolio, blog and ecommerce sites. Porto guarantees',
    17,
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
  DELETE FROM public.product_images WHERE product_id = '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'https://weadown.com/wp-content/uploads/2024/05/porto-7-1-2-multipurpose-woocommerce-theme.jpg', 'Porto 7.9.5 - AI Powered WordPress Website & Shop Builder', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Modern, mobile-responsive layout for all devices', 2),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Built-in performance and search engine optimization (SEO)', 4),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '57e62c0d-5c4e-4bfd-9c6d-55656c7b362b';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('57e62c0d-5c4e-4bfd-9c6d-55656c7b362b', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 18: Hub 7.0 - Responsive Multi-Purpose WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '4ebcc049-02cc-47fc-8b07-0ab3340ffff5',
    v_category_id,
    'Hub 7.0 - Responsive Multi-Purpose WordPress Theme',
    'hub-wordpress-theme',
    'WP-THM-HUBWORDPRES-18',
    'Hub is the all-in-one builder with ultra high performance, an intuitive editor, exclusive features, and an award-winning design collection. It includes 80',
    'Hub is the all-in-one builder with ultra high performance, an intuitive editor, exclusive features, and an award-winning design collection. It includes 80',
    550,
    2850,
    'https://weadown.com/wp-content/uploads/2023/11/hub-4-2-1-responsive-multi-purpose-wordpress-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '7.0',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Hub 7.0 - Responsive Multi-Purpose WordPress Theme Download | bdBeginner',
    'Hub is the all-in-one builder with ultra high performance, an intuitive editor, exclusive features, and an award-winning design collection. It includes 80',
    18,
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
  DELETE FROM public.product_images WHERE product_id = '4ebcc049-02cc-47fc-8b07-0ab3340ffff5';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'https://weadown.com/wp-content/uploads/2023/11/hub-4-2-1-responsive-multi-purpose-wordpress-theme.jpg', 'Hub 7.0 - Responsive Multi-Purpose WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '4ebcc049-02cc-47fc-8b07-0ab3340ffff5';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Modern, mobile-responsive layout for all devices', 2),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Built-in performance and search engine optimization (SEO)', 4),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '4ebcc049-02cc-47fc-8b07-0ab3340ffff5';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('4ebcc049-02cc-47fc-8b07-0ab3340ffff5', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 19: Besa 2.3.24 - Elementor Marketplace WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '16ed112a-289f-4d86-a1f1-29f68ce3e996',
    v_category_id,
    'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme',
    'besa-elementor-marketplace-woocommerce-theme',
    'WP-THM-BESAELEMENT-19',
    'Besa rocks a handy mobile menu which will take your shoppers to their desired product effortlessly. Besa in total, you receive a whopping three hundred pages',
    'Besa rocks a handy mobile menu which will take your shoppers to their desired product effortlessly. Besa in total, you receive a whopping three hundred pages',
    450,
    2200,
    'https://weadown.com/wp-content/uploads/2023/04/besa-2-2-10-elementor-marketplace-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '2.3.24',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme Download | bdBeginner',
    'Besa rocks a handy mobile menu which will take your shoppers to their desired product effortlessly. Besa in total, you receive a whopping three hundred pages',
    19,
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
  DELETE FROM public.product_images WHERE product_id = '16ed112a-289f-4d86-a1f1-29f68ce3e996';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'https://weadown.com/wp-content/uploads/2023/04/besa-2-2-10-elementor-marketplace-woocommerce-theme.jpg', 'Besa 2.3.24 - Elementor Marketplace WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '16ed112a-289f-4d86-a1f1-29f68ce3e996';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Modern, mobile-responsive layout for all devices', 2),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Built-in performance and search engine optimization (SEO)', 4),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '16ed112a-289f-4d86-a1f1-29f68ce3e996';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('16ed112a-289f-4d86-a1f1-29f68ce3e996', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 20: Machic 1.6.7 - Electronics Store WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '72f8bff7-0af4-4390-94c1-6d193e397ade',
    v_category_id,
    'Machic 1.6.7 - Electronics Store WooCommerce Theme',
    'machic-wordpress-theme',
    'WP-THM-MACHICWORDP-20',
    'Machic theme can help you to build your own electronics store, fashion store, accessories shop, phone store, mobile shop, electronics multivendor, electronics',
    'Machic theme can help you to build your own electronics store, fashion store, accessories shop, phone store, mobile shop, electronics multivendor, electronics',
    390,
    1850,
    'https://weadown.com/wp-content/uploads/2023/06/machic-1-2-5-electronics-store-woocommerce-theme.png',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '1.6.7',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Machic 1.6.7 - Electronics Store WooCommerce Theme Download | bdBeginner',
    'Machic theme can help you to build your own electronics store, fashion store, accessories shop, phone store, mobile shop, electronics multivendor, electronics',
    20,
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
  DELETE FROM public.product_images WHERE product_id = '72f8bff7-0af4-4390-94c1-6d193e397ade';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'https://weadown.com/wp-content/uploads/2023/06/machic-1-2-5-electronics-store-woocommerce-theme.png', 'Machic 1.6.7 - Electronics Store WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '72f8bff7-0af4-4390-94c1-6d193e397ade';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Modern, mobile-responsive layout for all devices', 2),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Built-in performance and search engine optimization (SEO)', 4),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '72f8bff7-0af4-4390-94c1-6d193e397ade';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('72f8bff7-0af4-4390-94c1-6d193e397ade', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 21: XStore 9.7.9 - Multipurpose WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e',
    v_category_id,
    'XStore 9.7.9 - Multipurpose WooCommerce Theme',
    'xstore-wordpress-theme',
    'WP-THM-XSTOREWORDP-21',
    'XStore is carefully developed and includes that set of pages, tools and settings that will help you create a professional looking and trustworthy online shop.',
    'XStore is carefully developed and includes that set of pages, tools and settings that will help you create a professional looking and trustworthy online shop.',
    590,
    2990,
    'https://weadown.com/wp-content/uploads/2025/11/xstore-9-6-1-multipurpose-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '9.7.9',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'XStore 9.7.9 - Multipurpose WooCommerce Theme Download | bdBeginner',
    'XStore is carefully developed and includes that set of pages, tools and settings that will help you create a professional looking and trustworthy online shop.',
    21,
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
  DELETE FROM public.product_images WHERE product_id = '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'https://weadown.com/wp-content/uploads/2025/11/xstore-9-6-1-multipurpose-woocommerce-theme.jpg', 'XStore 9.7.9 - Multipurpose WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Modern, mobile-responsive layout for all devices', 2),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Built-in performance and search engine optimization (SEO)', 4),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '9eaa912d-4b7a-4d45-8dd5-e6957241ea9e';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('9eaa912d-4b7a-4d45-8dd5-e6957241ea9e', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 22: Masterstudy 4.8.161 - Education WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'd3c23ede-9163-4d57-827c-6a07068fdc6d',
    v_category_id,
    'Masterstudy 4.8.161 - Education WordPress Theme',
    'masterstudy-education-wordpress-theme',
    'WP-THM-MASTERSTUDY-22',
    'MasterStudy is the best solution for Online Coaching, Instructors, Tutors, Courses marketplace, Language schools, private schools, universities and colleges.',
    'MasterStudy is the best solution for Online Coaching, Instructors, Tutors, Courses marketplace, Language schools, private schools, universities and colleges.',
    490,
    2500,
    'https://weadown.com/wp-content/uploads/2023/07/masterstudy-4-8-7-education-wordpress-theme.png',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '4.8.161',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'Masterstudy 4.8.161 - Education WordPress Theme Download | bdBeginner',
    'MasterStudy is the best solution for Online Coaching, Instructors, Tutors, Courses marketplace, Language schools, private schools, universities and colleges.',
    22,
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
  DELETE FROM public.product_images WHERE product_id = 'd3c23ede-9163-4d57-827c-6a07068fdc6d';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'https://weadown.com/wp-content/uploads/2023/07/masterstudy-4-8-7-education-wordpress-theme.png', 'Masterstudy 4.8.161 - Education WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'd3c23ede-9163-4d57-827c-6a07068fdc6d';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Modern, mobile-responsive layout for all devices', 2),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Built-in performance and search engine optimization (SEO)', 4),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'd3c23ede-9163-4d57-827c-6a07068fdc6d';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('d3c23ede-9163-4d57-827c-6a07068fdc6d', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 23: BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    '0a25d164-3bb4-4567-95a4-2ca231c6f173',
    v_category_id,
    'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme',
    'betheme-wordpress-theme',
    'WP-THM-BETHEMEWORD-23',
    'BeTheme is the best product we ever did. This is more than just WordPress theme. Such advanced options panel and Drag & Drop builder tool give unlimited',
    'BeTheme is the best product we ever did. This is more than just WordPress theme. Such advanced options panel and Drag & Drop builder tool give unlimited',
    550,
    2800,
    'https://weadown.com/wp-content/uploads/2025/02/betheme-27-6-3-responsive-multipurpose-wordpress-woocommerce-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '29.0.2.1',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme Download | bdBeginner',
    'BeTheme is the best product we ever did. This is more than just WordPress theme. Such advanced options panel and Drag & Drop builder tool give unlimited',
    23,
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
  DELETE FROM public.product_images WHERE product_id = '0a25d164-3bb4-4567-95a4-2ca231c6f173';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'https://weadown.com/wp-content/uploads/2025/02/betheme-27-6-3-responsive-multipurpose-wordpress-woocommerce-theme.jpg', 'BeTheme 29.0.2.1 - Responsive Multipurpose WordPress & WooCommerce Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = '0a25d164-3bb4-4567-95a4-2ca231c6f173';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Modern, mobile-responsive layout for all devices', 2),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Built-in performance and search engine optimization (SEO)', 4),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = '0a25d164-3bb4-4567-95a4-2ca231c6f173';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('0a25d164-3bb4-4567-95a4-2ca231c6f173', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);

  -- Product 24: GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme
  INSERT INTO public.products (
    id, category_id, name, slug, sku, short_description, description,
    price, compare_at_price, thumbnail_url, product_type, delivery_type,
    status, featured, new_product, version, compatibility, requirements,
    support_period, update_policy, delivery_description, seo_title, seo_description,
    sort_order, published_at
  ) VALUES (
    'fce98fd7-d839-4229-8a0c-c8a3ba7408ad',
    v_category_id,
    'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme',
    'greenmart-wordpress-theme',
    'WP-THM-GREENMARTWO-24',
    'GreenMart is an Organic & Food WooCommerce Theme that is flexible and customizable for setting and changing any elements within minutes via Powerful Theme',
    'GreenMart is an Organic & Food WooCommerce Theme that is flexible and customizable for setting and changing any elements within minutes via Powerful Theme',
    450,
    2250,
    'https://weadown.com/wp-content/uploads/2023/05/greenmart-4-1-2-organic-food-woocommerce-wordpress-theme.jpg',
    'digital_download',
    'digital_download',
    'published',
    false,
    true,
    '4.3.5',
    'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    'Lifetime updates and community documentation',
    'Future theme version updates are included',
    'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme Download | bdBeginner',
    'GreenMart is an Organic & Food WooCommerce Theme that is flexible and customizable for setting and changing any elements within minutes via Powerful Theme',
    24,
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
  DELETE FROM public.product_images WHERE product_id = 'fce98fd7-d839-4229-8a0c-c8a3ba7408ad';
  INSERT INTO public.product_images (product_id, image_url, alt_text, sort_order)
  VALUES ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'https://weadown.com/wp-content/uploads/2023/05/greenmart-4-1-2-organic-food-woocommerce-wordpress-theme.jpg', 'GreenMart 4.3.5 - Organic & Food WooCommerce WordPress Theme', 0);

  -- Features
  DELETE FROM public.product_features WHERE product_id = 'fce98fd7-d839-4229-8a0c-c8a3ba7408ad';
  INSERT INTO public.product_features (product_id, feature, sort_order) VALUES
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Genuine, clean & 100% GPL licensed WordPress theme', 1),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Modern, mobile-responsive layout for all devices', 2),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Elementor and WordPress block editor (Gutenberg) ready', 3),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Built-in performance and search engine optimization (SEO)', 4),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Pre-built demo layouts and templates ready for 1-click import', 5);

  -- FAQs
  DELETE FROM public.product_faqs WHERE product_id = 'fce98fd7-d839-4229-8a0c-c8a3ba7408ad';
  INSERT INTO public.product_faqs (product_id, question, answer, sort_order) VALUES
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'Is this theme authentic and clean?', 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).', 1),
  ('fce98fd7-d839-4229-8a0c-c8a3ba7408ad', 'How do I download the theme files?', 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.', 2);


END $$;
