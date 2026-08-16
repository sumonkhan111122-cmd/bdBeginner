import { services } from '@/data/homepage';
import { ServiceCard } from '@/components/cards/ServiceCard';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function ServicesSection() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <SectionHeading
          eyebrow="Professional Services"
          title="Web solutions beyond products"
          description="Need more than a digital product? Our team delivers professional website development, redesign, and optimization services tailored to your business."
          action={
            <Button to="/services" size="md">
              Explore Services
              <ArrowRight size={16} />
            </Button>
          }
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
}
