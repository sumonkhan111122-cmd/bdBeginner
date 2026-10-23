import { getSupabase } from '@/lib/supabase';
import { MEMBERSHIP_PLANS, type MembershipPlanId } from '@/data/membershipPlans';
import { createCheckoutOrderPriced, getGuestOrderReceipt } from '@/services/orders';
import { listOrderDownloadsGuest, openDownloadLinkGuest } from '@/services/downloads';

export interface MembershipStatus {
  isVip: boolean;
  planId: MembershipPlanId | null;
  planName: string | null;
  expiresAt: string | null;
  isLifetime: boolean;
  daysRemaining?: number;
  orderNumber?: string;
  source: 'database' | 'test_mode' | 'none';
}

const TEST_VIP_STORAGE_KEY = 'bdb_test_vip_plan';

/**
 * Clean up any legacy test override key from localStorage
 */
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(TEST_VIP_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getLocalTestVip(): MembershipPlanId | null {
  return null;
}

export function setLocalTestVip(_plan: MembershipPlanId | null): void {
  // Test mode disabled for security
}

/**
 * Checks whether a user has an active VIP membership from their paid orders in database.
 */
export async function checkUserMembership(userId?: string | null, email?: string | null): Promise<MembershipStatus> {
  if (!userId && !email) {
    return {
      isVip: false,
      planId: null,
      planName: null,
      expiresAt: null,
      isLifetime: false,
      source: 'none',
    };
  }

  try {
    const sb = getSupabase();
    let query = sb
      .from('orders')
      .select('id, order_number, user_id, customer_email, payment_status, created_at, order_items(id, product_id, product_slug)')
      .eq('payment_status', 'paid');

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},customer_email.eq.${email}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('customer_email', email);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });
    if (error || !orders || orders.length === 0) {
      return {
        isVip: false,
        planId: null,
        planName: null,
        expiresAt: null,
        isLifetime: false,
        source: 'database',
      };
    }

    const now = Date.now();

    // Check for Lifetime VIP first
    for (const order of orders) {
      const items = (order.order_items ?? []) as { id: string; product_id: string; product_slug?: string }[];
      const hasLifetime = items.some(
        (i) =>
          i.product_slug === 'membership-lifetime-pass' ||
          i.product_id === 'a0000001-0000-4000-8000-000000000003' ||
          i.product_id === 'a0000001-0000-0000-0000-000000000003'
      );
      if (hasLifetime) {
        return {
          isVip: true,
          planId: 'lifetime',
          planName: 'Lifetime VIP All-Access Pass',
          expiresAt: null,
          isLifetime: true,
          orderNumber: order.order_number,
          source: 'database',
        };
      }
    }

    // Check for Yearly / All-Access 1-Month VIP
    for (const order of orders) {
      const items = (order.order_items ?? []) as { id: string; product_id: string; product_slug?: string }[];
      const hasYearly = items.some(
        (i) =>
          i.product_slug === 'membership-yearly-pass' ||
          i.product_id === 'a0000001-0000-4000-8000-000000000002' ||
          i.product_id === 'a0000001-0000-0000-0000-000000000002'
      );
      if (hasYearly) {
        const orderDate = new Date(order.created_at).getTime();
        const expiryDate = orderDate + 30 * 24 * 60 * 60 * 1000;
        if (expiryDate > now) {
          const daysRemaining = Math.max(1, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));
          return {
            isVip: true,
            planId: 'yearly',
            planName: '1-Month All-Access Pass',
            expiresAt: new Date(expiryDate).toISOString(),
            isLifetime: false,
            daysRemaining,
            orderNumber: order.order_number,
            source: 'database',
          };
        }
      }
    }

    // Check for 10-Day Paid All-Access VIP (৳499)
    for (const order of orders) {
      const items = (order.order_items ?? []) as { id: string; product_id: string; product_slug?: string }[];
      const hasMonthly = items.some(
        (i) =>
          i.product_slug === 'membership-monthly-pass' ||
          i.product_id === 'a0000001-0000-4000-8000-000000000001' ||
          i.product_id === 'a0000001-0000-0000-0000-000000000001'
      );
      if (hasMonthly) {
        const orderDate = new Date(order.created_at).getTime();
        const expiryDate = orderDate + 10 * 24 * 60 * 60 * 1000;
        if (expiryDate > now) {
          const daysRemaining = Math.max(1, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));
          return {
            isVip: true,
            planId: 'monthly',
            planName: '১০ দিন পেইড পাস',
            expiresAt: new Date(expiryDate).toISOString(),
            isLifetime: false,
            daysRemaining,
            orderNumber: order.order_number,
            source: 'database',
          };
        }
      }
    }

    return {
      isVip: false,
      planId: null,
      planName: null,
      expiresAt: null,
      isLifetime: false,
      source: 'database',
    };
  } catch (err) {
    console.error('Failed to check user membership', err);
    return {
      isVip: false,
      planId: null,
      planName: null,
      expiresAt: null,
      isLifetime: false,
      source: 'none',
    };
  }
}

