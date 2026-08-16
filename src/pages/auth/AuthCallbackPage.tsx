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
        
        // Supabase-js automatically parses the hash/query parameters 
        // on initialization and exchange the code for a session if needed.
        // We just need to wait and get the current session.
        const { data: { session }, error: sessionError } = await sb.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (session && mounted) {
          // Authentication successful.
          navigate('/account', { replace: true });
        } else if (mounted) {
          // No session and no error, maybe still processing or redirect was missing tokens.
          // Listen briefly for the auth state change in case it's processing async.
          const { data: listener } = sb.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_IN' && newSession && mounted) {
              navigate('/account', { replace: true });
            }
          });
          
          // Timeout to show error if it never resolves
          setTimeout(() => {
            if (mounted) {
              setError('Authentication timed out. Please try signing in again.');
              listener.subscription.unsubscribe();
            }
          }, 5000);
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
