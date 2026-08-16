import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Download,
  KeyRound,
  Clock,
  Repeat,
  Wrench,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { deliveryLabels } from '@/data/homepage';
import type { DeliveryType } from '@/types';

const deliveryIconMap: Record<DeliveryType, typeof Download> = {
  'instant-download': Download,
  'license-key': KeyRound,
  'manual-delivery': Clock,
  subscription: Repeat,
  service: Wrench,
};

const accentMap: Record<string, { bg: string; icon: string }> = {
  brand: { bg: 'bg-brand-50/60', icon: 'text-brand-600' },
  accent: { bg: 'bg-accent-50/60', icon: 'text-accent-600' },
  ink: { bg: 'bg-ink-50', icon: 'text-ink-600' },
  success: { bg: 'bg-success-50/60', icon: 'text-success-600' },
  warning: { bg: 'bg-warning-50/60', icon: 'text-warning-600' },
};

export function CartDrawer() {
  const formatPrice = useCurrencyFormatter();
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } =
    useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[70] bg-ink-950/40 backdrop-blur-sm animate-fade-in"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-[71] flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-smooth ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={20} className="text-ink-700" />
            <h2 className="font-display text-base font-bold text-ink-900">
              Cart {count > 0 && <span className="text-ink-400">({count})</span>}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-300">
              <ShoppingCart size={28} />
            </div>
            <p className="mt-4 font-display text-base font-bold text-ink-900">
              Your cart is empty
            </p>
            <p className="mt-1.5 text-sm text-ink-500">
              Browse the marketplace and add products to get started.
            </p>
            <Link
              to="/products"
              onClick={closeCart}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Explore Products
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="flex flex-col gap-3">
                {items.map((item) => {
                  const Icon = (Icons[item.icon as keyof typeof Icons] ??
                    Icons.Package) as Icons.LucideIcon;
                  const accent = accentMap[item.accent] ?? accentMap.brand;
                  const DeliveryIcon = deliveryIconMap[item.deliveryType];

                  return (
                    <li
                      key={item.productId}
                      className="flex gap-3 rounded-xl border border-ink-100 bg-white p-3"
                    >
                      <Link
                        to={`/products/${item.slug}`}
                        onClick={closeCart}
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg ${accent.bg}`}
                      >
                        <Icon
                          size={24}
                          className={accent.icon}
                          strokeWidth={1.5}
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={closeCart}
                          className="font-display text-sm font-bold leading-snug text-ink-900 line-clamp-2 hover:text-brand-600"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-ink-400">
                          <DeliveryIcon size={12} />
                          {deliveryLabels[item.deliveryType]}
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="flex items-center gap-1 rounded-lg border border-ink-100 bg-ink-50 px-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold text-ink-700">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900"
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-display text-sm font-bold text-ink-900">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-300 transition-colors hover:bg-error-50 hover:text-error-600"
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-ink-100 px-5 py-4">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm text-ink-500">Subtotal</span>
                <span className="font-display text-lg font-bold text-ink-900">
                  {formatPrice(total)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </button>
              <button
                onClick={closeCart}
                className="mt-2 flex h-10 w-full items-center justify-center text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
