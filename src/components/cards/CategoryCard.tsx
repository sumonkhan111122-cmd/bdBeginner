import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Category } from '@/types';

const accentMap: Record<string, { iconBg: string; iconText: string; hoverBar: string }> = {
  brand: { iconBg: 'bg-brand-50', iconText: 'text-brand-600', hoverBar: 'group-hover:bg-brand-500' },
  ink: { iconBg: 'bg-ink-100', iconText: 'text-ink-700', hoverBar: 'group-hover:bg-ink-500' },
  accent: { iconBg: 'bg-accent-50', iconText: 'text-accent-600', hoverBar: 'group-hover:bg-accent-500' },
  success: { iconBg: 'bg-success-50', iconText: 'text-success-600', hoverBar: 'group-hover:bg-success-500' },
  warning: { iconBg: 'bg-warning-50', iconText: 'text-warning-600', hoverBar: 'group-hover:bg-warning-500' },
};

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = (Icons[category.icon as keyof typeof Icons] ?? Icons.Folder) as Icons.LucideIcon;
  const colors = accentMap[category.color] ?? accentMap.brand;

  return (
    <Link
      to={`/categories#${category.slug}`}
      className="group relative flex flex-col items-start overflow-hidden rounded-xl border border-ink-100 bg-white p-5 transition-all duration-200 ease-smooth hover:border-ink-200 hover:shadow-card sm:p-6"
    >
      {/* Accent bar at bottom */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 w-0 bg-ink-200 transition-all duration-200 ease-smooth ${colors.hoverBar} group-hover:w-full`}
        aria-hidden="true"
      />

      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${colors.iconBg} ${colors.iconText} transition-transform duration-200 group-hover:scale-105`}
      >
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-ink-900">
        {category.name}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">
        {category.tagline}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors group-hover:text-brand-600">
        Browse
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
