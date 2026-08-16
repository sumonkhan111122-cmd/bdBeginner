import type { ProductBadge } from '@/types';

const badgeConfig: Record<ProductBadge, { label: string; className: string }> = {
  featured: {
    label: 'Featured',
    className: 'bg-brand-50 text-brand-700 border border-brand-200',
  },
  new: {
    label: 'New',
    className: 'bg-success-50 text-success-700 border border-success-200',
  },
};

type BadgeProps = {
  variant?: ProductBadge;
  children?: React.ReactNode;
  className?: string;
};

export function Badge({ variant, children, className = '' }: BadgeProps) {
  if (variant && badgeConfig[variant]) {
    const config = badgeConfig[variant];
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${config.className} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-ink-50 px-2.5 py-1 text-xs font-semibold text-ink-600 border border-ink-100 ${className}`}
    >
      {children}
    </span>
  );
}
