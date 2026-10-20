import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Search,
  User,
  ShoppingCart,
  LifeBuoy,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Heart,
  Crown,
  Sparkles,
  ExternalLink,
  Layers,
  Grid3x3,
  FolderArchive,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnnouncementBar } from './AnnouncementBar';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useDiscovery } from '@/context/DiscoveryContext';
import { safeHttpUrl } from '@/lib/urls';

const exploreLinks = [
  { label: 'WordPress Themes', to: '/wordpress', description: 'Curated premium WP themes', icon: Layers },
  { label: 'WordPress Plugins', to: '/plugins', description: 'GPL plugins & dev tools', icon: Sparkles },
  { label: 'Digital Resources', to: '/resources', description: 'Templates, scripts & assets', icon: FolderArchive },
  { label: 'Special Deals', to: '/deals', description: 'Discounts & limited-time offers', icon: Tag },
  { label: 'All Categories', to: '/categories', description: 'Browse complete catalog', icon: Grid3x3 },
];

function FallbackLogo({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <span className={`flex ${compact ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl'} items-center justify-center bg-brand-600 text-white font-display font-extrabold shadow-sm`}>
        b
      </span>
      <span className={`font-display ${compact ? 'text-lg' : 'text-xl'} font-extrabold tracking-tight text-ink-900`}>
        bd<span className="text-brand-600">Beginner</span>
      </span>
    </>
  );
}

