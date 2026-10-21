import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    async function handleAuthCallback() {
      try {
        const sb = getSupabase();

        // 1. Check if this is a recovery redirect (via query param or hash)
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const isRecovery =
          searchParams.get('type') === 'recovery' ||
          hashParams.get('type') === 'recovery';

        const hashError = hashParams.get('error_description') || hashParams.get('error');
        if (hashError) {
          if (isRecovery) {
            navigate(`/reset-password${window.location.hash}`, { replace: true });
            return;
          }
          throw new Error(decodeURIComponent(hashError.replace(/\+/g, ' ')));
        }

        // 2. Supabase-js automatically parses the hash/query parameters 
        // on initialization and exchanges code for session if needed.
        const { data: { session }, error: sessionError } = await sb.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session && mounted) {
          if (isRecovery) {
            navigate(`/reset-password${window.location.hash}`, { replace: true });
          } else {
            navigate('/account', { replace: true });
          }
          return;
        }

        if (mounted) {
          // Listen for auth state change in case it's processing async
          const { data: listener } = sb.auth.onAuthStateChange((event, newSession) => {
            if (!mounted) return;
            if (event === 'PASSWORD_RECOVERY') {
              navigate(`/reset-password${window.location.hash}`, { replace: true });
            } else if (event === 'SIGNED_IN' && newSession) {
              if (isRecovery) {
                navigate(`/reset-password${window.location.hash}`, { replace: true });
              } else {
                navigate('/account', { replace: true });
              }
            }
          });
          
          // Timeout to show error if it never resolves
          setTimeout(() => {
            if (mounted) {
              if (isRecovery) {
                navigate(`/reset-password${window.location.hash}`, { replace: true });
              } else {
                setError('Authentication timed out. Please try signing in again.');
              }
              listener.subscription.unsubscribe();
            }
          }, 4000);
        }
      } catch (err: unknown) {
        console.error('Auth callback error', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
        }
      }
    }

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-5 text-center">
        <div className="rounded-xl border border-error-200 bg-error-50 p-6 shadow-sm w-full max-w-md">
          <h2 className="text-lg font-bold text-error-800 mb-2">Authentication Error</h2>
          <p className="text-sm text-error-700 mb-5">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      <p className="mt-4 text-sm font-medium text-ink-600">Completing sign in…</p>
    </div>
  );
}
