import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Copy,
  Archive,
  Star,
  AlertCircle,
} from 'lucide-react';
import {
  fetchAllProducts,
  fetchAllCategories,
  archiveProduct,
  duplicateProduct,
  type AdminProduct,
} from '@/services/admin';
import type { CategoryRow } from '@/types/db';
import { useCurrencyFormatter } from '@/hooks/useCurrency';

const statusStyles: Record<string, string> = {
  published: 'bg-success-50 text-success-700 border-success-200',
  draft: 'bg-warning-50 text-warning-700 border-warning-200',
  archived: 'bg-ink-100 text-ink-600 border-ink-200',
};

const productTypes = [
  'digital_download',
  'license_key',
  'subscription',
  'manual_delivery',
  'service',
];

const statusOptions = ['draft', 'published', 'archived'];

type SortKey = 'updated' | 'name' | 'price' | 'created';

function getCategoryName(p: AdminProduct): string {
  const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
  return cat?.name ?? '—';
}

export function AdminProductsPage() {
  const formatPrice = useCurrencyFormatter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [prods, cats] = await Promise.all([fetchAllProducts(), fetchAllCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: unknown) {
      console.error('Failed to load products', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    let result = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.sku ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category_id === categoryFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((p) => p.product_type === typeFilter);
    }
    const sorted = [...result];
    sorted.sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
    return sorted;
  }, [products, search, statusFilter, categoryFilter, typeFilter, sortKey]);

  const handleArchive = async (id: string) => {
    setActionError(null);
    try {
      await archiveProduct(id);
      setConfirmId(null);
      await loadData();
    } catch (err: unknown) {
      console.error('Archive failed', err);
      setActionError('Failed to archive product. Please try again.');
      setConfirmId(null);
    }
  };

  const handleDuplicate = async (id: string) => {
    setActionError(null);
    try {
      await duplicateProduct(id);
      await loadData();
    } catch (err: unknown) {
      console.error('Duplicate failed', err);
      setActionError('Failed to duplicate product. Please try again.');
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Products</h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading ? 'Loading…' : `${filtered.length} of ${products.length} products`}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} />
          New Product
        </Link>
      </div>

      {actionError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
          <AlertCircle size={16} />
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            placeholder="Search by name, slug, or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition-colors focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition-colors focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition-colors focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All types</option>
            {productTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-medium text-ink-700 transition-colors focus:border-brand-500 focus:outline-none"
          >
            <option value="updated">Sort: Updated</option>
            <option value="created">Sort: Created</option>
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-error-700">Failed to load products.</p>
            <button
              onClick={loadData}
              className="mt-3 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink-500">No products match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">SKU</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Featured</th>
                  <th className="px-5 py-3">Updated</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-ink-50/50">
                    <td className="px-5 py-3.5">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        className="font-semibold text-ink-800 hover:text-brand-600"
                      >
                        {p.name}
                      </Link>
                      <p className="text-xs text-ink-400">/{p.slug}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">{p.sku ?? '—'}</td>
                    <td className="px-5 py-3.5 text-ink-600">{getCategoryName(p)}</td>
                    <td className="px-5 py-3.5 font-semibold text-ink-800">
                      {formatPrice(Number(p.price))}
                    </td>
                    <td className="px-5 py-3.5 text-ink-600">
                      <span className="whitespace-nowrap">{p.product_type}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[p.status] ?? statusStyles.draft}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {p.featured ? (
                        <Star size={16} className="fill-warning-400 text-warning-500" />
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">
                      {new Date(p.updated_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/products/${p.slug}`}
                          target="_blank"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                          title="View"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDuplicate(p.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        {p.status !== 'archived' && (
                          <button
                            onClick={() => setConfirmId(p.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-error-50 hover:text-error-700"
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archive confirmation */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setConfirmId(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-ink-100 bg-white p-6 shadow-floating animate-scale-in">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 text-warning-600">
              <Archive size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-ink-900">Archive product?</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              The product will be hidden from your storefront. You can restore it later by
              changing its status.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="h-10 flex-1 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleArchive(confirmId)}
                className="h-10 flex-1 rounded-xl bg-warning-600 text-sm font-semibold text-white transition-colors hover:bg-warning-700"
              >
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
