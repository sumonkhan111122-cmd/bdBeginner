import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import {
  applyFavicon,
  applyGoogleVerification,
  applySeo,
  applyStructuredData,
  configureGa4,
  configureGtm,
} from '@/lib/seo';

export function SeoController() {
  const { pathname } = useLocation();
  const { siteSettings, seoSettings } = useSiteSettings();

  useEffect(() => {
    const privateRoute = /^\/(admin|account|checkout|cart|wishlist|login|auth|payment|order)(\/|$)/.test(pathname);
    const pages: Record<string, { title: string; description: string }> = {
      '/': { title: seoSettings.default_title, description: seoSettings.default_meta_description },
      '/products': { title: 'Digital Products', description: 'Browse bdBeginner digital products, software, resources, courses, and WordPress tools.' },
      '/categories': { title: 'Product Categories', description: 'Explore bdBeginner products by category, including WordPress, software, AI tools, courses, and digital resources.' },
      '/services': { title: 'Professional Web Services', description: 'Explore bdBeginner website development, redesign, landing page, and optimization services.' },
      '/support': { title: 'Customer Support', description: 'Get help with bdBeginner products, payments, orders, downloads, licenses, and services.' },
      '/contact': { title: 'Contact bdBeginner', description: 'Contact the bdBeginner support team for product, order, service, or business enquiries.' },
      '/faq': { title: 'Frequently Asked Questions', description: 'Answers to common questions about bdBeginner products, payments, delivery, accounts, and support.' },
      '/about': { title: 'About bdBeginner', description: 'Learn about bdBeginner and our approach to digital products and professional web services.' },
      '/terms': { title: 'Terms and Conditions', description: 'Read the bdBeginner terms and conditions.' },
      '/privacy': { title: 'Privacy Policy', description: 'Read how bdBeginner collects, uses, and protects personal information.' },
      '/refund-policy': { title: 'Refund Policy', description: 'Read the bdBeginner refund policy for digital products and services.' },
      '/delivery-policy': { title: 'Delivery Policy', description: 'Learn how bdBeginner digital products, licenses, subscriptions, and services are delivered.' },
    };
    const page = pages[pathname] || {
      title: pathname.startsWith('/products/') ? 'Product Details' : seoSettings.default_title,
      description: seoSettings.default_meta_description,
    };
    applySeo(
      {
        title: page.title === seoSettings.default_title ? page.title : `${page.title} | bdBeginner`,
        description: page.description,
        canonicalPath: pathname,
        image: seoSettings.default_og_image_url,
        index: privateRoute ? false : undefined,
        follow: privateRoute ? false : undefined,
      },
      seoSettings,
    );
  }, [pathname, seoSettings]);

  useEffect(() => {
    applyFavicon(siteSettings.favicon_url);
  }, [siteSettings.favicon_url]);

  useEffect(() => {
    applyGoogleVerification(seoSettings.google_search_console_verification);
    configureGa4(seoSettings.google_analytics_id);
    configureGtm(seoSettings.google_tag_manager_id);
  }, [seoSettings]);

  useEffect(() => {
    applyStructuredData('organization', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteSettings.site_name || 'bdBeginner',
      url: window.location.origin,
      ...(siteSettings.logo_url ? { logo: siteSettings.logo_url } : {}),
      ...(siteSettings.support_email ? { email: siteSettings.support_email } : {}),
    });
    applyStructuredData('website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteSettings.site_name || 'bdBeginner',
      url: window.location.origin,
    });
  }, [siteSettings.logo_url, siteSettings.site_name, siteSettings.support_email]);

  return null;
}