/**
 * Formats current date string in Asia/Dhaka time (UTC+6)
 */
export function getDhakaDateKey(): string {
  const now = new Date();
  const dhakaOffsetMs = 6 * 60 * 60 * 1000;
  const dhakaTime = new Date(now.getTime() + dhakaOffsetMs);
  const yyyy = dhakaTime.getUTCFullYear();
  const mm = String(dhakaTime.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dhakaTime.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Gets ISO UTC timestamp for start of current Dhaka calendar day (00:00:00 UTC+6)
 */
export function getDhakaStartOfDayIso(): string {
  const now = new Date();
  const dhakaOffsetMs = 6 * 60 * 60 * 1000;
  const dhakaTime = new Date(now.getTime() + dhakaOffsetMs);
  const midnightUtcMs =
    Date.UTC(dhakaTime.getUTCFullYear(), dhakaTime.getUTCMonth(), dhakaTime.getUTCDate()) -
    dhakaOffsetMs;
  return new Date(midnightUtcMs).toISOString();
}

/**
 * Gets total VIP claim orders placed today by this customer across DB and local storage
 */
export async function getTodayVipDownloadCount(
  userId?: string | null,
  email?: string | null
): Promise<number> {
  const dateKey = getDhakaDateKey();
  const storageId = (userId || email || 'guest').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const localKey = `bdb_vip_daily_${dateKey}_${storageId}`;
  let localCount = 0;
  if (typeof window !== 'undefined') {
    try {
      localCount = parseInt(localStorage.getItem(localKey) || '0', 10) || 0;
    } catch {
      // ignore
    }
  }

  let dbCount = 0;
  try {
    const sb = getSupabase();
    const todayIso = getDhakaStartOfDayIso();
    let query = sb
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', todayIso)
      .eq('payment_status', 'paid')
      .eq('coupon_code', 'VIP_PASS_FREE');

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},customer_email.eq.${email}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (email) {
      query = query.eq('customer_email', email);
    }

    const { count, error } = await query;
    if (!error && typeof count === 'number') {
      dbCount = count;
    }
  } catch {
    // non-blocking
  }

  return Math.max(localCount, dbCount);
}

/**
 * Records local counter increment after a successful VIP download claim
 */
export function recordLocalVipDownload(userId?: string | null, email?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const dateKey = getDhakaDateKey();
    const storageId = (userId || email || 'guest').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const localKey = `bdb_vip_daily_${dateKey}_${storageId}`;
    const current = parseInt(localStorage.getItem(localKey) || '0', 10) || 0;
    localStorage.setItem(localKey, String(current + 1));
  } catch {
    // ignore
  }
}

/**
 * Returns daily quota breakdown for UI display (used, limit, remaining)
 */
export async function getDailyDownloadQuota(
  userId?: string | null,
  email?: string | null,
  planId?: MembershipPlanId | null
): Promise<{ limit: number | null; used: number; remaining: number | null }> {
  if (!planId) {
    return { limit: null, used: 0, remaining: null };
  }
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  const limit = plan?.dailyDownloadLimit ?? null;
  if (limit === null) {
    return { limit: null, used: 0, remaining: null };
  }
  const used = await getTodayVipDownloadCount(userId, email);
  const remaining = Math.max(0, limit - used);
  return { limit, used, remaining };
}

/**
 * Claims a free product download for an active VIP member.
 * Enforces daily download limits (10 for ৳499, 20 for ৳899, unlimited for lifetime).
 * Creates an authorized 0 BDT paid order linked to the customer,
 * fetches the download link, and returns the direct URL.
 */
