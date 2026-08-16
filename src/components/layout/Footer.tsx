import { Link } from 'react-router-dom';
import {
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
} from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { safeHttpUrl } from '@/lib/urls';

const footerGroups = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/products' },
      { label: 'WordPress', to: '/wordpress' },
      { label: 'Digital Resources', to: '/resources' },
      { label: 'Deals', to: '/deals' },
      { label: 'Categories', to: '/categories' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'WordPress Development', to: '/services/wordpress-website-development' },
      { label: 'Business Websites', to: '/services/business-website-development' },
      { label: 'E-commerce Development', to: '/services/ecommerce-development' },
      { label: 'Landing Page Design', to: '/services/landing-page-design' },
      { label: 'All Services', to: '/services' },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { label: 'Support Center', to: '/support' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'My Account', to: '/account' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms & Conditions', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Refund Policy', to: '/refund-policy' },
      { label: 'Delivery Policy', to: '/delivery-policy' },
    ],
  },
];

export function Footer() {
  const { siteSettings } = useSiteSettings();
  const socialLinks = [
    { icon: Twitter, label: 'X / Twitter', href: safeHttpUrl(siteSettings.x_url) },
    { icon: Facebook, label: 'Facebook', href: safeHttpUrl(siteSettings.facebook_url) },
    { icon: Instagram, label: 'Instagram', href: safeHttpUrl(siteSettings.instagram_url) },
    { icon: Linkedin, label: 'LinkedIn', href: safeHttpUrl(siteSettings.linkedin_url) },
    { icon: Youtube, label: 'YouTube', href: safeHttpUrl(siteSettings.youtube_url) },
  ];
  const contactEmail = siteSettings.contact_email || siteSettings.support_email;

  return (
    <footer className="border-t border-ink-100 bg-ink-50/50">
      <div className="container-page py-12 lg:py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6 lg:gap-10">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5" aria-label={`${siteSettings.site_name} home`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white font-display font-extrabold text-lg shadow-sm">
                b
              </span>
              <span className="font-display text-xl font-extrabold tracking-tight text-ink-900">{siteSettings.site_name}</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-500">
              {siteSettings.tagline}
            </p>
            {(contactEmail || siteSettings.phone || siteSettings.whatsapp) && (
              <div className="mt-4 flex flex-col gap-1 text-xs text-ink-500">
                {contactEmail && <a href={`mailto:${contactEmail}`} className="hover:text-ink-800">{contactEmail}</a>}
                {siteSettings.phone && <a href={`tel:${siteSettings.phone}`} className="hover:text-ink-800">{siteSettings.phone}</a>}
                {siteSettings.whatsapp && <span>WhatsApp: {siteSettings.whatsapp}</span>}
              </div>
            )}
            <div className="mt-5 flex items-center gap-2">
              {socialLinks.map((social) => social.href ? (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 transition-all hover:border-ink-300 hover:text-ink-900 hover:shadow-soft"
                  >
                    <social.icon size={16} />
                  </a>
                ) : null)}
            </div>
          </div>

          {/* Link groups */}
          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-ink-900">
                {group.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-ink-500 transition-colors hover:text-ink-900 link-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-8 sm:flex-row">
          <p className="text-sm text-ink-400">
            &copy; {new Date().getFullYear()} {siteSettings.site_name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-ink-400">
            <Link to="/terms" className="hover:text-ink-700 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-ink-700 transition-colors">Privacy</Link>
            <Link to="/refund-policy" className="hover:text-ink-700 transition-colors">Refunds</Link>
            <Link to="/delivery-policy" className="hover:text-ink-700 transition-colors">Delivery Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
