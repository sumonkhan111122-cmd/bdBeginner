-- Safe idempotent migration to add missing columns for Phase 12

-- Coupons Table
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS maximum_discount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS global_usage_limit INTEGER,
  ADD COLUMN IF NOT EXISTS per_customer_limit INTEGER,
  ADD COLUMN IF NOT EXISTS first_order_only BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Promotions Table
ALTER TABLE public.promotions
  ADD COLUMN IF NOT EXISTS maximum_discount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;

-- Ensure schema cache is refreshed for PostgREST
NOTIFY pgrst, 'reload schema';
