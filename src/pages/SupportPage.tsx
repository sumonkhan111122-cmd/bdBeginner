import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Mail, MessageCircle, LifeBuoy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export function SupportPage() {
  const { siteSettings } = useSiteSettings();
  const supportEmail = siteSettings.support_email || siteSettings.contact_email || 'support@bdbeginner.com';
  const whatsappNumber = (siteSettings.whatsapp || '+8801798583122').replace(/\D/g, '');
  const channels = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us a message and we\'ll respond within one business day.',
      action: supportEmail,
      href: `mailto:${supportEmail}`,
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp Support',
      description: 'Message our support team on WhatsApp for order or product assistance.',
      action: 'Open WhatsApp',
      href: `https://wa.me/${whatsappNumber}`,
    },
    {
      icon: LifeBuoy,
      title: 'Help Center',
      description: 'Browse our FAQ and knowledge base for answers to common questions.',
      action: 'View FAQ',
      href: '/faq',
    },
  ];

  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="Support"
            title="How can we help?"
            description="Whether you have questions about a product, an order, or a service, our support team is here to assist you."
          />
        </div>
      </div>

      <div className="container-page section-padding">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <div
              key={channel.title}
              className="card-base card-hover flex flex-col p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <channel.icon size={24} />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
                {channel.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">
                {channel.description}
              </p>
              {channel.href.startsWith('/') ? (
                <Link to={channel.href} className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700">
                  {channel.action}
                </Link>
              ) : (
                <a href={channel.href} className="mt-4 text-sm font-semibold text-brand-600 hover:text-brand-700" target={channel.href.startsWith('https:') ? '_blank' : undefined} rel={channel.href.startsWith('https:') ? 'noreferrer' : undefined}>
                  {channel.action}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/50 p-8 text-center sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2 text-sm text-ink-600">
            <Clock size={18} className="text-ink-400" />
            <span>Response time: within 1 business day</span>
          </div>
          <Button to="/faq" variant="outline" size="md">
            Read FAQ
          </Button>
        </div>
      </div>
    </Layout>
  );
}
