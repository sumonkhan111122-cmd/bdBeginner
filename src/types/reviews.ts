export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type ProductReviewPublic = {
  id: string;
  product_id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  review_text: string;
  admin_response: string | null;
  created_at: string;
  verified_purchase: boolean;
};

export type ProductReviewStats = {
  product_id: string;
  average_rating: number;
  review_count: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type ProductReviewAdmin = ProductReviewPublic & {
  user_id: string;
  order_id: string;
  status: ReviewStatus;
  rejection_reason: string | null;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  product?: { name: string; slug?: string | null } | null;
};

export type ReviewEligibility = {
  eligible: boolean;
  current_review?: ProductReviewAdmin;
};
