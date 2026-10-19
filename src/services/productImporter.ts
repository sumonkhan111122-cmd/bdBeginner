import { getSupabase } from '@/lib/supabase';

export type ProductImportStatus = 'new' | 'up_to_date' | 'update_available';
export type ProductLicenseStatus = 'unverified' | 'verified_gpl' | 'rejected';
export type ProductDownloadStatus = 'success' | 'failed' | 'retry' | 'in_queue' | 'processing' | 'missing';

export type ProductExtractionQueueStatus = {
  isProcessing: boolean;
  pending: number;
  processing: number;
  retry: number;
  success: number;
  failed: number;
  totalQueued: number;
  currentJob: { productId: string; sourceUrl: string; sourceTitle?: string; status: string } | null;
  recentHistory: Array<{ productId: string; sourceUrl: string; status: string; finishedAt?: string; lastError?: string }>;
};

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
  downloadStatus?: ProductDownloadStatus;
  downloadUrl?: string | null;
  downloadPageUrl?: string | null;
  downloadError?: string | null;
  downloadPackageName?: string | null;
};

export type ProductImportPreview = {
  items: ProductImportPreviewItem[];
  count: number;
  source: string;
  queueStatus?: ProductExtractionQueueStatus;
};

export type ProductImportResult = {
  imported: Array<{
    sourceUrl: string;
    productId: string;
    result: 'created' | 'updated';
    extractionQueued?: boolean;
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

export async function fetchExtractionQueueStatus(): Promise<ProductExtractionQueueStatus | null> {
  // 1. Try local or cPanel PHP/Node endpoint
  const local = await tryLocalEndpoint<ProductExtractionQueueStatus>('/api/weadown/queue-status');
  if (local) return local;

  // 2. Try Supabase Edge Function
  try {
    const edge = await invokeImporter<ProductExtractionQueueStatus>({ action: 'queue_status' });
    if (edge) return edge;
  } catch (_) {}

  // 3. Direct Supabase database fallback
  try {
    const sb = getSupabase();
    const { data: allImports } = await sb
      .from('product_source_imports')
      .select('id, product_id, source_url, source_title, metadata, created_at')
      .order('created_at', { ascending: false });

    if (allImports) {
      let successCount = 0;
      let failedCount = 0;
      let pendingCount = 0;
      const history: any[] = [];

      allImports.forEach((imp: any) => {
        const flow = imp.metadata && imp.metadata.download_flow;
        if (flow && flow.status === 'success' && flow.final_download_url) {
          successCount++;
          if (history.length < 10) {
            history.push({
              productId: imp.product_id,
              sourceTitle: imp.source_title,
              sourceUrl: imp.source_url,
              status: 'success',
              result: {
                finalDownloadUrl: flow.final_download_url,
                downloadPageUrl: flow.download_page_url,
                packageName: flow.package_name,
                fileSize: flow.file_size,
              },
              finishedAt: flow.extracted_at,
            });
          }
        } else if (flow && flow.status === 'failed') {
          failedCount++;
        } else {
          pendingCount++;
        }
      });

      return {
        isProcessing: false,
        pending: pendingCount,
        processing: 0,
        retry: 0,
        success: successCount,
        failed: failedCount,
        totalQueued: pendingCount,
        currentJob: null,
        recentHistory: history,
      };
    }
  } catch (_) {}

  return null;
}

export async function recoverMissingDownloadLinks(limit = 10): Promise<{ count?: number; processed?: number; remaining?: number; enqueued?: any[] }> {
  // 1. Try local or cPanel PHP/Node endpoint
  const local = await tryLocalEndpoint<{ count?: number; processed?: number; remaining?: number; enqueued?: any[] }>('/api/weadown/recover-downloads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchSize: limit, limit }),
  });
  if (local && (local.processed !== undefined || local.count !== undefined)) return local;

  // 2. Try Supabase Edge Function fallback
  try {
    const edge = await invokeImporter<{ processed: number; remaining: number; totalRemaining: number; results: any[] }>({
      action: 'recover_downloads',
      batchSize: limit,
    });
    if (edge) {
      return {
        processed: edge.processed,
        remaining: edge.remaining,
        count: edge.processed,
        enqueued: edge.results,
      };
    }
  } catch (_) {}

  return { count: 0, processed: 0, remaining: 0, enqueued: [] };
}

export async function retryProductDownloadLink(productId: string, sourceUrl: string): Promise<{ success: boolean }> {
  // 1. Try local or cPanel PHP/Node endpoint
  const local = await tryLocalEndpoint<{ success: boolean }>('/api/weadown/retry-download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, sourceUrl }),
  });
  if (local && local.success) return local;

  // 2. Try Supabase Edge Function fallback
  try {
    const edge = await invokeImporter<{ success: boolean }>({
      action: 'extract_single',
      productId,
      sourceUrl,
    });
    return edge || { success: false };
  } catch (_) {}

  return { success: false };
}

export async function extractSingleDownload(productId: string, sourceUrl: string): Promise<any> {
  // 1. Try local or cPanel PHP/Node endpoint
  const local = await tryLocalEndpoint<any>('/api/weadown/extract-single', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, sourceUrl }),
  });
  if (local && local.success) return local;

  // 2. Try Supabase Edge Function fallback
  return invokeImporter<any>({
    action: 'extract_single',
    productId,
    sourceUrl,
  });
}


