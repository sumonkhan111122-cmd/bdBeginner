import { useEffect, useState } from 'react';
import { useDiscovery } from '@/context/DiscoveryContext';
import { getProductsByIds } from '@/services/catalog';
import type { Product } from '@/types';
import { ProductCard } from '@/components/cards/ProductCard';

type RecentlyViewedSectionProps = {
  className?: string;
  limit?: number;
};

export function RecentlyViewedSection({ className = '', limit = 4 }: RecentlyViewedSectionProps) {
  const { recentlyViewedIds, clearRecentlyViewed, loading: discoveryLoading } = useDiscovery();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      if (discoveryLoading) return;
      if (recentlyViewedIds.length === 0) {
        if (mounted) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        // Fetch up to the limit to avoid fetching all 12 if only showing 4
        const idsToFetch = recentlyViewedIds.slice(0, limit);
        const fetched = await getProductsByIds(idsToFetch);
        if (mounted) {
          setProducts(fetched);
        }
      } catch (err) {
        console.error('Failed to load recently viewed products', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, [recentlyViewedIds, limit, discoveryLoading]);

  if (loading || discoveryLoading) {
    // Return skeleton or empty string to prevent flashing
    return null;
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`py-12 lg:py-16 ${className}`}>
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900 md:text-3xl">
              Recently Viewed
            </h2>
            <p className="mt-2 text-ink-500 max-w-xl">
              Pick up right where you left off.
            </p>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-sm font-semibold text-ink-500 transition-colors hover:text-brand-600"
            aria-label="Clear recently viewed history"
          >
            Clear
          </button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
