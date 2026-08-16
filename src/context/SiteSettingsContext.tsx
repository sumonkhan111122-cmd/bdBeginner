import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { fetchSeoSettings, fetchSiteSettings } from '@/services/settings';
import {
  DEFAULT_SEO_SETTINGS,
  DEFAULT_SITE_SETTINGS,
  type SeoSettings,
  type SiteSettings,
} from '@/types/settings';

type SiteSettingsContextValue = {
  siteSettings: SiteSettings;
  seoSettings: SeoSettings;
  loading: boolean;
  siteError: string | null;
  seoError: string | null;
  refreshSiteSettings: () => Promise<SiteSettings>;
  refreshSeoSettings: () => Promise<SeoSettings>;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SITE_SETTINGS);
  const [seoSettings, setSeoSettings] = useState(DEFAULT_SEO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [siteError, setSiteError] = useState<string | null>(null);
  const [seoError, setSeoError] = useState<string | null>(null);

  const refreshSiteSettings = useCallback(async () => {
    try {
      const settings = await fetchSiteSettings();
      setSiteSettings(settings);
      setSiteError(null);
      return settings;
    } catch (error) {
      console.error('Failed to load site settings', error);
      setSiteError('Unable to load site settings.');
      throw error;
    }
  }, []);

  const refreshSeoSettings = useCallback(async () => {
    try {
      const settings = await fetchSeoSettings();
      setSeoSettings(settings);
      setSeoError(null);
      return settings;
    } catch (error) {
      console.error('Failed to load SEO settings', error);
      setSeoError('Unable to load SEO settings.');
      throw error;
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([fetchSiteSettings(), fetchSeoSettings()])
      .then(([siteResult, seoResult]) => {
        if (!active) return;
        if (siteResult.status === 'fulfilled') {
          setSiteSettings(siteResult.value);
          setSiteError(null);
        } else {
          console.error('Failed to load site settings', siteResult.reason);
          setSiteError('Unable to load site settings.');
        }
        if (seoResult.status === 'fulfilled') {
          setSeoSettings(seoResult.value);
          setSeoError(null);
        } else {
          console.error('Failed to load SEO settings', seoResult.reason);
          setSeoError('Unable to load SEO settings.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      siteSettings,
      seoSettings,
      loading,
      siteError,
      seoError,
      refreshSiteSettings,
      refreshSeoSettings,
    }),
    [
      siteSettings,
      seoSettings,
      loading,
      siteError,
      seoError,
      refreshSiteSettings,
      refreshSeoSettings,
    ],
  );

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return context;
}
