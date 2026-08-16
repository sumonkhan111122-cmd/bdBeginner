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
  if (error) throw error;
  if (data?.error) throw new Error(String(data.error));
  return data as T;
}

export async function previewLatestSourceProducts(limit = 50): Promise<ProductImportPreview> {
  return invokeImporter<ProductImportPreview>({ action: 'preview', limit });
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
