declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type TrackProduct = {
  id: string | number;
  name: string;
  price: number;
  salePrice?: number | null;
  category?: { name: string } | string | null;
};

export type TrackOrderItem = {
  product_id?: string | number | null;
  product_name?: string;
  quantity?: number;
  unit_price?: number;
};

export type TrackOrder = {
  id: string;
  order_number?: string;
  total_amount: number;
  currency_code?: string;
  items: TrackOrderItem[];
};

export type TrackCheckoutItem = {
  id?: string | number;
  productId?: string | number;
  name?: string;
  price?: number;
  quantity?: number;
  product?: TrackProduct;
};

/**
 * 1. PageView - Triggered on route / page change
 */
export function trackPageView(url?: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: url || window.location.pathname,
      });
    }
  } catch (err) {
    console.debug('Tracking error (PageView):', err);
  }
}

/**
 * 2. ViewContent - Viewing a key product or landing page
 */
export function trackViewContent(product: TrackProduct): void {
  try {
    const value = Number(product.salePrice ?? product.price) || 0;
    const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || 'Digital Products';
    const productIdStr = String(product.id);

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', {
        content_name: product.name,
        content_category: categoryName,
        content_ids: [productIdStr],
        content_type: 'product',
        value,
        currency: 'BDT',
      });
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', {
        currency: 'BDT',
        value,
        items: [
          {
            item_id: productIdStr,
            item_name: product.name,
            item_category: categoryName,
            price: value,
            quantity: 1,
          },
        ],
      });
    }
  } catch (err) {
    console.debug('Tracking error (ViewContent):', err);
  }
}

/**
 * 3. AddToCart - Adding an item to shopping cart or basket
 */
export function trackAddToCart(product: TrackProduct, quantity = 1): void {
  try {
    const unitPrice = Number(product.salePrice ?? product.price) || 0;
    const value = unitPrice * Math.max(1, quantity);
    const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || 'Digital Products';
    const productIdStr = String(product.id);

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_category: categoryName,
        content_ids: [productIdStr],
        content_type: 'product',
        value,
        currency: 'BDT',
      });
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_cart', {
        currency: 'BDT',
        value,
        items: [
          {
            item_id: productIdStr,
            item_name: product.name,
            item_category: categoryName,
            price: unitPrice,
            quantity,
          },
        ],
      });
    }
  } catch (err) {
    console.debug('Tracking error (AddToCart):', err);
  }
}

/**
 * 4. AddToWishlist - Adding items to a wishlist
 */
export function trackAddToWishlist(product: { id: string | number; name?: string; price?: number }): void {
  try {
    const productIdStr = String(product.id);
    const value = Number(product.price) || 0;

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'AddToWishlist', {
        content_name: product.name || `Product ${productIdStr}`,
        content_ids: [productIdStr],
        content_type: 'product',
        value,
        currency: 'BDT',
      });
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'add_to_wishlist', {
        currency: 'BDT',
        value,
        items: [{ item_id: productIdStr, item_name: product.name, price: value }],
      });
    }
  } catch (err) {
    console.debug('Tracking error (AddToWishlist):', err);
  }
}

/**
 * 5. InitiateCheckout - The start of a checkout process
 */
export function trackInitiateCheckout(
  items: Array<TrackCheckoutItem>,
  totalValue: number,
): void {
  try {
    const getProductId = (i: TrackCheckoutItem) => String(i.productId ?? i.product?.id ?? i.id ?? '');
    const getProductName = (i: TrackCheckoutItem) => i.name ?? i.product?.name ?? 'Item';
    const getUnitPrice = (i: TrackCheckoutItem) => Number(i.product?.salePrice ?? i.price ?? i.product?.price) || 0;
    const getQuantity = (i: TrackCheckoutItem) => i.quantity ?? 1;

    const contentIds = items.map(getProductId).filter(Boolean);
    const contents = items.map((i) => ({
      id: getProductId(i),
      quantity: getQuantity(i),
      item_price: getUnitPrice(i),
    }));

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: contentIds,
        contents,
        content_type: 'product',
        value: totalValue,
        num_items: items.length,
        currency: 'BDT',
      });
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        currency: 'BDT',
        value: totalValue,
        items: items.map((i) => ({
          item_id: getProductId(i),
          item_name: getProductName(i),
          price: getUnitPrice(i),
          quantity: getQuantity(i),
        })),
      });
    }
  } catch (err) {
    console.debug('Tracking error (InitiateCheckout):', err);
  }
}

/**
 * 6. AddPaymentInfo - Adding customer payment information during checkout
 */
export function trackAddPaymentInfo(totalValue = 0, paymentMethod?: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'AddPaymentInfo', {
        value: totalValue,
        currency: 'BDT',
        content_category: paymentMethod || 'bKash / Nagad / Rocket',
      });
    }
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'add_payment_info', {
        currency: 'BDT',
        value: totalValue,
        payment_type: paymentMethod || 'bKash / Nagad / Rocket',
      });
    }
  } catch (err) {
    console.debug('Tracking error (AddPaymentInfo):', err);
  }
}

