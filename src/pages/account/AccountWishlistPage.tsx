import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useDiscovery } from '@/context/DiscoveryContext';
import { getProductsByIds } from '@/services/catalog';
import type { Product } from '@/types';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';

export function AccountWishlistPage() {
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
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Wishlist</h1>
          <p className="mt-1 text-sm text-ink-500">Products you've saved to come back to later.</p>
        </div>

        {(loading || discoveryLoading) ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-300">
              <Heart size={32} className="fill-current" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">Your wishlist is empty</h3>
            <p className="mt-2 text-sm text-ink-500">Save products you want to come back to later.</p>
            <Button to="/products" className="mt-6" variant="outline">
              Explore Products
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
