/*
# Add Admin Analytics RPCs

1. New Functions
- `public.admin_analytics_summary`: Aggregate KPI metrics
- `public.admin_sales_series`: Time-series sales data
- `public.admin_top_products`: Top performing products
- `public.admin_payment_stats`: Payment provider success/failure stats
- `public.admin_discount_stats`: Coupon/promotion usage stats

2. Security
- All functions strictly require `public.is_admin() = true`.
- Execution revoked from `anon`.
*/

-- =========================================================
-- CLEAN UP PREVIOUS ANALYTICS RPC VERSIONS
-- Required because PostgreSQL cannot CREATE OR REPLACE
-- a function when its return type / OUT parameters changed.
-- NO CASCADE. NO TABLES OR DATA ARE TOUCHED.
-- =========================================================

DROP FUNCTION IF EXISTS public.admin_analytics_summary(
    timestamptz,
    timestamptz
);

DROP FUNCTION IF EXISTS public.admin_sales_series(
    timestamptz,
    timestamptz,
    text
);

DROP FUNCTION IF EXISTS public.admin_top_products(
    timestamptz,
    timestamptz
);

-- Remove an older 3-argument variant too if it exists.
DROP FUNCTION IF EXISTS public.admin_top_products(
    timestamptz,
    timestamptz,
    integer
);

DROP FUNCTION IF EXISTS public.admin_payment_stats(
    timestamptz,
    timestamptz
);

DROP FUNCTION IF EXISTS public.admin_discount_stats(
    timestamptz,
    timestamptz
);

-- 1. admin_analytics_summary
CREATE OR REPLACE FUNCTION public.admin_analytics_summary(
    start_date timestamptz,
    end_date timestamptz
) RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    result json;
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    WITH period_orders AS (
        SELECT *
        FROM public.orders
        WHERE created_at >= start_date AND created_at < end_date
    ),
    paid_orders AS (
        SELECT * FROM period_orders WHERE payment_status = 'paid'
    ),
    refunded_orders AS (
        SELECT * FROM period_orders WHERE payment_status = 'refunded'
    ),
    customer_stats AS (
        SELECT 
            COUNT(DISTINCT customer_email) as unique_paid_customers,
            COUNT(DISTINCT CASE 
                WHEN (
                    SELECT MIN(created_at) 
                    FROM public.orders o2 
                    WHERE o2.customer_email = po.customer_email 
                    AND o2.payment_status = 'paid'
                ) >= start_date 
                THEN customer_email 
            END) as new_paid_customers
        FROM paid_orders po
    )
    SELECT json_build_object(
        'paid_sales', COALESCE((SELECT SUM(total) FROM paid_orders), 0),
        'paid_orders', (SELECT COUNT(*) FROM paid_orders),
        'discounts_given', COALESCE((SELECT SUM(discount_total) FROM paid_orders), 0),
        'refunded_order_value', COALESCE((SELECT SUM(total) FROM refunded_orders), 0),
        'unique_paid_customers', (SELECT unique_paid_customers FROM customer_stats),
        'new_paid_customers', (SELECT new_paid_customers FROM customer_stats),
        'returning_paid_customers', (SELECT unique_paid_customers - new_paid_customers FROM customer_stats)
    ) INTO result;

    RETURN result;
END;
$$;


