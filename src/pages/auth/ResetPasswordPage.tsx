import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthIndicator, evaluatePasswordStrength } from '@/components/auth/PasswordStrengthIndicator';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loadingSession, setLoadingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoverySession() {
      try {
        const sb = getSupabase();

        // 1. Check if an error was passed in URL hash (e.g. #error=access_denied&error_code=otp_expired)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const errorDesc = hashParams.get('error_description');
          const errorCode = hashParams.get('error_code');
          if (errorDesc || errorCode) {
            if (mounted) {
              setError(
                errorDesc
                  ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
                  : 'পাসওয়ার্ড রিসেট লিংকটির মেয়াদ শেষ অথবা এটি সঠিক নয়। দয়া করে আবার লিংক পাঠান।'
              );
              setLoadingSession(false);
            }
            return;
          }

          // If access_token and refresh_token are in hash, explicitly set session
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          if (accessToken && refreshToken) {
            const { data: setSessionData, error: setSessionErr } = await sb.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!setSessionErr && setSessionData.session && mounted) {
              setHasValidSession(true);
              setLoadingSession(false);
              return;
            }
          }
        }

        // 2. Check if a PKCE code was passed in URL search params (?code=...)
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        if (code) {
          try {
            const { data: exchangeData, error: exchangeErr } = await sb.auth.exchangeCodeForSession(code);
            if (!exchangeErr && exchangeData.session && mounted) {
              setHasValidSession(true);
              setLoadingSession(false);
              return;
            }
          } catch (codeErr) {
            console.warn('Code exchange error on reset password:', codeErr);
          }
        }

        // 3. Check for existing active session
        const { data: { session }, error: sessionError } = await sb.auth.getSession();
        if (sessionError) {
          throw sessionError;
        }

        if (session && mounted) {
          setHasValidSession(true);
          setLoadingSession(false);
          return;
        }

        // 4. Listen for auth state changes (e.g. Supabase async hash parser)
        const { data: listener } = sb.auth.onAuthStateChange((event, newSession) => {
          if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && newSession && mounted) {
            setHasValidSession(true);
            setLoadingSession(false);
          }
        });

        // 4. Fallback timeout: if no session found after 2.5s, mark link as expired
        const timer = setTimeout(() => {
          if (mounted && !hasValidSession) {
            setLoadingSession(false);
          }
        }, 2500);

        return () => {
          clearTimeout(timer);
          listener.subscription.unsubscribe();
        };
      } catch (err: unknown) {
        console.error('Session check error on reset page', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to verify reset link.');
          setLoadingSession(false);
        }
      }
    }

    checkRecoverySession();

    return () => {
      mounted = false;
    };
  }, [hasValidSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const strength = evaluatePasswordStrength(newPassword);
    if (!strength.rules.minLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!strength.rules.hasLetter || !strength.rules.hasNumber) {
      setError('Password must contain at least one letter and one number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const sb = getSupabase();
      const { error: updateError } = await sb.auth.updateUser({
        password: newPassword,
        data: {
          has_password: true,
        },
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 2500);
    } catch (err: unknown) {
      console.error('Failed to update password', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to update your password. Please request a new reset link.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading Session State
  if (loadingSession) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center p-5 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
        <p className="mt-4 text-sm font-medium text-ink-600">Verifying password reset link…</p>
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center p-5 text-center">
        <div className="w-full max-w-md rounded-3xl border border-success-200 bg-white p-8 shadow-2xl shadow-success-900/5 sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600 ring-8 ring-success-50/50">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Password Reset Successful!</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
            Your new password has been set. You can now use it to sign in anytime. Redirecting you to your account…
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              to="/account"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Go to Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Invalid or Expired Link State
  if (!hasValidSession) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center p-5 text-center">
        <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-2xl shadow-ink-900/5 sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
            <AlertCircle size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-900">Reset Link Expired or Invalid</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-ink-600">
            {error || 'This password recovery link has already been used or has expired for your security.'}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              to="/login?mode=forgot"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
            >
              Request a New Reset Link
            </Link>
            <Link
              to="/login"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-700 transition-all hover:bg-ink-50"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset Password Form
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-2xl shadow-ink-900/5 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-8 ring-brand-50/50">
            <KeyRound size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Create New Password</h1>
          <p className="mt-2 text-sm text-ink-500">
            Please choose a strong password for your BD Beginner account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700" htmlFor="reset-new-password">
              New Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrengthIndicator password={newPassword} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700" htmlFor="reset-confirm-password">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="reset-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-10 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-error-200 bg-error-50 p-3.5 text-xs font-medium text-error-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <Button type="submit" disabled={submitting} className="h-11 w-full mt-2">
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Updating Password…
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck size={14} className="text-brand-600" />
          <span>Protected with end-to-end encrypted authentication</span>
        </div>
      </div>
    </div>
  );
}
