import { useEffect, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Globe2,
  Image as ImageIcon,
  Loader2,
  Save,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { PaymentSettingsPanel } from '@/components/admin/PaymentSettingsPanel';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { safeHttpUrl } from '@/lib/urls';
import { updateSiteSettings, type SiteSettingsInput } from '@/services/settings';
import type { SiteSettings } from '@/types/settings';

type Tab = 'general' | 'contact' | 'branding' | 'social' | 'store' | 'payments';

const tabs: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'contact', label: 'Contact' },
  { id: 'branding', label: 'Branding' },
  { id: 'social', label: 'Social' },
  { id: 'store', label: 'Store' },
  { id: 'payments', label: 'Payments' },
];

type FormState = Omit<SiteSettingsInput, 'contact_email' | 'support_email' | 'phone' | 'whatsapp' | 'logo_url' | 'favicon_url' | 'facebook_url' | 'instagram_url' | 'youtube_url' | 'linkedin_url' | 'x_url' | 'announcement_text' | 'announcement_link_text' | 'announcement_link_url'> & {
  contact_email: string;
  support_email: string;
  phone: string;
  whatsapp: string;
  logo_url: string;
  favicon_url: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  linkedin_url: string;
  x_url: string;
  announcement_text: string;
  announcement_link_text: string;
  announcement_link_url: string;
};

function toForm(settings: SiteSettings): FormState {
  return {
    site_name: settings.site_name,
    tagline: settings.tagline,
    contact_email: settings.contact_email ?? '',
    support_email: settings.support_email ?? '',
    phone: settings.phone ?? '',
    whatsapp: settings.whatsapp ?? '',
    currency_code: settings.currency_code,
    currency_symbol: settings.currency_symbol,
    logo_url: settings.logo_url ?? '',
    favicon_url: settings.favicon_url ?? '',
    facebook_url: settings.facebook_url ?? '',
    instagram_url: settings.instagram_url ?? '',
    youtube_url: settings.youtube_url ?? '',
    linkedin_url: settings.linkedin_url ?? '',
    x_url: settings.x_url ?? '',
    announcement_enabled: settings.announcement_enabled,
    announcement_text: settings.announcement_text ?? '',
    announcement_link_text: settings.announcement_link_text ?? '',
    announcement_link_url: settings.announcement_link_url ?? '',
    support_button_enabled: settings.support_button_enabled,
    maintenance_mode: settings.maintenance_mode,
  };
}

const inputClass =
  'h-11 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-ink-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-400">{hint}</span>}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-5 rounded-xl border border-ink-100 p-4">
      <span>
        <span className="block text-sm font-semibold text-ink-800">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">{description}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
      />
    </label>
  );
}

