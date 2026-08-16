/*
  # Add Payment Review Fields to payment_transactions

  1. Changes
    - Add `reviewed_by` (uuid, references `admin_users`)
    - Add `reviewed_at` (timestamptz)
    - Add `review_reason_code` (text)
    - Add `review_reason_text` (text)
*/

ALTER TABLE public.payment_transactions
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS review_reason_code text,
ADD COLUMN IF NOT EXISTS review_reason_text text;
