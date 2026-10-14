import { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
  HelpCircle,
  Share2,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { services } from '@/data/homepage';
import { ServiceCard } from '@/components/cards/ServiceCard';

export function ServiceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const service = useMemo(() => {
    return services.find((s) => s.slug === slug);
  }, [slug]);

  const relatedServices = useMemo(() => {
    if (!service) return [];
    return services.filter((s) => s.id !== service.id).slice(0, 3);
  }, [service]);

  if (!service) {
    return (
      <Layout>
        <div className="container-page py-20 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
            <HelpCircle size={32} />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-ink-900">Service Not Found</h1>
          <p className="mt-2 text-ink-500">The service you are looking for does not exist or has been moved.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button to="/services" size="md">
              <ArrowLeft size={16} /> Back to Services
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const IconComponent = (Icons[service.icon as keyof typeof Icons] ?? Icons.Wrench) as Icons.LucideIcon;

  const whatsappMessage = encodeURIComponent(
    `Hello bdBeginner, I am interested in your service: "${service.title}". Please provide more details on pricing and timeline.`
  );

  return (
    <Layout>
      {/* Top breadcrumb & back button */}
      <div className="border-b border-ink-100 bg-ink-50/30">
        <div className="container-page py-4">
          <div className="flex items-center gap-2 text-xs text-ink-500 sm:text-sm">
            <Link to="/" className="hover:text-brand-600">Home</Link>
            <span>/</span>
            <Link to="/services" className="hover:text-brand-600">Services</Link>
            <span>/</span>
            <span className="font-medium text-ink-800 truncate">{service.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-ink-100 bg-white py-12 lg:py-16">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            
            <div className="lg:col-span-7">
              <div className="flex flex-wrap items-center gap-2.5">
                {service.category && (
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
                    {service.category}
                  </span>
                )}
                {service.deliveryTime && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-3 py-1 text-xs font-semibold text-success-700">
                    <Clock size={13} /> {service.deliveryTime}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-3 py-1 text-xs font-medium text-ink-600">
                  <ShieldCheck size={13} /> Verified Delivery
                </span>
              </div>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
                  <IconComponent size={28} />
                </div>
                <div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl lg:text-4xl">
                    {service.title}
                  </h1>
                  {service.tagline && (
                    <p className="mt-1 text-sm font-medium text-brand-600 sm:text-base">
                      {service.tagline}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-6 text-base leading-relaxed text-ink-600 sm:text-lg">
                {service.description}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={`https://wa.me/8801990141151?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-success-600 px-6 font-semibold text-white shadow-soft transition-all hover:bg-success-700"
                >
                  <MessageCircle size={18} /> Inquire via WhatsApp
                </a>
                <Link
                  to={`/contact?service=${encodeURIComponent(service.slug)}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-6 font-semibold text-ink-800 transition-colors hover:bg-ink-50 hover:text-ink-950"
                >
                  <Mail size={18} /> Send Message / Inquiry
                </Link>
              </div>
            </div>

            {/* Quick Benefits Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-ink-100 bg-ink-50/60 p-6 shadow-soft sm:p-8">
                <h2 className="font-display text-base font-bold text-ink-900">
                  Service Highlights
                </h2>
                <ul className="mt-5 space-y-3.5">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-ink-700">
                      <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success-600" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {service.deliverables && service.deliverables.length > 0 && (
                  <div className="mt-6 border-t border-ink-200/80 pt-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500">
                      What You Will Receive
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {service.deliverables.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-white px-2.5 py-1 text-xs font-semibold text-ink-800"
                        >
                          <Zap size={12} className="text-brand-600" /> {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="section-padding bg-ink-50/30">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Simple 3-Step Workflow
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              How We Deliver This Service
            </h2>
            <p className="mt-3 text-sm text-ink-500">
              We ensure clear communication, transparent milestones, and complete customer satisfaction.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 font-display text-base font-bold text-brand-700">
                01
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                1. Initial Consultation
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Reach out with your website requirements, desired customizations, or specific issues. We confirm the scope and exact timeline.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 font-display text-base font-bold text-brand-700">
                02
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                2. Execution & Testing
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                Our team sets up, builds, or repairs your website with precision, following web design, performance, and security best practices.
              </p>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 font-display text-base font-bold text-brand-700">
                03
              </div>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">
                3. Review & Handover
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">
                You review the completed work. We make any necessary refinements and provide documentation or guidance with ongoing support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="container-page py-12">
        <div className="overflow-hidden rounded-3xl bg-brand-600 p-8 text-white shadow-soft sm:p-12">
          <div className="grid gap-6 md:grid-cols-12 md:items-center">
            <div className="md:col-span-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                <Sparkles size={13} /> Custom Project Support
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                Ready to get started with {service.title}?
              </h2>
              <p className="mt-2 text-sm text-brand-100 sm:text-base">
                Have specific requirements or need a tailored package? Talk directly to our technical team today.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:col-span-4 md:justify-end">
              <a
                href={`https://wa.me/8801990141151?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 font-semibold text-brand-900 transition-colors hover:bg-brand-50"
              >
                <MessageCircle size={16} /> WhatsApp Us
              </a>
              <Link
                to="/contact"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 font-semibold text-white transition-colors hover:bg-white/20"
              >
                Contact Page
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="border-t border-ink-100 bg-white py-14">
          <div className="container-page">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-ink-900 sm:text-2xl">
                  Other Services You May Need
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  Combine services for a complete end-to-end web solution.
                </p>
              </div>
              <Link to="/services" className="hidden text-sm font-semibold text-brand-600 hover:underline sm:inline-flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {relatedServices.map((rel) => (
                <ServiceCard key={rel.id} service={rel} />
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
