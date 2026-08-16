import { AlertCircle, PackageSearch, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CatalogError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-error-100 bg-error-50/40 px-6 py-12 text-center">
      <AlertCircle className="mx-auto text-error-500" size={28} />
      <h3 className="mt-4 font-display text-lg font-bold text-ink-900">Products could not load</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        Please try again. The catalog is temporarily unavailable.
      </p>
      <Button onClick={onRetry} variant="outline" size="md" className="mt-5">
        <RefreshCw size={15} /> Try Again
      </Button>
    </div>
  );
}

export function CatalogEmpty({ filtered = false }: { filtered?: boolean }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-ink-50/50 px-6 py-16 text-center">
      <PackageSearch className="mx-auto text-ink-300" size={30} />
      <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
        {filtered ? 'No products match your filters' : 'No products available yet'}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        {filtered
          ? 'Try adjusting your search or filter criteria.'
          : 'New products will appear here soon.'}
      </p>
    </div>
  );
}
