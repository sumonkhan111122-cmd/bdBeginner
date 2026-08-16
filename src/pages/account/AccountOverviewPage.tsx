import { Link } from 'react-router-dom';
import { ArrowRight, Shield, User } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { AccountLayout } from '@/components/account/AccountLayout';

export function AccountOverviewPage() {
  const { profile, session } = useCustomerAuth();

  const initial = profile?.full_name 
    ? profile.full_name.charAt(0).toUpperCase() 
    : profile?.email.charAt(0).toUpperCase();
    
  const avatarUrl = profile?.avatar_url || session?.user.user_metadata?.avatar_url;

  return (
    <AccountLayout>
      <div className="flex flex-col gap-6">
        
        {/* Welcome Card */}
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <div className="flex shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-3xl font-bold text-brand-700 shadow-sm">
                    {initial}
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="font-display text-2xl font-bold text-ink-900">
                  Welcome back, {profile?.full_name || 'Customer'}!
                </h1>
                <p className="mt-1 text-ink-500">{profile?.email}</p>
                
                <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
                  <Link
                    to="/account/profile"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-50 px-5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100"
                  >
                    <User size={16} />
                    Edit Profile
                  </Link>
                  <Link
                    to="/account/security"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-ink-50 px-5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100"
                  >
                    <Shield size={16} />
                    Security Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-ink-100 bg-ink-50/50 px-6 py-4 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-sm text-ink-600">
                Member since{' '}
                <span className="font-semibold text-ink-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })
                    : 'Unknown'}
                </span>
              </div>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                Browse Store <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </AccountLayout>
  );
}
