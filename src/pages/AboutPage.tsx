import { Layout } from '@/components/layout/Layout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Target, Eye, Heart, Globe } from 'lucide-react';

export function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Quality First',
      description: 'We carefully select products and deliver services that meet a high standard of quality.',
    },
    {
      icon: Eye,
      title: 'Transparency',
      description: 'Clear product information, honest descriptions, and straightforward communication.',
    },
    {
      icon: Heart,
      title: 'Customer Care',
      description: 'Responsive support and a genuine commitment to helping customers succeed.',
    },
    {
      icon: Globe,
      title: 'Accessible Worldwide',
      description: 'Digital products and services available to customers wherever they are.',
    },
  ];

  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="About Us"
            title="About bdBeginner"
            description="bdBeginner is a digital marketplace and technology service brand offering premium digital products, WordPress tools, software, resources, and professional web solutions."
          />
        </div>
      </div>

      <div className="container-page section-padding">
        {/* Story */}
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-xl font-bold text-ink-900">Our Story</h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-600">
            <p>
              bdBeginner was created with a simple goal: to be a trusted place where people
              can find quality digital products and professional web services without the
              noise and clutter of typical online marketplaces.
            </p>
            <p>
              We focus on what matters most — clear product information, reliable delivery,
              and support that actually responds. Whether you're a developer looking for a
              WordPress theme, a business owner needing a website, or a creator searching for
              the right digital tools, we want bdBeginner to be a place you can trust.
            </p>
            <p>
              Our catalog spans WordPress products, professional software, AI tools, practical
              courses, downloadable digital resources, and a range of professional web services
              — all carefully selected and supported by our team.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mt-16">
          <h2 className="text-center font-display text-display-sm text-ink-900">
            What we value
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col items-start rounded-2xl border border-ink-100 bg-white p-6 transition-all duration-300 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <value.icon size={24} />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 rounded-3xl bg-ink-950 p-10 text-center">
          <h2 className="font-display text-display-sm text-white">
            Ready to explore what we offer?
          </h2>
          <p className="max-w-xl text-ink-300">
            Browse our catalog of digital products or learn more about our professional web services.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/products" size="lg">
              Explore Products
            </Button>
            <Button to="/services" variant="outline" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/30">
              Explore Services
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
