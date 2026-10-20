import { getSupabase } from '@/lib/supabase';
import type { Product, ProductFaqItem, ProductImage, ProductType, DeliveryType, Category } from '@/types';
import { allCatalogProducts } from '@/data/catalogProducts';
import type {
  CategoryRow,
  ProductFeatureRow,
  ProductFaqRow,
  ProductImageRow,
  ProductIncludeRow,
  ProductRow,
} from '@/types/db';

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sortOrder: number;
};

type ProductRecord = ProductRow & {
  categories: CategoryRow | CategoryRow[] | null;
  product_review_stats?: { average_rating: number; review_count: number } | { average_rating: number; review_count: number }[] | null;
};

type ProductRelations = {
  images: ProductImageRow[];
  features: ProductFeatureRow[];
  includes: ProductIncludeRow[];
  faqs: ProductFaqRow[];
};

const iconByCategory: Record<string, string> = {
  wordpress: 'Layers',
  plugins: 'Puzzle',
  software: 'Laptop',
  'ai-tools': 'Sparkles',
  'web-services': 'Globe',
  courses: 'GraduationCap',
  'digital-resources': 'FolderArchive',
  scripts: 'FileCode',
};

const accentByCategory: Record<string, string> = {
  wordpress: 'brand',
  plugins: 'accent',
  software: 'ink',
  'ai-tools': 'accent',
  'web-services': 'brand',
  courses: 'success',
  'digital-resources': 'warning',
  scripts: 'brand',
};

function asCategory(value: ProductRecord['categories']): CategoryRow | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

const deliveryTypeMap: Record<string, DeliveryType> = {
  digital_download: 'instant-download',
  license_key: 'license-key',
  manual_delivery: 'manual-delivery',
  subscription: 'subscription',
  service: 'service',
};

function toDeliveryType(value: string): DeliveryType {
  return deliveryTypeMap[value] ?? 'instant-download';
}

function toProductType(value: string): ProductType {
  return value as ProductType;
}

function mapProduct(record: ProductRecord, relations: Partial<ProductRelations> = {}): Product {
  const category = asCategory(record.categories);
  const categorySlug = category?.slug ?? 'digital-resources';
  const images = (relations.images ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const features = (relations.features ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const includes = (relations.includes ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const faqs = (relations.faqs ?? []).sort((a, b) => a.sort_order - b.sort_order);
  
  let reviewStats: { averageRating: number; reviewCount: number } | undefined;
  if (record.product_review_stats) {
    const statsObj = Array.isArray(record.product_review_stats) 
      ? record.product_review_stats[0] 
      : record.product_review_stats;
    if (statsObj) {
      reviewStats = {
        averageRating: statsObj.average_rating,
        reviewCount: statsObj.review_count,
      };
    }
  }

  const staticData = allCatalogProducts.find((p) => p.slug === record.slug || p.id === record.id);

  const productImages: ProductImage[] = images.map((image) => ({
    id: image.id,
    url: image.image_url,
    alt: image.alt_text ?? record.name,
  }));
  const productFaq: ProductFaqItem[] = faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));
  const accent = accentByCategory[categorySlug] ?? 'brand';
  const descriptor = record.short_description ?? record.description ?? staticData?.shortDescription ?? '';

  const effectiveImages = productImages.length > 0
    ? productImages
    : staticData?.images && staticData.images.length > 0
      ? staticData.images
      : record.thumbnail_url
        ? [{ id: `${record.id}-thumbnail`, url: record.thumbnail_url, alt: record.name }]
        : [];

  const effectiveFeatures = features.length > 0
    ? features.map((item) => item.feature)
    : (staticData?.features ?? []);

  const effectiveWhatsIncluded = includes.length > 0
    ? includes.map((item) => item.item)
    : (staticData?.whatsIncluded ?? []);

  const effectiveFaqs = productFaq.length > 0
    ? productFaq
    : (staticData?.faq ?? []);

  const effectiveThumbnail = record.thumbnail_url || staticData?.thumbnail || effectiveImages[0]?.url || '';
  const effectiveDescription = (record.description && record.description.length > 60)
    ? record.description
    : (staticData?.description || record.short_description || staticData?.shortDescription || '');

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    shortDescription: record.short_description || staticData?.shortDescription || '',
    description: effectiveDescription,
    category: category?.name ?? staticData?.category ?? 'Digital Resources',
    price: Number(record.price),
    compareAtPrice: record.compare_at_price === null ? (staticData?.compareAtPrice ?? undefined) : Number(record.compare_at_price),
    previousPrice: record.compare_at_price === null ? (staticData?.previousPrice ?? undefined) : Number(record.compare_at_price),
    featured: record.featured ?? !!staticData?.featured,
    newProduct: record.new_product ?? !!staticData?.newProduct,
    badge: (record.featured ?? !!staticData?.featured)
      ? 'featured'
      : (record.new_product ?? !!staticData?.newProduct)
        ? 'new'
        : staticData?.badge,
    icon: iconByCategory[categorySlug] ?? staticData?.icon ?? 'Package',
    accent,
    descriptor,
    thumbnail: effectiveThumbnail,
    images: effectiveImages,
    deliveryType: toDeliveryType(record.delivery_type),
    productType: toProductType(record.product_type),
    compatibility: record.compatibility ?? staticData?.compatibility,
    requirements: record.requirements ?? staticData?.requirements,
    version: record.version ?? staticData?.version,
    supportPeriod: record.support_period ?? staticData?.supportPeriod,
    updatePolicy: record.update_policy ?? staticData?.updatePolicy,
    deliveryDescription: record.delivery_description || staticData?.deliveryDescription || '',
    features: effectiveFeatures,
    whatsIncluded: effectiveWhatsIncluded,
    faq: effectiveFaqs,
    seoTitle: record.seo_title ?? staticData?.seoTitle,
    seoDescription: record.seo_description ?? staticData?.seoDescription,
    reviewStats,
  };
}

