import { Shield, Mail, Key, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { AccountLayout } from '@/components/account/AccountLayout';

export function AccountSecurityPage() {
  const { session } = useCustomerAuth();

  const providers = session?.user.app_metadata?.providers || [];
  const hasGoogle = providers.includes('google');
  const hasEmail = providers.includes('email');
  
  // Clean string helper for labels
  const getProviderLabel = () => {
    if (hasGoogle && hasEmail) return 'Google & Email OTP';
    if (hasGoogle) return 'Google';
    if (hasEmail) return 'Email OTP';
    return 'Email account';
  };

  return (
    <AccountLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Security Settings</h1>
          <p className="mt-1 text-ink-500">View your authentication methods and session details.</p>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft sm:p-8">
          <h2 className="text-lg font-bold text-ink-900 mb-6">Authentication</h2>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Mail size={20} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink-900">Account Email</h3>
                <p className="mt-1 text-sm text-ink-600">{session?.user.email}</p>
                <p className="mt-1 text-xs text-ink-400">This is your primary identifier.</p>
              </div>
            </div>

            <hr className="border-ink-100" />

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Key size={20} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink-900">Sign-in Methods</h3>
                <p className="mt-1 text-sm text-ink-600">{getProviderLabel()}</p>
                
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${hasGoogle ? 'bg-success-500' : 'bg-ink-200'}`} />
                    <span className={hasGoogle ? 'text-ink-700 font-medium' : 'text-ink-400'}>
                      Google connected
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`h-2 w-2 rounded-full ${hasEmail ? 'bg-success-500' : 'bg-ink-200'}`} />
                    <span className={hasEmail ? 'text-ink-700 font-medium' : 'text-ink-400'}>
                      Email OTP available
                    </span>
                  </div>
                </div>
                <div className="mt-5 border-t border-ink-100 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">Account Password</p>
                      <p className="text-xs text-ink-500">Set or change your password to enable email/password sign in.</p>
                    </div>
                    <Link to="/account/set-password" className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-ink-50">
                      Set Password <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            <hr className="border-ink-100" />

            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50">
                <Shield size={20} className="text-brand-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-ink-900">Session Status</h3>
                <p className="mt-1 text-sm text-ink-600">Active secure session</p>
                {session?.expires_at && (
                  <p className="mt-1 text-xs text-ink-400">
                    Expires: {new Date(session.expires_at * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}
