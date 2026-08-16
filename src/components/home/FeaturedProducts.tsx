import { ProductCard } from '@/components/cards/ProductCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useFeaturedProducts } from '@/hooks/useCatalog';
import { FeaturedGridSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError } from '@/components/ui/CatalogState';

export function FeaturedProducts() {
  const { data: products, loading, error, retry } = useFeaturedProducts();

  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeading
          eyebrow="Featured Products"
          title="Explore selected digital products"
          description="A mix of WordPress themes, software tools, AI solutions, courses and digital resources — each with clear pricing and delivery information."
          action={
            <Button to="/products" variant="outline" size="md">
              View All Products
              <ArrowRight size={16} />
            </Button>
          }
        />

        {loading ? (
          <FeaturedGridSkeleton count={8} />
        ) : error ? (
          <CatalogError onRetry={retry} />
        ) : products.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-sm text-ink-500">No featured products available.</p>
        )}
      </div>
    </section>
  );
}
