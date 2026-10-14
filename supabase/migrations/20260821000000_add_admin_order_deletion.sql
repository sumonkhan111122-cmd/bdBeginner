-- Migration: Add Admin Order Deletion Support
-- Description: Creates an atomic SECURITY DEFINER function to delete orders and their dependent rows,
-- and grants appropriate DELETE privileges and RLS policies for authenticated administrators.

-- 1. Create atomic RPC function for admin order deletion
CREATE OR REPLACE FUNCTION public.admin_delete_orders(p_order_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count int := 0;
BEGIN
  -- Strict administrator check: allows service_role or verified admin user
  IF NOT (
    COALESCE(auth.jwt() ->> 'role', '') = 'service_role'
    OR public.is_admin()
  ) THEN
    RAISE EXCEPTION 'Access denied. Administrator privileges required.';
  END IF;

  IF p_order_ids IS NULL OR array_length(p_order_ids, 1) IS NULL THEN
    RETURN jsonb_build_object('success', true, 'deleted_count', 0);
  END IF;

  -- 1. Delete dependent rows explicitly to avoid any constraint issues or trigger blocks
  DELETE FROM public.order_item_fulfillments WHERE order_id = ANY(p_order_ids);
  DELETE FROM public.payment_transactions WHERE order_id = ANY(p_order_ids);
  DELETE FROM public.order_email_log WHERE order_id = ANY(p_order_ids);
  DELETE FROM public.order_status_history WHERE order_id = ANY(p_order_ids);
  DELETE FROM public.order_items WHERE order_id = ANY(p_order_ids);
  DELETE FROM public.coupon_redemptions WHERE order_id = ANY(p_order_ids);
  UPDATE public.product_reviews SET verified_order_id = NULL WHERE verified_order_id = ANY(p_order_ids);

  -- 2. Delete the orders
  DELETE FROM public.orders WHERE id = ANY(p_order_ids);
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  RETURN jsonb_build_object('success', true, 'deleted_count', v_deleted_count);
END;
$$;

-- Revoke public access and grant to authenticated and service_role
REVOKE ALL ON FUNCTION public.admin_delete_orders(uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_orders(uuid[]) TO authenticated, service_role;

-- 2. Grant DELETE privileges on relevant tables to authenticated role so direct deletes can also evaluate
GRANT DELETE ON public.orders TO authenticated;
GRANT DELETE ON public.order_items TO authenticated;
GRANT DELETE ON public.order_status_history TO authenticated;
GRANT DELETE ON public.order_email_log TO authenticated;
GRANT DELETE ON public.payment_transactions TO authenticated;
GRANT DELETE ON public.order_item_fulfillments TO authenticated;

-- 3. Add DELETE RLS policies guarded by public.is_admin()
DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;
CREATE POLICY "Admins can delete orders"
ON public.orders FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;
CREATE POLICY "Admins can delete order items"
ON public.order_items FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete order status history" ON public.order_status_history;
CREATE POLICY "Admins can delete order status history"
ON public.order_status_history FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete order email log" ON public.order_email_log;
CREATE POLICY "Admins can delete order email log"
ON public.order_email_log FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins can delete payment transactions"
ON public.payment_transactions FOR DELETE TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete order fulfillments" ON public.order_item_fulfillments;
CREATE POLICY "Admins can delete order fulfillments"
ON public.order_item_fulfillments FOR DELETE TO authenticated
USING (public.is_admin());
