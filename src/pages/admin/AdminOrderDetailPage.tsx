import { useCallback, useEffect, useState, Fragment } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, ExternalLink, Key, Package, Save, CreditCard } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { OrderItemsTable } from '@/components/orders/OrderItemsTable';
import { useOrderAmountFormatter } from '@/hooks/useOrderAmountFormatter';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderEmailLogs } from '@/components/admin/OrderEmailLogs';
import { formatOrderDate, getHistoryOrderStatus, getOrderStatus } from '@/lib/orders';
import { getAdminOrderById, updateAdminOrderStatus, triggerOrderNotification } from '@/services/orders';
import { fetchOrderEmailLogs, type OrderEmailLogRow } from '@/services/admin';
import { adminListOrderFulfillments } from '@/services/fulfillment';
import { reviewManualPayment, MANUAL_REJECTION_REASONS, type ManualRejectionReasonCode } from '@/services/payment';
import type { FulfillmentRow } from '@/types/orders';
import type { FulfillmentStatus, OrderStatus, OrderWithDetails, PaymentStatus } from '@/types/orders';

const orderStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'];
const paymentStatuses: PaymentStatus[] = ['unpaid', 'pending', 'paid', 'failed', 'refunded'];
const fulfillmentStatuses: FulfillmentStatus[] = ['unfulfilled', 'processing', 'fulfilled', 'cancelled'];
const selectClass = 'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

