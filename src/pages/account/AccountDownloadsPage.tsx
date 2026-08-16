import { useState, useEffect } from 'react';
import { Package, DownloadCloud, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerOrders } from '@/services/orders';
import { listOrderDownloadsAuth, openDownloadLinkAuth, type DownloadLinkMetadata } from '@/services/downloads';
import type { OrderRow } from '@/types/orders';
import { Button } from '@/components/ui/Button';

type OrderWithDownloads = {
  order: OrderRow;
  downloads: DownloadLinkMetadata[];
  error?: string;
};

export function AccountDownloadsPage() {
  const { session } = useCustomerAuth();
  const userId = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [ordersWithDownloads, setOrdersWithDownloads] = useState<OrderWithDownloads[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const currentUserId = userId;
    
    let active = true;

    async function load() {
      try {
        const orders = await getCustomerOrders(currentUserId);
        
        // We only care about paid orders to fetch downloads for
        const paidOrders = orders.filter((o) => o.payment_status === 'paid');
        
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
        
        if (active) {
          // Only show orders that actually have digital downloads returned
          setOrdersWithDownloads(results.filter((res) => res.downloads.length > 0 || res.error));
        }
      } catch (err) {
        console.error('Failed to load downloads', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [userId]);

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

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Downloads</h1>
          <p className="mt-1 text-sm text-ink-500">Access digital products from your paid orders.</p>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          </div>
        ) : ordersWithDownloads.length === 0 ? (
          <div className="rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-50 text-ink-300">
              <DownloadCloud size={32} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">No Downloads Available</h3>
            <p className="mt-2 text-sm text-ink-500">You don't have any downloadable products yet.</p>
            <Link to="/products" className="mt-6 inline-flex font-semibold text-brand-600 hover:text-brand-700">
              Browse Store &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {ordersWithDownloads.map(({ order, downloads, error }) => (
              <div key={order.id} className="rounded-2xl border border-ink-100 bg-white shadow-soft overflow-hidden">
                <div className="border-b border-ink-100 bg-ink-50/50 px-5 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-ink-900">Order {order.order_number}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
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
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {downloads.map((link) => (
                        <div key={link.id} className="flex flex-col justify-between rounded-xl border border-ink-100 bg-ink-50/30 p-4 transition-colors hover:border-ink-200 hover:bg-white">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Package size={16} className="text-ink-400" />
                              <span className="text-xs font-medium uppercase tracking-wider text-ink-500">
                                {link.version ? `v${link.version}` : 'Download'}
                              </span>
                            </div>
                            <h4 className="font-semibold text-ink-900">{link.title}</h4>
                          </div>
                          
                          <Button 
                            className="mt-4 w-full" 
                            variant="secondary"
                            onClick={() => {
                              // We need the order_item_id that matches the product_id
                              // For simplicity in the UI, we can find it here
                              const orderItem = order.order_items?.find((i) => i.product_id === link.product_id);
                              if (orderItem) {
                                handleDownload(order.id, orderItem.id, link.id);
                              } else {
                                alert("Missing order item details.");
                              }
                            }}
                            disabled={downloadingIds.has(link.id)}
                          >
                            {downloadingIds.has(link.id) ? (
                              <span className="inline-flex items-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
                                Opening...
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-2">
                                <DownloadCloud size={16} />
                                Download
                              </span>
                            )}
                          </Button>
                        </div>
                      ))}
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
