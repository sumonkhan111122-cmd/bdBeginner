import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Percent, ShieldCheck, ShoppingCart, Tag, Trash2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { humanizeOrderValue, orderReceiptStorageKey } from '@/lib/orders';
import {
  createCheckoutOrderPriced,
  friendlyCheckoutError,
  validateCheckoutCart,
  triggerOrderNotification,
} from '@/services/orders';
import { initiateBkashPayment } from '@/services/payment';
import {
  fetchPublicPaymentSettings,
  getBkashDescription,
  getEnabledManualMethods,
} from '@/services/paymentSettings';
import type { CheckoutCatalogProduct } from '@/types/orders';
import type { PaymentMethodSetting } from '@/types/settings';

const inputClass = 'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-ink-50 disabled:text-ink-500';
const textareaClass = 'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">{label}{required && <span className="ml-0.5 text-error-600">*</span>}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const formatPrice = useCurrencyFormatter();
  const {
    items,
    removeItem,
    clearCart,
    couponCode,
    applyCoupon,
    removeCoupon,
    pricing,
    pricingLoading,
    pricingError,
  } = useCart();
  const { session, profile, loading: authLoading } = useCustomerAuth();
  const [catalogProducts, setCatalogProducts] = useState<CheckoutCatalogProduct[]>([]);
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);
  const [validating, setValidating] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', note: '' });
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'manual' | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentMethodSetting[]>([]);
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);
  const [paymentSettingsError, setPaymentSettingsError] = useState<string | null>(null);

  // Coupon input state (for in-checkout coupon application)
  const [couponInput, setCouponInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponLocalError, setCouponLocalError] = useState<string | null>(null);

  const isZeroTotal = pricing && pricing.total === 0;

  useEffect(() => {
    if (authLoading || !session) return;
    setForm((current) => ({
      ...current,
      name: current.name || profile?.full_name || '',
      email: session.user.email || current.email,
      phone: current.phone || profile?.phone || '',
    }));
  }, [authLoading, profile, session]);

  useEffect(() => {
    let active = true;
    setValidating(true);
    setValidationError(null);
    validateCheckoutCart(items)
      .then(({ available, unavailable }) => {
        if (!active) return;
        setCatalogProducts(available);
        setUnavailableIds(unavailable.map((item) => item.productId));
      })
      .catch((error) => {
        console.error('Cart validation failed', error);
        if (active) setValidationError('We could not verify your cart. Please try again before placing the order.');
      })
      .finally(() => {
        if (active) setValidating(false);
      });
    return () => { active = false; };
  }, [items]);

  useEffect(() => {
    let active = true;
    setPaymentSettingsLoading(true);
    setPaymentSettingsError(null);
    fetchPublicPaymentSettings()
      .then((settings) => {
        if (!active) return;
        setPaymentSettings(settings);
        const hasBkash = settings.some((setting) => setting.method === 'bkash');
        const hasManual = getEnabledManualMethods(settings).length > 0;
        setPaymentMethod((current) => {
          if (current === 'bkash' && hasBkash) return current;
          if (current === 'manual' && hasManual) return current;
          return hasBkash ? 'bkash' : hasManual ? 'manual' : null;
        });
      })
      .catch(() => {
        if (active) setPaymentSettingsError('Payment methods could not be loaded. Please try again.');
      })
      .finally(() => {
        if (active) setPaymentSettingsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const productsById = useMemo(
    () => new Map(catalogProducts.map((product) => [product.id, product])),
    [catalogProducts],
  );
  const reviewedItems = items
    .map((item) => ({ cart: item, product: productsById.get(item.productId) }))
    .filter((entry): entry is { cart: typeof items[number]; product: CheckoutCatalogProduct } => !!entry.product);
  const displaySubtotal = pricing?.subtotal ?? reviewedItems.reduce(
    (sum, entry) => sum + entry.product.price * entry.cart.quantity, 0,
  );
  const displayDiscount = pricing?.discountTotal ?? 0;
  const displayTotal = pricing?.total ?? displaySubtotal;
  const hasUnavailable = unavailableIds.length > 0;
  const directBkash = paymentSettings.find((setting) => setting.method === 'bkash');
  const manualMethods = getEnabledManualMethods(paymentSettings);
  const authoritativeEmail = session?.user.email ?? form.email.trim();
  const canSubmit =
    !validating &&
    !validationError &&
    !hasUnavailable &&
    items.length > 0 &&
    form.name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authoritativeEmail) &&
    termsAccepted &&
    (isZeroTotal || !!paymentMethod) &&
    !paymentSettingsLoading &&
    !paymentSettingsError &&
    !submitting &&
    !pricingLoading;

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const latestValidation = await validateCheckoutCart(items);
      setCatalogProducts(latestValidation.available);
      setUnavailableIds(latestValidation.unavailable.map((item) => item.productId));
      if (latestValidation.unavailable.length > 0) {
        setSubmitError('A product became unavailable. Remove it before placing your order.');
        return;
      }

      const result = await createCheckoutOrderPriced({
        customerName: form.name.trim(),
        customerEmail: authoritativeEmail,
        customerPhone: form.phone.trim() || null,
        customerNote: form.note.trim() || null,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
        })),
        couponCode: couponCode || null,
      });

      // Notifications stay non-blocking for checkout, while each request now reports failures to the console.
      void triggerOrderNotification('order_created_customer', result.order_number, result.access_token)
        .catch((notificationError) => console.error('Customer order notification failed', notificationError));
      void triggerOrderNotification('order_created_admin', result.order_number, result.access_token)
        .catch((notificationError) => console.error('Admin order notification failed', notificationError));

      sessionStorage.setItem(orderReceiptStorageKey(result.order_number), result.access_token);

      // Zero-total order: already marked paid by RPC, go straight to success
      if (result.payment_status === 'paid' || result.total === 0) {
        clearCart();
        navigate(`/order/success/${encodeURIComponent(result.order_number)}`, { replace: true });
        return;
      }
      
      if (paymentMethod === 'bkash') {
        try {
          const bkashUrl = await initiateBkashPayment(result.order_number, result.access_token);
          clearCart(); // Safe to clear cart now
          window.location.assign(bkashUrl);
          return; // Don't redirect locally
        } catch {
          clearCart(); // Safe to clear cart because order exists
          // Navigate to success page with intent bkash_failed so it shows the message
          navigate(`/order/success/${encodeURIComponent(result.order_number)}?intent=bkash_failed`, { replace: true });
          return;
        }
      }

      clearCart();
      // Navigate to success page with intent manual so it automatically opens manual payment modal
      navigate(`/order/success/${encodeURIComponent(result.order_number)}?intent=manual`, { replace: true });
    } catch (error) {
      setSubmitError(friendlyCheckoutError(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container-page section-padding">
          <div className="mx-auto max-w-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-300"><ShoppingCart size={28} /></div>
            <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">Your cart is empty</h1>
            <p className="mt-3 text-sm text-ink-500">Add a product before starting checkout.</p>
            <Button to="/products" size="lg" className="mt-8">Shop Products <ArrowRight size={18} /></Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-7">
          <h1 className="font-display text-2xl font-bold text-ink-900">Secure Checkout</h1>
          <p className="mt-1 text-sm text-ink-500">Digital products and services—no shipping address required.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container-page py-8 lg:py-10">
        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div className="min-w-0 space-y-5">
            {validationError && (
              <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{validationError}</div>
            )}
            {hasUnavailable && (
              <div className="rounded-xl border border-warning-200 bg-warning-50 p-4">
                <div className="flex items-start gap-2 text-sm text-warning-800"><AlertCircle className="mt-0.5 shrink-0" size={17} /><div><p className="font-semibold">Some cart items are no longer available.</p><p className="mt-1 text-warning-700">Remove them before placing this order.</p></div></div>
                <div className="mt-3 flex flex-col gap-2">
                  {items.filter((item) => unavailableIds.includes(item.productId)).map((item) => (
                    <div key={item.productId} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-sm"><span className="font-medium text-ink-700">{item.name}</span><button type="button" onClick={() => removeItem(item.productId)} className="inline-flex items-center gap-1.5 font-semibold text-error-600 hover:text-error-700"><Trash2 size={14} /> Remove</button></div>
                  ))}
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="font-display text-lg font-bold text-ink-900">Customer Details</h2><p className="mt-1 text-xs text-ink-500">Guest checkout is available. Login is not required.</p></div>
                {session && <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-semibold text-success-700"><CheckCircle2 size={13} /> Signed in</span>}
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" required><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} autoComplete="name" maxLength={120} placeholder="Your full name" /></Field>
                <Field label="Email" required hint={session ? 'Your authenticated account email is used for this order.' : undefined}><input type="email" value={session?.user.email ?? form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} autoComplete="email" readOnly={!!session} placeholder="you@example.com" /></Field>
                <Field label="Phone" hint="Optional"><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} autoComplete="tel" maxLength={40} placeholder="Phone number" /></Field>
                <Field label="Order Note" hint="Optional"><textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={textareaClass} rows={3} maxLength={1000} placeholder="Anything we should know about this order?" /></Field>
              </div>
            </section>

            {/* Payment Method — hidden for zero-total orders */}
            {isZeroTotal ? (
              <section className="rounded-2xl border border-success-200 bg-success-50/50 p-5 shadow-soft sm:p-6">
                <h2 className="font-display text-lg font-bold text-success-800">No Payment Required</h2>
                <p className="mt-2 text-sm text-success-700">This order is fully covered by your discount. No payment method is needed.</p>
              </section>
            ) : (
              <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
                <h2 className="font-display text-lg font-bold text-ink-900">Payment Method</h2>
                {paymentSettingsLoading ? <div className="mt-4 h-24 animate-pulse rounded-xl bg-ink-50" /> : paymentSettingsError ? <div className="mt-4 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{paymentSettingsError}</div> : !directBkash && manualMethods.length === 0 ? <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">No payment method is currently available. Please contact support.</div> : <div className="mt-4 flex flex-col gap-3">
                  {directBkash && <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${paymentMethod === 'bkash' ? 'border-brand-500 bg-brand-50/30' : 'border-ink-100 hover:border-ink-200'}`}><input type="radio" name="payment_method" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="mt-0.5 h-4 w-4 border-ink-300 text-brand-600 focus:ring-brand-500" /><div><p className="font-semibold text-ink-900">{directBkash.display_name}</p><p className="mt-1 text-sm text-ink-500">{getBkashDescription(directBkash)}</p></div></label>}
                  {manualMethods.length > 0 && <label className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors ${paymentMethod === 'manual' ? 'border-brand-500 bg-brand-50/30' : 'border-ink-100 hover:border-ink-200'}`}><input type="radio" name="payment_method" value="manual" checked={paymentMethod === 'manual'} onChange={() => setPaymentMethod('manual')} className="mt-0.5 h-4 w-4 border-ink-300 text-brand-600 focus:ring-brand-500" /><div><p className="font-semibold text-ink-900">Manual Payment / Payment Confirmation</p><p className="mt-1 text-sm text-ink-500">{manualMethods.map((method) => method.display_name).join(', ')}. Manual verification required.</p></div></label>}
                </div>}
              </section>
            )}

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm leading-relaxed text-ink-600">I agree to the <Link to="/terms" target="_blank" className="font-semibold text-brand-600 hover:underline">Terms &amp; Conditions</Link>, <Link to="/refund-policy" target="_blank" className="font-semibold text-brand-600 hover:underline">Refund Policy</Link> and <Link to="/delivery-policy" target="_blank" className="font-semibold text-brand-600 hover:underline">Delivery Policy</Link>.</span>
            </label>

            {submitError && <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{submitError}</div>}
          </div>

          <aside className="min-w-0 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-ink-100 bg-ink-50/50 p-5 shadow-soft sm:p-6">
              <h2 className="font-display text-lg font-bold text-ink-900">Order Review</h2>
              {validating ? (
                <div className="flex h-32 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>
              ) : (
                <ul className="mt-4 flex flex-col gap-4">
                  {reviewedItems.map(({ cart, product }) => (
                    <li key={cart.productId} className="flex min-w-0 gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white"><ImageWithFallback src={product.thumbnail_url} alt={product.name} className="h-full w-full object-cover" fallback={<ShoppingCart size={20} className="text-ink-300" />} /></div>
                      <div className="min-w-0 flex-1"><Link to={`/products/${product.slug}`} className="block truncate text-sm font-semibold text-ink-800 hover:text-brand-600">{product.name}</Link><p className="mt-0.5 text-xs text-ink-400">{humanizeOrderValue(product.delivery_type)} · Qty {cart.quantity}</p><div className="mt-1 flex justify-between gap-3 text-xs"><span className="text-ink-500">{formatPrice(product.price)} each</span><span className="font-semibold text-ink-800">{formatPrice(product.price * cart.quantity)}</span></div></div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Coupon section in checkout sidebar */}
              <div className="mt-5 border-t border-ink-100 pt-4">
                {couponCode ? (
                  <div className="flex items-center justify-between rounded-lg border border-success-200 bg-success-50/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-success-600" />
                      <span className="text-xs font-semibold text-success-700">{couponCode}</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-xs font-medium text-ink-400 hover:text-error-600" aria-label="Remove coupon">
                      <X size={14} />
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
                        className="h-9 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 text-xs text-ink-800 uppercase placeholder:normal-case placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                        disabled={couponApplying}
                        maxLength={40}
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponApplying || !couponInput.trim()}
                        className="flex h-9 items-center gap-1 rounded-lg bg-ink-800 px-3 text-xs font-semibold text-white hover:bg-ink-900 disabled:opacity-40"
                      >
                        {couponApplying ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <Percent size={12} />}
                        Apply
                      </button>
                    </div>
                    {couponLocalError && <p className="mt-1.5 text-xs font-medium text-error-600">{couponLocalError}</p>}
                  </div>
                )}
              </div>

              <div className="mt-4 border-t border-ink-100 pt-4">
                <div className="flex justify-between text-sm"><span className="text-ink-500">Cart subtotal</span><span className="font-medium text-ink-800">{formatPrice(displaySubtotal)}</span></div>
                {displayDiscount > 0 && (
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-success-600">
                      <Tag size={13} />
                      {pricing?.discountSource === 'coupon' ? `Coupon: ${pricing.discountCode}` : pricing?.discountName || 'Discount'}
                    </span>
                    <span className="font-medium text-success-600">−{formatPrice(displayDiscount)}</span>
                  </div>
                )}
                <div className="mt-2 flex justify-between text-sm"><span className="text-ink-500">Digital delivery</span><span className="font-medium text-success-600">Free</span></div>
                <div className="mt-4 flex justify-between border-t border-ink-100 pt-4">
                  <span className="font-display font-bold text-ink-900">{isZeroTotal ? 'Total (Fully Discounted)' : 'Total'}</span>
                  <span className="font-display text-xl font-bold text-ink-900 relative">
                    {pricingLoading && <span className="absolute -left-5 top-1 h-4 w-4 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />}
                    {formatPrice(displayTotal)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-400">The database verifies current published products and calculates the final authoritative total when you place the order.</p>
              </div>

              {pricingError && <p className="mt-3 text-xs font-medium text-warning-600">{pricingError}</p>}

              <Button type="submit" size="lg" fullWidth className="mt-5" disabled={!canSubmit}>
                {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Placing Order…</> : isZeroTotal ? <><CheckCircle2 size={16} /> Complete Order</> : <><Lock size={16} /> Place Order</>}
              </Button>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400"><ShieldCheck size={14} /> Secure server-calculated checkout</div>
            </div>
          </aside>
        </div>
      </form>
    </Layout>
  );
}
