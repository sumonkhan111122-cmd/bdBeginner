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
  Trash2,
  CheckCircle2,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import {
  fetchAllProducts,
  fetchAllCategories,
  archiveProduct,
  duplicateProduct,
  deleteProducts,
  type AdminProduct,
} from '@/services/admin';
import type { CategoryRow } from '@/types/db';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { Pagination } from '@/components/ui/Pagination';

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

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('updated');

  // Pagination & Selection
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Actions & Modals
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<'selected' | string | null>(null);

  const counts = useMemo(() => {
    return {
      all: products.length,
      published: products.filter((p) => p.status === 'published').length,
      draft: products.filter((p) => p.status === 'draft').length,
      archived: products.filter((p) => p.status === 'archived').length,
    };
  }, [products]);

  const hasActiveFilters = Boolean(
    search.trim() || statusFilter !== 'all' || categoryFilter !== 'all' || typeFilter !== 'all'
  );

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setTypeFilter('all');
    setSortKey('updated');
  };

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

  // Reset pagination & selection when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search, statusFilter, categoryFilter, typeFilter, sortKey, itemsPerPage]);

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

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  // Selection handlers
  const allCurrentPageSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedIds.has(p.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedProducts.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Archive handler
  const handleArchive = async (id: string) => {
    setActionError(null);
    setSuccessMessage(null);
    try {
      await archiveProduct(id);
      setConfirmArchiveId(null);
      setSuccessMessage('Product archived successfully.');
      await loadData();
    } catch (err: unknown) {
      console.error('Archive failed', err);
      setActionError('Failed to archive product. Please try again.');
      setConfirmArchiveId(null);
    }
  };

  // Duplicate handler
  const handleDuplicate = async (id: string) => {
    setActionError(null);
    setSuccessMessage(null);
    try {
      await duplicateProduct(id);
      setSuccessMessage('Product duplicated successfully.');
      await loadData();
    } catch (err: unknown) {
      console.error('Duplicate failed', err);
      setActionError('Failed to duplicate product. Please try again.');
    }
  };

  // Delete handler
  const confirmDeleteAction = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const idsToDelete =
        deleteTarget === 'selected' ? Array.from(selectedIds) : [deleteTarget];

      const count = idsToDelete.length;
      await deleteProducts(idsToDelete);

      setSelectedIds((prev) => {
        const next = new Set(prev);
        idsToDelete.forEach((id) => next.delete(id));
        return next;
      });

      setDeleteTarget(null);
      setSuccessMessage(
        count === 1 ? 'Product deleted permanently.' : `${count} products deleted permanently.`
      );
      await loadData();
    } catch (err: unknown) {
      console.error('Delete error', err);
      setActionError(err instanceof Error ? err.message : 'Failed to delete product(s).');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading
              ? 'Loading products…'
              : hasActiveFilters
              ? `Filtered: ${filtered.length} of ${products.length} products found`
              : `Total ${products.length} products`}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} />
          <span>New Product</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
          <AlertCircle size={17} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="shrink-0 text-success-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-semibold text-success-700 underline hover:text-success-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* WordPress-style Status Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
            statusFilter === 'all'
              ? 'bg-ink-900 text-white shadow-2xs'
              : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('published')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
            statusFilter === 'published'
              ? 'bg-success-600 text-white shadow-2xs'
              : 'border border-success-200 bg-white text-success-700 hover:bg-success-50'
          }`}
        >
          Published ({counts.published})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('draft')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
            statusFilter === 'draft'
              ? 'bg-warning-600 text-white shadow-2xs'
              : 'border border-warning-200 bg-white text-warning-700 hover:bg-warning-50'
          }`}
        >
          Draft ({counts.draft})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('archived')}
          className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
            statusFilter === 'archived'
              ? 'bg-ink-600 text-white shadow-2xs'
              : 'border border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
          }`}
        >
          Archived ({counts.archived})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft lg:flex-row lg:items-center">
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
        <div className="flex flex-wrap gap-2.5">
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

          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 transition-colors focus:border-brand-500 focus:outline-none"
          >
            <option value={30}>30 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      {/* Filter Stats & Results Count Strip */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-ink-600">
        <div className="flex items-center gap-2">
          {hasActiveFilters ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 font-semibold text-brand-700 ring-1 ring-inset ring-brand-600/20">
              ফিল্টার রেজাল্ট: {filtered.length} টি প্রোডাক্ট পাওয়া গেছে (মোট {products.length} টি থেকে)
            </span>
          ) : (
            <span className="font-semibold text-ink-700">
              মোট প্রোডাক্ট: {products.length} টি
            </span>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 font-semibold text-brand-600 underline hover:text-brand-800"
            >
              <RotateCcw size={12} /> ফিল্টার রিসেট
            </button>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="text-ink-500">
            Showing{' '}
            <span className="font-semibold text-ink-800">
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filtered.length)}
            </span>{' '}
            of <span className="font-semibold text-ink-800">{filtered.length}</span>
          </div>
        )}
      </div>

      {/* Bulk Action Bar (When Items Selected) */}
      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-ink-200 bg-ink-100/70 px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs text-white">
              {selectedIds.size}
            </span>
            <span>{selectedIds.size} টি প্রোডাক্ট সিলেক্ট করা হয়েছে</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
            >
              Deselect
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget('selected')}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-error-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-error-700 disabled:opacity-50"
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
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
            <p className="text-sm text-ink-500">কোনো প্রোডাক্ট পাওয়া যায়নি।</p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 underline"
              >
                <RotateCcw size={13} /> ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                  {/* Select All Checkbox */}
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      checked={allCurrentPageSelected}
                      onChange={handleSelectAll}
                      title="Select all on this page"
                    />
                  </th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {paginatedProducts.map((p) => {
                  const isChecked = selectedIds.has(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isChecked ? 'bg-brand-50/30' : 'hover:bg-ink-50/50'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="w-10 px-4 py-3.5">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(p.id, e.target.checked)}
                        />
                      </td>

                      {/* Product Name */}
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="font-semibold text-ink-800 hover:text-brand-600 line-clamp-1"
                        >
                          {p.name}
                        </Link>
                        <p className="text-xs text-ink-400">/{p.slug}</p>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3.5 text-xs text-ink-500">{p.sku ?? '—'}</td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-ink-600">{getCategoryName(p)}</td>

                      {/* Price */}
                      <td className="px-4 py-3.5 font-semibold text-ink-800">
                        {formatPrice(Number(p.price))}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 text-xs text-ink-600">
                        <span className="whitespace-nowrap">{p.product_type}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            statusStyles[p.status] ?? statusStyles.draft
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Featured */}
                      <td className="px-4 py-3.5">
                        {p.featured ? (
                          <Star size={16} className="fill-warning-400 text-warning-500" />
                        ) : (
                          <span className="text-ink-300">—</span>
                        )}
                      </td>

                      {/* Updated date */}
                      <td className="px-4 py-3.5 text-xs text-ink-500">
                        {new Date(p.updated_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/products/${p.slug}`}
                            target="_blank"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                            title="View"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            to={`/admin/products/${p.id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(p.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
                            title="Duplicate"
                          >
                            <Copy size={15} />
                          </button>
                          {p.status !== 'archived' && (
                            <button
                              type="button"
                              onClick={() => setConfirmArchiveId(p.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-warning-50 hover:text-warning-700"
                              title="Archive"
                            >
                              <Archive size={15} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-error-50 hover:text-error-600"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => !deleting && setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-ink-100 bg-white p-6 shadow-floating animate-scale-in">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-50 text-error-600">
              <Trash2 size={24} />
            </div>
            <h3 className="font-display text-lg font-bold text-ink-900">
              {deleteTarget === 'selected'
                ? `Delete ${selectedIds.size} Selected Products?`
                : 'Delete Product?'}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              {deleteTarget === 'selected'
                ? `Are you sure you want to permanently delete these ${selectedIds.size} products? This action cannot be undone.`
                : 'Are you sure you want to permanently delete this product? All related downloads and images will be removed.'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="h-10 flex-1 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteAction}
                className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-error-600 text-sm font-semibold text-white transition-colors hover:bg-error-700 disabled:opacity-50"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                <span>{deleting ? 'Deleting…' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {confirmArchiveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setConfirmArchiveId(null)}
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
                type="button"
                onClick={() => setConfirmArchiveId(null)}
                className="h-10 flex-1 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleArchive(confirmArchiveId)}
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
