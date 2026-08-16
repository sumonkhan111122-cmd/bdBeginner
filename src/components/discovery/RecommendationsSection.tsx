import { useEffect, useState } from 'react';
import type { Product } from '@/types';
import { getRelatedProductsFromCatalog } from '@/services/catalog';
import { ProductCard } from '@/components/cards/ProductCard';

type RecommendationsSectionProps = {
  product: Product;
  className?: string;
  limit?: number;
};

export function RecommendationsSection({ product, className = '', limit = 4 }: RecommendationsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRelated() {
      setLoading(true);
      try {
        const related = await getRelatedProductsFromCatalog(product, limit);
        if (mounted) {
          setProducts(related);
        }
      } catch (err) {
        console.error('Failed to load related products', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadRelated();
    return () => {
      mounted = false;
    };
  }, [product, limit]);

  if (loading) return null;
  if (products.length === 0) return null;

  return (
    <section className={`py-12 lg:py-16 ${className}`}>
      <div className="container-page">
        <div>
          <h2 className="font-display text-2xl font-bold text-ink-900 md:text-3xl">
            You May Also Like
          </h2>
          <p className="mt-2 text-ink-500 max-w-xl">
            Explore similar products in {product.category}.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
