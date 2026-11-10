import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Product, CartItem } from '@/types';
import type { CheckoutPricingResult } from '@/types/discounts';
import { calculateCheckoutPricing, friendlyPricingError } from '@/services/pricing';
import { trackAddToCart } from '@/lib/tracking';
import { CART_KEY, COUPON_KEY, normalizeCartQuantity, normalizeCoupon, parseStoredCart, readCartStorage, writeCartStorage } from '@/lib/cartStorage';

type CartContextValue = {
  items: CartItem[];
  count: number;
  /** Local subtotal (display fallback before server pricing arrives) */
  total: number;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, openCart?: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  hasItem: (productId: string) => boolean;
  /** Coupon state */
  couponCode: string | null;
  applyCoupon: (code: string) => Promise<string | null>;
  removeCoupon: () => void;
  /** Server-authoritative pricing */
  pricing: CheckoutPricingResult | null;
  pricingLoading: boolean;
  pricingError: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

function createCartItem(product: Product, quantity: number): CartItem {
  return {
    id: product.id,
    productId: product.id,
    slug: product.slug || '',
    name: product.name || 'Digital Product',
    price: Number.isFinite(product.price) && product.price >= 0 ? product.price : 0,
    thumbnail: product.thumbnail || '',
    icon: product.icon || 'Package',
    accent: product.accent || 'brand',
    deliveryType: product.deliveryType || 'instant-download',
    quantity,
  };
}

function pricingKey(items: CartItem[], code: string | null): string {
  return JSON.stringify([items.map((item) => [item.productId, item.quantity]), code]);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error && 'message' in error) return String(error.message);
  return String(error);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => parseStoredCart(readCartStorage(CART_KEY)));
  const [isOpen, setIsOpen] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState<string | null>(() => {
    return normalizeCoupon(readCartStorage(COUPON_KEY));
  });

  // Pricing state
  const [pricing, setPricing] = useState<CheckoutPricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const pricingAbort = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const acceptedPricingKey = useRef<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const couponRef = useRef(couponCode);
  couponRef.current = couponCode;

  const invalidatePricing = useCallback(() => {
    pricingAbort.current?.abort();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    acceptedPricingKey.current = null;
    setPricing(null);
    setPricingError(null);
    setPricingLoading(false);
  }, []);

  // Persist cart + coupon
  useEffect(() => {
    writeCartStorage(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    writeCartStorage(COUPON_KEY, couponCode);
  }, [couponCode]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CART_KEY && event.key !== COUPON_KEY) return;
      try { if (event.storageArea !== localStorage) return; } catch { return; }
      const nextItems = event.key === null || event.key === CART_KEY
        ? parseStoredCart(event.key === null ? null : event.newValue) : itemsRef.current;
      const nextCoupon = event.key === null || event.key === COUPON_KEY
        ? normalizeCoupon(event.key === null ? null : event.newValue) : couponRef.current;
      const itemsChanged = JSON.stringify(itemsRef.current) !== JSON.stringify(nextItems);
      const couponChanged = couponRef.current !== nextCoupon;
      if (!itemsChanged && !couponChanged) return;
      invalidatePricing();
      if (itemsChanged) setItems(nextItems);
      if (couponChanged) setCouponCode(nextCoupon);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [invalidatePricing]);

  // ── Pricing RPC ──
  const runPricing = useCallback(
    async (cartItems: CartItem[], code: string | null) => {
      if (cartItems.length === 0) {
        setPricing(null);
        setPricingError(null);
        setPricingLoading(false);
        return;
      }

      // Cancel previous in-flight request
      pricingAbort.current?.abort();
      const controller = new AbortController();
      pricingAbort.current = controller;

      setPricingLoading(true);
      setPricingError(null);

      try {
        const result = await calculateCheckoutPricing({
          items: cartItems.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
          couponCode: code,
        });

        if (!controller.signal.aborted) {
          acceptedPricingKey.current = pricingKey(cartItems, code);
          setPricing(result);
          setPricingError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const rawMessage = errorMessage(err);
          setPricingError(code ? friendlyPricingError(new Error(rawMessage)) : 'Could not refresh prices. Please check your connection and try again.');
          // A temporary network error must not discard a saved coupon.
          if (code && /coupon|minimum|usage limit|already used|first.order|expired|not applicable|no eligible/i.test(rawMessage)) {
            // The state change schedules one fresh request without the invalid coupon.
            setCouponCode(null);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setPricingLoading(false);
        }
      }
    },
    [],
  );

  // Invalidate stale results before the debounce, including when the cart becomes empty.
  useEffect(() => {
    if (acceptedPricingKey.current === pricingKey(items, couponCode)) return;
    invalidatePricing();
    if (items.length === 0) return;
    setPricingLoading(true);
    debounceTimer.current = setTimeout(() => runPricing(items, couponCode), 300);
  }, [items, couponCode, invalidatePricing, runPricing]);

  useEffect(() => {
    return () => {
      pricingAbort.current?.abort();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // ── Cart operations ──
  const addItem = useCallback((product: Product, quantity = 1, shouldOpenCart = true) => {
    if (!product || !product.id || typeof product.id !== 'string') {
      console.error('Invalid product passed to addItem:', product);
      return;
    }
    const safeQty = normalizeCartQuantity(quantity);
    if (safeQty === null) return;
    invalidatePricing();
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(Number.MAX_SAFE_INTEGER, item.quantity + safeQty) }
            : item,
        );
      }
      return [...prev, createCartItem(product, safeQty)];
    });
    trackAddToCart(product, safeQty);
    if (shouldOpenCart) {
      setIsOpen(true);
    }
  }, [invalidatePricing]);

  const removeItem = useCallback((productId: string) => {
    invalidatePricing();
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, [invalidatePricing]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const safeQty = normalizeCartQuantity(quantity);
    if (safeQty === null) return;
    invalidatePricing();
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity: safeQty } : item,
      ),
    );
  }, [invalidatePricing]);

  const clearCart = useCallback(() => {
    invalidatePricing();
    setItems([]);
    setCouponCode(null);
    setPricing(null);
    setPricingError(null);
  }, [invalidatePricing]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const hasItem = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items],
  );

  // ── Coupon operations ──
  const applyCoupon = useCallback(
    async (code: string): Promise<string | null> => {
      const normalizedCode = normalizeCoupon(code);
      if (!normalizedCode) return 'Please enter a coupon code.';
      if (items.length === 0) return 'Your cart is empty.';

      pricingAbort.current?.abort();
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const controller = new AbortController();
      pricingAbort.current = controller;
      setPricingLoading(true);
      setPricingError(null);

      try {
        const result = await calculateCheckoutPricing({
          items: items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
          couponCode: normalizedCode,
        });

        if (controller.signal.aborted || itemsRef.current !== items) return 'Your cart changed. Please apply the coupon again.';

        if (result.discountSource === 'coupon') {
          acceptedPricingKey.current = pricingKey(items, normalizedCode);
          setCouponCode(normalizedCode);
          setPricing(result);
          setPricingLoading(false);
          return null; // Success
        }

        // RPC didn't error but also didn't apply the coupon
        setPricingLoading(false);
        if (!pricing) void runPricing(items, couponCode);
        return 'This coupon does not apply to items in your cart.';
      } catch (err) {
        if (controller.signal.aborted) return 'Your cart changed. Please apply the coupon again.';
        setPricingLoading(false);
        const msg = friendlyPricingError(new Error(errorMessage(err)));
        setPricingError(msg);
        if (!pricing) void runPricing(items, couponCode);
        return msg;
      }
    },
    [items, pricing, couponCode, runPricing],
  );

  const removeCoupon = useCallback(() => {
    invalidatePricing();
    setCouponCode(null);
    // Pricing will recalculate via the effect (may restore a promotion)
  }, [invalidatePricing]);

  // ── Derived values ──
  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    count,
    total,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    hasItem,
    couponCode,
    applyCoupon,
    removeCoupon,
    pricing,
    pricingLoading,
    pricingError,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
