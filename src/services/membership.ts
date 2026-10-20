import { getSupabase } from '@/lib/supabase';
import { MEMBERSHIP_PLANS, type MembershipPlanId } from '@/data/membershipPlans';
import { createCheckoutOrderPriced } from '@/services/orders';
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
 * Get locally overridden VIP plan for testing on localhost
 */
export function getLocalTestVip(): MembershipPlanId | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TEST_VIP_STORAGE_KEY);
  if (stored === 'monthly' || stored === 'yearly' || stored === 'lifetime') {
    return stored;
  }
  return null;
}

/**
 * Set locally overridden VIP plan for testing on localhost
 */
export function setLocalTestVip(plan: MembershipPlanId | null): void {
  if (typeof window === 'undefined') return;
  if (!plan) {
    localStorage.removeItem(TEST_VIP_STORAGE_KEY);
  } else {
    localStorage.setItem(TEST_VIP_STORAGE_KEY, plan);
  }
}

/**
 * Checks whether a user has an active VIP membership from their paid orders.
 */
export async function checkUserMembership(userId?: string | null, email?: string | null): Promise<MembershipStatus> {
  // 1. Check local developer/test override first (perfect for local testing)
  const localTest = getLocalTestVip();
  if (localTest) {
    const plan = MEMBERSHIP_PLANS.find((p) => p.id === localTest);
    return {
      isVip: true,
      planId: localTest,
      planName: plan?.nameBn || plan?.name || 'VIP Member (Test)',
      expiresAt: localTest === 'lifetime' ? null : new Date(Date.now() + (localTest === 'monthly' ? 30 : 365) * 86400000).toISOString(),
      isLifetime: localTest === 'lifetime',
      daysRemaining: localTest === 'lifetime' ? undefined : (localTest === 'monthly' ? 30 : 365),
      source: 'test_mode',
    };
  }

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
        (i) => i.product_slug === 'membership-lifetime-pass' || i.product_id === 'a0000001-0000-0000-0000-000000000003'
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

    // Check for Yearly VIP
    for (const order of orders) {
      const items = (order.order_items ?? []) as { id: string; product_id: string; product_slug?: string }[];
      const hasYearly = items.some(
        (i) => i.product_slug === 'membership-yearly-pass' || i.product_id === 'a0000001-0000-0000-0000-000000000002'
      );
      if (hasYearly) {
        const orderDate = new Date(order.created_at).getTime();
        const expiryDate = orderDate + 365 * 24 * 60 * 60 * 1000;
        if (expiryDate > now) {
          const daysRemaining = Math.max(1, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));
          return {
            isVip: true,
            planId: 'yearly',
            planName: '1-Year VIP Pass',
            expiresAt: new Date(expiryDate).toISOString(),
            isLifetime: false,
            daysRemaining,
            orderNumber: order.order_number,
            source: 'database',
          };
        }
      }
    }

    // Check for Monthly VIP
    for (const order of orders) {
      const items = (order.order_items ?? []) as { id: string; product_id: string; product_slug?: string }[];
      const hasMonthly = items.some(
        (i) => i.product_slug === 'membership-monthly-pass' || i.product_id === 'a0000001-0000-0000-0000-000000000001'
      );
      if (hasMonthly) {
        const orderDate = new Date(order.created_at).getTime();
        const expiryDate = orderDate + 30 * 24 * 60 * 60 * 1000;
        if (expiryDate > now) {
          const daysRemaining = Math.max(1, Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)));
          return {
            isVip: true,
            planId: 'monthly',
            planName: '1-Month VIP Pass',
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
 * Claims a free product download for an active VIP member.
 * Creates an authorized 0 BDT paid order linked to the customer,
 * fetches the download link, and returns the direct URL.
 */
export async function claimVipProductDownload(
  product: { id: string; name: string },
  customer: { name: string; email: string; phone?: string; userId?: string }
): Promise<{ success: boolean; url?: string; orderNumber?: string; error?: string }> {
  try {
    const orderResult = await createCheckoutOrderPriced({
      customerName: customer.name.trim() || 'VIP Member',
      customerEmail: customer.email.trim(),
      customerPhone: customer.phone?.trim() || '01700000000',
      customerNote: `VIP Membership Claim: ${product.name}`,
      items: [{ product_id: product.id, quantity: 1 }],
      couponCode: 'VIP_PASS_FREE',
    });

    if (!orderResult?.order_number || !orderResult?.access_token) {
      throw new Error('Could not generate VIP entitlement.');
    }

    // If user is authenticated, associate user_id with the new order in background
    if (customer.userId) {
      try {
        const sb = getSupabase();
        await sb.from('orders').update({ user_id: customer.userId }).eq('id', orderResult.order_id);
      } catch {
        // non-blocking
      }
    }

    // Fetch download link via external-downloads guest protocol
    const links = await listOrderDownloadsGuest(orderResult.order_number, orderResult.access_token);
    if (!links || links.length === 0) {
      return {
        success: true,
        orderNumber: orderResult.order_number,
        error: 'No active download file found for this product yet. Please contact support.',
      };
    }

    // Grab the first link
    const firstLink = links[0];
    const { data: orderDetails } = await getSupabase()
      .from('order_items')
      .select('id')
      .eq('order_id', orderResult.order_id)
      .eq('product_id', product.id)
      .maybeSingle();

    const orderItemId = orderDetails?.id;
    if (!orderItemId) {
      throw new Error('Order item not found.');
    }

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
