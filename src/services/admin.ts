import { getSupabase } from '@/lib/supabase';
import { getOrderStatus } from '@/lib/orders';
import type { OrderRow } from '@/types/orders';
import type {
  CategoryRow,
  ProductRow,
  ProductImageRow,
  ProductFeatureRow,
  ProductIncludeRow,
  ProductFaqRow,
} from '@/types/db';

export type AdminProduct = ProductRow & {
  categories: CategoryRow | CategoryRow[] | null;
};

export type AdminProductWithRelations = AdminProduct & {
  images: ProductImageRow[];
  features: ProductFeatureRow[];
  includes: ProductIncludeRow[];
  faqs: ProductFaqRow[];
};

export type OrderEmailLogRow = {
  id: string;
  order_id: string;
  event_type: string;
  recipient_email: string;
  provider: string;
  provider_message_id: string | null;
  status: 'sent' | 'failed' | 'pending';
  error_message: string | null;
  attachment: string | null;
  created_at: string;
  updated_at?: string;
};

function unwrapCategory(
  value: CategoryRow | CategoryRow[] | null,
): CategoryRow | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export type CatalogIssue = {
  id: string;
  name: string;
  type: 'product' | 'category';
  issue: string;
  actionLabel: string;
  actionUrl: string;
};

export type DashboardStats = {
  orders: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    pendingManualPayments: number;
  };
  reviews: {
    pending: number;
  };
  products: {
    total: number;
    published: number;
    draft: number;
    archived: number;
  };
  categories: {
    total: number;
    active: number;
    inactive: number;
    distribution: { id: string; name: string; count: number; isActive: boolean }[];
  };
  health: {
    missingThumbnail: number;
    missingSeoTitle: number;
    missingSeoDescription: number;
    missingShortDescription: number;
    missingCategory: number;
    missingDelivery: number;
    missingFeatures: number;
    missingFaqs: number;
  };
  attentionRequired: CatalogIssue[];
  recentProducts: {
    id: string;
    name: string;
    slug: string;
    status: string;
    updated_at: string;
    price: number;
    categoryName: string | null;
  }[];
  storeStatus: {
    maintenanceMode: boolean;
    announcementEnabled: boolean;
    supportButtonEnabled: boolean;
  };
  seoHealth: {
    indexingEnabled: boolean;
    gscConfigured: boolean;
    ga4Configured: boolean;
    gtmConfigured: boolean;
    missingSeoTitlePublished: number;
    missingSeoDescPublished: number;
    missingOgImagePublished: number;
  };
  media: {
    totalImages: number;
    productsWithThumbnail: number;
    productsMissingThumbnail: number;
  };
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const sb = getSupabase();
  const [productsRes, categoriesRes, imagesRes, siteRes, seoRes, ordersRes, pendingTxnsRes, pendingReviewsRes] = await Promise.all([
    sb.from('products').select('id, name, slug, status, updated_at, featured, thumbnail_url, seo_title, seo_description, short_description, delivery_description, category_id, price, product_features(id), product_faqs(id)'),
    sb.from('categories').select('*'),
    sb.from('product_images').select('id', { count: 'exact', head: true }),
    sb.from('site_settings').select('*').maybeSingle(),
    sb.from('seo_settings').select('*').maybeSingle(),
    sb.from('orders').select('*'),
    sb.from('payment_transactions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    sb.from('product_reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ]);

  if (productsRes.error) throw productsRes.error;
  if (categoriesRes.error) throw categoriesRes.error;
  if (ordersRes.error) throw ordersRes.error;
  if (pendingTxnsRes.error) throw pendingTxnsRes.error;
  if (pendingReviewsRes.error) throw pendingReviewsRes.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const products = (productsRes.data || []) as any[];
  const categories = (categoriesRes.data || []) as CategoryRow[];
  const siteSettings = siteRes.data || {};
  const seoSettings = seoRes.data || {};
  const orders = (ordersRes.data ?? []) as OrderRow[];

  const issues: CatalogIssue[] = [];
  
  let missingThumbnail = 0;
  let missingSeoTitle = 0;
  let missingSeoDescription = 0;
  let missingShortDescription = 0;
  let missingCategory = 0;
  let missingDelivery = 0;
  let missingFeatures = 0;
  let missingFaqs = 0;
  
  let missingSeoTitlePublished = 0;
  let missingSeoDescPublished = 0;
  let missingOgImagePublished = 0;
  let productsWithThumbnail = 0;
  let productsMissingThumbnail = 0;

  products.forEach(p => {
    const isPublished = p.status === 'published';
    const isDraft = p.status === 'draft';
    
    if (!p.thumbnail_url) {
      missingThumbnail++;
      productsMissingThumbnail++;
      if (issues.length < 10) issues.push({ id: p.id, name: p.name, type: 'product', issue: 'Missing thumbnail', actionLabel: 'Edit Product', actionUrl: `/admin/products/${p.id}/edit` });
    } else {
      productsWithThumbnail++;
    }
    
    if (!p.seo_title) {
      missingSeoTitle++;
      if (isPublished) missingSeoTitlePublished++;
      if (issues.length < 10 && isPublished) issues.push({ id: p.id, name: p.name, type: 'product', issue: 'Missing SEO title', actionLabel: 'Review SEO', actionUrl: `/admin/products/${p.id}/edit` });
    }
    
    if (!p.seo_description) {
      missingSeoDescription++;
      if (isPublished) missingSeoDescPublished++;
      if (issues.length < 10 && isPublished) issues.push({ id: p.id, name: p.name, type: 'product', issue: 'Missing SEO description', actionLabel: 'Review SEO', actionUrl: `/admin/products/${p.id}/edit` });
    }
    
    if (!p.thumbnail_url && isPublished) {
      missingOgImagePublished++;
    }
    
    if (!p.short_description) missingShortDescription++;
    
    if (!p.category_id) {
       missingCategory++;
       if (issues.length < 10) issues.push({ id: p.id, name: p.name, type: 'product', issue: 'Missing category', actionLabel: 'Edit Product', actionUrl: `/admin/products/${p.id}/edit` });
    }
    
    if (!p.delivery_description) {
       missingDelivery++;
       if (issues.length < 10 && isPublished) issues.push({ id: p.id, name: p.name, type: 'product', issue: 'Missing delivery info', actionLabel: 'Edit Product', actionUrl: `/admin/products/${p.id}/edit` });
    }
    
    if (!p.product_features || p.product_features.length === 0) missingFeatures++;
    if (!p.product_faqs || p.product_faqs.length === 0) missingFaqs++;
    
    if (isDraft && issues.length < 10) {
       issues.push({ id: p.id, name: p.name, type: 'product', issue: 'Draft awaiting publication', actionLabel: 'Review Product', actionUrl: `/admin/products/${p.id}/edit` });
    }
  });

  const uniqueIssues = Array.from(new Map(issues.map(item => [item.id + item.issue, item])).values()).slice(0, 6);

  const distribution = categories.map(c => {
    const count = products.filter(p => p.category_id === c.id).length;
    if (count > 0 && !c.is_active && uniqueIssues.length < 6) {
      uniqueIssues.push({ id: c.id, name: c.name, type: 'category', issue: 'Category inactive while containing products', actionLabel: 'View Category', actionUrl: '/admin/categories' });
    }
    return {
      id: c.id,
      name: c.name,
      count,
      isActive: c.is_active
    };
  }).sort((a, b) => b.count - a.count);

  const recentProducts = [...products]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 8)
    .map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      updated_at: p.updated_at,
      price: p.price,
      categoryName: categories.find(c => c.id === p.category_id)?.name || null
    }));

  return {
    orders: {
      total: orders.length,
      pending: orders.filter(order => getOrderStatus(order) === 'pending').length,
      processing: orders.filter(order => getOrderStatus(order) === 'processing').length,
      completed: orders.filter(order => getOrderStatus(order) === 'completed').length,
      pendingManualPayments: pendingTxnsRes.count || 0,
    },
    reviews: {
      pending: pendingReviewsRes.count || 0,
    },
    products: {
      total: products.length,
      published: products.filter(p => p.status === 'published').length,
      draft: products.filter(p => p.status === 'draft').length,
      archived: products.filter(p => p.status === 'archived').length,
    },
    categories: {
      total: categories.length,
      active: categories.filter(c => c.is_active).length,
      inactive: categories.filter(c => !c.is_active).length,
      distribution
    },
    health: {
      missingThumbnail, missingSeoTitle, missingSeoDescription, missingShortDescription,
      missingCategory, missingDelivery, missingFeatures, missingFaqs
    },
    attentionRequired: uniqueIssues.slice(0, 6),
    recentProducts,
    storeStatus: {
      maintenanceMode: siteSettings.maintenance_mode || false,
      announcementEnabled: siteSettings.announcement_enabled || false,
      supportButtonEnabled: siteSettings.support_button_enabled || false,
    },
    seoHealth: {
      indexingEnabled: seoSettings.robots_index !== false,
      gscConfigured: !!seoSettings.google_search_console_verification,
      ga4Configured: !!seoSettings.google_analytics_id,
      gtmConfigured: !!seoSettings.google_tag_manager_id,
      missingSeoTitlePublished,
      missingSeoDescPublished,
      missingOgImagePublished,
    },
    media: {
      totalImages: imagesRes.count || 0,
      productsWithThumbnail,
      productsMissingThumbnail
    }
  };
}