function AdminOrderContent({ detail, onReload }: { detail: OrderWithDetails; onReload: () => Promise<void> }) {
  const { order, items, history } = detail;
  const formatAmount = useOrderAmountFormatter(order.currency_code);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(getOrderStatus(order) as OrderStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [fulfillmentStatus, setFulfillmentStatus] = useState<FulfillmentStatus>(order.fulfillment_status);
  const [adminNote, setAdminNote] = useState(order.admin_note ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailLogs, setEmailLogs] = useState<OrderEmailLogRow[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [fulfillments, setFulfillments] = useState<FulfillmentRow[]>([]);
  const [fulfillmentsLoading, setFulfillmentsLoading] = useState(true);

  const [reviewingTxn, setReviewingTxn] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_resubmission' | null>(null);
  const [reasonCode, setReasonCode] = useState<ManualRejectionReasonCode | 'request_resubmission' | ''>('');
  const [reasonText, setReasonText] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    try {
      const logs = await fetchOrderEmailLogs(order.id);
      setEmailLogs(logs);
    } catch (e) {
      console.error('Failed to load email logs', e);
    } finally {
      setLogsLoading(false);
    }
  }, [order.id]);

  useEffect(() => {
    loadLogs();
    adminListOrderFulfillments(order.id)
      .then(setFulfillments)
      .catch(() => {})
      .finally(() => setFulfillmentsLoading(false));
  }, [loadLogs, order.id]);

  const handleRetryEmail = async (eventType: string) => {
    try {
      await triggerOrderNotification(eventType as Parameters<typeof triggerOrderNotification>[0], order.order_number);
      setMessage('Retry triggered successfully. Please wait a moment and reload to see the updated status.');
    } catch {
      setError('Failed to trigger retry.');
    }
  };

  const handleSave = async () => {
    setSaving(true); setMessage(null); setError(null);
    try {
      await updateAdminOrderStatus(order, { orderStatus, paymentStatus, fulfillmentStatus, adminNote: adminNote.trim() || null });
      await onReload();
      setMessage('Order status saved successfully.');
    } catch (saveError) {
      console.error('Failed to update order', saveError);
      setError('Order changes could not be saved. Please try again.');
    } finally { setSaving(false); }
  };

  const submitReview = async () => {
    if (!reviewingTxn || !reviewAction) return;
    if (reviewAction === 'reject' && (!reasonCode || (reasonCode === 'other' && !reasonText.trim()))) {
      setReviewError('Please provide a specific rejection reason.');
      return;
    }
    setSaving(true);
    setReviewError(null);
    try {
      await reviewManualPayment({
        action: reviewAction,
        transactionId: reviewingTxn,
        reasonCode: reviewAction === 'reject' ? reasonCode || undefined : undefined,
        reasonText: (reasonCode === 'other' || reviewAction === 'request_resubmission') ? reasonText : undefined,
      });
      setMessage(`Payment ${reviewAction === 'approve' ? 'approved' : 'rejected'} successfully.`);
      setReviewingTxn(null);
      setReviewAction(null);
      await onReload();
    } catch (e: unknown) {
      setReviewError(e instanceof Error ? e.message : 'Failed to review payment.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> Back to Orders</Link>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="font-display text-2xl font-bold text-ink-900">{order.order_number}</h1><p className="mt-1 text-sm text-ink-500">Created {formatOrderDate(order.created_at)}</p></div><OrderStatusBadge value={getOrderStatus(order)} /></div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6"><h2 className="font-display text-lg font-bold text-ink-900">Products</h2><div className="mt-4"><OrderItemsTable items={items} currencyCode={order.currency_code} adminView /></div></section>
          
          {/* Fulfillment Panel */}
          {fulfillmentsLoading ? (
            <div className="flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>
          ) : fulfillments.length > 0 && (
            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900">
                <Package size={18} className="text-brand-600" /> Fulfillment
              </h2>
              <div className="mt-4 space-y-3">
                {fulfillments.map((f) => {
                  const item = items.find((i) => i.id === f.order_item_id);
                  const deliveryLabels: Record<string, string> = { license_key: 'License Key', subscription: 'Subscription', manual_delivery: 'Manual Delivery', service: 'Service' };
                  const statusColors: Record<string, string> = { pending: 'bg-warning-50 text-warning-700 border-warning-200', ready: 'bg-success-50 text-success-700 border-success-200', processing: 'bg-brand-50 text-brand-700 border-brand-200', completed: 'bg-success-50 text-success-700 border-success-200', revoked: 'bg-error-50 text-error-700 border-error-200', expired: 'bg-ink-100 text-ink-600 border-ink-200' };
                  return (
                    <div key={f.id} className="flex flex-col gap-2 rounded-xl border border-ink-100 bg-ink-50/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        {f.delivery_type === 'license_key' ? <Key size={16} className="text-ink-400" /> : <Package size={16} className="text-ink-400" />}
                        <div>
                          <p className="text-sm font-medium text-ink-800">{item?.product_name || item?.product_name_snapshot || 'Product'}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium text-ink-500">{deliveryLabels[f.delivery_type] || f.delivery_type}</span>
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${statusColors[f.fulfillment_status] || ''}`}>{f.fulfillment_status}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/admin/orders/${order.id}/fulfillment/${f.id}`}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Manage <ExternalLink size={13} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900"><Clock3 size={18} className="text-ink-400" /> Notifications</h2>
            {logsLoading ? (
              <div className="mt-4 flex items-center justify-center py-4"><div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>
            ) : emailLogs.length === 0 ? (
              <p className="mt-4 text-sm text-ink-500">No email notifications have been sent yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 text-xs uppercase tracking-wider text-ink-500">
                      <th className="pb-3 font-semibold">Event</th>
                      <th className="pb-3 font-semibold">Recipient</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Time</th>
                      <th className="pb-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {emailLogs.map(log => (
                      <tr key={log.id} className="group">
                        <td className="py-3 pr-4 font-medium text-ink-900">{log.event_type}</td>
                        <td className="py-3 pr-4 text-ink-600 truncate max-w-[150px]">{log.recipient_email}</td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${log.status === 'sent' ? 'bg-success-50 text-success-700' : log.status === 'failed' ? 'bg-error-50 text-error-700' : 'bg-warning-50 text-warning-700'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-xs text-ink-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-3 text-right">
                          {log.status === 'failed' && (
                            <button onClick={() => handleRetryEmail(log.event_type)} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Retry</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900"><CreditCard size={18} className="text-ink-400" /> Payment Transactions</h2>
            {(!detail.transactions || detail.transactions.length === 0) ? (
              <p className="mt-4 text-sm text-ink-500">No payment transactions have been recorded yet.</p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-200 text-xs uppercase tracking-wider text-ink-500">
                      <th className="pb-3 font-semibold">Provider</th>
                      <th className="pb-3 font-semibold">Transaction ID</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-100">
                    {detail.transactions.map((txn) => (
                      <Fragment key={txn.id}>
                        <tr className="group">
                          <td className="py-3 pr-4 font-medium text-ink-900 uppercase">
                            {txn.provider}
                            {txn.status === 'pending' && ['manual', 'bkash_personal', 'nagad_personal', 'rocket_personal'].includes(txn.provider) && (
                              <button onClick={() => setReviewingTxn(reviewingTxn === txn.id ? null : txn.id)} className="ml-2 rounded border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                                {reviewingTxn === txn.id ? 'Cancel' : 'Review'}
                              </button>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-ink-600 font-mono text-xs">{txn.provider_transaction_id || '—'}</td>
                          <td className="py-3 pr-4">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${txn.status === 'completed' || txn.status === 'succeeded' ? 'bg-success-50 text-success-700' : txn.status === 'failed' ? 'bg-error-50 text-error-700' : 'bg-warning-50 text-warning-700'}`}>
                              {txn.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-xs text-ink-500">{new Date(txn.created_at).toLocaleString()}</td>
                        </tr>
                        {reviewingTxn === txn.id && (
                          <tr>
                            <td colSpan={4} className="bg-ink-50/50 p-4 border-t border-ink-100">
                              <div className="flex flex-col gap-3">
                                <p className="text-sm font-semibold text-ink-900">Review Manual Payment</p>
                                <div className="flex flex-wrap gap-2">
                                  <button onClick={() => { setReviewAction('approve'); setReviewError(null); }} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${reviewAction === 'approve' ? 'bg-success-600 text-white border-success-600' : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'}`}>Approve</button>
                                  <button onClick={() => { setReviewAction('request_resubmission'); setReviewError(null); }} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${reviewAction === 'request_resubmission' ? 'bg-warning-600 text-white border-warning-600' : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'}`}>Request Resubmission</button>
                                  <button onClick={() => { setReviewAction('reject'); setReviewError(null); }} className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${reviewAction === 'reject' ? 'bg-error-600 text-white border-error-600' : 'bg-white text-ink-700 border-ink-200 hover:bg-ink-50'}`}>Reject Final</button>
                                </div>
                                {reviewAction === 'reject' && (
                                  <div className="flex flex-col gap-2 max-w-sm">
                                    <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value as ManualRejectionReasonCode | '')} className="rounded-lg border border-ink-200 p-2 text-sm bg-white">
                                      <option value="">Select a reason...</option>
                                      {Object.entries(MANUAL_REJECTION_REASONS).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
                                    </select>
                                    {reasonCode === 'other' && <input value={reasonText} onChange={(e) => setReasonText(e.target.value)} placeholder="Specify reason..." className="rounded-lg border border-ink-200 p-2 text-sm" />}
                                  </div>
                                )}
                                {reviewAction === 'request_resubmission' && (
                                  <div className="flex flex-col gap-2 max-w-sm">
                                    <input value={reasonText} onChange={(e) => { setReasonText(e.target.value); setReasonCode('request_resubmission'); }} placeholder="Reason for resubmission (optional)..." className="rounded-lg border border-ink-200 p-2 text-sm" />
                                  </div>
                                )}
                                {reviewError && <p className="text-sm font-medium text-error-600">{reviewError}</p>}
                                <div className="flex gap-2 mt-2">
                                  <button onClick={submitReview} disabled={saving || !reviewAction} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 disabled:opacity-50">Submit Review</button>
                                  <button onClick={() => { setReviewingTxn(null); setReviewAction(null); setReviewError(null); }} className="px-4 py-2 border border-ink-200 bg-white text-ink-700 rounded-lg text-sm font-semibold hover:bg-ink-50">Cancel</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6"><h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink-900"><Clock3 size={18} className="text-ink-400" /> Order History</h2>{history.length === 0 ? <p className="mt-4 text-sm text-ink-500">No status history has been recorded yet.</p> : <ol className="mt-5 space-y-4 border-l border-ink-200 pl-5">{history.map((entry) => <li key={entry.id} className="relative"><span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-brand-500" /><p className="text-xs text-ink-400">{formatOrderDate(entry.created_at)}</p><div className="mt-2 flex flex-wrap gap-2"><OrderStatusBadge value={getHistoryOrderStatus(entry)} /><OrderStatusBadge value={entry.payment_status} /><OrderStatusBadge value={entry.fulfillment_status} /></div></li>)}</ol>}</section>
          
          <OrderEmailLogs 
            logs={emailLogs} 
            loading={logsLoading} 
            orderId={order.id} 
            orderNumber={order.order_number} 
            onReload={loadLogs} 
            onRetry={handleRetryEmail} 
          />
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="font-display text-base font-bold text-ink-900">Customer</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-xs uppercase tracking-wider text-ink-400">Name</dt><dd className="mt-0.5 font-medium text-ink-800">{order.customer_name}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-ink-400">Email</dt><dd className="mt-0.5 break-all font-medium text-ink-800">{order.customer_email}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-ink-400">Phone</dt><dd className="mt-0.5 font-medium text-ink-800">{order.customer_phone || '—'}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-ink-400">Customer Note</dt><dd className="mt-0.5 whitespace-pre-wrap text-ink-600">{order.customer_note || '—'}</dd></div>
              <div className="mt-4 border-t border-ink-100 pt-3">
                <dt className="text-xs uppercase tracking-wider text-ink-400">Account Status</dt>
                <dd className="mt-1 flex items-center justify-between">
                  <span className="font-medium text-ink-800">
                    {order.user_id ? 'Registered Account' : 'Guest Account (Pending/No Profile)'}
                  </span>
                  <button onClick={() => handleRetryEmail('account_activation_customer')} className="text-xs font-semibold text-brand-600 hover:text-brand-700">Resend Activation</button>
                </dd>
              </div>
            </dl>
          </section>
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"><h2 className="font-display text-base font-bold text-ink-900">Totals</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd>{formatAmount(Number(order.subtotal))}</dd></div>{Number(order.discount_total || 0) > 0 ? <><div className="flex justify-between"><dt className="text-success-600">{order.discount_source === 'coupon' ? `Coupon: ${order.discount_code}` : order.discount_name || 'Promotion'}</dt><dd className="font-medium text-success-600">−{formatAmount(Number(order.discount_total))}</dd></div>{order.discount_source === 'coupon' && order.discount_name && <p className="text-xs text-ink-500">{order.discount_name}</p>}</> : <div className="flex justify-between"><dt className="text-ink-500">Discount</dt><dd>{formatAmount(0)}</dd></div>}<div className="flex justify-between border-t border-ink-100 pt-3 text-base font-bold"><dt>Total</dt><dd>{formatAmount(Number(order.total))}</dd></div><div className="flex justify-between"><dt className="text-ink-500">Currency</dt><dd className="font-medium">{order.currency_code}</dd></div></dl></section>
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft"><h2 className="font-display text-base font-bold text-ink-900">Status Management</h2><div className="mt-4 space-y-4"><label className="block text-sm font-semibold text-ink-700">Order Status<select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value as OrderStatus)} className={`${selectClass} mt-1.5`}>{orderStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label className="block text-sm font-semibold text-ink-700">Payment Status<select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)} className={`${selectClass} mt-1.5`}>{paymentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label className="block text-sm font-semibold text-ink-700">Fulfillment Status<select value={fulfillmentStatus} onChange={(e) => setFulfillmentStatus(e.target.value as FulfillmentStatus)} className={`${selectClass} mt-1.5`}>{fulfillmentStatuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><label className="block text-sm font-semibold text-ink-700">Admin Note<textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={4} maxLength={2000} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm font-normal text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" placeholder="Internal note—not visible to customers" /></label></div>{message && <div className="mt-4 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}{error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700"><AlertCircle size={16} />{error}</div>}<button type="button" onClick={handleSave} disabled={saving} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">{saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving…</> : <><Save size={16} /> Save Status</>}</button></section>
        </div>
      </div>
    </div>
  );
}

export function AdminOrderDetailPage() {
  const { id = '' } = useParams();
  const [detail, setDetail] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { const data = await getAdminOrderById(id); if (!data) throw new Error('Not found'); setDetail(data); }
    catch (loadError) { console.error('Failed to load admin order', loadError); setError('This order could not be loaded.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex min-h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>;
  if (error || !detail) return <div className="px-5 py-10 lg:px-8"><div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle size={17} />{error}</div></div>;
  return <AdminOrderContent detail={detail} onReload={load} />;
}
