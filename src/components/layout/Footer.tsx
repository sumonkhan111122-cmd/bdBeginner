import { Link } from "react-router-dom";
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  ArrowUpRight,
} from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { safeHttpUrl } from "@/lib/urls";

const groups = [
  {
    title: "Discover",
    links: [
      { label: "All resources", to: "/products" },
      { label: "WordPress themes", to: "/wordpress" },
      { label: "Plugins & scripts", to: "/plugins" },
      { label: "Courses & learning", to: "/products?category=courses" },
    ],
  },
  {
    title: "Go further",
    links: [
      { label: "Playflix ↗", to: "https://www.bdbeginner.com/playflix" },
      { label: "Membership", to: "/membership" },
      { label: "AI Motion Masterclass", to: "/course/ai-motion" },
      { label: "Our services", to: "/services" },
    ],
  },
  {
    title: "We are here",
    links: [
      { label: "About bdBeginner", to: "/about" },
      { label: "Contact us", to: "/contact" },
      { label: "Support center", to: "/support" },
      { label: "My account", to: "/account" },
      { label: "My wishlist", to: "/wishlist" },
    ],
  },
];
export function Footer() {
  const { siteSettings } = useSiteSettings();
  const email = siteSettings.contact_email || siteSettings.support_email;
  const socials = [
    { icon: Facebook, label: "Facebook", href: siteSettings.facebook_url },
    { icon: Youtube, label: "YouTube", href: siteSettings.youtube_url },
    { icon: Instagram, label: "Instagram", href: siteSettings.instagram_url },
    { icon: Twitter, label: "X", href: siteSettings.x_url },
    { icon: Linkedin, label: "LinkedIn", href: siteSettings.linkedin_url },
  ];
  return (
    <footer className="studio-footer">
      <div className="studio-container">
        <div className="studio-footer-top">
          <Link to="/" className="studio-footer-brand">
            bd<span>Beginner</span>®
          </Link>
          <p>
            Independent ideas. Digital possibilities.
            <br />A good place to begin your next big thing.
          </p>
          <Link to="/support" className="studio-inline-link">
            Let's talk <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="studio-footer-main">
          <div className="footer-contact">
            <p>MADE FOR YOUR NEXT CHAPTER.</p>
            {email && <a href={`mailto:${email}`}>{email}</a>}
            {siteSettings.phone && (
              <div>
                <a href={`tel:${siteSettings.phone}`}>{siteSettings.phone}</a>
              </div>
            )}
            <div className="studio-socials">
              {socials.map((social) => {
                const href = safeHttpUrl(social.href);
                return href ? (
                  <a
                    key={social.label}
                    href={href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <social.icon size={15} />
                  </a>
                ) : null;
              })}
            </div>
          </div>
          {groups.map((group) => (
            <div key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.to}>
                    {link.to.startsWith("http") ? (
                      <a href={link.to}>{link.label}</a>
                    ) : (
                      <Link to={link.to}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="studio-footer-bottom">
          <span>
            © {new Date().getFullYear()} {siteSettings.site_name}. All rights
            reserved.
          </span>
          <div>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/refund-policy">Refunds</Link>
            <Link to="/delivery-policy">Delivery</Link>
          </div>
          <span>BUILT WITH A LITTLE AMBITION. ↗</span>
        </div>
      </div>
    </footer>
  );
}
