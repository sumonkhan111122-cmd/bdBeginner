import { useState, useEffect } from 'react';
import { ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StarRating, StaticStarRating } from './StarRating';
import { 
  fetchProductReviewStats, 
  fetchProductReviewsPublic, 
  getReviewEligibility, 
  submitReview 
} from '@/services/reviews';
import type { ProductReviewAdmin, ProductReviewStats, ProductReviewPublic, ReviewEligibility } from '@/types/reviews';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import type { Product } from '@/types';
import { ProductStructuredData } from '@/components/seo/ProductStructuredData';

export function ProductReviewsSection({ product }: { product: Product }) {
  const { session } = useCustomerAuth();
  const productId = product.id;
  const [stats, setStats] = useState<ProductReviewStats | null>(null);
  const [reviews, setReviews] = useState<ProductReviewPublic[]>([]);
  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  
  useEffect(() => {
    let active = true;
    
    Promise.all([
      fetchProductReviewStats(productId),
      fetchProductReviewsPublic(productId),
      getReviewEligibility(productId)
    ]).then(([statsData, reviewsData, eligibilityData]) => {
      if (active) {
        setStats(statsData);
        setReviews(reviewsData);
        setEligibility(eligibilityData);
        setLoading(false);
        
        // If eligible but no current review, we could theoretically show the form directly or keep it behind a button
        // Let's keep it behind a button for now.
        if (eligibilityData.current_review) {
          setShowForm(true);
        }
      }
    }).catch(err => {
      console.error(err);
      if (active) setLoading(false);
    });
    
    return () => { active = false; };
  }, [productId, session]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-ink-50" />;
  }

  const handleReviewSuccess = () => {
    // Refresh eligibility to show pending state
    getReviewEligibility(productId).then(setEligibility);
    setShowForm(false);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ProductStructuredData product={product} reviewStats={stats} reviews={reviews} />
      <div className="grid gap-10 md:grid-cols-3">
        
        {/* Left Column: Stats & Actions */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold text-ink-900">Customer Reviews</h2>
          
          {stats && stats.review_count > 0 ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-ink-900">{stats.average_rating.toFixed(1)}</span>
                <div className="flex flex-col">
                  <StaticStarRating value={stats.average_rating} size={20} />
                  <span className="text-sm text-ink-500 mt-1">Based on {stats.review_count} review{stats.review_count !== 1 && 's'}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = stats.rating_distribution[stars as keyof typeof stats.rating_distribution] || 0;
                  const pct = stats.review_count > 0 ? (count / stats.review_count) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3 text-sm">
                      <div className="flex w-12 items-center justify-end gap-1 text-ink-600">
                        <span>{stars}</span>
                        <StaticStarRating value={1} size={12} />
                      </div>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
                        <div className="h-full bg-warning-400" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-8 text-right text-ink-500">{count}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 text-ink-500">
              <p>No reviews yet.</p>
              <p className="text-sm">Be the first verified buyer to review this product.</p>
            </div>
          )}

          <div className="mt-4 pt-6 border-t border-ink-100">
            {!session ? (
              <div className="rounded-xl bg-ink-50 p-5">
                <p className="font-semibold text-ink-900 mb-1">Purchased this product?</p>
                <p className="text-sm text-ink-600 mb-4">Sign in to leave a review.</p>
                <Button to="/login" variant="outline" fullWidth>Sign In</Button>
              </div>
            ) : eligibility?.eligible ? (
              eligibility.current_review ? (
                <div className="rounded-xl border border-ink-200 p-5">
                  <p className="font-semibold text-ink-900 mb-1">Your Review</p>
                  <p className="text-sm text-ink-600 mb-4 capitalize">Status: {eligibility.current_review.status}</p>
                  <Button onClick={() => setShowForm(true)} variant="outline" fullWidth>Edit Review</Button>
                </div>
              ) : (
                <Button onClick={() => setShowForm(true)} variant="primary" fullWidth>Write a Review</Button>
              )
            ) : (
              <div className="rounded-xl bg-ink-50 p-5 text-sm text-ink-600 flex gap-2">
                <ShieldCheck size={18} className="text-ink-400 shrink-0" />
                <p>Only customers with a verified paid purchase can submit a review.</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column: Review List & Form */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {showForm && eligibility?.eligible ? (
            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
              <h3 className="text-lg font-bold text-ink-900 mb-4">
                {eligibility.current_review ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <ReviewForm 
                productId={productId} 
                existingReview={eligibility.current_review}
                onSuccess={handleReviewSuccess}
                onCancel={() => setShowForm(false)}
              />
            </div>
          ) : eligibility?.current_review && (eligibility.current_review.status === 'pending' || eligibility.current_review.status === 'rejected') ? (
            <div className={`rounded-2xl border p-6 shadow-soft ${
              eligibility.current_review.status === 'rejected' ? 'border-error-200 bg-error-50/50' : 'border-warning-200 bg-warning-50/50'
            }`}>
              <h3 className="font-bold text-ink-900 mb-2">
                {eligibility.current_review.status === 'rejected' ? 'Review Needs Changes' : 'Review Pending Moderation'}
              </h3>
              {eligibility.current_review.status === 'rejected' && eligibility.current_review.rejection_reason && (
                <p className="text-sm text-error-700 mb-4">Reason: {eligibility.current_review.rejection_reason}</p>
              )}
              {eligibility.current_review.status === 'pending' && (
                <p className="text-sm text-ink-600 mb-4">Thank you for your review. It is currently awaiting moderation before being published.</p>
              )}
              <div className="rounded-xl bg-white p-4 opacity-75 pointer-events-none border border-ink-100">
                <ReviewCard review={eligibility.current_review as ProductReviewPublic} />
              </div>
            </div>
          ) : reviews.length > 0 ? (
            <div className="flex flex-col gap-5">
              {reviews.map(review => (
                <div key={review.id} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-100 bg-ink-50/50 py-16 text-center">
              <MessageSquare size={32} className="text-ink-300 mb-3" />
              <p className="font-medium text-ink-900">No reviews yet</p>
              <p className="text-sm text-ink-500 mt-1">Check back later for customer feedback.</p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ProductReviewPublic }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <StaticStarRating value={review.rating} size={16} />
          {review.title && <h4 className="mt-2 font-bold text-ink-900">{review.title}</h4>}
        </div>
        <span className="text-xs text-ink-400 whitespace-nowrap">
          {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      </div>
      
      <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-wrap">{review.review_text}</p>
      
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-semibold text-ink-900">{review.reviewer_name}</span>
        {review.verified_purchase && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success-700 border border-success-200">
            <ShieldCheck size={12} />
            Verified Purchase
          </span>
        )}
      </div>

      {review.admin_response && (
        <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-5 w-5 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-bold text-white">B</span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-800">Response from bdBeginner</span>
          </div>
          <p className="text-sm leading-relaxed text-ink-800 whitespace-pre-wrap">{review.admin_response}</p>
        </div>
      )}
    </div>
  );
}

function ReviewForm({ 
  productId, 
  existingReview, 
  onSuccess,
  onCancel
}: { 
  productId: string;
  existingReview?: ProductReviewAdmin;
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [reviewText, setReviewText] = useState(existingReview?.review_text || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating.');
      return;
    }
    if (reviewText.length < 10) {
      setError('Review must be at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    
    const { success, error: submitError } = await submitReview(productId, rating, title || null, reviewText);
    
    if (success) {
      onSuccess();
    } else {
      setError(submitError || 'Failed to submit review.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {existingReview && (
        <div className="rounded-xl border border-warning-200 bg-warning-50 p-4 text-sm text-warning-800">
          <strong>Note:</strong> Editing this review will return it to a pending moderation state before being published again.
        </div>
      )}
      
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink-900">Rating <span className="text-error-500">*</span></label>
        <StarRating value={rating} onChange={setRating} size={28} />
      </div>
      
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink-900" htmlFor="title">Review Title (Optional)</label>
        <input
          id="title"
          type="text"
          maxLength={120}
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Summarize your experience"
        />
      </div>
      
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink-900" htmlFor="reviewText">Review <span className="text-error-500">*</span></label>
        <textarea
          id="reviewText"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          value={reviewText}
          onChange={e => setReviewText(e.target.value)}
          className="w-full rounded-xl border border-ink-200 bg-white p-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 resize-y"
          placeholder="What did you like or dislike? What did you use this product for?"
        />
        <div className="mt-1.5 flex justify-between text-xs text-ink-500">
          <span>Minimum 10 characters</span>
          <span>{reviewText.length}/2000</span>
        </div>
      </div>
      
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex items-center gap-3 mt-2">
        <Button type="submit" disabled={loading} variant="primary" className="flex-1">
          {loading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
        </Button>
        {onCancel && (
          <Button type="button" onClick={onCancel} disabled={loading} variant="outline">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
