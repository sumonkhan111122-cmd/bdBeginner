import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useCategories } from "@/hooks/useCatalog";
import { categoriesToType } from "@/services/catalog";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { CatalogError } from "@/components/ui/CatalogState";

export function CategoryExplorer() {
  const { data: cats, loading, error, retry } = useCategories();
  const categories = categoriesToType(cats);
  return (
    <section className="studio-categories" id="discover">
      <div className="studio-container">
        <div className="studio-section-heading">
          <div>
            <p className="studio-kicker">FIND YOUR CORNER OF THE INTERNET.</p>
            <h2>
              A world of resources.
              <br />
              <span className="muted-heading">Your kind of possibilities.</span>
            </h2>
          </div>
          <Link to="/categories" className="studio-inline-link">
            All collections <ArrowUpRight size={18} />
          </Link>
        </div>
        {error ? (
          <CatalogError onRetry={retry} />
        ) : loading ? (
          <div
            className="studio-category-grid"
            aria-busy="true"
            aria-label="Loading categories"
          >
            {Array.from({ length: 8 }, (_, i) => (
              <div className="studio-category-card animate-pulse" key={i}>
                <div className="h-6 w-6 rounded bg-ink-100" />
                <div className="mt-8 h-3 w-24 rounded bg-ink-100" />
              </div>
            ))}
          </div>
        ) : categories.length ? (
          <div className="studio-category-grid">
            {categories.map((category, index) => (
              <CategoryCard
                key={category.slug}
                category={category}
                index={index}
              />
            ))}
          </div>
        ) : (
          <p className="studio-no-products">
            Collections are being prepared.{" "}
            <Link to="/products">Explore all resources →</Link>
          </p>
        )}
      </div>
    </section>
  );
}
