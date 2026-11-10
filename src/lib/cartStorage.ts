import type { CartItem, DeliveryType } from '@/types';

export const CART_KEY = 'bdBeginner-cart';
export const COUPON_KEY = 'bdBeginner-coupon';

const DELIVERY_TYPES: DeliveryType[] = ['instant-download', 'license-key', 'manual-delivery', 'subscription', 'service'];
const LEGACY_PRODUCT_IDS: Record<string, string> = {
  'a0000001-0000-0000-0000-000000000001': 'a0000001-0000-4000-8000-000000000001',
  'a0000001-0000-0000-0000-000000000002': 'a0000001-0000-4000-8000-000000000002',
  'a0000001-0000-0000-0000-000000000003': 'a0000001-0000-4000-8000-000000000003',
};

export function normalizeCartQuantity(value: number): number | null {
  if (!Number.isFinite(value) || value < 1 || value > Number.MAX_SAFE_INTEGER) return null;
  return Math.floor(value);
}

export function normalizeCoupon(value: string | null): string | null {
  return value?.trim().toUpperCase().slice(0, 40) || null;
}

/** Stored prices are display hints only; checkout always validates products and pricing on the server. */
export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items = new Map<string, CartItem>();
    for (const value of parsed) {
      if (!value || typeof value !== 'object') continue;
      const item = value as Partial<CartItem>;
      if (typeof item.productId !== 'string' || !item.productId.trim() ||
          typeof item.name !== 'string' || !item.name.trim() ||
          typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0 ||
          typeof item.quantity !== 'number') continue;
      const quantity = normalizeCartQuantity(item.quantity);
      if (quantity === null) continue;
      const productId = LEGACY_PRODUCT_IDS[item.productId] || item.productId;
      const previous = items.get(productId);
      const combinedQuantity = (previous?.quantity || 0) + quantity;
      if (!Number.isSafeInteger(combinedQuantity)) continue;
      items.set(productId, {
        id: productId,
        productId,
        name: item.name,
        price: item.price,
        quantity: combinedQuantity,
        slug: typeof item.slug === 'string' ? item.slug : '',
        thumbnail: typeof item.thumbnail === 'string' ? item.thumbnail : '',
        icon: typeof item.icon === 'string' ? item.icon : 'Package',
        accent: typeof item.accent === 'string' ? item.accent : 'brand',
        deliveryType: DELIVERY_TYPES.includes(item.deliveryType as DeliveryType) ? item.deliveryType! : 'instant-download',
      });
    }
    return [...items.values()];
  } catch {
    return [];
  }
}

/** Keep the cart usable when a browser blocks storage or the storage quota is full. */
export function readCartStorage(key: string): string | null {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return saved;
  } catch { /* Try the previous session storage when durable storage is unavailable. */ }
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeCartStorage(key: string, value: string | null): void {
  try {
    // Store the empty state too, so old session values cannot resurrect a cleared cart.
    localStorage.setItem(key, value ?? '');
    try { sessionStorage.removeItem(key); } catch { /* Storage may be blocked. */ }
    return;
  } catch { /* Fall back to session storage without interrupting shopping. */ }
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch { /* The current in-memory cart still works. */ }
}
