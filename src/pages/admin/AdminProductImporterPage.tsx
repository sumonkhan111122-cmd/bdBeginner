import { useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  Loader2,
  RefreshCw,
  UploadCloud,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import {
  importSourceProducts,
  previewLatestSourceProducts,
  previewSourceProduct,
  type ProductImportPreviewItem,
  type ProductImportResult,
} from '@/services/productImporter';

const DEFAULT_PRICE = 99;

function statusLabel(item: ProductImportPreviewItem): string {
  if (item.importStatus === 'update_available') return 'Update available';
  if (item.importStatus === 'up_to_date') return 'Up to date';
  return 'New';
}

function statusClass(item: ProductImportPreviewItem): string {
  if (item.importStatus === 'update_available') return 'bg-warning-50 text-warning-700';
  if (item.importStatus === 'up_to_date') return 'bg-success-50 text-success-700';
  return 'bg-brand-50 text-brand-700';
}

function formatSourceDate(value: string | null): string {
  if (!value) return 'Unknown';
  return new Intl.DateTimeFormat('en-BD', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AdminProductImporterPage() {
  const [items, setItems] = useState<ProductImportPreviewItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sourceUrl, setSourceUrl] = useState('');
  const [price, setPrice] = useState(DEFAULT_PRICE);
  const [overwritePrice, setOverwritePrice] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProductImportResult | null>(null);

  const allItemsSelected =
    items.length > 0 && items.every((item) => selected.has(item.sourceUrl));

  const loadPreview = async () => {
    setPreviewing(true);
    setError(null);
    setResult(null);
    try {
      const preview = await previewLatestSourceProducts(50);
      setItems(preview.items);
      setSelected(
        new Set(
          preview.items
            .filter((item) => item.importStatus !== 'up_to_date')
            .map((item) => item.sourceUrl),
        ),
      );
    } catch (err) {
      console.error('Source preview failed', err);
      setError(err instanceof Error ? err.message : 'Could not load the source preview.');
    } finally {
      setPreviewing(false);
    }
  };

  const loadSourceUrl = async () => {
    const url = sourceUrl.trim();
    if (!url) return;
    setPreviewing(true);
    setError(null);
    setResult(null);
    try {
      const preview = await previewSourceProduct(url);
      setItems(preview.items);
      setSelected(new Set(preview.items.map((item) => item.sourceUrl)));
    } catch (err) {
      console.error('Source URL preview failed', err);
      setError(err instanceof Error ? err.message : 'Could not load this source product.');
    } finally {
      setPreviewing(false);
    }
  };

  const toggleItem = (sourceUrl: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(sourceUrl)) next.delete(sourceUrl);
      else next.add(sourceUrl);
      return next;
    });
  };

  const toggleAllItems = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allItemsSelected) {
        items.forEach((item) => next.delete(item.sourceUrl));
      } else {
        items.forEach((item) => next.add(item.sourceUrl));
      }
      return next;
    });
  };

  const runImport = async () => {
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
        overwritePrice,
      });
      setResult(importResult);
      const refreshed = await previewLatestSourceProducts(50);
      setItems(refreshed.items);
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
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-600">
            <FlaskConical size={17} /> Source catalog
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold text-ink-900">Product Importer</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-500">
            Import the latest posts or paste an individual source product URL whenever you need it.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPreview}
          disabled={previewing || importing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {previewing ? <Loader2 size={17} className="animate-spin" /> : <RefreshCw size={17} />}
          {items.length ? 'Check latest updates' : 'Preview latest 50'}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft sm:flex-row">
        <input
          type="url"
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void loadSourceUrl();
          }}
          placeholder="https://weadown.com/res/product-slug/"
          className="h-10 min-w-0 flex-1 rounded-xl border border-ink-200 px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="button"
          onClick={loadSourceUrl}
          disabled={previewing || importing || !sourceUrl.trim()}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {previewing ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
          Preview URL
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">
              Import complete: {result.created} created, {result.updated} updated.
            </p>
            {result.errors.length > 0 && (
              <>
                <p className="mt-1">{result.errors.length} item(s) need another attempt.</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-xs">
                  {result.errors.slice(0, 3).map((item) => <li key={item.sourceUrl}>{item.message}</li>)}
                </ul>
              </>
            )}
            <Link to="/admin/products" className="mt-1 inline-flex font-semibold underline underline-offset-2">
              Review product drafts
            </Link>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ['New', newCount, 'text-brand-700'],
              ['Updates', updateCount, 'text-warning-700'],
              ['Current', currentCount, 'text-success-700'],
            ].map(([label, count, color]) => (
              <div key={String(label)} className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-400">{label}</p>
                <p className={`mt-1 font-display text-2xl font-bold ${color}`}>{count}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft lg:flex-row lg:items-end">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-500">
                Default price (৳)
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={price}
                onChange={(event) => setPrice(Math.max(0, Number(event.target.value) || 0))}
                className="h-10 w-40 rounded-xl border border-ink-200 px-3 text-sm font-semibold text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </label>
            <label className="flex h-10 items-center gap-2 text-sm font-medium text-ink-600">
              <input
                type="checkbox"
                checked={overwritePrice}
                onChange={(event) => setOverwritePrice(event.target.checked)}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              Also reset the price when applying updates
            </label>
            <div className="flex-1" />
            <button
              type="button"
              onClick={runImport}
              disabled={importing || selected.size === 0}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? <Loader2 size={17} className="animate-spin" /> : <UploadCloud size={17} />}
              {importing ? 'Importing…' : `Import ${selected.size} selected`}
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-ink-700">
                <input
                  type="checkbox"
                  checked={allItemsSelected}
                  onChange={toggleAllItems}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                Select all 50
              </label>
              <span className="text-xs font-medium text-ink-400">{items.length} source products</span>
            </div>

            <div className="divide-y divide-ink-100">
              {items.map((item) => (
                <div key={item.sourceUrl} className="flex gap-3 p-4 sm:gap-4">
                  <div className="pt-4">
                    <input
                      type="checkbox"
                      checked={selected.has(item.sourceUrl)}
                      onChange={() => toggleItem(item.sourceUrl)}
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      aria-label={`Select ${item.title}`}
                    />
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ink-50">
                    <ImageWithFallback
                      src={item.imageUrl ?? ''}
                      alt=""
                      className="h-full w-full object-cover"
                      fallback={<FlaskConical size={20} className="text-ink-300" />}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-900">{item.title}</p>
                        <p className="mt-1 text-xs text-ink-500">
                          {item.sourceCategory || 'Uncategorized'} · {item.version ? `v${item.version}` : 'Version not detected'} · {formatSourceDate(item.sourceModifiedAt)}
                        </p>
                      </div>
                      <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(item)}`}>
                        {item.importStatus === 'up_to_date' && <Check size={13} className="mr-1" />}
                        {statusLabel(item)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700"
                      >
                        View source <ExternalLink size={12} />
                      </a>
                      <span className="text-ink-400">License review: {item.licenseStatus.replace('_', ' ')}</span>
                      {item.productId && (
                        <Link to={`/admin/products/${item.productId}/edit`} className="text-brand-600 hover:text-brand-700">
                          Edit draft
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
