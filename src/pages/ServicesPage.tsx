import { Layout } from '@/components/layout/Layout';
import { services } from '@/data/homepage';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function ServicesPage() {
  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="Professional Services"
            title="Web Development & Design Services"
            description="Beyond digital products, we offer professional website development, redesign, and optimization services tailored to your business needs."
          />
        </div>
      </div>

      <div className="container-page section-padding">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
