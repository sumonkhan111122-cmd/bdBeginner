import { getSupabase } from '@/lib/supabase';
import type { WishlistItemRow, RecentlyViewedRow } from '@/types/discovery';

export async function fetchWishlist(): Promise<WishlistItemRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
  return data || [];
}

export async function addToWishlistDb(productId: string): Promise<boolean> {
  const sb = getSupabase();
  // Using user() from auth is implicitly handled by RLS, we only need to pass the product_id. 
  // We'll rely on the DB having `user_id` defaulting to `auth.uid()` or similar, 
  // or we need to pass `user_id`. Wait, we don't have the user_id here. 
  // Let's pass user_id explicitly or just rely on RLS and default values.
  // We'll get user_id from sb.auth.getUser() to be safe.
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const { error } = await sb
    .from('wishlist_items')
    .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' });

  if (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
  return true;
}

export async function removeFromWishlistDb(productId: string): Promise<boolean> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const { error } = await sb
    .from('wishlist_items')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
  return true;
}

export async function mergeGuestWishlistDb(productIds: string[]): Promise<boolean> {
  if (!productIds.length) return true;
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const rows = productIds.map(productId => ({ user_id: user.id, product_id: productId }));
  const { error } = await sb
    .from('wishlist_items')
    .upsert(rows, { onConflict: 'user_id,product_id' });

  if (error) {
    console.error('Error merging wishlist:', error);
    return false;
  }
  return true;
}

export async function fetchRecentlyViewed(): Promise<RecentlyViewedRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('recently_viewed_products')
    .select('*')
    .order('last_viewed_at', { ascending: false })
    .limit(12);

  if (error) {
    console.error('Error fetching recently viewed:', error);
    return [];
  }
  return data || [];
}

export async function addToRecentlyViewedDb(productId: string): Promise<boolean> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  // Since we want to increment view count, we might just upsert with last_viewed_at=now()
  // If we need to read view_count to increment it, we can use an RPC or just let default behavior work 
  // (if Supabase has an RPC for it). If not, we'll just upsert which might reset view_count depending on DB schema.
  // The requirements say: "Increment view_count. Do not create a new row on every view."
  // Upsert without specifying view_count will use default or null. 
  // Better approach: use a rpc if available. For now we will try to fetch and update or just do a standard upsert.
  // Actually, we can fetch the existing row to get the view count.
  const { data: existing } = await sb
    .from('recently_viewed_products')
    .select('view_count')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  const currentCount = existing?.view_count ?? 0;

  const { error } = await sb
    .from('recently_viewed_products')
    .upsert({ 
      user_id: user.id, 
      product_id: productId, 
      last_viewed_at: new Date().toISOString(),
      view_count: currentCount + 1
    }, { onConflict: 'user_id,product_id' });

  if (error) {
    console.error('Error adding to recently viewed:', error);
    return false;
  }
  return true;
}

export async function clearRecentlyViewedDb(): Promise<boolean> {
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const { error } = await sb
    .from('recently_viewed_products')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error clearing recently viewed:', error);
    return false;
  }
  return true;
}

export async function mergeGuestRecentlyViewedDb(productIds: string[]): Promise<boolean> {
  if (!productIds.length) return true;
  
  // To avoid blasting the DB with N select queries for view_count, 
  // we can just insert them with view_count=1 using upsert (it will overwrite existing view_counts though, but that's a small tradeoff for guest merge)
  // or we can process them sequentially
  const sb = getSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;

  const { data: existingRows } = await sb
    .from('recently_viewed_products')
    .select('product_id, view_count')
    .eq('user_id', user.id)
    .in('product_id', productIds);

  const existingMap = new Map(existingRows?.map(r => [r.product_id, r.view_count]) || []);

  const rows = productIds.map((productId, index) => {
    // Stagger the last_viewed_at slightly so order is preserved (most recent first)
    const time = new Date(Date.now() - index * 1000).toISOString();
    return {
      user_id: user.id,
      product_id: productId,
      last_viewed_at: time,
      view_count: (existingMap.get(productId) ?? 0) + 1,
    };
  });

  const { error } = await sb
    .from('recently_viewed_products')
    .upsert(rows, { onConflict: 'user_id,product_id' });

  if (error) {
    console.error('Error merging recently viewed:', error);
    return false;
  }
  return true;
}
