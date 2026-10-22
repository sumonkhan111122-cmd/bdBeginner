import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSupabase } from '@/lib/supabase';

export function AuthRecoveryHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let sb: ReturnType<typeof getSupabase>;
    try {
      sb = getSupabase();
    } catch {
      return;
    }

    // 1. Immediate URL check: if URL contains recovery parameters and we are not on /reset-password
    const currentPath = location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;

    const isRecoveryUrl =
      hash.includes('type=recovery') ||
      search.includes('type=recovery') ||
      (currentPath === '/auth/callback' && (hash.includes('type=recovery') || search.includes('type=recovery')));

    if (isRecoveryUrl && currentPath !== '/reset-password') {
      navigate(`/reset-password${search}${hash}`, { replace: true });
      return;
    }

    // 2. Listen for PASSWORD_RECOVERY event from Supabase auth
    const { data: listener } = sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        if (location.pathname !== '/reset-password') {
          navigate(`/reset-password${window.location.search}${window.location.hash}`, { replace: true });
        }
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return null;
}
