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

export const BILINGUAL_SYNONYMS: Record<string, string[]> = {
  // English to Bengali
  video: ['ভিডিও', 'ভিডিও এডিটিং'],
  editing: ['এডিটিং', 'ভিডিও'],
  motion: ['মোশন', 'অ্যানিমেশন', 'মোশন গ্রাফিক্স'],
  graphics: ['গ্রাফিক্স', 'ডিজাইন', 'গ্রাফিক'],
  graphic: ['গ্রাফিক্স', 'ডিজাইন', 'গ্রাফিক'],
  design: ['ডিজাইন', 'গ্রাফিক্স', 'ইউআই'],
  course: ['কোর্স', 'মাস্টারক্লাস', 'শিখুন'],
  courses: ['কোর্স', 'মাস্টারক্লাস'],
  theme: ['থিম', 'ওয়ার্ডপ্রেস'],
  themes: ['থিম', 'ওয়ার্ডপ্রেস'],
  plugin: ['প্লাগিন', 'প্লাগইন', 'টুলস'],
  plugins: ['প্লাগিন', 'প্লাগইন'],
  marketing: ['মার্কেটিং', 'ফেসবুক', 'বিজ্ঞাপন'],
  seo: ['এসইও', 'সার্চ ইঞ্জিন'],
  freelance: ['ফ্রিল্যান্সিং', 'আউটসোর্সিং'],
  freelancing: ['ফ্রিল্যান্সিং', 'আউটসোর্সিং'],
  hacking: ['হ্যাকিং', 'সাইবার সিকিউরিটি', 'এথিক্যাল'],
  cyber: ['সাইবার', 'সিকিউরিটি', 'নিরাপত্তা'],
  english: ['ইংরেজি', 'স্পোকেন', 'আইইএলটিএস'],
  spoken: ['স্পোকেন', 'ইংরেজি'],
  dropshipping: ['ড্রপশিপিং', 'ই-কমার্স', 'শপিফাই'],
  ecommerce: ['ই-কমার্স', 'শপ', 'কমার্স', 'দোকান'],
  ai: ['এআই', 'কৃত্রিম বুদ্ধিমত্তা'],
  youtube: ['ইউটিউব', 'চ্যানেল'],
  facebook: ['ফেসবুক', 'পেজ'],
  shopify: ['শপিফাই', 'ড্রপশিপিং'],
  canva: ['ক্যানভা', 'টেমপ্লেট'],
  photoshop: ['ফটোশপ', 'অ্যাডোবি'],
  illustrator: ['ইলাস্ট্রেটর', 'ভেক্টর'],
  capcut: ['ক্যাপকাট', 'রিলস'],
  free: ['ফ্রি', 'বিনামূল্যে'],

  // Bengali to English
  'ভিডিও': ['video', 'editing', 'capcut', 'premiere'],
  'এডিটিং': ['editing', 'video', 'capcut'],
  'মোশন': ['motion', 'animation', 'after effects'],
  'গ্রাফিক্স': ['graphics', 'design', 'photoshop', 'illustrator'],
  'ডিজাইন': ['design', 'graphics', 'ui', 'ux'],
  'কোর্স': ['course', 'masterclass', 'tutorial'],
  'থিম': ['theme', 'wordpress', 'template'],
  'প্লাগিন': ['plugin', 'addon', 'extension'],
  'প্লাগইন': ['plugin', 'addon'],
  'মার্কেটিং': ['marketing', 'facebook', 'ads'],
  'এসইও': ['seo', 'search engine'],
  'ফ্রিল্যান্সিং': ['freelance', 'freelancing', 'fiverr', 'upwork'],
  'হ্যাকিং': ['hacking', 'ethical', 'cyber', 'security'],
  'ইংরেজি': ['english', 'spoken', 'ielts'],
  'ড্রপশিপিং': ['dropshipping', 'shopify', 'ecommerce'],
  'ইউটিউব': ['youtube', 'video'],
  'ফেসবুক': ['facebook', 'meta', 'ads'],
  'এআই': ['ai', 'chatgpt', 'artificial intelligence'],
  'ফ্রি': ['free', 'gpl', 'download']
};

export function matchSearchTerm(searchableText: string, term: string): boolean {
  if (searchableText.includes(term)) return true;
  const syns = BILINGUAL_SYNONYMS[term];
  if (syns && syns.some((s) => searchableText.includes(s.toLowerCase()))) return true;
  return false;
}

export function matchAllSearchTerms(searchableText: string, terms: string[]): boolean {
  if (!terms.length) return true;
  const normText = searchableText.normalize('NFKC').toLowerCase();
  return terms.every((term) => matchSearchTerm(normText, term.normalize('NFKC').toLowerCase()));
}
