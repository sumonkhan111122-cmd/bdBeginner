import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Image as ImageIcon,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft,
  CreditCard,
  Star,
  BarChart3,
  BadgePercent,
  CloudDownload,
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Products', to: '/admin/products', icon: Package, end: false },
  { label: 'Importer', to: '/admin/imports', icon: CloudDownload, end: true },
  { label: 'Categories', to: '/admin/categories', icon: FolderTree, end: false },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingBag, end: true },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3, end: false },
  { label: 'Discounts', to: '/admin/discounts', icon: BadgePercent, end: false },
  { label: 'Payments', to: '/admin/payments/manual', icon: CreditCard, end: false },
  { label: 'Reviews', to: '/admin/reviews', icon: Star, end: false },
  { label: 'Media', to: '/admin/media', icon: ImageIcon, end: false },
  { label: 'SEO', to: '/admin/seo', icon: Search, end: false },
  { label: 'Settings', to: '/admin/settings', icon: Settings, end: false },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-ink-100 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-display font-extrabold text-lg shadow-sm">
          b
        </span>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-base font-extrabold tracking-tight text-ink-900">
            bdBeginner
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Admin
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:bg-error-50 hover:text-error-700"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAdminAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-brand-600" />
          <p className="text-sm font-medium text-ink-500">Loading admin…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return <UnauthorizedView />;
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 border-r border-ink-100 bg-white lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-display font-extrabold">
            b
          </span>
          <span className="font-display text-lg font-extrabold text-ink-900">
            bd<span className="text-brand-600">Beginner</span>
          </span>
          <span className="ml-1 rounded-md bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-500">
            Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 hover:bg-ink-50"
          aria-label="Open admin menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[85%] bg-white shadow-2xl animate-scale-in">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

function UnauthorizedView() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-5">
      <div className="w-full max-w-md rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-soft">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 text-error-600">
          <X size={28} />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Unauthorized</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          You are signed in, but this account does not have admin access.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={async () => {
              await logout();
              navigate('/admin/login');
            }}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-error-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-error-700"
          >
            <LogOut size={16} className="mr-2" />
            Sign out
          </button>
          <button
            onClick={() => navigate('/')}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-200 bg-white px-5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to store
          </button>
        </div>
      </div>
    </div>
  );
}