const productSelect = `*, categories(*), product_review_stats(average_rating, review_count)`;

export async function getCategories(): Promise<CatalogCategory[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  const rows = (data ?? []) as CategoryRow[];
  return rows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    icon: category.icon ?? 'FolderOpen',
    sortOrder: category.sort_order,
  }));
}

export async function getPublishedProducts(): Promise<Product[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('products')
    .select(productSelect)
    .eq('status', 'published')
    .order('sort_order')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const records = (data ?? []) as unknown as ProductRecord[];
  const dbProducts = records.map((record) => mapProduct(record));

  // Merge in allCatalogProducts if not already present in database
  const existingSlugs = new Set(dbProducts.map((p) => p.slug));
  const missingCatalog = allCatalogProducts.filter((t) => !existingSlugs.has(t.slug));

  return [...dbProducts, ...missingCatalog];
}

export async function getFeaturedProductsFromCatalog(limit = 8): Promise<Product[]> {
  const allProducts = await getPublishedProducts();
  return allProducts.filter((p) => p.featured).slice(0, limit);
}

export async function getProductBySlugFromCatalog(slug: string): Promise<Product | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('products')
    .select(productSelect)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;

  if (data) {
    const record = data as unknown as ProductRecord;
    const [images, features, includes, faqs] = await Promise.all([
      sb.from('product_images').select('*').eq('product_id', record.id).order('sort_order'),
      sb.from('product_features').select('*').eq('product_id', record.id).order('sort_order'),
      sb.from('product_includes').select('*').eq('product_id', record.id).order('sort_order'),
      sb.from('product_faqs').select('*').eq('product_id', record.id).order('sort_order'),
    ]);
    const relationResults = [images, features, includes, faqs];
    const relationError = relationResults.find((result) => result.error)?.error;
    if (relationError) throw relationError;

    return mapProduct(record, {
      images: (images.data ?? []) as ProductImageRow[],
      features: (features.data ?? []) as ProductFeatureRow[],
      includes: (includes.data ?? []) as ProductIncludeRow[],
      faqs: (faqs.data ?? []) as ProductFaqRow[],
    });
  }

  // Fallback to allCatalogProducts
  const fallback = allCatalogProducts.find((t) => t.slug === slug);
  return fallback ?? null;
}

export async function getRelatedProductsFromCatalog(product: Product, limit = 4): Promise<Product[]> {
  const allProducts = await getPublishedProducts();
  return allProducts
    .filter((candidate) => candidate.id !== product.id && candidate.category === product.category)
    .slice(0, limit);
}

export function categoriesToType(cats: CatalogCategory[]): Category[] {
  return cats.map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.description.slice(0, 60),
    description: c.description,
    icon: c.icon,
    color: accentByCategory[c.slug] ?? 'brand',
  }));
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const sb = getSupabase();
  const { data, error } = await sb
    .from('products')
    .select(productSelect)
    .eq('status', 'published')
    .in('id', ids);
  if (error) throw error;
  const records = (data ?? []) as unknown as ProductRecord[];
  
  // Sort them to match the original `ids` order (useful for recently viewed)
  const mapped = records.map((record) => mapProduct(record));
  return ids.map(id => mapped.find(p => p.id === id)).filter((p): p is Product => p !== undefined);
}
