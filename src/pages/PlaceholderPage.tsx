import { Link } from 'react-router-dom';
import { Construction, ArrowRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';

type PlaceholderPageProps = {
  title: string;
  description: string;
  eyebrow?: string;
  backLink?: string;
  backLabel?: string;
};

export function PlaceholderPage({
  title,
  description,
  eyebrow = 'Coming Soon',
  backLink = '/',
  backLabel = 'Back to Home',
}: PlaceholderPageProps) {
  return (
    <Layout>
      <div className="container-page section-padding">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
            <Construction size={28} />
          </div>
          <span className="mt-6 inline-block text-sm font-semibold uppercase tracking-wider text-brand-600">
            {eyebrow}
          </span>
          <h1 className="mt-3 text-display-md text-ink-900 text-balance">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink-500 text-balance">
            {description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button to={backLink} size="md">
              <ArrowRight size={16} className="rotate-180" />
              {backLabel}
            </Button>
            <Button to="/products" variant="outline" size="md">
              Browse Products
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export { Layout, Link };
