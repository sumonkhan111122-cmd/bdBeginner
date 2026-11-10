export const WISHLIST_KEY = 'bdbeginner_guest_wishlist_v1';
export const RECENTLY_VIEWED_KEY = 'bdbeginner_recently_viewed_v1';
const MAX_RECENTLY_VIEWED = 12;

function normalizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id): id is string => typeof id === 'string').map(id => id.trim()).filter(Boolean))];
}

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const item = window.localStorage.getItem(key);
    return item ? normalizeIds(JSON.parse(item)) : [];
  } catch {
    return [];
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* Browsers may block storage; the current session still works. */ }
}

function safeRemove(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch { /* Storage is optional. */ }
}

export function getGuestWishlist(): string[] {
  return readIds(WISHLIST_KEY);
}

export function setGuestWishlist(productIds: string[]) {
  safeSet(WISHLIST_KEY, normalizeIds(productIds));
}

export function addToGuestWishlist(productId: string) {
  const current = getGuestWishlist();
  if (!current.includes(productId)) {
    setGuestWishlist([...current, productId]);
  }
}

export function removeFromGuestWishlist(productId: string) {
  const current = getGuestWishlist();
  setGuestWishlist(current.filter((id) => id !== productId));
}

export function clearGuestWishlist() {
  safeRemove(WISHLIST_KEY);
}

export function getGuestRecentlyViewed(): string[] {
  return readIds(RECENTLY_VIEWED_KEY).slice(0, MAX_RECENTLY_VIEWED);
}

export function setGuestRecentlyViewed(productIds: string[]) {
  const uniqueIds = normalizeIds(productIds).slice(0, MAX_RECENTLY_VIEWED);
  safeSet(RECENTLY_VIEWED_KEY, uniqueIds);
}

export function addGuestRecentlyViewed(productId: string) {
  const current = getGuestRecentlyViewed();
  const filtered = current.filter((id) => id !== productId);
  setGuestRecentlyViewed([productId, ...filtered]);
}

export function clearGuestRecentlyViewed() {
  safeRemove(RECENTLY_VIEWED_KEY);
}

export function subscribeGuestDiscovery(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === WISHLIST_KEY || event.key === RECENTLY_VIEWED_KEY) onChange();
  };
  window.addEventListener('storage', handleStorage);
  return () => window.removeEventListener('storage', handleStorage);
}
