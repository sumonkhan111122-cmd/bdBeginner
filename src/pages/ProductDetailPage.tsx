import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ShoppingCart,
  Zap,
  Check,
  Download,
  KeyRound,
  Clock,
  Repeat,
  Wrench,
  ShieldCheck,
  RefreshCw,
  Monitor,
  HelpCircle,
  Package,
  Info,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ProductReviewsSection } from '@/components/reviews/ProductReviewsSection';
import { WishlistButton } from '@/components/discovery/WishlistButton';
import { RecommendationsSection } from '@/components/discovery/RecommendationsSection';
import { RecentlyViewedSection } from '@/components/discovery/RecentlyViewedSection';
import { useDiscovery } from '@/context/DiscoveryContext';
import { deliveryLabels } from '@/data/homepage';
import { useCart } from '@/context/CartContext';
import { useProduct } from '@/hooks/useCatalog';
import { ProductDetailSkeleton } from '@/components/ui/SkeletonCard';
import { CatalogError } from '@/components/ui/CatalogState';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { applySeo, formatSeoTitle } from '@/lib/seo';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import type { DeliveryType, Product } from '@/types';

const deliveryIconMap: Record<DeliveryType, typeof Download> = {
  'instant-download': Download,
  'license-key': KeyRound,
  'manual-delivery': Clock,
  subscription: Repeat,
  service: Wrench,
};

const accentMap: Record<string, { bg: string; icon: string; bar: string }> = {
  brand: { bg: 'bg-brand-50/50', icon: 'text-brand-600', bar: 'bg-brand-500' },
  accent: { bg: 'bg-accent-50/50', icon: 'text-accent-600', bar: 'bg-accent-500' },
  ink: { bg: 'bg-ink-50', icon: 'text-ink-600', bar: 'bg-ink-500' },
  success: { bg: 'bg-success-50/50', icon: 'text-success-600', bar: 'bg-success-500' },
  warning: { bg: 'bg-warning-50/50', icon: 'text-warning-600', bar: 'bg-warning-500' },
};

type TabKey =
  | 'overview'
  | 'features'
  | 'included'
  | 'requirements'
  | 'delivery'
  | 'support'
  | 'faq';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'features', label: 'Features' },
  { key: 'included', label: "What's Included" },
  { key: 'requirements', label: 'Requirements' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'support', label: 'Support & Updates' },
  { key: 'faq', label: 'FAQ' },
];

