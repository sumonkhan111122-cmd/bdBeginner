import type { SeoSettings } from '@/types/settings';
import { safeHttpUrl } from '@/lib/urls';

type SeoInput = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string | null;
  index?: boolean;
  follow?: boolean;
  type?: 'website' | 'product';
  price?: number | null;
  currency?: string | null;
  availability?: 'in stock' | 'out of stock';
  retailerItemId?: string | null;
  brand?: string | null;
};

function setMeta(attribute: 'name' | 'property', key: string, content?: string | null) {
  const selector = `meta[${attribute}="${key}"]`;
  const matches = Array.from(document.head.querySelectorAll<HTMLMetaElement>(selector));
  if (!content) {
    matches.forEach((element) => element.remove());
    return;
  }
  const element = matches.shift() ?? document.createElement('meta');
  element.setAttribute(attribute, key);
  element.content = content;
  if (!element.parentNode) document.head.appendChild(element);
  matches.forEach((duplicate) => duplicate.remove());
}

function setCanonical(pathname: string) {
  const matches = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'),
  );
  const link = matches.shift() ?? document.createElement('link');
  link.rel = 'canonical';
  link.href = new URL(pathname, window.location.origin).href;
  if (!link.parentNode) document.head.appendChild(link);
  matches.forEach((duplicate) => duplicate.remove());
}

export function formatSeoTitle(title: string, settings: SeoSettings): string {
  const cleanTitle = title.trim();
  if (!cleanTitle || cleanTitle === settings.default_title.trim()) {
    return settings.default_title;
  }
  const template = settings.title_template.trim();
  return template.includes('%s') ? template.replace('%s', cleanTitle) : cleanTitle;
}

export function applySeo(input: SeoInput, settings: SeoSettings): void {
  const title = input.title.trim() || settings.default_title;
  const description = input.description.trim() || settings.default_meta_description;
  const image = safeHttpUrl(input.image);
  const robots = `${(input.index ?? settings.robots_index) ? 'index' : 'noindex'},${
    (input.follow ?? settings.robots_follow) ? 'follow' : 'nofollow'
  }`;
  const ogType = input.type || 'website';

  document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'robots', robots);
  setMeta('property', 'og:type', ogType);
  setMeta('property', 'og:site_name', 'bdBeginner');
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:image', image);
  setMeta('property', 'og:url', new URL(input.canonicalPath ?? '/', window.location.origin).href);
  setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', image);
  setCanonical(input.canonicalPath ?? '/');

  if (ogType === 'product') {
    if (input.price != null) {
      setMeta('property', 'product:price:amount', String(input.price));
      setMeta('property', 'product:price:currency', input.currency || 'BDT');
    }
    setMeta('property', 'product:availability', input.availability || 'in stock');
    setMeta('property', 'product:condition', 'new');
    if (input.brand) setMeta('property', 'product:brand', input.brand);
    if (input.retailerItemId) setMeta('property', 'product:retailer_item_id', input.retailerItemId);
  } else {
    setMeta('property', 'product:price:amount', null);
    setMeta('property', 'product:price:currency', null);
    setMeta('property', 'product:availability', null);
    setMeta('property', 'product:condition', null);
    setMeta('property', 'product:brand', null);
    setMeta('property', 'product:retailer_item_id', null);
  }
}

