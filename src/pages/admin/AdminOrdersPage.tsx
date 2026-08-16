import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, AlertCircle, Eye, Search, ShoppingBag, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatCurrency } from '@/lib/currency';
import { formatOrderDate, getOrderItemCount, getOrderStatus } from '@/lib/orders';
import { getAdminOrders, deleteAdminOrders } from '@/services/orders';
import { Pagination } from '@/components/ui/Pagination';
import type { OrderRow } from '@/types/orders';

const orderStatuses = ['all', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];
const paymentStatuses = ['all', 'unpaid', 'pending', 'paid', 'failed', 'refunded'];
const fulfillmentStatuses = ['all', 'unfulfilled', 'processing', 'fulfilled', 'cancelled'];
const paymentProviders = ['all', 'bkash', 'nagad', 'rocket', 'manual'];

export function AdminOrdersPage() {
  const { siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [fulfillmentStatus, setFulfillmentStatus] = useState('all');
  const [paymentProvider, setPaymentProvider] = useState('all');
  const [sortField, setSortField] = useState<'created_at' | 'total' | 'order_number'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await getAdminOrders());
    } catch (loadError) {
      console.error('Failed to load admin orders', loadError);
      setError('Orders could not be loaded. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      if (query && ![order.order_number, order.customer_name, order.customer_email].some((value) => value.toLowerCase().includes(query))) return false;
      if (orderStatus !== 'all' && getOrderStatus(order) !== orderStatus) return false;
      if (paymentStatus !== 'all' && order.payment_status !== paymentStatus) return false;
      if (fulfillmentStatus !== 'all' && order.fulfillment_status !== fulfillmentStatus) return false;
      if (paymentProvider !== 'all' && (order.payment_method || 'none') !== paymentProvider) return false;
      return true;
    });
  }, [fulfillmentStatus, orderStatus, orders, paymentStatus, paymentProvider, search]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search, orderStatus, paymentStatus, fulfillmentStatus, paymentProvider, sortField, sortDirection]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'total') {
        comparison = Number(a.total) - Number(b.total);
      } else if (sortField === 'order_number') {
        comparison = a.order_number.localeCompare(b.order_number);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filtered, sortField, sortDirection]);

  const formatAmount = (order: OrderRow) => order.currency_code === siteSettings.currency_code
    ? formatCurrency(Number(order.total), siteSettings)
    : `${order.currency_code} ${Number(order.total).toLocaleString()}`;

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedOrders = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(paginatedOrders.map((o) => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOrder = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm('Are you sure you want to delete the selected orders? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await deleteAdminOrders(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadOrders();
    } catch (err) {
      console.error('Failed to delete orders:', err);
      setError('Failed to delete orders.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div><h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1><p className="mt-1 text-sm text-ink-500">{loading ? 'Loading orders…' : `${sorted.length} of ${orders.length} orders`}</p></div>

      <div className="mt-6 grid gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft lg:grid-cols-[minmax(240px,1fr)_repeat(4,minmax(150px,auto))]">
        <div className="relative"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-full rounded-xl border border-ink-200 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none" placeholder="Order number, customer, or email" /></div>
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700"><option value="all">All order statuses</option>{orderStatuses.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700"><option value="all">All payment statuses</option>{paymentStatuses.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={paymentProvider} onChange={(e) => setPaymentProvider(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700"><option value="all">All providers</option>{paymentProviders.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}</select>
        <select value={fulfillmentStatus} onChange={(e) => setFulfillmentStatus(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700"><option value="all">All fulfillment statuses</option>{fulfillmentStatuses.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}</select>
      </div>

      {error && <div className="mt-5 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle size={17} />{error}</div>}

      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-ink-200 bg-ink-50 px-4 py-3">
          <span className="text-sm font-medium text-ink-700">{selectedIds.size} order{selectedIds.size !== 1 && 's'} selected</span>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg bg-error-100 px-3 py-1.5 text-sm font-semibold text-error-700 hover:bg-error-200 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {deleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        {loading ? <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div> : sorted.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center"><ShoppingBag size={30} className="text-ink-300" /><h2 className="mt-4 font-display text-lg font-bold text-ink-900">{orders.length === 0 ? 'No orders yet.' : 'No orders match these filters.'}</h2>{orders.length === 0 && <Link to="/products" className="mt-4 text-sm font-semibold text-brand-600 hover:underline">Shop Products</Link>}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[1280px] text-sm"><thead><tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
          <th className="px-5 py-3 w-10">
            <input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-600" checked={paginatedOrders.length > 0 && selectedIds.size === paginatedOrders.length} onChange={handleSelectAll} />
          </th>
          <th className="px-5 py-3 cursor-pointer hover:bg-ink-100/50" onClick={() => { setSortField('order_number'); setSortDirection(sortField === 'order_number' && sortDirection === 'asc' ? 'desc' : 'asc'); }}><div className="flex items-center gap-1">Order {sortField === 'order_number' ? sortDirection === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <ArrowUpDown size={12} className="opacity-30"/>}</div></th>
          <th className="px-5 py-3">Customer</th>
          <th className="px-5 py-3">Email</th>
          <th className="px-5 py-3 cursor-pointer hover:bg-ink-100/50" onClick={() => { setSortField('created_at'); setSortDirection(sortField === 'created_at' && sortDirection === 'asc' ? 'desc' : 'asc'); }}><div className="flex items-center gap-1">Date {sortField === 'created_at' ? sortDirection === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <ArrowUpDown size={12} className="opacity-30"/>}</div></th>
          <th className="px-5 py-3">Items</th>
          <th className="px-5 py-3 cursor-pointer hover:bg-ink-100/50" onClick={() => { setSortField('total'); setSortDirection(sortField === 'total' && sortDirection === 'asc' ? 'desc' : 'asc'); }}><div className="flex items-center gap-1">Total {sortField === 'total' ? sortDirection === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <ArrowUpDown size={12} className="opacity-30"/>}</div></th>
          <th className="px-5 py-3">Method</th>
          <th className="px-5 py-3">Order Status</th>
          <th className="px-5 py-3">Payment</th>
          <th className="px-5 py-3">Fulfillment</th>
          <th className="px-5 py-3 text-right">Action</th>
        </tr></thead><tbody className="divide-y divide-ink-50">{paginatedOrders.map((order) => <tr key={order.id} className="hover:bg-ink-50/50 group cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}><td className="px-5 py-4" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-600" checked={selectedIds.has(order.id)} onChange={(e) => handleSelectOrder(order.id, e.target.checked)} /></td><td className="px-5 py-4 font-semibold text-ink-900 hover:text-brand-600">{order.order_number}</td><td className="px-5 py-4 text-ink-700">{order.customer_name}</td><td className="px-5 py-4 text-ink-500">{order.customer_email}</td><td className="px-5 py-4 whitespace-nowrap text-ink-500">{formatOrderDate(order.created_at)}</td><td className="px-5 py-4 text-ink-600">{getOrderItemCount(order)}</td><td className="px-5 py-4 font-semibold text-ink-800"><span>{formatAmount(order)}</span>{Number(order.discount_total || 0) > 0 && <span className="ml-1.5 inline-flex rounded-full bg-success-50 px-1.5 py-0.5 text-[10px] font-bold text-success-700">Disc</span>}</td><td className="px-5 py-4 text-ink-500 uppercase text-xs font-bold tracking-wider">{order.payment_method || 'none'}</td><td className="px-5 py-4"><OrderStatusBadge value={getOrderStatus(order)} /></td><td className="px-5 py-4"><OrderStatusBadge value={order.payment_status} /></td><td className="px-5 py-4"><OrderStatusBadge value={order.fulfillment_status} /></td><td className="px-5 py-4 text-right"><Link to={`/admin/orders/${order.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 px-3 font-semibold text-ink-700 hover:bg-ink-50" onClick={(e) => e.stopPropagation()}><Eye size={14} /> View</Link></td></tr>)}</tbody></table>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>}
      </div>
    </div>
  );
}
