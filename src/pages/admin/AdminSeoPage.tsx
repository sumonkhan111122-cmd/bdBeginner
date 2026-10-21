import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, Check, CheckCircle2, Copy, ExternalLink, Loader2, Save, Search, Share2 } from 'lucide-react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { normalizeFacebookVerification, normalizeGoogleVerification } from '@/lib/seo';
import { safeHttpUrl } from '@/lib/urls';
import { updateSeoSettings, type SeoSettingsInput } from '@/services/settings';
import type { SeoSettings } from '@/types/settings';

type FormState = Omit<
  SeoSettingsInput,
  | 'default_og_image_url'
  | 'google_search_console_verification'
  | 'google_analytics_id'
  | 'google_tag_manager_id'
  | 'facebook_pixel_id'
  | 'facebook_domain_verification'
> & {
  default_og_image_url: string;
  google_search_console_verification: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;
  facebook_domain_verification: string;
};

function toForm(settings: SeoSettings): FormState {
  return {
    default_title: settings.default_title,
    title_template: settings.title_template,
    default_meta_description: settings.default_meta_description,
    default_og_image_url: settings.default_og_image_url ?? '',
    google_search_console_verification: settings.google_search_console_verification ?? '',
    google_analytics_id: settings.google_analytics_id ?? '',
    google_tag_manager_id: settings.google_tag_manager_id ?? '',
    facebook_pixel_id: settings.facebook_pixel_id ?? '',
    facebook_domain_verification: settings.facebook_domain_verification ?? '',
    robots_index: settings.robots_index,
    robots_follow: settings.robots_follow,
  };
}

const inputClass =
  'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';
const textareaClass =
  'w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft lg:p-6">
      <h2 className="font-display text-base font-bold uppercase tracking-wide text-ink-900">{title}</h2>
      <p className="mt-1 text-xs leading-relaxed text-ink-500">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

