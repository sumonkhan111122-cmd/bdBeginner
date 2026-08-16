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
      signInWithGoogle,
      logout,
      updateProfile,
    }),
    [session, user, profile, adminLoading, profileLoading, error, requestOtp, verifyOtp, signInWithGoogle, logout, updateProfile]
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth(): CustomerAuthState {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