export function AdminSettingsPage() {
  const { siteSettings, loading, siteError, refreshSiteSettings } = useSiteSettings();
  const [tab, setTab] = useState<Tab>('general');
  const [form, setForm] = useState<FormState>(() => toForm(siteSettings));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !dirty) setForm(toForm(siteSettings));
  }, [loading, siteSettings, dirty]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setMessage(null);
  };

  const validateUrl = (label: string, value: string): string | null => {
    if (!value.trim() || safeHttpUrl(value)) return null;
    return `${label} must be a valid http(s) URL.`;
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    if (!form.site_name.trim()) {
      setError('Site Name is required.');
      return;
    }
    if (!form.currency_code.trim() || !form.currency_symbol.trim()) {
      setError('Currency Code and Currency Symbol are required.');
      return;
    }
    const urlFields: [string, string][] = [
      ['Logo URL', form.logo_url],
      ['Favicon URL', form.favicon_url],
      ['Facebook URL', form.facebook_url],
      ['Instagram URL', form.instagram_url],
      ['YouTube URL', form.youtube_url],
      ['LinkedIn URL', form.linkedin_url],
      ['X URL', form.x_url],
      ['Announcement Link URL', form.announcement_link_url],
    ];
    const invalid = urlFields.map(([label, value]) => validateUrl(label, value)).find(Boolean);
    if (invalid) {
      setError(invalid);
      return;
    }

    const nullable = (value: string) => value.trim() || null;
    setSaving(true);
    try {
      await updateSiteSettings({
        ...form,
        site_name: form.site_name.trim(),
        tagline: form.tagline.trim(),
        currency_code: form.currency_code.trim().toUpperCase(),
        currency_symbol: form.currency_symbol.trim(),
        contact_email: nullable(form.contact_email),
        support_email: nullable(form.support_email),
        phone: nullable(form.phone),
        whatsapp: nullable(form.whatsapp),
        logo_url: nullable(form.logo_url),
        favicon_url: nullable(form.favicon_url),
        facebook_url: nullable(form.facebook_url),
        instagram_url: nullable(form.instagram_url),
        youtube_url: nullable(form.youtube_url),
        linkedin_url: nullable(form.linkedin_url),
        x_url: nullable(form.x_url),
        announcement_text: nullable(form.announcement_text),
        announcement_link_text: nullable(form.announcement_link_text),
        announcement_link_url: nullable(form.announcement_link_url),
      });
      const refreshed = await refreshSiteSettings();
      setForm(toForm(refreshed));
      setDirty(false);
      setMessage('Settings saved successfully.');
    } catch (saveError) {
      console.error('Failed to save site settings', saveError);
      setError('Settings could not be saved. Please confirm your admin session and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={30} />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 lg:px-8 lg:py-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage the storefront identity, contacts, and store controls.</p>
      </div>

      {(error || siteError) && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700">
          <AlertCircle className="mt-0.5 shrink-0" size={16} />
          <span>{error ?? siteError}</span>
        </div>
      )}
      {message && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm font-medium text-success-700">
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft">
        <div className="flex overflow-x-auto border-b border-ink-100 px-3">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`shrink-0 border-b-2 px-4 py-4 text-xs font-bold uppercase tracking-wider ${
                tab === item.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-400 hover:text-ink-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-5 lg:p-7">
          {tab === 'general' && (
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Site Name">
                <input value={form.site_name} onChange={(e) => update('site_name', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Tagline">
                <input value={form.tagline} onChange={(e) => update('tagline', e.target.value)} className={inputClass} />
              </Field>
              <Field label="Currency Code" hint="ISO code, for example BDT">
                <input value={form.currency_code} onChange={(e) => update('currency_code', e.target.value)} className={inputClass} maxLength={3} />
              </Field>
              <Field label="Currency Symbol" hint={`Preview: ${form.currency_symbol || '৳'}1,290`}>
                <input value={form.currency_symbol} onChange={(e) => update('currency_symbol', e.target.value)} className={inputClass} maxLength={8} />
              </Field>
            </div>
          )}

          {tab === 'contact' && (
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Contact Email"><input type="email" value={form.contact_email} onChange={(e) => update('contact_email', e.target.value)} className={inputClass} /></Field>
              <Field label="Support Email"><input type="email" value={form.support_email} onChange={(e) => update('support_email', e.target.value)} className={inputClass} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} /></Field>
              <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className={inputClass} /></Field>
            </div>
          )}

          {tab === 'branding' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {([
                ['logo_url', 'Logo URL', 'Recommended: transparent horizontal logo'],
                ['favicon_url', 'Favicon URL', 'Use a square PNG, SVG, or ICO file'],
              ] as const).map(([key, label, hint]) => (
                <div key={key} className="rounded-xl border border-ink-100 p-4">
                  <Field label={label} hint={hint}>
                    <input type="url" value={form[key]} onChange={(e) => update(key, e.target.value)} className={inputClass} placeholder="https://..." />
                  </Field>
                  {safeHttpUrl(form[key]) && (
                    <div className="mt-4 flex h-24 items-center justify-center overflow-hidden rounded-xl bg-ink-50 p-3">
                      <ImageWithFallback
                        src={safeHttpUrl(form[key])}
                        alt={`${label} preview`}
                        className="max-h-full max-w-full object-contain"
                        fallback={<ImageIcon className="text-ink-300" size={28} />}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'social' && (
            <div className="grid gap-5 md:grid-cols-2">
              {([
                ['facebook_url', 'Facebook'],
                ['instagram_url', 'Instagram'],
                ['youtube_url', 'YouTube'],
                ['linkedin_url', 'LinkedIn'],
                ['x_url', 'X / Twitter'],
              ] as const).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input type="url" value={form[key]} onChange={(e) => update(key, e.target.value)} className={inputClass} placeholder="https://..." />
                </Field>
              ))}
            </div>
          )}

          {tab === 'store' && (
            <div className="flex flex-col gap-5">
              <Toggle checked={form.announcement_enabled} onChange={(value) => update('announcement_enabled', value)} label="Announcement Enabled" description="Show the announcement bar when text is present." />
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Announcement Text"><input value={form.announcement_text} onChange={(e) => update('announcement_text', e.target.value)} className={inputClass} /></Field>
                <Field label="Announcement Link Text"><input value={form.announcement_link_text} onChange={(e) => update('announcement_link_text', e.target.value)} className={inputClass} /></Field>
                <Field label="Announcement Link URL"><input type="url" value={form.announcement_link_url} onChange={(e) => update('announcement_link_url', e.target.value)} className={inputClass} placeholder="https://..." /></Field>
              </div>
              <Toggle checked={form.support_button_enabled} onChange={(value) => update('support_button_enabled', value)} label="Support Button Enabled" description="Show support actions in the storefront header." />
              <Toggle checked={form.maintenance_mode} onChange={(value) => update('maintenance_mode', value)} label="Maintenance Mode" description="Record the store maintenance state for operational control." />
            </div>
          )}

          {tab === 'payments' && <PaymentSettingsPanel />}
        </div>

        {tab !== 'payments' && <div className="flex flex-col gap-3 border-t border-ink-100 bg-ink-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-7">
          <p className="text-xs text-ink-500">Changes are only applied when you save.</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !dirty}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>}
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-ink-400">
        <Globe2 size={14} /> Storefront components read these settings from the same site settings row.
      </div>
    </div>
  );
}
