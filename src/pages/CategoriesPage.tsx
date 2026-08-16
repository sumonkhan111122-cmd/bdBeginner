import { Layout } from '@/components/layout/Layout';
import { useCategories } from '@/hooks/useCatalog';
import { categoriesToType } from '@/services/catalog';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGridSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError } from '@/components/ui/CatalogState';

export function CategoriesPage() {
  const { data: cats, loading, error, retry } = useCategories();
  const categories = categoriesToType(cats);

  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="Categories"
            title="Browse All Categories"
            description="Explore our digital marketplace by category — from WordPress themes to AI tools, courses, and professional web services."
          />
        </div>
      </div>

      <div className="container-page section-padding">
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : error ? (
          <CatalogError onRetry={retry} />
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {categories.map((category) => (
              <div key={category.slug} id={category.slug}>
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-ink-500">No categories available.</p>
        )}
      </div>
    </Layout>
  );
}