export async function fetchAllProducts(): Promise<AdminProduct[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('products')
    .select('*, categories(*)')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminProduct[];
}

export async function fetchAllCategories(): Promise<CategoryRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as CategoryRow[];
}

export async function fetchProductById(
  id: string,
): Promise<AdminProductWithRelations | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const product = data as AdminProduct;

  const [images, features, includes, faqs] = await Promise.all([
    sb.from('product_images').select('*').eq('product_id', id).order('sort_order'),
    sb.from('product_features').select('*').eq('product_id', id).order('sort_order'),
    sb.from('product_includes').select('*').eq('product_id', id).order('sort_order'),
    sb.from('product_faqs').select('*').eq('product_id', id).order('sort_order'),
  ]);
  const relationErrors = [images, features, includes, faqs].find((r) => r.error);
  if (relationErrors?.error) throw relationErrors.error;

  return {
    ...product,
    categories: unwrapCategory(product.categories),
    images: (images.data ?? []) as ProductImageRow[],
    features: (features.data ?? []) as ProductFeatureRow[],
    includes: (includes.data ?? []) as ProductIncludeRow[],
    faqs: (faqs.data ?? []) as ProductFaqRow[],
  };
}

export type ProductInput = {
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  category_id: string;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string | null;
  icon: string | null;
  product_type: string;
  delivery_type: string;
  status: string;
  featured: boolean;
  new_product: boolean;
  version: string | null;
  compatibility: string | null;
  requirements: string | null;
  support_period: string | null;
  update_policy: string | null;
  delivery_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
};

