import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If the user arrives via an invite link, Supabase will process the tokens
  // in the URL hash automatically and establish a session.
  // We can just call auth.updateUser() using the current session.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sb = getSupabase();
      const { error: updateError } = await sb.auth.updateUser({ password });
      
      if (updateError) {
        throw updateError;
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/account', { replace: true });
      }, 2000);
    } catch (err: unknown) {
      console.error('Failed to set password', err);
      setError(err instanceof Error ? err.message : 'Failed to set password. Please try again or request a new link.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-5 text-center">
        <div className="rounded-2xl border border-success-200 bg-success-50 p-8 shadow-sm w-full max-w-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-100 mb-4">
            <CheckCircle2 size={24} className="text-success-600" />
          </div>
          <h2 className="text-xl font-bold text-success-900 mb-2">Password Set Successfully</h2>
          <p className="text-sm text-success-700 mb-5">Your account is now fully active. Redirecting you to your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-2xl shadow-ink-900/5">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <KeyRound size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Set Account Password</h1>
          <p className="mt-2 text-sm text-ink-500">
            Please create a password for your account to complete the activation process.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              placeholder="Confirm new password"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 p-3 text-sm text-error-700">
              <AlertCircle className="mt-0.5 shrink-0" size={16} />
              <p>{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Set Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
