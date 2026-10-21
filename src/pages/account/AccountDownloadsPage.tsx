import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  DownloadCloud,
  Download,
  AlertCircle,
  Crown,
  Search,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerOrders } from '@/services/orders';
import { isOrderPaidOrConfirmed } from '@/lib/orders';
import { listOrderDownloadsAuth, openDownloadLinkAuth, type DownloadLinkMetadata } from '@/services/downloads';
import { useMembership } from '@/context/MembershipContext';
import type { OrderRow } from '@/types/orders';
import { Button } from '@/components/ui/Button';
import { allCatalogProducts } from '@/data/catalogProducts';

type OrderWithDownloads = {
  order: OrderRow;
  downloads: DownloadLinkMetadata[];
  error?: string;
};

export function AccountDownloadsPage() {
  const { session, profile } = useCustomerAuth();
  const userId = session?.user.id;
  const userEmail = session?.user.email ?? profile?.email;
  const { isVip, status, dailyQuota, claimDownload } = useMembership();

  const [loading, setLoading] = useState(true);
  const [ordersWithDownloads, setOrdersWithDownloads] = useState<OrderWithDownloads[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'purchased' | 'catalog'>('purchased');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [claimingProductId, setClaimingProductId] = useState<string | null>(null);
  const [claimSuccessInfo, setClaimSuccessInfo] = useState<{ message: string; url?: string } | null>(null);

  const loadDownloads = async () => {
    if (!userId && !userEmail) return;
    setLoading(true);

    try {
      const orders = await getCustomerOrders(userId || '', userEmail || undefined);
      const paidOrders = orders.filter(isOrderPaidOrConfirmed);

      const results = await Promise.all(
        paidOrders.map(async (order) => {
          try {
            const downloads = await listOrderDownloadsAuth(order.id);
            return { order, downloads };
          } catch (err: unknown) {
            return { order, downloads: [], error: err instanceof Error ? err.message : 'Unknown error' };
          }
        })
      );

      setOrdersWithDownloads(results.filter((res) => res.downloads.length > 0 || res.error));
    } catch (err) {
      console.error('Failed to load downloads', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDownloads();
  }, [userId, userEmail]);

  const handleDownload = async (orderId: string, orderItemId: string, linkId: string) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(linkId));
      const url = await openDownloadLinkAuth(orderId, orderItemId, linkId);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to open download link.');
    } finally {
      setDownloadingIds((prev) => {
        const next = new Set(prev);
        next.delete(linkId);
        return next;
      });
    }
  };

  const handleVipClaim = async (product: { id: string; name: string; slug?: string }) => {
    setClaimingProductId(product.id);
    setClaimSuccessInfo(null);
    try {
      const result = await claimDownload(product);
      if (result.success && result.url) {
        setClaimSuccessInfo({
          message: `"${product.name}" এর ফাইল ডাউনলোড প্রস্তুত! আপনার লাইব্রেরিতেও যুক্ত করা হয়েছে।`,
          url: result.url.startsWith('http') ? result.url : undefined,
        });
        if (result.url.startsWith('http')) {
          window.open(result.url, '_blank', 'noopener,noreferrer');
        }
        // reload downloads in background
        void loadDownloads();
      } else {
        alert(result.error || 'Could not fetch download file for this product.');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to claim VIP download.');
    } finally {
      setClaimingProductId(null);
    }
  };

  // Filter purchased downloads
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return ordersWithDownloads;
    const q = searchQuery.toLowerCase();
    return ordersWithDownloads
      .map((entry) => ({
        ...entry,
        downloads: entry.downloads.filter(
          (d) =>
            d.title.toLowerCase().includes(q) ||
            entry.order.order_number.toLowerCase().includes(q)
        ),
      }))
      .filter((entry) => entry.downloads.length > 0);
  }, [ordersWithDownloads, searchQuery]);

  // Catalog categories
  const categories = useMemo(() => {
    const set = new Set(allCatalogProducts.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Filter catalog for VIP downloads
  const filteredCatalog = useMemo(() => {
    return allCatalogProducts.filter((product) => {
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        !catalogSearch.trim() ||
        product.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        product.shortDescription?.toLowerCase().includes(catalogSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, catalogSearch]);

  const totalPurchasedFiles = useMemo(() => {
    return ordersWithDownloads.reduce((sum, item) => sum + item.downloads.length, 0);
  }, [ordersWithDownloads]);

  return (
    <AccountLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink-900">My Downloads & Library</h1>
            <p className="mt-1 text-sm text-ink-500">
              Access and download all your digital purchases and VIP membership files.
            </p>
          </div>
        </div>

        {/* VIP MEMBERSHIP STATUS CARD */}
        {isVip ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-ink-950 via-brand-950 to-ink-900 p-6 sm:p-8 text-white shadow-xl ring-1 ring-amber-400/40">
            <div className="absolute right-0 top-0 h-64 w-64 translate-x-12 -translate-y-12 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-300">
                  <Crown size={14} className="text-amber-300" strokeWidth={2.2} />
                  <span>VIP ALL-ACCESS MEMBER</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                  {status.planName}
                </h2>
                <p className="text-xs sm:text-sm text-ink-300">
                  {status.isLifetime ? (
                    <span className="font-semibold text-amber-300">
                      আজীবন এক্সেস সক্রিয় — সকল বর্তমান ও ভবিষ্যতের প্রোডাক্ট ফ্রিতে ডাউনলোড করুন!
                    </span>
                  ) : (
                    <span>
                      মেয়াদ শেষ: {new Date(status.expiresAt || '').toLocaleDateString('bn-BD')} ({status.daysRemaining} দিন বাকি)
                    </span>
                  )}
                </p>
                <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs">
                  {dailyQuota.limit !== null ? (
                    <span className="text-amber-200">
                      আজকের ডাউনলোড কোটা: <strong>{dailyQuota.used}</strong> / {dailyQuota.limit}টি ফাইল (বাকি <strong>{dailyQuota.remaining}</strong>টি)
                    </span>
                  ) : (
                    <span className="text-emerald-300 font-bold">
                      দৈনিক ডাউনলোড: আনলিমিটেড (সীমাহীন)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className={`rounded-xl px-4 py-2.5 font-display text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'catalog'
                      ? 'bg-amber-400 text-ink-950 shadow-md shadow-amber-400/20'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Sparkles size={16} />
                  <span>৩,০০০+ ক্যাটালগ ব্রাউজ করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('purchased')}
                  className={`rounded-xl px-4 py-2.5 font-display text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'purchased'
                      ? 'bg-white text-ink-900 shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  আমার ডাউনলোড ({totalPurchasedFiles})
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* UPGRADE PROMO BANNER FOR NON-VIP USERS */
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 border border-amber-300/40 p-5 sm:p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-ink-950 font-bold shadow-sm">
                  <Crown size={22} className="text-ink-950" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-ink-900">
                    ৩,০০০+ সব প্রোডাক্ট আনলিমিটেড ডাউনলোড করতে চান?
                  </h3>
                  <p className="mt-0.5 text-xs sm:text-sm text-ink-600">
                    মাত্র <strong className="text-brand-700">৳৪৯৯ (১ মাস WP পাস)</strong>, <strong className="text-brand-700">৳৮৯৯ (১ মাস অল-এক্সেস)</strong> অথবা সেরা অফারে <strong className="text-amber-700 font-extrabold">৳১,১৯৯-এ আজীবন</strong> ভিআইপি মেম্বারশিপ নিয়ে সব প্রোডাক্ট ফ্রিতে নিন!
                  </p>
                </div>
              </div>

              <Link
                to="/membership"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-5 py-2.5 font-display text-xs sm:text-sm font-bold text-ink-950 shadow-sm transition-transform hover:scale-105"
              >
                <span>মেম্বারশিপ প্ল্যান দেখুন</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {/* SUCCESS NOTIFICATION */}
        {claimSuccessInfo && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-success-200 bg-success-50 p-4 text-sm text-success-800 shadow-soft">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0 text-success-600" />
              <span>{claimSuccessInfo.message}</span>
            </div>
            {claimSuccessInfo.url && (
              <a
                href={claimSuccessInfo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 shrink-0 rounded-xl bg-success-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-success-700 transition-colors"
              >
                <Download size={15} />
                <span>সরাসরি লিঙ্ক ওপেন করুন</span>
              </a>
            )}
          </div>
        )}

        {/* TAB 1: VIP STORE CATALOG BROWSER & DOWNLOAD */}
        {isVip && activeTab === 'catalog' ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search 3,000+ themes, plugins & scripts..."
                    className="w-full rounded-xl border border-ink-200 bg-ink-50/50 py-2.5 pl-10 pr-4 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                        selectedCategory === cat
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-50 text-ink-600 hover:bg-ink-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCatalog.slice(0, 30).map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col justify-between rounded-2xl border border-ink-100 bg-white p-4 shadow-soft transition-all hover:border-brand-200 hover:shadow-md"
                >
                  <div>
                    {product.thumbnail && (
                      <div className="mb-3 aspect-video w-full overflow-hidden rounded-xl bg-ink-100">
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <span className="inline-block rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 uppercase">
                      {product.category}
                    </span>
                    <h3 className="mt-1.5 font-display text-sm font-bold text-ink-900 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink-50 flex items-center justify-between gap-2">
                    <Link
                      to={`/products/${product.slug}`}
                      className="text-xs font-semibold text-ink-500 hover:text-brand-600 flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink size={12} />
                    </Link>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleVipClaim({ id: product.id, name: product.name })}
                      disabled={claimingProductId === product.id}
                      className="gap-1.5"
                    >
                      {claimingProductId === product.id ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        <DownloadCloud size={14} />
                      )}
                      <span>VIP Download</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCatalog.length > 30 && (
              <p className="text-center text-xs text-ink-500 pt-2">
                Showing top 30 of {filteredCatalog.length} products. Use search above to find any specific item.
              </p>
            )}
          </div>
        ) : (
          /* TAB 2: REGULAR / CLAIMED PURCHASES */
          <div className="space-y-4">
            {/* Search Filter for Purchased */}
            {ordersWithDownloads.length > 0 && (
              <div className="relative max-w-sm">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter your downloads..."
                  className="w-full rounded-xl border border-ink-200 bg-white py-2 pl-9 pr-3 text-xs sm:text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-xs"
                />
              </div>
            )}

            {loading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="rounded-3xl border border-ink-100 bg-white p-10 text-center shadow-soft">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-300">
                  <DownloadCloud size={32} />
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-ink-900">No Downloads Available</h3>
                <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto">
                  You haven't purchased or claimed any downloadable files yet. Explore our store or activate a VIP Pass to download everything for free!
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    to="/membership"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 px-5 py-2.5 font-display text-xs font-bold text-ink-950 shadow-sm transition-colors hover:bg-amber-300"
                  >
                    <Crown size={14} className="text-ink-950" strokeWidth={2.2} />
                    <span>VIP মেম্বারশিপ নিন</span>
                  </Link>
                  <Link
                    to="/products"
                    className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 font-display text-xs font-semibold text-ink-700 hover:bg-ink-50"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredOrders.map(({ order, downloads, error }) => (
                  <div key={order.id} className="rounded-2xl border border-ink-100 bg-white shadow-soft overflow-hidden">
                    <div className="border-b border-ink-100 bg-ink-50/50 px-5 py-3.5 flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-sm font-bold text-ink-900">
                          Order {order.order_number}
                        </h3>
                        <p className="text-[11px] text-ink-500 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link
                        to={`/account/orders/${order.id}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        View Order Details
                      </Link>
                    </div>

                    <div className="p-5">
                      {error ? (
                        <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-xs text-error-700">
                          <AlertCircle className="mt-0.5 shrink-0" size={15} />
                          {error}
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {downloads.map((link) => {
                            const orderItem = order.order_items?.find((i) => i.product_id === link.product_id);

                            return (
                              <div
                                key={link.id}
                                className="flex flex-col justify-between rounded-xl border border-ink-100 bg-ink-50/30 p-4 transition-colors hover:border-brand-200 hover:bg-white"
                              >
                                <div>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <Package size={14} className="text-ink-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-500">
                                      {link.version ? `v${link.version}` : 'Latest Version'}
                                    </span>
                                  </div>
                                  <h4 className="font-semibold text-sm text-ink-900 line-clamp-2">
                                    {orderItem?.product_name || link.title}
                                  </h4>
                                </div>

                                <Button
                                  className="mt-4 w-full"
                                  variant="secondary"
                                  onClick={() => {
                                    if (orderItem) {
                                      handleDownload(order.id, orderItem.id, link.id);
                                    } else {
                                      alert('Missing order item details.');
                                    }
                                  }}
                                  disabled={downloadingIds.has(link.id)}
                                >
                                  {downloadingIds.has(link.id) ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs">
                                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
                                      Opening link...
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs">
                                      <DownloadCloud size={15} />
                                      Download File
                                    </span>
                                  )}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
export default AccountDownloadsPage;
