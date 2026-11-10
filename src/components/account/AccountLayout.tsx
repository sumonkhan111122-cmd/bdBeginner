import type { ReactNode } from 'react';
import { Link, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { User, Shield, LogOut, ChevronRight, ArrowUpRight, LayoutDashboard, Package, DownloadCloud, Heart, Star, Crown, GraduationCap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import '@/interior-redesign.css';

interface AccountLayoutProps {
  children: ReactNode;
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { session, profile, loading, logout } = useCustomerAuth();
  const { isVip, status } = useMembership();
  const location = useLocation();
  const navigate = useNavigate();

  if (!loading && !session) {
    return <Navigate to="/login" replace state={{ from: { pathname: location.pathname } }} />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Overview', to: '/account', icon: LayoutDashboard, exact: true },
    { label: 'My courses', to: '/account/courses', icon: GraduationCap, exact: false },
    { label: 'Orders', to: '/account/orders', icon: Package, exact: false },
    { label: 'Downloads', to: '/account/downloads', icon: DownloadCloud, exact: false },
    { label: 'Wishlist', to: '/account/wishlist', icon: Heart, exact: false },
    { label: 'My reviews', to: '/account/reviews', icon: Star, exact: false },
    { label: 'Profile', to: '/account/profile', icon: User, exact: false },
    { label: 'Security', to: '/account/security', icon: Shield, exact: false },
  ];
  const displayName = profile?.full_name || session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Creator';

  return (
    <Layout>
      <div className="account-workspace">
        <div className="container-page">
          <div className="account-workspace-top">
            <nav className="interior-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link><ChevronRight size={13} aria-hidden="true" /><span>My account</span>
            </nav>
            <Link to="/products" className="account-back-link">Keep exploring <ArrowUpRight size={15} /></Link>
          </div>
          <div className="account-workspace-grid">
            {session && (
              <aside className="account-sidebar">
                <div className="account-identity">
                  <span className="account-avatar" aria-hidden="true">{String(displayName).charAt(0).toUpperCase()}</span>
                  <div><strong>{displayName}</strong><span>Your creative space</span></div>
                </div>
                <span className="account-nav-label">MY WORKSPACE</span>
                <nav className="account-navigation" aria-label="Account navigation">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
                    return (
                      <NavLink key={item.to} to={item.to} end={item.exact} className={`account-nav-item${isActive ? ' is-active' : ''}`}>
                        <Icon size={18} strokeWidth={1.7} /><span>{item.label}</span><ChevronRight size={14} className="account-nav-chevron" />
                      </NavLink>
                    );
                  })}
                </nav>
                <div className={`account-membership${isVip ? ' is-vip' : ''}`}>
                  <Crown size={21} strokeWidth={1.6} />
                  <strong>{isVip ? 'Your all-access pass' : 'More room to create.'}</strong>
                  <p>{isVip ? status.planName || 'VIP membership is active.' : 'Explore membership for more digital resources.'}</p>
                  <Link to={isVip ? '/account/downloads' : '/membership'}>{isVip ? 'Open download hub' : 'Explore membership'}<ArrowUpRight size={14} /></Link>
                </div>
                <button type="button" onClick={handleLogout} className="account-logout"><LogOut size={17} />Log out</button>
              </aside>
            )}
            <section className="account-main-content" aria-label="Account content">
              {loading ? (
                <div className="account-loading-state" role="status"><span className="account-loading-spinner" /><span>Loading your workspace…</span></div>
              ) : session ? <div className="animate-fade-in">{children}</div> : null}
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
}
