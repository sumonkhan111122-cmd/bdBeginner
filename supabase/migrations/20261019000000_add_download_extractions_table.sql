/*
  # Download Extraction Queue & History
  
  Stores the multi-step browser extraction flow state:
  - Original source post URL
  - Intermediate download page URL
  - Final extracted file or hosting URL
  - Extraction status (pending, processing, success, failed, retry)
*/

create table if not exists public.product_download_extractions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  source_post_url text not null,
  download_page_url text,
  final_download_url text,
  package_name text,
  file_size text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'success', 'failed', 'retry')),
  retries integer not null default 0,
  max_retries integer not null default 3,
  last_error text,
  extracted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_download_extractions_product_id
  on public.product_download_extractions(product_id);

create index if not exists idx_download_extractions_status
  on public.product_download_extractions(status);

alter table public.product_download_extractions enable row level security;

create policy "Admins can manage download extractions"
  on public.product_download_extractions
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, insert, update, delete
  on public.product_download_extractions
  to authenticated;