export async function createProduct(
  input: ProductInput,
): Promise<ProductRow> {
  const sb = getSupabase();
  const payload = {
    ...input,
    published_at:
      input.status === 'published' ? new Date().toISOString() : null,
  };
  const { data, error } = await sb
    .from('products')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as ProductRow;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput> & { status?: string },
): Promise<ProductRow> {
  const sb = getSupabase();
  const existing = await sb
    .from('products')
    .select('status,published_at')
    .eq('id', id)
    .maybeSingle();
  if (existing.error) throw existing.error;
  const prev = existing.data as { status: string; published_at: string | null } | null;

  const payload: Record<string, unknown> = { ...input };
  if (input.status === 'published' && !prev?.published_at) {
    payload.published_at = new Date().toISOString();
  }
  const { data, error } = await sb
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ProductRow;
}

export async function archiveProduct(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('products')
    .update({ status: 'archived' })
    .eq('id', id);
  if (error) throw error;
}

export async function duplicateProduct(
  id: string,
): Promise<ProductRow> {
  const full = await fetchProductById(id);
  if (!full) throw new Error('Product not found');

  const baseSlug = `${full.slug}-copy`;
  const baseSku = full.sku ? `${full.sku}-COPY` : null;

  const uniqueSlug = await ensureUniqueSlug(baseSlug);
  const uniqueSku = baseSku ? await ensureUniqueSku(baseSku) : null;

  const copyInput: ProductInput = {
    name: `${full.name} (Copy)`,
    slug: uniqueSlug,
    sku: uniqueSku,
    short_description: full.short_description,
    description: full.description,
    category_id: full.category_id,
    price: full.price,
    compare_at_price: full.compare_at_price,
    thumbnail_url: full.thumbnail_url,
    icon: full.icon,
    product_type: full.product_type,
    delivery_type: full.delivery_type,
    status: 'draft',
    featured: false,
    new_product: false,
    version: full.version,
    compatibility: full.compatibility,
    requirements: full.requirements,
    support_period: full.support_period,
    update_policy: full.update_policy,
    delivery_description: full.delivery_description,
    seo_title: full.seo_title,
    seo_description: full.seo_description,
    sort_order: 0,
  };

  const created = await createProduct(copyInput);

  await Promise.all([
    syncFeatures(created.id, full.features.map((f) => f.feature)),
    syncIncludes(created.id, full.includes.map((i) => i.item)),
    syncFaqs(
      created.id,
      full.faqs.map((f) => ({ question: f.question, answer: f.answer })),
    ),
    syncImages(
      created.id,
      full.images.map((img) => ({
        image_url: img.image_url,
        alt_text: img.alt_text,
        sort_order: img.sort_order,
      })),
    ),
  ]);

  return created;
}

