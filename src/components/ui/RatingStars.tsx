import { Star } from 'lucide-react';

type RatingStarsProps = {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
};

export function RatingStars({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  className = '',
}: RatingStarsProps) {
  const starSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => {
          const filled = rating >= i;
          const partial = rating >= i - 0.5 && rating < i;
          return (
            <Star
              key={i}
              size={starSize}
              className={
                filled
                  ? 'fill-warning-400 text-warning-400'
                  : partial
                    ? 'fill-warning-200 text-warning-300'
                    : 'fill-ink-100 text-ink-200'
              }
              aria-hidden="true"
            />
          );
        })}
      </div>
      <span className={`font-semibold text-ink-800 ${textSize}`}>
        {rating.toFixed(1)}
      </span>
      {showCount && reviewCount !== undefined && (
        <span className={`text-ink-400 ${textSize}`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
