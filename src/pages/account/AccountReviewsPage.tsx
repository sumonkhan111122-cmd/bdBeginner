import { useEffect, useState } from 'react';
import { ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StaticStarRating } from '@/components/reviews/StarRating';
import { fetchCustomerReviews, deleteReview } from '@/services/reviews';
import type { ProductReviewAdmin } from '@/types/reviews';
import { AccountLayout } from '@/components/account/AccountLayout';

export function AccountReviewsPage() {
  const [reviews, setReviews] = useState<ProductReviewAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCustomerReviews().then(data => {
      if (active) {
        setReviews(data);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    const { success } = await deleteReview(id);
    if (success) {
      setReviews(prev => prev.filter(r => r.id !== id));
    } else {
      alert('Failed to delete review.');
    }
  };

  if (loading) {
    return (
      <AccountLayout>
        <div className="h-64 animate-pulse rounded-2xl bg-ink-50" />
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">My Reviews</h1>
        <p className="mt-2 text-ink-600">Manage your product reviews and ratings.</p>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-ink-100 bg-white py-16 text-center shadow-soft">
          <MessageSquare size={40} className="text-ink-200 mb-4" />
          <h2 className="font-display text-lg font-bold text-ink-900">No reviews yet</h2>
          <p className="mt-2 max-w-sm text-sm text-ink-500">
            You haven't reviewed any products yet. Visit your purchased products to leave a review.
          </p>
          <div className="mt-6">
            <Button to="/account/orders" variant="primary">View My Orders</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.map(review => {
            const product = review.product;
            const productName = product?.name || 'Unknown Product';
            const productSlug = product?.slug;

            return (
              <div key={review.id} className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all hover:border-brand-200 hover:shadow-hover">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-100 pb-4">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-ink-900">{productName}</h3>
                    <div className="flex items-center gap-2">
                      <StaticStarRating value={review.rating} size={14} />
                      <span className="text-xs text-ink-500">
                        {new Date(review.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={review.status} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {review.title && <h4 className="font-bold text-ink-900">{review.title}</h4>}
                  <p className="text-sm leading-relaxed text-ink-700 whitespace-pre-wrap">{review.review_text}</p>
                </div>

                {review.status === 'rejected' && review.rejection_reason && (
                  <div className="mt-2 flex items-start gap-2 rounded-xl bg-error-50 p-4 text-sm text-error-800 border border-error-100">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-error-600" />
                    <div>
                      <p className="font-semibold text-error-900 mb-1">Changes requested by moderator:</p>
                      <p>{review.rejection_reason}</p>
                    </div>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2 text-xs text-ink-500">
                    {review.verified_purchase && (
                      <span className="flex items-center gap-1 text-success-600 font-semibold">
                        <ShieldCheck size={14} /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-sm font-semibold text-error-600 hover:text-error-700"
                    >
                      Delete
                    </button>
                    {productSlug && (
                      <Button to={`/products/${productSlug}`} variant="outline" size="sm">
                        View Product
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </AccountLayout>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-warning-50 text-warning-700 border-warning-200',
    approved: 'bg-success-50 text-success-700 border-success-200',
    rejected: 'bg-error-50 text-error-700 border-error-200'
  }[status] || 'bg-ink-50 text-ink-700 border-ink-200';

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${styles}`}>
      {status}
    </span>
  );
}
