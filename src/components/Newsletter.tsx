import { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 4000);
    }
  };

  return (
    <section className="section-padding">
      <div className="container-page">
        <div className="overflow-hidden rounded-2xl bg-ink-950 px-6 py-10 sm:px-12 sm:py-12 lg:px-16">
          <div className="relative mx-auto max-w-2xl text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
              <Mail size={22} />
            </div>
            <h2 className="mt-4 text-display-sm text-white text-balance">
              Stay informed about new products and resources
            </h2>
            <p className="mt-3 text-base leading-relaxed text-ink-300 text-balance">
              Receive occasional updates about new digital products, WordPress tools,
              and learning resources. No spam, just useful stuff.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="h-12 flex-1 rounded-xl border border-white/15 bg-white/10 px-4 text-sm text-white placeholder:text-ink-400 focus:border-brand-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                aria-label="Email address"
              />
              <button
                type="submit"
                className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-all duration-200 ${
                  submitted
                    ? 'bg-success-500 text-white'
                    : 'bg-brand-600 text-white hover:bg-brand-500'
                }`}
              >
                {submitted ? (
                  <>
                    <Check size={18} />
                    Subscribed
                  </>
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
            <p className="mt-4 text-xs text-ink-400">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
