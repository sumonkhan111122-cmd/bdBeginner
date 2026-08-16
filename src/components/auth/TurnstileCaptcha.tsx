import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

// Cloudflare Turnstile global types
type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  theme: 'light' | 'dark' | 'auto';
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
    onloadTurnstileCallback: () => void;
  }
}

export interface TurnstileRef {
  reset: () => void;
}

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export const TurnstileCaptcha = forwardRef<TurnstileRef, TurnstileCaptchaProps>(
  ({ onVerify, onError, onExpire }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    const [status, setStatus] = useState<'loading' | 'ready' | 'verified' | 'error' | 'expired'>('loading');

    // Use a ref for callbacks to avoid re-rendering the Turnstile widget
    // every time the parent component re-renders and passes new inline functions.
    const callbacksRef = useRef({ onVerify, onError, onExpire });
    useEffect(() => {
      callbacksRef.current = { onVerify, onError, onExpire };
    }, [onVerify, onError, onExpire]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
          setStatus('ready');
          if (callbacksRef.current.onExpire) callbacksRef.current.onExpire();
        }
      },
    }));

    useEffect(() => {
      if (!siteKey) {
        return;
      }

      const renderWidget = () => {
        if (containerRef.current && window.turnstile && !widgetIdRef.current) {
          try {
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
              sitekey: siteKey,
              theme: 'light',
              callback: (token: string) => {
                setStatus('verified');
                callbacksRef.current.onVerify(token);
              },
              'error-callback': () => {
                setStatus('error');
                if (callbacksRef.current.onError) callbacksRef.current.onError();
              },
              'expired-callback': () => {
                setStatus('expired');
                if (callbacksRef.current.onExpire) callbacksRef.current.onExpire();
              },
              'timeout-callback': () => {
                setStatus('error');
                if (callbacksRef.current.onError) callbacksRef.current.onError();
              }
            });
            setStatus('ready');
          } catch (e) {
            console.error('Failed to render Turnstile widget', e);
            setStatus('error');
          }
        }
      };

      if (!window.turnstile) {
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        
        window.onloadTurnstileCallback = renderWidget;
        document.head.appendChild(script);
      } else {
        renderWidget();
      }

      return () => {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [siteKey]); // ONLY depend on siteKey to prevent re-render loops

    const handleRetry = () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        setStatus('ready');
        if (callbacksRef.current.onExpire) callbacksRef.current.onExpire();
      }
    };

    if (!siteKey) {
      if (import.meta.env.DEV) {
        return (
          <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-xs font-medium text-warning-800 text-center">
            Development Mode: Turnstile is disabled because VITE_TURNSTILE_SITE_KEY is not set.
          </div>
        );
      }
      return (
        <div role="alert" className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-xs font-medium text-error-800 text-center">
          Sign-in verification is not configured. Please contact support.
        </div>
      );
    }

    return (
      <div className="flex flex-col justify-center items-center w-full min-h-[65px] gap-2">
        <div ref={containerRef} className={status === 'error' ? 'hidden' : 'block'} />
        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 w-full p-3 rounded-xl border border-error-200 bg-error-50">
            <p className="text-sm text-error-700 font-medium text-center">
              Verification could not be completed. Please try again.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              className="text-xs px-4 py-2 bg-white border border-error-200 hover:bg-error-50 text-error-700 rounded-lg transition-colors font-semibold shadow-sm"
            >
              Retry Verification
            </button>
          </div>
        )}
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';

