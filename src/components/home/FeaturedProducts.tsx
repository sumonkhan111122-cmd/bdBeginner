import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { usePublishedProducts } from '@/hooks/useCatalog';
import { ProductCard } from '@/components/cards/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError } from '@/components/ui/CatalogState';

const tabs = [{ label: 'All products', value: 'all' }, { label: 'Courses', value: 'courses' }, { label: 'WordPress', value: 'wordpress' }, { label: 'AI tools', value: 'ai-tools' }, { label: 'Digital assets', value: 'digital-resources' }];

export function FeaturedProducts() {
  const { data: products, loading, error, retry } = usePublishedProducts();
  const [filter, setFilter] = useState('all');
  const visible = useMemo(() => products.filter(product => filter === 'all' || product.category.toLowerCase().replace(/\s+/g, '-') === filter || (filter === 'wordpress' && product.category.toLowerCase().includes('wordpress'))).sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 8), [products, filter]);
  return <section className="bb-section bb-featured" id="featured"><div className="bb-container">
    <div className="bb-section-heading"><div><p className="bb-kicker">GOOD FINDS. GREAT POSSIBILITIES.</p><h2>Your next creative advantage<span>.</span></h2><p>Handy tools, fresh skills, and a head start on your next project.</p></div><Link to="/products" className="bb-text-link">Explore all products <ArrowUpRight size={17} /></Link></div>
    <div className="bb-filter-tabs" role="group" aria-label="Filter featured products">{tabs.map(tab => <button type="button" key={tab.value} onClick={() => setFilter(tab.value)} aria-pressed={filter === tab.value}>{tab.label}</button>)}</div>
    {error ? <CatalogError onRetry={retry} /> : loading ? <div className="bb-products-grid" aria-label="Loading products" aria-busy="true">{Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />)}</div> : visible.length ? <div className="bb-products-grid">{visible.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="bb-empty-collection"><p>A fresh collection is on its way.</p><Link className="bb-text-link" to={filter === 'all' ? '/products' : `/products?category=${encodeURIComponent(filter)}`}>Browse this category <ArrowUpRight size={16} /></Link></div>}
  </div></section>;
}