/**
 * 7. Purchase - Completion of a purchase
 */
export function trackPurchase(order: TrackOrder): void {
  try {
    const storageKey = `bdb_tracked_purchase_${order.id}`;
    if (typeof sessionStorage !== 'undefined') {
      if (sessionStorage.getItem(storageKey)) return;
      sessionStorage.setItem(storageKey, 'true');
    }

    const contentIds = order.items.map((i) => String(i.product_id));
    const value = Number(order.total_amount) || 0;
    const currency = order.currency_code || 'BDT';

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        content_ids: contentIds,
        content_type: 'product',
        value,
        currency,
        num_items: order.items.length,
      });
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: order.order_number || order.id,
        value,
        currency,
        items: order.items.map((i) => ({
          item_id: String(i.product_id),
          item_name: i.product_name || `Item ${i.product_id}`,
          price: Number(i.unit_price) || 0,
          quantity: i.quantity || 1,
        })),
      });
    }
  } catch (err) {
    console.debug('Tracking error (Purchase):', err);
  }
}

/**
 * 8. Lead - Submission of inquiry, contact, or pre-order interest
 */
export function trackLead(leadName = 'Course Inquiry', value = 0): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', {
        content_name: leadName,
        value: Number(value) || 0,
        currency: 'BDT',
      });
    }
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        currency: 'BDT',
        value: Number(value) || 0,
      });
    }
  } catch (err) {
    console.debug('Tracking error (Lead):', err);
  }
}

/**
 * 9. CompleteRegistration - User sign-up or registration
 */
export function trackCompleteRegistration(method = 'Email'): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'CompleteRegistration', {
        status: true,
        content_name: method,
      });
    }
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'sign_up', {
        method,
      });
    }
  } catch (err) {
    console.debug('Tracking error (CompleteRegistration):', err);
  }
}

/**
 * 10. Contact - User contacting via WhatsApp, Phone, or Contact form
 */
export function trackContact(channel = 'WhatsApp'): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Contact', {
        content_name: channel,
      });
    }
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'contact', {
        method: channel,
      });
    }
  } catch (err) {
    console.debug('Tracking error (Contact):', err);
  }
}

/**
 * 11. Subscribe - Paid VIP membership or recurring subscription
 */
export function trackSubscribe(planName: string, value: number): void {
  try {
    const val = Number(value) || 0;
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Subscribe', {
        value: val,
        currency: 'BDT',
        predicted_ltv: val * 1.5,
      });
    }
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'subscribe', {
        currency: 'BDT',
        value: val,
      });
    }
  } catch (err) {
    console.debug('Tracking error (Subscribe):', err);
  }
}

/**
 * 12. Search - User search query
 */
export function trackSearch(query: string): void {
  try {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Search', {
        search_string: trimmed,
      });
    }

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'search', {
        search_term: trimmed,
      });
    }
  } catch (err) {
    console.debug('Tracking error (Search):', err);
  }
}

/**
 * 13. StartTrial - Starting a free demo or trial session
 */
export function trackStartTrial(courseName = 'AI Motion Masterclass Demo', value = 0): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'StartTrial', {
        value: Number(value) || 0,
        currency: 'BDT',
        predicted_ltv: 290,
      });
    }
  } catch (err) {
    console.debug('Tracking error (StartTrial):', err);
  }
}

/**
 * 14. CustomizeProduct - Customizing a service or product options
 */
export function trackCustomizeProduct(customizationName: string): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'CustomizeProduct', {
        content_name: customizationName,
      });
    }
  } catch (err) {
    console.debug('Tracking error (CustomizeProduct):', err);
  }
}

/**
 * 15. Schedule - Booking consultation or meeting
 */
export function trackSchedule(appointmentType = 'Consultation'): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Schedule', {
        content_name: appointmentType,
      });
    }
  } catch (err) {
    console.debug('Tracking error (Schedule):', err);
  }
}

/**
 * 16. SubmitApplication - Applying for course certificate or partnership
 */
export function trackSubmitApplication(applicationType = 'Certificate Application'): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'SubmitApplication', {
        content_name: applicationType,
      });
    }
  } catch (err) {
    console.debug('Tracking error (SubmitApplication):', err);
  }
}

/**
 * 17. Donate
 */
export function trackDonate(amount = 0): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Donate', {
        value: Number(amount) || 0,
        currency: 'BDT',
      });
    }
  } catch (err) {
    console.debug('Tracking error (Donate):', err);
  }
}

/**
 * 18. FindLocation
 */
export function trackFindLocation(): void {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'FindLocation');
    }
  } catch (err) {
    console.debug('Tracking error (FindLocation):', err);
  }
}