export async function ensureUniqueSlug(base: string): Promise<string> {
  const sb = getSupabase();
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function ensureUniqueSku(base: string): Promise<string> {
  const sb = getSupabase();
  let candidate = base;
  let suffix = 1;
  while (true) {
    const { data, error } = await sb
      .from('products')
      .select('id')
      .eq('sku', candidate)
      .maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export async function syncFeatures(productId: string, features: string[]): Promise<void> {
  const sb = getSupabase();
  const { error: delError } = await sb
    .from('product_features')
    .delete()
    .eq('product_id', productId);
  if (delError) throw delError;
  if (features.length === 0) return;
  const rows = features.map((feature, i) => ({
    product_id: productId,
    feature,
    sort_order: i,
  }));
  const { error: insError } = await sb.from('product_features').insert(rows);
  if (insError) throw insError;
}

export async function syncIncludes(productId: string, items: string[]): Promise<void> {
  const sb = getSupabase();
  const { error: delError } = await sb
    .from('product_includes')
    .delete()
    .eq('product_id', productId);
  if (delError) throw delError;
  if (items.length === 0) return;
  const rows = items.map((item, i) => ({
    product_id: productId,
    item,
    sort_order: i,
  }));
  const { error: insError } = await sb.from('product_includes').insert(rows);
  if (insError) throw insError;
}

export async function syncFaqs(
  productId: string,
  faqs: { question: string; answer: string }[],
): Promise<void> {
  const sb = getSupabase();
  const { error: delError } = await sb
    .from('product_faqs')
    .delete()
    .eq('product_id', productId);
  if (delError) throw delError;
  if (faqs.length === 0) return;
  const rows = faqs.map((f, i) => ({
    product_id: productId,
    question: f.question,
    answer: f.answer,
    sort_order: i,
  }));
  const { error: insError } = await sb.from('product_faqs').insert(rows);
  if (insError) throw insError;
}

export async function syncImages(
  productId: string,
  images: { image_url: string; alt_text: string | null; sort_order: number }[],
): Promise<void> {
  const sb = getSupabase();
  const { error: delError } = await sb
    .from('product_images')
    .delete()
    .eq('product_id', productId);
  if (delError) throw delError;
  if (images.length === 0) return;
  const rows = images.map((img, i) => ({
    product_id: productId,
    image_url: img.image_url,
    alt_text: img.alt_text,
    sort_order: img.sort_order ?? i,
  }));
  const { error: insError } = await sb.from('product_images').insert(rows);
  if (insError) throw insError;
}

export async function createCategory(input: {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  sort_order?: number;
  is_active?: boolean;
}): Promise<CategoryRow> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('categories')
    .insert({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      icon: input.icon ?? 'FolderOpen',
      sort_order: input.sort_order ?? 0,
      is_active: input.is_active ?? true,
    })
    .select()
    .single();
  if (error) throw error;
  return data as CategoryRow;
}

export async function updateCategory(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    sort_order: number;
    is_active: boolean;
  }>,
): Promise<CategoryRow> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as CategoryRow;
}

