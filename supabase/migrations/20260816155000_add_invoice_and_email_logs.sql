-- Migration: Add Invoice fields and Email Logs

-- 1. Add Invoice fields to orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS invoice_number text,
ADD COLUMN IF NOT EXISTS invoice_issued_at timestamp with time zone;

-- Create an index for quick lookup by invoice number
CREATE INDEX IF NOT EXISTS idx_orders_invoice_number ON public.orders(invoice_number);

-- 2. Modify order_email_log (already exists in production)
ALTER TABLE public.order_email_log
ADD COLUMN IF NOT EXISTS attachment text;
