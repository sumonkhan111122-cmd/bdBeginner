import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, QrCode, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useOrderAmountFormatter } from '@/hooks/useOrderAmountFormatter';
import { submitManualPayment } from '@/services/payment';
import {
  fetchPublicPaymentSettings,
  getEnabledManualMethods,
} from '@/services/paymentSettings';
import type { ManualPaymentMethod, PaymentMethodSetting } from '@/types/settings';

interface ManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  orderTotal: number;
  currencyCode: string;
  accessToken?: string;
  onSuccess: () => void;
}

export function ManualPaymentModal({
  isOpen,
  onClose,
  orderNumber,
  orderTotal,
  currencyCode,
  accessToken,
  onSuccess,
}: ManualPaymentModalProps) {
  const [methods, setMethods] = useState<PaymentMethodSetting[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<ManualPaymentMethod | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [qrFailed, setQrFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const formatAmount = useOrderAmountFormatter(currencyCode);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchPublicPaymentSettings()
      .then((settings) => {
        if (!active) return;
        const enabled = getEnabledManualMethods(settings);
        setMethods(enabled);
        setSelectedMethod((current) => {
          if (current && enabled.some((method) => method.method === current)) return current;
          return (enabled[0]?.method as ManualPaymentMethod | undefined) ?? null;
        });
      })
      .catch(() => {
        if (active) setError('Payment methods could not be loaded. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [isOpen]);

  useEffect(() => {
    setShowQr(false);
    setQrFailed(false);
    setCopied(false);
  }, [selectedMethod]);

  const selected = useMemo(
    () => methods.find((method) => method.method === selectedMethod) ?? null,
    [methods, selectedMethod],
  );

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!selected?.recipient_number) return;
    try {
      await navigator.clipboard.writeText(selected.recipient_number);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError('Could not copy automatically. Please copy the number manually.');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedMethod || !selected) {
      setError('Select an available payment method.');
      return;
    }
    if (transactionId.trim().length < 4) {
      setError('Please enter a valid Transaction ID.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitManualPayment({
        orderNumber,
        method: selectedMethod,
        transactionId: transactionId.trim(),
        accessToken,
      });
      onSuccess();
    } catch (submissionError: unknown) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Failed to submit payment verification.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" role="dialog" aria-modal="true" aria-label="Manual payment">
      <button type="button" aria-label="Close manual payment" className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-5 py-4 sm:px-6">
          <h2 className="font-display text-lg font-bold text-ink-900">Manual Payment</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-700" aria-label="Close"><X size={20} /></button>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 rounded-xl border border-brand-100 bg-brand-50 p-4 sm:flex-row sm:items-center">
            <div><p className="text-sm font-medium text-brand-700">Exact Amount to Pay</p><p className="mt-0.5 font-display text-xl font-bold text-brand-900">{formatAmount(orderTotal)}</p></div>
            <div className="sm:text-right"><p className="text-sm font-medium text-brand-700">Order</p><p className="mt-0.5 font-display font-semibold text-brand-900">{orderNumber}</p></div>
          </div>

          {error && <div className="mt-5 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle className="mt-0.5 shrink-0" size={17} />{error}</div>}

          {loading ? (
            <div className="flex h-48 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>
          ) : methods.length === 0 ? (
            <div className="mt-6 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">No manual payment method is currently available.</div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-ink-900">Select Payment Method</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {methods.map((method) => (
                    <button key={method.id} type="button" onClick={() => setSelectedMethod(method.method as ManualPaymentMethod)} className={`relative min-h-16 rounded-xl border-2 p-3 text-sm font-semibold transition-colors ${selectedMethod === method.method ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-100 text-ink-600 hover:border-ink-200'}`}>
                      {selectedMethod === method.method && <CheckCircle2 className="absolute right-2 top-2 text-brand-600" size={15} />}
                      {method.display_name}
                    </button>
                  ))}
                </div>
              </div>

              {selected && (
                <div className="rounded-xl border border-ink-200 bg-ink-50 p-4 sm:p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Recipient Number</p>
                      <p className="mt-1 font-display text-xl font-bold tracking-wide text-ink-900">{selected.recipient_number || 'Not configured'}</p>
                      <p className="mt-1 text-xs text-ink-500">Account Type: {selected.account_type || 'Not configured'}</p>
                    </div>
                    {selected.recipient_number && <Button type="button" variant="outline" size="sm" onClick={handleCopy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy Number'}</Button>}
                  </div>

                  {selected.instructions.length > 0 && (
                    <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-ink-600">
                      {selected.instructions.map((instruction, index) => <li key={`${selected.id}-${index}`}>{instruction}</li>)}
                    </ol>
                  )}

                  {selected.qr_image_url && !qrFailed && (
                    <div className="mt-5">
                      <Button type="button" variant="outline" size="sm" onClick={() => setShowQr((value) => !value)}><QrCode size={15} />{showQr ? 'Hide QR Code' : 'Show QR Code'}</Button>
                      {showQr && <div className="mt-3 flex justify-center rounded-xl bg-white p-4"><img src={selected.qr_image_url} alt={`${selected.display_name} payment QR`} onError={() => setQrFailed(true)} className="h-auto max-h-72 w-full max-w-72 object-contain" /></div>}
                    </div>
                  )}
                  {qrFailed && <div className="mt-4 rounded-lg border border-warning-200 bg-warning-50 p-3 text-sm text-warning-800">QR image is temporarily unavailable.<br />Please use the payment number above.</div>}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-semibold text-ink-900">Transaction ID (TrxID)</span>
                <input value={transactionId} onChange={(event) => setTransactionId(event.target.value)} maxLength={100} autoComplete="off" placeholder="Enter the transaction ID" className="mt-1.5 h-12 w-full rounded-xl border border-ink-200 bg-white px-4 text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" required />
              </label>

              <Button type="submit" fullWidth size="lg" disabled={submitting || !selected || !selected.recipient_number}>{submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</> : 'Submit for Verification'}</Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
