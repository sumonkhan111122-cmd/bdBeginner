import { whyItems } from '@/data/homepage';
import { TrustItemCard } from '@/components/cards/TrustItemCard';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function WhyBdBeginner() {
  return (
    <section className="section-padding bg-ink-50/40">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why bdBeginner?"
          title="Trust through transparency"
          description="We focus on what matters when buying digital products online — clear information, honest delivery details, and responsive support."
          align="center"
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {whyItems.map((item) => (
            <TrustItemCard key={item.title} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
