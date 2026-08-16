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

type AdminAuthState = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string, captchaToken?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAdmin = useCallback(async (userId: string | undefined): Promise<boolean> => {
    if (!userId) return false;
    const sb = getSupabase();
    const { data, error: queryError } = await sb
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (queryError) {
      console.error('Admin check failed', queryError);
      return false;
    }
    return !!data;
  }, []);

  useEffect(() => {
    let mounted = true;
    let sb: ReturnType<typeof getSupabase>;
    try {
      sb = getSupabase();
    } catch (err: unknown) {
      console.error('Supabase init failed in AdminAuthProvider', err);
      setLoading(false);
      return;
    }

    // 1. Initial Session Check (synchronous to avoid deadlocks in auth flow)
    sb.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
        // Do not set loading false here; let the second useEffect handle it
      }
    });

    // 2. Auth State Change Listener (STRICTLY SYNCHRONOUS)
    const { data: listener } = sb.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // 3. Admin Check Effect (Runs whenever session changes)
  useEffect(() => {
    let mounted = true;
    
    async function verifyAdmin() {
      if (!session?.user) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      
      const admin = await checkAdmin(session.user.id);
      if (mounted) {
        setIsAdmin(admin);
        setLoading(false);
      }
    }
    
    verifyAdmin();
    
    return () => {
      mounted = false;
    };
  }, [session, checkAdmin]);

  const login = useCallback(
    async (email: string, password: string, captchaToken?: string) => {
      setError(null);
      let sb;
      try {
        sb = getSupabase();
      } catch {
        const msg = 'Unable to connect. Please try again.';
        setError(msg);
        return { ok: false, error: msg };
      }
      const { data, error: signInError } = await sb.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken,
        },
      });
      if (signInError) {
        const msg = signInError.message.includes('Invalid login')
          ? 'Invalid email or password.'
          : 'Sign-in failed. Please try again.';
        setError(msg);
        return { ok: false, error: msg };
      }
      if (!data.session?.user) {
        setError('Sign-in failed. Please try again.');
        return { ok: false, error: 'Sign-in failed.' };
      }
      const admin = await checkAdmin(data.session.user.id);
      setIsAdmin(admin);
      setSession(data.session);
      if (!admin) {
        await sb.auth.signOut();
        setSession(null);
        setError('You do not have admin access.');
        return { ok: false, error: 'You do not have admin access.' };
      }
      return { ok: true };
    },
    [checkAdmin],
  );

  const logout = useCallback(async () => {
    try {
      const sb = getSupabase();
      await sb.auth.signOut();
    } catch {
      // ignore — session cleared below
    }
    setSession(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo<AdminAuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      isAdmin,
      loading,
      error,
      login,
      logout,
    }),
    [session, isAdmin, loading, error, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
