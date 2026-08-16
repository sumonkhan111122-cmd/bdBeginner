import { getSupabase } from '@/lib/supabase';
import {
  DEFAULT_SEO_SETTINGS,
  DEFAULT_SITE_SETTINGS,
  type SeoSettings,
  type SiteSettings,
} from '@/types/settings';

export type SiteSettingsInput = Omit<SiteSettings, 'id' | 'updated_at'>;
export type SeoSettingsInput = Omit<SeoSettings, 'id' | 'updated_at'>;

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await getSupabase()
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return { ...DEFAULT_SITE_SETTINGS, ...(data as Partial<SiteSettings> | null) };
}

export async function updateSiteSettings(
  input: SiteSettingsInput,
): Promise<SiteSettings> {
  const { data, error } = await getSupabase()
    .from('site_settings')
    .update(input)
    .eq('id', 1)
    .select()
    .single();
  if (error) throw error;
  return { ...DEFAULT_SITE_SETTINGS, ...(data as SiteSettings) };
}

export async function fetchSeoSettings(): Promise<SeoSettings> {
  const { data, error } = await getSupabase()
    .from('seo_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw error;
  return { ...DEFAULT_SEO_SETTINGS, ...(data as Partial<SeoSettings> | null) };
}

export async function updateSeoSettings(
  input: SeoSettingsInput,
): Promise<SeoSettings> {
  const { data, error } = await getSupabase()
    .from('seo_settings')
    .update(input)
    .eq('id', 1)
    .select()
    .single();
  if (error) throw error;
  return { ...DEFAULT_SEO_SETTINGS, ...(data as SeoSettings) };
}