export async function claimVipProductDownload(
  product: { id: string; name: string; slug?: string },
  customer: { name: string; email: string; phone?: string; userId?: string }
): Promise<{ success: boolean; url?: string; orderNumber?: string; error?: string }> {
  try {
    // Strict verification: Customer must have an active VIP membership from a paid order
    const membership = await checkUserMembership(customer.userId, customer.email);
    if (!membership.isVip) {
      return {
        success: false,
        error: 'একটি সক্রিয় VIP মেম্বারশিপ একাউন্ট প্রয়োজন। মেম্বারশিপ প্যাকেজ ক্রয় করে লগইন অবস্থায় ডাউনলোড করুন।',
      };
    }

    // Daily Download Limit Verification (৳499 = 10 files/day, ৳899 = 20 files/day, ৳1,199 = Unlimited)
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === membership.planId);
    const dailyLimit = plan?.dailyDownloadLimit ?? null;

    if (dailyLimit !== null) {
      const todayCount = await getTodayVipDownloadCount(customer.userId, customer.email);
      if (todayCount >= dailyLimit) {
        const planTitle =
          membership.planId === 'monthly'
            ? '১০ দিন পেইড পাস (৳৪৯৯)'
            : '১ মাস অল-এক্সেস পাস (৳৮৯৯)';
        return {
          success: false,
          error: `আপনার ${planTitle} প্যাকেজের আজকের দৈনিক ডাউনলোড লিমিট (${dailyLimit}টি ফাইল) পূর্ণ হয়ে গেছে। রাত ১২টার পর পুনরায় ডাউনলোড করতে পারবেন। কোনো দৈনিক লিমিট ছাড়া সীমাহীন ডাউনলোডের জন্য আজীবন ভিআইপি পাসে (৳১,১৯৯) আপগ্রেড করুন!`,
        };
      }
    }

    let productId = product.id;

    // Defense-in-depth: Verify product exists in database, or lookup by slug
    try {
      const sb = getSupabase();
      const { data: dbProd } = await sb
        .from('products')
        .select('id, name, slug, category_id, categories(slug)')
        .eq('id', productId)
        .maybeSingle();

      if (!dbProd && product.slug) {
        const { data: bySlug } = await sb
          .from('products')
          .select('id, name, slug, category_id, categories(slug)')
          .eq('slug', product.slug)
          .maybeSingle();
        if (bySlug?.id) {
          productId = bySlug.id;
        }
      }
    } catch {
      // non-blocking
    }

    let orderResult;
    try {
      orderResult = await createCheckoutOrderPriced({
        customerName: customer.name.trim() || 'VIP Member',
        customerEmail: customer.email.trim(),
        customerPhone: customer.phone?.trim() || '01700000000',
        customerNote: `VIP Membership Claim: ${product.name}`,
        items: [{ product_id: productId, quantity: 1 }],
        couponCode: 'VIP_PASS_FREE',
      });
    } catch (orderErr: any) {
      if (orderErr?.message && orderErr.message.includes('coupon')) {
        orderResult = await createCheckoutOrderPriced({
          customerName: customer.name.trim() || 'VIP Member',
          customerEmail: customer.email.trim(),
          customerPhone: customer.phone?.trim() || '01700000000',
          customerNote: `VIP Membership Claim: ${product.name}`,
          items: [{ product_id: productId, quantity: 1 }],
        });
      } else {
        throw orderErr;
      }
    }

    if (!orderResult?.order_number || !orderResult?.access_token) {
      throw new Error('Could not generate VIP entitlement.');
    }

    // Record local counter increment
    recordLocalVipDownload(customer.userId, customer.email);

    // If user is authenticated, associate user_id with the new order in background
    if (customer.userId) {
      try {
        const sb = getSupabase();
        await sb.from('orders').update({ user_id: customer.userId }).eq('id', orderResult.order_id);
      } catch {
        // non-blocking
      }
    }

    // Get order receipt to retrieve order item ID safely without RLS restrictions
    const receipt = await getGuestOrderReceipt(orderResult.order_number, orderResult.access_token);
    const matchedItem = receipt.items?.find((i) => i.product_id === productId || i.product_id === product.id) || receipt.items?.[0];
    const orderItemId = matchedItem?.id;

    // Fetch download link via external-downloads guest protocol
    const links = await listOrderDownloadsGuest(orderResult.order_number, orderResult.access_token);
    if (!links || links.length === 0) {
      return {
        success: true,
        orderNumber: orderResult.order_number,
        url: '/account/downloads',
      };
    }

    if (!orderItemId) {
      throw new Error('Order item could not be verified.');
    }

    // Grab the first active download link
    const firstLink = links[0];
    const downloadUrl = await openDownloadLinkGuest(
      orderResult.order_number,
      orderResult.access_token,
      orderItemId,
      firstLink.id
    );

    return {
      success: true,
      url: downloadUrl,
      orderNumber: orderResult.order_number,
    };
  } catch (err: unknown) {
    console.error('VIP Claim Error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to claim VIP download. Please try again.',
    };
  }
}
