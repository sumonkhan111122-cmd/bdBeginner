import { useCallback, useState, useEffect } from 'react';
import { 
  fetchAnalyticsSummary, 
  fetchSalesSeries, 
  fetchTopProducts, 
  fetchPaymentStats,
  fetchDiscountStats,
  generateCSV,
  triggerCSVDownload,
  type AnalyticsSummary,
  type SalesSeriesBucket,
  type TopProductRow,
  type PaymentStatsRow,
  type DiscountStatsRow
} from '@/services/analytics';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Tag,
  Download,
  Calendar,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import { formatCurrency } from '@/lib/currency';
import { SalesChart } from '@/components/admin/analytics/SalesChart';
import { TopProductsTable } from '@/components/admin/analytics/TopProductsTable';
import { PaymentStats } from '@/components/admin/analytics/PaymentStats';
import { DiscountStats } from '@/components/admin/analytics/DiscountStats';

export function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [series, setSeries] = useState<SalesSeriesBucket[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductRow[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStatsRow[]>([]);
  const [discountStats, setDiscountStats] = useState<DiscountStatsRow[]>([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      let start = new Date();
      let end = new Date();
      let interval = '1 day';

      if (dateRange === 'today') {
        start.setHours(0, 0, 0, 0);
        interval = '1 hour'; // Or 1 day if we don't want hourly. Let's just do 1 day for simplicity.
      } else if (dateRange === '7d') {
        start.setDate(now.getDate() - 7);
      } else if (dateRange === '30d') {
        start.setDate(now.getDate() - 30);
      } else if (dateRange === 'this_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (dateRange === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (dateRange === 'this_year') {
        start = new Date(now.getFullYear(), 0, 1);
        interval = '1 month';
      } else if (dateRange === 'custom') {
        if (!customStart || !customEnd) {
          setLoading(false);
          return; // Wait for both dates
        }
        start = new Date(customStart);
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }

      const startStr = start.toISOString();
      const endStr = end.toISOString();

      const [sum, ser, top, pay, disc] = await Promise.all([
        fetchAnalyticsSummary(startStr, endStr),
        fetchSalesSeries(startStr, endStr, interval),
        fetchTopProducts(startStr, endStr),
        fetchPaymentStats(startStr, endStr),
        fetchDiscountStats(startStr, endStr)
      ]);

      setSummary(sum);
      setSeries(ser);
      setTopProducts(top);
      setPaymentStats(pay);
      setDiscountStats(disc);

    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, [customEnd, customStart, dateRange]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const exportAllToCSV = () => {
    if (!summary || !series || !topProducts || !paymentStats || !discountStats) return;

    // We can just export the main summary and series for now
    const summaryHeaders = ['Metric', 'Value'];
    const summaryRows = [
      ['Paid Sales', summary.paid_sales],
      ['Paid Orders', summary.paid_orders],
      ['Discounts Given', summary.discounts_given],
      ['Refunded Value', summary.refunded_order_value],
      ['Unique Paid Customers', summary.unique_paid_customers],
      ['New Paid Customers', summary.new_paid_customers],
      ['Returning Paid Customers', summary.returning_paid_customers]
    ];

    const seriesHeaders = ['Date', 'Paid Sales', 'Paid Orders'];
    const seriesRows = series.map(s => [
      new Date(s.bucket_date).toLocaleDateString(),
      s.paid_sales,
      s.paid_orders
    ]);

    const csvContent = generateCSV(summaryHeaders, summaryRows) + 
      '\n\n' + 
      generateCSV(seriesHeaders, seriesRows);

    triggerCSVDownload(csvContent, `analytics_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900">Analytics & Reports</h1>
          <p className="text-ink-500 text-sm mt-1">Real-time business intelligence based on actual paid transactions.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-ink-200 rounded-xl px-3 py-2 shadow-sm">
            <Calendar size={16} className="text-ink-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-sm font-medium text-ink-700 outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-sm shadow-sm"
              />
              <span className="text-ink-400">-</span>
              <input 
                type="date" 
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-white border border-ink-200 rounded-xl px-3 py-2 text-sm shadow-sm"
              />
            </div>
          )}

          <button
            onClick={exportAllToCSV}
            className="flex items-center gap-2 bg-brand-50 text-brand-700 hover:bg-brand-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm border border-brand-200"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-50 text-error-700 p-4 rounded-xl flex items-center gap-3 border border-error-200">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading && !summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white h-32 rounded-2xl border border-ink-100"></div>
          ))}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Paid Sales" 
              value={formatCurrency(summary.paid_sales)} 
              icon={TrendingUp} 
              color="brand"
              subtext={`${summary.paid_orders} total paid orders`}
            />
            <StatCard 
              title="Average Order Value" 
              value={summary.paid_orders > 0 ? formatCurrency(summary.paid_sales / summary.paid_orders) : '৳0'} 
              icon={ShoppingBag} 
              color="ink"
            />
            <StatCard 
              title="New vs Returning" 
              value={summary.unique_paid_customers.toString()} 
              icon={Users} 
              color="ink"
              subtext={`${summary.new_paid_customers} New / ${summary.returning_paid_customers} Returning`}
            />
            <StatCard 
              title="Discounts & Refunds" 
              value={formatCurrency(summary.discounts_given)} 
              icon={Tag} 
              color="warning"
              subtext={`${formatCurrency(summary.refunded_order_value)} refunded`}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SalesChart data={series} />
              <TopProductsTable data={topProducts} />
            </div>
            <div className="space-y-6">
              <PaymentStats data={paymentStats} />
              <DiscountStats data={discountStats} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

type StatCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  subtext?: string;
  color?: 'brand' | 'ink' | 'warning' | 'error';
};

function StatCard({ title, value, icon: Icon, subtext, color = 'brand' }: StatCardProps) {
  const colorStyles = {
    brand: 'bg-brand-50 text-brand-600',
    ink: 'bg-ink-50 text-ink-600',
    warning: 'bg-orange-50 text-orange-600',
    error: 'bg-error-50 text-error-600'
  };

  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-5 shadow-soft">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorStyles[color]}`}>
          <Icon size={20} />
        </div>
        <h3 className="font-semibold text-ink-600">{title}</h3>
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-ink-900">{value}</p>
        {subtext && <p className="text-sm font-medium text-ink-500 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}
