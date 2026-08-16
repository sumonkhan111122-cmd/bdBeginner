import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useDiscovery } from '@/context/DiscoveryContext';

type WishlistButtonProps = {
  productId: string;
  className?: string;
  variant?: 'icon' | 'labeled';
};

export function WishlistButton({ productId, className = '', variant = 'icon' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useDiscovery();
  const [loading, setLoading] = useState(false);
  const isSaved = isInWishlist(productId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;
    
    setLoading(true);
    try {
      await toggleWishlist(productId);
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'labeled') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
          isSaved
            ? 'border-brand-200 bg-brand-50 text-brand-700 hover:border-brand-300 hover:bg-brand-100'
            : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
        } ${className}`}
        aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={18}
          className={`${isSaved ? 'fill-brand-600 text-brand-600' : 'text-ink-500'}`}
        />
        {isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}
      </button>
    );
  }

  // Icon only
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-105 ${
        isSaved ? 'text-brand-600' : 'text-ink-500 hover:text-ink-900'
      } ${className}`}
      aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart size={18} className={isSaved ? 'fill-current' : ''} />
    </button>
  );
}
