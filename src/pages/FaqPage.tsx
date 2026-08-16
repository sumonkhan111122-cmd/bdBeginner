import { Layout } from '@/components/layout/Layout';
import { faqItems } from '@/data/homepage';
import { FaqAccordion } from '@/components/FaqAccordion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { LifeBuoy } from 'lucide-react';

export function FaqPage() {
  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Find answers to the most common questions about purchasing digital products and services from bdBeginner."
            align="center"
          />
        </div>
      </div>

      <div className="container-page section-padding">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={faqItems} />

          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-ink-100 bg-ink-50/50 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <LifeBuoy size={24} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink-900">
                Didn't find your answer?
              </h2>
              <p className="mt-1.5 text-sm text-ink-500">
                Our support team is ready to help with any other questions you might have.
              </p>
            </div>
            <Button to="/support" size="md">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
