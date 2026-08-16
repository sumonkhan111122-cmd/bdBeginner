import { faqItems } from '@/data/homepage';
import { FaqAccordion } from '@/components/FaqAccordion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { LifeBuoy } from 'lucide-react';

export function FaqSection() {
  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Left: heading + CTA */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="FAQ"
              title="Common questions about buying digital products"
              description="Answers to the questions customers ask most before and after purchasing from bdBeginner."
            />
            <div className="mt-8 rounded-2xl border border-ink-100 bg-ink-50/50 p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <LifeBuoy size={22} />
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                Still have questions?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Our support team is ready to help with any questions about products,
                orders, or delivery.
              </p>
              <Button to="/support" variant="outline" size="sm" className="mt-4">
                Contact Support
              </Button>
            </div>
          </div>

          {/* Right: accordion */}
          <div>
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </div>
    </section>
  );
}
