// ── Discount Types ──

export type DiscountType = 'percentage' | 'fixed_amount';
export type DiscountScope = 'entire_order' | 'selected_products' | 'selected_categories';
export type DiscountSource = 'coupon' | 'promotion' | null;

/** Derived status — NOT stored in DB */
export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'disabled';
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

export type CouponRow = {
  id: string;
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
  created_at: string;
  updated_at: string;
  // Joined counts (optional)
  redemption_count?: number;
};

export type PromotionRow = {
  id: string;
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
  created_at: string;
  updated_at: string;
};

export type CouponProductRow = {
  id: string;
  coupon_id: string;
  product_id: string;
};

export type CouponCategoryRow = {
  id: string;
  coupon_id: string;
  category_id: string;
};

export type PromotionProductRow = {
  id: string;
  promotion_id: string;
  product_id: string;
};

export type PromotionCategoryRow = {
  id: string;
  promotion_id: string;
  category_id: string;
};

export type CouponRedemptionRow = {
  id: string;
  coupon_id: string;
  order_id: string;
  user_id: string | null;
  customer_email: string;
  discount_amount: number;
  status: 'reserved' | 'redeemed' | 'released';
  created_at: string;
  updated_at: string;
  // Joined data
  order_number?: string;
  customer_name?: string;
};

// ── Pricing RPC result ──

export type CheckoutPricingResult = {
  subtotal: number;
  discountTotal: number;
  total: number;
  currencyCode: string;
  discountSource: DiscountSource;
  discountCode: string | null;
  discountName: string | null;
};

// ── Helpers ──

export function deriveCouponStatus(coupon: CouponRow): CouponStatus {
  if (!coupon.is_active) return 'disabled';
  const now = new Date();
  if (coupon.start_date && new Date(coupon.start_date) > now) return 'scheduled';
  if (coupon.end_date && new Date(coupon.end_date) < now) return 'expired';
  return 'active';
}

export function derivePromotionStatus(promo: PromotionRow): PromotionStatus {
  if (!promo.is_active) return 'disabled';
  const now = new Date();
  if (promo.start_date && new Date(promo.start_date) > now) return 'scheduled';
  if (promo.end_date && new Date(promo.end_date) < now) return 'expired';
  return 'active';
}