export async function countProductsInCategory(categoryId: string): Promise<number> {
  const sb = getSupabase();
  const { count, error } = await sb
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', categoryId);
  if (error) throw error;
  return count ?? 0;
}

export async function deactivateCategory(id: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from('categories')
    .update({ is_active: false })
    .eq('id', id);
  if (error) throw error;
}

export type AdminMediaItem = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number | null;
  isPrimary: boolean;
  isGalleryImage: boolean;
};

export async function fetchProductMedia(): Promise<AdminMediaItem[]> {
  const sb = getSupabase();
  const [productsResult, imagesResult] = await Promise.all([
    sb.from('products').select('id,name,slug,thumbnail_url').order('name'),
    sb.from('product_images').select('*').order('sort_order'),
  ]);
  if (productsResult.error) throw productsResult.error;
  if (imagesResult.error) throw imagesResult.error;

  const products = (productsResult.data ?? []) as Pick<
    ProductRow,
    'id' | 'name' | 'slug' | 'thumbnail_url'
  >[];
  const images = (imagesResult.data ?? []) as ProductImageRow[];
  const productsById = new Map(products.map((product) => [product.id, product]));
  const seen = new Set<string>();
  const media: AdminMediaItem[] = [];

  images.forEach((image) => {
    const product = productsById.get(image.product_id);
    if (!product) return;
    seen.add(`${product.id}:${image.image_url}`);
    media.push({
      id: image.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: image.image_url,
      altText: image.alt_text,
      sortOrder: image.sort_order,
      isPrimary: product.thumbnail_url === image.image_url,
      isGalleryImage: true,
    });
  });

  products.forEach((product) => {
    if (!product.thumbnail_url || seen.has(`${product.id}:${product.thumbnail_url}`)) return;
    media.push({
      id: `thumbnail-${product.id}`,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      imageUrl: product.thumbnail_url,
      altText: product.name,
      sortOrder: null,
      isPrimary: true,
      isGalleryImage: false,
    });
  });

  return media;
}

const PRODUCT_IMAGE_BUCKET = 'product-images';
const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateProductImage(file: File): string | null {
  if (!allowedImageTypes.has(file.type)) {
    return `${file.name}: only JPG, PNG, and WebP images are supported.`;
  }
  if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
    return `${file.name}: images must be 5 MB or smaller.`;
  }
  return null;
}

