import { useCurrencyFormatter } from '@/hooks/useCurrency';

type PriceDisplayProps = {
  price: number;
  previousPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function PriceDisplay({
  price,
  previousPrice,
  size = 'md',
  className = '',
}: PriceDisplayProps) {
  const formatPrice = useCurrencyFormatter();
  const priceSize =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
  const prevSize =
    size === 'lg' ? 'text-base' : size === 'sm' ? 'text-xs' : 'text-sm';

  const isFree = price === 0;
  const hasDiscount = previousPrice && previousPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((previousPrice - price) / previousPrice) * 100)
    : 0;

  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      {isFree ? (
        <>
          <span className={`font-display font-bold text-emerald-600 ${priceSize}`}>
            ৳0
          </span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
            100% FREE
          </span>
        </>
      ) : (
        <span className={`font-display font-bold text-ink-900 ${priceSize}`}>
          {formatPrice(price)}
        </span>
      )}
      {hasDiscount && (
        <>
          <span className={`text-ink-400 line-through ${prevSize}`}>
            {formatPrice(previousPrice)}
          </span>
          {!isFree && (
            <span className={`text-success-600 font-semibold ${prevSize}`}>
              {discountPct}% off
            </span>
          )}
        </>
      )}
    </div>
  );
}
