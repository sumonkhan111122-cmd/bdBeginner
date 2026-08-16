import { getSupabase } from '@/lib/supabase';
import type {
  CouponRow,
  CouponRedemptionRow,
  PromotionRow,
  DiscountType,
  DiscountScope,
} from '@/types/discounts';

// ── Coupon CRUD ──

export async function fetchCoupons(): Promise<CouponRow[]> {
  const { data, error } = await getSupabase()
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CouponRow[];
}

export async function fetchCouponById(id: string): Promise<CouponRow | null> {
  const { data, error } = await getSupabase()
    .from('coupons')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as CouponRow | null;
}

export type CouponInput = {
  code: string;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount: number | null;
  scope: DiscountScope;
  global_usage_limit: number | null;
  per_customer_limit: number | null;
  first_order_only: boolean;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};

export async function createCoupon(input: CouponInput): Promise<CouponRow> {
  const { data, error } = await getSupabase()
    .from('coupons')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as CouponRow;
}

export async function updateCoupon(id: string, input: Partial<CouponInput>): Promise<CouponRow> {
  const { data, error } = await getSupabase()
    .from('coupons')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CouponRow;
}

export async function deleteCoupon(id: string): Promise<void> {
  // Delete junction rows first
  const sb = getSupabase();
  await sb.from('coupon_products').delete().eq('coupon_id', id);
  await sb.from('coupon_categories').delete().eq('coupon_id', id);
  const { error } = await sb.from('coupons').delete().eq('id', id);
  if (error) throw error;
}

export async function checkCouponCodeUnique(code: string, excludeId?: string): Promise<boolean> {
  let query = getSupabase()
    .from('coupons')
    .select('id')
    .ilike('code', code);
  if (excludeId) query = query.neq('id', excludeId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return !data;
}

// ── Coupon product/category sync ──

export async function fetchCouponProducts(couponId: string): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from('coupon_products')
    .select('product_id')
    .eq('coupon_id', couponId);
  if (error) throw error;
  return (data ?? []).map((r) => r.product_id);
}

export async function fetchCouponCategories(couponId: string): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from('coupon_categories')
    .select('category_id')
    .eq('coupon_id', couponId);
  if (error) throw error;
  return (data ?? []).map((r) => r.category_id);
}

export async function syncCouponProducts(couponId: string, productIds: string[]): Promise<void> {
  const sb = getSupabase();
  await sb.from('coupon_products').delete().eq('coupon_id', couponId);
  if (productIds.length === 0) return;
  const { error } = await sb.from('coupon_products').insert(
    productIds.map((pid) => ({ coupon_id: couponId, product_id: pid })),
  );
  if (error) throw error;
}

export async function syncCouponCategories(couponId: string, categoryIds: string[]): Promise<void> {
  const sb = getSupabase();
  await sb.from('coupon_categories').delete().eq('coupon_id', couponId);
  if (categoryIds.length === 0) return;
  const { error } = await sb.from('coupon_categories').insert(
    categoryIds.map((cid) => ({ coupon_id: couponId, category_id: cid })),
  );
  if (error) throw error;
}

// ── Coupon redemptions ──

export async function fetchCouponRedemptions(couponId: string): Promise<CouponRedemptionRow[]> {
  const { data, error } = await getSupabase()
    .from('coupon_redemptions')
    .select('*, orders!inner(order_number, customer_name)')
    .eq('coupon_id', couponId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => {
    const order = (r.orders ?? {}) as Record<string, unknown>;
    return {
      ...(r as unknown as CouponRedemptionRow),
      order_number: String(order.order_number ?? ''),
      customer_name: String(order.customer_name ?? ''),
    };
  });
}

// ── Promotion CRUD ──

export async function fetchPromotions(): Promise<PromotionRow[]> {
  const { data, error } = await getSupabase()
    .from('promotions')
    .select('*')
    .order('priority', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PromotionRow[];
}

export async function fetchPromotionById(id: string): Promise<PromotionRow | null> {
  const { data, error } = await getSupabase()
    .from('promotions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as PromotionRow | null;
}

export type PromotionInput = {
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount: number | null;
  scope: DiscountScope;
  priority: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
};

export async function createPromotion(input: PromotionInput): Promise<PromotionRow> {
  const { data, error } = await getSupabase()
    .from('promotions')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as PromotionRow;
}

export async function updatePromotion(id: string, input: Partial<PromotionInput>): Promise<PromotionRow> {
  const { data, error } = await getSupabase()
    .from('promotions')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as PromotionRow;
}

export async function deletePromotion(id: string): Promise<void> {
  const sb = getSupabase();
  await sb.from('promotion_products').delete().eq('promotion_id', id);
  await sb.from('promotion_categories').delete().eq('promotion_id', id);
  const { error } = await sb.from('promotions').delete().eq('id', id);
  if (error) throw error;
}

// ── Promotion product/category sync ──

export async function fetchPromotionProducts(promotionId: string): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from('promotion_products')
    .select('product_id')
    .eq('promotion_id', promotionId);
  if (error) throw error;
  return (data ?? []).map((r) => r.product_id);
}

export async function fetchPromotionCategories(promotionId: string): Promise<string[]> {
  const { data, error } = await getSupabase()
    .from('promotion_categories')
    .select('category_id')
    .eq('promotion_id', promotionId);
  if (error) throw error;
  return (data ?? []).map((r) => r.category_id);
}

export async function syncPromotionProducts(promotionId: string, productIds: string[]): Promise<void> {
  const sb = getSupabase();
  await sb.from('promotion_products').delete().eq('promotion_id', promotionId);
  if (productIds.length === 0) return;
  const { error } = await sb.from('promotion_products').insert(
    productIds.map((pid) => ({ promotion_id: promotionId, product_id: pid })),
  );
  if (error) throw error;
}

export async function syncPromotionCategories(promotionId: string, categoryIds: string[]): Promise<void> {
  const sb = getSupabase();
  await sb.from('promotion_categories').delete().eq('promotion_id', promotionId);
  if (categoryIds.length === 0) return;
  const { error } = await sb.from('promotion_categories').insert(
    categoryIds.map((cid) => ({ promotion_id: promotionId, category_id: cid })),
  );
  if (error) throw error;
}
