import { useCategories } from '@/hooks/useCatalog';
import { categoriesToType } from '@/services/catalog';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Grid3x3 } from 'lucide-react';
import { ProductGridSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError } from '@/components/ui/CatalogState';

export function CategoryExplorer() {
  const { data: cats, loading, error, retry } = useCategories();
  const categories = categoriesToType(cats);

  return (
    <section className="section-padding bg-ink-50/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="Browse by Category"
          title="Find what you need across our digital catalog"
          description="From WordPress tools to AI-powered solutions, every category is curated to help you build, learn, and work more efficiently."
          action={
            <Button to="/categories" variant="outline" size="md">
              <Grid3x3 size={16} />
              All Categories
            </Button>
          }
        />

        {loading ? (
          <div className="mt-12">
            <ProductGridSkeleton count={6} />
          </div>
        ) : error ? (
          <div className="mt-12">
            <CatalogError onRetry={retry} />
          </div>
        ) : categories.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {categories.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-ink-500">No categories available.</p>
        )}
      </div>
    </section>
  );
}
