import type { ReactNode } from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  className = '',
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${alignClass} ${className}`}
    >
      <div className={align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && (
          <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-brand-600">
            {eyebrow}
          </span>
        )}
        <h2 className="text-display-sm sm:text-display-md text-ink-900 text-balance">
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg text-balance">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="shrink-0 sm:pb-1">{action}</div>
      )}
    </div>
  );
}
