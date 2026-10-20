import { Link } from 'react-router-dom';
import { ArrowRight, Shield, User, Crown, Sparkles, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import { AccountLayout } from '@/components/account/AccountLayout';

export function AccountOverviewPage() {
  const { profile, session } = useCustomerAuth();
  const { isVip, status } = useMembership();

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
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-display text-2xl font-bold text-ink-900">
                    Welcome back, {profile?.full_name || 'Customer'}!
                  </h1>
                  {isVip && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 px-2.5 py-0.5 text-xs font-bold text-ink-950 shadow-sm">
                      <Crown size={12} className="fill-ink-950" />
                      VIP
                    </span>
                  )}
                </div>
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

        {/* VIP Membership Status or Upgrade Card */}
        {isVip ? (
          <div className="overflow-hidden rounded-2xl border-2 border-amber-400/70 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-600/15 p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-ink-950 shadow-md">
                  <Crown size={24} className="fill-ink-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-ink-900">
                      VIP All-Access Pass সক্রিয়
                    </h2>
                    <span className="rounded-full bg-amber-400/30 px-2 py-0.5 text-xs font-bold text-amber-800">
                      {status.planName}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    {status.isLifetime
                      ? 'অভিনন্দন! আপনার আজীবন লাইফটাইম অ্যাক্সেস চালু রয়েছে। যেকোনো প্রোডাক্ট ফ্রিতে ডাউনলোড করুন।'
                      : `আপনার মেম্বারশিপ সক্রিয় রয়েছে ${status.expiresAt ? 'পরবর্তী তারিখ পর্যন্ত: ' + new Date(status.expiresAt).toLocaleDateString('bn-BD') : ''}।`}
                  </p>
                </div>
              </div>
              <Link
                to="/account/downloads"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3 text-sm font-bold text-ink-950 shadow-md hover:brightness-105 transition-all"
              >
                <DownloadCloud size={18} />
                ডাউনলোড হাব দেখুন
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent p-6 shadow-soft">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-ink-950 shadow-md">
                  <Crown size={24} className="fill-ink-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-ink-900">
                      অল-অ্যাক্সেস VIP মেম্বারশিপে আপগ্রেড করুন
                    </h2>
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      SAVE 90%+
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    ৩,০০০+ ডিজিটাল ফাইল (থিম, প্লাগইন, স্ক্রিপ্ট ও সফটওয়্যার) সম্পূর্ণ ফ্রিতে আনলিমিটেড ডাউনলোড করুন।
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-ink-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" /> ১ মাস: ৳৪৯৯
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-600" /> ১ বছর: ৳৭৯৯
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-amber-800">
                      <Sparkles size={14} className="text-amber-600" /> লাইফটাইম: ৳৯৯৯ (সেরা অফার)
                    </span>
                  </div>
                </div>
              </div>
              <Link
                to="/membership"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3 text-sm font-bold text-ink-950 shadow-md hover:brightness-105 transition-all"
              >
                প্ল্যান বেছে নিন <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

      </div>
    </AccountLayout>
  );
}
