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
    <div className="w-full">
      {/* ── MOBILE CARD VIEW (sm:hidden) — Fits 100% Mobile Screen, No Distortion or Zoom ── */}
      <div className="sm:hidden divide-y divide-ink-100 rounded-xl border border-ink-100 bg-white overflow-hidden shadow-xs">
        {items.map((item) => {
          const name = getOrderItemName(item);
          const slug = getOrderItemSlug(item);
          const isCourse = item.product_id === 'c0000001-0000-4000-8000-000000000001' || name.includes('AI মোশন');
          const targetUrl = isCourse ? '/course/ai-motion/learn' : slug ? `/products/${slug}` : null;

          return (
            <div key={item.id} className="p-3.5 flex items-start gap-3">
              {/* Thumbnail: Fixed Size, Never Stretches */}
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-ink-50 border border-ink-100 flex items-center justify-center">
                <ImageWithFallback
                  src={getOrderItemThumbnail(item)}
                  alt={name}
                  className="h-full w-full object-cover"
                  fallback={<ImageIcon size={20} className="text-ink-300" />}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-block rounded-md bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                    {humanizeOrderValue(item.delivery_type)}
                  </span>
                  {isCourse && (
                    <span className="inline-block rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 uppercase">
                      কোর্স
                    </span>
                  )}
                </div>

                <div className="mt-1">
                  {targetUrl ? (
                    <Link to={targetUrl} className="font-semibold text-sm text-ink-900 hover:text-brand-600 line-clamp-2 leading-snug">
                      {name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-sm text-ink-900 line-clamp-2 leading-snug">
                      {name}
                    </span>
                  )}
                </div>

                {adminView && item.sku && (
                  <p className="text-[11px] text-ink-400 mt-0.5">SKU: {item.sku}</p>
                )}

                <div className="mt-2 flex items-center justify-between text-xs pt-1.5 border-t border-ink-50">
                  <span className="text-ink-500 font-medium">
                    {item.quantity > 1 ? `${item.quantity} × ${formatAmount(Number(item.unit_price))}` : 'পরিমাণ: ১'}
                  </span>
                  <span className="font-bold text-ink-900 text-sm">
                    {formatAmount(Number(item.line_total))}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP TABLE VIEW (hidden sm:block) ── */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-ink-100 bg-white">
        <table className="w-full text-sm">
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
              const isCourse = item.product_id === 'c0000001-0000-4000-8000-000000000001' || name.includes('AI মোশন');
              const targetUrl = isCourse ? '/course/ai-motion/learn' : slug ? `/products/${slug}` : null;

              return (
                <tr key={item.id}>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-50 border border-ink-100">
                        <ImageWithFallback
                          src={getOrderItemThumbnail(item)}
                          alt={name}
                          className="h-full w-full object-cover"
                          fallback={<ImageIcon size={20} className="text-ink-300" />}
                        />
                      </div>
                      <div className="min-w-0">
                        {targetUrl ? (
                          <Link to={targetUrl} className="font-semibold text-ink-800 hover:text-brand-600 line-clamp-1">
                            {name}
                          </Link>
                        ) : (
                          <span className="font-semibold text-ink-800 line-clamp-1">{name}</span>
                        )}
                        {isCourse && (
                          <span className="inline-block rounded bg-purple-50 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 mt-0.5">
                            অনলাইন কোর্স
                          </span>
                        )}
                      </div>
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
    </div>
  );
}
export default OrderItemsTable;
