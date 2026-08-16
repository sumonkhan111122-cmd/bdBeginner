import { humanizeOrderValue } from '@/lib/orders';

const styles: Record<string, string> = {
  pending: 'border-warning-200 bg-warning-50 text-warning-700',
  unpaid: 'border-warning-200 bg-warning-50 text-warning-700',
  unfulfilled: 'border-ink-200 bg-ink-50 text-ink-600',
  confirmed: 'border-brand-200 bg-brand-50 text-brand-700',
  processing: 'border-brand-200 bg-brand-50 text-brand-700',
  paid: 'border-success-200 bg-success-50 text-success-700',
  fulfilled: 'border-success-200 bg-success-50 text-success-700',
  completed: 'border-success-200 bg-success-50 text-success-700',
  failed: 'border-error-200 bg-error-50 text-error-700',
  cancelled: 'border-error-200 bg-error-50 text-error-700',
  refunded: 'border-ink-200 bg-ink-100 text-ink-600',
};

export function OrderStatusBadge({ value }: { value: string | null | undefined }) {
  const normalized = value?.toLowerCase() ?? '';
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${
        styles[normalized] ?? 'border-ink-200 bg-ink-50 text-ink-600'
      }`}
    >
      {humanizeOrderValue(value)}
    </span>
  );
}
