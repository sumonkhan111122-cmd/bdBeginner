import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProductCard } from '@/components/cards/ProductCard';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProductGridSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError, CatalogEmpty } from '@/components/ui/CatalogState';
import { Pagination } from '@/components/ui/Pagination';
import { usePublishedProducts } from '@/hooks/useCatalog';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { applySeo } from '@/lib/seo';
import {
  Search,
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

const PRODUCT_TYPES: { label: string; value: DeliveryType }[] = [
  { label: 'Digital Download', value: 'instant-download' },
  { label: 'License Key', value: 'license-key' },
  { label: 'Subscription', value: 'subscription' },
  { label: 'Manual Delivery', value: 'manual-delivery' },
];

const PRICE_RANGES = [
  { min: 0, max: 499 },
  { min: 500, max: 1000 },
  { min: 1001, max: 2000 },
  { min: 2001, max: Infinity },
];

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

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
  { label: 'WordPress Themes', slug: 'wordpress', categoryName: 'WordPress Themes', icon: Palette },
  { label: 'WordPress Plugins', slug: 'plugins', categoryName: 'WordPress Plugins', icon: Puzzle },
  { label: 'Software & Tools', slug: 'software', categoryName: 'Software', icon: Laptop },
  { label: 'Digital Courses', slug: 'courses', categoryName: 'Courses', icon: GraduationCap },
  { label: 'Digital Resources', slug: 'digital-resources', categoryName: 'Digital Resources', icon: Folder },
  { label: 'PHP Scripts', slug: 'scripts', categoryName: 'PHP Scripts & Code', icon: Code2 },
  { label: 'AI Tools', slug: 'ai-tools', categoryName: 'AI Tools', icon: Bot },
  { label: 'স্পেশাল ডিল', slug: 'deals', categoryName: '__deals__', icon: Tag },
];

