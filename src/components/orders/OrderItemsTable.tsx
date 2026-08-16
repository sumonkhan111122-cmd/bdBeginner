import { Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useOrderAmountFormatter } from '@/hooks/useOrderAmountFormatter';
import {
  getOrderItemName,
  getOrderItemSku,
  getOrderItemSlug,
  getOrderItemThumbnail,
  humanizeOrderValue,
} from '@/lib/orders';
import type { OrderItemRow } from '@/types/orders';

export function OrderItemsTable({
  items,
  currencyCode,
  adminView = false,
}: {
  items: OrderItemRow[];
  currencyCode: string;
  adminView?: boolean;
}) {
  const formatAmount = useOrderAmountFormatter(currencyCode);

  return (
    <div className="overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full min-w-[680px] text-sm">
        <thead>
          <tr className="border-b border-ink-100 bg-ink-50/70 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
            <th className="px-4 py-3">Product</th>
            {adminView && <th className="px-4 py-3">SKU</th>}
            <th className="px-4 py-3">Delivery</th>
            <th className="px-4 py-3 text-center">Qty</th>
            <th className="px-4 py-3 text-right">Unit Price</th>
            <th className="px-4 py-3 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-50">
          {items.map((item) => {
            const name = getOrderItemName(item);
            const slug = getOrderItemSlug(item);
            return (
              <tr key={item.id}>
                <td className="px-4 py-3.5">
                  <div className="flex min-w-52 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50">
                      <ImageWithFallback
                        src={getOrderItemThumbnail(item)}
                        alt={name}
                        className="h-full w-full object-cover"
                        fallback={<ImageIcon size={20} className="text-ink-300" />}
                      />
                    </div>
                    {slug ? (
                      <Link to={`/products/${slug}`} className="font-semibold text-ink-800 hover:text-brand-600">
                        {name}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink-800">{name}</span>
                    )}
                  </div>
                </td>
                {adminView && <td className="px-4 py-3.5 text-ink-500">{getOrderItemSku(item) ?? '—'}</td>}
                <td className="px-4 py-3.5 text-ink-500">{humanizeOrderValue(item.delivery_type)}</td>
                <td className="px-4 py-3.5 text-center font-medium text-ink-700">{item.quantity}</td>
                <td className="px-4 py-3.5 text-right text-ink-600">{formatAmount(Number(item.unit_price))}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-ink-900">{formatAmount(Number(item.line_total))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
