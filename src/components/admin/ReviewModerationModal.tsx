import { useState } from 'react';
import { X, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StaticStarRating } from '@/components/reviews/StarRating';
import { moderateReview } from '@/services/reviews';
import type { ProductReviewAdmin } from '@/types/reviews';

export function ReviewModerationModal({ 
  review, 
  onClose,
  onSuccess
}: { 
  review: ProductReviewAdmin;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [reason, setReason] = useState(review.rejection_reason || '');
  const [response, setResponse] = useState(review.admin_response || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (action === 'reject' && !reason.trim()) {
      setError('A reason is required when rejecting a review.');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await moderateReview(
      review.id,
      action,
      action === 'reject' ? reason : null,
      response.trim() || null
    );

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Failed to moderate review.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]" role="dialog" aria-modal="true" aria-labelledby="review-moderation-title">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 id="review-moderation-title" className="font-display text-xl font-bold text-ink-900">Moderate Review</h2>
          <button onClick={onClose} aria-label="Close review moderation" className="rounded-full p-2 text-ink-400 hover:bg-ink-50 hover:text-ink-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6">
          <div className="flex flex-col gap-6">
            <div className="rounded-xl bg-ink-50 p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-semibold text-ink-900 mb-1">{review.product?.name || 'Unknown product'}</div>
                  <div className="text-sm text-ink-600">By {review.reviewer_name}</div>
                </div>
                {review.verified_purchase && (
                  <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-success-600">
                    <ShieldCheck size={14} /> Verified Purchase
                  </div>
                )}
              </div>
              <div className="mt-2 bg-white rounded-lg p-4 border border-ink-100">
                <StaticStarRating value={review.rating} size={16} />
                {review.title && <h4 className="mt-2 font-bold text-ink-900">{review.title}</h4>}
                <p className="mt-2 text-sm text-ink-700 whitespace-pre-wrap">{review.review_text}</p>
              </div>
            </div>

            <form id="moderation-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink-900">Moderation Action</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition-all ${
                    action === 'approve' ? 'border-success-500 bg-success-50 text-success-700' : 'border-ink-100 bg-white text-ink-600 hover:border-ink-200 hover:bg-ink-50'
                  }`}>
                    <input type="radio" name="action" className="sr-only" checked={action === 'approve'} onChange={() => setAction('approve')} />
                    Approve & Publish
                  </label>
                  <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition-all ${
                    action === 'reject' ? 'border-error-500 bg-error-50 text-error-700' : 'border-ink-100 bg-white text-ink-600 hover:border-ink-200 hover:bg-ink-50'
                  }`}>
                    <input type="radio" name="action" className="sr-only" checked={action === 'reject'} onChange={() => setAction('reject')} />
                    Reject (Request Changes)
                  </label>
                </div>
              </div>

              {action === 'reject' && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-900">Rejection Reason <span className="text-error-500">*</span></label>
                  <p className="mb-2 text-xs text-ink-500">This will be emailed to the customer so they can fix their review.</p>
                  <textarea
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    placeholder="e.g. Please remove personal information from your review."
                    className="w-full rounded-xl border border-ink-200 bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink-900">Public Admin Response (Optional)</label>
                <p className="mb-2 text-xs text-ink-500">Reply publicly to this review. Shows under the review on the product page.</p>
                <textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-ink-200 bg-white p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Thank you for your feedback!"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-error-50 p-3 text-sm text-error-700 border border-error-100">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="border-t border-ink-100 px-6 py-4 flex justify-end gap-3 bg-ink-50 rounded-b-2xl">
          <Button type="button" onClick={onClose} variant="outline" disabled={loading}>Cancel</Button>
          <Button type="submit" form="moderation-form" disabled={loading} variant="primary">
            {loading ? 'Saving...' : 'Save Decision'}
          </Button>
        </div>
      </div>
    </div>
  );
}
