import { useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, Clock3, DownloadCloud, Package, FileText } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { AccountLayout } from '@/components/account/AccountLayout';
import { OrderItemsTable } from '@/components/orders/OrderItemsTable';
import { useOrderAmountFormatter } from '@/hooks/useOrderAmountFormatter';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { formatOrderDate, getHistoryOrderStatus, getOrderStatus } from '@/lib/orders';
import { getCustomerOrderById } from '@/services/orders';
import { getManualPaymentState, initiateBkashPayment, type ManualPaymentState } from '@/services/payment';
import { fetchPublicPaymentSettings, getEnabledManualMethods } from '@/services/paymentSettings';
import { listOrderDownloadsAuth, openDownloadLinkAuth, type DownloadLinkMetadata } from '@/services/downloads';
import { getSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { ManualPaymentModal } from '@/components/checkout/ManualPaymentModal';
import type { OrderWithDetails } from '@/types/orders';
import type { PaymentMethodSetting } from '@/types/settings';

function CustomerOrderContent({ detail }: { detail: OrderWithDetails }) {
  const { order, items, history } = detail;
  const formatAmount = useOrderAmountFormatter(order.currency_code);
  const [downloads, setDownloads] = useState<DownloadLinkMetadata[]>([]);
  const [downloadsLoading, setDownloadsLoading] = useState(true);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [showManualPayment, setShowManualPayment] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentMethodSetting[]>([]);
  const [manualState, setManualState] = useState<ManualPaymentState | null>(null);

  const hasDigitalDownloads = items.some((i) => i.delivery_type === 'digital_download');
  const directBkashEnabled = paymentSettings.some((setting) => setting.method === 'bkash');
  const manualPaymentEnabled = getEnabledManualMethods(paymentSettings).length > 0;

  useEffect(() => {
    let active = true;
    fetchPublicPaymentSettings().then((data) => { if (active) setPaymentSettings(data); }).catch(() => { if (active) setPaymentSettings([]); });
    if (order.payment_status !== 'paid' && order.payment_status !== 'refunded') {
      getManualPaymentState(order.order_number).then((data) => { if (active) setManualState(data); }).catch(() => { if (active) setManualState(null); });
    }
    return () => { active = false; };
  }, [order.order_number, order.payment_status]);

  useEffect(() => {
    if (!hasDigitalDownloads || order.payment_status !== 'paid') {
      setDownloadsLoading(false);
      return;
    }

    let active = true;
    listOrderDownloadsAuth(order.id)
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
  }, [hasDigitalDownloads, order.payment_status, order.id]);

  const handleDownload = async (orderItemId: string, linkId: string) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(linkId));
      const url = await openDownloadLinkAuth(order.id, orderItemId, linkId);
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

  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const handleDownloadInvoice = async () => {
    try {
      setDownloadingInvoice(true);
      const supabase = getSupabase();
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) throw new Error('Not authenticated');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-invoice?order=${order.order_number}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        let msg = 'Download failed';
        try {
          const errData = await response.json();
          if (errData.error) msg = errData.error;
        } catch (_) {
          // ignore
        }
        throw new Error(msg);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bdBeginner-${order.payment_status === 'paid' ? 'Invoice' : 'OrderSummary'}-${order.order_number}.pdf`; 
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to download invoice.');
    } finally {
      setDownloadingInvoice(false);
    }
  };
  return (
    <>
      <Link to="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> Back to Orders</Link>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h1 className="font-display text-2xl font-bold text-ink-900">{order.order_number}</h1><p className="mt-1 text-sm text-ink-500">Created {formatOrderDate(order.created_at)}</p></div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadInvoice} 
            disabled={downloadingInvoice}
            className="flex items-center gap-2 rounded-lg bg-white"
          >
            <FileText size={16} /> {downloadingInvoice ? 'Downloading...' : 'Download PDF'}
          </Button>
          <OrderStatusBadge value={getOrderStatus(order)} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:col-span-2"><h2 className="font-display text-lg font-bold text-ink-900">Products</h2><div className="mt-4"><OrderItemsTable items={items} currencyCode={order.currency_code} /></div></section>
        <div className="space-y-5">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"><h2 className="font-display text-base font-bold text-ink-900">Customer Information</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-xs uppercase tracking-wider text-ink-400">Name</dt><dd className="mt-0.5 font-medium text-ink-800">{order.customer_name}</dd></div><div><dt className="text-xs uppercase tracking-wider text-ink-400">Email</dt><dd className="mt-0.5 break-all font-medium text-ink-800">{order.customer_email}</dd></div>{order.customer_phone && <div><dt className="text-xs uppercase tracking-wider text-ink-400">Phone</dt><dd className="mt-0.5 font-medium text-ink-800">{order.customer_phone}</dd></div>}</dl></section>
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"><h2 className="font-display text-base font-bold text-ink-900">Order Summary</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd>{formatAmount(Number(order.subtotal))}</dd></div>{Number(order.discount_total || 0) > 0 && <div className="flex justify-between"><dt className="flex items-center gap-1 text-success-600">{order.discount_source === 'coupon' ? `Coupon (${order.discount_code})` : order.discount_name || 'Discount'}</dt><dd className="text-success-600">−{formatAmount(Number(order.discount_total))}</dd></div>}{Number(order.discount_total || 0) === 0 && <div className="flex justify-between"><dt className="text-ink-500">Discount</dt><dd>{formatAmount(0)}</dd></div>}<div className="flex justify-between border-t border-ink-100 pt-3 font-bold"><dt>Total</dt><dd>{formatAmount(Number(order.total))}</dd></div></dl><div className="mt-5 space-y-3"><div><p className="mb-1 text-xs text-ink-400">Payment</p><OrderStatusBadge value={order.payment_status} /></div><div><p className="mb-1 text-xs text-ink-400">Fulfillment</p><OrderStatusBadge value={order.fulfillment_status} /></div></div></section>
          
          {(order.payment_status === 'unpaid' || order.payment_status === 'failed') && (
            <section className="rounded-2xl border border-warning-200 bg-warning-50/50 p-5 shadow-soft">
              <h2 className="font-display text-base font-bold text-ink-900">Payment Required</h2>
              <p className="mt-1 text-xs text-ink-600">Your order is currently {order.payment_status}. Please complete payment.</p>
              {manualState?.status === 'failed' && manualState.rejectionReason && <div className="mt-4 rounded-xl border border-warning-200 bg-white p-3 text-xs text-ink-700"><p className="font-semibold text-ink-900">Previous payment could not be verified</p><p className="mt-1">{manualState.rejectionReason}</p></div>}
              
              {payError && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-xs text-error-700">
                  <AlertCircle className="mt-0.5 shrink-0" size={14} />
                  {payError}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {directBkashEnabled && <Button 
                  onClick={async () => {
                    try {
                      setPaying(true);
                      setPayError(null);
                      const url = await initiateBkashPayment(order.order_number);
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
              </div>
            </section>
          )}

          {order.payment_status === 'pending' && <section className="rounded-2xl border border-warning-200 bg-warning-50/50 p-5 shadow-soft"><h2 className="font-display text-base font-bold text-ink-900">Payment Verification Pending</h2><p className="mt-1 text-xs text-ink-600">Access remains locked until the submitted payment is approved.</p></section>}

          <ManualPaymentModal
            isOpen={showManualPayment}
            onClose={() => setShowManualPayment(false)}
            orderNumber={order.order_number}
            orderTotal={order.total}
            currencyCode={order.currency_code}
            onSuccess={() => {
              setShowManualPayment(false);
              window.location.reload();
            }}
          />

        </div>
      </div>
      {hasDigitalDownloads && (
        <section className="mt-5 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
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
          ) : downloadError ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700">
              <AlertCircle size={17} />
              {downloadError}
            </div>
          ) : downloads.length === 0 ? (
            <p className="mt-4 text-sm text-ink-500">No downloads are currently available.</p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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

      <section className="mt-5 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"><h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900"><Clock3 size={18} className="text-ink-400" /> Status History</h2>{history.length === 0 ? <p className="mt-4 text-sm text-ink-500">No status changes have been recorded yet.</p> : <ol className="mt-4 space-y-4 border-l border-ink-200 pl-5">{history.map((entry) => <li key={entry.id} className="relative"><span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-brand-500" /><p className="text-xs text-ink-400">{formatOrderDate(entry.created_at)}</p><div className="mt-2 flex flex-wrap gap-2"><OrderStatusBadge value={getHistoryOrderStatus(entry)} /><OrderStatusBadge value={entry.payment_status} /><OrderStatusBadge value={entry.fulfillment_status} /></div></li>)}</ol>}</section>
    </>
  );
}

export function AccountOrderDetailPage() {
  const { id = '' } = useParams();
  const { session, loading: authLoading } = useCustomerAuth();
  const [detail, setDetail] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !session?.user || !id) return;
    let active = true;
    setLoading(true);
    getCustomerOrderById(id, session.user.id)
      .then((data) => { if (!data) throw new Error('Not found'); if (active) setDetail(data); })
      .catch(() => { if (active) setError('This order could not be found or is not available to this account.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, id, session]);

  return <AccountLayout>{loading ? <div className="flex h-64 items-center justify-center rounded-2xl border border-ink-100 bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div> : error || !detail ? <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle size={17} />{error}</div> : <CustomerOrderContent detail={detail} />}</AccountLayout>;
}