-- 2. admin_sales_series
CREATE OR REPLACE FUNCTION public.admin_sales_series(
    start_date timestamptz,
    end_date timestamptz,
    interval_expr text
) RETURNS TABLE (
    bucket_date timestamptz,
    paid_sales numeric,
    paid_orders bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    WITH buckets AS (
        SELECT generate_series(start_date, end_date - interval '1 microsecond', interval_expr::interval) as bucket_start
    )
    SELECT 
        b.bucket_start,
        COALESCE(SUM(o.total), 0)::numeric as paid_sales,
        COUNT(o.id)::bigint as paid_orders
    FROM buckets b
    LEFT JOIN public.orders o 
        ON o.created_at >= b.bucket_start 
        AND o.created_at < b.bucket_start + interval_expr::interval
        AND o.payment_status = 'paid'
    GROUP BY b.bucket_start
    ORDER BY b.bucket_start;
END;
$$;


-- 3. admin_top_products
CREATE OR REPLACE FUNCTION public.admin_top_products(
    start_date timestamptz,
    end_date timestamptz
) RETURNS TABLE (
    product_id uuid,
    product_name text,
    units_sold bigint,
    paid_orders bigint,
    gross_sales numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        oi.product_id,
        MAX(COALESCE(oi.product_name, 'Unknown Product'))::text,
        SUM(oi.quantity)::bigint,
        COUNT(DISTINCT oi.order_id)::bigint,
        SUM(oi.line_total)::numeric
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE o.created_at >= start_date 
      AND o.created_at < end_date
      AND o.payment_status = 'paid'
    GROUP BY oi.product_id
    ORDER BY SUM(oi.quantity) DESC;
END;
$$;


-- 4. admin_payment_stats
CREATE OR REPLACE FUNCTION public.admin_payment_stats(
    start_date timestamptz,
    end_date timestamptz
) RETURNS TABLE (
    provider text,
    attempts bigint,
    succeeded bigint,
    failed bigint,
    pending bigint,
    cancelled bigint,
    succeeded_amount numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        pt.provider::text,
        COUNT(*)::bigint as attempts,
        COUNT(CASE WHEN pt.status = 'succeeded' THEN 1 END)::bigint as succeeded,
        COUNT(CASE WHEN pt.status = 'failed' THEN 1 END)::bigint as failed,
        COUNT(CASE WHEN pt.status = 'pending' THEN 1 END)::bigint as pending,
        COUNT(CASE WHEN pt.status = 'cancelled' THEN 1 END)::bigint as cancelled,
        COALESCE(SUM(CASE WHEN pt.status = 'succeeded' THEN pt.amount ELSE 0 END), 0)::numeric as succeeded_amount
    FROM public.payment_transactions pt
    WHERE pt.created_at >= start_date 
      AND pt.created_at < end_date
    GROUP BY pt.provider
    ORDER BY COUNT(*) DESC;
END;
$$;


-- 5. admin_discount_stats
CREATE OR REPLACE FUNCTION public.admin_discount_stats(
    start_date timestamptz,
    end_date timestamptz
) RETURNS TABLE (
    discount_source text,
    discount_code text,
    paid_orders bigint,
    subtotal_before numeric,
    discount_given numeric,
    paid_sales_after numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF auth.uid() IS NULL OR NOT COALESCE(public.is_admin(), false) THEN
        RAISE EXCEPTION 'Access denied';
    END IF;

    RETURN QUERY
    SELECT 
        o.discount_source::text,
        CASE 
            WHEN o.discount_source = 'coupon' THEN COALESCE(o.discount_code, o.discount_name, 'Coupon')
            WHEN o.discount_source = 'promotion' THEN COALESCE(o.discount_name, 'Promotion')
            ELSE COALESCE(o.discount_code, o.discount_name, 'Discount')
        END::text as discount_code,
        COUNT(*)::bigint as paid_orders,
        SUM(o.subtotal)::numeric as subtotal_before,
        SUM(o.discount_total)::numeric as discount_given,
        SUM(o.total)::numeric as paid_sales_after
    FROM public.orders o
    WHERE o.created_at >= start_date 
      AND o.created_at < end_date
      AND o.payment_status = 'paid'
      AND o.discount_total > 0
      AND (o.discount_source IS NOT NULL OR o.discount_code IS NOT NULL OR o.discount_name IS NOT NULL)
    GROUP BY 
        o.discount_source, 
        CASE 
            WHEN o.discount_source = 'coupon' THEN COALESCE(o.discount_code, o.discount_name, 'Coupon')
            WHEN o.discount_source = 'promotion' THEN COALESCE(o.discount_name, 'Promotion')
            ELSE COALESCE(o.discount_code, o.discount_name, 'Discount')
        END
    ORDER BY SUM(o.discount_total) DESC;
END;
$$;

-- Grant execution to authenticated users
REVOKE EXECUTE ON FUNCTION public.admin_analytics_summary(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_analytics_summary(timestamptz, timestamptz) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_sales_series(timestamptz, timestamptz, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_sales_series(timestamptz, timestamptz, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_top_products(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_top_products(timestamptz, timestamptz) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_payment_stats(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_payment_stats(timestamptz, timestamptz) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_discount_stats(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_discount_stats(timestamptz, timestamptz) TO authenticated;
