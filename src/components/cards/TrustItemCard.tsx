import * as Icons from 'lucide-react';
import type { TrustItem } from '@/types';

type TrustItemCardProps = {
  item: TrustItem;
};

export function TrustItemCard({ item }: TrustItemCardProps) {
  const Icon = (Icons[item.icon as keyof typeof Icons] ?? Icons.CheckCircle) as Icons.LucideIcon;

  return (
    <div className="flex flex-col items-start rounded-xl border border-ink-100 bg-white p-5 transition-all duration-200 hover:border-ink-200 hover:shadow-soft sm:p-6">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink-50 text-ink-700">
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-ink-900">
        {item.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">
        {item.description}
      </p>
    </div>
  );
}
