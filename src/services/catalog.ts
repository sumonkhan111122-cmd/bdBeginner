import { getSupabase } from '@/lib/supabase';
import type { Product, ProductFaqItem, ProductImage, ProductType, DeliveryType, Category } from '@/types';
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
  wordpress: 'ShoppingBag',
  software: 'Code2',
  'ai-tools': 'Sparkles',
  courses: 'GraduationCap',
  'digital-resources': 'LayoutDashboard',
  'web-services': 'Globe',
};

const accentByCategory: Record<string, string> = {
  wordpress: 'brand',
  software: 'ink',
  'ai-tools': 'accent',
  courses: 'success',
  'digital-resources': 'warning',
  'web-services': 'brand',
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
  const descriptor = record.short_description ?? record.description ?? '';

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    shortDescription: record.short_description ?? '',
    description: record.description ?? record.short_description ?? '',
    category: category?.name ?? 'Digital Resources',
    price: Number(record.price),
    compareAtPrice: record.compare_at_price === null ? undefined : Number(record.compare_at_price),
    previousPrice: record.compare_at_price === null ? undefined : Number(record.compare_at_price),
    featured: record.featured,
    newProduct: record.new_product,
    badge: record.featured ? 'featured' : record.new_product ? 'new' : undefined,
    icon: iconByCategory[categorySlug] ?? 'Package',
    accent,
    descriptor,
    thumbnail: record.thumbnail_url ?? '',
    images:
      productImages.length > 0
        ? productImages
        : record.thumbnail_url
          ? [{ id: `${record.id}-thumbnail`, url: record.thumbnail_url, alt: record.name }]
          : [],
    deliveryType: toDeliveryType(record.delivery_type),
    productType: toProductType(record.product_type),
    compatibility: record.compatibility ?? undefined,
    requirements: record.requirements ?? undefined,
    version: record.version ?? undefined,
    supportPeriod: record.support_period ?? undefined,
    updatePolicy: record.update_policy ?? undefined,
    deliveryDescription: record.delivery_description ?? '',
    features: features.map((item) => item.feature),
    whatsIncluded: includes.map((item) => item.item),
    faq: productFaq,
    seoTitle: record.seo_title ?? undefined,
    seoDescription: record.seo_description ?? undefined,
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
  return records.map((record) => mapProduct(record));
}

export async function getFeaturedProductsFromCatalog(limit = 8): Promise<Product[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('products')
    .select(productSelect)
    .eq('status', 'published')
    .eq('featured', true)
    .order('sort_order')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  const records = (data ?? []) as unknown as ProductRecord[];
  return records.map((record) => mapProduct(record));
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
  if (!data) return null;

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

export async function getRelatedProductsFromCatalog(product: Product, limit = 4): Promise<Product[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('products')
    .select(productSelect)
    .eq('status', 'published')
    .neq('id', product.id)
    .order('sort_order')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const records = (data ?? []) as unknown as ProductRecord[];
  const related = records
    .map((record) => mapProduct(record))
    .filter((candidate) => candidate.category === product.category)
    .slice(0, limit);
  return related;
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
