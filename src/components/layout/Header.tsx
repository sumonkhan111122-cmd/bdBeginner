import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Crown, Menu, Play, Search, ShoppingBag, Sparkles, UserRound, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { usePublishedProducts } from '@/hooks/useCatalog';
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
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const location = useLocation();
  const navigate = useNavigate();
  const menuButton = useRef<HTMLButtonElement>(null);
  const searchButton = useRef<HTMLButtonElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const { count, openCart, isOpen: cartOpen } = useCart();
  const { session } = useCustomerAuth();
  const { siteSettings } = useSiteSettings();
  const { data: allProducts } = usePublishedProducts();
  const logo = safeHttpUrl(siteSettings.logo_url);

  // Filter live search matches instantly as characters are typed
  const liveMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const terms = q.split(/\s+/).filter(Boolean);
    return allProducts
      .filter((p) => {
        const text = `${p.name} ${p.category} ${p.subcategory || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        return terms.every((t) => text.includes(t));
      })
      .slice(0, 6);
  }, [query, allProducts]);

  const totalMatchCount = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return 0;
    const terms = q.split(/\s+/).filter(Boolean);
    return allProducts.filter((p) => {
      const text = `${p.name} ${p.category} ${p.subcategory || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      return terms.every((t) => text.includes(t));
    }).length;
  }, [query, allProducts]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [query]);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setQuery(new URLSearchParams(location.search).get('search') || '');
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (searchOpen) searchInput.current?.focus();
  }, [searchOpen]);

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
      if (searchOpen) {
        setSearchOpen(false);
        searchButton.current?.focus();
      } else {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener('keydown', close);
    window.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('pointerdown', outside);
    };
  }, [mobileOpen, searchOpen]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedIndex >= 0 && liveMatches[selectedIndex]) {
      navigate(`/products/${liveMatches[selectedIndex].slug}`);
    } else {
      navigate(query.trim() ? `/products?search=${encodeURIComponent(query.trim())}` : '/products');
    }
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < liveMatches.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
    }
  };

  const brand = (
    <>
      <span className="bb-brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="bb-brand-name">
        bd<span>Beginner</span>
        <span className="bb-brand-period">.</span>
      </span>
    </>
  );

  return (
    <>
      <a href="#main-content" className="bb-skip-link">
        Skip to content
      </a>
      <div className="bb-announcement">
        <span>A little curiosity. A world of possibilities.</span>
        <Link to="/products">
          Find your next digital tool <ArrowUpRight size={13} />
        </Link>
      </div>
      <header ref={headerRef} className="bb-header">
        <div className="bb-container bb-header-inner">
          <Link to="/" className="bb-brand" aria-label={`${siteSettings.site_name || 'bdBeginner'} home`}>
            {logo ? <ImageWithFallback src={logo} alt={siteSettings.site_name} loading="eager" fallback={brand} /> : brand}
          </Link>
          <nav className="bb-desktop-nav" aria-label="Main navigation">
            {links.map((link) =>
              link.to === PLAYFLIX_URL ? (
                <a key={link.to} href={link.to} className="bb-playflix-link">
                  <Play size={15} aria-hidden="true" />
                  {link.label}
                </a>
              ) : (
                <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                  {link.label}
                  {link.to === '/products' && <ChevronDown size={12} aria-hidden="true" />}
                </NavLink>
              )
            )}
            <NavLink to="/membership" className="bb-membership-link">
              <Crown size={14} aria-hidden="true" /> Membership
            </NavLink>
          </nav>
          <div className="bb-header-actions">
            <button
              ref={searchButton}
              type="button"
              onClick={() => {
                setMobileOpen(false);
                setSearchOpen(!searchOpen);
              }}
              className="bb-icon-btn"
              title="Search (Ctrl+K or /)"
              aria-keyshortcuts="Control+k Meta+k /"
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
              aria-controls="site-search"
            >
              <Search size={19} />
            </button>
            <button type="button" onClick={openCart} className="bb-icon-btn bb-cart-btn" aria-label={`Cart with ${count} items`}>
              <ShoppingBag size={19} />
              {count > 0 && <span className="bb-cart-count">{count}</span>}
            </button>
            <span className="bb-header-divider" />
            <Link to={session ? '/account' : '/login'} className="bb-account-link">
              <UserRound size={16} />
              <span>{session ? 'My account' : 'Sign in'}</span>
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="bb-icon-btn bb-menu-toggle"
              onClick={() => {
                setSearchOpen(false);
                setMobileOpen(!mobileOpen);
              }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
            >
              {mobileOpen ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="bb-container bb-header-search-wrap">
            <form id="site-search" className="bb-header-search" role="search" onSubmit={handleSearchSubmit}>
              <Search size={20} />
              <input
                ref={searchInput}
                type="search"
                name="search"
                maxLength={200}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Search the catalog"
                placeholder="Search courses, themes, plugins, tools and scripts..."
                autoComplete="off"
              />
              <button type="submit">
                Search <ArrowRight size={16} />
              </button>
            </form>

            {/* Instant Live Search Results Popup */}
            {query.trim().length > 0 && (
              <div className="bb-live-search-dropdown" role="listbox">
                <div className="bb-live-search-header">
                  <span>
                    <Sparkles size={12} className="inline mr-1 text-brand-600" />
                    লাইভ রেজাল্ট ({totalMatchCount} টি পাওয়া গেছে)
                  </span>
                  <span className="text-[10px] text-ink-400 font-normal">কিবোর্ডের তীর চিহ্ন (↑↓) ব্যবহার করতে পারেন</span>
                </div>

                {liveMatches.length > 0 ? (
                  <>
                    <ul className="bb-live-search-list">
                      {liveMatches.map((product, idx) => (
                        <li key={product.id}>
                          <Link
                            to={`/products/${product.slug}`}
                            onClick={() => setSearchOpen(false)}
                            className={`bb-live-search-item ${idx === selectedIndex ? 'is-selected' : ''}`}
                            role="option"
                            aria-selected={idx === selectedIndex}
                          >
                            <img
                              src={product.thumbnailUrl || '/placeholder.png'}
                              alt=""
                              className="bb-live-search-thumb"
                              loading="lazy"
                            />
                            <div className="bb-live-search-info">
                              <div className="bb-live-search-title">{product.name}</div>
                              <div className="bb-live-search-meta">
                                <span className="bb-live-search-badge">{product.category}</span>
                                {product.price === 0 ? (
                                  <span className="bb-live-search-price">১০০% ফ্রি ডাউনলোড</span>
                                ) : (
                                  <span className="bb-live-search-price">৳{product.price}</span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={14} className="text-ink-300 ml-auto" />
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <div className="bb-live-search-footer">
                      <span className="text-xs text-ink-500">
                        {totalMatchCount > 6 ? `আরও ${totalMatchCount - 6} টি প্রোডাক্ট রয়েছে` : 'সব প্রোডাক্ট দেখানো হয়েছে'}
                      </span>
                      <button type="button" onClick={() => handleSearchSubmit()}>
                        সবগুলো ফলাফল দেখুন ({totalMatchCount}) <ArrowRight size={13} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="bb-live-search-empty">
                    <p className="text-sm font-medium text-ink-700">&ldquo;{query}&rdquo; এর সাথে কোনো প্রোডাক্ট মেলেনি</p>
                    <p className="text-xs text-ink-400 mt-1">বানান ঠিক আছে কিনা দেখুন অথবা পুরো ক্যাটালগ সার্চ করতে এন্টার চাপুন</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {mobileOpen && (
          <nav id="mobile-navigation" className="bb-mobile-nav bb-container" aria-label="Mobile navigation">
            {[
              ...links,
              { to: '/membership', label: 'Membership' },
              { to: '/categories', label: 'All categories' },
              { to: '/support', label: 'Support' },
              { to: session ? '/account' : '/login', label: session ? 'My account' : 'Sign in' },
              { to: '/wishlist', label: 'Wishlist' },
            ].map((link) =>
              link.to === PLAYFLIX_URL ? (
                <a key={link.to} href={link.to} className="bb-playflix-link">
                  {link.label}
                  <ArrowUpRight size={16} />
                </a>
              ) : (
                <NavLink key={link.to} to={link.to} end={link.to === '/'}>
                  {link.label}
                  <ArrowUpRight size={16} />
                </NavLink>
              )
            )}
          </nav>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
