/*
  # Add Facebook (Meta) Pixel ID and Facebook Domain Verification to SEO Settings

  1. New Columns in `public.seo_settings`:
    - `facebook_pixel_id` (text, nullable): The Meta / Facebook Pixel or Dataset ID (e.g. 123456789012345) for tracking page views, view content, add to cart, checkout, and purchase events.
    - `facebook_domain_verification` (text, nullable): The Meta Business Manager domain verification token for verifying ownership of bdbeginner.com.
*/

alter table public.seo_settings
  add column if not exists facebook_pixel_id text,
  add column if not exists facebook_domain_verification text;
