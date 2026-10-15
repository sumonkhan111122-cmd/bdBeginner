import { useState, useMemo } from 'react';
import {
  AlertCircle,
  ArrowUpCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  Filter,
  Globe,
  Layers,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  checkSourceUpdates,
  importSourceProducts,
  previewLatestSourceProducts,
  previewSourceProduct,
  type ProductImportPreviewItem,
  type ProductImportResult,
} from '@/services/productImporter';

const DEFAULT_PRICE = 99;
const LIMIT_PRESETS = [10, 20, 30, 50, 100, 200, 500, 1000];

const PRESETS = [
  { label: '🌐 All / Homepage', url: 'https://weadown.com/' },
  { label: '🎨 WordPress Themes', url: 'https://weadown.com/wordpress-theme/' },
  { label: '🧩 WordPress Plugins', url: 'https://weadown.com/wordpress-plugins/' },
];

const CATEGORIES = [
  'WordPress',
  'Software',
  'AI Tools',
  'Courses',
  'Digital Resources',
  'Web Services',
];

export function AdminProductImporterPage() {
  const [items, setItems] = useState<ProductImportPreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sourceUrl, setSourceUrl] = useState('https://weadown.com/wordpress-theme/');
  const [importLimit, setImportLimit] = useState<number>(30);
  const [categoryName, setCategoryName] = useState('WordPress');
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [overwritePrice, setOverwritePrice] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'published' | 'draft'>('published');
  const [previewing, setPreviewing] = useState(false);
  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [importing, setImporting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'update_available' | 'new' | 'up_to_date'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);

  // Load products from entered URL or default
  const handleFetchPreview = async (overrideUrl?: string, customLimit?: number) => {
    const url = (overrideUrl ?? sourceUrl).trim();
    const limit = customLimit ?? importLimit;
    if (!url) return;
    setPreviewing(true);
    setError(null);
    setResult(null);
    try {
      if (url.includes('/res/')) {
        const preview = await previewSourceProduct(url);
        setItems(preview.items);
        setSelected(new Set(preview.items.map((i) => i.sourceUrl)));
      } else {
        const preview = await previewLatestSourceProducts(limit, url);
        setItems(preview.items);
        // Pre-select items that need import (new or update available)
        setSelected(
          new Set(
            preview.items
              .filter((item) => item.importStatus !== 'up_to_date')
              .map((item) => item.sourceUrl),
          ),
        );
      }
    } catch (err) {
      console.error('Source preview failed', err);
      setError(err instanceof Error ? err.message : 'Could not load products from this source.');
    } finally {
      setPreviewing(false);
    }
  };

  // Check for updates on all already imported products (রিলোড / আপডেট চেক)
  const handleCheckUpdates = async () => {
    setCheckingUpdates(true);
    setError(null);
    setResult(null);
    try {
      const preview = await checkSourceUpdates(importLimit);
      setItems(preview.items);
      const updates = preview.items.filter((item) => item.importStatus === 'update_available');
      setSelected(new Set(updates.map((item) => item.sourceUrl)));
      if (updates.length > 0) {
        setActiveFilter('update_available');
      } else {
        setActiveFilter('all');
      }
    } catch (err) {
      console.error('Update check failed', err);
      setError(err instanceof Error ? err.message : 'Failed to check updates.');
    } finally {
      setCheckingUpdates(false);
    }
  };

  // Toggle single item selection
  const toggleItem = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  // Select all or deselect visible items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeFilter !== 'all' && item.importStatus !== activeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q) ||
          (item.version && item.version.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, activeFilter, searchQuery]);

  const allVisibleSelected =
    filteredItems.length > 0 && filteredItems.every((item) => selected.has(item.sourceUrl));

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredItems.forEach((item) => next.delete(item.sourceUrl));
      } else {
        filteredItems.forEach((item) => next.add(item.sourceUrl));
      }
      return next;
    });
  };

  // Select only new & updates
  const selectOnlyActionable = () => {
    const actionable = items
      .filter((i) => i.importStatus === 'new' || i.importStatus === 'update_available')
      .map((i) => i.sourceUrl);
    setSelected(new Set(actionable));
  };

  // Run the import / update
  const handleRunImport = async () => {
    const sourceUrls = items
      .filter((item) => selected.has(item.sourceUrl))
      .map((item) => item.sourceUrl);

    if (sourceUrls.length === 0) return;
    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const importResult = await importSourceProducts({
        sourceUrls,
        price,
        categoryName,
        status: publishStatus,
        overwritePrice,
      });

      setResult(importResult);

      // Re-fetch preview to update statuses
      if (sourceUrl.includes('/res/')) {
        const preview = await previewSourceProduct(sourceUrl);
        setItems(preview.items);
      } else {
        const preview = await previewLatestSourceProducts(30, sourceUrl);
        setItems(preview.items);
      }
      setSelected(new Set());
    } catch (err) {
      console.error('Source import failed', err);
      setError(err instanceof Error ? err.message : 'The selected products could not be imported.');
    } finally {
      setImporting(false);
    }
  };

  const newCount = items.filter((item) => item.importStatus === 'new').length;
  const updateCount = items.filter((item) => item.importStatus === 'update_available').length;
  const currentCount = items.filter((item) => item.importStatus === 'up_to_date').length;

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
            <Sparkles size={18} />
            <span>Automatic Product Importer & Update Sync</span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            WeaDown Product Importer
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
            যেকোনো ক্যাটাগরি, হোমপেজ বা সিঙ্গেল প্রোডাক্টের লিংক পেস্ট করে প্রোডাক্ট ও তার রিয়েল ইমেজ,
            ডেসক্রিপশন সরাসরি ইম্পোর্ট ও আপডেট সিঙ্ক করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reload / Update Check Button */}
          <button
            type="button"
            onClick={handleCheckUpdates}
            disabled={previewing || checkingUpdates || importing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            title="ডাটাবেজের সব প্রোডাক্ট চেক করে নতুন আপডেট রিলোড করুন"
          >
            {checkingUpdates ? (
              <Loader2 size={16} className="animate-spin text-brand-600" />
            ) : (
              <RefreshCw size={16} className="text-brand-600" />
            )}
            <span>{checkingUpdates ? 'আপডেট চেক হচ্ছে...' : 'রিলোড / আপডেট চেক'}</span>
          </button>

          {/* Fetch Source Button */}
          <button
            type="button"
            onClick={() => void handleFetchPreview()}
            disabled={previewing || checkingUpdates || importing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {previewing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            <span>{previewing ? 'লোড হচ্ছে...' : 'প্রোডাক্ট ফেচ করুন'}</span>
          </button>
        </div>
      </div>

      {/* URL Input Box & Presets */}
      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:p-6">
        <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600">
          Source Website / Category / Product URL
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleFetchPreview();
              }}
              placeholder="https://weadown.com/wordpress-theme/ অথবা https://weadown.com/res/product-slug/"
              className="h-11 w-full rounded-xl border border-ink-200 px-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="button"
            onClick={() => void handleFetchPreview()}
            disabled={previewing || !sourceUrl.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {previewing ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>প্রিভিউ দেখুন</span>
          </button>
        </div>

        {/* Quick presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="font-medium text-ink-400">কুইক লিংকস:</span>
          {PRESETS.map((preset) => (
            <button
              key={preset.url}
              type="button"
              onClick={() => {
                setSourceUrl(preset.url);
                void handleFetchPreview(preset.url);
              }}
              className={`rounded-lg border px-2.5 py-1 font-medium transition-colors ${
                sourceUrl === preset.url
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-ink-200 bg-ink-50 text-ink-600 hover:border-ink-300 hover:bg-white'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Product Import Limit Controls */}
        <div className="mt-4 border-t border-ink-100 pt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-brand-600" />
              <label className="text-xs font-bold uppercase tracking-wider text-ink-700">
                কতগুলো প্রোডাক্ট ইম্পোর্ট করবেন (Product Limit):
              </label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-500 font-medium">ম্যানুয়াল সংখ্যা:</span>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={importLimit}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setImportLimit(isNaN(val) ? 1 : Math.max(1, Math.min(1000, val)));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleFetchPreview();
                  }}
                  className="h-8 w-24 rounded-lg border border-ink-200 px-2 text-center text-xs font-bold text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  placeholder="সংখ্যা লিখুন"
                />
                <span className="ml-1.5 text-xs font-semibold text-ink-500">টি</span>
              </div>
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-medium text-ink-400">প্রিসেট অপশন:</span>
            {LIMIT_PRESETS.map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => {
                  setImportLimit(limit);
                  void handleFetchPreview(undefined, limit);
                }}
                className={`rounded-lg border px-3 py-1 font-semibold transition-all ${
                  importLimit === limit
                    ? 'border-brand-600 bg-brand-600 text-white shadow-xs'
                    : 'border-ink-200 bg-ink-50 text-ink-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                }`}
              >
                {limit} টি
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-ink-400">
            * ৫০ বা তার বেশি সংখ্যা সিলেক্ট করলে স্বয়ংক্রিয়ভাবে পরবর্তী পেজ বা সাইটম্যাপ থেকে প্রোডাক্ট ফেচ করা হবে (সর্বোচ্চ ১০০০ টি পর্যন্ত)।
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-error-200 bg-error-50 p-4 text-sm font-medium text-error-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-error-600" />
          <div className="flex-1">
            <p className="font-semibold">ইম্পোর্টে সমস্যা হয়েছে</p>
            <p className="mt-0.5 text-xs text-error-700">{error}</p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {result && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-success-200 bg-success-50 p-4 text-sm text-success-900">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-success-600" />
          <div className="flex-1">
            <p className="font-semibold text-base">
              ইম্পোর্ট সফল হয়েছে! ({result.created} নতুন প্রোডাক্ট যোগ হয়েছে, {result.updated} টি আপডেট
              হয়েছে)
            </p>
            {result.errors.length > 0 && (
              <p className="mt-1 text-xs text-warning-700">
                {result.errors.length} টি আইটেম ইম্পোর্ট করা যায়নি।
              </p>
            )}
            <div className="mt-2 flex items-center gap-3">
              <Link
                to="/admin/products"
                className="inline-flex items-center gap-1 font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
              >
                সব প্রোডাক্ট দেখুন
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Product Stats & Controls */}
      {items.length > 0 && (
        <>
          {/* Stat Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div
              onClick={() => setActiveFilter('all')}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                activeFilter === 'all'
                  ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                  : 'border-ink-100 bg-white hover:border-ink-200 shadow-soft'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">Total Scraped</p>
              <p className="mt-1 font-display text-2xl font-bold text-ink-900">{items.length}</p>
            </div>

            <div
              onClick={() => setActiveFilter('update_available')}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                activeFilter === 'update_available'
                  ? 'border-warning-500 bg-warning-50/50 shadow-sm'
                  : 'border-ink-100 bg-white hover:border-ink-200 shadow-soft'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-warning-600 flex items-center gap-1">
                <ArrowUpCircle size={14} /> Updates Available
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-warning-700">{updateCount}</p>
            </div>

            <div
              onClick={() => setActiveFilter('new')}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                activeFilter === 'new'
                  ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                  : 'border-ink-100 bg-white hover:border-ink-200 shadow-soft'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 flex items-center gap-1">
                <Package size={14} /> New Products
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-brand-700">{newCount}</p>
            </div>

            <div
              onClick={() => setActiveFilter('up_to_date')}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                activeFilter === 'up_to_date'
                  ? 'border-success-500 bg-success-50/50 shadow-sm'
                  : 'border-ink-100 bg-white hover:border-ink-200 shadow-soft'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-success-600 flex items-center gap-1">
                <Check size={14} /> Up to Date
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-success-700">{currentCount}</p>
            </div>
          </div>

          {/* Import Settings Bar */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:flex-row lg:items-center">
            {/* Category Select */}
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500">
                Target Category
              </span>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium text-ink-800 focus:border-brand-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            {/* Price Input */}
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500">
                Default Price (৳)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))}
                className="h-10 w-28 rounded-xl border border-ink-200 px-3 text-sm font-semibold text-ink-900 focus:border-brand-500 focus:outline-none"
              />
            </label>

            {/* Status Select */}
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-500">
                Product Status
              </span>
              <select
                value={publishStatus}
                onChange={(e) => setPublishStatus(e.target.value as 'published' | 'draft')}
                className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium text-ink-800 focus:border-brand-500 focus:outline-none"
              >
                <option value="published">🚀 Live (Published)</option>
                <option value="draft">📝 Draft (Review Later)</option>
              </select>
            </label>

            {/* Overwrite Price Option */}
            <label className="flex h-10 items-center gap-2 pt-4 text-xs font-medium text-ink-600 sm:pt-0">
              <input
                type="checkbox"
                checked={overwritePrice}
                onChange={(e) => setOverwritePrice(e.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              আপডেটের সময় প্রাইস রিসেট করুন
            </label>

            <div className="flex-1" />

            {/* Action Import Button */}
            <button
              type="button"
              onClick={handleRunImport}
              disabled={importing || selected.size === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
              <span>{importing ? 'ইম্পোর্ট হচ্ছে...' : `ইম্পোর্ট করুন (${selected.size})`}</span>
            </button>
          </div>

          {/* Table / List View */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
            {/* Filter and Selection Header */}
            <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisible}
                    className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span>সব সিলেক্ট করুন ({filteredItems.length})</span>
                </label>

                {(newCount > 0 || updateCount > 0) && (
                  <button
                    type="button"
                    onClick={selectOnlyActionable}
                    className="text-xs font-semibold text-brand-600 underline hover:text-brand-700"
                  >
                    শুধু New ও Updates সিলেক্ট করুন
                  </button>
                )}
              </div>

              {/* Search within scraped results */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-ink-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="সার্চ করুন..."
                  className="h-9 w-48 rounded-xl border border-ink-200 pl-8 pr-3 text-xs text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Filter Badges */}
            <div className="flex items-center gap-1 border-b border-ink-100 bg-ink-50/50 px-4 py-2 text-xs">
              <Filter size={13} className="text-ink-400" />
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold ${
                  activeFilter === 'all' ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-500 hover:text-ink-800'
                }`}
              >
                All ({items.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('update_available')}
                className={`rounded-lg px-2.5 py-1 font-semibold ${
                  activeFilter === 'update_available'
                    ? 'bg-warning-100 text-warning-800 shadow-xs'
                    : 'text-warning-700 hover:bg-warning-50'
                }`}
              >
                ⚡ Update Available ({updateCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('new')}
                className={`rounded-lg px-2.5 py-1 font-semibold ${
                  activeFilter === 'new'
                    ? 'bg-brand-100 text-brand-800 shadow-xs'
                    : 'text-brand-700 hover:bg-brand-50'
                }`}
              >
                ✨ New ({newCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('up_to_date')}
                className={`rounded-lg px-2.5 py-1 font-semibold ${
                  activeFilter === 'up_to_date'
                    ? 'bg-success-100 text-success-800 shadow-xs'
                    : 'text-success-700 hover:bg-success-50'
                }`}
              >
                ✓ Up to date ({currentCount})
              </button>
            </div>

            {/* Products List */}
            <div className="divide-y divide-ink-100">
              {filteredItems.map((item) => {
                const isSelected = selected.has(item.sourceUrl);
                const isUpdate = item.importStatus === 'update_available';
                const isNew = item.importStatus === 'new';

                return (
                  <div
                    key={item.sourceUrl}
                    className={`flex items-start gap-3 p-4 transition-colors sm:gap-4 ${
                      isSelected ? 'bg-brand-50/30' : 'hover:bg-ink-50/40'
                    }`}
                  >
                    <div className="pt-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.sourceUrl)}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      />
                    </div>

                    {/* Thumbnail Image */}
                    <div className="relative h-18 w-24 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50 shadow-xs sm:h-20 sm:w-28">
                      <ImageWithFallback
                        src={item.imageUrl ?? ''}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        fallback={
                          <div className="flex h-full w-full items-center justify-center bg-ink-100 text-ink-400">
                            <Package size={24} />
                          </div>
                        }
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 pr-2">
                          <h3 className="font-semibold text-ink-900 line-clamp-1">{item.title}</h3>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-ink-500">
                            {item.excerpt || 'No description provided.'}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div className="shrink-0 pt-1">
                          {isUpdate && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-1 text-xs font-bold text-warning-700 ring-1 ring-inset ring-warning-600/20">
                              <ArrowUpCircle size={12} />
                              Update (v{item.currentVersion} ➔ v{item.version})
                            </span>
                          )}
                          {isNew && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 ring-1 ring-inset ring-brand-600/20">
                              ✨ New (v{item.version || '1.0'})
                            </span>
                          )}
                          {!isUpdate && !isNew && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-700 ring-1 ring-inset ring-success-600/20">
                              <Check size={12} /> Up to date (v{item.version})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Meta Footer */}
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                        <span className="inline-flex items-center gap-1 font-medium text-ink-600">
                          <Layers size={12} className="text-ink-400" />
                          {item.sourceCategory || 'WordPress'}
                        </span>

                        {item.features && item.features.length > 0 && (
                          <span className="rounded bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-600">
                            {item.features.length} Features
                          </span>
                        )}

                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
                        >
                          উৎস দেখুন <ExternalLink size={11} />
                        </a>

                        {item.productId && (
                          <Link
                            to={`/admin/products/${item.productId}/edit`}
                            className="font-semibold text-ink-700 underline underline-offset-2 hover:text-brand-600"
                          >
                            এডিট করুন
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
