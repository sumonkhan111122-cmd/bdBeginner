import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Image as ImageIcon, Pencil, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { fetchProductMedia, type AdminMediaItem } from '@/services/admin';

export function AdminMediaPage() {
  const [items, setItems] = useState<AdminMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchProductMedia());
    } catch (loadError) {
      console.error('Failed to load product media', loadError);
      setError('Product media could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const primaryCount = useMemo(() => items.filter((item) => item.isPrimary).length, [items]);

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Media</h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading ? 'Loading product media…' : `${items.length} referenced images · ${primaryCount} primary`}
          </p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:opacity-50">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"><AlertCircle size={16} />{error}</div>
      )}

      {loading ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl border border-ink-100 bg-white" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-7 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center shadow-soft">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><ImageIcon size={26} /></div>
          <h2 className="mt-4 font-display text-lg font-bold text-ink-900">No product media yet</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-500">Upload an image or add an external image URL from a product editor.</p>
          <Link to="/admin/products" className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">Choose a product</Link>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
              <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-ink-50">
                <ImageWithFallback src={item.imageUrl} alt={item.altText || item.productName} className="h-full w-full object-cover" fallback={<div className="flex flex-col items-center gap-2 text-ink-300"><ImageIcon size={34} /><span className="text-xs">Image unavailable</span></div>} />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {item.isPrimary && <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">Primary / Thumbnail</span>}
                  <span className="rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-xs font-semibold text-ink-600">{item.isGalleryImage ? `Gallery${item.sortOrder !== null ? ` #${item.sortOrder + 1}` : ''}` : 'Thumbnail only'}</span>
                </div>
                <h2 className="mt-3 font-display text-sm font-bold text-ink-900">{item.productName}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-ink-500">Alt: {item.altText || 'Not set'}</p>
                <Link to={`/admin/products/${item.productId}/edit`} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-ink-200 px-3 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"><Pencil size={14} /> Edit Product</Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
