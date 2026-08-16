const WISHLIST_KEY = 'bdbeginner_guest_wishlist_v1';
const RECENTLY_VIEWED_KEY = 'bdbeginner_recently_viewed_v1';
const MAX_RECENTLY_VIEWED = 12;

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch (err) {
    console.error(`Error parsing localStorage key "${key}"`, err);
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error setting localStorage key "${key}"`, err);
  }
}

export function getGuestWishlist(): string[] {
  const data = safeParse<string[]>(WISHLIST_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function setGuestWishlist(productIds: string[]) {
  // Ensure array of strings and unique
  const uniqueIds = Array.from(new Set(productIds.filter((id) => typeof id === 'string')));
  safeSet(WISHLIST_KEY, uniqueIds);
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
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(WISHLIST_KEY);
}

export function getGuestRecentlyViewed(): string[] {
  const data = safeParse<string[]>(RECENTLY_VIEWED_KEY, []);
  return Array.isArray(data) ? data : [];
}

export function setGuestRecentlyViewed(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.filter((id) => typeof id === 'string'))).slice(0, MAX_RECENTLY_VIEWED);
  safeSet(RECENTLY_VIEWED_KEY, uniqueIds);
}

export function addGuestRecentlyViewed(productId: string) {
  const current = getGuestRecentlyViewed();
  const filtered = current.filter((id) => id !== productId);
  setGuestRecentlyViewed([productId, ...filtered]);
}

export function clearGuestRecentlyViewed() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(RECENTLY_VIEWED_KEY);
}