function resolveCategoryName(raw: string, availableCategories: string[]): string {
  const normalized = raw.toLowerCase().trim();
  if (CATEGORY_SLUG_MAP[normalized]) {
    return CATEGORY_SLUG_MAP[normalized];
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
  const [currentPage, setCurrentPage] = useState(1);

  const urlCategoryParam = searchParams.get('category');
  const urlDealsParam = searchParams.get('deals') === 'true' || dealsOnly;
  const urlSearchParam = searchParams.get('search') || searchParams.get('q') || '';

  const [search, setSearch] = useState(urlSearchParam);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const raw = urlCategoryParam || initialCategory;
    return raw ? [resolveCategoryName(raw, [])] : [];
  });
  const [isDealsOnly, setIsDealsOnly] = useState<boolean>(urlDealsParam);
  const [selectedTypes, setSelectedTypes] = useState<DeliveryType[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [sort, setSort] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Dynamic SEO based on active filters
  useEffect(() => {
    let title = 'Digital Products & Tools | bdBeginner';
    let desc = seoSettings.default_meta_description;
    let canonical = '/products';

    if (selectedCategories.length === 1) {
      const cat = selectedCategories[0];
      title = `${cat} — Themes, Plugins & Tools | bdBeginner`;
      desc = `Browse verified ${cat} with authentic downloads, lifetime updates, and verified licenses at bdBeginner.`;
      const foundSlug = Object.entries(CATEGORY_SLUG_MAP).find(([, name]) => name === cat)?.[0] || cat.toLowerCase().replace(/\s+/g, '-');
      canonical = `/products?category=${encodeURIComponent(foundSlug)}`;
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
  }, [selectedCategories, isDealsOnly, search, seoSettings]);

  // Sync state whenever URL or props change
  useEffect(() => {
    const raw = urlCategoryParam || initialCategory;
    if (raw) {
      setSelectedCategories([resolveCategoryName(raw, categoryNames)]);
    } else if (!urlCategoryParam && !initialCategory) {
      setSelectedCategories([]);
    }
    setIsDealsOnly(urlDealsParam);
  }, [urlCategoryParam, initialCategory, urlDealsParam, categoryNames]);

  useEffect(() => {
    if (urlSearchParam) {
      setSearch(urlSearchParam);
    }
  }, [urlSearchParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategories, isDealsOnly, selectedTypes, selectedPriceRanges, sort]);

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      const params = new URLSearchParams(searchParams);
      if (next.length === 1) {
        const foundSlug = Object.entries(CATEGORY_SLUG_MAP).find(([, name]) => name === next[0])?.[0] || next[0];
        params.set('category', foundSlug);
      } else {
        params.delete('category');
      }
      setSearchParams(params, { replace: true });
      return next;
    });
  }, [searchParams, setSearchParams]);

  const toggleDeals = useCallback(() => {
    setIsDealsOnly((prev) => {
      const nextVal = !prev;
      const params = new URLSearchParams(searchParams);
      if (nextVal) {
        params.set('deals', 'true');
      } else {
        params.delete('deals');
      }
      setSearchParams(params, { replace: true });
      return nextVal;
    });
  }, [searchParams, setSearchParams]);

  const toggleType = useCallback((type: DeliveryType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const togglePriceRange = useCallback((index: number) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setIsDealsOnly(false);
    setSelectedTypes([]);
    setSelectedPriceRanges([]);
    setSearch('');
    const params = new URLSearchParams(searchParams);
    params.delete('category');
    params.delete('deals');
    params.delete('search');
    params.delete('q');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handlePillClick = (pill: typeof QUICK_CATEGORY_PILLS[number]) => {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);

    if (pill.slug === 'all') {
      setSelectedCategories([]);
      setIsDealsOnly(false);
      params.delete('category');
      params.delete('deals');
    } else if (pill.slug === 'deals') {
      setSelectedCategories([]);
      setIsDealsOnly(true);
      params.delete('category');
      params.set('deals', 'true');
    } else {
      setIsDealsOnly(false);
      params.delete('deals');
      if (pill.categoryName) {
        setSelectedCategories([pill.categoryName]);
        params.set('category', pill.slug);
      }
    }
    setSearchParams(params, { replace: true });
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    isDealsOnly ||
    selectedTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    search.length > 0;

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase()) &&
        !p.shortDescription.toLowerCase().includes(search.toLowerCase()) &&
        !p.category.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (isDealsOnly) {
        const hasDiscount =
          (p.compareAtPrice && p.compareAtPrice > p.price) ||
          p.badge === 'sale' ||
          p.badge === 'featured' ||
          p.featured;
        if (!hasDiscount) return false;
      }

      if (selectedCategories.length > 0 && !selectedCategories.includes(p.category))
        return false;

      if (selectedTypes.length > 0 && !selectedTypes.includes(p.deliveryType))
        return false;

      if (selectedPriceRanges.length > 0) {
        const matches = selectedPriceRanges.some((idx) => {
          const range = PRICE_RANGES[idx];
          return p.price >= range.min && p.price <= range.max;
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
      return {
        eyebrow: 'Category',
        title: cat,
        description: `Explore our collection of authentic ${cat}. Instant download, clean files, and regular updates.`,
      };
    }
    return {
      eyebrow: 'Digital Marketplace',
      title: 'Explore All Digital Products',
      description: 'Browse WordPress themes, plugins, software, AI tools, courses, and digital resources — each with instant download and verified access.',
    };
  }, [isDealsOnly, selectedCategories]);

  const filterContent = (
    <div className="flex flex-col gap-6">
      {/* Special Deals Quick Filter */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
        <button
          onClick={toggleDeals}
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

  return (
    <Layout>
      {/* Dynamic Header */}
      <div className="border-b border-ink-100 bg-gradient-to-b from-ink-50/60 to-white">
        <div className="container-page py-10 sm:py-14">
          <SectionHeading
            eyebrow={headerInfo.eyebrow}
            title={headerInfo.title}
            description={headerInfo.description}
          />

          {/* Quick Category Navigation Pills */}
          <div className="mt-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {QUICK_CATEGORY_PILLS.map((pill) => {
                const isActive =
                  pill.slug === 'all'
                    ? selectedCategories.length === 0 && !isDealsOnly
                    : pill.slug === 'deals'
                      ? isDealsOnly
                      : selectedCategories.includes(pill.categoryName || '');

                const Icon = pill.icon;
                return (
                  <button
                    key={pill.slug}
                    onClick={() => handlePillClick(pill)}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-soft ring-2 ring-brand-600/20 scale-[1.02]'
                        : 'border border-ink-200/80 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
                    <Icon size={15} className={isActive ? 'text-white' : 'text-brand-600'} />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-5 max-w-2xl">
            <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white px-5 py-3.5 shadow-soft transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
              <Search size={19} className="shrink-0 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="প্রোডাক্টের নাম, বিবরণ বা ক্যাটাগরি সার্চ করুন..."
                className="w-full bg-transparent text-sm sm:text-base text-ink-800 placeholder:text-ink-400 focus:outline-none"
                aria-label="Search products"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page section-padding">
        <div className="flex gap-8 lg:gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <div className="flex items-center justify-between pb-4">
                <h2 className="font-display text-base font-bold text-ink-900">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-brand-50 px-2 text-xs font-bold text-brand-700">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {filterContent}
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Result header */}
            <div className="flex flex-col gap-3 border-b border-ink-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-ink-500">
                  Showing{' '}
                  <span className="font-bold text-ink-900">
                    {filtered.length === 0
                      ? 0
                      : `${(currentPage - 1) * PRODUCTS_PER_PAGE + 1}–${Math.min(currentPage * PRODUCTS_PER_PAGE, filtered.length)}`}
                  </span>{' '}
                  of <span className="font-bold text-ink-900">{filtered.length}</span>{' '}
                  {filtered.length === 1 ? 'product' : 'products'}
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                  >
                    <X size={12} />
                    Clear filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 lg:hidden"
                >
                  <SlidersHorizontal size={16} />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="appearance-none rounded-lg border border-ink-200 bg-white py-2 pl-3.5 pr-9 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-100"
                    aria-label="Sort products"
                  >
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                      <option key={key} value={key}>
                        {SORT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
                  />
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-3">
                {isDealsOnly && (
                  <button
                    onClick={toggleDeals}
                    className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-200"
                  >
                    <Tag size={12} className="text-amber-700" />
                    <span>Special Deals</span>
                    <X size={12} />
                  </button>
                )}
                {selectedCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    {cat}
                    <X size={12} />
                  </button>
                ))}
                {selectedTypes.map((type) => {
                  const typeLabel = PRODUCT_TYPES.find((t) => t.value === type)?.label;
                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                    >
                      {typeLabel}
                      <X size={12} />
                    </button>
                  );
                })}
                {selectedPriceRanges.map((idx) => (
                  <button
                    key={idx}
                    onClick={() => togglePriceRange(idx)}
                    className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    {priceRangeLabels[idx]}
                    <X size={12} />
                  </button>
                ))}
              </div>
            )}

            {/* Grid, loading, error, or empty state */}
            {loading ? (
              <div className="mt-6">
                <ProductGridSkeleton count={9} />
              </div>
            ) : error ? (
              <div className="mt-6">
                <CatalogError onRetry={retry} />
              </div>
            ) : filtered.length > 0 ? (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 140, behavior: 'smooth' });
                      }}
                    />
                  </div>
                )}
              </>
            ) : hasActiveFilters ? (
              <div className="mt-6">
                <CatalogEmpty filtered />
              </div>
            ) : (
              <div className="mt-6">
                <CatalogEmpty />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <h2 className="font-display text-base font-bold text-ink-900">
                Filters
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">{filterContent}</div>

            <div className="border-t border-ink-100 p-5">
              <Button
                onClick={() => setMobileFiltersOpen(false)}
                fullWidth
                size="lg"
              >
                Show {filtered.length} {filtered.length === 1 ? 'Result' : 'Results'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
