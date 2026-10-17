import { getSupabase } from '@/lib/supabase';

export type ProductImportStatus = 'new' | 'up_to_date' | 'update_available';
export type ProductLicenseStatus = 'unverified' | 'verified_gpl' | 'rejected';

export type ProductImportPreviewItem = {
  sourceUrl: string;
  sourceModifiedAt: string | null;
  title: string;
  slug: string;
  version: string | null;
  excerpt: string;
  imageUrl: string | null;
  galleryImages?: string[];
  features?: string[];
  sourceCategory: string | null;
  importStatus: ProductImportStatus;
  productId: string | null;
  currentVersion: string | null;
  licenseStatus: ProductLicenseStatus;
};

export type ProductImportPreview = {
  items: ProductImportPreviewItem[];
  count: number;
  source: string;
};

export type ProductImportResult = {
  imported: Array<{
    sourceUrl: string;
    productId: string;
    result: 'created' | 'updated';
  }>;
  errors: Array<{ sourceUrl: string; message: string }>;
  created: number;
  updated: number;
};

async function tryLocalEndpoint<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch {
    // local endpoint not available
  }
  return null;
}

async function invokeImporter<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke('weadown-import', { body });
  if (error) {
    const response = (error as Error & { context?: Response }).context;
    if (response?.status === 404 || /Failed to send a request|Failed to fetch/i.test(error.message)) {
      throw new Error('Importer service is not available. Please ensure the dev server is active or the Edge Function is deployed.');
    }
    if (response) {
      try {
        const payload = (await response.clone().json()) as {
          error?: unknown;
          errors?: Array<{ message?: unknown }>;
        };
        if (typeof payload.error === 'string' && payload.error) {
          throw new Error(payload.error);
        }
        if (Array.isArray(payload.errors) && payload.errors.length > 0) {
          const messages = payload.errors
            .slice(0, 3)
            .map((item) => (typeof item.message === 'string' ? item.message : 'Import failed'))
            .join(' · ');
          throw new Error(`Import failed: ${messages}`);
        }
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
          throw parseError;
        }
      }
    }
    throw error;
  }
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}

export async function previewLatestSourceProducts(
  limit = 30,
  sourceUrl = 'https://weadown.com/wordpress-theme/',
  page = 1
): Promise<ProductImportPreview> {
  // 1. Try local dev scraper API
  const local = await tryLocalEndpoint<ProductImportPreview>(
    `/api/weadown/preview?url=${encodeURIComponent(sourceUrl)}&limit=${limit}&page=${page}`
  );
  if (local && Array.isArray(local.items)) {
    return local;
  }

  // 2. Fallback to Supabase Edge Function
  return invokeImporter<ProductImportPreview>({ action: 'preview', limit, sourceUrl, page });
}

export async function previewSourceProduct(sourceUrl: string): Promise<ProductImportPreview> {
  const local = await tryLocalEndpoint<ProductImportPreview>(
    `/api/weadown/preview?url=${encodeURIComponent(sourceUrl)}&limit=1`
  );
  if (local && Array.isArray(local.items)) {
    return local;
  }

  return invokeImporter<ProductImportPreview>({ action: 'preview_urls', sourceUrls: [sourceUrl] });
}

export async function checkSourceUpdates(limit = 30): Promise<ProductImportPreview> {
  const local = await tryLocalEndpoint<ProductImportPreview>(
    `/api/weadown/check-updates?limit=${limit}`
  );
  if (local && Array.isArray(local.items)) {
    return local;
  }

  return previewLatestSourceProducts(limit);
}

export async function importSourceProducts(input: {
  sourceUrls: string[];
  price: number;
  categoryName?: string;
  status?: 'published' | 'draft';
  overwritePrice?: boolean;
}): Promise<ProductImportResult> {
  // 1. Try local dev API
  const local = await tryLocalEndpoint<ProductImportResult>('/api/weadown/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (local && typeof local.created === 'number') {
    return local;
  }

  // 2. Fallback to Supabase Edge Function
  const chunks: string[][] = [];
  for (let index = 0; index < input.sourceUrls.length; index += 10) {
    chunks.push(input.sourceUrls.slice(index, index + 10));
  }

  const combined: ProductImportResult = {
    imported: [],
    errors: [],
    created: 0,
    updated: 0,
  };
  for (const sourceUrls of chunks) {
    const result = await invokeImporter<ProductImportResult>({
      action: 'import',
      sourceUrls,
      price: input.price,
      overwritePrice: input.overwritePrice === true,
      categoryName: input.categoryName || 'WordPress',
      status: input.status || 'published',
    });
    combined.imported.push(...result.imported);
    combined.errors.push(...result.errors);
    combined.created += result.created;
    combined.updated += result.updated;
  }
  return combined;
}
