/*
  Prevent the same provider/manual transaction ID from being attached to
  multiple orders, including concurrent submissions that race the Edge
  Function's duplicate lookup.
*/

create unique index if not exists payment_transactions_provider_transaction_id_unique
  on public.payment_transactions (provider_transaction_id)
  where provider_transaction_id is not null;
