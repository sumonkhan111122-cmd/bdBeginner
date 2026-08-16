import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchPromotionById,
  createPromotion,
  updatePromotion,
  fetchPromotionProducts,
  fetchPromotionCategories,
  syncPromotionProducts,
  syncPromotionCategories,
  type PromotionInput,
} from '@/services/discounts';
import { fetchAllCategories, fetchAllProducts } from '@/services/admin';
import type { DiscountScope, DiscountType } from '@/types/discounts';

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

export function AdminPromotionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minimumOrderAmount, setMinimumOrderAmount] = useState('0');
  const [maximumDiscount, setMaximumDiscount] = useState('');
  const [scope, setScope] = useState<DiscountScope>('entire_order');
  const [priority, setPriority] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Scope selection
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: string; name: string }[]>([]);
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchAllProducts().then((products) => setAllProducts(products.map((p) => ({ id: p.id, name: p.name })))).catch(() => {});
    fetchAllCategories().then((categories) => setAllCategories(categories.map(({ id, name }) => ({ id, name })))).catch(() => {});
  }, []);

  const loadPromotion = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const promo = await fetchPromotionById(id);
      if (!promo) { setError('Promotion not found.'); return; }
      setName(promo.name);
      setDescription(promo.description || '');
      setDiscountType(promo.discount_type);
      setDiscountValue(String(promo.discount_value));
      setMinimumOrderAmount(String(promo.minimum_order_amount));
      setMaximumDiscount(promo.maximum_discount ? String(promo.maximum_discount) : '');
      setScope(promo.scope);
      setPriority(String(promo.priority));
      setStartDate(promo.start_date ? promo.start_date.slice(0, 16) : '');
      setEndDate(promo.end_date ? promo.end_date.slice(0, 16) : '');
      setIsActive(promo.is_active);

      const [pids, cids] = await Promise.all([fetchPromotionProducts(id), fetchPromotionCategories(id)]);
      setSelectedProductIds(pids);
      setSelectedCategoryIds(cids);
    } catch { setError('Failed to load promotion.'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadPromotion(); }, [loadPromotion]);

  const handleSave = async () => {
    setError(null);
    setMessage(null);

    if (!name.trim()) { setError('Name is required.'); return; }
    const numValue = Number(discountValue);
    if (!numValue || numValue <= 0) { setError('Discount value must be a positive number.'); return; }
    if (discountType === 'percentage' && numValue > 100) { setError('Percentage discount cannot exceed 100%.'); return; }

    setSaving(true);
    try {
      const input: PromotionInput = {
        name: name.trim(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: numValue,
        minimum_order_amount: Number(minimumOrderAmount) || 0,
        maximum_discount: maximumDiscount ? Number(maximumDiscount) : null,
        scope,
        priority: Number(priority) || 0,
        start_date: startDate || null,
        end_date: endDate || null,
        is_active: isActive,
      };

      let promoId: string;
      if (isEdit) {
        await updatePromotion(id!, input);
        promoId = id!;
        setMessage('Promotion updated successfully.');
      } else {
        const created = await createPromotion(input);
        promoId = created.id;
        setMessage('Promotion created successfully.');
      }

      // Sync scope relations
      if (scope === 'selected_products') {
        await syncPromotionProducts(promoId, selectedProductIds);
      } else if (scope === 'selected_categories') {
        await syncPromotionCategories(promoId, selectedCategoryIds);
      }

      if (!isEdit) {
        navigate(`/admin/discounts/promotions/${promoId}/edit`, { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save promotion.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex min-h-96 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" /></div>;

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <Link to="/admin/discounts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"><ArrowLeft size={16} /> Back to Discounts</Link>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">{isEdit ? 'Edit Promotion' : 'New Promotion'}</h1>
      <p className="mt-1 text-sm text-ink-500">Automatic promotions apply when no coupon is used. The highest-priority eligible promotion wins.</p>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft sm:p-6">
            <h2 className="font-display text-lg font-bold text-ink-900">Promotion Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" hint="Visible to customers when applied.">
                <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="Summer Sale 15% Off" maxLength={120} />
              </Field>
              <Field label="Priority" hint="Higher number = higher priority. The server picks the best match.">
                <input type="number" value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass} placeholder="0" min="0" />
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
              <Field label="Discount Value">
                <input type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} className={inputClass} placeholder="15" min="0" step="0.01" />
              </Field>
              <Field label="Minimum Order Amount" hint="0 = no minimum.">
                <input type="number" value={minimumOrderAmount} onChange={(e) => setMinimumOrderAmount(e.target.value)} className={inputClass} placeholder="0" min="0" step="0.01" />
              </Field>
              <Field label="Maximum Discount" hint="For percentage type. Leave empty = no cap.">
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
            <h2 className="font-display text-lg font-bold text-ink-900">Schedule</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Start Date" hint="Optional. Empty = immediately available.">
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
              </Field>
              <Field label="End Date" hint="Optional. Empty = no expiry.">
                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </section>
        </div>

        <div className="space-y-5 xl:sticky xl:top-24 xl:self-start">
          <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
            <h2 className="font-display text-base font-bold text-ink-900">Status</h2>
            <label className="mt-4 flex cursor-pointer items-center gap-3">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-5 w-5 rounded border-ink-300 text-brand-600" />
              <span className="text-sm font-medium text-ink-700">Active</span>
            </label>
            <p className="mt-2 text-xs text-ink-400">Inactive promotions are never applied, even if within schedule.</p>
          </section>

          {message && <div className="flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 p-3 text-sm text-success-700"><CheckCircle2 size={16} />{message}</div>}
          {error && <div className="flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700"><AlertCircle size={16} />{error}</div>}

          <button type="button" onClick={handleSave} disabled={saving} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
            {saving ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Saving…</> : <><Save size={16} /> {isEdit ? 'Update Promotion' : 'Create Promotion'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}
