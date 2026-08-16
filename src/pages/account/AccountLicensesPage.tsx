import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerOrders } from '@/services/orders';
import { listFulfillmentsAuth, revealFulfillmentAuth } from '@/services/fulfillment';
import type { OrderRow, FulfillmentRow, RevealResult } from '@/types/orders';
import { Button } from '@/components/ui/Button';

type OrderLicenseGroup = {
  order: OrderRow;
  fulfillments: FulfillmentRow[];
  error?: string;
};

export function AccountLicensesPage() {
  const { session } = useCustomerAuth();
  const userId = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<OrderLicenseGroup[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string[]>>({});
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const currentUserId = userId;

    let active = true;

    async function load() {
      try {
        const orders = await getCustomerOrders(currentUserId);
        const paidOrders = orders.filter((o) => o.payment_status === 'paid');

        const results = await Promise.all(
          paidOrders.map(async (order) => {
            try {
              const fulfillments = await listFulfillmentsAuth(order.id);
              const licenseFulfillments = fulfillments.filter(
                (f) => f.delivery_type === 'license_key' && f.fulfillment_status === 'completed'
              );
              return { order, fulfillments: licenseFulfillments };
            } catch (err: unknown) {
              return {
                order,
                fulfillments: [],
                error: err instanceof Error ? err.message : 'Unknown error',
              };
            }
          })
        );

        if (active) {
          setGroups(results.filter((r) => r.fulfillments.length > 0 || r.error));
        }
      } catch (err) {
        console.error('Failed to load licenses', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  const handleReveal = async (orderId: string, fulfillmentId: string) => {
    try {
      setRevealingIds((prev) => new Set(prev).add(fulfillmentId));
      const result: RevealResult = await revealFulfillmentAuth(orderId, fulfillmentId);

      if ('error' in result) {
        alert(result.error);
        return;
      }

      if (result.delivery_type === 'license_key') {
        setRevealedKeys((prev) => ({ ...prev, [fulfillmentId]: result.keys }));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reveal license key.');
    } finally {
      setRevealingIds((prev) => {
        const next = new Set(prev);
        next.delete(fulfillmentId);
        return next;
      });
    }
  };

  const handleHide = (fulfillmentId: string) => {
    setRevealedKeys((prev) => {
      const next = { ...prev };
      delete next[fulfillmentId];
      return next;
    });
  };

  const handleCopy = async (fulfillmentId: string, key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedId(fulfillmentId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback: select text for manual copy
    }
  };

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">License Keys</h1>
          <p className="mt-1 text-sm text-ink-500">
            View and manage license keys from your purchases.
          </p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-300">
              <Key size={32} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
              No License Keys
            </h3>
            <p className="mt-2 text-sm text-ink-500">
              You don't have any license keys yet.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse Store &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map(({ order, fulfillments, error }) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft"
              >
                <div className="flex items-center justify-between border-b border-ink-100 bg-ink-50/50 px-5 py-4">
                  <div>
                    <h3 className="font-display font-bold text-ink-900">
                      Order {order.order_number}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Link
                    to={`/account/orders/${order.id}`}
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Order
                  </Link>
                </div>

                <div className="p-5 sm:p-6">
                  {error ? (
                    <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700">
                      <AlertCircle className="mt-0.5 shrink-0" size={17} />
                      {error}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {fulfillments.map((f) => {
                        const isRevealed = !!revealedKeys[f.id];
                        const isRevealing = revealingIds.has(f.id);
                        const isCopied = copiedId === f.id;
                        const keys = revealedKeys[f.id];

                        return (
                          <div
                            key={f.id}
                            className="rounded-xl border border-ink-100 bg-ink-50/30 p-4 transition-colors hover:border-ink-200 hover:bg-white"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <Key size={16} className="text-ink-400" />
                              <span className="text-sm font-semibold text-ink-900">
                                License Key
                              </span>
                            </div>

                            {isRevealed && keys ? (
                              <div className="space-y-2">
                                {keys.map((key, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2"
                                  >
                                    <code className="flex-1 break-all text-sm font-mono text-ink-800">
                                      {key}
                                    </code>
                                    <button
                                      onClick={() => handleCopy(f.id, key)}
                                      className="shrink-0 rounded-md p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-600"
                                      title="Copy to clipboard"
                                    >
                                      {isCopied ? (
                                        <Check size={14} className="text-success-600" />
                                      ) : (
                                        <Copy size={14} />
                                      )}
                                    </button>
                                  </div>
                                ))}
                                <Button
                                  variant="ghost"
                                  className="mt-1"
                                  onClick={() => handleHide(f.id)}
                                >
                                  <span className="inline-flex items-center gap-2 text-sm">
                                    <EyeOff size={14} />
                                    Hide Key
                                  </span>
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="secondary"
                                onClick={() => handleReveal(order.id, f.id)}
                                disabled={isRevealing}
                              >
                                {isRevealing ? (
                                  <span className="inline-flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
                                    Revealing...
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-2">
                                    <Eye size={16} />
                                    Reveal Key
                                  </span>
                                )}
                              </Button>
                            )}
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
    </AccountLayout>
  );
}
