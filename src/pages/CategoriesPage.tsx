import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronRight, Layers3, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCategories } from '@/hooks/useCatalog';
import { categoriesToType } from '@/services/catalog';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { ProductGridSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError } from '@/components/ui/CatalogState';
import '@/interior-redesign.css';

export function CategoriesPage() {
  const { data: cats, loading, error, retry } = useCategories();
  const categories = categoriesToType(cats);

  return (
    <Layout>
      <div className="category-directory">
        <header className="category-directory-hero">
          <div className="container-page">
            <nav className="interior-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={13} /><span>Categories</span></nav>
            <div className="category-directory-intro">
              <div>
                <span className="interior-eyebrow"><span />A WORLD OF POSSIBILITIES</span>
                <h1>Find your next<br /><em>creative advantage.</em></h1>
                <p>The right tools. A new skill. A head start on your next idea. Explore everything bdBeginner has to offer.</p>
                <Link to="/products" className="directory-explore-link">Explore all products<ArrowRight size={17} /></Link>
              </div>
              <div className="directory-art" aria-hidden="true">
                <div className="directory-art-card directory-art-card-back"><span /><span /><span /></div>
                <div className="directory-art-card directory-art-card-front"><Layers3 size={58} strokeWidth={1.1} /><strong>Ideas start here.</strong><div><span>CREATE SOMETHING GREAT</span><ArrowUpRight size={22} /></div></div>
                <span className="directory-art-orbit">✳</span>
              </div>
            </div>
          </div>
        </header>
        <section className="container-page category-directory-content" aria-labelledby="directory-heading">
          <div className="directory-section-heading"><div><span className="interior-eyebrow">CHOOSE YOUR DIRECTION</span><h2 id="directory-heading">A little of everything you need.</h2></div>{!loading && !error && <span className="directory-count">{categories.length} categories</span>}</div>
          {loading ? <ProductGridSkeleton count={6} /> : error ? <CatalogError onRetry={retry} /> : categories.length > 0 ? (
            <div className="directory-category-grid">{categories.map((category, index) => <div key={category.slug} id={category.slug} className={`directory-category-tile directory-category-tile-${index % 4}`}><CategoryCard category={category} index={index} /></div>)}</div>
          ) : <div className="directory-empty"><Search size={28} /><h3>No categories available yet.</h3><p>Please check back for new resources.</p></div>}
          <div className="directory-help"><div><span className="interior-eyebrow">LET'S FIND YOUR FIT</span><h3>A good idea deserves the right tools.</h3><p>Need a hand choosing a product or finding a service? We can help.</p></div><Link to="/support">Talk to our team<ArrowUpRight size={18} /></Link></div>
        </section>
      </div>
    </Layout>
  );
}
