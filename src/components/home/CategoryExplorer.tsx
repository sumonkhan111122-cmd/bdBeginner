import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, Code2, FolderOpen, Globe2, Layers3, Palette, Puzzle, Sparkles } from 'lucide-react';
import { useCategories } from '@/hooks/useCatalog';
import { CatalogError } from '@/components/ui/CatalogState';

const icons: Record<string, typeof BookOpen> = { courses: BookOpen, wordpress: Globe2, 'wordpress-themes': Globe2, 'wordpress-plugins': Puzzle, software: Code2, plugins: Puzzle, scripts: Code2, 'ai-tools': Sparkles, 'digital-resources': Palette, 'web-services': Layers3 };

export function CategoryExplorer() {
  const { data: categories, loading, error, retry } = useCategories();
  return <section className="bb-section bb-categories" id="explore"><div className="bb-container">
    <div className="bb-section-heading"><div><p className="bb-kicker">A WORLD OF THINGS TO EXPLORE</p><h2>Find your kind of possibility<span>.</span></h2></div><Link to="/categories" className="bb-text-link">View all categories <ArrowUpRight size={17} /></Link></div>
    {error ? <CatalogError onRetry={retry} /> : loading ? <div className="bb-category-grid" aria-busy="true" aria-label="Loading categories">{Array.from({length: 6}, (_, i) => <div className="bb-category-card animate-pulse" key={i}><span className="bb-category-icon" /><span className="h-4 w-24 rounded bg-ink-100" /></div>)}</div> : categories.length ? <div className="bb-category-grid">{categories.map((category, index) => { const Icon = icons[category.slug] || FolderOpen; return <Link key={category.slug} to={category.slug === 'courses' ? '/courses' : `/products?category=${encodeURIComponent(category.slug)}`} className={`bb-category-card bb-category-tone-${index % 6}`}><span className="bb-category-icon"><Icon size={25} strokeWidth={1.7} /></span><span className="bb-category-copy"><strong>{category.name}</strong><small>{category.description || 'Explore the collection'}</small></span><ArrowUpRight className="bb-category-arrow" size={17} /></Link>; })}</div> : <p className="bb-empty-collection">Collections are being prepared. <Link to="/products">Explore all products →</Link></p>}
  </div></section>;
}
