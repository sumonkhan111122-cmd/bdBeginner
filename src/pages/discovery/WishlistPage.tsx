import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useDiscovery } from '@/context/DiscoveryContext';
import { getProductsByIds } from '@/services/catalog';
import type { Product } from '@/types';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';

export function WishlistPage() {
  const { wishlistIds, loading: discoveryLoading } = useDiscovery();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (discoveryLoading) return;
      if (wishlistIds.length === 0) {
        if (mounted) {
          setProducts([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const fetched = await getProductsByIds(wishlistIds);
        if (mounted) {
          setProducts(fetched);
        }
      } catch (err) {
        console.error('Failed to load wishlist products', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [wishlistIds, discoveryLoading]);

  return (
    <Layout>
      <div className="bg-ink-50/50 min-h-screen py-12 lg:py-16">
        <div className="container-page">
          <div className="mb-10 text-center">
            <h1 className="font-display text-3xl font-bold text-ink-900 md:text-4xl">
              Your Wishlist
            </h1>
            <p className="mt-3 text-lg text-ink-500 max-w-2xl mx-auto">
              Products you've saved to come back to later.
            </p>
          </div>

          {(loading || discoveryLoading) ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-ink-100 bg-white p-12 text-center shadow-soft max-w-2xl mx-auto">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 text-brand-300">
                <Heart size={40} className="fill-current" />
              </div>
              <h3 className="mt-6 font-display text-2xl font-bold text-ink-900">
                Your wishlist is empty
              </h3>
              <p className="mt-3 text-ink-500">
                Save products you want to come back to later.
              </p>
              <div className="mt-8">
                <Button to="/products" size="lg">
                  Explore Products
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