export function AdminSeoPage() {
  const { seoSettings, loading, seoError, refreshSeoSettings } = useSiteSettings();
  const [form, setForm] = useState<FormState>(() => toForm(seoSettings));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedFeed, setCopiedFeed] = useState(false);
  const [copiedSitemap, setCopiedSitemap] = useState(false);

  const catalogFeedUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/catalog/facebook-feed.php`
      : 'https://bdbeginner.com/api/catalog/facebook-feed.php';

  const sitemapUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/sitemap.xml`
      : 'https://bdbeginner.com/sitemap.xml';

  const handleCopyFeed = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(catalogFeedUrl);
      setCopiedFeed(true);
      setTimeout(() => setCopiedFeed(false), 2500);
    }
  };

  const handleCopySitemap = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(sitemapUrl);
      setCopiedSitemap(true);
      setTimeout(() => setCopiedSitemap(false), 2500);
    }
  };

  useEffect(() => {
    if (!loading && !dirty) setForm(toForm(seoSettings));
  }, [loading, seoSettings, dirty]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage(null);
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    if (!form.default_title.trim() || !form.default_meta_description.trim()) {
      setError('Default Site Title and Default Meta Description are required.');
      return;
    }
    if (form.title_template.trim() && !form.title_template.includes('%s')) {
      setError('Title Template must include %s where the page title should appear.');
      return;
    }
    if (form.default_og_image_url.trim() && !safeHttpUrl(form.default_og_image_url)) {
      setError('Default OG Image URL must be a valid http(s) URL.');
      return;
    }
    if (
      form.google_search_console_verification.trim() &&
      !normalizeGoogleVerification(form.google_search_console_verification)
    ) {
      setError('Enter a raw Google verification token or a valid google-site-verification meta tag.');
      return;
    }
    if (form.google_analytics_id.trim() && !/^G-[A-Z0-9]+$/i.test(form.google_analytics_id.trim())) {
      setError('Google Analytics Measurement ID must look like G-XXXXXXXXXX.');
      return;
    }
    if (form.google_tag_manager_id.trim() && !/^GTM-[A-Z0-9]+$/i.test(form.google_tag_manager_id.trim())) {
      setError('Google Tag Manager Container ID must look like GTM-XXXXXXX.');
      return;
    }

    if (
      form.facebook_domain_verification.trim() &&
      !normalizeFacebookVerification(form.facebook_domain_verification)
    ) {
      setError('Enter a raw Facebook verification token or a valid facebook-domain-verification meta tag.');
      return;
    }
    if (form.facebook_pixel_id.trim() && !/^\d{6,25}$/.test(form.facebook_pixel_id.trim())) {
      setError('Facebook Pixel ID must be numeric (typically 15-16 digits, e.g. 1234567890123456).');
      return;
    }

    const nullable = (value: string) => value.trim() || null;
    setSaving(true);
    try {
      await updateSeoSettings({
        default_title: form.default_title.trim(),
        title_template: form.title_template.trim(),
        default_meta_description: form.default_meta_description.trim(),
        default_og_image_url: nullable(form.default_og_image_url),
        google_search_console_verification: nullable(form.google_search_console_verification),
        google_analytics_id: nullable(form.google_analytics_id.toUpperCase()),
        google_tag_manager_id: nullable(form.google_tag_manager_id.toUpperCase()),
        facebook_pixel_id: nullable(form.facebook_pixel_id.trim()),
        facebook_domain_verification: nullable(
          normalizeFacebookVerification(form.facebook_domain_verification) || form.facebook_domain_verification.trim(),
        ),
        robots_index: form.robots_index,
        robots_follow: form.robots_follow,
      });
      const refreshed = await refreshSeoSettings();
      setForm(toForm(refreshed));
      setDirty(false);
      setMessage('SEO settings saved successfully.');
    } catch (saveError) {
      console.error('Failed to save SEO settings', saveError);
      setError('SEO settings could not be saved. Please confirm your admin session and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-80 items-center justify-center"><Loader2 className="animate-spin text-brand-600" size={30} /></div>;
  }

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">SEO</h1>
        <p className="mt-1 text-sm text-ink-500">Control search appearance, verification, analytics, and robots defaults.</p>
      </div>

      {(error || seoError) && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700"><AlertCircle className="mt-0.5 shrink-0" size={16} />{error ?? seoError}</div>
      )}
      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700"><CheckCircle2 size={16} />{message}</div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Section title="Search Appearance" description="Defaults used by the homepage and pages without their own metadata.">
            <div className="flex flex-col gap-4">
              <Field label="Default Site Title"><input value={form.default_title} onChange={(e) => update('default_title', e.target.value)} className={inputClass} /></Field>
              <Field label="Title Template" hint="Use %s as the page-title placeholder."><input value={form.title_template} onChange={(e) => update('title_template', e.target.value)} className={inputClass} placeholder="%s | bdBeginner" /></Field>
              <Field label="Default Meta Description"><textarea value={form.default_meta_description} onChange={(e) => update('default_meta_description', e.target.value)} className={textareaClass} rows={4} /></Field>
              <Field label="Default OG Image URL"><input type="url" value={form.default_og_image_url} onChange={(e) => update('default_og_image_url', e.target.value)} className={inputClass} placeholder="https://..." /></Field>
            </div>
          </Section>

          <Section title="Meta (Facebook) Pixel & Verification" description="Track conversions from Facebook Ads and verify domain ownership in Meta Business Suite.">
            <div className="flex flex-col gap-4">
              <Field
                label="Meta (Facebook) Pixel / Dataset ID"
                hint="Numeric ID from Meta Events Manager (e.g. 1234567890123456). Automatically tracks PageView, ViewContent, AddToCart, InitiateCheckout, and Purchase events."
              >
                <input
                  value={form.facebook_pixel_id}
                  onChange={(e) => update('facebook_pixel_id', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. 1234567890123456"
                />
              </Field>

              <Field
                label="Facebook Domain Verification"
                hint="Token or meta tag copied from Meta Business Settings > Domains (e.g. <meta name='facebook-domain-verification' content='...' /> or raw token)."
              >
                <textarea
                  value={form.facebook_domain_verification}
                  onChange={(e) => update('facebook_domain_verification', e.target.value)}
                  className={textareaClass}
                  rows={2}
                  placeholder="token or <meta name='facebook-domain-verification' content=…>"
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Facebook Product Catalog Feed (For Ads & Carousels)"
            description="Use this feed URL in Meta Commerce Manager so all products automatically show up with pictures, prices (BDT), and titles in Facebook Ads."
          >
            <div className="flex flex-col gap-3">
              <p className="text-xs leading-relaxed text-ink-600">
                ফেসবুকে স্পন্সরড অ্যাড বা ডায়নামিক ক্যারোসেল অ্যাড চালানোর জন্য Meta Commerce Manager-এ (Catalog &gt; Data Sources &gt; Data Feed) নিচের লিংকটি দিন:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={catalogFeedUrl}
                  className="h-10 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 text-xs font-mono text-ink-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyFeed}
                  className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                >
                  {copiedFeed ? <Check size={14} className="text-success-600" /> : <Copy size={14} />}
                  {copiedFeed ? 'Copied!' : 'Copy Feed'}
                </button>
                <a
                  href={catalogFeedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-50"
                  title="View Live XML Feed"
                >
                  <ExternalLink size={14} />
                </a>
              </div>
              <div className="mt-1 rounded-xl bg-ink-50/70 p-3 text-xs text-ink-500">
                <span className="font-semibold text-ink-700">Supported formats:</span> Standard RSS 2.0 / Google &amp; Facebook Merchant XML. Automatic real-time sync with bdBeginner catalog.
              </div>
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-5">
          <Section
            title="Google Search Console & Sitemap"
            description="Submit your sitemap directly to Google Search Console to index all 680+ products and pages."
          >
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-ink-700">XML Sitemap URL (Real-time &amp; Static with Images)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={sitemapUrl}
                    className="h-10 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-3 text-xs font-mono text-ink-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopySitemap}
                    className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-brand-50 px-3.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    {copiedSitemap ? <Check size={14} className="text-success-600" /> : <Copy size={14} />}
                    {copiedSitemap ? 'Copied!' : 'Copy'}
                  </button>
                  <a
                    href={sitemapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 shrink-0 items-center gap-1 rounded-xl border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-50"
                    title="Open Sitemap"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-50/70 p-3 text-xs text-emerald-800">
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  All 680+ Products, Categories &amp; Core Pages Included
                </div>
                <p className="mt-1 text-emerald-700 leading-relaxed">
                  Contains Google Image extensions (<code className="font-mono text-[11px]">&lt;image:image&gt;</code>) so product thumbnails are indexed in Google Image Search.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-ink-500 pt-1 border-t border-ink-100">
                <span>Submit in Search Console:</span>
                <a
                  href="https://search.google.com/search-console/sitemaps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-brand-600 font-medium hover:underline"
                >
                  Open Sitemaps Tool <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </Section>

          <Section title="Google Verification" description="Accepts either the raw token or the complete copied meta tag.">
            <Field label="Google Search Console Verification">
              <textarea value={form.google_search_console_verification} onChange={(e) => update('google_search_console_verification', e.target.value)} className={textareaClass} rows={3} placeholder="token or <meta name=…>" />
            </Field>
          </Section>

          <Section title="Analytics" description="Scripts load only when a valid ID is configured and are deduplicated during navigation.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Google Analytics Measurement ID"><input value={form.google_analytics_id} onChange={(e) => update('google_analytics_id', e.target.value)} className={inputClass} placeholder="G-XXXXXXXXXX" /></Field>
              <Field label="Google Tag Manager Container ID"><input value={form.google_tag_manager_id} onChange={(e) => update('google_tag_manager_id', e.target.value)} className={inputClass} placeholder="GTM-XXXXXXX" /></Field>
            </div>
          </Section>

          <Section title="Search Engine Controls" description="Applied through one robots meta tag across the storefront.">
            <div className="flex flex-col gap-3">
              {([
                ['robots_index', 'Allow Search Engine Indexing'],
                ['robots_follow', 'Allow Link Following'],
              ] as const).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between rounded-xl border border-ink-100 p-4 text-sm font-semibold text-ink-700">
                  {label}
                  <input type="checkbox" checked={form[key]} onChange={(e) => update(key, e.target.checked)} className="h-5 w-5 rounded border-ink-300 text-brand-600 focus:ring-brand-500" />
                </label>
              ))}
            </div>
          </Section>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2 text-xs text-ink-500"><Search size={14} /> Product pages prefer their own SEO title and description.</span>
        <button type="button" onClick={handleSave} disabled={saving || !dirty} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}{saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
