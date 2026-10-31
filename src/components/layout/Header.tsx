import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, UserRound, Crown, Play } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { safeHttpUrl } from "@/lib/urls";

const links = [
  { to: "/products", label: "Discover" },
  { to: "/wordpress", label: "Free resources" },
  { to: "/services", label: "Services" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const menuButton = useRef<HTMLButtonElement>(null);
  const { count, openCart } = useCart();
  const { session } = useCustomerAuth();
  const { siteSettings } = useSiteSettings();
  const logo = safeHttpUrl(siteSettings.logo_url);
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!mobileOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [mobileOpen]);
  const brand = (
    <>
      <span className="studio-logo-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="studio-logo-type">
        bd<span>Beginner</span>
        <sup className="ml-0.5 text-[9px]">®</sup>
      </span>
    </>
  );
  return (
    <>
      <header className="studio-header">
        <div className="studio-header-inner">
          <Link
            to="/"
            aria-label={`${siteSettings.site_name} home`}
            className="studio-logo"
          >
            {logo ? (
              <ImageWithFallback
                src={logo}
                alt={siteSettings.site_name}
                fallback={brand}
              />
            ) : (
              brand
            )}
          </Link>
          <nav className="studio-desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
            <a
              href="https://www.bdbeginner.com/playflix"
              className="studio-nav-playflix"
            >
              <Play size={12} fill="currentColor" /> Playflix{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
          <div className="studio-header-actions">
            <Link to="/membership" className="studio-header-member">
              <Crown size={14} /> Membership <span aria-hidden="true">↗</span>
            </Link>
            <Link
              to={session ? "/account" : "/login"}
              aria-label={session ? "My account" : "Sign in"}
              className="studio-icon-button studio-account-button"
            >
              <UserRound size={18} />
            </Link>
            <button
              onClick={openCart}
              aria-label={`Cart with ${count} items`}
              className="studio-icon-button"
            >
              <ShoppingBag size={18} />
              {count > 0 && <span className="studio-cart-count">{count}</span>}
            </button>
            <button
              ref={menuButton}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              className="studio-icon-button studio-menu-toggle"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="studio-mobile-nav"
          >
            {[
              ...links,
              { to: "/products?category=courses", label: "Courses" },
              { to: "/membership", label: "Membership" },
              { to: "/support", label: "Support" },
              {
                to: session ? "/account" : "/login",
                label: session ? "My account" : "Sign in",
              },
              {
                to: session ? "/account/wishlist" : "/wishlist",
                label: "Wishlist",
              },
            ].map((link) => (
              <NavLink key={link.to} to={link.to}>
                {link.label}
              </NavLink>
            ))}
            <a
              href="https://www.bdbeginner.com/playflix"
              className="studio-nav-playflix"
            >
              <Play size={13} /> Explore Playflix ↗
            </a>
          </nav>
        )}
      </header>
      <CartDrawer />
    </>
  );
}
