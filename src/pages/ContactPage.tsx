import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Mail, MapPin, MessageCircle, Send } from 'lucide-react';
import type { FormEvent } from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';

export function ContactPage() {
  const { siteSettings } = useSiteSettings();
  const supportEmail = siteSettings.contact_email || siteSettings.support_email || 'support@bdbeginner.com';
  const whatsappDisplay = siteSettings.whatsapp || '+880 1798 583122';
  const whatsappNumber = whatsappDisplay.replace(/\D/g, '');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const subject = String(formData.get('subject') || 'Website enquiry').trim();
    const message = String(formData.get('message') || '').trim();
    const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');
    window.location.href = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="Contact"
            title="Get in touch"
            description="Have a question, project inquiry, or feedback? We'd love to hear from you."
          />
        </div>
      </div>

      <div className="container-page section-padding">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Contact info */}
          <div className="space-y-6">
            {[
              { icon: Mail, title: 'Email', value: supportEmail, href: `mailto:${supportEmail}` },
              { icon: MessageCircle, title: 'WhatsApp', value: whatsappDisplay, href: `https://wa.me/${whatsappNumber}` },
              { icon: MapPin, title: 'Location', value: 'Online', href: null },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <item.icon size={22} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-ink-900">{item.title}</h3>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('https:') ? '_blank' : undefined} rel={item.href.startsWith('https:') ? 'noreferrer' : undefined} className="mt-1 block text-sm text-brand-600 hover:text-brand-700">
                      {item.value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-ink-500">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-5 sm:p-6">
              <h3 className="font-display text-base font-bold text-ink-900 uppercase tracking-wide">Secure Payments</h3>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {['bKash', 'Nagad', 'Rocket'].map((method) => (
                  <span key={method} className="rounded-lg border border-ink-200 bg-ink-50 px-3 py-1.5 text-sm font-semibold text-ink-700">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-ink-100 bg-white p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold text-ink-900">Send a message</h2>
            <p className="mt-2 text-sm text-ink-500">
              Fill out the form below and we'll get back to you as soon as possible.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Name
                  </label>
                  <input
                    name="name"
                    required
                    maxLength={100}
                    type="text"
                    className="h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Email
                  </label>
                  <input
                    name="email"
                    required
                    maxLength={254}
                    type="email"
                    className="h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Subject
                </label>
                <input
                  name="subject"
                  required
                  maxLength={160}
                  type="text"
                  className="h-11 w-full rounded-xl border border-ink-200 bg-white px-4 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  placeholder="What's this about?"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-ink-700">
                  Message
                </label>
                <textarea
                  name="message"
                  required
                  maxLength={3000}
                  rows={5}
                  className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  placeholder="Tell us more..."
                />
              </div>
              <Button type="submit" size="lg" fullWidth>
                <Send size={18} />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
