import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Chrome,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { TurnstileCaptcha, type TurnstileRef } from '@/components/auth/TurnstileCaptcha';
import { OtpInput } from '@/components/auth/OtpInput';
import { PasswordStrengthIndicator, evaluatePasswordStrength } from '@/components/auth/PasswordStrengthIndicator';
import { trackCompleteRegistration } from '@/lib/tracking';

type AuthMode = 'login' | 'signup' | 'forgot-password';
type LoginMethod = 'password' | 'otp';

export function LoginPage() {
  const {
    signInWithPassword,
    signUp,
    resetPasswordForEmail,
    requestOtp,
    verifyOtp,
    signInWithGoogle,
    session,
    loading,
  } = useCustomerAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // Detect mode based on pathname or query search param
  const getInitialMode = (): AuthMode => {
    const path = location.pathname.toLowerCase();
    if (path.includes('signup') || path.includes('register')) return 'signup';
    if (path.includes('forgot')) return 'forgot-password';

    const params = new URLSearchParams(location.search);
    const m = params.get('mode');
    if (m === 'signup' || m === 'register') return 'signup';
    if (m === 'forgot' || m === 'forgot-password') return 'forgot-password';
    return 'login';
  };

  const [mode, setMode] = useState<AuthMode>(getInitialMode);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP State
  const [otpStep, setOtpStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [signupConfirmationPending, setSignupConfirmationPending] = useState(false);

  // Captcha & Google Auth
  const turnstileRef = useRef<TurnstileRef>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaConfigured = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY);
  const CAPTCHA_ENABLED = false; // Configured via Turnstile if needed
  const googleAuthEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === 'true';

  // Sync mode with route changes (e.g. user clicked header link to /signup)
  useEffect(() => {
    setMode(getInitialMode());
    setError(null);
    setSuccessMessage(null);
  }, [location.pathname, location.search]);

  // If already logged in, redirect to safe return URL or account
  useEffect(() => {
    if (!loading && session) {
      if (
        location.hash.includes('type=recovery') ||
        location.search.includes('type=recovery') ||
        window.location.hash.includes('type=recovery') ||
        window.location.search.includes('type=recovery')
      ) {
        navigate(`/reset-password${window.location.search}${window.location.hash}`, { replace: true });
        return;
      }
      let returnTo = location.state?.from?.pathname || '/account';
      if (typeof returnTo !== 'string' || !returnTo.startsWith('/')) {
        returnTo = '/account';
      }
      navigate(returnTo, { replace: true });
    }
  }, [loading, session, navigate, location]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 1. Password Login Handler
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await signInWithPassword(email.trim(), password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || 'Failed to sign in. Please verify your email and password.');
    } else {
      trackCompleteRegistration('Email Password Login');
    }
  };

  // 2. OTP Request Handler
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (CAPTCHA_ENABLED) {
      if (import.meta.env.PROD && !captchaConfigured) {
        setError('Sign-in verification is not configured. Please contact support.');
        return;
      }
      if (captchaConfigured && !captchaToken) {
        setError('Please complete the CAPTCHA verification.');
        return;
      }
    }

    setError(null);
    setSubmitting(true);

    const result = await requestOtp(email.trim(), captchaToken || undefined);
    setSubmitting(false);

    if (result.ok) {
      setOtpStep('otp');
      setCountdown(60);
    } else {
      setError(result.error || 'Failed to send login code. Please try again.');
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  // 3. OTP Verify Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await verifyOtp(email.trim(), otp);
    setSubmitting(false);

    if (result.ok) {
      trackCompleteRegistration('Email OTP');
    } else {
      setError(result.error || 'Verification failed. Please try again.');
    }
  };

  // 4. Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

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

    setError(null);
    setSubmitting(true);

    const result = await signUp(email.trim(), password, fullName.trim());
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || 'Failed to create account. Please try again.');
      return;
    }

    trackCompleteRegistration('Email Password Registration');

    if (result.requiresEmailConfirmation) {
      setSignupConfirmationPending(true);
    } else {
      navigate('/account', { replace: true });
    }
  };

  // 5. Forgot Password Handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setSubmitting(true);

    const result = await resetPasswordForEmail(email.trim());
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error || 'Failed to send password reset email. Please try again.');
    } else {
      setSuccessMessage(`Password reset link sent to ${email.trim()}. Please check your email inbox.`);
    }
  };

  // 6. Google Sign-In Handler
  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    await signInWithGoogle();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-50 selection:bg-brand-500 selection:text-white">
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          {/* Header Brand Logo */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <Link to="/" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-display font-extrabold text-xl shadow-md transition-transform hover:scale-105">
              b
            </Link>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-ink-900">
                {mode === 'signup'
                  ? 'Create your Account'
                  : mode === 'forgot-password'
                  ? 'Reset your Password'
                  : 'Welcome to bdBeginner'}
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                {mode === 'signup'
                  ? 'Sign up to access courses, downloads, and software'
                  : mode === 'forgot-password'
                  ? 'Enter your email to receive a password reset link'
                  : 'Sign in to access your purchased products and orders'}
              </p>
            </div>
          </div>

          {/* Main Card Container */}
          <div className="rounded-2xl sm:rounded-3xl border border-ink-100 bg-white p-6 sm:p-8 shadow-soft">
            {/* 1. SIGNUP CONFIRMATION NOTICE */}
            {signupConfirmationPending ? (
              <div className="text-center py-4 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-ink-900">Verification Email Sent</h3>
                <p className="text-sm text-ink-600 leading-relaxed">
                  We have sent a confirmation link to <span className="font-bold text-ink-900">{email}</span>.
                  Please check your inbox (and spam folder) and click the link to activate your account.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSignupConfirmationPending(false);
                      setMode('login');
                      setLoginMethod('password');
                    }}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                  >
                    Go to Sign In
                  </button>
                </div>
              </div>
            ) : mode === 'forgot-password' ? (
              /* 2. FORGOT PASSWORD FORM */
              <div className="space-y-5">
                {successMessage ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-3">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 size={20} />
                    </div>
                    <p className="text-sm font-medium text-emerald-800">{successMessage}</p>
                    <p className="text-xs text-emerald-700">
                      Didn't receive the email? Check your spam folder or wait a minute before requesting another link.
                    </p>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 pt-2"
                    >
                      <ArrowLeft size={14} /> Back to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="forgot-email" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                        Account Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                        />
                        <input
                          id="forgot-email"
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

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                        <AlertCircle className="mt-0.5 shrink-0" size={15} />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-all cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Sending Reset Link…
                        </span>
                      ) : (
                        'Send Password Reset Link'
                      )}
                    </button>

                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setError(null);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        Remember your password? Sign in
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : mode === 'signup' ? (
              /* 3. NEW USER REGISTRATION FORM */
              <div className="space-y-5">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="signup-name" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                      />
                      <input
                        id="signup-name"
                        type="text"
                        autoComplete="name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-4 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                      />
                      <input
                        id="signup-email"
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

                  {/* Password with Visibility Toggle */}
                  <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                      />
                      <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-11 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <PasswordStrengthIndicator password={password} showRules={true} />
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label htmlFor="signup-confirm-password" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        size={18}
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                      />
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-11 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      <AlertCircle className="mt-0.5 shrink-0" size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-all cursor-pointer"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating Account…
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-xs text-ink-500">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setError(null);
                        }}
                        className="font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            ) : (
              /* 4. LOGIN FORM: PASSWORD LOGIN (DEFAULT) + OTP LOGIN (ALTERNATIVE) */
              <div className="space-y-5">
                {/* Google Sign In (if enabled) */}
                {googleAuthEnabled && (
                  <>
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={submitting}
                      className="inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-ink-200 bg-white text-sm font-semibold text-ink-700 shadow-sm transition-all hover:bg-ink-50 hover:text-ink-900 disabled:opacity-60 cursor-pointer"
                    >
                      <Chrome size={18} className={submitting ? 'animate-pulse' : ''} />
                      Continue with Google
                    </button>

                    <div className="relative my-2">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-ink-100" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-3 font-semibold text-ink-400 uppercase tracking-wider">
                          Or sign in with
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Login Method Tabs: Password vs OTP */}
                <div className="grid grid-cols-2 p-1 rounded-xl bg-ink-100/70 border border-ink-200/50">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('password');
                      setError(null);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginMethod === 'password'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-ink-600 hover:text-ink-900'
                    }`}
                  >
                    <Lock size={13} />
                    <span>Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('otp');
                      setError(null);
                    }}
                    className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginMethod === 'otp'
                        ? 'bg-white text-brand-700 shadow-sm'
                        : 'text-ink-600 hover:text-ink-900'
                    }`}
                  >
                    <Mail size={13} />
                    <span>Email OTP</span>
                  </button>
                </div>

                {/* Method 1: Email + Password Login Form (Default) */}
                {loginMethod === 'password' ? (
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail
                          size={18}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                        />
                        <input
                          id="login-email"
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

                    {/* Password with Visibility Toggle & Forgot Password Link */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot-password');
                            setError(null);
                          }}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock
                          size={18}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                        />
                        <input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-11 pr-11 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                        <AlertCircle className="mt-0.5 shrink-0" size={15} />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-all cursor-pointer"
                    >
                      {submitting ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Signing In…
                        </span>
                      ) : (
                        'Sign In with Password'
                      )}
                    </button>
                  </form>
                ) : (
                  /* Method 2: Email OTP Login (Alternative) */
                  <div>
                    {otpStep === 'email' ? (
                      <form onSubmit={handleRequestOtp} className="space-y-4">
                        <div className="space-y-1.5">
                          <label htmlFor="otp-email" className="text-xs font-bold uppercase tracking-wider text-ink-600">
                            Email Address for Code
                          </label>
                          <div className="relative">
                            <Mail
                              size={18}
                              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
                            />
                            <input
                              id="otp-email"
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

                        {CAPTCHA_ENABLED && (
                          <TurnstileCaptcha
                            ref={turnstileRef}
                            onVerify={(token) => setCaptchaToken(token)}
                            onError={() => setError('CAPTCHA verification failed. Please try again.')}
                            onExpire={() => setCaptchaToken(null)}
                          />
                        )}

                        {error && (
                          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                            <AlertCircle className="mt-0.5 shrink-0" size={15} />
                            <span>{error}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-all cursor-pointer"
                        >
                          {submitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Sending Login Code…
                            </span>
                          ) : (
                            'Send 6-Digit Code'
                          )}
                        </button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyOtp} className="space-y-5">
                        <div className="text-center space-y-1">
                          <p className="text-xs text-ink-500">We sent a 6-digit verification code to:</p>
                          <p className="text-sm font-bold text-ink-900">{email}</p>
                        </div>

                        <OtpInput length={6} value={otp} onChange={setOtp} disabled={submitting} />

                        {error && (
                          <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                            <AlertCircle className="mt-0.5 shrink-0" size={15} />
                            <span>{error}</span>
                          </div>
                        )}

                        <div className="space-y-2">
                          <button
                            type="submit"
                            disabled={submitting || otp.length !== 6}
                            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-all cursor-pointer"
                          >
                            {submitting ? (
                              <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Verifying…
                              </span>
                            ) : (
                              'Verify & Sign In'
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={countdown > 0 || submitting}
                            onClick={handleRequestOtp}
                            className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-ink-100 text-xs font-semibold text-ink-700 hover:bg-ink-200 disabled:opacity-60 transition-colors cursor-pointer"
                          >
                            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setOtpStep('email');
                              setOtp('');
                              setError(null);
                            }}
                            className="w-full text-center text-xs font-medium text-ink-500 hover:text-ink-800 transition-colors pt-1 cursor-pointer"
                          >
                            Use a different email address
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Bottom Registration Prompt */}
                <div className="pt-2 text-center border-t border-ink-100">
                  <p className="text-xs text-ink-500">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup');
                        setError(null);
                      }}
                      className="font-bold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer"
                    >
                      Create an Account
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Back Link */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-ink-500 hover:text-ink-800 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to bdBeginner Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
