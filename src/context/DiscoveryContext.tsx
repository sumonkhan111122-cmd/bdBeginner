import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  getGuestWishlist,
  setGuestWishlist,
  getGuestRecentlyViewed,
  setGuestRecentlyViewed,
  clearGuestRecentlyViewed,
  subscribeGuestDiscovery,
} from '@/services/discoveryLocal';
import {
  fetchWishlist,
  addToWishlistDb,
  removeFromWishlistDb,
  mergeGuestWishlistDb,
  fetchRecentlyViewed,
  addToRecentlyViewedDb,
  clearRecentlyViewedDb,
  mergeGuestRecentlyViewedDb,
} from '@/services/discoveryDb';
import { trackAddToWishlist } from '@/lib/tracking';

type DiscoveryState = {
  wishlistIds: string[];
  recentlyViewedIds: string[];
  loading: boolean;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  addRecentlyViewed: (productId: string) => Promise<void>;
  clearRecentlyViewed: () => Promise<void>;
};

const DiscoveryContext = createContext<DiscoveryState | null>(null);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useCustomerAuth();
  const userId = session?.user.id;
  const activeUserRef = useRef(userId);
  activeUserRef.current = userId;
  
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const wishlistRef = useRef<string[]>([]);
  const recentlyViewedRef = useRef<string[]>([]);
  const readyRef = useRef(false);
  const pendingWishlist = useRef(new Set<string>());
  const queuedRecent = useRef<{ owner: string | undefined; ids: string[] }>({ owner: userId, ids: [] });

  const updateWishlist = useCallback((ids: string[]) => {
    wishlistRef.current = ids;
    setWishlistIds(ids);
  }, []);

  const updateRecent = useCallback((ids: string[]) => {
    recentlyViewedRef.current = ids;
    setRecentlyViewedIds(ids);
  }, []);

  // Initialize and handle auth transitions
  useEffect(() => {
    let mounted = true;
    readyRef.current = false;

    async function initialize() {
      if (authLoading) return;

      setLoading(true);
      updateWishlist([]);
      updateRecent([]);
      let nextWishlist: string[] = [];
      let nextRecent: string[] = [];

      try {
        if (userId) {
          const guestWishlist = getGuestWishlist();
          const guestRecent = getGuestRecentlyViewed();

          // Keep guest data when a merge fails, and preserve additions from other tabs.
          if (guestWishlist.length > 0) {
            const merged = await mergeGuestWishlistDb(guestWishlist);
            if (!mounted) return;
            if (merged) setGuestWishlist(getGuestWishlist().filter(id => !guestWishlist.includes(id)));
          }
          if (guestRecent.length > 0) {
            const merged = await mergeGuestRecentlyViewedDb(guestRecent);
            if (!mounted) return;
            if (merged) setGuestRecentlyViewed(getGuestRecentlyViewed().filter(id => !guestRecent.includes(id)));
          }
          if (!mounted) return;

          const [dbWishlist, dbRecent] = await Promise.all([fetchWishlist(), fetchRecentlyViewed()]);
          nextWishlist = dbWishlist.map(item => item.product_id);
          nextRecent = dbRecent.map(item => item.product_id);
        } else {
          nextWishlist = getGuestWishlist();
          nextRecent = getGuestRecentlyViewed();
        }
      } catch (error) {
        console.error('Could not initialize saved products', error);
      } finally {
        if (mounted) {
          const queued = queuedRecent.current.owner === userId ? queuedRecent.current.ids : [];
          queuedRecent.current = { owner: userId, ids: [] };
          const recent = [...new Set([...queued, ...nextRecent])].slice(0, 12);
          updateWishlist(nextWishlist);
          updateRecent(recent);
          readyRef.current = true;
          setLoading(false);

          if (queued.length > 0) {
            if (userId) {
              void Promise.all(queued.map(id => addToRecentlyViewedDb(id))).catch(error => {
                console.error('Could not save recently viewed products', error);
              });
            } else {
              setGuestRecentlyViewed(recent);
            }
          }
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [userId, authLoading, updateWishlist, updateRecent]);

  useEffect(() => {
    if (userId || authLoading) return;
    return subscribeGuestDiscovery(() => {
      if (!readyRef.current) return;
      updateWishlist(getGuestWishlist());
      updateRecent(getGuestRecentlyViewed());
    });
  }, [userId, authLoading, updateWishlist, updateRecent]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!productId.trim() || !readyRef.current) return;
    const operationKey = `${userId || 'guest'}:${productId}`;
    if (pendingWishlist.current.has(operationKey)) return;
    pendingWishlist.current.add(operationKey);
    const isCurrentlySaved = wishlistRef.current.includes(productId);
    const next = isCurrentlySaved
      ? wishlistRef.current.filter(id => id !== productId)
      : [...wishlistRef.current, productId];
    updateWishlist(next);

    try {
      if (userId) {
        const success = isCurrentlySaved
          ? await removeFromWishlistDb(productId)
          : await addToWishlistDb(productId);
        if (!success) throw new Error('Wishlist update failed');
        if (activeUserRef.current !== userId) return;
        // A removal also cancels a guest item retained after a failed login merge.
        if (isCurrentlySaved) setGuestWishlist(getGuestWishlist().filter(id => id !== productId));
      } else {
        setGuestWishlist(next);
      }
      if (!isCurrentlySaved) trackAddToWishlist({ id: productId });
    } catch (error) {
      if (activeUserRef.current === userId) {
        updateWishlist(isCurrentlySaved
          ? [...new Set([...wishlistRef.current, productId])]
          : wishlistRef.current.filter(id => id !== productId));
      }
      console.error('Could not update wishlist', error);
    } finally {
      pendingWishlist.current.delete(operationKey);
    }
  }, [userId, updateWishlist]);

  const addRecentlyViewed = useCallback(async (productId: string) => {
    if (!productId.trim()) return;
    if (!readyRef.current) {
      const current = queuedRecent.current.owner === userId ? queuedRecent.current.ids : [];
      queuedRecent.current = { owner: userId, ids: [productId, ...current.filter(id => id !== productId)].slice(0, 12) };
      if (!userId) setGuestRecentlyViewed([productId, ...getGuestRecentlyViewed().filter(id => id !== productId)]);
      return;
    }
    const next = [productId, ...recentlyViewedRef.current.filter(id => id !== productId)].slice(0, 12);
    updateRecent(next);
    if (userId) {
      try {
        await addToRecentlyViewedDb(productId);
      } catch (error) {
        console.error('Could not save recently viewed product', error);
      }
    } else {
      setGuestRecentlyViewed(next);
    }
  }, [userId, updateRecent]);

  const clearRecentlyViewed = useCallback(async () => {
    if (!readyRef.current) return;
    const previous = recentlyViewedRef.current;
    updateRecent([]);
    if (userId) {
      try {
        if (!await clearRecentlyViewedDb()) throw new Error('History could not be cleared');
      } catch (error) {
        if (activeUserRef.current === userId && recentlyViewedRef.current.length === 0) updateRecent(previous);
        console.error('Could not clear recently viewed products', error);
      }
    } else {
      clearGuestRecentlyViewed();
    }
  }, [userId, updateRecent]);

  const value = useMemo<DiscoveryState>(
    () => ({
      wishlistIds,
      recentlyViewedIds,
      loading,
      isInWishlist,
      toggleWishlist,
      addRecentlyViewed,
      clearRecentlyViewed,
    }),
    [wishlistIds, recentlyViewedIds, loading, isInWishlist, toggleWishlist, addRecentlyViewed, clearRecentlyViewed]
  );

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>;
}

export function useDiscovery(): DiscoveryState {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error('useDiscovery must be used within DiscoveryProvider');
  return ctx;
}
