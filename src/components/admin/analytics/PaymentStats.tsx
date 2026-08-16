import type { PaymentStatsRow } from '@/services/analytics';
import { formatCurrency } from '@/lib/currency';

export function PaymentStats({ data }: { data: PaymentStatsRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-soft overflow-hidden">
      <div className="p-5 border-b border-ink-100">
        <h3 className="font-semibold text-ink-900">Payment Providers</h3>
      </div>
      
      {data.length === 0 ? (
        <div className="p-6 text-center text-ink-500 text-sm">
          No payment activity in this period.
        </div>
      ) : (
        <div className="divide-y divide-ink-100">
          {data.map((row) => {
            const successRate = row.attempts > 0 ? (row.succeeded / row.attempts) * 100 : 0;
            return (
              <div key={row.provider} className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-ink-900 uppercase tracking-wider text-xs bg-ink-100 px-2 py-1 rounded">
                    {row.provider}
                  </span>
                  <span className="font-display font-bold text-brand-600">
                    {formatCurrency(row.succeeded_amount)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Attempts</p>
                    <p className="font-semibold text-ink-900">{row.attempts}</p>
                  </div>
                  <div>
                    <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Success Rate</p>
                    <p className="font-semibold text-success-600">{successRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Failed</p>
                    <p className="font-semibold text-error-600">{row.failed}</p>
                  </div>
                  <div>
                    <p className="text-ink-500 text-xs uppercase tracking-wider mb-1">Pending/Manual</p>
                    <p className="font-semibold text-warning-600">{row.pending}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