function readMetaAttribute(markup: string, attribute: string): string | null {
  const quoted = markup.match(
    new RegExp(`${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'i'),
  );
  if (quoted) return quoted[2].trim();
  const unquoted = markup.match(new RegExp(`${attribute}\\s*=\\s*([^\\s>]+)`, 'i'));
  return unquoted?.[1]?.trim() ?? null;
}

export function normalizeGoogleVerification(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^<meta\b/i.test(trimmed)) {
    const name = readMetaAttribute(trimmed, 'name');
    if (name?.toLowerCase() !== 'google-site-verification') return null;
    return readMetaAttribute(trimmed, 'content') || null;
  }
  return trimmed.replace(/^['"]|['"]$/g, '') || null;
}

export function applyGoogleVerification(value: string | null | undefined): void {
  const token = normalizeGoogleVerification(value);
  setMeta('name', 'google-site-verification', token);
}

export function normalizeFacebookVerification(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^<meta\b/i.test(trimmed)) {
    const name = readMetaAttribute(trimmed, 'name');
    if (name?.toLowerCase() !== 'facebook-domain-verification') return null;
    return readMetaAttribute(trimmed, 'content') || null;
  }
  return trimmed.replace(/^['"]|['"]$/g, '') || null;
}

export function applyFacebookVerification(value: string | null | undefined): void {
  const token = normalizeFacebookVerification(value);
  setMeta('name', 'facebook-domain-verification', token);
}

function removeById(id: string) {
  document.getElementById(id)?.remove();
}

export function configureGa4(value: string | null | undefined): void {
  const id = value?.trim().toUpperCase() ?? '';
  const scriptId = 'bdb-ga4-script';
  const configId = 'bdb-ga4-config';
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!/^G-[A-Z0-9]+$/.test(id)) {
    removeById(scriptId);
    removeById(configId);
    return;
  }
  if (existing?.dataset.measurementId === id) return;
  removeById(scriptId);
  removeById(configId);

  const external = document.createElement('script');
  external.id = scriptId;
  external.async = true;
  external.dataset.measurementId = id;
  external.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(external);

  const config = document.createElement('script');
  config.id = configId;
  config.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`;
  document.head.appendChild(config);
}

export function configureGtm(value: string | null | undefined): void {
  const id = value?.trim().toUpperCase() ?? '';
  const scriptId = 'bdb-gtm-script';
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!/^GTM-[A-Z0-9]+$/.test(id)) {
    removeById(scriptId);
    return;
  }
  if (existing?.dataset.containerId === id) return;
  removeById(scriptId);
  const script = document.createElement('script');
  script.id = scriptId;
  script.dataset.containerId = id;
  script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
  document.head.appendChild(script);
}

export function configureFacebookPixel(value: string | null | undefined): void {
  const rawId = value?.trim() || (import.meta.env.VITE_FACEBOOK_PIXEL_ID as string | undefined)?.trim() || '1299950688895692';
  const scriptId = 'bdb-fb-pixel-script';
  const noscriptId = 'bdb-fb-pixel-noscript';

  // If already loaded or initialized from static index.html, don't duplicate
  if (typeof window !== 'undefined' && (window as any).fbq) {
    return;
  }

  if (!rawId || !/^\d{6,25}$/.test(rawId)) {
    removeById(scriptId);
    removeById(noscriptId);
    return;
  }

  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (existing?.dataset.pixelId === rawId) return;

  removeById(scriptId);
  removeById(noscriptId);

  const script = document.createElement('script');
  script.id = scriptId;
  script.dataset.pixelId = rawId;
  script.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${rawId}');fbq('track','PageView');`;
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  noscript.id = noscriptId;
  const pixelImg = document.createElement('img');
  pixelImg.height = 1;
  pixelImg.width = 1;
  pixelImg.style.display = 'none';
  pixelImg.alt = '';
  pixelImg.src = `https://www.facebook.com/tr?id=${encodeURIComponent(rawId)}&ev=PageView&noscript=1`;
  noscript.appendChild(pixelImg);
  document.body.appendChild(noscript);
}

export function applyFavicon(value: string | null | undefined): void {
  const href = safeHttpUrl(value) ?? '/favicon.svg';
  const matches = Array.from(
    document.head.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]'),
  );
  const link = matches.shift() ?? document.createElement('link');
  link.rel = 'icon';
  link.href = href;
  if (!link.parentNode) document.head.appendChild(link);
  matches.forEach((duplicate) => duplicate.remove());
}

export function applyStructuredData(id: string, data: Record<string, unknown> | null): void {
  const scriptId = `jsonld-${id}`;
  const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

  if (!data) {
    if (existing) existing.remove();
    return;
  }

  const script = existing ?? document.createElement('script');
  script.id = scriptId;
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);

  if (!existing) {
    document.head.appendChild(script);
  }
}
