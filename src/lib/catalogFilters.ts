import type { DeliveryType } from '@/types';

export type CatalogSortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

const SORT_OPTIONS = new Set<CatalogSortOption>(['featured', 'newest', 'price-asc', 'price-desc']);
const DELIVERY_TYPES = new Set<DeliveryType>(['instant-download', 'license-key', 'subscription', 'manual-delivery']);

function uniqueValues(value: string | null): string[] {
  return [...new Set((value || '').split(',').map((item) => item.trim()).filter(Boolean))];
}

export function readCatalogQuery(
  params: URLSearchParams,
  defaults: { category?: string; dealsOnly?: boolean } = {},
) {
  const rawPage = params.get('page') || '1';
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const sort = params.get('sort') as CatalogSortOption;
  return {
    search: params.get('search') ?? params.get('q') ?? '',
    categories: uniqueValues(params.get('category') ?? defaults.category ?? '').filter((value) => value.toLowerCase() !== 'all'),
    dealsOnly: params.has('deals') ? params.get('deals') === 'true' : !!defaults.dealsOnly,
    types: uniqueValues(params.get('type')).filter((value): value is DeliveryType => DELIVERY_TYPES.has(value as DeliveryType)),
    priceRanges: uniqueValues(params.get('price')).filter((value) => /^[0-3]$/.test(value)).map(Number),
    sort: SORT_OPTIONS.has(sort) ? sort : 'featured' as CatalogSortOption,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function updateCatalogQuery(
  current: URLSearchParams,
  changes: Record<string, string | null>,
  resetPage = true,
) {
  const next = new URLSearchParams(current);
  if (resetPage) next.delete('page');
  for (const [key, value] of Object.entries(changes)) {
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
  }
  if ('search' in changes) next.delete('q');
  return next;
}

export function catalogSearchTerms(search: string): string[] {
  return search.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
}
