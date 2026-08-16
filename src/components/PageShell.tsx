import { Layout } from '@/components/layout/Layout';

type PageShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: React.ReactNode;
};

export function PageShell({ title, description, eyebrow, children }: PageShellProps) {
  return (
    <Layout>
      <div className="container-page section-padding">
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow && (
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-600">
              {eyebrow}
            </span>
          )}
          <h1 className="text-display-md text-ink-900 text-balance">{title}</h1>
          {description && (
            <p className="mt-4 text-lg leading-relaxed text-ink-500 text-balance">
              {description}
            </p>
          )}
        </div>
        {children && <div className="mt-12">{children}</div>}
      </div>
    </Layout>
  );
}
