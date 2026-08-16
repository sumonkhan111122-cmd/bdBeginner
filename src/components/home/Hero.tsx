import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  FileText,
  Truck,
  LifeBuoy,
  Download,
  KeyRound,
  Repeat,
  ShoppingBag,
  Tag,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const heroTrust = [
  { icon: FileText, label: 'Clear Product Details' },
  { icon: Truck, label: 'Flexible Digital Delivery' },
  { icon: LifeBuoy, label: 'Responsive Support' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink-100 bg-white">
      <div className="container-page py-10 sm:py-14 lg:py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* Left: Content */}
          <div className="flex flex-col items-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
              Premium Digital Marketplace
            </span>

            <h1 className="mt-5 text-[2rem] leading-[1.1] tracking-[-0.025em] sm:text-display-lg lg:text-display-xl text-ink-900 text-balance">
              Everything Digital.
              <br />
              <span className="text-brand-600">One Trusted Place.</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-500 text-balance sm:text-lg">
              Premium digital products, WordPress tools, software, resources and
              professional web solutions — carefully selected and supported by
              bdBeginner.
            </p>

            {/* Search bar */}
            <div className="mt-7 w-full max-w-lg">
              <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-3 shadow-soft transition-colors focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-500/20 sm:px-4 sm:py-3.5 sm:gap-2.5">
                <Search size={18} className="shrink-0 text-ink-400 sm:size-5" />
                <input
                  type="text"
                  placeholder="Search products…"
                  className="min-w-0 flex-1 bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none"
                  aria-label="Search products"
                />
                <Button to="/products" size="sm" className="shrink-0">
                  <span className="hidden sm:inline">Search</span>
                  <Search size={16} className="sm:hidden" />
                </Button>
              </div>
            </div>

            <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button to="/products" size="lg">
                Explore Products
                <ArrowRight size={18} />
              </Button>
              <Button to="/services" variant="outline" size="lg">
                Explore Services
              </Button>
            </div>

            {/* Trust row */}
            <div className="mt-8 flex flex-col gap-3 border-t border-ink-100 pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7 sm:gap-y-2.5">
              {heroTrust.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <item.icon size={17} className="shrink-0 text-brand-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-ink-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Marketplace visual */}
          <div className="relative hidden lg:block">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  const miniCards = [
    { icon: ShoppingBag, label: 'WordPress Theme', price: '৳1,290', accent: 'text-brand-600 bg-brand-50' },
    { icon: Layers, label: 'UI Kit', price: '৳799', accent: 'text-accent-600 bg-accent-50' },
    { icon: KeyRound, label: 'Software License', price: '৳599', accent: 'text-ink-600 bg-ink-50' },
  ];

  const categoryChips = ['WordPress', 'AI Tools', 'Courses', 'Software'];

  return (
    <div className="relative">
      {/* Main marketplace card */}
      <div className="relative rounded-2xl border border-ink-100 bg-white shadow-card-hover">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-ink-50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          </div>
          <span className="text-xs font-medium text-ink-400">bdBeginner Marketplace</span>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5 px-5 pt-4">
          {categoryChips.map((chip) => (
            <span
              key={chip}
              className="rounded-full bg-ink-50 px-2.5 py-1 text-[11px] font-medium text-ink-500"
            >
              {chip}
            </span>
          ))}
        </div>

        {/* Mini product cards */}
        <div className="grid grid-cols-3 gap-3 p-5">
          {miniCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-ink-100 bg-white p-3 transition-shadow hover:shadow-soft"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.accent}`}>
                <card.icon size={18} />
              </div>
              <p className="mt-2.5 text-[11px] font-semibold text-ink-500">{card.label}</p>
              <p className="mt-1 font-display text-sm font-bold text-ink-900">{card.price}</p>
            </div>
          ))}
        </div>

        {/* Bottom row: delivery status */}
        <div className="flex items-center justify-between border-t border-ink-50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-50 text-success-600">
              <Download size={13} />
            </span>
            <span className="text-xs font-medium text-ink-600">Instant Download</span>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700"
          >
            Browse all
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Floating chip: delivery type */}
      <div className="absolute -right-3 -bottom-3 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-floating">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <Repeat size={16} />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink-900">Subscription</p>
            <p className="text-[11px] text-ink-400">Available</p>
          </div>
        </div>
      </div>

      {/* Floating chip: product tag */}
      <div className="absolute -left-3 top-8 rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-floating">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning-50 text-warning-600">
            <Tag size={16} />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink-900">Featured</p>
            <p className="text-[11px] text-ink-400">Product tag</p>
          </div>
        </div>
      </div>
    </div>
  );
}
