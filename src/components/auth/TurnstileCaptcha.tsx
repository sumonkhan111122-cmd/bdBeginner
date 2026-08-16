import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Cloudflare Turnstile global types
type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
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

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.turnstile && widgetIdRef.current) {
          window.turnstile.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      if (!siteKey) {
        return;
      }

      const renderWidget = () => {
        if (containerRef.current && window.turnstile && !widgetIdRef.current) {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            'error-callback': onError,
            'expired-callback': onExpire,
            theme: 'light',
          });
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
    }, [siteKey, onVerify, onError, onExpire]);

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
      <div className="flex justify-center w-full min-h-[65px]">
        <div ref={containerRef} />
      </div>
    );
  }
);

TurnstileCaptcha.displayName = 'TurnstileCaptcha';
