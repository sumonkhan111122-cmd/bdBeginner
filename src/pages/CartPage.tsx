import { useState } from 'react';
import { ArrowLeft, ArrowRight, Lock, Minus, Plus, Percent, ShoppingCart, Tag, Trash2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useCart } from '@/context/CartContext';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { humanizeOrderValue } from '@/lib/orders';

export function CartPage() {
  const formatPrice = useCurrencyFormatter();
  const {
    items,
    removeItem,
    updateQuantity,
    total,
    count,
    clearCart,
    couponCode,
    applyCoupon,
    removeCoupon,
    pricing,
    pricingLoading,
    pricingError,
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponLocalError, setCouponLocalError] = useState<string | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    setCouponLocalError(null);
    const error = await applyCoupon(couponInput);
    setCouponApplying(false);
    if (error) {
      setCouponLocalError(error);
    } else {
      setCouponInput('');
      setCouponLocalError(null);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponLocalError(null);
    setCouponInput('');
  };

  const displaySubtotal = pricing?.subtotal ?? total;
  const displayDiscount = pricing?.discountTotal ?? 0;
  const displayTotal = pricing?.total ?? total;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-page section-padding">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-300">
              <ShoppingCart size={28} />
            </div>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">Your cart is empty</h1>
            <p className="mt-3 text-sm text-ink-500">Browse our marketplace and add digital products to get started.</p>
            <Button to="/products" size="lg" className="mt-8">Explore Products <ArrowRight size={18} /></Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page section-padding">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-ink-900">Shopping Cart</h1>
          <button onClick={clearCart} className="text-sm font-medium text-ink-400 transition-colors hover:text-error-600">Clear all</button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-3">
            {items.map((item) => (
              <div key={item.productId} className="flex min-w-0 gap-3 rounded-2xl border border-ink-100 bg-white p-3 sm:gap-4 sm:p-4">
                <Link to={`/products/${item.slug}`} className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-50 sm:h-20 sm:w-20">
                  <ImageWithFallback src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" fallback={<ShoppingCart size={24} className="text-ink-300" />} />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/products/${item.slug}`} className="font-display text-sm font-bold leading-snug text-ink-900 line-clamp-2 hover:text-brand-600">{item.name}</Link>
                  <p className="mt-1 text-xs text-ink-400">{humanizeOrderValue(item.deliveryType)}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                    <div className="flex items-center gap-1 rounded-lg border border-ink-100 bg-ink-50 px-1">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1} className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100 disabled:opacity-30" aria-label="Decrease quantity"><Minus size={14} /></button>
                      <span className="w-8 text-center text-sm font-semibold text-ink-700">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-md text-ink-500 hover:bg-ink-100" aria-label="Increase quantity"><Plus size={14} /></button>
                    </div>
                    <span className="font-display text-base font-bold text-ink-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-300 hover:bg-error-50 hover:text-error-600" aria-label={`Remove ${item.name}`}><Trash2 size={16} /></button>
              </div>
            ))}
            <Link to="/products" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> Continue shopping</Link>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-6">
              <h2 className="font-display text-base font-bold text-ink-900">Order Summary</h2>

              {/* Coupon section */}
              <div className="mt-4 border-b border-ink-100 pb-4">
                {couponCode ? (
                  <div className="flex items-center justify-between rounded-xl border border-success-200 bg-success-50/50 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-success-600" />
                      <span className="text-sm font-semibold text-success-700">{couponCode}</span>
                    </div>
                    <button onClick={handleRemoveCoupon} className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-error-600" aria-label="Remove coupon">
                      <X size={14} /> Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponLocalError(null); }}
                        placeholder="Coupon code"
                        className="h-10 flex-1 rounded-lg border border-ink-200 bg-white px-3 text-sm text-ink-800 uppercase placeholder:normal-case placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        disabled={couponApplying}
                        maxLength={40}
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponApplying || !couponInput.trim()}
                        className="flex h-10 items-center gap-1.5 rounded-lg bg-ink-800 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-ink-900 disabled:opacity-40"
                      >
                        {couponApplying ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Percent size={14} />}
                        Apply
                      </button>
                    </div>
                    {couponLocalError && (
                      <p className="mt-2 text-xs font-medium text-error-600">{couponLocalError}</p>
                    )}
                  </div>
                )}
              </div>

              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div className="flex justify-between"><dt className="text-ink-500">Items ({count})</dt><dd className="font-medium text-ink-800">{formatPrice(displaySubtotal)}</dd></div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between">
                    <dt className="flex items-center gap-1.5 text-success-600">
                      <Tag size={13} />
                      {pricing?.discountSource === 'coupon' ? `Coupon: ${pricing.discountCode}` : pricing?.discountName || 'Discount'}
                    </dt>
                    <dd className="font-medium text-success-600">−{formatPrice(displayDiscount)}</dd>
                  </div>
                )}
                {pricing?.discountSource === 'promotion' && pricing.discountName && displayDiscount > 0 && (
                  <p className="text-xs text-success-600/80">Auto-applied: {pricing.discountName}</p>
                )}
                <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd className="font-medium text-success-600">Digital (Free)</dd></div>
                <div className="border-t border-ink-100 pt-3">
                  <div className="flex justify-between">
                    <dt className="font-display font-bold text-ink-900">Total</dt>
                    <dd className="font-display text-xl font-bold text-ink-900 relative">
                      {pricingLoading && <span className="absolute -left-5 top-1 h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />}
                      {formatPrice(displayTotal)}
                    </dd>
                  </div>
                </div>
              </dl>

              {pricingError && !couponLocalError && (
                <p className="mt-3 text-xs font-medium text-warning-600">{pricingError}</p>
              )}

              <Button onClick={() => navigate('/checkout')} size="lg" fullWidth className="mt-5">Proceed to Checkout <ArrowRight size={18} /></Button>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400"><Lock size={12} /> Secure order creation</div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
