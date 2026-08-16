import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { TurnstileCaptcha, type TurnstileRef } from '@/components/auth/TurnstileCaptcha';

export function AdminLoginPage() {
  const { login, logout, session, isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileRef>(null);
  const captchaConfigured = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [session, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (import.meta.env.PROD && !captchaConfigured) {
      setFormError('Sign-in verification is not configured. Please contact support.');
      return;
    }
    if (captchaConfigured && !captchaToken) {
      setFormError('Please complete the CAPTCHA verification.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    const result = await login(email.trim(), password, captchaToken || undefined);
    setSubmitting(false);
    if (result.ok) {
      navigate('/admin', { replace: true });
    } else {
      setFormError(result.error ?? 'Sign-in failed.');
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-5 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-display font-extrabold text-xl shadow-md">
            b
          </span>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-ink-900">
              bd<span className="text-brand-600">Beginner</span> Admin
            </h1>
            <p className="mt-1 text-sm text-ink-500">Sign in to manage your catalog</p>
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-7 shadow-soft">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-ink-700">
                Email
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
                  placeholder="admin@example.com"
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-semibold text-ink-700">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-11 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <TurnstileCaptcha
              ref={turnstileRef}
              onVerify={(token) => setCaptchaToken(token)}
              onError={() => setFormError('CAPTCHA verification failed. Please try again.')}
              onExpire={() => setCaptchaToken(null)}
            />

            {formError && (
              <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700">
                {formError}
              </div>
            )}

            {!loading && session && !isAdmin ? (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm font-medium text-error-700 text-center">
                  You are logged in but do not have admin access.
                </div>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink-200 text-sm font-semibold text-ink-800 shadow-sm transition-all hover:bg-ink-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting || (import.meta.env.PROD && !captchaConfigured)}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in…
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            )}
          </form>
        </div>

        <div className="mt-5 flex justify-center">
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
  );
}