function HeaderLogo({ compact = false }: { compact?: boolean }) {
  const { siteSettings } = useSiteSettings();
  const logoUrl = safeHttpUrl(siteSettings.logo_url);
  if (!logoUrl) return <FallbackLogo compact={compact} />;
  return (
    <ImageWithFallback
      src={logoUrl}
      alt={`${siteSettings.site_name} logo`}
      className={`${compact ? 'h-8 max-w-40' : 'h-10 max-w-48'} w-auto object-contain`}
      fallback={<FallbackLogo compact={compact} />}
    />
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { count, openCart } = useCart();
  const { siteSettings } = useSiteSettings();
  const { session, logout } = useCustomerAuth();
  const { wishlistIds } = useDiscovery();
  const wishlistCount = wishlistIds.length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <AnnouncementBar />
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-ink-100 bg-white/90 backdrop-blur-lg shadow-soft'
            : 'border-transparent bg-white'
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${siteSettings.site_name} home`}>
            <HeaderLogo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 xl:gap-1.5 lg:flex" aria-label="Main navigation">
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'text-brand-700 bg-brand-50' : 'text-ink-700 hover:text-ink-950 hover:bg-ink-50'
                }`
              }
            >
              Products
            </NavLink>

            <NavLink
              to="/services"
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'text-brand-700 bg-brand-50' : 'text-ink-700 hover:text-ink-950 hover:bg-ink-50'
                }`
              }
            >
              Services
            </NavLink>

            {/* VIP Membership - Always visible, never breaks */}
            <NavLink
              to="/membership"
              className={({ isActive }) =>
                `inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs ${
                  isActive
                    ? 'bg-amber-400 text-ink-950 shadow-sm ring-1 ring-amber-500'
                    : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-950 border border-amber-300 hover:bg-amber-100 hover:border-amber-400'
                }`
              }
            >
              <Crown size={14} className="text-amber-500 fill-amber-400 shrink-0" />
              <span>VIP Membership</span>
            </NavLink>

            {/* Playflix Tool - Premium External Tool Badge */}
            <a
              href="https://www.bdbeginner.com/playflix"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-brand-200 bg-brand-50/70 px-3 py-1.5 text-xs font-bold text-brand-800 transition-all hover:bg-brand-100 hover:border-brand-300 shadow-xs"
            >
              <Sparkles size={13} className="text-brand-600 shrink-0 transition-transform group-hover:rotate-12" />
              <span>Playflix Tool</span>
              <span className="rounded-md bg-brand-600 px-1 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-white">
                PRO
              </span>
              <ExternalLink size={11} className="text-brand-400 shrink-0 opacity-70 group-hover:opacity-100" />
            </a>

            {/* Explore Dropdown */}
            <div className="relative group">
              <button
                type="button"
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-50 hover:text-ink-950"
              >
                <span>Explore</span>
                <ChevronDown size={14} className="text-ink-400 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="absolute left-0 top-full pt-1.5 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-50">
                <div className="w-64 rounded-2xl border border-ink-100 bg-white p-2 shadow-floating">
                  {exploreLinks.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-ink-50 group/item"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-50 text-ink-600 group-hover/item:bg-brand-50 group-hover/item:text-brand-600 transition-colors">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-ink-900 group-hover/item:text-brand-700 transition-colors">
                            {item.label}
                          </div>
                          <div className="text-[11px] text-ink-500 truncate">{item.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <Link
              to="/products"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label="Search"
            >
              <Search size={20} />
            </Link>
            
            <div className="relative group">
              <Link
                to={session ? "/account" : "/login"}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
                aria-label="Account"
              >
                <User size={20} />
              </Link>
              
              {session && (
                <div className="absolute right-0 top-full pt-1 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 z-50">
                  <div className="w-48 rounded-xl border border-ink-100 bg-white p-2 shadow-soft">
                    <Link to="/account" className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-brand-600">Overview</Link>
                    <Link to="/account/profile" className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-brand-600">Profile Settings</Link>
                    <Link to="/account/security" className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-brand-600">Security</Link>
                    <div className="my-1 mx-2 h-px bg-ink-100" />
                    <button 
                      onClick={() => logout()} 
                      className="flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-error-600 hover:bg-error-50 text-left"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              to={session ? "/account/wishlist" : "/wishlist"}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label={`Cart with ${count} items`}
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            {siteSettings.support_button_enabled && (
              <>
                <div className="mx-1 h-6 w-px bg-ink-100" />
                <Button to="/support" variant="outline" size="sm">
                  <LifeBuoy size={16} />
                  Get Support
                </Button>
              </>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-1 lg:hidden">
            <Link
              to={session ? "/account" : "/login"}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50"
              aria-label="Account"
            >
              <User size={20} />
            </Link>
            <Link
              to={session ? "/account/wishlist" : "/wishlist"}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label={`Wishlist with ${wishlistCount} items`}
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-900"
              aria-label={`Cart with ${count} items`}
            >
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-ink-50"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <CartDrawer />

      {/* Mobile navigation drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col bg-white shadow-2xl animate-scale-in">
            <div className="flex h-16 items-center justify-between border-b border-ink-100 px-5">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <HeaderLogo compact />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-50"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto p-5">
              {/* Search */}
              <div className="mb-5">
                <div className="flex items-center gap-2.5 rounded-xl border border-ink-200 bg-ink-50 px-4 py-3">
                  <Search size={18} className="text-ink-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Primary Nav links */}
              <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
                <NavLink
                  to="/products"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-ink-50'
                    }`
                  }
                >
                  Products
                  <ChevronRight size={18} className="text-ink-300" />
                </NavLink>

                <NavLink
                  to="/services"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-ink-50'
                    }`
                  }
                >
                  Services
                  <ChevronRight size={18} className="text-ink-300" />
                </NavLink>

                {/* VIP Membership in mobile */}
                <NavLink
                  to="/membership"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-xl p-3.5 text-base font-bold transition-all shadow-xs ${
                      isActive
                        ? 'bg-amber-400 text-ink-950'
                        : 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-950 border border-amber-300'
                    }`
                  }
                >
                  <span className="flex items-center gap-2">
                    <Crown size={18} className="text-amber-500 fill-amber-400" />
                    <span>VIP Membership</span>
                  </span>
                  <span className="rounded-full bg-amber-400/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-900">
                    ALL-ACCESS
                  </span>
                </NavLink>

                {/* Playflix Tool in mobile */}
                <a
                  href="https://www.bdbeginner.com/playflix"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50/70 p-3.5 text-base font-bold text-brand-800 transition-colors hover:bg-brand-100"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="text-brand-600" />
                    <span>Playflix Tool</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-brand-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-white">
                      TOOL
                    </span>
                    <ExternalLink size={14} className="text-brand-400" />
                  </div>
                </a>
              </nav>

              <div className="my-4 h-px bg-ink-100" />

              {/* Explore Catalog */}
              <div className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-ink-400">
                Explore Catalog
              </div>
              <nav className="flex flex-col gap-1">
                {exploreLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                          isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900'
                        }`
                      }
                    >
                      <Icon size={16} className="text-ink-400" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>

              <div className="my-5 h-px bg-ink-100" />

              {/* Secondary links */}
              <nav className="flex flex-col gap-1">
                {siteSettings.support_button_enabled && (
                  <Link to="/support" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-600 hover:bg-ink-50">
                    <LifeBuoy size={18} className="text-ink-400" />
                    Get Support
                  </Link>
                )}
                <Link to={session ? "/account" : "/login"} className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-ink-600 hover:bg-ink-50">
                  <User size={18} className="text-ink-400" />
                  My Account
                </Link>
              </nav>
            </div>

            <div className="border-t border-ink-100 p-5">
              <Button to="/products" fullWidth size="lg">
                Explore Products
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
