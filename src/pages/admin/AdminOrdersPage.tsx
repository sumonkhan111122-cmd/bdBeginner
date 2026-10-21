import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  AlertCircle,
  Eye,
  Search,
  ShoppingBag,
  Trash2,
  Film,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatCurrency } from '@/lib/currency';
import { formatOrderDate, getOrderItemCount, getOrderStatus } from '@/lib/orders';
import { getAdminOrders, deleteAdminOrders } from '@/services/orders';
import { isAiMotionCourseOrder, computeCourseMetrics } from '@/services/courseAnalytics';
import { Pagination } from '@/components/ui/Pagination';
import type { OrderRow } from '@/types/orders';

const orderStatuses = ['all', 'pending', 'confirmed', 'processing', 'completed', 'cancelled'];
const paymentStatuses = ['all', 'unpaid', 'pending', 'paid', 'failed', 'refunded'];
const fulfillmentStatuses = ['all', 'unfulfilled', 'processing', 'fulfilled', 'cancelled'];
const paymentProviders = ['all', 'bkash', 'nagad', 'rocket', 'manual'];

export function AdminOrdersPage() {
  const { siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [fulfillmentStatus, setFulfillmentStatus] = useState('all');
  const [paymentProvider, setPaymentProvider] = useState('all');

  // Course specific filter
  const [productFilter, setProductFilter] = useState<'all' | 'ai_motion'>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('course') === 'ai-motion' ? 'ai_motion' : 'all';
  });

  const [sortField, setSortField] = useState<'created_at' | 'total' | 'order_number'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
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

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Compute live course metrics
  const courseMetrics = useMemo(() => computeCourseMetrics(orders), [orders]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      // Product specific filter
      if (productFilter === 'ai_motion' && !isAiMotionCourseOrder(order)) {
        return false;
      }

      // Query search: matches order number, customer name, email, phone, or any order item title
      if (query) {
        const matchesBasic = [
          order.order_number,
          order.customer_name,
          order.customer_email,
          order.customer_phone || '',
        ].some((val) => val.toLowerCase().includes(query));

        const matchesItems = order.order_items?.some((item) => {
          const pName = (item as any).product_name || '';
          const pId = item.product_id || '';
          return pName.toLowerCase().includes(query) || pId.toLowerCase().includes(query);
        });

        const isCourseSearch = (query.includes('ai') || query.includes('motion') || query.includes('মোশন') || query.includes('কোর্স')) && isAiMotionCourseOrder(order);

        if (!matchesBasic && !matchesItems && !isCourseSearch) return false;
      }

      if (orderStatus !== 'all' && getOrderStatus(order) !== orderStatus) return false;
      if (paymentStatus !== 'all' && order.payment_status !== paymentStatus) return false;
      if (fulfillmentStatus !== 'all' && order.fulfillment_status !== fulfillmentStatus) return false;
      if (paymentProvider !== 'all' && (order.payment_method || 'none') !== paymentProvider) return false;
      return true;
    });
  }, [fulfillmentStatus, orderStatus, orders, paymentStatus, paymentProvider, productFilter, search]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
  }, [search, orderStatus, paymentStatus, fulfillmentStatus, paymentProvider, productFilter, sortField, sortDirection, itemsPerPage]);

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
    if (!window.confirm(`Are you sure you want to delete the ${selectedIds.size} selected order(s)? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAdminOrders(Array.from(selectedIds));
      setSelectedIds(new Set());
      await loadOrders();
    } catch (err: unknown) {
      console.error('Failed to delete orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete orders.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteSingle = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderNumber}? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAdminOrders([orderId]);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      await loadOrders();
    } catch (err: unknown) {
      console.error('Failed to delete order:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete order.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Orders</h1>
          <p className="mt-1 text-sm text-ink-500">
            {loading ? 'Loading orders…' : `${sorted.length} of ${orders.length} orders`}
          </p>
        </div>
      </div>

      {/* DEDICATED AI MOTION MASTERCLASS KPI & QUICK FILTER BAR */}
      <div className="mt-6 rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/90 via-white to-amber-50/70 p-5 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md">
              <Film size={22} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-ink-900">AI মোশন গ্রাফিক্স মাস্টারক্লাস</h2>
                <span className="rounded-full bg-brand-100 border border-brand-200 px-2.5 py-0.5 text-xs font-bold text-brand-700">
                  ৳১৯৯ কোর্স
                </span>
                {productFilter === 'ai_motion' && (
                  <span className="rounded-full bg-amber-400 text-ink-950 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider">
                    ফিল্টার অ্যাক্টিভ
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-500 mt-0.5">লাইভ সেলস ও ভিজিটর পারফরম্যান্স ট্র্যাকার</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
            <div className="rounded-xl bg-white/80 border border-ink-100 px-3.5 py-2 text-center min-w-[90px]">
              <span className="text-[11px] font-semibold text-ink-500 block">মোট অর্ডার</span>
              <span className="font-bold text-ink-900 text-base">{courseMetrics.totalOrders} টি</span>
            </div>

            <div className="rounded-xl bg-white/80 border border-emerald-100 px-3.5 py-2 text-center min-w-[90px]">
              <span className="text-[11px] font-semibold text-emerald-700 block">সফল পারচেজ</span>
              <span className="font-bold text-emerald-600 text-base">{courseMetrics.paidOrders} জন</span>
            </div>

            <div className="rounded-xl bg-white/80 border border-amber-100 px-3.5 py-2 text-center min-w-[90px]">
              <span className="text-[11px] font-semibold text-amber-700 block">পেন্ডিং ভেরিফিকেশন</span>
              <span className="font-bold text-warning-600 text-base">{courseMetrics.pendingOrders} টি</span>
            </div>

            <div className="rounded-xl bg-white/80 border border-brand-100 px-3.5 py-2 text-center min-w-[110px]">
              <span className="text-[11px] font-semibold text-brand-700 block">সংগৃহীত রেভিনিউ</span>
              <span className="font-extrabold text-brand-700 text-base">৳{courseMetrics.totalRevenue.toLocaleString()}</span>
            </div>

            <div className="rounded-xl bg-white/80 border border-ink-100 px-3.5 py-2 text-center min-w-[110px]">
              <span className="text-[11px] font-semibold text-ink-500 block">কোর্স পেজ ভিউজ</span>
              <span className="font-bold text-ink-800 text-base">
                {courseMetrics.views.totalViews} ভিউজ ({courseMetrics.views.uniqueVisitors} জন)
              </span>
            </div>

            <button
              type="button"
              onClick={() => setProductFilter(productFilter === 'ai_motion' ? 'all' : 'ai_motion')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                productFilter === 'ai_motion'
                  ? 'bg-ink-800 text-white hover:bg-ink-900'
                  : 'bg-brand-600 text-white hover:bg-brand-500'
              }`}
            >
              {productFilter === 'ai_motion' ? 'সব অর্ডার দেখুন' : 'শুধুমাত্র এই কোর্সের অর্ডার দেখুন'}
            </button>
          </div>

        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="mt-6 grid gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-soft lg:grid-cols-[minmax(240px,1fr)_repeat(5,minmax(140px,auto))]">
        <div className="relative">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-ink-200 pl-10 pr-3 text-sm focus:border-brand-500 focus:outline-none"
            placeholder="অর্ডার নং, নাম, ইমেইল বা AI মোশন..."
          />
        </div>
        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700">
          <option value="all">All order statuses</option>
          {orderStatuses.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700">
          <option value="all">All payment statuses</option>
          {paymentStatuses.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={paymentProvider} onChange={(e) => setPaymentProvider(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700">
          <option value="all">All providers</option>
          {paymentProviders.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={fulfillmentStatus} onChange={(e) => setFulfillmentStatus(e.target.value)} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700">
          <option value="all">All fulfillment</option>
          {fulfillmentStatuses.slice(1).map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700">
          <option value={30}>30 / page</option>
          <option value={50}>50 / page</option>
          <option value={100}>100 / page</option>
        </select>
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-ink-200 bg-ink-50 px-4 py-3">
          <span className="text-sm font-medium text-ink-700">{selectedIds.size} order{selectedIds.size !== 1 && 's'} selected</span>
          <button
            onClick={handleDeleteSelected}
            disabled={deleting}
            className="flex items-center gap-1.5 rounded-lg bg-error-100 px-3 py-1.5 text-sm font-semibold text-error-700 hover:bg-error-200 disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={16} />
            {deleting ? 'Deleting...' : 'Delete Selected'}
          </button>
        </div>
      )}

      {/* ORDERS TABLE */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={30} className="text-ink-300" />
            <h2 className="mt-4 font-display text-lg font-bold text-ink-900">
              {orders.length === 0 ? 'No orders yet.' : 'No orders match these filters.'}
            </h2>
            {productFilter === 'ai_motion' && (
              <button
                type="button"
                onClick={() => setProductFilter('all')}
                className="mt-4 text-sm font-semibold text-brand-600 hover:underline cursor-pointer"
              >
                Clear AI Motion filter and view all orders
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-sm">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3 w-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-600"
                      checked={paginatedOrders.length > 0 && selectedIds.size === paginatedOrders.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-5 py-3 cursor-pointer hover:bg-ink-100/50" onClick={() => { setSortField('order_number'); setSortDirection(sortField === 'order_number' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    <div className="flex items-center gap-1">
                      Order {sortField === 'order_number' ? sortDirection === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <ArrowUpDown size={12} className="opacity-30"/>}
                    </div>
                  </th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Email & Phone</th>
                  <th className="px-5 py-3 cursor-pointer hover:bg-ink-100/50" onClick={() => { setSortField('created_at'); setSortDirection(sortField === 'created_at' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    <div className="flex items-center gap-1">
                      Date {sortField === 'created_at' ? sortDirection === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <ArrowUpDown size={12} className="opacity-30"/>}
                    </div>
                  </th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3 cursor-pointer hover:bg-ink-100/50" onClick={() => { setSortField('total'); setSortDirection(sortField === 'total' && sortDirection === 'asc' ? 'desc' : 'asc'); }}>
                    <div className="flex items-center gap-1">
                      Total {sortField === 'total' ? sortDirection === 'asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <ArrowUpDown size={12} className="opacity-30"/>}
                    </div>
                  </th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Order Status</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Fulfillment</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {paginatedOrders.map((order) => {
                  const isCourse = isAiMotionCourseOrder(order);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-ink-50/50 group cursor-pointer transition-colors ${
                        isCourse ? 'bg-amber-50/20' : ''
                      }`}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                    >
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-600"
                          checked={selectedIds.has(order.id)}
                          onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-semibold text-ink-900 group-hover:text-brand-600 block">
                          {order.order_number}
                        </span>
                        {isCourse && (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 text-[10px] font-black text-amber-800">
                            🔥 AI মোশন কোর্স
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-ink-700 font-medium">
                        {order.customer_name}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        <span className="text-ink-600 block">{order.customer_email}</span>
                        {order.customer_phone && (
                          <span className="text-ink-400 font-mono mt-0.5 block">{order.customer_phone}</span>
                        )}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap text-ink-500 text-xs">
                        {formatOrderDate(order.created_at)}
                      </td>

                      <td className="px-5 py-4 text-ink-600 text-xs">
                        <span className="font-semibold">{getOrderItemCount(order)}</span>
                        {isCourse && (
                          <span className="text-[11px] font-medium text-brand-600 block truncate max-w-[140px] mt-0.5">
                            AI Motion Masterclass
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-ink-800">
                        <span>{formatAmount(order)}</span>
                        {Number(order.discount_total || 0) > 0 && (
                          <span className="ml-1.5 inline-flex rounded-full bg-success-50 px-1.5 py-0.5 text-[10px] font-bold text-success-700">
                            Disc
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-ink-600 uppercase text-xs font-bold tracking-wider">
                        {order.payment_method === 'bkash' ? (
                          <span className="text-[#E2136E]">bKash Auto</span>
                        ) : order.payment_method === 'manual' || order.payment_method === 'bkash_personal' ? (
                          <span className="text-brand-600">bKash Manual</span>
                        ) : (
                          order.payment_method || 'none'
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <OrderStatusBadge value={getOrderStatus(order)} />
                      </td>

                      <td className="px-5 py-4">
                        <OrderStatusBadge value={order.payment_status} />
                      </td>

                      <td className="px-5 py-4">
                        <OrderStatusBadge value={order.fulfillment_status} />
                      </td>

                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="inline-flex h-8 items-center gap-1 rounded-lg border border-ink-200 px-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
                          >
                            <Eye size={13} /> View
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(order.id, order.order_number)}
                            disabled={deleting}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink-200 text-ink-400 hover:border-error-200 hover:bg-error-50 hover:text-error-600 disabled:opacity-50 cursor-pointer"
                            title={`Delete order ${order.order_number}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
}
