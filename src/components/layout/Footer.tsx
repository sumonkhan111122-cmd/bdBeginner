import { Link } from 'react-router-dom';
import { ArrowUpRight, Facebook, Heart, Instagram, Linkedin, Mail, Twitter, Youtube } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { safeHttpUrl } from '@/lib/urls';
import { PLAYFLIX_URL } from '@/data/playflix';

const groups = [
  { title: 'Explore', links: [{ label: 'All courses', to: '/courses' }, { label: 'Digital products', to: '/products' }, { label: 'WordPress themes', to: '/wordpress' }, { label: 'Plugins & tools', to: '/plugins' }, { label: 'All categories', to: '/categories' }] },
  { title: 'Go further', links: [{ label: 'Playflix ↗', to: PLAYFLIX_URL }, { label: 'Membership', to: '/membership' }, { label: 'Web services', to: '/services' }] },
  { title: 'Here to help', links: [{ label: 'About us', to: '/about' }, { label: 'Support center', to: '/support' }, { label: 'Contact us', to: '/contact' }, { label: 'My account', to: '/account' }, { label: 'FAQs', to: '/faq' }] },
];

export function Footer() {
  const { siteSettings } = useSiteSettings();
  const email = siteSettings.contact_email || siteSettings.support_email;
  const socials = [
    { icon: Facebook, label: 'Facebook', href: siteSettings.facebook_url },
    { icon: Youtube, label: 'YouTube', href: siteSettings.youtube_url },
    { icon: Instagram, label: 'Instagram', href: siteSettings.instagram_url },
    { icon: Twitter, label: 'X', href: siteSettings.x_url },
    { icon: Linkedin, label: 'LinkedIn', href: siteSettings.linkedin_url },
  ];
  return <footer className="bb-footer"><div className="bb-container">
    <div className="bb-footer-grid"><div className="bb-footer-about"><Link to="/" className="bb-brand" aria-label="bdBeginner home"><span className="bb-brand-symbol" aria-hidden="true"><i /><i /><i /></span><span className="bb-brand-name">bd<span>Beginner</span><span className="bb-brand-period">.</span></span></Link><p>A place for curious minds and creative beginnings. Learn a little. Make something. Go further.</p>{email && <a href={`mailto:${email}`} className="bb-footer-email"><Mail size={16} /> {email}</a>}<div className="bb-footer-socials">{socials.map(social => { const href = safeHttpUrl(social.href); return href ? <a key={social.label} href={href} aria-label={social.label} target="_blank" rel="noreferrer"><social.icon size={17} /></a> : null; })}</div></div>{groups.map(group => <div className="bb-footer-group" key={group.title}><h3>{group.title}</h3><ul>{group.links.map(link => <li key={link.to}>{link.to.startsWith('http') ? <a href={link.to}>{link.label}</a> : <Link to={link.to}>{link.label}</Link>}</li>)}</ul></div>)}</div>
    <div className="bb-footer-bottom"><span>© {new Date().getFullYear()} {siteSettings.site_name || 'bdBeginner'}. All rights reserved.</span><div><Link to="/terms">Terms</Link><Link to="/privacy">Privacy</Link><Link to="/refund-policy">Refunds</Link><Link to="/delivery-policy">Delivery</Link></div><span>Made for your next beginning <Heart size={12} /></span></div>
  </div></footer>;
}
