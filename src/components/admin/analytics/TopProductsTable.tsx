import type { TopProductRow } from '@/services/analytics';
import { formatCurrency } from '@/lib/currency';
import { PackageOpen } from 'lucide-react';

export function TopProductsTable({ data }: { data: TopProductRow[] }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 shadow-soft overflow-hidden">
      <div className="p-5 border-b border-ink-100 flex items-center justify-between">
        <h3 className="font-semibold text-ink-900">Top Products (Units Sold)</h3>
      </div>
      
      {data.length === 0 ? (
        <div className="p-8 text-center text-ink-500 font-medium">
          <PackageOpen size={32} className="mx-auto mb-2 text-ink-300" />
          No products sold in this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-ink-50 text-ink-600 font-semibold border-b border-ink-100">
              <tr>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3 text-right">Units Sold</th>
                <th className="px-5 py-3 text-right">Orders</th>
                <th className="px-5 py-3 text-right">Gross Sales</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {data.map((row) => (
                <tr key={row.product_id} className="hover:bg-ink-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-ink-900">
                    {row.product_name}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-ink-700">
                    {row.units_sold}
                  </td>
                  <td className="px-5 py-3 text-right text-ink-600">
                    {row.paid_orders}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-ink-900">
                    {formatCurrency(row.gross_sales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
