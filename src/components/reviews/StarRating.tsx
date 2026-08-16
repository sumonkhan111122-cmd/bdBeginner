import { useState } from 'react';
import { Star } from 'lucide-react';

type StarRatingProps = {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readonly?: boolean;
};

export function StarRating({ value, onChange, size = 20, readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hover !== null ? hover : value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(null)}
            className={`transition-colors focus:outline-none ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-500 rounded-sm'}`}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            aria-pressed={value >= star}
          >
            <Star
              size={size}
              className={`${isFilled ? 'fill-warning-400 text-warning-400' : 'fill-ink-100 text-ink-200'}`}
              strokeWidth={isFilled ? 1 : 2}
            />
          </button>
        );
      })}
    </div>
  );
}

export function StaticStarRating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fillPercentage = Math.max(0, Math.min(1, value - (star - 1))) * 100;
        
        return (
          <div key={star} className="relative" style={{ width: size, height: size }}>
            <Star
              size={size}
              className="absolute inset-0 text-ink-200 fill-ink-100"
              strokeWidth={1}
            />
            {fillPercentage > 0 && (
              <div 
                className="absolute inset-0 overflow-hidden" 
                style={{ width: `${fillPercentage}%` }}
              >
                <Star
                  size={size}
                  className="text-warning-400 fill-warning-400"
                  strokeWidth={1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
