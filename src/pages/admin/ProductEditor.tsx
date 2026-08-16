import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Save,
  Eye,
  ArrowLeft,
  AlertCircle,
  GripVertical,
  Image as ImageIcon,
  Star,
  UploadCloud,
} from 'lucide-react';
import {
  fetchAllCategories,
  createProduct,
  updateProduct,
  syncFeatures,
  syncIncludes,
  syncFaqs,
  syncImages,
  fetchProductById,
  uploadProductImage,
  validateProductImage,
  deleteManagedProductImage,
  fetchProductDownloadLinks,
  syncDownloadLinks,
  ensureUniqueSlug,
  type ProductInput,
} from '@/services/admin';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { formatCurrency } from '@/lib/currency';
import type { CategoryRow } from '@/types/db';

const productTypes = [
  'digital_download',
  'license_key',
  'subscription',
  'manual_delivery',
  'service',
];

const deliveryTypes = [
  'digital_download',
  'license_key',
  'manual_delivery',
  'subscription',
  'service',
];

const statusOptions = ['draft', 'published', 'archived'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

type FeatureItem = string;
type IncludeItem = string;
type FaqItem = { question: string; answer: string };
type ImageItem = {
  key: string;
  id?: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  file?: File;
  preview_url?: string;
};

type EditorState = {
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  short_description: string;
  description: string;
  price: string;
  compare_at_price: string;
  product_type: string;
  delivery_type: string;
  version: string;
  compatibility: string;
  requirements: string;
  support_period: string;
  update_policy: string;
  delivery_description: string;
  status: string;
  featured: boolean;
  new_product: boolean;
  sort_order: string;
  seo_title: string;
  seo_description: string;
  thumbnail_url: string;
  icon: string;
  features: FeatureItem[];
  includes: IncludeItem[];
  faqs: FaqItem[];
  images: ImageItem[];
  download_links: DownloadLinkState[];
};

export type DownloadLinkState = {
  key: string;
  id?: string;
  title: string;
  download_url: string;
  version: string;
  sort_order: number;
  is_active: boolean;
};

const emptyState: EditorState = {
  name: '',
  slug: '',
  sku: '',
  category_id: '',
  short_description: '',
  description: '',
  price: '',
  compare_at_price: '',
  product_type: 'digital_download',
  delivery_type: 'digital_download',
  version: '',
  compatibility: '',
  requirements: '',
  support_period: '',
  update_policy: '',
  delivery_description: '',
  status: 'draft',
  featured: false,
  new_product: false,
  sort_order: '0',
  seo_title: '',
  seo_description: '',
  thumbnail_url: '',
  icon: 'Package',
  features: [],
  includes: [],
  faqs: [],
  images: [],
  download_links: [],
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6">
      <h3 className="mb-4 font-display text-base font-bold text-ink-900">{title}</h3>
      {children}
    </div>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
};

function Field({ label, children, required, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-ink-700">
        {label}
        {required && <span className="ml-0.5 text-error-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'h-10 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const textareaClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

type ProductEditorProps = {
  productId?: string;
};

export function ProductEditor({ productId }: ProductEditorProps) {
  const isEdit = !!productId;
  const { siteSettings } = useSiteSettings();
  const [state, setState] = useState<EditorState>(emptyState);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [primaryImageKey, setPrimaryImageKey] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const originalImageUrls = useRef<Set<string>>(new Set());
  const previewUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = previewUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    fetchAllCategories()
      .then(setCategories)
      .catch((err: unknown) => console.error('Failed to load categories', err));
  }, []);

  const loadProduct = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const product = await fetchProductById(productId);
      if (!product) {
        setSaveError('Product not found.');
        return;
      }
      
      const loadedLinks = await fetchProductDownloadLinks(productId);
      
      const loadedImages: ImageItem[] = product.images.map((img) => ({
        key: img.id,
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text ?? '',
        sort_order: img.sort_order,
      }));
      setState({
        name: product.name,
        slug: product.slug,
        sku: product.sku ?? '',
        category_id: product.category_id,
        short_description: product.short_description ?? '',
        description: product.description ?? '',
        price: String(product.price),
        compare_at_price:
          product.compare_at_price !== null ? String(product.compare_at_price) : '',
        product_type: product.product_type,
        delivery_type: product.delivery_type,
        version: product.version ?? '',
        compatibility: product.compatibility ?? '',
        requirements: product.requirements ?? '',
        support_period: product.support_period ?? '',
        update_policy: product.update_policy ?? '',
        delivery_description: product.delivery_description ?? '',
        status: product.status,
        featured: product.featured,
        new_product: product.new_product,
        sort_order: String(product.sort_order),
        seo_title: product.seo_title ?? '',
        seo_description: product.seo_description ?? '',
        thumbnail_url: product.thumbnail_url ?? '',
        icon: product.icon ?? 'Package',
        features: product.features.map((f) => f.feature),
        includes: product.includes.map((i) => i.item),
        faqs: product.faqs.map((f) => ({ question: f.question, answer: f.answer })),
        images: loadedImages,
        download_links: loadedLinks.map(l => ({
          key: l.id,
          id: l.id,
          title: l.title,
          download_url: l.download_url,
          version: l.version ?? '',
          sort_order: l.sort_order,
          is_active: l.is_active,
        })),
      });
      originalImageUrls.current = new Set(loadedImages.map((image) => image.image_url));
      setPrimaryImageKey(
        loadedImages.find((img) => img.image_url === product.thumbnail_url)?.key ?? null,
      );
    } catch (err: unknown) {
      console.error('Failed to load product', err);
      setSaveError('Failed to load product.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const update = useCallback(
    <K extends keyof EditorState>(key: K, value: EditorState[K]) => {
      setState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleNameChange = (value: string) => {
    update('name', value);
    if (!slugTouched) {
      update('slug', slugify(value));
    }
  };

  // Feature helpers
  const addFeature = () => update('features', [...state.features, '']);
  const updateFeature = (index: number, value: string) => {
    const next = [...state.features];
    next[index] = value;
    update('features', next);
  };
  const removeFeature = (index: number) => {
    update('features', state.features.filter((_, i) => i !== index));
  };
  const moveFeature = (index: number, dir: -1 | 1) => {
    const next = [...state.features];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    update('features', next);
  };

  // Include helpers
  const addInclude = () => update('includes', [...state.includes, '']);
  const updateInclude = (index: number, value: string) => {
    const next = [...state.includes];
    next[index] = value;
    update('includes', next);
  };
  const removeInclude = (index: number) => {
    update('includes', state.includes.filter((_, i) => i !== index));
  };
  const moveInclude = (index: number, dir: -1 | 1) => {
    const next = [...state.includes];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    update('includes', next);
  };

  // FAQ helpers
  const addFaq = () =>
    update('faqs', [...state.faqs, { question: '', answer: '' }]);
  const updateFaq = (index: number, key: 'question' | 'answer', value: string) => {
    const next = [...state.faqs];
    next[index] = { ...next[index], [key]: value };
    update('faqs', next);
  };
  const removeFaq = (index: number) => {
    update('faqs', state.faqs.filter((_, i) => i !== index));
  };
  const moveFaq = (index: number, dir: -1 | 1) => {
    const next = [...state.faqs];
    const swap = index + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    update('faqs', next);
  };

  // Image helpers
  const addImage = () =>
    update('images', [
      ...state.images,
      {
        key: crypto.randomUUID(),
        image_url: '',
        alt_text: state.name,
        sort_order: state.images.length,
      },
    ]);
  const updateImage = (
    index: number,
    key: 'image_url' | 'alt_text' | 'sort_order',
    value: string,
  ) => {
    const next = [...state.images];
    next[index] = {
      ...next[index],
      [key]: key === 'sort_order' ? (value === '' ? 0 : Number(value)) : value,
    };
    update('images', next);
  };
  const removeImage = (index: number) => {
    const removed = state.images[index];
    if (removed.preview_url) {
      URL.revokeObjectURL(removed.preview_url);
      previewUrls.current.delete(removed.preview_url);
    }
    const next = state.images
      .filter((_, i) => i !== index)
      .map((image, sortOrder) => ({ ...image, sort_order: sortOrder }));
    update('images', next);
    if (removed.key === primaryImageKey || removed.image_url === state.thumbnail_url) {
      const replacement = next[0];
      setPrimaryImageKey(replacement?.key ?? null);
      update('thumbnail_url', replacement && !replacement.file ? replacement.image_url : '');
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const swap = index + direction;
    if (swap < 0 || swap >= state.images.length) return;
    const next = [...state.images];
    [next[index], next[swap]] = [next[swap], next[index]];
    update(
      'images',
      next.map((image, sortOrder) => ({ ...image, sort_order: sortOrder })),
    );
  };

  const setAsThumbnail = (image: ImageItem) => {
    setPrimaryImageKey(image.key);
    update('thumbnail_url', image.file ? '' : image.image_url);
  };

  const addFiles = (files: File[]) => {
    setImageError(null);
    const errors = files.map(validateProductImage).filter(Boolean) as string[];
    if (errors.length > 0) {
      setImageError(errors.join(' '));
    }
    const validFiles = files.filter((file) => !validateProductImage(file));
    if (validFiles.length === 0) return;

    const additions: ImageItem[] = validFiles.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return {
        key: crypto.randomUUID(),
        image_url: '',
        alt_text: state.name || file.name.replace(/\.[^.]+$/, ''),
        sort_order: state.images.length + index,
        file,
        preview_url: previewUrl,
      };
    });
    update('images', [...state.images, ...additions]);
    if (!state.thumbnail_url && !primaryImageKey) {
      setPrimaryImageKey(additions[0].key);
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!state.name.trim()) e.name = 'Product name is required.';
    if (!state.slug.trim()) e.slug = 'Slug is required.';
    if (!state.category_id) e.category_id = 'Category is required.';
    if (state.price === '' || isNaN(Number(state.price))) {
      e.price = 'Price is required.';
    } else if (Number(state.price) < 0) {
      e.price = 'Price cannot be negative.';
    }
    if (state.compare_at_price !== '' && Number(state.compare_at_price) < 0) {
      e.compare_at_price = 'Compare-at price cannot be negative.';
    }
    if (!state.product_type) e.product_type = 'Product type is required.';
    if (!state.delivery_type) e.delivery_type = 'Delivery type is required.';
    if (state.delivery_type === 'digital_download') {
      state.download_links.forEach((link, idx) => {
        if (!link.title.trim()) {
          e[`download_link_${idx}_title`] = 'Title is required.';
        }
        if (!link.download_url.trim()) {
          e[`download_link_${idx}_url`] = 'URL is required.';
        } else {
          try {
            const url = new URL(link.download_url);
            if (url.protocol !== 'https:') {
              e[`download_link_${idx}_url`] = 'URL must use HTTPS.';
            }
          } catch {
            e[`download_link_${idx}_url`] = 'Invalid URL format.';
          }
        }
      });
    }
    if (!state.status) e.status = 'Status is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const buildInput = async (): Promise<ProductInput> => {
    let slug = state.slug.trim();
    if (!productId && !savedId) {
      slug = await ensureUniqueSlug(slug);
    }
    const selectedImage = state.images.find((image) => image.key === primaryImageKey);
    return {
      name: state.name.trim(),
      slug,
      sku: state.sku.trim() || null,
      short_description: state.short_description.trim() || null,
      description: state.description.trim() || null,
      category_id: state.category_id,
      price: Number(state.price),
      compare_at_price:
        state.compare_at_price === '' ? null : Number(state.compare_at_price),
      thumbnail_url: selectedImage?.file ? null : state.thumbnail_url.trim() || null,
      icon: state.icon || 'Package',
      product_type: state.product_type,
      delivery_type: state.delivery_type,
      status: state.status,
      featured: state.featured,
      new_product: state.new_product,
      version: state.version.trim() || null,
      compatibility: state.compatibility.trim() || null,
      requirements: state.requirements.trim() || null,
      support_period: state.support_period.trim() || null,
      update_policy: state.update_policy.trim() || null,
      delivery_description: state.delivery_description.trim() || null,
      seo_title: state.seo_title.trim() || null,
      seo_description: state.seo_description.trim() || null,
      sort_order: Number(state.sort_order) || 0,
    };
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaveError(null);
    setImageError(null);
    setUploadStatus(null);
    const newlyUploadedUrls: string[] = [];
    let persistedProductId = productId ?? savedId;
    try {
      const input = await buildInput();
      let resultId: string;

      const existingId = productId ?? savedId;
      if (existingId) {
        const updated = await updateProduct(existingId, input);
        resultId = updated.id;
      } else {
        const created = await createProduct(input);
        resultId = created.id;
      }
      persistedProductId = resultId;

      const resolvedImages: ImageItem[] = [];
      for (let index = 0; index < state.images.length; index += 1) {
        const image = state.images[index];
        if (!image.file) {
          resolvedImages.push({ ...image, sort_order: index });
          continue;
        }
        setUploadStatus(`Uploading image ${index + 1} of ${state.images.length}…`);
        const uploaded = await uploadProductImage(resultId, image.file);
        newlyUploadedUrls.push(uploaded.imageUrl);
        resolvedImages.push({
          key: image.key,
          image_url: uploaded.imageUrl,
          alt_text: image.alt_text,
          sort_order: index,
        });
      }

      const selected = resolvedImages.find((image) => image.key === primaryImageKey);
      const finalThumbnail =
        selected?.image_url || input.thumbnail_url || resolvedImages[0]?.image_url || null;

      if (finalThumbnail !== input.thumbnail_url) {
        await updateProduct(resultId, { thumbnail_url: finalThumbnail });
      }

      await Promise.all([
        syncFeatures(resultId, state.features.filter((f) => f.trim() !== '')),
        syncIncludes(resultId, state.includes.filter((i) => i.trim() !== '')),
        syncFaqs(
          resultId,
          state.faqs.filter((f) => f.question.trim() && f.answer.trim()),
        ),
        syncImages(
          resultId,
          resolvedImages
            .filter((img) => img.image_url.trim() !== '')
            .map((img, i) => ({
              image_url: img.image_url,
              alt_text: img.alt_text || null,
              sort_order: img.sort_order ?? i,
            })),
        ),
        syncDownloadLinks(
          resultId,
          state.download_links.filter(l => l.title.trim() !== '' && l.download_url.trim() !== '')
        ),
      ]);

      const finalUrls = new Set(resolvedImages.map((image) => image.image_url));
      const removedUrls = [...originalImageUrls.current].filter((url) => !finalUrls.has(url));
      const cleanupResults = await Promise.allSettled(
        removedUrls.map((url) => deleteManagedProductImage(url, resultId)),
      );
      if (cleanupResults.some((result) => result.status === 'rejected')) {
        setImageError('Product saved, but one managed Storage file could not be removed.');
      }

      state.images.forEach((image) => {
        if (image.preview_url) {
          URL.revokeObjectURL(image.preview_url);
          previewUrls.current.delete(image.preview_url);
        }
      });
      originalImageUrls.current = new Set(finalUrls);
      setState((current) => ({
        ...current,
        thumbnail_url: finalThumbnail ?? '',
        images: resolvedImages,
      }));
      setPrimaryImageKey(
        resolvedImages.find((image) => image.image_url === finalThumbnail)?.key ?? null,
      );

      setSavedId(resultId);
    } catch (err: unknown) {
      console.error('Save failed', err);
      if (persistedProductId) {
        await Promise.allSettled(
          newlyUploadedUrls.map((url) =>
            deleteManagedProductImage(url, persistedProductId!),
          ),
        );
      }
      const detail = err instanceof Error ? err.message : '';
      setSaveError(
        detail || 'Failed to save product. Please check your input and try again.',
      );
    } finally {
      setSaving(false);
      setUploadStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/admin/products"
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-800"
          >
            <ArrowLeft size={16} />
            Back to products
          </Link>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {isEdit ? 'Edit Product' : 'New Product'}
          </h1>
        </div>
        <div className="flex items-center gap-2.5">
          {savedId && (
            <a
              href={`/products/${state.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
            >
              <Eye size={16} />
              View Product
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving…
              </span>
            ) : (
              <>
                <Save size={16} />
                {isEdit ? 'Save Changes' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
          <AlertCircle size={16} />
          {saveError}
        </div>
      )}

      {savedId && !saveError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700">
          Product saved successfully.
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {/* GENERAL */}
        <Section title="General">
          <div className="flex flex-col gap-4">
            <Field label="Product Name" required>
              <input
                type="text"
                value={state.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
                placeholder="My Digital Product"
              />
              {errors.name && (
                <span className="text-xs text-error-600">{errors.name}</span>
              )}
            </Field>
            <Field label="Slug" required>
              <input
                type="text"
                value={state.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update('slug', slugify(e.target.value));
                }}
                className={inputClass}
                placeholder="my-digital-product"
              />
              {errors.slug && (
                <span className="text-xs text-error-600">{errors.slug}</span>
              )}
            </Field>
            <Field label="SKU">
              <input
                type="text"
                value={state.sku}
                onChange={(e) => update('sku', e.target.value)}
                className={inputClass}
                placeholder="SKU-001"
              />
            </Field>
            <Field label="Category" required>
              <select
                value={state.category_id}
                onChange={(e) => update('category_id', e.target.value)}
                className={inputClass}
              >
                <option value="">Select a category…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <span className="text-xs text-error-600">{errors.category_id}</span>
              )}
            </Field>
            <Field label="Short Description">
              <textarea
                value={state.short_description}
                onChange={(e) => update('short_description', e.target.value)}
                className={textareaClass}
                rows={2}
                placeholder="A brief summary shown in product cards"
              />
            </Field>
            <Field label="Full Description">
              <textarea
                value={state.description}
                onChange={(e) => update('description', e.target.value)}
                className={textareaClass}
                rows={5}
                placeholder="Full product description"
              />
            </Field>
          </div>
        </Section>

        {/* PRICING + CONFIG */}
        <div className="flex flex-col gap-5">
          <Section title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <Field label={`Price (${siteSettings.currency_symbol} / ${siteSettings.currency_code})`} required>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.price}
                  onChange={(e) => update('price', e.target.value)}
                  className={inputClass}
                  placeholder="49.00"
                />
                {errors.price && (
                  <span className="text-xs text-error-600">{errors.price}</span>
                )}
                {state.price !== '' && !Number.isNaN(Number(state.price)) && (
                  <span className="text-xs text-ink-400">
                    Display: {formatCurrency(Number(state.price), siteSettings)}
                  </span>
                )}
              </Field>
              <Field label="Compare-at Price">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={state.compare_at_price}
                  onChange={(e) => update('compare_at_price', e.target.value)}
                  className={inputClass}
                  placeholder="69.00"
                />
                {errors.compare_at_price && (
                  <span className="text-xs text-error-600">{errors.compare_at_price}</span>
                )}
              </Field>
            </div>
          </Section>

          <Section title="Product Configuration">
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Product Type" required>
                  <select
                    value={state.product_type}
                    onChange={(e) => update('product_type', e.target.value)}
                    className={inputClass}
                  >
                    {productTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Delivery Type" required>
                  <select
                    value={state.delivery_type}
                    onChange={(e) => update('delivery_type', e.target.value)}
                    className={inputClass}
                  >
                    {deliveryTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Version">
                <input
                  type="text"
                  value={state.version}
                  onChange={(e) => update('version', e.target.value)}
                  className={inputClass}
                  placeholder="1.0.0"
                />
              </Field>
              <Field label="Compatibility">
                <input
                  type="text"
                  value={state.compatibility}
                  onChange={(e) => update('compatibility', e.target.value)}
                  className={inputClass}
                  placeholder="WordPress 6.0+, PHP 8.0+"
                />
              </Field>
              <Field label="Requirements">
                <input
                  type="text"
                  value={state.requirements}
                  onChange={(e) => update('requirements', e.target.value)}
                  className={inputClass}
                  placeholder="Node.js 18+, npm"
                />
              </Field>
              <Field label="Support Period">
                <input
                  type="text"
                  value={state.support_period}
                  onChange={(e) => update('support_period', e.target.value)}
                  className={inputClass}
                  placeholder="6 months"
                />
              </Field>
              <Field label="Update Policy">
                <input
                  type="text"
                  value={state.update_policy}
                  onChange={(e) => update('update_policy', e.target.value)}
                  className={inputClass}
                  placeholder="Lifetime updates"
                />
              </Field>
              <Field label="Delivery Description">
                <textarea
                  value={state.delivery_description}
                  onChange={(e) => update('delivery_description', e.target.value)}
                  className={textareaClass}
                  rows={2}
                  placeholder="Instant download after purchase"
                />
              </Field>
            </div>
          </Section>

          {state.delivery_type === 'digital_download' ? (
            <Section title="Digital Download Links">
              <p className="mb-4 text-sm text-ink-500">Configure external download links (e.g. Google Drive, Dropbox, Mega) for this digital product.</p>
              
              <div className="flex flex-col gap-4">
                {state.download_links.map((link, idx) => (
                  <div key={link.key} className="relative rounded-xl border border-ink-200 bg-ink-50 p-4 pt-5">
                    <button
                      type="button"
                      onClick={() =>
                        setState((cur) => ({
                          ...cur,
                          download_links: cur.download_links.filter((_, i) => i !== idx),
                        }))
                      }
                      className="absolute right-3 top-3 rounded-md p-1.5 text-ink-400 hover:bg-error-50 hover:text-error-600"
                    >
                      <Trash2 size={16} />
                    </button>
                    
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Title" required>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setState((cur) => ({
                              ...cur,
                              download_links: cur.download_links.map((l, i) =>
                                i === idx ? { ...l, title: val } : l
                              ),
                            }));
                          }}
                          placeholder="e.g. Main Download, Windows Version"
                          className={inputClass}
                        />
                        {errors[`download_link_${idx}_title`] && (
                          <span className="text-xs text-error-600">{errors[`download_link_${idx}_title`]}</span>
                        )}
                      </Field>
                      
                      <Field label="Download URL" required>
                        <input
                          type="url"
                          value={link.download_url}
                          onChange={(e) => {
                            const val = e.target.value;
                            setState((cur) => ({
                              ...cur,
                              download_links: cur.download_links.map((l, i) =>
                                i === idx ? { ...l, download_url: val } : l
                              ),
                            }));
                          }}
                          placeholder="https://..."
                          className={inputClass}
                        />
                        {errors[`download_link_${idx}_url`] && (
                          <span className="text-xs text-error-600">{errors[`download_link_${idx}_url`]}</span>
                        )}
                      </Field>

                      <Field label="Version">
                        <input
                          type="text"
                          value={link.version}
                          onChange={(e) => {
                            const val = e.target.value;
                            setState((cur) => ({
                              ...cur,
                              download_links: cur.download_links.map((l, i) =>
                                i === idx ? { ...l, version: val } : l
                              ),
                            }));
                          }}
                          placeholder="e.g. 1.0.0"
                          className={inputClass}
                        />
                      </Field>
                      
                      <div className="flex items-end justify-between gap-4">
                        <Field label="Sort Order">
                          <input
                            type="number"
                            min="0"
                            value={link.sort_order}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              setState((cur) => ({
                                ...cur,
                                download_links: cur.download_links.map((l, i) =>
                                  i === idx ? { ...l, sort_order: val } : l
                                ),
                              }));
                            }}
                            className={inputClass}
                          />
                        </Field>
                        
                        <label className="flex h-10 cursor-pointer items-center gap-2">
                          <input
                            type="checkbox"
                            checked={link.is_active}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setState((cur) => ({
                                ...cur,
                                download_links: cur.download_links.map((l, i) =>
                                  i === idx ? { ...l, is_active: val } : l
                                ),
                              }));
                            }}
                            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-sm font-semibold text-ink-700">Active</span>
                        </label>
                      </div>
                    </div>

                    {link.download_url && (
                      <div className="mt-4 border-t border-ink-200 pt-3">
                        <a 
                          href={link.download_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          <Eye size={14} /> Test Link
                        </a>
                      </div>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() =>
                    setState((cur) => ({
                      ...cur,
                      download_links: [
                        ...cur.download_links,
                        {
                          key: crypto.randomUUID(),
                          title: '',
                          download_url: '',
                          version: '',
                          sort_order: cur.download_links.length,
                          is_active: true,
                        },
                      ],
                    }))
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink-200 p-4 text-sm font-semibold text-ink-500 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                >
                  <Plus size={18} />
                  Add Download Link
                </button>
              </div>
            </Section>
          ) : (
            <Section title="Digital Download Links">
              <p className="text-sm text-ink-500">
                Change Delivery Type to <strong className="font-medium text-ink-700">digital_download</strong> to manage external download links.
              </p>
            </Section>
          )}
        </div>

        {/* PUBLISHING */}
        <Section title="Publishing">
          <div className="flex flex-col gap-4">
            <Field label="Status" required>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => update('status', s)}
                    className={`h-10 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                      state.status === s
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-ink-200 bg-white text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.status && (
                <span className="text-xs text-error-600">{errors.status}</span>
              )}
            </Field>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-700">
                <input
                  type="checkbox"
                  checked={state.featured}
                  onChange={(e) => update('featured', e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                Featured
              </label>
              <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-700">
                <input
                  type="checkbox"
                  checked={state.new_product}
                  onChange={(e) => update('new_product', e.target.checked)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                New Product
              </label>
            </div>
            <Field label="Sort Order">
              <input
                type="number"
                value={state.sort_order}
                onChange={(e) => update('sort_order', e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </Field>
          </div>
        </Section>

        {/* SEO */}
        <Section title="SEO">
          <div className="flex flex-col gap-4">
            <Field label="SEO Title">
              <input
                type="text"
                value={state.seo_title}
                onChange={(e) => update('seo_title', e.target.value)}
                className={inputClass}
                placeholder="My Digital Product — bdBeginner"
              />
            </Field>
            <Field label="SEO Description">
              <textarea
                value={state.seo_description}
                onChange={(e) => update('seo_description', e.target.value)}
                className={textareaClass}
                rows={3}
                placeholder="Meta description for search engines"
              />
            </Field>
          </div>
        </Section>
      </div>

      {/* FEATURES */}
      <div className="mt-5">
        <Section title="Product Features">
          <div className="flex flex-col gap-3">
            {state.features.length === 0 && (
              <p className="text-sm text-ink-400">No features added yet.</p>
            )}
            {state.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical size={18} className="text-ink-300" />
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 24/7 email support"
                />
                <button
                  onClick={() => moveFeature(i, -1)}
                  disabled={i === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-30"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => moveFeature(i, 1)}
                  disabled={i === state.features.length - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-30"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => removeFeature(i)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-error-50 hover:text-error-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addFeature}
              className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
            >
              <Plus size={16} />
              Add Feature
            </button>
          </div>
        </Section>
      </div>

      {/* WHAT'S INCLUDED */}
      <div className="mt-5">
        <Section title="What's Included">
          <div className="flex flex-col gap-3">
            {state.includes.length === 0 && (
              <p className="text-sm text-ink-400">No items added yet.</p>
            )}
            {state.includes.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <GripVertical size={18} className="text-ink-300" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateInclude(i, e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Source files"
                />
                <button
                  onClick={() => moveInclude(i, -1)}
                  disabled={i === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-30"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => moveInclude(i, 1)}
                  disabled={i === state.includes.length - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-30"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => removeInclude(i)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-error-50 hover:text-error-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={addInclude}
              className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
            >
              <Plus size={16} />
              Add Item
            </button>
          </div>
        </Section>
      </div>

      {/* FAQ */}
      <div className="mt-5">
        <Section title="FAQ">
          <div className="flex flex-col gap-4">
            {state.faqs.length === 0 && (
              <p className="text-sm text-ink-400">No FAQs added yet.</p>
            )}
            {state.faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-ink-100 bg-ink-50/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-400">
                    FAQ {i + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveFaq(i, -1)}
                      disabled={i === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-30"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveFaq(i, 1)}
                      disabled={i === state.faqs.length - 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 disabled:opacity-30"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => removeFaq(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-error-50 hover:text-error-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(i, 'question', e.target.value)}
                  className={inputClass}
                  placeholder="Question"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(i, 'answer', e.target.value)}
                  className={`${textareaClass} mt-2`}
                  rows={2}
                  placeholder="Answer"
                />
              </div>
            ))}
            <button
              onClick={addFaq}
              className="inline-flex h-9 items-center gap-2 self-start rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
            >
              <Plus size={16} />
              Add FAQ
            </button>
          </div>
        </Section>
      </div>

      {/* IMAGES */}
      <div className="mt-5">
        <Section title="Product Images">
          <div className="flex flex-col gap-4">
            <div
              onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                addFiles(Array.from(event.dataTransfer.files));
              }}
              className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
                dragActive ? 'border-brand-400 bg-brand-50' : 'border-ink-200 bg-ink-50/50'
              }`}
            >
              <UploadCloud className="mx-auto text-brand-600" size={30} />
              <p className="mt-2 text-sm font-semibold text-ink-800">Drop product images here</p>
              <p className="mt-1 text-xs text-ink-500">JPG, PNG, or WebP · maximum 5 MB each</p>
              <label className="mt-4 inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
                Choose files
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    addFiles(Array.from(event.target.files ?? []));
                    event.target.value = '';
                  }}
                />
              </label>
            </div>

            {uploadStatus && (
              <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
                {uploadStatus}
              </div>
            )}
            {imageError && (
              <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
                <AlertCircle className="mt-0.5 shrink-0" size={16} /> {imageError}
              </div>
            )}

            <Field label="Thumbnail URL" className="border-t border-ink-100 pt-4">
              <input
                type="url"
                value={state.thumbnail_url}
                onChange={(e) => {
                  update('thumbnail_url', e.target.value);
                  setPrimaryImageKey(null);
                }}
                className={inputClass}
                placeholder="Optional external image URL"
              />
              <span className="text-xs text-ink-400">Selecting a gallery image as primary updates this automatically after save.</span>
            </Field>
            <div className="border-t border-ink-100 pt-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-700">Gallery Images</p>
                <button
                  type="button"
                  onClick={addImage}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-600 transition-colors hover:bg-ink-50"
                >
                  <Plus size={16} /> Add external URL
                </button>
              </div>
              {state.images.length === 0 && (
                <div className="flex min-h-28 flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 text-ink-400">
                  <ImageIcon size={24} />
                  <p className="mt-2 text-sm">No gallery images added yet.</p>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {state.images.map((img, i) => (
                  <div
                    key={img.key}
                    className={`grid grid-cols-1 gap-3 rounded-xl border p-3 sm:grid-cols-12 ${
                      primaryImageKey === img.key || (!primaryImageKey && state.thumbnail_url === img.image_url)
                        ? 'border-brand-300 bg-brand-50/40'
                        : 'border-ink-100 bg-ink-50/50'
                    }`}
                  >
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-white sm:col-span-2">
                      <ImageWithFallback
                        src={img.preview_url || img.image_url}
                        alt={img.alt_text || state.name || 'Product image'}
                        className="h-full w-full object-cover"
                        fallback={<ImageIcon className="text-ink-300" size={24} />}
                      />
                    </div>
                    <div className="flex flex-col gap-2 sm:col-span-6">
                      <input
                        type="url"
                        value={img.image_url}
                        onChange={(e) => updateImage(i, 'image_url', e.target.value)}
                        className={inputClass}
                        placeholder={img.file ? img.file.name : 'Image URL'}
                        disabled={!!img.file}
                      />
                      <input
                        type="text"
                        value={img.alt_text}
                        onChange={(e) => updateImage(i, 'alt_text', e.target.value)}
                        className={inputClass}
                        placeholder="Alt text"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1 sm:col-span-4">
                      <button type="button" onClick={() => setAsThumbnail(img)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink-200 bg-white px-2.5 text-xs font-semibold text-ink-600 hover:border-brand-200 hover:text-brand-700" title="Set as thumbnail">
                        <Star size={14} className={primaryImageKey === img.key || (!primaryImageKey && state.thumbnail_url === img.image_url) ? 'fill-warning-400 text-warning-500' : ''} /> Primary
                      </button>
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-white disabled:opacity-30" title="Move up"><ArrowUp size={16} /></button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === state.images.length - 1} className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-white disabled:opacity-30" title="Move down"><ArrowDown size={16} /></button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-error-50 hover:text-error-700"
                        title="Remove image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Bottom save bar */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving…
            </span>
          ) : (
            <>
              <Save size={16} />
              {isEdit || savedId ? 'Save Changes' : 'Create Product'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
