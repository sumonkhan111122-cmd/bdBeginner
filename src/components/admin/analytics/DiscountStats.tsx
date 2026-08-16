import type { DiscountStatsRow } from '@/services/analytics';
import { formatCurrency } from '@/lib/currency';

export function DiscountStats({ data }: { data: DiscountStatsRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-soft overflow-hidden">
      <div className="p-5 border-b border-ink-100">
        <h3 className="font-semibold text-ink-900">Discount Usage (Paid Orders)</h3>
      </div>
      
      {data.length === 0 ? (
        <div className="p-6 text-center text-ink-500 text-sm">
          No discounts used in paid orders for this period.
        </div>
      ) : (
        <div className="divide-y divide-ink-100">
          {data.map((row, idx) => (
            <div key={idx} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col">
                  <span className="font-semibold text-ink-900 text-sm">
                    {row.discount_code || 'Automatic Promotion'}
                  </span>
                  <span className="text-xs font-medium text-ink-500 uppercase tracking-wider">
                    {row.discount_source || 'Unknown'}
                  </span>
                </div>
                <span className="font-display font-bold text-error-600 bg-error-50 px-2 py-1 rounded-lg text-sm">
                  -{formatCurrency(row.discount_given)}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-ink-600 bg-ink-50 p-3 rounded-xl">
                <div className="flex-1">
                  <p className="text-xs text-ink-500 mb-0.5">Orders</p>
                  <p className="font-semibold">{row.paid_orders}</p>
                </div>
                <div className="w-px h-8 bg-ink-200"></div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-ink-500 mb-0.5">Sales Post-Discount</p>
                  <p className="font-semibold">{formatCurrency(row.paid_sales_after)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
