import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ShoppingBag, DownloadCloud, Package } from 'lucide-react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { OrderItemsTable } from '@/components/orders/OrderItemsTable';
import { useOrderAmountFormatter } from '@/hooks/useOrderAmountFormatter';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/Button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { formatOrderDate, getOrderStatus, orderReceiptStorageKey } from '@/lib/orders';
import { getCustomerOrderByNumber, getGuestOrderReceipt } from '@/services/orders';
import { getManualPaymentState, initiateBkashPayment, type ManualPaymentState } from '@/services/payment';
import { fetchPublicPaymentSettings, getEnabledManualMethods } from '@/services/paymentSettings';
import { listOrderDownloadsAuth, listOrderDownloadsGuest, openDownloadLinkAuth, openDownloadLinkGuest, type DownloadLinkMetadata } from '@/services/downloads';
import { ManualPaymentModal } from '@/components/checkout/ManualPaymentModal';
import type { OrderWithDetails } from '@/types/orders';
import type { PaymentMethodSetting } from '@/types/settings';

function ReceiptView({ receipt, signedIn, guestToken }: { receipt: OrderWithDetails; signedIn: boolean; guestToken?: string }) {
  const { order, items } = receipt;
  const formatAmount = useOrderAmountFormatter(order.currency_code);

  const [downloads, setDownloads] = useState<DownloadLinkMetadata[]>([]);
  const [downloadsLoading, setDownloadsLoading] = useState(true);
  const [downloadsError, setDownloadError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [paymentSettings, setPaymentSettings] = useState<PaymentMethodSetting[]>([]);
  const [manualState, setManualState] = useState<ManualPaymentState | null>(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const intent = searchParams.get('intent');

  const [showManualPayment, setShowManualPayment] = useState(intent === 'manual' && order.payment_status === 'unpaid');

  useEffect(() => {
    if (intent === 'bkash_failed') {
      setPayError('Your order has been saved, but we could not start the bKash payment.');
    }
  }, [intent]);

  useEffect(() => {
    let active = true;
    fetchPublicPaymentSettings()
      .then((settings) => { if (active) setPaymentSettings(settings); })
      .catch(() => { if (active) setPaymentSettings([]); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (order.payment_status === 'paid' || order.payment_status === 'refunded') return;
    let active = true;
    getManualPaymentState(order.order_number, guestToken)
      .then((state) => { if (active) setManualState(state); })
      .catch(() => { if (active) setManualState(null); });
    return () => { active = false; };
  }, [guestToken, order.order_number, order.payment_status]);

  const hasDigitalDownloads = items.some((i) => i.delivery_type === 'digital_download');
  const directBkashEnabled = paymentSettings.some((setting) => setting.method === 'bkash');
  const manualPaymentEnabled = getEnabledManualMethods(paymentSettings).length > 0;

  useEffect(() => {
    if (!hasDigitalDownloads || order.payment_status !== 'paid') {
      setDownloadsLoading(false);
      return;
    }

    let active = true;
    
    const fetchDownloads = signedIn 
      ? listOrderDownloadsAuth(order.id)
      : listOrderDownloadsGuest(order.order_number, guestToken!);

    fetchDownloads
      .then((data) => {
        if (active) setDownloads(data);
      })
      .catch((err) => {
        if (active) setDownloadError(err.message || 'Failed to load downloads.');
      })
      .finally(() => {
        if (active) setDownloadsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [hasDigitalDownloads, order.payment_status, order.id, order.order_number, signedIn, guestToken]);

  const handleDownload = async (orderItemId: string, linkId: string) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(linkId));
      const url = signedIn
        ? await openDownloadLinkAuth(order.id, orderItemId, linkId)
        : await openDownloadLinkGuest(order.order_number, guestToken!, orderItemId, linkId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to open download link.');
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(linkId);
        return next;
      });
    }
  };
  return (
    <Layout>
      <div className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600"><CheckCircle2 size={32} /></div>
            {order.payment_status === 'paid' ? (
              <>
                <h1 className="mt-5 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Thank you—order received</h1>
                <p className="mt-2 text-sm text-ink-500">Your payment was successful.</p>
              </>
            ) : order.payment_status === 'pending' ? (
              <>
                <h1 className="mt-5 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Order Submitted</h1>
                <p className="mt-2 text-sm text-ink-500">Payment verification pending.</p>
              </>
            ) : (
              <>
                <h1 className="mt-5 font-display text-2xl font-bold text-ink-900 sm:text-3xl">Complete Your Payment</h1>
                <p className="mt-2 text-sm text-ink-500">Your order has been recorded. Complete payment below.</p>
              </>
            )}
          </div>

          <section className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-7">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div><p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Order Number</p><p className="mt-1 font-display font-bold text-ink-900">{order.order_number}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Date</p><p className="mt-1 text-sm font-medium text-ink-800">{formatOrderDate(order.created_at)}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Customer Email</p><p className="mt-1 break-all text-sm font-medium text-ink-800">{order.customer_email}</p></div>
              <div><p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Total</p><p className="mt-1 font-display text-lg font-bold text-ink-900">{formatAmount(Number(order.total))}</p></div>
            </div>

            {Number(order.discount_total || 0) > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-success-200 bg-success-50/50 px-4 py-3 text-sm">
                <span className="text-ink-600">Subtotal: <span className="font-medium text-ink-800">{formatAmount(Number(order.subtotal))}</span></span>
                <span className="text-success-700">
                  {order.discount_source === 'coupon' ? `Coupon (${order.discount_code})` : order.discount_name || 'Promotion'}: <span className="font-semibold">−{formatAmount(Number(order.discount_total))}</span>
                </span>
              </div>
            )}

            <div className="mt-6 grid gap-4 border-t border-ink-100 pt-5 sm:grid-cols-3">
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Order Status</p><OrderStatusBadge value={getOrderStatus(order)} /></div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Payment Status</p><OrderStatusBadge value={order.payment_status} /></div>
              <div><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Fulfillment Status</p><OrderStatusBadge value={order.fulfillment_status} /></div>
            </div>

            <h2 className="mt-7 font-display text-lg font-bold text-ink-900">Products</h2>
            <div className="mt-3"><OrderItemsTable items={items} currencyCode={order.currency_code} /></div>
          </section>

          {hasDigitalDownloads && (
            <section className="mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-7">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <DownloadCloud size={18} className="text-ink-400" /> Digital Downloads
              </h2>
              
              {order.payment_status !== 'paid' ? (
                <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
                  <span className="font-semibold">Downloads will be available after payment is confirmed.</span>
                </div>
              ) : downloadsLoading ? (
                <div className="mt-4 flex h-24 items-center justify-center rounded-xl bg-ink-50/50">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
                </div>
              ) : downloadsError ? (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700">
                  <AlertCircle size={17} />
                  {downloadsError}
                </div>
              ) : downloads.length === 0 ? (
                <p className="mt-4 text-sm text-ink-500">No downloads are currently available.</p>
              ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {downloads.map((link) => {
                    const item = items.find((i) => i.product_id === link.product_id);
                    return (
                      <div key={link.id} className="flex flex-col justify-between rounded-xl border border-ink-100 bg-ink-50/30 p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package size={16} className="text-ink-400" />
                            <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                              {link.version ? `v${link.version}` : 'Download'}
                            </span>
                          </div>
                          <h4 className="font-semibold text-ink-900">{link.title}</h4>
                          <p className="mt-1 text-xs text-ink-500 truncate">{item?.product_name}</p>
                        </div>
                        
                        <Button 
                          className="mt-4 w-full" 
                          variant="secondary"
                          onClick={() => item && handleDownload(item.id, link.id)}
                          disabled={!item || downloadingIds.has(link.id)}
                        >
                          {downloadingIds.has(link.id) ? (
                            <span className="inline-flex items-center gap-2">
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
                              Opening...
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2">
                              <DownloadCloud size={16} />
                              Download
                            </span>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {order.payment_status === 'pending' && (
            <section className="mt-6 rounded-2xl border border-warning-200 bg-warning-50/50 p-5 shadow-soft sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink-900">Payment Verification Pending</h2>
              <p className="mt-1 text-sm text-ink-600">Your payment information has been submitted. Access will remain locked until an admin confirms the payment.</p>
            </section>
          )}

          {(order.payment_status === 'unpaid' || order.payment_status === 'failed') && (
            <section className="mt-6 rounded-2xl border border-warning-200 bg-warning-50/50 p-5 shadow-soft sm:p-7">
              <h2 className="font-display text-lg font-bold text-ink-900">Payment Required</h2>
              <p className="mt-1 text-sm text-ink-600">Your order is currently {order.payment_status}. Please complete payment to receive your items.</p>

              {manualState?.status === 'failed' && manualState.rejectionReason && <div className="mt-4 rounded-xl border border-warning-200 bg-white p-4 text-sm text-ink-700"><p className="font-semibold text-ink-900">Previous payment could not be verified</p><p className="mt-1">{manualState.rejectionReason}</p><p className="mt-2 text-xs text-ink-500">You may submit a new payment for verification.</p></div>}
              
              {payError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700">
                  <AlertCircle className="mt-0.5 shrink-0" size={17} />
                  {payError}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                {directBkashEnabled && <Button 
                  onClick={async () => {
                    try {
                      setPaying(true);
                      setPayError(null);
                      const url = await initiateBkashPayment(order.order_number, guestToken);
                      window.location.assign(url);
                    } catch (paymentError: unknown) {
                      setPayError(paymentError instanceof Error ? paymentError.message : 'Failed to initiate payment.');
                      setPaying(false);
                    }
                  }}
                  disabled={paying}
                >
                  {paying ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Redirecting…</>
                  ) : (
                    'Pay with bKash'
                  )}
                </Button>}
                
                {manualPaymentEnabled && <Button 
                  variant="outline"
                  onClick={() => setShowManualPayment(true)}
                  disabled={paying}
                >
                  Submit Manual Payment
                </Button>}
                {!directBkashEnabled && !manualPaymentEnabled && <p className="text-sm text-warning-800">No payment method is currently enabled. Please contact support.</p>}
              </div>
            </section>
          )}

          <ManualPaymentModal
            isOpen={showManualPayment}
            onClose={() => setShowManualPayment(false)}
            orderNumber={order.order_number}
            orderTotal={order.total}
            currencyCode={order.currency_code}
            accessToken={guestToken}
            onSuccess={() => {
              setShowManualPayment(false);
              const url = new URL(window.location.href);
              url.searchParams.delete('intent');
              window.location.replace(url.toString());
            }}
          />

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/products" size="lg"><ShoppingBag size={17} /> Continue Shopping</Button>
            {signedIn && <Button to="/account/orders" variant="outline" size="lg">View My Orders</Button>}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function OrderSuccessPage() {
  const { orderNumber = '' } = useParams();
  const { session, loading: authLoading } = useCustomerAuth();
  const [receipt, setReceipt] = useState<OrderWithDetails | null>(null);
  const [guestToken, setGuestToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !orderNumber) return;
    let active = true;
    setLoading(true);
    setError(null);

    async function loadReceipt() {
      try {
        let result: OrderWithDetails | null = null;
        if (session?.user) {
          result = await getCustomerOrderByNumber(orderNumber, session.user.id);
        }
        if (!result) {
          const token = sessionStorage.getItem(orderReceiptStorageKey(orderNumber));
          if (!token) throw new Error('Guest receipt access is no longer available in this session.');
          setGuestToken(token);
          result = await getGuestOrderReceipt(orderNumber, token);
        }
        if (active) setReceipt(result);
      } catch {
        if (active) setError('We could not load this receipt. Check the order number or return to the account used for checkout.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReceipt();
    return () => { active = false; };
  }, [authLoading, orderNumber, session]);

  if (loading || authLoading) {
    return <Layout><div className="flex min-h-[55vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div></Layout>;
  }
  if (error || !receipt) {
    return (
      <Layout>
        <div className="container-page py-16"><div className="mx-auto max-w-xl rounded-2xl border border-error-200 bg-error-50 p-8 text-center"><AlertCircle className="mx-auto text-error-600" size={30} /><h1 className="mt-4 font-display text-xl font-bold text-ink-900">Receipt unavailable</h1><p className="mt-2 text-sm text-error-700">{error}</p><Link to="/products" className="mt-5 inline-block text-sm font-semibold text-brand-600 hover:underline">Continue Shopping</Link></div></div>
      </Layout>
    );
  }
  return <ReceiptView receipt={receipt} signedIn={!!session} guestToken={guestToken} />;
}
