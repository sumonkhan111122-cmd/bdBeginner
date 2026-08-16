import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Chrome } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { TurnstileCaptcha, type TurnstileRef } from '@/components/auth/TurnstileCaptcha';
import { OtpInput } from '@/components/auth/OtpInput';

export function LoginPage() {
  const { requestOtp, verifyOtp, signInWithGoogle, session, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const turnstileRef = useRef<TurnstileRef>(null);
  const captchaConfigured = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';

  // If already logged in, redirect
  useEffect(() => {
    if (!loading && session) {
      let returnTo = location.state?.from?.pathname || '/account';
      // Security: Only accept safe relative internal routes
      if (typeof returnTo !== 'string' || !returnTo.startsWith('/')) {
        returnTo = '/account';
      }
      navigate(returnTo, { replace: true });
    }
  }, [loading, session, navigate, location]);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (import.meta.env.PROD && !captchaConfigured) {
      setError('Sign-in verification is not configured. Please contact support.');
      return;
    }
    if (captchaConfigured && !captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setError(null);
    setSubmitting(true);
    
    const result = await requestOtp(email.trim(), captchaToken || undefined);
    setSubmitting(false);

    if (result.ok) {
      setStep('otp');
      setCountdown(60); // 60s cooldown for resend
    } else {
      setError(result.error || 'Failed to send code. Please try again.');
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setError(null);
    setSubmitting(true);
    
    const result = await verifyOtp(email.trim(), otp);
    setSubmitting(false);

    if (result.ok) {
      // The CustomerAuthContext (and underlying AdminAuthContext) will update the session, 
      // triggering the useEffect above to redirect.
    } else {
      setError(result.error || 'Verification failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    await signInWithGoogle();
    // After OAuth completes, it will redirect to /auth/callback
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-display font-extrabold text-xl shadow-md">
              b
            </span>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-ink-900">
                Sign in to bd<span className="text-brand-600">Beginner</span>
              </h1>
              <p className="mt-1 text-sm text-ink-500">Sign in or create your account</p>
            </div>
          </div>

          <div className="rounded-2xl border border-ink-100 bg-white p-7 shadow-soft">
            {step === 'email' ? (
              <div className="flex flex-col gap-6">
                {googleAuthEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={submitting}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 shadow-sm transition-all hover:bg-ink-50 hover:text-ink-900 disabled:opacity-60"
                    >
                      <Chrome size={20} className={submitting ? 'animate-pulse' : ''} />
                      Continue with Google
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ink-100" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-3 text-ink-500 text-xs uppercase tracking-wider font-semibold">Or</span>
                      </div>
                    </div>
                  </>
                )}

                <form onSubmit={handleRequestOtp} className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-sm font-semibold text-ink-700">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                      />
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  <TurnstileCaptcha
                    ref={turnstileRef}
                    onVerify={(token) => setCaptchaToken(token)}
                    onError={() => setError('CAPTCHA verification failed. Please try again.')}
                    onExpire={() => setCaptchaToken(null)}
                  />

                  {error && (
                    <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || (import.meta.env.PROD && !captchaConfigured)}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending code…
                      </span>
                    ) : (
                      'Continue with Email'
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6">
                <div className="text-center">
                  <p className="text-sm text-ink-600">
                    We sent a 6-digit code to
                    <br />
                    <span className="font-semibold text-ink-900">{email}</span>
                  </p>
                </div>

                <OtpInput
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={submitting}
                />

                {error && (
                  <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting || otp.length !== 6}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Verifying…
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={countdown > 0 || submitting}
                    onClick={handleRequestOtp}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink-50 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-60"
                  >
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email');
                      setOtp('');
                      setError(null);
                    }}
                    className="inline-flex h-11 w-full items-center justify-center text-sm font-medium text-ink-500 transition-colors hover:text-ink-800"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-800"
            >
              <ArrowLeft size={16} />
              Back to store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
