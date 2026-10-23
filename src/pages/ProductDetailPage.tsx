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
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { useMembership } from '@/context/MembershipContext';
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
import { applySeo, applyStructuredData, formatSeoTitle } from '@/lib/seo';
import { trackViewContent } from '@/lib/tracking';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { isProductFree, claimFreeDownload } from '@/services/freeDownloads';
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

  const { isVip, status: vipStatus, dailyQuota, claimDownload } = useMembership();
  const [vipDownloading, setVipDownloading] = useState(false);
  const [vipNotice, setVipNotice] = useState<{
    type: 'success' | 'error';
    message: string;
    downloadUrl?: string;
  } | null>(null);

  const { data: product, loading, error, retry } = useProduct(slug);

  const isMembershipProduct = product?.slug?.startsWith('membership-');

  const handleVipDownload = async () => {
    if (!product) return;
    setVipDownloading(true);
    setVipNotice(null);
    try {
      const res = await claimDownload({ id: product.id, name: product.name, slug: product.slug });
      if (res.success && res.url) {
        setVipNotice({
          type: 'success',
          message: 'ডাউনলোড লিঙ্ক সফলভাবে তৈরি হয়েছে! যদি নতুন ট্যাব ওপেন না হয়, তবে নিচের বাটনে ক্লিক করুন।',
          downloadUrl: res.url,
        });
        if (res.url.startsWith('http')) {
          window.open(res.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        setVipNotice({
          type: 'error',
          message: res.error || 'ডাউনলোড লিঙ্ক তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        });
      }
    } catch (err: any) {
      setVipNotice({
        type: 'error',
        message: err?.message || 'ডাউনলোডে সমস্যা দেখা দিয়েছে।',
      });
    } finally {
      setVipDownloading(false);
    }
  };

  const isFree = isProductFree(product) || product?.price === 0;
  const [freeDownloading, setFreeDownloading] = useState(false);
  const [freeNotice, setFreeNotice] = useState<{
    type: 'success' | 'error';
    message: string;
    downloadUrl?: string;
  } | null>(null);

  const handleFreeDownload = async () => {
    if (!product) return;
    setFreeDownloading(true);
    setFreeNotice(null);
    try {
      const res = await claimFreeDownload({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        category: product.category,
      });
      if (res.success && res.url) {
        setFreeNotice({
          type: 'success',
          message: 'ফাইল ডাউনলোড প্রস্তুত! যদি নতুন ট্যাব নিজে থেকে ওপেন না হয়, নিচের বাটনে ক্লিক করুন।',
          downloadUrl: res.url,
        });
        if (res.url.startsWith('http')) {
          window.open(res.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        setFreeNotice({
          type: 'error',
          message: res.error || 'ডাউনলোড লিঙ্ক তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        });
      }
    } catch (err: any) {
      setFreeNotice({
        type: 'error',
        message: err?.message || 'ডাউনলোডে সমস্যা দেখা দিয়েছে।',
      });
    } finally {
      setFreeDownloading(false);
    }
  };

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
    trackViewContent(product);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const title = product.seoTitle || formatSeoTitle(product.name, seoSettings);
    const image = product.thumbnail || product.images[0]?.url || seoSettings.default_og_image_url;
    const priceValue = product.salePrice ?? product.price;

    applySeo(
      {
        title,
        description:
          product.seoDescription || product.shortDescription || seoSettings.default_meta_description,
        canonicalPath: `/products/${product.slug}`,
        image,
        type: 'product',
        price: priceValue,
        currency: 'BDT',
        availability: 'in stock',
        retailerItemId: product.id,
        brand: 'bdBeginner',
      },
      seoSettings,
    );

    applyStructuredData('product-detail', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.shortDescription || product.description || '',
      image: image ? [image] : undefined,
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'bdBeginner',
      },
      offers: {
        '@type': 'Offer',
        price: priceValue,
        priceCurrency: 'BDT',
        availability: 'https://schema.org/InStock',
        url: window.location.href,
      },
    });

    return () => {
      applyStructuredData('product-detail', null);
    };
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
              {isFree ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm">
                  <Download size={13} strokeWidth={2.5} />
                  100% Free
                </span>
              ) : product.badge ? (
                <Badge variant={product.badge} />
              ) : null}
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

            {isFree ? (
              /* 100% FREE DIRECT DOWNLOAD PANEL */
              <div className="mt-6 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-600/10 p-5 sm:p-6 shadow-lg shadow-emerald-500/10">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                    <Download size={24} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display text-base font-bold text-ink-900">
                        সবার জন্য ১০০% ফ্রি ডাউনলোড
                      </span>
                      <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                        NO PAYMENT
                      </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-ink-600 leading-relaxed">
                      এই ফাইলটি bdBeginner-এ সবার জন্য সম্পূর্ণ উন্মুক্ত। কোনো পেমেন্ট বা একাউন্ট ছাড়াই সরাসরি ডাউনলোড করুন।
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={handleFreeDownload}
                    disabled={freeDownloading}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:brightness-105 active:scale-[0.99] shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-70 text-base"
                  >
                    {freeDownloading ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        ডাউনলোড প্রস্তুত হচ্ছে...
                      </>
                    ) : (
                      <>
                        <Download size={20} className="stroke-[2.5]" />
                        সরাসরি ফ্রি ডাউনলোড করুন
                      </>
                    )}
                  </button>
                </div>

                {freeNotice && (
                  <div
                    className={`mt-4 rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      freeNotice.type === 'success'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                        : 'border border-rose-200 bg-rose-50 text-rose-900'
                    }`}
                  >
                    <div>{freeNotice.message}</div>
                    {freeNotice.downloadUrl && (
                      <div className="mt-3">
                        <a
                          href={freeNotice.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                          <Download size={15} className="stroke-[2.5]" />
                          সরাসরি ফাইল ডাউনলোড / লিঙ্ক ওপেন করুন
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-end">
                  <WishlistButton productId={product.id} variant="labeled" />
                </div>

                {/* Cross-Sell & Marketing for Paid Products */}
                <div className="mt-6 border-t border-emerald-200/60 pt-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 text-white shadow-sm">
                      <Sparkles size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-800 uppercase tracking-wider">
                        প্রিমিয়াম ডিজিটাল কালেকশন
                      </span>
                      <h4 className="mt-1 font-display text-sm font-bold text-ink-900">
                        আমাদের পেইড কোর্স ও সফটওয়্যারগুলোও ঘুরে দেখুন!
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-ink-600">
                        ফ্রি থিম ও প্লাগইনের পাশাপাশি রয়েছে আধুনিক <strong>AI মোশন মাস্টারক্লাস (৳২৯০)</strong>, ডিজিটাল সফটওয়্যার ও টুলস। এছাড়া মাত্র <strong>৳৪৯৯</strong>-এ ১০ দিন অথবা <strong>৳১,১৯৯</strong>-এ আজীবন ভিআইপি মেম্বারশিপ নিয়ে সমস্ত পেইড প্রোডাক্ট আনলক করতে পারবেন।
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Link
                          to="/course/ai-motion"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-purple-700 transition-colors"
                        >
                          AI মোশন ক্লাস (৳২৯০) <ArrowRight size={12} />
                        </Link>
                        <Link
                          to="/membership"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors"
                        >
                          <Crown size={13} className="text-amber-600" />
                          ভিআইপি মেম্বারশিপ প্ল্যান
                        </Link>
                        <Link
                          to="/products?category=software"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
                        >
                          সফটওয়্যার সমূহ <ArrowRight size={11} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* VIP Member Download Box */}
                {isVip && !isMembershipProduct && (
                  <div className="mt-6 rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-600/15 p-5 shadow-lg shadow-amber-500/10">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-ink-950 shadow-sm">
                        <Crown size={20} strokeWidth={2.2} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-sm font-bold text-ink-900">VIP মেম্বারশিপ সক্রিয়</span>
                          <span className="rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            {vipStatus.planName || 'VIP All-Access'}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-600">
                          আপনার VIP মেম্বারশিপের অধীনে এই ফাইলটি সম্পূর্ণ ফ্রিতে আনলক করা হয়েছে।
                        </p>
                        {dailyQuota.limit !== null ? (
                          <p className="mt-1 text-[11px] font-semibold text-brand-700">
                            আজকের ডাউনলোড: {dailyQuota.used} / {dailyQuota.limit} ফাইল ব্যবহৃত (বাকি {dailyQuota.remaining}টি)
                          </p>
                        ) : (
                          <p className="mt-1 text-[11px] font-bold text-emerald-700">
                            দৈনিক ডাউনলোড: আনলিমিটেড (সীমাহীন)
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={handleVipDownload}
                        disabled={vipDownloading}
                        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl font-bold text-ink-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 hover:brightness-105 active:scale-[0.99] shadow-md shadow-amber-500/25 transition-all disabled:opacity-70"
                      >
                        {vipDownloading ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            ডাউনলোড প্রস্তুত হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Download size={18} className="stroke-[2.5]" />
                            ফ্রি VIP ডাউনলোড করুন
                          </>
                        )}
                      </button>
                    </div>

                    {vipNotice && (
                      <div
                        className={`mt-3 rounded-lg p-3 text-xs leading-relaxed ${
                          vipNotice.type === 'success'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border border-rose-200 bg-rose-50 text-rose-800'
                        }`}
                      >
                        <div>{vipNotice.message}</div>
                        {vipNotice.downloadUrl && (
                          <div className="mt-2.5">
                            <a
                              href={vipNotice.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
                            >
                              <Download size={14} className="stroke-[2.5]" />
                              সরাসরি ফাইল ডাউনলোড / লিঙ্ক ওপেন করুন
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

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

                  {/* VIP Membership Upsell Callout */}
                  {!isVip && !isMembershipProduct && (
                    <div className="mt-4 rounded-xl border border-amber-300/60 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-yellow-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-ink-950 shadow-sm">
                          <Crown size={18} strokeWidth={2.2} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-xs font-bold uppercase tracking-wider text-amber-900">
                              সব পেইড প্রোডাক্ট ফ্রিতে চান?
                            </span>
                            <span className="rounded-full bg-amber-400/30 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                              BEST VALUE
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-ink-700">
                            প্রতিটি আলাদা না কিনে মাত্র <strong>৳৪৯৯</strong>-এ ১০ দিন অথবা <strong>৳১,১৯৯</strong>-এ আজীবন VIP মেম্বারশিপ নিয়ে সাইটের সমস্ত পেইড প্রোডাক্ট আনলক করুন! (থিম, প্লাগইন ও স্ক্রিপ্ট সবার জন্য সম্পূর্ণ ফ্রি)।
                          </p>
                          <Link
                            to="/membership"
                            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline"
                          >
                            VIP মেম্বারশিপ প্ল্যান দেখুন <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

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
        {isFree ? (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-display text-sm font-extrabold text-emerald-600">
                ১০০% ফ্রি
              </span>
              <span className="text-[10px] font-medium text-ink-500">
                কোনো পেমেন্ট নেই
              </span>
            </div>
            <button
              onClick={handleFreeDownload}
              disabled={freeDownloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 text-sm disabled:opacity-70 transition-colors"
            >
              {freeDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  প্রস্তুত হচ্ছে...
                </>
              ) : (
                <>
                  <Download size={16} className="stroke-[2.5]" />
                  সরাসরি ফ্রি ডাউনলোড
                </>
              )}
            </button>
          </div>
        ) : (
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
        )}
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
