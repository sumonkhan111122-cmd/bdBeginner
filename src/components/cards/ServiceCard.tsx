import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Service } from '@/types';

type ServiceCardProps = {
  service: Service;
};

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = (Icons[service.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;

  return (
    <Link
      to={`/services/${service.slug}`}
      className="group flex flex-col rounded-xl border border-ink-100 bg-white p-5 transition-all duration-200 ease-smooth hover:border-ink-200 hover:shadow-card sm:p-6"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ink-900 text-white transition-colors duration-200 group-hover:bg-brand-600">
          <Icon size={20} aria-hidden="true" />
        </div>
        <h3 className="font-display text-base font-bold text-ink-900">
          {service.title}
        </h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        {service.description}
      </p>

      <ul className="mt-4 space-y-2">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-ink-600">
            <Check size={15} className="shrink-0 text-success-600" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition-colors group-hover:text-brand-600">
        Learn More
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