export async function uploadProductImage(
  productId: string,
  file: File,
): Promise<{ imageUrl: string; storagePath: string }> {
  const validationError = validateProductImage(file);
  if (validationError) throw new Error(validationError);

  const extension = allowedImageTypes.get(file.type)!;
  const storagePath = `products/${productId}/${crypto.randomUUID()}.${extension}`;
  const sb = getSupabase();
  const { error } = await sb.storage.from(PRODUCT_IMAGE_BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data } = sb.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(storagePath);
  return { imageUrl: data.publicUrl, storagePath };
}

export function getManagedProductImagePath(
  imageUrl: string,
  productId: string,
): string | null {
  try {
    const image = new URL(imageUrl);
    const project = new URL(import.meta.env.VITE_SUPABASE_URL);
    if (image.origin !== project.origin) return null;
    const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
    const markerIndex = image.pathname.indexOf(marker);
    if (markerIndex < 0) return null;
    const path = decodeURIComponent(image.pathname.slice(markerIndex + marker.length));
    const escapedProductId = productId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const managedPattern = new RegExp(
      `^products/${escapedProductId}/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\.(?:jpg|png|webp)$`,
      'i',
    );
    return managedPattern.test(path) ? path : null;
  } catch {
    return null;
  }
}

export async function deleteManagedProductImage(
  imageUrl: string,
  productId: string,
): Promise<boolean> {
  const storagePath = getManagedProductImagePath(imageUrl, productId);
  if (!storagePath) return false;
  const { error } = await getSupabase()
    .storage.from(PRODUCT_IMAGE_BUCKET)
    .remove([storagePath]);
  if (error) throw error;
  return true;
}

export async function fetchOrderEmailLogs(orderId: string): Promise<OrderEmailLogRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('order_email_log')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data ?? []) as OrderEmailLogRow[];
}

// ----------------------------------------------------------------------
// PRODUCT DOWNLOAD LINKS
// ----------------------------------------------------------------------

export type ProductDownloadLinkRow = {
  id: string;
  product_id: string;
  title: string;
  download_url: string;
  version: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export async function fetchProductDownloadLinks(productId: string): Promise<ProductDownloadLinkRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('product_download_links')
    .select('*')
    .eq('product_id', productId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (error) throw error;
  return (data ?? []) as ProductDownloadLinkRow[];
}

export async function createProductDownloadLink(
  payload: Omit<ProductDownloadLinkRow, 'id' | 'created_at' | 'updated_at'>
): Promise<ProductDownloadLinkRow> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('product_download_links')
    .insert([payload])
    .select()
    .single();
    
  if (error) throw error;
  return data as ProductDownloadLinkRow;
}

export async function updateProductDownloadLink(
  id: string,
  payload: Partial<Omit<ProductDownloadLinkRow, 'id' | 'created_at' | 'updated_at' | 'product_id'>>
): Promise<ProductDownloadLinkRow> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('product_download_links')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data as ProductDownloadLinkRow;
}

export async function deleteProductDownloadLink(id: string): Promise<boolean> {
  const sb = getSupabase();
  const { error } = await sb
    .from('product_download_links')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  return true;
}

export async function syncDownloadLinks(
  productId: string,
  links: {
    id?: string;
    title: string;
    download_url: string;
    version: string;
    sort_order: number;
    is_active: boolean;
  }[]
): Promise<void> {
  const existing = await fetchProductDownloadLinks(productId);
  const existingIds = new Set(existing.map((e) => e.id));
  const newIds = new Set(links.filter((l) => l.id).map((l) => l.id));

  // delete removed links
  for (const ex of existing) {
    if (!newIds.has(ex.id)) {
      await deleteProductDownloadLink(ex.id);
    }
  }

  // insert/update
  for (const l of links) {
    const payload = {
      product_id: productId,
      title: l.title,
      download_url: l.download_url,
      version: l.version || null,
      sort_order: l.sort_order,
      is_active: l.is_active,
    };
    if (l.id && existingIds.has(l.id)) {
      await updateProductDownloadLink(l.id, payload);
    } else {
      await createProductDownloadLink(payload);
    }
  }
}
// Force HMR update
