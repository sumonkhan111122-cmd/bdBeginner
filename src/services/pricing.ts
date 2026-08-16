import { getSupabase } from '@/lib/supabase';
import type { CheckoutPricingResult, DiscountSource } from '@/types/discounts';

type PricingInput = {
  items: { product_id: string; quantity: number }[];
  couponCode?: string | null;
  customerEmail?: string | null;
};

/**
 * Call the authoritative `calculate_checkout_pricing` RPC.
 * Frontend prices are DISPLAY ONLY — this is the single source of truth.
 */
export async function calculateCheckoutPricing(
  input: PricingInput,
): Promise<CheckoutPricingResult> {
  const { data, error } = await getSupabase().rpc('calculate_checkout_pricing', {
    p_items: input.items,
    p_coupon_code: input.couponCode || null,
    p_customer_email: input.customerEmail || null,
  });

  if (error) {
    console.error('calculate_checkout_pricing failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  return normalizePricingResult(data);
}

function normalizePricingResult(value: unknown): CheckoutPricingResult {
  const record = normalizeRecord(value);
  if (!record) throw new Error('Pricing returned an empty response.');

  return {
    subtotal: Number(record.subtotal ?? 0),
    discountTotal: Number(record.discount_total ?? 0),
    total: Number(record.total ?? record.subtotal ?? 0),
    currencyCode: String(record.currency_code ?? 'BDT'),
    discountSource: normalizeDiscountSource(record.discount_source),
    discountCode: record.discount_code ? String(record.discount_code) : null,
    discountName: record.discount_name ? String(record.discount_name) : null,
  };
}

function normalizeDiscountSource(value: unknown): DiscountSource {
  if (value === 'coupon' || value === 'promotion') return value;
  return null;
}

function normalizeRecord(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] && typeof value[0] === 'object' ? (value[0] as Record<string, unknown>) : null;
  return typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

// ── Friendly pricing error messages (§8) ──

const PRICING_ERROR_MAP: [test: RegExp, message: string][] = [
  [/invalid|inactive|not found/i, 'Coupon code is invalid or inactive.'],
  [/minimum/i, 'This order does not meet the coupon minimum.'],
  [/does not apply|not applicable|no eligible/i, 'This coupon does not apply to items in your cart.'],
  [/usage limit|global limit|exceeded/i, 'This coupon has reached its usage limit.'],
  [/already used|per.customer|customer limit/i, 'You have already used this coupon the maximum number of times.'],
  [/first.order/i, 'This coupon is available for first orders only.'],
  [/email.required|customer.email/i, 'Customer email is required to validate this coupon.'],
  [/expired/i, 'This coupon has expired.'],
  [/not.yet|scheduled|not.started/i, 'This coupon is not yet available.'],
];

export function friendlyPricingError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  for (const [test, message] of PRICING_ERROR_MAP) {
    if (test.test(raw)) return message;
  }
  return 'Could not apply the coupon. Please check and try again.';
}
