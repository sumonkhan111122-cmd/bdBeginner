import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Button } from '@/components/ui/Button';
import { PasswordStrengthIndicator, evaluatePasswordStrength } from '@/components/auth/PasswordStrengthIndicator';

export function SetPasswordPage() {
  const navigate = useNavigate();
  const { session, updatePassword } = useCustomerAuth();

  const hasExistingPassword = Boolean(session?.user?.user_metadata?.has_password);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const strength = evaluatePasswordStrength(password);
    if (!strength.rules.minLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!strength.rules.hasLetter || !strength.rules.hasNumber) {
      setError('Password must contain at least one letter and one number.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await updatePassword(password);
    setLoading(false);

    if (result.ok) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/account/security', { replace: true });
      }, 2000);
    } else {
      setError(result.error || 'Failed to save password. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-5 text-center">
        <div className="w-full max-w-md rounded-3xl border border-success-200 bg-white p-8 shadow-2xl shadow-success-900/5 sm:p-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-50 text-success-600 ring-8 ring-success-50/50">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="font-display text-2xl font-bold text-ink-900">
            {hasExistingPassword ? 'Password Changed Successfully' : 'Password Created Successfully'}
          </h2>
          <p className="mt-2.5 text-sm text-ink-600">
            You can now use your password to sign in across all your devices. Redirecting to security settings…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-2xl shadow-ink-900/5 sm:p-10">
        <Link
          to="/account/security"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800"
        >
          <ArrowLeft size={14} /> Back to Security Settings
        </Link>

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 ring-8 ring-brand-50/50">
            <KeyRound size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {hasExistingPassword ? 'Change Password' : 'Set Account Password'}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {hasExistingPassword
              ? 'Update your existing password to keep your BD Beginner account secure.'
              : 'Create a password for your account to sign in directly with Email + Password.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700" htmlFor="set-new-password">
              {hasExistingPassword ? 'New Password' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="set-new-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <PasswordStrengthIndicator password={password} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-700" htmlFor="set-confirm-password">
              Confirm {hasExistingPassword ? 'New ' : ''}Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="set-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
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

          <Button type="submit" disabled={loading} className="h-11 w-full mt-2">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Saving Password…
              </span>
            ) : hasExistingPassword ? (
              'Update Password'
            ) : (
              'Set Password'
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-400">
          <ShieldCheck size={14} className="text-brand-600" />
          <span>Your original customer ID and purchased items remain unchanged</span>
        </div>
      </div>
    </div>
  );
}
