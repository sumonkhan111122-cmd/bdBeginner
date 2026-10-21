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
  product_id: string | number;
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

export function trackInitiateCheckout(
  items: Array<{ product: TrackProduct; quantity: number }>,
  totalValue: number,
): void {
  try {
    const contentIds = items.map((i) => String(i.product.id));
    const contents = items.map((i) => ({
      id: String(i.product.id),
      quantity: i.quantity,
      item_price: Number(i.product.salePrice ?? i.product.price) || 0,
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
          item_id: String(i.product.id),
          item_name: i.product.name,
          price: Number(i.product.salePrice ?? i.product.price) || 0,
          quantity: i.quantity,
        })),
      });
    }
  } catch (err) {
    console.debug('Tracking error (InitiateCheckout):', err);
  }
}

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
