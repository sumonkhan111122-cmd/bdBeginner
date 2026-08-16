import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Power, X, Save, AlertCircle } from 'lucide-react';
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  countProductsInCategory,
} from '@/services/admin';
import type { CategoryRow } from '@/types/db';

const inputClass =
  'h-10 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const textareaClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

type FormState = {
  name: string;
  slug: string;
  description: string;
  sort_order: string;
  is_active: boolean;
};

const emptyForm: FormState = {
  name: '',
  slug: '',
  description: '',
  sort_order: '0',
  is_active: true,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setCategories(await fetchAllCategories());
    } catch (err: unknown) {
      console.error('Failed to load categories', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
    setMessage(null);
  };

  const openEdit = (category: CategoryRow) => {
    setEditing(category);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      sort_order: String(category.sort_order),
      is_active: category.is_active,
    });
    setFormOpen(true);
    setMessage(null);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setSaving(true);
    setMessage(null);
    try {
      const input = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        sort_order: Number(form.sort_order) || 0,
        is_active: form.is_active,
      };
      if (editing) {
        await updateCategory(editing.id, input);
        setMessage('Category updated successfully.');
      } else {
        await createCategory(input);
        setMessage('Category created successfully.');
      }
      setFormOpen(false);
      await load();
    } catch (err: unknown) {
      console.error('Category save failed', err);
      setMessage('Could not save this category. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (category: CategoryRow) => {
    setMessage(null);
    try {
      if (category.is_active) {
        const count = await countProductsInCategory(category.id);
        if (count > 0) {
          setMessage(`This category has ${count} product${count === 1 ? '' : 's'}. It was deactivated instead of deleted.`);
        }
      }
      await updateCategory(category.id, { is_active: !category.is_active });
      await load();
    } catch (err: unknown) {
      console.error('Category status update failed', err);
      setMessage('Could not update this category. Please try again.');
    }
  };

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Categories</h1>
          <p className="mt-1 text-sm text-ink-500">Organize your product catalog</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          <AlertCircle size={16} />
          {message}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-error-700">Failed to load categories.</p>
            <button onClick={load} className="mt-3 text-sm font-semibold text-brand-600">Try again</button>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-sm text-ink-500">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-100 text-left text-xs font-semibold uppercase tracking-wider text-ink-400">
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Slug</th>
                  <th className="px-5 py-3">Sort Order</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {categories.map((category) => (
                  <tr key={category.id} className="transition-colors hover:bg-ink-50/50">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-ink-800">{category.name}</p>
                      <p className="max-w-sm truncate text-xs text-ink-400">{category.description || 'No description'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink-500">{category.slug}</td>
                    <td className="px-5 py-3.5 text-ink-600">{category.sort_order}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${category.is_active ? 'border-success-200 bg-success-50 text-success-700' : 'border-ink-200 bg-ink-100 text-ink-600'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(category)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800" title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => toggleActive(category)} className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-800" title={category.is_active ? 'Deactivate' : 'Activate'}>
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8">
          <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <form onSubmit={save} className="relative w-full max-w-lg rounded-2xl border border-ink-100 bg-white p-6 shadow-floating">
            <button type="button" onClick={() => setFormOpen(false)} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50" aria-label="Close">
              <X size={18} />
            </button>
            <h2 className="font-display text-xl font-bold text-ink-900">{editing ? 'Edit Category' : 'Add Category'}</h2>
            <div className="mt-5 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-700">
                Name<span className="text-error-500">*</span>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: editing ? f.slug : slugify(e.target.value) }))} className={inputClass} placeholder="Digital Resources" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-700">
                Slug<span className="text-error-500">*</span>
                <input required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))} className={inputClass} placeholder="digital-resources" />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-700">
                Description
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={textareaClass} rows={3} />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-700">
                  Sort Order
                  <input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} className={inputClass} />
                </label>
                <label className="flex items-center gap-2.5 self-end pb-2 text-sm font-semibold text-ink-700">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setFormOpen(false)} className="h-10 rounded-xl border border-ink-200 px-4 text-sm font-semibold text-ink-700 hover:bg-ink-50">Cancel</button>
              <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
                <Save size={16} />
                {saving ? 'Saving…' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
