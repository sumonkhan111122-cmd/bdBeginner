import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, Eye, Key, Package, Plus, RefreshCw, Shield } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  adminListInventory,
  adminEncryptLicenses,
  adminDecryptLicense,
  adminSyncPending,
} from '@/services/fulfillment';
import type { LicenseInventoryMasked, LicenseInventoryCounts } from '@/types/orders';

const statusColors: Record<string, string> = {
  available: 'bg-success-50 text-success-700 border-success-200',
  assigned: 'bg-brand-50 text-brand-700 border-brand-200',
  revoked: 'bg-error-50 text-error-700 border-error-200',
};

function LicenseInventoryContent({ productId }: { productId: string }) {
  const [items, setItems] = useState<LicenseInventoryMasked[]>([]);
  const [counts, setCounts] = useState<LicenseInventoryCounts>({ available: 0, assigned: 0, revoked: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Add keys
  const [showAdd, setShowAdd] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [adding, setAdding] = useState(false);

  // Reveal
  const [revealedId, setRevealedId] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminListInventory(productId);
      setItems(result.items);
      setCounts(result.counts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddKeys = async () => {
    const keys = bulkInput
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);
    if (keys.length === 0) return;
    setAdding(true);
    setMessage(null);
    setError(null);
    try {
      const result = await adminEncryptLicenses(productId, keys);
      const parts: string[] = [];
      if (result.added > 0) parts.push(`${result.added} key(s) added`);
      if (result.duplicates > 0)
        parts.push(`${result.duplicates} duplicate(s) skipped`);
      setMessage(parts.join('. ') + '.');
      setBulkInput('');
      setShowAdd(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add keys');
    } finally {
      setAdding(false);
    }
  };

  const handleReveal = async (inventoryId: string) => {
    setRevealing(true);
    setRevealedId(inventoryId);
    setRevealedKey(null);
    setCopied(false);
    try {
      const key = await adminDecryptLicense(inventoryId);
      setRevealedKey(key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to decrypt key');
      setRevealedId(null);
    } finally {
      setRevealing(false);
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const result = await adminSyncPending({ productId });
      setMessage(
        result.count && result.count > 0
          ? `Synced ${result.count} pending order(s).`
          : 'No pending orders to sync.'
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <Link
        to={`/admin/products/${productId}/edit`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft size={16} /> Back to Product
      </Link>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink-900">
            <Key size={24} className="text-brand-600" />
            License Inventory
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Manage encrypted license keys for this product.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />
            Sync Pending
          </Button>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus size={15} />
            Add Keys
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Available', value: counts.available, color: 'text-success-600' },
          { label: 'Assigned', value: counts.assigned, color: 'text-brand-600' },
          { label: 'Revoked', value: counts.revoked, color: 'text-error-600' },
          { label: 'Total', value: counts.total, color: 'text-ink-900' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-ink-100 bg-white p-4 shadow-soft">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</p>
            <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Low stock warning */}
      {counts.available === 0 && counts.total > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700">
          <AlertCircle size={17} className="shrink-0" />
          No available license keys. Pending paid orders will need inventory.
        </div>
      )}

      {/* Messages */}
      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700">
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Add Keys Panel */}
      {showAdd && (
        <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
          <h3 className="font-display text-base font-bold text-ink-900">Add License Keys</h3>
          <p className="mt-1 text-sm text-ink-500">
            Enter one license key per line. Keys are encrypted server-side before storage.
          </p>
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            rows={6}
            className="mt-3 w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 font-mono text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder={"XXXX-XXXX-XXXX-1234\nYYYY-YYYY-YYYY-5678\nZZZZ-ZZZZ-ZZZZ-9012"}
          />
          <div className="mt-3 flex items-center gap-3">
            <Button size="sm" onClick={handleAddKeys} disabled={adding || !bulkInput.trim()}>
              {adding ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Encrypting…
                </>
              ) : (
                <>
                  <Shield size={15} />
                  Encrypt & Store
                </>
              )}
            </Button>
            <button
              onClick={() => setShowAdd(false)}
              className="text-sm font-medium text-ink-500 hover:text-ink-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="mt-6 rounded-2xl border border-ink-100 bg-white shadow-soft overflow-hidden">
        {items.length === 0 ? (
          <div className="p-8 text-center">
            <Package size={32} className="mx-auto text-ink-300" />
            <p className="mt-3 text-sm text-ink-500">No license keys added yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50/50 text-xs uppercase tracking-wider text-ink-500">
                  <th className="px-5 py-3 font-semibold">Masked Key</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Added</th>
                  <th className="px-5 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {items.map((item) => (
                  <tr key={item.id} className="group hover:bg-ink-50/50">
                    <td className="px-5 py-3.5 font-mono text-ink-800">
                      {revealedId === item.id && revealedKey ? (
                        <div className="flex items-center gap-2">
                          <span className="break-all text-brand-700 font-semibold">{revealedKey}</span>
                          <button
                            onClick={() => handleCopy(revealedKey)}
                            className="shrink-0 text-ink-400 hover:text-brand-600"
                            title="Copy"
                          >
                            {copied ? <CheckCircle2 size={14} className="text-success-600" /> : <Copy size={14} />}
                          </button>
                        </div>
                      ) : (
                        item.masked_key
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors[item.status] || ''}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {revealedId === item.id ? (
                        <button
                          onClick={() => {
                            setRevealedId(null);
                            setRevealedKey(null);
                          }}
                          className="text-xs font-semibold text-ink-500 hover:text-ink-700"
                        >
                          Hide
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReveal(item.id)}
                          disabled={revealing}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:opacity-50"
                        >
                          <Eye size={13} />
                          Reveal
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminLicenseInventoryPage() {
  const { id = '' } = useParams();
  return <LicenseInventoryContent productId={id} />;
}