function ProductMedia({ product }: { product: Product }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const accent = accentMap[product.accent] ?? accentMap.brand;
  const Icon = (Icons[product.icon as keyof typeof Icons] ??
    Icons.Package) as Icons.LucideIcon;
  const activeImage = product.images[activeIdx];

  useEffect(() => setActiveIdx(0), [product.id]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div
        className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-ink-100 ${accent.bg}`}
      >
        <ImageWithFallback
          src={activeImage?.url}
          alt={activeImage?.alt || product.name}
          className="absolute inset-0 h-full w-full object-contain"
          fallback={
            <>
              <div className="absolute inset-0 flex flex-col justify-end gap-1.5 p-6 opacity-[0.06]">
                <div className={`h-2 w-3/4 rounded-full ${accent.bar}`} />
                <div className={`h-2 w-1/2 rounded-full ${accent.bar}`} />
                <div className={`h-2 w-2/3 rounded-full ${accent.bar}`} />
              </div>
              <div className={`absolute h-28 w-28 rounded-full border-2 ${accent.bar} opacity-[0.08]`} />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-white/50 backdrop-blur-sm">
                <Icon size={40} className={`${accent.icon} opacity-80`} strokeWidth={1.5} />
              </div>
            </>
          }
        />
        {product.badge && (
          <div className="absolute left-4 top-4">
            <Badge variant={product.badge} />
          </div>
        )}
        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink-600 shadow-sm backdrop-blur-sm">
          {product.images.length > 1 && `${activeIdx + 1} / ${product.images.length}`}
        </div>
      </div>

      {/* Thumbnails */}
      {product.images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {product.images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative flex aspect-square items-center justify-center rounded-xl border transition-all ${
                activeIdx === idx
                  ? 'border-brand-400 bg-white ring-2 ring-brand-100'
                  : 'border-ink-100 bg-ink-50/50 hover:border-ink-200'
              }`}
              aria-label={`View image ${idx + 1}`}
            >
              <ImageWithFallback
                src={img.url}
                alt={img.alt}
                className="absolute inset-0 h-full w-full rounded-xl object-cover"
                fallback={<Icon size={20} className={activeIdx === idx ? accent.icon : 'text-ink-300'} strokeWidth={1.5} />}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Download;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-500">
        <Icon size={16} />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wider text-ink-400">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium text-ink-800">{value}</dd>
      </div>
    </div>
  );
}

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem, hasItem } = useCart();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [added, setAdded] = useState(false);
  const { seoSettings } = useSiteSettings();
  const formatPrice = useCurrencyFormatter();

  const { data: product, loading, error, retry } = useProduct(slug);

  const { addRecentlyViewed } = useDiscovery();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (product) {
      addRecentlyViewed(product.id);
    }
  }, [product, addRecentlyViewed]);

  useEffect(() => {
    if (!product) return;
    const title = product.seoTitle || formatSeoTitle(product.name, seoSettings);
    applySeo(
      {
        title,
        description:
          product.seoDescription || product.shortDescription || seoSettings.default_meta_description,
        canonicalPath: `/products/${product.slug}`,
        image: product.thumbnail || product.images[0]?.url || seoSettings.default_og_image_url,
      },
      seoSettings,
    );
  }, [product, seoSettings]);

  if (loading) {
    return (
      <Layout>
        <ProductDetailSkeleton />
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container-page section-padding">
          {error ? (
            <CatalogError onRetry={retry} />
          ) : (
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-300">
                <Package size={28} />
              </div>
              <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">
                Product not found
              </h1>
              <p className="mt-3 text-sm text-ink-500">
                The product you're looking for doesn't exist or may have been removed.
              </p>
              <Button to="/products" className="mt-6">
                Browse All Products
              </Button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  const DeliveryIcon = deliveryIconMap[product.deliveryType];
  const inCart = hasItem(product.id);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!inCart) addItem(product, 1, false);
    navigate('/checkout');
  };

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
        )
      : 0;

  return (
    <Layout>
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="border-b border-ink-100 bg-ink-50/30"
      >
        <div className="container-page">
          <ol className="flex items-center gap-1.5 py-3 text-sm">
            <li>
              <Link
                to="/"
                className="text-ink-500 transition-colors hover:text-ink-900"
              >
                Home
              </Link>
            </li>
            <ChevronRight size={14} className="text-ink-300" />
            <li>
              <Link
                to="/products"
                className="text-ink-500 transition-colors hover:text-ink-900"
              >
                Products
              </Link>
            </li>
            <ChevronRight size={14} className="text-ink-300" />
            <li>
              <Link
                to="/products"
                className="text-ink-500 transition-colors hover:text-ink-900"
              >
                {product.category}
              </Link>
            </li>
            <ChevronRight size={14} className="text-ink-300" />
            <li className="truncate font-medium text-ink-900" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      <div className="container-page py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Media */}
          <ProductMedia product={product} />

          {/* Purchase panel */}
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold uppercase tracking-wider text-brand-600">
                {product.category}
              </span>
              {product.badge && <Badge variant={product.badge} />}
            </div>

            <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl text-balance">
              {product.name}
            </h1>

            <p className="mt-3 text-base leading-relaxed text-ink-500">
              {product.shortDescription}
            </p>

            {/* Delivery label */}
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-ink-50 px-3 py-2">
              <DeliveryIcon size={16} className="text-ink-500" />
              <span className="text-sm font-medium text-ink-600">
                {deliveryLabels[product.deliveryType]}
              </span>
            </div>

            {/* Price + CTAs */}
            <div className="mt-6 rounded-2xl border border-ink-100 bg-ink-50/50 p-5">
              <PriceDisplay
                price={product.price}
                previousPrice={product.compareAtPrice}
                size="lg"
              />

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleAddToCart}
                  variant={added ? 'subtle' : 'primary'}
                  size="lg"
                  fullWidth
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button onClick={handleBuyNow} variant="outline" size="lg" fullWidth>
                  <Zap size={18} />
                  Buy Now
                </Button>
                <WishlistButton productId={product.id} variant="labeled" className="hidden sm:flex" />
              </div>
              <div className="mt-3 sm:hidden">
                <WishlistButton productId={product.id} variant="labeled" className="w-full justify-center" />
              </div>

              {/* Transparency box */}
              <div className="mt-5 rounded-xl border border-ink-100 bg-white p-4">
                <div className="flex items-center gap-2 pb-2">
                  <Info size={14} className="text-ink-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
                    Before You Buy
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {[
                    'Check compatibility before purchasing',
                    'Delivery method is shown before checkout',
                    'Support details are listed below',
                    'Refund eligibility depends on the product and policy',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-relaxed text-ink-500"
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Info panel */}
            <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">
                Product Information
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
                <div className="border-b border-ink-50 sm:border-b-0">
                  <InfoRow
                    icon={DeliveryIcon}
                    label="Product Type"
                    value={deliveryLabels[product.deliveryType]}
                  />
                </div>
                {product.version && product.version !== 'N/A' && (
                  <div className="border-b border-ink-50 sm:border-b-0">
                    <InfoRow
                      icon={RefreshCw}
                      label="Version"
                      value={product.version}
                    />
                  </div>
                )}
                {product.compatibility && (
                  <div>
                    <InfoRow
                      icon={Monitor}
                      label="Compatibility"
                      value={product.compatibility}
                    />
                  </div>
                )}
                {product.supportPeriod && (
                  <div>
                    <InfoRow
                      icon={ShieldCheck}
                      label="Support"
                      value={product.supportPeriod}
                    />
                  </div>
                )}
                {product.updatePolicy && product.updatePolicy !== 'N/A — service-based product' && (
                  <div className="sm:col-span-2">
                    <InfoRow
                      icon={RefreshCw}
                      label="Updates"
                      value={product.updatePolicy}
                    />
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Content tabs */}
        <div className="mt-10 lg:mt-12">
          {/* Tab nav */}
          <div className="border-b border-ink-100">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="py-8">
            {activeTab === 'overview' && (
              <div className="max-w-3xl">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Overview
                </h2>
                <p className="mt-4 text-base leading-relaxed text-ink-600">
                  {product.description}
                </p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="max-w-3xl">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Features
                </h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-4"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-600">
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className="text-sm leading-relaxed text-ink-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'included' && (
              <div className="max-w-3xl">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  What's Included
                </h2>
                <p className="mt-2 text-sm text-ink-500">
                  Exactly what you receive with this purchase.
                </p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {product.whatsIncluded.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 rounded-xl border border-ink-100 bg-white p-4"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                        <Check size={14} strokeWidth={3} />
                      </span>
                      <span className="text-sm leading-relaxed text-ink-700">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="max-w-3xl">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Requirements & Compatibility
                </h2>
                {product.requirements ? (
                  <div className="mt-4 rounded-xl border border-ink-100 bg-ink-50/50 p-5">
                    <div className="flex items-start gap-3">
                      <Monitor size={20} className="mt-0.5 shrink-0 text-ink-500" />
                      <div>
                        <p className="text-sm font-semibold text-ink-700">
                          System Requirements
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-600">
                          {product.requirements}
                        </p>
                      </div>
                    </div>
                    {product.compatibility && (
                      <div className="mt-4 flex items-start gap-3 border-t border-ink-100 pt-4">
                        <Check size={20} className="mt-0.5 shrink-0 text-success-600" />
                        <div>
                          <p className="text-sm font-semibold text-ink-700">
                            Compatible With
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-ink-600">
                            {product.compatibility}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-ink-500">
                    No specific requirements listed for this product.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="max-w-3xl">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Delivery Information
                </h2>
                <div className="mt-4 rounded-xl border-2 border-brand-200 bg-brand-50/50 p-5">
                  <div className="flex items-start gap-3">
                    <DeliveryIcon size={24} className="mt-0.5 shrink-0 text-brand-600" />
                    <div>
                      <p className="font-display text-sm font-bold uppercase tracking-wider text-brand-700">
                        {deliveryLabels[product.deliveryType]}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-ink-600">
                        {product.deliveryDescription}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-ink-400">
                  Delivery times may vary depending on the product type. No guaranteed
                  delivery times are promised. Please review the delivery policy for
                  full details.
                </p>
              </div>
            )}

            {activeTab === 'support' && (
              <div className="max-w-3xl">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Support & Updates
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {product.supportPeriod && (
                    <div className="rounded-xl border border-ink-100 bg-white p-5">
                      <ShieldCheck size={20} className="text-ink-500" />
                      <p className="mt-2 font-display text-sm font-bold text-ink-900">
                        Support
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-600">
                        {product.supportPeriod}
                      </p>
                    </div>
                  )}
                  {product.updatePolicy && product.updatePolicy !== 'N/A — service-based product' && (
                    <div className="rounded-xl border border-ink-100 bg-white p-5">
                      <RefreshCw size={20} className="text-ink-500" />
                      <p className="mt-2 font-display text-sm font-bold text-ink-900">
                        Updates
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-600">
                        {product.updatePolicy}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="max-w-3xl">
                <h2 className="font-display text-xl font-bold text-ink-900">
                  Frequently Asked Questions
                </h2>
                <div className="mt-4 flex flex-col gap-3">
                  {product.faq.map((item, idx) => (
                    <FaqAccordionItem
                      key={idx}
                      question={item.question}
                      answer={item.answer}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-12 lg:mt-16 border-t border-ink-100 pt-10">
          <ProductReviewsSection product={product} />
        </div>

        {/* Related products */}
        <RecommendationsSection product={product} className="border-t border-ink-100" />
        
        {/* Recently Viewed */}
        <RecentlyViewedSection className="border-t border-ink-100" />
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-100 bg-white/95 px-4 py-3 backdrop-blur-lg lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold text-ink-900">
              {formatPrice(product.price)}
            </span>
            {discountPct > 0 && (
              <span className="text-xs text-success-600 font-semibold">
                {discountPct}% off
              </span>
            )}
          </div>
          <Button
            onClick={handleAddToCart}
            variant={added ? 'subtle' : 'outline'}
            size="md"
            className="flex-1"
          >
            {added ? (
              <>
                <Check size={16} />
                Added
              </>
            ) : (
              <>
                <ShoppingCart size={16} />
                Add
              </>
            )}
          </Button>
          <Button onClick={handleBuyNow} variant="primary" size="md" className="flex-1">
            <Zap size={16} />
            Buy Now
          </Button>
        </div>
      </div>
    </Layout>
  );
}

function FaqAccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-ink-100 bg-white">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-ink-900">
          <HelpCircle size={16} className="shrink-0 text-ink-400" />
          {question}
        </span>
        <ChevronRight
          size={18}
          className={`shrink-0 text-ink-400 transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 pl-11">
          <p className="text-sm leading-relaxed text-ink-500">{answer}</p>
        </div>
      )}
    </div>
  );
}

export { ProductDetailPage };
