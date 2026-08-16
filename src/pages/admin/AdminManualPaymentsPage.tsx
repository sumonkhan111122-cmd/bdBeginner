import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatOrderDate } from '@/lib/orders';
import { getSupabase } from '@/lib/supabase';
import {
  MANUAL_REJECTION_REASONS,
  reviewManualPayment,
  type ManualRejectionReasonCode,
} from '@/services/payment';

type PendingPayment = {
  id: string;
  order_id: string;
  provider: string;
  provider_transaction_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  metadata: { submitted_at?: string } | null;
  orders: {
    order_number: string;
    customer_email: string;
    customer_name: string;
  };
};

const rejectionCodes = Object.keys(MANUAL_REJECTION_REASONS) as ManualRejectionReasonCode[];

export function AdminManualPaymentsPage() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reasonCode, setReasonCode] = useState<ManualRejectionReasonCode>('invalid_transaction_id');
  const [reasonText, setReasonText] = useState('');

  async function loadPayments() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await getSupabase()
        .from('payment_transactions')
        .select('*,orders(order_number,customer_email,customer_name)')
        .eq('status', 'pending')
        .in('provider', ['bkash_personal', 'nagad_personal', 'rocket_personal'])
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      setPayments((data ?? []) as unknown as PendingPayment[]);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load pending payments.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadPayments(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return payments;
    return payments.filter((payment) => [
      payment.orders?.order_number,
      payment.provider_transaction_id,
      payment.orders?.customer_email,
      payment.orders?.customer_name,
    ].some((value) => value?.toLowerCase().includes(query)));
  }, [payments, search]);

  const processReview = async (
    transactionId: string,
    action: 'approve' | 'reject',
  ) => {
    if (action === 'reject' && reasonCode === 'other' && !reasonText.trim()) {
      setError('Please add a customer-safe explanation when the reason is Other.');
      return;
    }
    setProcessingId(transactionId);
    setError(null);
    setMessage(null);
    try {
      const result = await reviewManualPayment({
        action,
        transactionId,
        ...(action === 'reject' ? { reasonCode, reasonText: reasonText.trim() || undefined } : {}),
      });
      setMessage(result.message);
      setRejectingId(null);
      setReasonText('');
      await loadPayments();
    } catch (reviewError: unknown) {
      setError(reviewError instanceof Error ? reviewError.message : `Failed to ${action} payment.`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="font-display text-2xl font-bold text-ink-900">Manual Payments</h1><p className="mt-1 text-sm text-ink-500">Review pending customer payment submissions.</p></div>
        <Button variant="outline" onClick={() => void loadPayments()}>Refresh Queue</Button>
      </div>

      {error && <div className="mt-5 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{error}</div>}
      {message && <div className="mt-5 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-4 text-sm text-success-700"><CheckCircle2 size={17} />{message}</div>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        <div className="flex items-center gap-4 border-b border-ink-100 p-4 sm:p-5"><div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} /><input type="search" placeholder="Search TrxID, order, customer, or email" value={search} onChange={(event) => setSearch(event.target.value)} className="h-10 w-full rounded-lg border border-ink-200 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none" /></div></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] whitespace-nowrap text-left text-sm">
            <thead className="bg-ink-50/60 text-xs font-semibold uppercase tracking-wider text-ink-500"><tr><th className="px-5 py-4">Submitted</th><th className="px-5 py-4">Order / Customer</th><th className="px-5 py-4">Provider</th><th className="px-5 py-4">TrxID</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-ink-100 text-ink-700">
              {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center"><span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-400">No pending payments found.</td></tr> : filtered.map((payment) => <tr key={payment.id} className="hover:bg-ink-50/30"><td className="px-5 py-4">{formatOrderDate(payment.metadata?.submitted_at || payment.created_at)}</td><td className="px-5 py-4"><div className="font-semibold text-ink-900">{payment.orders?.order_number}</div><div className="mt-0.5 text-xs text-ink-500">{payment.orders?.customer_name} · {payment.orders?.customer_email}</div></td><td className="px-5 py-4"><span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-semibold">{payment.provider.replace('_personal', '').toUpperCase()}</span></td><td className="px-5 py-4"><code className="rounded bg-ink-100 px-2 py-1 text-xs font-bold">{payment.provider_transaction_id}</code></td><td className="px-5 py-4 font-semibold">{payment.currency} {Number(payment.amount).toLocaleString()}</td><td className="space-x-2 px-5 py-4 text-right"><Button size="sm" onClick={() => void processReview(payment.id, 'approve')} disabled={!!processingId}>{processingId === payment.id ? 'Saving…' : 'Approve'}</Button><Button size="sm" variant="outline" onClick={() => { setRejectingId(payment.id); setError(null); }} disabled={!!processingId}>Reject</Button></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      {rejectingId && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label="Close rejection dialog" className="absolute inset-0 bg-ink-900/60" onClick={() => setRejectingId(null)} /><div role="dialog" aria-modal="true" className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold text-ink-900">Reject Manual Payment</h2><button type="button" onClick={() => setRejectingId(null)} className="rounded-lg p-2 text-ink-400 hover:bg-ink-50" aria-label="Close"><X size={18} /></button></div><label className="mt-5 block text-sm font-semibold text-ink-700">Reason<select value={reasonCode} onChange={(event) => setReasonCode(event.target.value as ManualRejectionReasonCode)} className="mt-1.5 h-11 w-full rounded-xl border border-ink-200 bg-white px-3 text-sm">{rejectionCodes.map((code) => <option key={code} value={code}>{MANUAL_REJECTION_REASONS[code]}</option>)}</select></label><label className="mt-4 block text-sm font-semibold text-ink-700">Additional customer-safe details {reasonCode === 'other' && <span className="text-error-600">*</span>}<textarea value={reasonText} onChange={(event) => setReasonText(event.target.value)} maxLength={500} rows={4} className="mt-1.5 w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm" /></label><div className="mt-5 flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button><Button type="button" variant="secondary" onClick={() => void processReview(rejectingId, 'reject')} disabled={!!processingId}>{processingId ? 'Rejecting…' : 'Reject Payment'}</Button></div></div></div>}
    </div>
  );
}
