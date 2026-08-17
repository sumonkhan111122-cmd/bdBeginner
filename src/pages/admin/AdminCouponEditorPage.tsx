import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchCouponById,
  createCoupon,
  updateCoupon,
  checkCouponCodeUnique,
  fetchCouponProducts,
  fetchCouponCategories,
  syncCouponProducts,
  syncCouponCategories,
  fetchCouponRedemptions,
  type CouponInput,
} from '@/services/discounts';
import { fetchAllCategories, fetchAllProducts } from '@/services/admin';
import type { CouponRedemptionRow, DiscountScope, DiscountType } from '@/types/discounts';

const inputClass = 'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const selectClass = 'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function AdminCouponEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');
  const [maximumDiscount, setMaximumDiscount] = useState('');
  const [scope, setScope] = useState<DiscountScope>('entire_order');
  const [globalUsageLimit, setGlobalUsageLimit] = useState('');
  const [perCustomerLimit, setPerCustomerLimit] = useState('');
  const [firstOrderOnly, setFirstOrderOnly] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Scope selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);

  // Redemptions
  const [redemptions, setRedemptions] = useState<CouponRedemptionRow[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(false);

  // Load catalog data
  useEffect(() => {
    fetchAllProducts().then((products) => setAllProducts(products.map((p) => ({ id: p.id, name: p.name })))).catch(() => {});
    fetchAllCategories().then((categories) => setAllCategories(categories.map(({ id, name }) => ({ id, name })))).catch(() => {});
  }, []);

  // Load existing coupon
  const loadCoupon = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const coupon = await fetchCouponById(id);
      if (!coupon) { setError('Coupon not found.'); return; }
      setCode(coupon.code);
      setName(coupon.name);
      setDescription(coupon.description || '');
      setDiscountType(coupon.discount_type);
      setDiscountValue(String(coupon.discount_value));
      setMinimumOrderAmount(String(coupon.minimum_order_amount));
      setMaximumDiscount(coupon.maximum_discount ? String(coupon.maximum_discount) : '');
      setScope(coupon.scope);
      setGlobalUsageLimit(coupon.global_usage_limit ? String(coupon.global_usage_limit) : '');
      setPerCustomerLimit(coupon.per_customer_limit ? String(coupon.per_customer_limit) : '');
      setFirstOrderOnly(coupon.first_order_only);
      setStartDate(coupon.start_date ? coupon.start_date.slice(0, 16) : '');
      setEndDate(coupon.end_date ? coupon.end_date.slice(0, 16) : '');
      setIsActive(coupon.is_active);

      const [pids, cids] = await Promise.all([fetchCouponProducts(id), fetchCouponCategories(id)]);
      setSelectedProductIds(pids);
      setSelectedCategoryIds(cids);

      setRedemptionsLoading(true);
      fetchCouponRedemptions(id).then(setRedemptions).catch(() => {}).finally(() => setRedemptionsLoading(false));
    } catch { setError('Failed to load coupon.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadCoupon(); }, [loadCoupon]);

  const handleSave = async () => {
    setError(null);
    setMessage(null);

    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode || trimmedCode.length < 3 || trimmedCode.length > 40) {
      setError('Coupon code must be 3-40 characters.'); return;
    }
    if (!/^[A-Z0-9_-]+$/.test(trimmedCode)) {
      setError('Coupon code may only contain letters, numbers, hyphens, and underscores.'); return;
    }
    if (!name.trim()) { setError('Name is required.'); return; }
    const numValue = Number(discountValue);
    if (!numValue || numValue <= 0) { setError('Discount value must be a positive number.'); return; }
    if (discountType === 'percentage' && numValue > 100) { setError('Percentage discount cannot exceed 100%.'); return; }

    const unique = await checkCouponCodeUnique(trimmedCode, id);
    if (!unique) { setError('This coupon code already exists.'); return; }

    setSaving(true);
    try {
      const input: CouponInput = {
        code: trimmedCode,
        name: name.trim(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: numValue,
        minimum_order_amount: Number(minimumOrderAmount) || 0,
        maximum_discount: maximumDiscount ? Number(maximumDiscount) : null,
        scope,
        global_usage_limit: globalUsageLimit ? Number(globalUsageLimit) : null,
        per_customer_limit: perCustomerLimit ? Number(perCustomerLimit) : null,
        first_order_only: firstOrderOnly,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: isActive,
      };

      let couponId: string;
      if (isEdit) {
        await updateCoupon(id!, input);
        couponId = id!;
        setMessage('Coupon updated successfully.');
      } else {
        const created = await createCoupon(input);
        couponId = created.id;
        setMessage('Coupon created successfully.');
      }

      // Sync scope relations
      if (scope === 'selected_products') {
        await syncCouponProducts(couponId, selectedProductIds);
      } else if (scope === 'selected_categories') {
        await syncCouponCategories(couponId, selectedCategoryIds);
      }

      if (!isEdit) {
        navigate(`/admin/discounts/coupons/${couponId}/edit`, { replace: true });
      }
    } catch (e: any) {
      console.error('[COUPON_SAVE_ERROR]', e);
      // Supabase errors often have a code, details, or hint
      const message = e?.message || e?.error_description || 'Failed to save coupon.';
      const details = e?.details ? `\nDetails: ${e.details}` : '';
      const hint = e?.hint ? `\nHint: ${e.hint}` : '';
      const code = e?.code ? `\nCode: ${e.code}` : '';
      setError(`${message}${details}${hint}${code}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>;

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <Link to="/admin/discounts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> Back to Discounts</Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">{isEdit ? 'Edit Coupon' : 'New Coupon'}</h1>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Coupon Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Coupon Code" hint="Uppercase letters, numbers, hyphens, underscores. 3-40 chars.">
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputClass} placeholder="WELCOME10" maxLength={40} />
              </Field>
              <Field label="Name" hint="Display name for admin reference.">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Welcome 10% Off" maxLength={120} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description" hint="Optional internal description.">
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20" rows={2} maxLength={500} placeholder="Optional internal notes…" />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Discount Configuration</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Discount Type">
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as DiscountType)} className={selectClass}>
                  <option value="percentage">Percentage</option>
                  <option value="fixed_amount">Fixed Amount</option>
                </select>
              </Field>
              <Field label="Discount Value" hint={discountType === 'percentage' ? 'e.g. 10 for 10%' : 'Fixed amount in store currency.'}>
                <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className={inputClass} placeholder="10" min="0" step="0.01" />
              </Field>
              <Field label="Minimum Order Amount" hint="0 = no minimum.">
                <input type="number" value={minimumOrderAmount} onChange={(e) => setMinimumOrderAmount(e.target.value)} className={inputClass} placeholder="0" min="0" step="0.01" />
              </Field>
              <Field label="Maximum Discount" hint="For percentage coupons. Leave empty = no cap.">
                <input type="number" value={maximumDiscount} onChange={(e) => setMaximumDiscount(e.target.value)} className={inputClass} placeholder="No limit" min="0" step="0.01" />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Scope</h2>
            <div className="mt-5 space-y-4">
              <Field label="Applies To">
                <select value={scope} onChange={(e) => setScope(e.target.value as DiscountScope)} className={selectClass}>
                  <option value="entire_order">Entire Order</option>
                  <option value="selected_products">Selected Products</option>
                  <option value="selected_categories">Selected Categories</option>
                </select>
              </Field>
              {scope === 'selected_products' && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink-700">Select Products ({selectedProductIds.length} selected)</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-ink-200 p-2">
                    {allProducts.map((p) => (
                      <label key={p.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50">
                        <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={(e) => {
                          setSelectedProductIds((prev) => e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id));
                        }} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                        <span className="text-sm text-ink-700">{p.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {scope === 'selected_categories' && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink-700">Select Categories ({selectedCategoryIds.length} selected)</p>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-ink-200 p-2">
                    {allCategories.map((c) => (
                      <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50">
                        <input type="checkbox" checked={selectedCategoryIds.includes(c.id)} onChange={(e) => {
                          setSelectedCategoryIds((prev) => e.target.checked ? [...prev, c.id] : prev.filter((x) => x !== c.id));
                        }} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                        <span className="text-sm text-ink-700">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Limits & Schedule</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Global Usage Limit" hint="Total redemptions allowed. Empty = unlimited.">
                <input type="number" value={globalUsageLimit} onChange={(e) => setGlobalUsageLimit(e.target.value)} className={inputClass} placeholder="Unlimited" min="0" />
              </Field>
              <Field label="Per-Customer Limit" hint="Max uses per customer email. Empty = unlimited.">
                <input type="number" value={perCustomerLimit} onChange={(e) => setPerCustomerLimit(e.target.value)} className={inputClass} placeholder="Unlimited" min="0" />
              </Field>
              <Field label="Start Date" hint="Optional. Empty = immediately available.">
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
              </Field>
              <Field label="End Date" hint="Optional. Empty = no expiry.">
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
              </Field>
              <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
                <input type="checkbox" checked={firstOrderOnly} onChange={(e) => setFirstOrderOnly(e.target.checked)} className="h-5 w-5 rounded border-ink-300 text-brand-600" />
                <span className="text-sm font-medium text-ink-700">First order only</span>
              </label>
            </div>
          </section>

          {/* Redemption history (edit only) */}
          {isEdit && (
            <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
              <h2 className="font-display text-lg font-bold text-ink-900">Redemption History</h2>
              {redemptionsLoading ? (
                <div className="mt-4 flex h-20 items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>
              ) : redemptions.length === 0 ? (
                <p className="mt-4 text-sm text-ink-500">No redemptions yet.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-ink-200 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                      <th className="pb-2">Order</th><th className="pb-2">Customer</th><th className="pb-2">Discount</th><th className="pb-2">Status</th><th className="pb-2">Date</th>
                    </tr></thead>
                    <tbody className="divide-y divide-ink-50">
                      {redemptions.map((r) => (
                        <tr key={r.id}><td className="py-2 font-semibold text-ink-800">{r.order_number}</td><td className="py-2 text-ink-600">{r.customer_name || r.customer_email}</td><td className="py-2 text-ink-700">{r.discount_amount}</td><td className="py-2 capitalize text-ink-500">{r.status}</td><td className="py-2 text-xs text-ink-500">{new Date(r.created_at).toLocaleDateString()}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="font-display text-base font-bold text-ink-900">Status</h2>
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 rounded border-ink-300 text-brand-600" />
              <span className="text-sm font-medium text-ink-700">Active</span>
            </label>
            <p className="mt-2 text-xs text-ink-400">Inactive coupons cannot be redeemed even if within schedule.</p>
          </section>

          {message && <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}
          {error && <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700"><AlertCircle size={16} />{error}</div>}

          <button type="button" onClick={handleSave} disabled={saving} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving…</> : <><Save size={16} /> {isEdit ? 'Update Coupon' : 'Create Coupon'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
