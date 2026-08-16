/*
# Product source imports

Tracks products created by the admin research importer without adding source
metadata to the public products table. Imported products remain ordinary
catalog rows and are created as drafts until an administrator reviews them.
*/

create table if not exists public.product_source_imports (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique
    references public.products(id)
    on delete cascade,
  provider text not null,
  source_url text not null unique,
  source_slug text not null,
  source_title text not null,
  source_version text,
  source_modified_at timestamptz,
  license_status text not null default 'unverified'
    check (license_status in ('unverified', 'verified_gpl', 'rejected')),
  metadata jsonb not null default '{}'::jsonb,
  last_checked_at timestamptz not null default now(),
  last_imported_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_source_imports_provider_idx
  on public.product_source_imports(provider);

create index if not exists product_source_imports_modified_idx
  on public.product_source_imports(source_modified_at desc);

alter table public.product_source_imports enable row level security;

drop policy if exists "Admins can read product source imports"
on public.product_source_imports;
create policy "Admins can read product source imports"
on public.product_source_imports
for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins can insert product source imports"
on public.product_source_imports;
create policy "Admins can insert product source imports"
on public.product_source_imports
for insert
to authenticated
with check (public.is_admin());

drop policy if exists "Admins can update product source imports"
on public.product_source_imports;
create policy "Admins can update product source imports"
on public.product_source_imports
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can delete product source imports"
on public.product_source_imports;
create policy "Admins can delete product source imports"
on public.product_source_imports
for delete
to authenticated
using (public.is_admin());

grant select, insert, update, delete
on public.product_source_imports
to authenticated;

