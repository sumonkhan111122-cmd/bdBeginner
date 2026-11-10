import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Crown, Menu, Play, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { safeHttpUrl } from '@/lib/urls';
import { PLAYFLIX_URL } from '@/data/playflix';

const links = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/products', label: 'Digital products' },
  { to: PLAYFLIX_URL, label: 'Playflix' },
  { to: '/services', label: 'Services' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { count, openCart, isOpen: cartOpen } = useCart();
  const { session } = useCustomerAuth();
  const { siteSettings } = useSiteSettings();
  const logo = safeHttpUrl(siteSettings.logo_url);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery(new URLSearchParams(location.search).get('search') || '');
  }, [location.pathname, location.search]);
  useEffect(() => { if (searchOpen) searchInput.current?.focus(); }, [searchOpen]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat || cartOpen) return;
      const target = event.target as HTMLElement | null;
      const editing = target?.closest('input, textarea, select, [contenteditable="true"]');
      const commandSearch = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const slashSearch = event.key === '/' && !editing && !event.ctrlKey && !event.metaKey && !event.altKey;
      if (!commandSearch && !slashSearch) return;
      event.preventDefault();
      setMobileOpen(false);
      setSearchOpen(true);
      searchInput.current?.focus();
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [cartOpen]);
  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    const close = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (searchOpen) { setSearchOpen(false); searchButton.current?.focus(); }
      else { setMobileOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('pointerdown', outside);
    };
  }, [mobileOpen, searchOpen]);

  const brand = <><span className="bb-brand-symbol" aria-hidden="true"><i /><i /><i /></span><span className="bb-brand-name">bd<span>Beginner</span><span className="bb-brand-period">.</span></span></>;

  return <>
    <a href="#main-content" className="bb-skip-link">Skip to content</a>
    <div className="bb-announcement"><span>A little curiosity. A world of possibilities.</span><Link to="/products">Find your next digital tool <ArrowUpRight size={13} /></Link></div>
    <header ref={headerRef} className="bb-header">
      <div className="bb-container bb-header-inner">
        <Link to="/" className="bb-brand" aria-label={`${siteSettings.site_name || 'bdBeginner'} home`}>
          {logo ? <ImageWithFallback src={logo} alt={siteSettings.site_name} loading="eager" fallback={brand} /> : brand}
        </Link>
        <nav className="bb-desktop-nav" aria-label="Main navigation">
          {links.map(link => link.to === PLAYFLIX_URL ? <a key={link.to} href={link.to} className="bb-playflix-link"><Play size={15} aria-hidden="true" />{link.label}</a> : <NavLink key={link.to} to={link.to} end={link.to === '/'}>{link.label}{link.to === '/products' && <ChevronDown size={12} aria-hidden="true" />}</NavLink>)}
          <NavLink to="/membership" className="bb-membership-link"><Crown size={14} aria-hidden="true" /> Membership</NavLink>
        </nav>
        <div className="bb-header-actions">
          <button ref={searchButton} type="button" onClick={() => { setMobileOpen(false); setSearchOpen(!searchOpen); }} className="bb-icon-btn" title="Search (Ctrl+K or /)" aria-keyshortcuts="Control+k Meta+k /" aria-label={searchOpen ? 'Close search' : 'Open search'} aria-expanded={searchOpen} aria-controls="site-search"><Search size={19} /></button>
          <button type="button" onClick={openCart} className="bb-icon-btn bb-cart-btn" aria-label={`Cart with ${count} items`}><ShoppingBag size={19} />{count > 0 && <span className="bb-cart-count">{count}</span>}</button>
          <span className="bb-header-divider" />
          <Link to={session ? '/account' : '/login'} className="bb-account-link"><UserRound size={16} /><span>{session ? 'My account' : 'Sign in'}</span></Link>
          <button ref={menuButton} type="button" className="bb-icon-btn bb-menu-toggle" onClick={() => { setSearchOpen(false); setMobileOpen(!mobileOpen); }} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation">{mobileOpen ? <X size={23} /> : <Menu size={23} />}</button>
        </div>
      </div>
      {searchOpen && <form id="site-search" className="bb-container bb-header-search" role="search" onSubmit={event => { event.preventDefault(); navigate(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : '/products'); setSearchOpen(false); }}><Search size={20} /><input ref={searchInput} type="search" name="search" maxLength={200} value={query} onChange={event => setQuery(event.target.value)} aria-label="Search the catalog" placeholder="Search courses, tools, themes, and more…" /><button type="submit">Search <ArrowRight size={16} /></button></form>}
      {mobileOpen && <nav id="mobile-navigation" className="bb-mobile-nav bb-container" aria-label="Mobile navigation">{[...links, { to: '/membership', label: 'Membership' }, { to: '/categories', label: 'All categories' }, { to: '/support', label: 'Support' }, { to: session ? '/account' : '/login', label: session ? 'My account' : 'Sign in' }, { to: '/wishlist', label: 'Wishlist' }].map(link => link.to === PLAYFLIX_URL ? <a key={link.to} href={link.to} className="bb-playflix-link">{link.label}<ArrowUpRight size={16} /></a> : <NavLink key={link.to} to={link.to} end={link.to === '/'}>{link.label}<ArrowUpRight size={16} /></NavLink>)}</nav>}
    </header>
    <CartDrawer />
  </>;
}
