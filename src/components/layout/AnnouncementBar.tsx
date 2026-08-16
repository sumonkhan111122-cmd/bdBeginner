import { Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { safeHttpUrl } from '@/lib/urls';

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const { siteSettings } = useSiteSettings();
  const text = siteSettings.announcement_text?.trim();
  const linkText = siteSettings.announcement_link_text?.trim();
  const linkUrl = safeHttpUrl(siteSettings.announcement_link_url);

  useEffect(() => setVisible(true), [text, linkText, linkUrl]);

  if (!visible || !siteSettings.announcement_enabled || !text) return null;

  return (
    <div className="bg-ink-950 text-ink-50">
      <div className="container-page flex h-9 items-center gap-2 text-sm">
        <Sparkles size={14} className="shrink-0 text-brand-400" aria-hidden="true" />
        <p className="flex min-w-0 flex-1 items-center justify-center gap-2 truncate">
          <span className="truncate font-semibold text-white">{text}</span>
          {linkText && linkUrl && (
            <a href={linkUrl} className="shrink-0 text-brand-300 underline underline-offset-2 hover:text-brand-200">
              {linkText}
            </a>
          )}
        </p>
        <button
          onClick={() => setVisible(false)}
          className="flex shrink-0 items-center text-ink-400 transition-colors hover:text-white"
          aria-label="Dismiss announcement"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
