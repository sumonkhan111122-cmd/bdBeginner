import { SectionHeading } from '@/components/ui/SectionHeading';

const steps = [
  {
    number: '01',
    title: 'Choose Your Product',
    description: 'Review product details, requirements and delivery information before making a decision.',
  },
  {
    number: '02',
    title: 'Complete Your Order',
    description: 'Proceed through a clear and straightforward checkout process to finalize your purchase.',
  },
  {
    number: '03',
    title: 'Receive Your Product',
    description: 'Delivery instructions depend on the product type and are shown clearly before purchase.',
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding bg-ink-50/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="How It Works"
          title="How purchasing works"
          description="A simple three-step process from browsing to receiving your digital product."
          align="center"
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {/* Horizontal connector (desktop) */}
              {index < steps.length - 1 && (
                <div
                  className="absolute top-7 left-16 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-ink-200 to-transparent sm:block"
                  aria-hidden="true"
                />
              )}
              {/* Vertical connector (mobile) */}
              {index < steps.length - 1 && (
                <div
                  className="absolute left-7 top-14 h-[calc(100%-3.5rem)] w-px bg-gradient-to-b from-ink-200 to-transparent sm:hidden"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl border border-ink-200 bg-white font-display text-lg font-extrabold text-brand-600 shadow-soft">
                {step.number}
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900 sm:mt-5 sm:text-lg">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500 sm:mt-2">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
