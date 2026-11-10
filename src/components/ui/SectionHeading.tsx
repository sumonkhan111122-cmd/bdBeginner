import type { ReactNode } from 'react';
import '@/interior-redesign.css';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  action?: ReactNode;
  className?: string;
  as?: 'h1' | 'h2';
};

export function SectionHeading({ eyebrow, title, description, align = 'left', action, className = '', as: Heading = 'h2' }: SectionHeadingProps) {
  return (
    <div className={`interior-section-heading${align === 'center' ? ' is-centered' : ''} ${className}`}>
      <div className="interior-section-heading-copy">
        {eyebrow && <span className="interior-eyebrow"><span />{eyebrow}</span>}
        <Heading>{title}</Heading>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="interior-section-heading-action">{action}</div>}
    </div>
  );
}
