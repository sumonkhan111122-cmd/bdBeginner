import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import {
  getGuestWishlist,
  setGuestWishlist,
  getGuestRecentlyViewed,
  setGuestRecentlyViewed,
  clearGuestWishlist,
  clearGuestRecentlyViewed,
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
  
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize and handle auth transitions
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      if (authLoading) return;

      setLoading(true);
      
      if (session?.user) {
        // Authenticated: Handle guest merge first
        const guestWishlist = getGuestWishlist();
        const guestRecent = getGuestRecentlyViewed();
        
        if (guestWishlist.length > 0) {
          await mergeGuestWishlistDb(guestWishlist);
          clearGuestWishlist();
        }
        
        if (guestRecent.length > 0) {
          await mergeGuestRecentlyViewedDb(guestRecent);
          clearGuestRecentlyViewed();
        }

        // Fetch user data
        const [dbWishlist, dbRecent] = await Promise.all([
          fetchWishlist(),
          fetchRecentlyViewed(),
        ]);

        if (mounted) {
          setWishlistIds(dbWishlist.map(w => w.product_id));
          setRecentlyViewedIds(dbRecent.map(r => r.product_id));
        }
      } else {
        // Guest: Load from local storage
        if (mounted) {
          setWishlistIds(getGuestWishlist());
          setRecentlyViewedIds(getGuestRecentlyViewed());
        }
      }

      if (mounted) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [session?.user, authLoading]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const toggleWishlist = useCallback(async (productId: string) => {
    const isCurrentlySaved = wishlistIds.includes(productId);
    
    // Optimistic UI update
    setWishlistIds((prev) => 
      isCurrentlySaved 
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    if (session?.user) {
      // Authenticated flow
      const success = isCurrentlySaved 
        ? await removeFromWishlistDb(productId)
        : await addToWishlistDb(productId);
        
      if (!success) {
        // Revert on failure
        setWishlistIds((prev) => 
          isCurrentlySaved 
            ? [...prev, productId]
            : prev.filter((id) => id !== productId)
        );
      }
    } else {
      // Guest flow
      const current = getGuestWishlist();
      const next = isCurrentlySaved
        ? current.filter(id => id !== productId)
        : [...current, productId];
      setGuestWishlist(next);
      // setWishlistIds is already updated optimistically
    }
  }, [session?.user, wishlistIds]);

  const addRecentlyViewed = useCallback(async (productId: string) => {
    // Optimistic UI update
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter(id => id !== productId);
      return [productId, ...filtered].slice(0, 12);
    });

    if (session?.user) {
      await addToRecentlyViewedDb(productId);
    } else {
      const current = getGuestRecentlyViewed();
      const filtered = current.filter(id => id !== productId);
      setGuestRecentlyViewed([productId, ...filtered]);
    }
  }, [session?.user]);

  const clearRecentlyViewed = useCallback(async () => {
    setRecentlyViewedIds([]);
    
    if (session?.user) {
      await clearRecentlyViewedDb();
    } else {
      clearGuestRecentlyViewed();
    }
  }, [session?.user]);

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
