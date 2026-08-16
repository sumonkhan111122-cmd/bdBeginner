import { getSupabase } from '@/lib/supabase';
import type { 
  ProductReviewPublic, 
  ProductReviewStats, 
  ProductReviewAdmin, 
  ReviewEligibility,
} from '@/types/reviews';

export async function fetchProductReviewStats(productId: string): Promise<ProductReviewStats | null> {
  const { data, error } = await getSupabase()
    .from('product_review_stats')
    .select('*')
    .eq('product_id', productId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch review stats:', error);
    return null;
  }
  return data as ProductReviewStats | null;
}

export async function fetchProductReviewsPublic(productId: string): Promise<ProductReviewPublic[]> {
  const { data, error } = await getSupabase()
    .from('product_reviews_public')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch public reviews:', error);
    return [];
  }
  return data as ProductReviewPublic[];
}

export async function getReviewEligibility(productId: string): Promise<ReviewEligibility> {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  
  if (!session) {
    return { eligible: false };
  }

  const { data: eligible, error: eligibilityError } = await sb.rpc('get_product_review_eligibility', {
    p_product_id: productId
  });

  if (eligibilityError) {
    console.error('Failed to check eligibility:', eligibilityError);
    return { eligible: false };
  }

  // Also fetch any existing review for this user and product
  const { data: currentReview, error: reviewError } = await sb
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (reviewError) {
    console.error('Failed to fetch current review:', reviewError);
  }

  return {
    eligible: !!eligible,
    current_review: currentReview as ProductReviewAdmin | undefined
  };
}

export async function submitReview(
  productId: string,
  rating: number,
  title: string | null,
  reviewText: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await getSupabase().rpc('submit_product_review', {
    p_product_id: productId,
    p_rating: rating,
    p_title: title,
    p_review_text: reviewText
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteReview(reviewId: string): Promise<{ success: boolean; error?: string }> {
  const { error } = await getSupabase()
    .from('product_reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function fetchCustomerReviews(): Promise<ProductReviewAdmin[]> {
  const { data, error } = await getSupabase()
    .from('product_reviews')
    .select('*, product:products(name)')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch customer reviews:', error);
    return [];
  }
  
  return data as ProductReviewAdmin[];
}

// Admin functions

export async function fetchAdminReviews(): Promise<ProductReviewAdmin[]> {
  const { data, error } = await getSupabase()
    .from('product_reviews')
    .select('*, product:products(name, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch admin reviews:', error);
    return [];
  }
  return data as ProductReviewAdmin[];
}

export async function moderateReview(
  reviewId: string,
  action: 'approve' | 'reject',
  rejectionReason: string | null = null,
  adminResponse: string | null = null
): Promise<{ success: boolean; error?: string }> {
  const { error } = await getSupabase().rpc('moderate_product_review', {
    p_review_id: reviewId,
    p_action: action,
    p_rejection_reason: rejectionReason,
    p_admin_response: adminResponse
  });

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
