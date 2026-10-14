import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { services } from '@/data/homepage';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = ['All', ...new Set(services.map((s) => s.category).filter(Boolean) as string[])];
    return cats;
  }, []);

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'All') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <Layout>
      {/* Header */}
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="Professional Web Services"
            title="Expert Web Development & Maintenance"
            description="Beyond digital products, bdBeginner offers professional website setup, theme customization, bug fixing, speed optimization, and e-commerce solutions."
          />

          {/* Filter Categories */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white shadow-soft'
                    : 'border border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="container-page section-padding">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Custom Project CTA Banner */}
        <div className="mt-16 overflow-hidden rounded-3xl bg-brand-600 p-8 text-white shadow-soft sm:p-12">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <Sparkles size={13} /> Need a Custom Package?
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                Have a unique project or need consultation?
              </h2>
              <p className="mt-2 text-sm text-brand-100 sm:text-base">
                Whether you need a complete website from scratch, monthly maintenance, or emergency bug repairs, we are here to help.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:justify-end">
              <a
                href="https://wa.me/8801990141151?text=Hello%20bdBeginner%2C%20I%20need%20a%20custom%20web%20service%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 font-semibold text-brand-900 transition-colors hover:bg-brand-50"
              >
                <MessageCircle size={16} /> WhatsApp Chat
              </a>
              <Link
                to="/contact"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 font-semibold text-white transition-colors hover:bg-white/20"
              >
                <Mail size={16} /> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
