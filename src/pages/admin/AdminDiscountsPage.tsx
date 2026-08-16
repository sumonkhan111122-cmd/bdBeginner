import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Edit2, Percent, Plus, Trash2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatCurrency } from '@/lib/currency';
import { fetchCoupons, fetchPromotions, deleteCoupon, deletePromotion } from '@/services/discounts';
import { deriveCouponStatus, derivePromotionStatus, type CouponRow, type PromotionRow } from '@/types/discounts';

const statusColors: Record<string, string> = {
  active: 'bg-success-50 text-success-700 border-success-200',
  scheduled: 'bg-brand-50 text-brand-700 border-brand-200',
  expired: 'bg-ink-100 text-ink-500 border-ink-200',
  disabled: 'bg-warning-50 text-warning-700 border-warning-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusColors[status] || ''}`}>
      {status}
    </span>
  );
}

export function AdminDiscountsPage() {
  const { siteSettings } = useSiteSettings();
  const currency = {
    currency_code: siteSettings.currency_code || 'BDT',
    currency_symbol: siteSettings.currency_symbol || '৳',
  };
  const [tab, setTab] = useState<'coupons' | 'promotions'>('coupons');
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [promotions, setPromotions] = useState<PromotionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, p] = await Promise.all([fetchCoupons(), fetchPromotions()]);
      setCoupons(c);
      setPromotions(p);
    } catch (e) {
      setError('Failed to load discounts.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Delete this coupon? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch { setError('Failed to delete coupon.'); }
    finally { setDeleting(null); }
  };

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Delete this promotion? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await deletePromotion(id);
      setPromotions((prev) => prev.filter((p) => p.id !== id));
    } catch { setError('Failed to delete promotion.'); }
    finally { setDeleting(null); }
  };

  const formatDiscount = (type: string, value: number) =>
    type === 'percentage' ? `${value}%` : formatCurrency(value, currency);

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : '—';

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Discounts</h1>
          <p className="mt-1 text-sm text-ink-500">Manage coupons and automatic promotions. Only one discount applies per order.</p>
        </div>
        <Link
          to={tab === 'coupons' ? '/admin/discounts/coupons/new' : '/admin/discounts/promotions/new'}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus size={16} /> {tab === 'coupons' ? 'New Coupon' : 'New Promotion'}
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl bg-ink-100/60 p-1">
        <button
          onClick={() => setTab('coupons')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tab === 'coupons' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
        >
          <Percent size={15} /> Coupons ({coupons.length})
        </button>
        <button
          onClick={() => setTab('promotions')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${tab === 'promotions' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'}`}
        >
          <Zap size={15} /> Automatic Promotions ({promotions.length})
        </button>
      </div>

      {error && <div className="mt-5 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-4 text-sm text-error-700"><AlertCircle size={17} />{error}</div>}

      {loading ? (
        <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>
      ) : tab === 'coupons' ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
          {coupons.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
              <Percent size={30} className="text-ink-300" />
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">No coupons yet</h2>
              <p className="mt-1 text-sm text-ink-500">Create a coupon code for your customers.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <th className="px-5 py-3">Code</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Discount</th>
                    <th className="px-5 py-3">Scope</th>
                    <th className="px-5 py-3">Min Order</th>
                    <th className="px-5 py-3">Usage</th>
                    <th className="px-5 py-3">Dates</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {coupons.map((coupon) => {
                    const status = deriveCouponStatus(coupon);
                    return (
                      <tr key={coupon.id} className="hover:bg-ink-50/50">
                        <td className="px-5 py-4 font-mono text-xs font-bold uppercase text-ink-900">{coupon.code}</td>
                        <td className="px-5 py-4 text-ink-700">{coupon.name}</td>
                        <td className="px-5 py-4 font-semibold text-ink-800">{formatDiscount(coupon.discount_type, coupon.discount_value)}</td>
                        <td className="px-5 py-4 text-xs text-ink-500 capitalize">{coupon.scope.replace(/_/g, ' ')}</td>
                        <td className="px-5 py-4 text-ink-600">{coupon.minimum_order_amount > 0 ? formatCurrency(coupon.minimum_order_amount, currency) : '—'}</td>
                        <td className="px-5 py-4 text-ink-600">{coupon.redemption_count ?? 0}{coupon.global_usage_limit ? `/${coupon.global_usage_limit}` : ''}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-ink-500">{formatDate(coupon.start_date)} → {formatDate(coupon.end_date)}</td>
                        <td className="px-5 py-4"><StatusBadge status={status} /></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/discounts/coupons/${coupon.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Edit"><Edit2 size={14} /></Link>
                            <button onClick={() => handleDeleteCoupon(coupon.id)} disabled={deleting === coupon.id} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600 disabled:opacity-40" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
          {promotions.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
              <Zap size={30} className="text-ink-300" />
              <h2 className="mt-4 font-display text-lg font-bold text-ink-900">No promotions yet</h2>
              <p className="mt-1 text-sm text-ink-500">Create an automatic promotion that applies when no coupon is used.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50/60 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Discount</th>
                    <th className="px-5 py-3">Scope</th>
                    <th className="px-5 py-3">Min Order</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Dates</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {promotions.map((promo) => {
                    const status = derivePromotionStatus(promo);
                    return (
                      <tr key={promo.id} className="hover:bg-ink-50/50">
                        <td className="px-5 py-4 font-semibold text-ink-900">{promo.name}</td>
                        <td className="px-5 py-4 font-semibold text-ink-800">{formatDiscount(promo.discount_type, promo.discount_value)}</td>
                        <td className="px-5 py-4 text-xs text-ink-500 capitalize">{promo.scope.replace(/_/g, ' ')}</td>
                        <td className="px-5 py-4 text-ink-600">{promo.minimum_order_amount > 0 ? formatCurrency(promo.minimum_order_amount, currency) : '—'}</td>
                        <td className="px-5 py-4 text-ink-600">{promo.priority}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-xs text-ink-500">{formatDate(promo.start_date)} → {formatDate(promo.end_date)}</td>
                        <td className="px-5 py-4"><StatusBadge status={status} /></td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/admin/discounts/promotions/${promo.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700" title="Edit"><Edit2 size={14} /></Link>
                            <button onClick={() => handleDeletePromotion(promo.id)} disabled={deleting === promo.id} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-error-50 hover:text-error-600 disabled:opacity-40" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
