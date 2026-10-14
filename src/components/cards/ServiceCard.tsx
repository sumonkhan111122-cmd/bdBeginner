import { Link } from 'react-router-dom';
import { ArrowRight, Check, Clock } from 'lucide-react';
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
      className="group flex flex-col justify-between rounded-2xl border border-ink-100 bg-white p-5 transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card sm:p-6"
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white transition-colors duration-200 group-hover:bg-brand-600">
            <Icon size={20} aria-hidden="true" />
          </div>
          {service.deliveryTime && (
            <span className="inline-flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-semibold text-ink-600">
              <Clock size={11} className="text-ink-400" />
              {service.deliveryTime}
            </span>
          )}
        </div>

        <h3 className="mt-4 font-display text-base font-bold text-ink-900 transition-colors group-hover:text-brand-600">
          {service.title}
        </h3>

        {service.tagline && (
          <p className="mt-1 text-xs font-medium text-brand-600">
            {service.tagline}
          </p>
        )}

        <p className="mt-2.5 text-sm leading-relaxed text-ink-500 line-clamp-3">
          {service.description}
        </p>

        <ul className="mt-4 space-y-2">
          {service.features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-xs font-medium text-ink-600">
              <Check size={14} className="shrink-0 text-success-600" strokeWidth={2.5} />
              <span className="truncate">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-ink-50 pt-3.5">
        <span className="text-xs font-medium text-ink-400">
          {service.category || 'Service'}
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-transform duration-200 group-hover:translate-x-0.5">
          View Details
          <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
}
