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

type CartContextValue = {
  items: CartItem[];
  count: number;
  /** Local subtotal (display fallback before server pricing arrives) */
  total: number;
  isOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
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

const CART_KEY = 'bdBeginner-cart';
const COUPON_KEY = 'bdBeginner-coupon';

function createCartItem(product: Product, quantity: number): CartItem {
  return {
    id: product.id,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    thumbnail: product.thumbnail,
    icon: product.icon,
    accent: product.accent,
    deliveryType: product.deliveryType,
    quantity,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const stored = sessionStorage.getItem(CART_KEY);
    if (!stored) return [];
    try {
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState<string | null>(() => {
    return sessionStorage.getItem(COUPON_KEY) || null;
  });

  // Pricing state
  const [pricing, setPricing] = useState<CheckoutPricingResult | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const pricingAbort = useRef<AbortController | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist cart + coupon
  useEffect(() => {
    sessionStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (couponCode) {
      sessionStorage.setItem(COUPON_KEY, couponCode);
    } else {
      sessionStorage.removeItem(COUPON_KEY);
    }
  }, [couponCode]);

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
          setPricing(result);
          setPricingError(null);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setPricingError(friendlyPricingError(err));
          // If coupon was the issue, clear it
          if (code) {
            setCouponCode(null);
            // Retry without coupon so we still get pricing
            try {
              const fallback = await calculateCheckoutPricing({
                items: cartItems.map((item) => ({
                  product_id: item.productId,
                  quantity: item.quantity,
                })),
                couponCode: null,
              });
              if (!controller.signal.aborted) {
                setPricing(fallback);
              }
            } catch {
              // Pricing entirely unavailable
            }
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

  // Debounced re-pricing on cart changes
  const schedulePricing = useCallback(
    (cartItems: CartItem[], code: string | null) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        runPricing(cartItems, code);
      }, 300);
    },
    [runPricing],
  );

  // Trigger pricing when items or coupon change
  const itemsRef = useRef(items);
  const couponRef = useRef(couponCode);
  useEffect(() => {
    const itemsChanged = itemsRef.current !== items;
    const couponChanged = couponRef.current !== couponCode;
    itemsRef.current = items;
    couponRef.current = couponCode;
    if (itemsChanged || couponChanged) {
      schedulePricing(items, couponCode);
    }
  }, [items, couponCode, schedulePricing]);

  // Initial pricing on mount if cart has items
  useEffect(() => {
    if (items.length > 0) {
      runPricing(items, couponCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Cart operations ──
  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, createCartItem(product, quantity)];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode(null);
    setPricing(null);
    setPricingError(null);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const hasItem = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items],
  );

  // ── Coupon operations ──
  const applyCoupon = useCallback(
    async (code: string): Promise<string | null> => {
      const normalizedCode = code.trim().toUpperCase();
      if (!normalizedCode) return 'Please enter a coupon code.';
      if (items.length === 0) return 'Your cart is empty.';

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

        if (result.discountSource === 'coupon') {
          setCouponCode(normalizedCode);
          setPricing(result);
          setPricingLoading(false);
          return null; // Success
        }

        // RPC didn't error but also didn't apply the coupon
        setPricingLoading(false);
        return 'This coupon does not apply to items in your cart.';
      } catch (err) {
        setPricingLoading(false);
        const msg = friendlyPricingError(err);
        setPricingError(msg);
        return msg;
      }
    },
    [items],
  );

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    // Pricing will recalculate via the effect (may restore a promotion)
  }, []);

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
