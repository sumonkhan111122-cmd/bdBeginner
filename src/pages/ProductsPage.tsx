import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { ProductGridSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError, CatalogEmpty } from '@/components/ui/CatalogState';
import { Pagination } from '@/components/ui/Pagination';
import { usePublishedProducts } from '@/hooks/useCatalog';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { applySeo } from '@/lib/seo';
import { trackSearch } from '@/lib/tracking';
import { catalogSearchTerms, matchAllSearchTerms, readCatalogQuery, updateCatalogQuery, type CatalogSortOption } from '@/lib/catalogFilters';
import {
  Search,
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  Play,
  Compass,
  Layers,
  SlidersHorizontal,
  X,
  ChevronDown,
  Check,
  Tag,
  Sparkles,
  LayoutGrid,
  Palette,
  Puzzle,
  Laptop,
  GraduationCap,
  Folder,
  Code2,
  Bot,
} from 'lucide-react';
import type { DeliveryType } from '@/types';
import '@/catalog-redesign.css';

const PRODUCT_TYPES: { label: string; value: DeliveryType }[] = [
  { label: 'Digital Download', value: 'instant-download' },
  { label: 'License Key', value: 'license-key' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Manual Delivery', value: 'manual-delivery' },
];

const PRICE_RANGES = [
  { min: 0, max: 500 },
  { min: 500, max: 1000 },
  { min: 1000, max: 2000 },
  { min: 2000, max: Infinity },
];

type SortOption = CatalogSortOption;

const SORT_LABELS: Record<SortOption, string> = {
  featured: 'Featured',
  newest: 'Newest',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
  wordpress: 'WordPress Themes',
  'wordpress-themes': 'WordPress Themes',
  theme: 'WordPress Themes',
  themes: 'WordPress Themes',
  plugins: 'WordPress Plugins',
  'wordpress-plugins': 'WordPress Plugins',
  plugin: 'WordPress Plugins',
  software: 'Software',
  'ai-tools': 'AI Tools',
  ai: 'AI Tools',
  'web-services': 'Web Services',
  courses: 'Courses',
  course: 'Courses',
  'digital-resources': 'Digital Resources',
  resources: 'Digital Resources',
  scripts: 'PHP Scripts & Code',
  script: 'PHP Scripts & Code',
  'php-scripts': 'PHP Scripts & Code',
  php: 'PHP Scripts & Code',
};

const QUICK_CATEGORY_PILLS = [
  { label: 'সব প্রোডাক্ট', slug: 'all', categoryName: null, icon: LayoutGrid },
  { label: 'WordPress Themes (ফ্রি)', slug: 'wordpress', categoryName: 'WordPress Themes', icon: Palette },
  { label: 'WordPress Plugins (ফ্রি)', slug: 'plugins', categoryName: 'WordPress Plugins', icon: Puzzle },
  { label: 'PHP Scripts (ফ্রি)', slug: 'scripts', categoryName: 'PHP Scripts & Code', icon: Code2 },
  { label: 'Software & Tools', slug: 'software', categoryName: 'Software', icon: Laptop },
  { label: 'Digital Courses', slug: 'courses', categoryName: 'Courses', icon: GraduationCap },
  { label: 'Digital Resources', slug: 'digital-resources', categoryName: 'Digital Resources', icon: Folder },
  { label: 'AI Tools', slug: 'ai-tools', categoryName: 'AI Tools', icon: Bot },
  { label: 'স্পেশাল ডিল', slug: 'deals', categoryName: '__deals__', icon: Tag },
];

function resolveCategoryName(raw: string, availableCategories: string[]): string {
  const normalized = raw.toLowerCase().trim();
  if (CATEGORY_SLUG_MAP[normalized]) {
    const name = CATEGORY_SLUG_MAP[normalized];
    return availableCategories.find((category) => category.toLowerCase() === name.toLowerCase()) || name;
  }
  const match = availableCategories.find(
    (c) => c.toLowerCase() === normalized || c.toLowerCase().includes(normalized)
  );
  return match || raw;
}

type ProductsPageProps = {
  initialCategory?: string;
  dealsOnly?: boolean;
};

export function ProductsPage({ initialCategory, dealsOnly = false }: ProductsPageProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const formatPrice = useCurrencyFormatter();
  const { siteSettings, seoSettings } = useSiteSettings();
  const { data: products, loading, error, retry } = usePublishedProducts();

  const priceRangeLabels = [
    `Under ${formatPrice(500)}`,
    `${formatPrice(500)} – ${formatPrice(1000)}`,
    `${formatPrice(1000)} – ${formatPrice(2000)}`,
    `${formatPrice(2000)}+`,
  ];

  const categoryNames = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products],
  );

  const PRODUCTS_PER_PAGE = 30;
  const query = useMemo(() => readCatalogQuery(searchParams, { category: initialCategory, dealsOnly }), [searchParams, initialCategory, dealsOnly]);
  const urlCategoryParam = searchParams.get('category');
  const search = query.search;
  const selectedCategories = useMemo(() => [...new Set(query.categories.map((category) => resolveCategoryName(category, categoryNames)))], [query.categories, categoryNames]);
  const isDealsOnly = query.dealsOnly;
  const selectedTypes = query.types;
  const selectedPriceRanges = query.priceRanges;
  const sort = query.sort;

  const updateFilters = useCallback((changes: Record<string, string | null>, replace = false, resetPage = true) => {
    setSearchParams((current) => updateCatalogQuery(current, changes, resetPage), { replace, preventScrollReset: true });
  }, [setSearchParams]);
  const setSearch = useCallback((value: string) => updateFilters({ search: value || null }, true), [updateFilters]);
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        setSearch(localSearch);
      }
    }, 180);
    return () => clearTimeout(handler);
  }, [localSearch, search, setSearch]);
  const setSort = useCallback((value: SortOption) => updateFilters({ sort: value === 'featured' ? null : value }), [updateFilters]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDivElement>(null);
  const categoryPillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = categoryPillsRef.current;
    const active = strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!strip || !active || strip.scrollWidth <= strip.clientWidth) return;
    const stripRect = strip.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    strip.scrollLeft += activeRect.left - stripRect.left - (strip.clientWidth - active.clientWidth) / 2;
  }, [selectedCategories, isDealsOnly]);

  useEffect(() => {
    if (!mobileFiltersOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    filterDialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFiltersOpen(false);
      if (event.key !== 'Tab') return;
      const focusable = filterDialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, a[href]');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus();
    };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) return;
    const timer = window.setTimeout(() => trackSearch(term), 500);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Dynamic SEO based on active filters
  useEffect(() => {
    let title = 'Digital Products & Tools | bdBeginner';
    let desc = seoSettings.default_meta_description;
    let canonical = '/products';

    if (selectedCategories.length === 1) {
      const cat = selectedCategories[0];
      const isCourseCategory = /course|কোর্স/i.test(cat);
      title = isCourseCategory ? 'Online Courses & Masterclasses | bdBeginner' : `${cat} | bdBeginner`;
      desc = isCourseCategory ? 'Explore practical digital courses, discover new skills, and learn at your pace with bdBeginner.' : `Explore our ${cat} collection. View product details, delivery options and support information at bdBeginner.`;
      const foundSlug = Object.entries(CATEGORY_SLUG_MAP).find(([, name]) => name === cat)?.[0] || cat.toLowerCase().replace(/\s+/g, '-');
      canonical = initialCategory?.toLowerCase() === 'courses' && isCourseCategory && !urlCategoryParam ? '/courses' : `/products?category=${encodeURIComponent(foundSlug)}`;
    } else if (isDealsOnly) {
      title = 'Special Deals & Discounted Products | bdBeginner';
      desc = 'Discover limited-time discounts and special deals on WordPress themes, plugins, and software licenses.';
      canonical = '/products?deals=true';
    } else if (search.trim()) {
      title = `Search results for "${search.trim()}" | bdBeginner`;
      desc = `Find digital products, scripts, courses, and WordPress themes matching "${search.trim()}" on bdBeginner.`;
    }

    applySeo(
      {
        title,
        description: desc,
        canonicalPath: canonical,
        image: seoSettings.default_og_image_url,
      },
      seoSettings,
    );
  }, [selectedCategories, isDealsOnly, search, seoSettings, initialCategory, urlCategoryParam]);

  const toggleCategory = useCallback((cat: string) => {
    const next = selectedCategories.includes(cat) ? selectedCategories.filter((category) => category !== cat) : [...selectedCategories, cat];
    updateFilters({ category: next.length ? next.map((category) => Object.entries(CATEGORY_SLUG_MAP).find(([, name]) => name.toLowerCase() === category.toLowerCase())?.[0] || category).join(',') : initialCategory ? 'all' : null });
  }, [selectedCategories, initialCategory, updateFilters]);

  const toggleDeals = useCallback(() => {
    updateFilters({ deals: isDealsOnly ? (dealsOnly ? 'false' : null) : 'true' });
  }, [isDealsOnly, dealsOnly, updateFilters]);

  const toggleType = useCallback((type: DeliveryType) => {
    const next = selectedTypes.includes(type) ? selectedTypes.filter((value) => value !== type) : [...selectedTypes, type];
    updateFilters({ type: next.join(',') || null });
  }, [selectedTypes, updateFilters]);

  const togglePriceRange = useCallback((index: number) => {
    const next = selectedPriceRanges.includes(index) ? selectedPriceRanges.filter((value) => value !== index) : [...selectedPriceRanges, index];
    updateFilters({ price: next.join(',') || null });
  }, [selectedPriceRanges, updateFilters]);

  const clearAllFilters = useCallback(() => {
    updateFilters({ category: initialCategory ? 'all' : null, deals: dealsOnly ? 'false' : null, type: null, price: null, search: null, sort: null });
  }, [initialCategory, dealsOnly, updateFilters]);

  const handlePillClick = (pill: typeof QUICK_CATEGORY_PILLS[number]) => {
    updateFilters({
      category: pill.slug === 'all' || pill.slug === 'deals' ? (initialCategory ? 'all' : null) : pill.slug,
      deals: pill.slug === 'deals' ? 'true' : dealsOnly ? 'false' : null,
    });
  };

  const scrollToResults = () => {
    document.getElementById('catalog-results')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    isDealsOnly ||
    selectedTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    search.trim().length > 0;

  const filtered = useMemo(() => {
    const searchTerms = catalogSearchTerms(search);
    let result = products.filter((p) => {
      if (searchTerms.length) {
        const searchable = [p.name, p.shortDescription, p.category, p.subcategory, ...(p.tags || [])].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase();
        if (!matchAllSearchTerms(searchable, searchTerms)) return false;
      }

      if (isDealsOnly) {
        const hasDiscount =
          (p.compareAtPrice && p.compareAtPrice > p.price) ||
          p.badge === 'sale';
        if (!hasDiscount) return false;
      }

      if (selectedCategories.length > 0 && !selectedCategories.some((category) => category.toLowerCase() === p.category.toLowerCase()))
        return false;

      if (selectedTypes.length > 0 && !selectedTypes.includes(p.deliveryType))
        return false;

      if (selectedPriceRanges.length > 0) {
        const matches = selectedPriceRanges.some((idx) => {
          const range = PRICE_RANGES[idx];
          return p.price >= range.min && p.price < range.max;
        });
        if (!matches) return false;
      }

      return true;
    });

    switch (sort) {
      case 'newest':
        result = [...result].sort((a, b) => Number(b.newProduct) - Number(a.newProduct));
        break;
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        result = [...result].sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return result;
  }, [products, search, isDealsOnly, selectedCategories, selectedTypes, selectedPriceRanges, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(query.page, totalPages);
  const setCurrentPage = useCallback((page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    updateFilters({ page: nextPage > 1 ? String(nextPage) : null }, false, false);
  }, [totalPages, updateFilters]);
  useEffect(() => {
    if (!loading && !error && query.page !== currentPage) {
      updateFilters({ page: currentPage > 1 ? String(currentPage) : null }, true, false);
    }
  }, [loading, error, query.page, currentPage, updateFilters]);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filtered.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filtered, currentPage]);

  const activeFilterCount =
    selectedCategories.length +
    (isDealsOnly ? 1 : 0) +
    selectedTypes.length +
    selectedPriceRanges.length;

  const headerInfo = useMemo(() => {
    if (isDealsOnly) {
      return {
        eyebrow: 'Special Deals & Offers',
        title: 'স্পেশাল ডিল ও ডিসকাউন্ট প্রোডাক্ট সমূহ',
        description: 'হিউজ ডিসকাউন্ট ও স্পেশাল অফারে সেরা ওয়ার্ডপ্রেস থিম, প্লাগিন, সফটওয়্যার ও ডিজিটাল রিসোর্স সংগ্রহ করুন।',
      };
    }
    if (selectedCategories.length === 1) {
      const cat = selectedCategories[0];
      if (/course|কোর্স/i.test(cat)) return { eyebrow: 'THE LEARNING COLLECTION', title: 'Your next skill. Your next chapter.', description: 'Build real skills, bring your ideas to life, and learn something you can put to work. Explore our collection of practical digital courses.' };
      const isFreeCat = cat === 'WordPress Themes' || cat === 'WordPress Plugins' || cat === 'PHP Scripts & Code';
      return {
        eyebrow: isFreeCat ? '100% Free Downloads' : 'Category',
        title: isFreeCat ? `${cat} (সবার জন্য ১০০% ফ্রি)` : cat,
        description: isFreeCat
          ? `bdBeginner-এ সমস্ত ${cat} সবার জন্য সম্পূর্ণ উন্মুক্ত ও ফ্রি! কোনো পেমেন্ট বা সাবস্ক্রিপশন ছাড়াই সরাসরি ডাউনলোড করুন।`
          : `Explore our collection of authentic ${cat}. Instant download, clean files, and regular updates.`,
      };
    }
    return {
      eyebrow: 'Digital Marketplace',
      title: 'Explore All Digital Products',
      description: 'ওয়ার্ডপ্রেস থিম, প্লাগইন ও পিএইচপি স্ক্রিপ্ট সবার জন্য সম্পূর্ণ ফ্রি! এর পাশাপাশি প্রিমিয়াম ডিজিটাল কোর্স, সফটওয়্যার ও আধুনিক সলিউশন অন্বেষণ করুন।',
    };
  }, [isDealsOnly, selectedCategories]);

  const filterContent = (
    <div className="catalog-filter-groups flex flex-col gap-6">
      {/* Special Deals Quick Filter */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
        <button
          onClick={toggleDeals}
          aria-pressed={isDealsOnly}
          className="flex w-full items-center justify-between text-left text-sm font-bold text-amber-950"
        >
          <span className="flex items-center gap-2">
            <Tag size={16} className="text-amber-600" />
            <span>শুধু স্পেশাল ডিল দেখুন</span>
          </span>
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
              isDealsOnly
                ? 'border-amber-600 bg-amber-600 text-white'
                : 'border-amber-300 bg-white'
            }`}
          >
            {isDealsOnly && <Check size={11} strokeWidth={3} />}
          </span>
        </button>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">
          Categories
        </h3>
        <ul className="mt-3 flex flex-col gap-1">
          {categoryNames.map((cat) => (
            <li key={cat}>
              <button
                onClick={() => toggleCategory(cat)}
                aria-pressed={selectedCategories.includes(cat)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-ink-50"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-ink-200 bg-white'
                  }`}
                >
                  {selectedCategories.includes(cat) && (
                    <Check size={11} strokeWidth={3} />
                  )}
                </span>
                <span
                  className={`text-left ${
                    selectedCategories.includes(cat)
                      ? 'font-semibold text-ink-900'
                      : 'text-ink-600'
                  }`}
                >
                  {cat}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Product Type */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">
          Product Type
        </h3>
        <ul className="mt-3 flex flex-col gap-1">
          {PRODUCT_TYPES.map((type) => (
            <li key={type.value}>
              <button
                onClick={() => toggleType(type.value)}
                aria-pressed={selectedTypes.includes(type.value)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-ink-50"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    selectedTypes.includes(type.value)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-ink-200 bg-white'
                  }`}
                >
                  {selectedTypes.includes(type.value) && (
                    <Check size={11} strokeWidth={3} />
                  )}
                </span>
                <span
                  className={`text-left ${
                    selectedTypes.includes(type.value)
                      ? 'font-semibold text-ink-900'
                      : 'text-ink-600'
                  }`}
                >
                  {type.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price */}
      <div>
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">
          Price Range
        </h3>
        <ul className="mt-3 flex flex-col gap-1">
          {PRICE_RANGES.map((range, idx) => (
            <li key={idx}>
              <button
                onClick={() => togglePriceRange(idx)}
                aria-pressed={selectedPriceRanges.includes(idx)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors hover:bg-ink-50"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    selectedPriceRanges.includes(idx)
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-ink-200 bg-white'
                  }`}
                >
                  {selectedPriceRanges.includes(idx) && (
                    <Check size={11} strokeWidth={3} />
                  )}
                </span>
                <span
                  className={`text-left ${
                    selectedPriceRanges.includes(idx)
                      ? 'font-semibold text-ink-900'
                      : 'text-ink-600'
                  }`}
                >
                  {priceRangeLabels[idx]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {hasActiveFilters && (
        <Button
          onClick={clearAllFilters}
          variant="outline"
          size="sm"
          fullWidth
        >
          <X size={14} />
          Clear All Filters
        </Button>
      )}
    </div>
  );

  const isCourseCollection = selectedCategories.length === 1 && /course|কোর্স/i.test(selectedCategories[0]);

  return (
    <Layout>
      <div className="catalog-experience">
        <section className={`catalog-hero ${isCourseCollection ? 'catalog-hero--courses' : ''}`}>
          <div className="container-page">
            <nav className="catalog-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>{isCourseCollection ? 'Courses' : 'Marketplace'}</span></nav>
            <div className="catalog-hero__layout">
              <div className="catalog-hero__copy">
                <p className="catalog-eyebrow"><span />{headerInfo.eyebrow}</p>
                <h1>{!selectedCategories.length && !isDealsOnly ? <>Good resources.<br /><span>Great possibilities.</span></> : isCourseCollection ? <>A new skill.<br /><span>A whole new you.</span></> : headerInfo.title}</h1>
                <p className="catalog-hero__description">{headerInfo.description}</p>
                <div className="catalog-hero__details"><span><Compass size={15} /> Find your next inspiration</span><span><ArrowUpRight size={15} /> Make something that matters</span></div>
              </div>
              <div className="catalog-hero__art" aria-hidden="true">
                <div className="catalog-art-orbit" />
                <div className="catalog-art-tile catalog-art-tile--back"><Code2 size={34} strokeWidth={1.4} /><span>BUILD</span></div>
                <div className="catalog-art-tile catalog-art-tile--main">{isCourseCollection ? <GraduationCap size={65} strokeWidth={1.2} /> : <Layers size={65} strokeWidth={1.2} />}<span>{isCourseCollection ? 'STAY CURIOUS.' : 'IDEAS START HERE.'}</span></div>
                <div className="catalog-art-tile catalog-art-tile--front"><Play size={22} fill="currentColor" /><span>CREATE</span></div>
                <span className="catalog-art-asterisk">✳</span>
              </div>
            </div>
            <form
              className="catalog-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                if (localSearch !== search) setSearch(localSearch);
                scrollToResults();
              }}
            >
              <Search size={21} />
              <input
                type="search"
                value={localSearch}
                onChange={(event) => setLocalSearch(event.target.value)}
                maxLength={200}
                enterKeyHint="search"
                placeholder={isCourseCollection ? 'কী শিখতে চান? সার্চ করুন...' : 'কোর্স, থিম, প্লাগিন বা টুলস সার্চ করুন...'}
                aria-label="Search products"
                aria-controls="catalog-results"
              />
              {localSearch && (
                <button
                  type="button"
                  className="catalog-search__clear"
                  onClick={() => {
                    setLocalSearch('');
                    setSearch('');
                  }}
                  aria-label="Clear search"
                >
                  <X size={18} />
                </button>
              )}
              <button type="submit" className="catalog-search__action" aria-label="View matching resources">
                <span>Explore</span>
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </section>

        <div className="catalog-category-strip">
          <div className="container-page">
            <div ref={categoryPillsRef} className="catalog-category-pills" aria-label="Browse categories">
              {QUICK_CATEGORY_PILLS.map((pill) => {
                const isActive = pill.slug === 'all' ? selectedCategories.length === 0 && !isDealsOnly : pill.slug === 'deals' ? isDealsOnly : selectedCategories.some((category) => category.toLowerCase() === pill.categoryName?.toLowerCase());
                const Icon = pill.icon;
                return <button type="button" key={pill.slug} onClick={() => handlePillClick(pill)} className={isActive ? 'is-active' : ''} aria-pressed={isActive}><Icon size={16} /><span>{pill.slug === 'all' ? 'All resources' : pill.slug === 'wordpress' ? 'WordPress themes' : pill.slug === 'plugins' ? 'Plugins' : pill.slug === 'scripts' ? 'PHP scripts' : pill.slug === 'deals' ? 'Special offers' : pill.label}</span></button>;
              })}
            </div>
          </div>
        </div>

        <div className="container-page catalog-browser" id="catalog-results">
          <aside className="catalog-sidebar hidden lg:block">
            <div className="catalog-filter-panel">
              <div className="catalog-filter-panel__heading"><div><SlidersHorizontal size={17} /><h2>Refine your search</h2></div>{activeFilterCount > 0 && <span>{activeFilterCount}</span>}</div>
              {filterContent}
            </div>
            <Link to="/support" className="catalog-help-card"><BookOpen size={24} strokeWidth={1.5} /><strong>A little guidance?</strong><p>We can help you find the right resource for your next project.</p><span>Talk to our team <ArrowUpRight size={16} /></span></Link>
          </aside>

          <div className="catalog-results">
            <div className="catalog-toolbar">
              <div><p className="catalog-eyebrow">CURATED FOR YOUR NEXT CHAPTER</p><h2>{isCourseCollection ? 'Explore the courses' : isDealsOnly ? 'Discover a good deal' : 'Find your next favorite'}</h2><p className="catalog-result-count" aria-live="polite">{loading ? 'Finding your next great resource...' : <>{filtered.length} {filtered.length === 1 ? 'resource' : 'resources'} to explore{search && <> for &ldquo;{search}&rdquo;</>}{totalPages > 1 && <> · Page {currentPage} of {totalPages}</>}</>}</p></div>
              <div className="catalog-toolbar__controls">
                <button type="button" onClick={() => setMobileFiltersOpen(true)} className="catalog-mobile-filter lg:hidden"><SlidersHorizontal size={16} /> Filters{activeFilterCount > 0 && <span>{activeFilterCount}</span>}</button>
                <label className="catalog-sort"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} aria-label="Sort products">{(Object.keys(SORT_LABELS) as SortOption[]).map((key) => <option key={key} value={key}>{SORT_LABELS[key]}</option>)}</select><ChevronDown size={14} /></label>
              </div>
            </div>

            {activeFilterCount > 0 && <div className="catalog-active-filters">
              {isDealsOnly && <button type="button" onClick={toggleDeals}><Tag size={12} /> Special offers<X size={12} /></button>}
              {selectedCategories.map((cat) => <button type="button" key={cat} onClick={() => toggleCategory(cat)}>{cat}<X size={12} /></button>)}
              {selectedTypes.map((type) => <button type="button" key={type} onClick={() => toggleType(type)}>{PRODUCT_TYPES.find((item) => item.value === type)?.label}<X size={12} /></button>)}
              {selectedPriceRanges.map((idx) => <button type="button" key={idx} onClick={() => togglePriceRange(idx)}>{priceRangeLabels[idx]}<X size={12} /></button>)}
              <button type="button" className="catalog-clear-all" onClick={clearAllFilters}>Clear all</button>
            </div>}

            {loading ? <div className="catalog-grid-state"><ProductGridSkeleton count={9} /></div>
              : error ? <div className="catalog-grid-state"><CatalogError onRetry={retry} /></div>
              : filtered.length > 0 ? <>
                <div className="catalog-product-grid">{paginatedProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
                {totalPages > 1 && <div className="catalog-pagination"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => { setCurrentPage(page); scrollToResults(); }} /></div>}
              </> : <div className="catalog-grid-state"><CatalogEmpty filtered={hasActiveFilters} />{hasActiveFilters && <button type="button" className="catalog-reset-empty" onClick={clearAllFilters}>Clear filters and explore again <ArrowRight size={16} /></button>}</div>}
          </div>
        </div>

        <section className="catalog-bottom-note container-page"><span>✳</span><p>Something for every idea.<br /><strong>Find yours. Make it happen.</strong></p><Link to="/categories">Explore all categories <ArrowUpRight size={18} /></Link></section>
      </div>

      {mobileFiltersOpen && <div className="catalog-filter-drawer fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="catalog-filter-title">
        <button type="button" className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" />
        <div ref={filterDialogRef} className="catalog-filter-drawer__panel absolute right-0 top-0 flex h-full w-[88%] max-w-sm flex-col bg-white">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-5"><h2 id="catalog-filter-title" className="font-bold">Refine your search</h2><button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X size={21} /></button></div>
          <div className="flex-1 overflow-y-auto p-5">{filterContent}</div>
          <div className="border-t border-ink-100 p-5"><Button onClick={() => setMobileFiltersOpen(false)} fullWidth size="lg">Show {filtered.length} {filtered.length === 1 ? 'result' : 'results'}<ArrowRight size={17} /></Button></div>
        </div>
      </div>}
    </Layout>
  );
}
