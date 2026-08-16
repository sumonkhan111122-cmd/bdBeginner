import { useEffect, useState } from 'react';
import { AlertCircle, Eye, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AccountLayout } from '@/components/account/AccountLayout';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { formatCurrency } from '@/lib/currency';
import { formatOrderDate, getOrderItemCount, getOrderStatus } from '@/lib/orders';
import { getCustomerOrders } from '@/services/orders';
import { Pagination } from '@/components/ui/Pagination';
import type { OrderRow } from '@/types/orders';

export function AccountOrdersPage() {
  const { session, loading: authLoading } = useCustomerAuth();
  const { siteSettings } = useSiteSettings();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (authLoading || !session?.user) return;
    let active = true;
    setLoading(true);
    getCustomerOrders(session.user.id)
      .then((data) => { if (active) setOrders(data); })
      .catch((loadError) => {
        console.error('Failed to load customer orders', loadError);
        if (active) setError('Your orders could not be loaded. Please try again.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, session]);

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AccountLayout>
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1>
        <p className="mt-1 text-sm text-ink-500">View your order history and current status.</p>
      </div>

      {loading ? (
        <div className="mt-6 flex h-64 items-center justify-center rounded-2xl border border-ink-100 bg-white"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>
      ) : error ? (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle size={17} />{error}</div>
      ) : orders.length === 0 ? (
        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-white p-8 text-center shadow-soft"><Package size={30} className="text-ink-300" /><h2 className="mt-4 font-display text-lg font-bold text-ink-900">You haven't placed any orders yet.</h2><Link to="/products" className="mt-4 text-sm font-semibold text-brand-600 hover:underline">Shop Products</Link></div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-soft">
          <table className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wider text-ink-400"><th className="px-5 py-3">Order</th><th className="px-5 py-3">Date</th><th className="px-5 py-3">Items</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Order Status</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3 text-right">View</th></tr></thead>
            <tbody className="divide-y divide-ink-50">{paginatedOrders.map((order) => <tr key={order.id} className="hover:bg-ink-50/50"><td className="px-5 py-4 font-semibold text-ink-900">{order.order_number}</td><td className="px-5 py-4 text-ink-500">{formatOrderDate(order.created_at)}</td><td className="px-5 py-4 text-ink-600">{getOrderItemCount(order)}</td><td className="px-5 py-4 font-semibold text-ink-800">{order.currency_code === siteSettings.currency_code ? formatCurrency(Number(order.total), siteSettings) : `${order.currency_code} ${Number(order.total).toLocaleString()}`}</td><td className="px-5 py-4"><OrderStatusBadge value={getOrderStatus(order)} /></td><td className="px-5 py-4"><OrderStatusBadge value={order.payment_status} /></td><td className="px-5 py-4 text-right"><Link to={`/account/orders/${order.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 px-3 font-semibold text-ink-700 hover:bg-ink-50"><Eye size={14} /> View</Link></td></tr>)}</tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </AccountLayout>
  );
}
