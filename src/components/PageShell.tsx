import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import '@/interior-redesign.css';

type PageShellProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  children?: ReactNode;
};

export function PageShell({ title, description, eyebrow, children }: PageShellProps) {
  return (
    <Layout>
      <div className="interior-page">
        <header className="interior-page-heading">
          <div className="container-page">
            <nav className="interior-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link><ChevronRight size={13} aria-hidden="true" /><span>{eyebrow || title}</span>
            </nav>
            <div className="interior-heading-grid">
              <div>
                {eyebrow && <span className="interior-eyebrow"><span />{eyebrow}</span>}
                <h1>{title}</h1>
                {description && <p>{description}</p>}
              </div>
              <span className="interior-heading-symbol" aria-hidden="true"><ArrowUpRight strokeWidth={1.2} /></span>
            </div>
          </div>
        </header>
        {children && <div className="container-page interior-page-content">{children}</div>}
      </div>
    </Layout>
  );
}
