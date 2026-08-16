/*
# Add admin security foundation for catalog management

1. New Tables
- `public.admin_users`
- `user_id` (uuid, primary key): References the authenticated Supabase user who is allowed to administer the catalog.
- `created_at` (timestamptz, not null): Records when the admin entry was created.

2. New Functions
- `public.is_admin()`: Securely checks whether the currently signed-in user has an entry in `admin_users`.

3. Modified Tables
- `categories`: Adds authenticated admin-only insert, update, and delete access while preserving public read access.
- `products`: Adds authenticated admin-only insert, update, and delete access while preserving public read access.
- `product_images`: Adds authenticated admin-only insert, update, and delete access while preserving public read access.
- `product_features`: Adds authenticated admin-only insert, update, and delete access while preserving public read access.
- `product_includes`: Adds authenticated admin-only insert, update, and delete access while preserving public read access.
- `product_faqs`: Adds authenticated admin-only insert, update, and delete access while preserving public read access.

4. Security
- Enables row level security on `admin_users`.
- Prevents anonymous clients from reading the admin list.
- Allows an authenticated admin to read only their own admin record.
- Restricts all catalog writes to users verified by `public.is_admin()`.
- Grants authenticated clients only the catalog write privileges required for the policies to evaluate.

5. Important Notes
- Existing catalog rows and public read policies are preserved.
- The migration is idempotent: it can be safely applied again without duplicating policies or the admin table.
- Adding a user to `admin_users` is the mechanism used to grant catalog administration access.
*/

create table if not exists public.admin_users (
  user_id uuid primary key
    references auth.users(id)
    on delete cascade,

  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Admin can read own admin record"
on public.admin_users;

create policy "Admin can read own admin record"
on public.admin_users
for select
to authenticated
using (
  user_id = auth.uid()
);

drop policy if exists "Admins can insert categories"
on public.categories;

drop policy if exists "Admins can update categories"
on public.categories;
drop policy if exists "Admins can delete categories"
on public.categories;

create policy "Admins can insert categories"
on public.categories
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update categories"
on public.categories
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete categories"
on public.categories
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert products"
on public.products;
drop policy if exists "Admins can update products"
on public.products;
drop policy if exists "Admins can delete products"
on public.products;

create policy "Admins can insert products"
on public.products
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update products"
on public.products
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete products"
on public.products
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert product images"
on public.product_images;
drop policy if exists "Admins can update product images"
on public.product_images;
drop policy if exists "Admins can delete product images"
on public.product_images;

create policy "Admins can insert product images"
on public.product_images
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update product images"
on public.product_images
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete product images"
on public.product_images
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert product features"
on public.product_features;
drop policy if exists "Admins can update product features"
on public.product_features;
drop policy if exists "Admins can delete product features"
on public.product_features;

create policy "Admins can insert product features"
on public.product_features
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update product features"
on public.product_features
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete product features"
on public.product_features
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert product includes"
on public.product_includes;
drop policy if exists "Admins can update product includes"
on public.product_includes;
drop policy if exists "Admins can delete product includes"
on public.product_includes;

create policy "Admins can insert product includes"
on public.product_includes
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update product includes"
on public.product_includes
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete product includes"
on public.product_includes
for delete
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert product faqs"
on public.product_faqs;
drop policy if exists "Admins can update product faqs"
on public.product_faqs;
drop policy if exists "Admins can delete product faqs"
on public.product_faqs;

create policy "Admins can insert product faqs"
on public.product_faqs
for insert
to authenticated
with check (public.is_admin());

create policy "Admins can update product faqs"
on public.product_faqs
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can delete product faqs"
on public.product_faqs
for delete
to authenticated
using (public.is_admin());

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_images to authenticated;
grant insert, update, delete on public.product_features to authenticated;
grant insert, update, delete on public.product_includes to authenticated;
grant insert, update, delete on public.product_faqs to authenticated;