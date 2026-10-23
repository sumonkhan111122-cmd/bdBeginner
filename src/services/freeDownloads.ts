import { createCheckoutOrderPriced, getGuestOrderReceipt } from '@/services/orders';
import { listOrderDownloadsGuest, openDownloadLinkGuest } from '@/services/downloads';
import { getSupabase } from '@/lib/supabase';

export interface FreeDownloadResult {
  success: boolean;
  url?: string;
  title?: string;
  error?: string;
}

/**
 * Checks whether a given product belongs to a free category or has 0 price.
 * Free categories per instructions: WordPress Themes, WordPress Plugins, PHP Scripts & Code.
 */
export function isProductFree(product?: {
  price?: number;
  category?: string;
  subcategory?: string;
  slug?: string;
} | null): boolean {
  if (!product) return false;
  if (product.price === 0) return true;

  const cat = (product.category || '').toLowerCase();
  const subcat = (product.subcategory || '').toLowerCase();
  const slug = (product.slug || '').toLowerCase();

  if (
    cat.includes('wordpress') ||
    cat.includes('plugin') ||
    cat.includes('script') ||
    cat === 'theme' ||
    cat === 'themes'
  ) {
    return true;
  }

  if (
    subcat.includes('theme') ||
    subcat.includes('plugin') ||
    subcat.includes('script')
  ) {
    return true;
  }

  if (slug.includes('theme') || slug.includes('plugin') || slug.includes('script')) {
    // If not under software or course
    if (!cat.includes('course') && !cat.includes('software') && !cat.includes('service')) {
      return true;
    }
  }

  return false;
}

/**
 * Direct 1-Click Free Download helper for visitors & users.
 * 1. Calls the high-speed serverless /api/free-download endpoint.
 * 2. If unavailable (e.g. static dev server), seamlessly falls back to 0-BDT order generation.
 */
export async function claimFreeDownload(
  product: { id: string; name: string; slug?: string; price?: number; category?: string },
  customer?: { name?: string; email?: string }
): Promise<FreeDownloadResult> {
  // 1. Try instant API route first
  try {
    const params = new URLSearchParams();
    if (product.id) params.set('productId', product.id);
    if (product.slug) params.set('slug', product.slug);

    const res = await fetch(`/api/free-download?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.url) {
        return {
          success: true,
          url: data.url,
          title: data.title,
        };
      }
    }
  } catch (apiErr) {
    console.warn('API free download fallback:', apiErr);
  }

  // 2. Fallback to client-side 0-BDT order generation
  try {
    const custEmail = customer?.email || `free-visitor-${Date.now()}@bdbeginner.com`;
    const custName = customer?.name || 'Free Community Member';

    // Verify product ID in DB or lookup by slug
    let productId = product.id;
    try {
      const sb = getSupabase();
      if (product.slug) {
        const { data: dbProd } = await sb
          .from('products')
          .select('id, price')
          .eq('slug', product.slug)
          .maybeSingle();
        if (dbProd?.id) {
          productId = dbProd.id;
        }
      }
    } catch {
      // non-blocking
    }

    // Never pass couponCode for free (0-BDT) products as it triggers "This coupon does not apply"
    let orderResult;
    try {
      orderResult = await createCheckoutOrderPriced({
        customerName: custName,
        customerEmail: custEmail,
        customerPhone: '01700000000',
        customerNote: `Free Direct Download: ${product.name}`,
        items: [{ product_id: productId, quantity: 1 }],
      });
    } catch (orderErr: any) {
      // If error says payment required (product has price in DB), then retry with VIP_PASS_FREE
      if (orderErr?.message && !orderErr.message.includes('coupon')) {
        orderResult = await createCheckoutOrderPriced({
          customerName: custName,
          customerEmail: custEmail,
          customerPhone: '01700000000',
          customerNote: `Free Direct Download: ${product.name}`,
          items: [{ product_id: productId, quantity: 1 }],
          couponCode: 'VIP_PASS_FREE',
        });
      } else {
        throw orderErr;
      }
    }

    if (!orderResult?.order_number || !orderResult?.access_token) {
      throw new Error('ডাউনলোড টিকিট তৈরি করা যায়নি।');
    }

    const receipt = await getGuestOrderReceipt(orderResult.order_number, orderResult.access_token);
    const matchedItem = receipt.items?.find((i) => i.product_id === productId || i.product_id === product.id) || receipt.items?.[0];
    const orderItemId = matchedItem?.id;

    const links = await listOrderDownloadsGuest(orderResult.order_number, orderResult.access_token);
    if (!links || links.length === 0) {
      throw new Error('এই ফাইলটির জন্য কোনো ডাউনলোড লিঙ্ক পাওয়া যায়নি।');
    }

    if (!orderItemId) {
      throw new Error('অর্ডার আইটেম নিশ্চিত করা যায়নি।');
    }

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
      title: firstLink.title,
    };
  } catch (fallbackErr: any) {
    console.error('Free download claim failed:', fallbackErr);
    return {
      success: false,
      error: fallbackErr?.message || 'ডাউনলোড লিঙ্ক তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    };
  }
}
