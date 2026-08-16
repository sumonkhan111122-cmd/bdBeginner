import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

export function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const orderNumber = searchParams.get('order_number');
  const message = searchParams.get('message');
  const reason = searchParams.get('reason');

  // If no params, redirect home
  useEffect(() => {
    if (!status) {
      navigate('/', { replace: true });
    }
  }, [status, navigate]);

  if (!status) return null;

  return (
    <Layout>
      <div className="container-page py-16 sm:py-24">
        <div className="mx-auto max-w-md text-center">
          
          {status === 'success' ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-50 text-success-600">
                <CheckCircle2 size={40} />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">Payment Successful</h1>
              <p className="mt-3 text-ink-500">
                {reason === 'already_paid' 
                  ? 'This order has already been paid successfully.'
                  : 'Your payment was processed successfully. Thank you for your order!'}
              </p>
              {orderNumber && (
                <div className="mt-8">
                  <Button to={`/order/success/${encodeURIComponent(orderNumber)}`} size="lg" fullWidth>
                    View Order Details
                  </Button>
                </div>
              )}
            </>
          ) : status === 'cancel' || status === 'cancelled' ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning-50 text-warning-600">
                <AlertCircle size={40} />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">Payment Cancelled</h1>
              <p className="mt-3 text-ink-500">
                You cancelled the payment process. Your order has been saved and you can try again later.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {orderNumber && (
                  <Button to={`/order/success/${encodeURIComponent(orderNumber)}`} size="lg" fullWidth>
                    <RefreshCcw size={18} className="mr-2" /> Try Payment Again
                  </Button>
                )}
                <Button to="/products" variant="outline" size="lg" fullWidth>
                  Continue Shopping
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-error-50 text-error-600">
                <XCircle size={40} />
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold text-ink-900">Payment Failed</h1>
              <p className="mt-3 text-ink-500">
                {message === 'order_not_found' 
                  ? 'We could not find the order associated with this payment.'
                  : 'We were unable to process your payment. Please check your details and try again.'}
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {orderNumber && (
                  <Button to={`/order/success/${encodeURIComponent(orderNumber)}`} size="lg" fullWidth>
                    <RefreshCcw size={18} className="mr-2" /> Try Payment Again
                  </Button>
                )}
                <Button to="/contact" variant="outline" size="lg" fullWidth>
                  Contact Support
                </Button>
              </div>
            </>
          )}

        </div>
      </div>
    </Layout>
  );
}
