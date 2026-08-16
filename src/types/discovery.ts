export type WishlistItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type RecentlyViewedRow = {
  id: string;
  user_id: string;
  product_id: string;
  last_viewed_at: string;
  view_count: number;
};
