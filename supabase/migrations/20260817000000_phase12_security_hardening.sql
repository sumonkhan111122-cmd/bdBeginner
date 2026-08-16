/*
  Phase 12 security hardening.

  Apply to Preview/Staging first. This migration intentionally removes legacy
  permissive catalog policies and narrows SECURITY DEFINER execution grants.
*/

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon, authenticated, service_role;
grant execute on function public.is_admin() to authenticated;

-- Remove legacy policies that exposed draft or inactive catalog rows to every
-- authenticated customer. Public users retain published/active access; admins
-- retain an explicit full-catalog read policy.
drop policy if exists "Enable read access for authenticated on categories" on public.categories;
drop policy if exists "Enable read access for authenticated on products" on public.products;
drop policy if exists "Enable read access for authenticated on product_images" on public.product_images;
drop policy if exists "Enable read access for authenticated on product_features" on public.product_features;
drop policy if exists "Enable read access for authenticated on product_includes" on public.product_includes;
drop policy if exists "Enable read access for authenticated on product_faqs" on public.product_faqs;

drop policy if exists "Public can read active categories" on public.categories;
create policy "Public can read active categories"
on public.categories for select to anon, authenticated
using (is_active = true);

drop policy if exists "Admins can read all categories" on public.categories;
create policy "Admins can read all categories"
on public.categories for select to authenticated
using (public.is_admin());

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
on public.products for select to anon, authenticated
using (status = 'published');

drop policy if exists "Admins can read all products" on public.products;
create policy "Admins can read all products"
on public.products for select to authenticated
using (public.is_admin());

drop policy if exists "Public can read published product images" on public.product_images;
create policy "Public can read published product images"
on public.product_images for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_images.product_id and p.status = 'published'
));

drop policy if exists "Admins can read all product images" on public.product_images;
create policy "Admins can read all product images"
on public.product_images for select to authenticated
using (public.is_admin());

drop policy if exists "Public can read published product features" on public.product_features;
create policy "Public can read published product features"
on public.product_features for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_features.product_id and p.status = 'published'
));

drop policy if exists "Admins can read all product features" on public.product_features;
create policy "Admins can read all product features"
on public.product_features for select to authenticated
using (public.is_admin());

drop policy if exists "Public can read published product includes" on public.product_includes;
create policy "Public can read published product includes"
on public.product_includes for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_includes.product_id and p.status = 'published'
));

drop policy if exists "Admins can read all product includes" on public.product_includes;
create policy "Admins can read all product includes"
on public.product_includes for select to authenticated
using (public.is_admin());

drop policy if exists "Public can read published product faqs" on public.product_faqs;
create policy "Public can read published product faqs"
on public.product_faqs for select to anon, authenticated
using (exists (
  select 1 from public.products p
  where p.id = product_faqs.product_id and p.status = 'published'
));

drop policy if exists "Admins can read all product faqs" on public.product_faqs;
create policy "Admins can read all product faqs"
on public.product_faqs for select to authenticated
using (public.is_admin());

grant select on public.categories, public.products, public.product_images,
  public.product_features, public.product_includes, public.product_faqs
to anon, authenticated;

-- Trigger functions never need direct client execution.
revoke all on function public.handle_new_customer_profile() from public, anon, authenticated, service_role;
revoke all on function public.handle_order_fulfillment_payment() from public, anon, authenticated, service_role;
revoke all on function public.log_fulfillment_status_change() from public, anon, authenticated, service_role;
revoke all on function public.log_order_status_change() from public, anon, authenticated, service_role;
revoke all on function public.set_order_number() from public, anon, authenticated, service_role;
revoke all on function public.sync_coupon_redemption_from_order() from public, anon, authenticated, service_role;

-- The priced checkout RPC supersedes this obsolete five-argument entry point.
revoke all on function public.create_checkout_order(text, text, text, text, jsonb)
from public, anon, authenticated, service_role;

-- Public checkout functions are available only to browser roles that use them.
revoke all on function public.calculate_checkout_pricing(jsonb, text, text)
from public, anon, authenticated, service_role;
grant execute on function public.calculate_checkout_pricing(jsonb, text, text)
to anon, authenticated;

revoke all on function public.create_checkout_order_priced(text, text, text, text, jsonb, text)
from public, anon, authenticated, service_role;
grant execute on function public.create_checkout_order_priced(text, text, text, text, jsonb, text)
to anon, authenticated;

revoke all on function public.get_order_receipt(text, uuid)
from public, anon, authenticated, service_role;
grant execute on function public.get_order_receipt(text, uuid)
to anon, authenticated, service_role;

-- Analytics are admin-gated in the function body and need only the authenticated role.
revoke all on function public.admin_analytics_summary(timestamptz, timestamptz)
from public, anon, authenticated, service_role;
grant execute on function public.admin_analytics_summary(timestamptz, timestamptz) to authenticated;

revoke all on function public.admin_sales_series(timestamptz, timestamptz, text)
from public, anon, authenticated, service_role;
grant execute on function public.admin_sales_series(timestamptz, timestamptz, text) to authenticated;

revoke all on function public.admin_top_products(timestamptz, timestamptz)
from public, anon, authenticated, service_role;
grant execute on function public.admin_top_products(timestamptz, timestamptz) to authenticated;

revoke all on function public.admin_payment_stats(timestamptz, timestamptz)
from public, anon, authenticated, service_role;
grant execute on function public.admin_payment_stats(timestamptz, timestamptz) to authenticated;

revoke all on function public.admin_discount_stats(timestamptz, timestamptz)
from public, anon, authenticated, service_role;
grant execute on function public.admin_discount_stats(timestamptz, timestamptz) to authenticated;
