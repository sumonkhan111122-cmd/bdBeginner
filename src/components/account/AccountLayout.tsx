import { ReactNode } from 'react';
import { Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, ChevronRight, LayoutDashboard, Package, DownloadCloud, Heart, Star, Crown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';

interface AccountLayoutProps {
  children: ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { session, loading, logout } = useCustomerAuth();
  const { isVip, status } = useMembership();
  const location = useLocation();
  const navigate = useNavigate();

  // Protect the route
  if (!loading && !session) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname } }} />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Overview', to: '/account', icon: LayoutDashboard, exact: true },
    { label: 'Orders', to: '/account/orders', icon: Package, exact: false },
    { label: 'Downloads', to: '/account/downloads', icon: DownloadCloud, exact: false },
    { label: 'Wishlist', to: '/account/wishlist', icon: Heart, exact: false },
    { label: 'My Reviews', to: '/account/reviews', icon: Star, exact: false },
    { label: 'Profile', to: '/account/profile', icon: User, exact: false },
    { label: 'Security', to: '/account/security', icon: Shield, exact: false },
  ];

  return (
    <Layout>
      <div className="bg-ink-50/50 min-h-screen pb-16 pt-8">
        <div className="container-page">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            
            {/* Sidebar Navigation */}
            {session && (
              <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-64">
                <nav className="flex flex-col gap-1 rounded-2xl border border-ink-100 bg-white p-3 shadow-soft">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact 
                      ? location.pathname === item.to 
                      : location.pathname.startsWith(item.to);

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={isActive ? 'text-brand-600' : 'text-ink-400'} />
                          {item.label}
                        </div>
                        <ChevronRight 
                          size={16} 
                          className={`transition-transform ${isActive ? 'text-brand-600 translate-x-1' : 'text-transparent'}`} 
                        />
                      </NavLink>
                    );
                  })}

                  <div className="my-2 h-px bg-ink-100 mx-2" />

                  {/* VIP Membership status widget */}
                  <div className="mx-2 my-2">
                    {isVip ? (
                      <div className="rounded-xl border border-amber-300 bg-gradient-to-br from-amber-500/10 via-amber-400/10 to-yellow-500/10 p-3">
                        <div className="flex items-center gap-2">
                          <Crown size={16} className="text-amber-600 fill-amber-500" />
                          <span className="text-xs font-bold text-amber-900">VIP Member</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-amber-800">
                          {status.planName || 'All-Access Pass'}
                        </p>
                        <NavLink
                          to="/account/downloads"
                          className="mt-2 block text-center rounded-lg bg-amber-500 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600"
                        >
                          ডাউনলোড হাব
                        </NavLink>
                      </div>
                    ) : (
                      <NavLink
                        to="/membership"
                        className="group block rounded-xl border border-amber-200 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 p-3 hover:border-amber-300 transition-all"
                      >
                        <div className="flex items-center gap-1.5">
                          <Crown size={14} className="text-amber-600" />
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">VIP অল-অ্যাক্সেস</span>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-ink-900 group-hover:text-amber-800">
                          সব ৩,০০০+ ফাইল ফ্রি নিন
                        </p>
                        <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                          ৳৪৯৯ থেকে প্ল্যান দেখুন →
                        </span>
                      </NavLink>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-error-600 transition-colors hover:bg-error-50"
                  >
                    <LogOut size={18} className="text-error-500" />
                    Logout
                  </button>
                </nav>
              </aside>
            )}

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-4xl">
              {loading ? (
                <div className="flex h-64 items-center justify-center rounded-2xl border border-ink-100 bg-white shadow-soft">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
                </div>
              ) : session ? (
                <div className="animate-fade-in">
                  {children}
                </div>
              ) : null}
            </main>

          </div>
        </div>
      </div>
    </Layout>
  );
}
