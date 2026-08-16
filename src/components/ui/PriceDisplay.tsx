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

  const hasDiscount = previousPrice && previousPrice > price;
  const discountPct = hasDiscount
    ? Math.round(((previousPrice - price) / previousPrice) * 100)
    : 0;

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className={`font-display font-bold text-ink-900 ${priceSize}`}>
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <>
          <span className={`text-ink-400 line-through ${prevSize}`}>
            {formatPrice(previousPrice)}
          </span>
          <span className={`text-success-600 font-semibold ${prevSize}`}>
            {discountPct}% off
          </span>
        </>
      )}
    </div>
  );
}
