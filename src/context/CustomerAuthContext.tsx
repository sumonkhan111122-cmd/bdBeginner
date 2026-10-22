import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { useAdminAuth } from '@/context/AdminAuthContext';
import type { CustomerProfile } from '@/types/auth';

type CustomerAuthState = {
  session: Session | null;
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  error: string | null;
  requestOtp: (email: string, captchaToken?: string) => Promise<{ ok: boolean; error?: string }>;
  verifyOtp: (email: string, token: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ ok: boolean; error?: string; requiresEmailConfirmation?: boolean }>;
  resetPasswordForEmail: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<CustomerProfile>) => Promise<{ ok: boolean; error?: string }>;
};

const CustomerAuthContext = createContext<CustomerAuthState | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  // We reuse the existing session from AdminAuthContext to prevent multiple auth listeners
  const { session, user, loading: adminLoading } = useAdminAuth();
  
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the customer profile whenever the underlying user changes
  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      if (!user) {
        if (mounted) {
          setProfile(null);
          setProfileLoading(false);
        }
        return;
      }

      setProfileLoading(true);
      try {
        const sb = getSupabase();
        const { data, error: queryError } = await sb
          .from('customer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (queryError) {
          console.error('Failed to load customer profile', queryError);
        } else if (mounted) {
          setProfile(data as CustomerProfile | null);
        }
      } catch (err) {
        console.error('Error loading customer profile', err);
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [user]);

  const requestOtp = useCallback(async (email: string, captchaToken?: string) => {
    setError(null);
    let sb;
    try {
      sb = getSupabase();
    } catch {
      return { ok: false, error: 'Unable to connect. Please try again.' };
    }

    const { error: otpError } = await sb.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        captchaToken,
      },
    });

    if (otpError) {
      console.error('OTP request error:', otpError);
      return { ok: false, error: 'Failed to send login code. Please try again.' };
    }

    return { ok: true };
  }, []);

  const verifyOtp = useCallback(async (email: string, token: string) => {
    setError(null);
    let sb;
    try {
      sb = getSupabase();
    } catch {
      return { ok: false, error: 'Unable to connect.' };
    }

    const { error: verifyError } = await sb.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (verifyError) {
      console.error('OTP verification error:', verifyError);
      const isExpired = verifyError.message.toLowerCase().includes('expire');
      return { 
        ok: false, 
        error: isExpired ? 'This code has expired. Please request a new one.' : 'Incorrect code. Please try again.' 
      };
    }

    return { ok: true };
  }, []);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setError(null);
    let sb;
    try {
      sb = getSupabase();
    } catch {
      return { ok: false, error: 'Unable to connect to service. Please try again.' };
    }

    const { data, error: signInError } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      console.error('Password sign in error:', signInError);
      const msg = signInError.message.toLowerCase();
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        return { ok: false, error: 'Incorrect email or password. Please check your credentials or use OTP login.' };
      }
      if (msg.includes('email not confirmed')) {
        return { ok: false, error: 'Please verify your email address before logging in. Check your inbox for the confirmation email.' };
      }
      if (msg.includes('too many requests') || msg.includes('rate limit')) {
        return { ok: false, error: 'Too many login attempts. Please wait a few moments and try again.' };
      }
      return { ok: false, error: signInError.message || 'Failed to sign in. Please try again.' };
    }

    if (!data.session?.user) {
      return { ok: false, error: 'Sign in failed. Please try again.' };
    }

    return { ok: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    setError(null);
    let sb;
    try {
      sb = getSupabase();
    } catch {
      return { ok: false, error: 'Unable to connect to service. Please try again.' };
    }

    const trimmedEmail = email.trim();
    const trimmedName = fullName.trim();

    const { data, error: signUpError } = await sb.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          has_password: true,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      console.error('Sign up error:', signUpError);
      const msg = signUpError.message.toLowerCase();
      if (msg.includes('user already registered') || msg.includes('already exists')) {
        return { 
          ok: false, 
          error: 'An account with this email already exists. Please sign in with your password or use OTP.' 
        };
      }
      return { ok: false, error: signUpError.message || 'Failed to create account. Please try again.' };
    }

    const requiresEmailConfirmation = !data.session;

    if (data.session?.user) {
      try {
        await sb
          .from('customer_profiles')
          .upsert({
            user_id: data.session.user.id,
            email: trimmedEmail,
            full_name: trimmedName || null,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      } catch (e) {
        console.warn('Customer profile upsert fallback:', e);
      }
    }

    return { ok: true, requiresEmailConfirmation };
  }, []);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    setError(null);
    let sb;
    try {
      sb = getSupabase();
    } catch {
      return { ok: false, error: 'Unable to connect to service. Please try again.' };
    }

    const { error: resetError } = await sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      console.error('Password reset request error:', resetError);
      return { ok: false, error: resetError.message || 'Failed to send password reset email. Please try again.' };
    }

    return { ok: true };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    setError(null);
    let sb;
    try {
      sb = getSupabase();
    } catch {
      return { ok: false, error: 'Unable to connect to service. Please try again.' };
    }

    const { error: updateError } = await sb.auth.updateUser({
      password: newPassword,
      data: {
        has_password: true,
      },
    });

    if (updateError) {
      console.error('Update password error:', updateError);
      return { ok: false, error: updateError.message || 'Failed to update password.' };
    }

    return { ok: true };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setError(null);
    let sb;
    try {
      sb = getSupabase();
    } catch {
      setError('Unable to connect. Please try again.');
      return;
    }

    await sb.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      const sb = getSupabase();
      await sb.auth.signOut();
    } catch {
      // ignore
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<CustomerProfile>) => {
    if (!user) return { ok: false, error: 'Not authenticated' };
    
    let sb;
    try {
      sb = getSupabase();
    } catch {
      return { ok: false, error: 'Unable to connect.' };
    }

    const { data, error: updateError } = await sb
      .from('customer_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return { ok: false, error: 'Failed to update profile.' };
    }

    setProfile(data as CustomerProfile);
    return { ok: true };
  }, [user]);

  const value = useMemo<CustomerAuthState>(
    () => ({
      session,
      user,
      profile,
      loading: adminLoading || profileLoading,
      error,
      requestOtp,
      verifyOtp,
      signInWithPassword,
      signUp,
      resetPasswordForEmail,
      updatePassword,
      signInWithGoogle,
      logout,
      updateProfile,
    }),
    [
      session,
      user,
      profile,
      adminLoading,
      profileLoading,
      error,
      requestOtp,
      verifyOtp,
      signInWithPassword,
      signUp,
      resetPasswordForEmail,
      updatePassword,
      signInWithGoogle,
      logout,
      updateProfile,
    ]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth(): CustomerAuthState {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
