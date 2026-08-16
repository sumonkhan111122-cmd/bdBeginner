import { useState, useEffect } from 'react';
import { Star, ShieldCheck, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { fetchAdminReviews } from '@/services/reviews';
import type { ProductReviewAdmin } from '@/types/reviews';
import { ReviewModerationModal } from '@/components/admin/ReviewModerationModal';

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ProductReviewAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedReview, setSelectedReview] = useState<ProductReviewAdmin | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = () => {
    setLoading(true);
    fetchAdminReviews().then(data => {
      setReviews(data);
      setLoading(false);
    });
  };

  const filteredReviews = reviews.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Product Reviews</h1>
          <p className="mt-2 text-ink-600">Moderate and respond to customer reviews.</p>
        </div>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-ink-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Reviews</option>
            <option value="pending">Pending Moderation</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-50/50 text-ink-500">
              <tr>
                <th className="whitespace-nowrap px-6 py-4 font-semibold">Product & Customer</th>
                <th className="whitespace-nowrap px-6 py-4 font-semibold">Rating & Review</th>
                <th className="whitespace-nowrap px-6 py-4 font-semibold">Status</th>
                <th className="whitespace-nowrap px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-ink-500">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                  </td>
                </tr>
              ) : filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-ink-500">
                    No reviews found matching your filter.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="transition-colors hover:bg-ink-50/50">
                    <td className="px-6 py-4 align-top">
                      <div className="font-semibold text-ink-900 mb-1">{review.product?.name || 'Unknown product'}</div>
                      <div className="text-ink-600">{review.reviewer_name}</div>
                      {review.verified_purchase && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase text-success-600">
                          <ShieldCheck size={12} /> Verified
                        </div>
                      )}
                      <div className="mt-2 text-[10px] text-ink-400">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-md">
                      <div className="flex items-center gap-1 text-warning-400 mb-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'fill-warning-400' : 'fill-ink-100 text-ink-200'} />
                        ))}
                      </div>
                      {review.title && <div className="font-bold text-ink-900 mb-1">{review.title}</div>}
                      <p className="line-clamp-3 text-ink-700">{review.review_text}</p>
                      {review.admin_response && (
                        <div className="mt-2 text-xs font-semibold text-brand-600">
                          ↳ Responded
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <Button onClick={() => setSelectedReview(review)} variant="outline" size="sm">
                        Moderate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedReview && (
        <ReviewModerationModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSuccess={() => {
            setSelectedReview(null);
            loadReviews();
          }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return <Badge variant="featured">Approved</Badge>;
  if (status === 'pending') return <Badge variant="new">Pending</Badge>;
  return <span className="inline-flex rounded-full bg-error-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-error-700">Rejected</span>;
}
