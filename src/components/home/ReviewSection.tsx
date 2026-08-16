import { SectionHeading } from '@/components/ui/SectionHeading';

export function ReviewSection() {
  return (
    <section className="section-padding bg-ink-50/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="Customer Reviews"
          title="Customer reviews will appear here"
          description="We are building a transparent review system. Once real customer feedback is available, it will be displayed in this section."
          align="center"
        />
      </div>
    </section>
  );
}
