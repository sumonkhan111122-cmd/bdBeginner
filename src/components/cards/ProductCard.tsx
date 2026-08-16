import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Download, KeyRound, Clock, Repeat, Wrench } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useState } from 'react';
import type { Product, DeliveryType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { deliveryLabels } from '@/data/homepage';
import { useCart } from '@/context/CartContext';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { StaticStarRating } from '@/components/reviews/StarRating';
import { WishlistButton } from '@/components/discovery/WishlistButton';

const accentMap: Record<string, { bg: string; icon: string; bar: string }> = {
  brand: { bg: 'bg-brand-50/50', icon: 'text-brand-600', bar: 'bg-brand-500' },
  accent: { bg: 'bg-accent-50/50', icon: 'text-accent-600', bar: 'bg-accent-500' },
  ink: { bg: 'bg-ink-50', icon: 'text-ink-600', bar: 'bg-ink-500' },
  success: { bg: 'bg-success-50/50', icon: 'text-success-600', bar: 'bg-success-500' },
  warning: { bg: 'bg-warning-50/50', icon: 'text-warning-600', bar: 'bg-warning-500' },
};

const deliveryIconMap: Record<DeliveryType, typeof Download> = {
  'instant-download': Download,
  'license-key': KeyRound,
  'manual-delivery': Clock,
  'subscription': Repeat,
  'service': Wrench,
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const Icon = (Icons[product.icon as keyof typeof Icons] ?? Icons.Package) as Icons.LucideIcon;
  const accent = accentMap[product.accent] ?? accentMap.brand;
  const DeliveryIcon = deliveryIconMap[product.deliveryType] ?? Download;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link
      to={`/products/${product.slug}`}
      className="card-base card-hover group flex flex-col overflow-hidden"
    >
      {/* Thumbnail */}
      <div className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden ${accent.bg}`}>
        <ImageWithFallback
          src={product.thumbnail}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          fallback={
            <>
              <div className="absolute inset-0 flex flex-col justify-end gap-1.5 p-4 opacity-[0.06]">
                <div className={`h-1.5 w-3/4 rounded-full ${accent.bar}`} />
                <div className={`h-1.5 w-1/2 rounded-full ${accent.bar}`} />
                <div className={`h-1.5 w-2/3 rounded-full ${accent.bar}`} />
              </div>
              <div className={`absolute h-20 w-20 rounded-full border-2 ${accent.bar} opacity-[0.08]`} />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/50 backdrop-blur-sm">
                <Icon size={28} className={`${accent.icon} opacity-80`} strokeWidth={1.5} aria-hidden="true" />
              </div>
            </>
          }
        />
        {product.badge && (
          <div className="absolute left-3 top-3">
            <Badge variant={product.badge} />
          </div>
        )}
        <div className="absolute right-3 top-3 z-10">
          <WishlistButton productId={product.id} />
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-ink-600 shadow-sm backdrop-blur-sm">
          <DeliveryIcon size={12} className="text-ink-500" />
          {deliveryLabels[product.deliveryType]}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
          {product.category}
        </span>
        <h3 className="mt-1.5 font-display text-[15px] font-bold leading-snug text-ink-900 line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500 line-clamp-2">
          {product.descriptor}
        </p>

        {product.reviewStats && product.reviewStats.reviewCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            <StaticStarRating value={product.reviewStats.averageRating} size={12} />
            <span className="text-xs font-semibold text-ink-600">
              {product.reviewStats.averageRating.toFixed(1)}
            </span>
            <span className="text-[10px] text-ink-400">
              ({product.reviewStats.reviewCount})
            </span>
          </div>
        )}

        <div className="mt-auto pt-4">
          <PriceDisplay price={product.price} previousPrice={product.previousPrice} size="md" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              added
                ? 'bg-success-50 text-success-700 border border-success-200'
                : 'bg-ink-50 text-ink-700 border border-ink-100 hover:bg-ink-100 hover:border-ink-200'
            }`}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <Check size={15} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={15} />
                Add to Cart
              </>
            )}
          </button>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-100 text-ink-500 transition-all hover:border-ink-200 hover:text-ink-900"
            aria-label="View details"
          >
            <Icons.Eye size={15} />
          </span>
        </div>
      </div>
    </Link>
  );
}
