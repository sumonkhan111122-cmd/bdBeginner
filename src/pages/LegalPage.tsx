import { Layout } from '@/components/layout/Layout';

type LegalPageProps = {
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
};

export function LegalPage({ title, description, sections }: LegalPageProps) {
  return (
    <Layout>
      <div className="border-b border-ink-100 bg-ink-50/40">
        <div className="container-page py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-display-md text-ink-900 text-balance">{title}</h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-500 text-balance">
              {description}
            </p>
            <p className="mt-4 text-sm text-ink-400">Last updated: August 2025</p>
          </div>
        </div>
      </div>

      <div className="container-page section-padding">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={index}>
                <h2 className="font-display text-xl font-bold text-ink-900">
                  {section.heading}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-ink-600">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
