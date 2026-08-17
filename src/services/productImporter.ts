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

async function invokeImporter<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke('weadown-import', { body });
  if (error) {
    const response = (error as Error & { context?: Response }).context;
    if (response?.status === 404 || /Failed to send a request|Failed to fetch/i.test(error.message)) {
      throw new Error('Importer service is not deployed yet. Deploy the weadown-import Edge Function, then try again.');
    }
    if (response) {
      try {
        const payload = await response.clone().json() as {
          error?: unknown;
          errors?: Array<{ message?: unknown }>;
        };
        if (typeof payload.error === 'string' && payload.error) {
          throw new Error(payload.error);
        }
        if (Array.isArray(payload.errors) && payload.errors.length > 0) {
          const messages = payload.errors
            .slice(0, 3)
            .map((item) => typeof item.message === 'string' ? item.message : 'Import failed')
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

export async function previewLatestSourceProducts(limit = 50): Promise<ProductImportPreview> {
  return invokeImporter<ProductImportPreview>({ action: 'preview', limit });
}

export async function previewSourceProduct(sourceUrl: string): Promise<ProductImportPreview> {
  return invokeImporter<ProductImportPreview>({ action: 'preview_urls', sourceUrls: [sourceUrl] });
}

export async function importSourceProducts(input: {
  sourceUrls: string[];
  price: number;
  categoryId?: string | null;
  overwritePrice?: boolean;
}): Promise<ProductImportResult> {
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
      categoryId: input.categoryId || null,
      overwritePrice: input.overwritePrice === true,
    });
    combined.imported.push(...result.imported);
    combined.errors.push(...result.errors);
    combined.created += result.created;
    combined.updated += result.updated;
  }
  return combined;
}
