export type SiteSettings = {
  id: number;
  site_name: string;
  tagline: string;
  contact_email: string | null;
  support_email: string | null;
  phone: string | null;
  whatsapp: string | null;
  currency_code: string;
  currency_symbol: string;
  logo_url: string | null;
  favicon_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  x_url: string | null;
  announcement_enabled: boolean;
  announcement_text: string | null;
  announcement_link_text: string | null;
  announcement_link_url: string | null;
  support_button_enabled: boolean;
  maintenance_mode: boolean;
  updated_at: string | null;
};

export type SeoSettings = {
  id: number;
  default_title: string;
  title_template: string;
  default_meta_description: string;
  default_og_image_url: string | null;
  google_search_console_verification: string | null;
  google_analytics_id: string | null;
  google_tag_manager_id: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  updated_at: string | null;
};

export type PaymentMethod =
  | 'bkash'
  | 'bkash_personal'
  | 'nagad_personal'
  | 'rocket_personal';

export type ManualPaymentMethod = Exclude<PaymentMethod, 'bkash'>;

export type PaymentMethodSetting = {
  id: string;
  method: PaymentMethod;
  display_name: string;
  enabled: boolean;
  recipient_number: string | null;
  account_type: string | null;
  qr_image_url: string | null;
  instructions: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PaymentMethodSettingInput = Pick<
  PaymentMethodSetting,
  | 'display_name'
  | 'enabled'
  | 'recipient_number'
  | 'account_type'
  | 'qr_image_url'
  | 'instructions'
  | 'sort_order'
>;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 1,
  site_name: 'bdBeginner',
  tagline: 'Premium Digital Products & Web Solutions',
  contact_email: null,
  support_email: null,
  phone: null,
  whatsapp: null,
  currency_code: 'BDT',
  currency_symbol: '\u09F3',
  logo_url: null,
  favicon_url: null,
  facebook_url: null,
  instagram_url: null,
  youtube_url: null,
  linkedin_url: null,
  x_url: null,
  announcement_enabled: true,
  announcement_text: null,
  announcement_link_text: null,
  announcement_link_url: null,
  support_button_enabled: true,
  maintenance_mode: false,
  updated_at: null,
};

export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  id: 1,
  default_title: 'bdBeginner — Premium Digital Products & Web Solutions',
  title_template: '%s | bdBeginner',
  default_meta_description:
    'Explore digital products, WordPress resources, software, AI tools, courses and professional web solutions at bdBeginner.',
  default_og_image_url: null,
  google_search_console_verification: null,
  google_analytics_id: null,
  google_tag_manager_id: null,
  robots_index: true,
  robots_follow: true,
  updated_at: null,
};
