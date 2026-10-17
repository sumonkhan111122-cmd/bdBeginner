import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const PROVIDER = "weadown";
const SOURCE_ORIGIN = "https://weadown.com";
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;
const DEFAULT_PRICE = 99;
const IMPORT_CATEGORY_SLUG = "gpl-research-imports";
const REQUEST_TIMEOUT_MS = 15_000;

type ImportStatus = "new" | "up_to_date" | "update_available";

type SitemapEntry = {
  sourceUrl: string;
  sourceModifiedAt: string | null;
};

type SourceProduct = SitemapEntry & {
  title: string;
  slug: string;
  version: string | null;
  excerpt: string;
  imageUrl: string | null;
  sourceCategory: string | null;
};

type ImportPreviewItem = SourceProduct & {
  importStatus: ImportStatus;
  productId: string | null;
  currentVersion: string | null;
  licenseStatus: "unverified" | "verified_gpl" | "rejected";
};

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const parts = [record.message, record.details, record.hint, record.code]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
    if (parts.length > 0) return parts.join(" — ");
    try {
      return JSON.stringify(error);
    } catch {
      // Fall through to generic message
    }
  }
  return "Import failed";
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    apos: "'",
    quot: '"',
    lt: "<",
    gt: ">",
    nbsp: " ",
    ndash: "–",
    mdash: "—",
    hellip: "…",
  };
  return value
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => named[name.toLowerCase()] ?? match);
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function readAttribute(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1].trim()) : null;
}

function readMeta(html: string, key: string): string | null {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const name = readAttribute(tag, "property") ?? readAttribute(tag, "name");
    if (name?.toLowerCase() === key.toLowerCase()) {
      return readAttribute(tag, "content");
    }
  }
  return null;
}

function extractVersion(title: string): string | null {
  const version = title.match(/(?:^|\s)v?(\d+(?:\.\d+){1,4})(?=\s|\+|–|-|$)/i);
  return version?.[1] ?? null;
}

function sourceSlug(sourceUrl: string): string {
  const parts = new URL(sourceUrl).pathname.split("/").filter(Boolean);
  return parts.at(-1) ?? "imported-product";
}

function assertSourceUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  if (url.hostname !== "weadown.com" && !url.hostname.endsWith(".weadown.com")) {
    throw new Error("Unsupported source URL. Must be from weadown.com");
  }
  url.hash = "";
  url.search = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.toString();
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "User-Agent": "bdBeginnerResearchImporter/1.0 (+https://bdbeginner.com)",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Source request failed (${response.status}) for ${url}`);
  return response.text();
}

function parseSitemap(xml: string, limit: number, offset = 0): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const blocks = xml.match(/<url>[^]*?<\/url>/gi) ?? [];
  let index = 0;
  for (const block of blocks) {
    const loc = block.match(/<loc>([^]*?)<\/loc>/i)?.[1];
    if (!loc) continue;
    let sourceUrl: string;
    try {
      sourceUrl = assertSourceUrl(decodeHtml(loc.trim()));
    } catch {
      continue;
    }

    if (index < offset) {
      index++;
      continue;
    }

    const modified = block.match(/<lastmod>([^]*?)<\/lastmod>/i)?.[1]?.trim() ?? null;
    entries.push({
      sourceUrl,
      sourceModifiedAt: modified && !Number.isNaN(Date.parse(modified))
        ? new Date(modified).toISOString()
        : null,
    });
    index++;
    if (entries.length >= limit) break;
  }
  return entries;
}

function parseListingHtml(html: string): SourceProduct[] {
  const items: SourceProduct[] = [];
  const seenUrls = new Set<string>();

  // Extract td_module blocks from WeaDown category / listing pages
  const modules = [...html.matchAll(/<div[^>]*class="[^"]*td_module_[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi)];

  for (const m of modules) {
    const block = m[1];
    const titleMatch = block.match(/<h3[^>]*class="[^"]*entry-title[^"]*"[^>]*>\s*<a\s+href="([^"]+)"[^>]*title="([^"]+)"/i) ||
                       block.match(/<a\s+href="(https:\/\/weadown\.com\/res\/[^"]+)"[^>]*title="([^"]+)"/i) ||
                       block.match(/<a\s+href="(https:\/\/weadown\.com\/res\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!titleMatch) continue;

    let url = titleMatch[1].trim();
    if (!url.endsWith("/")) url += "/";
    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    const rawTitle = stripTags(titleMatch[2]);
    const cleanTitle = rawTitle.replace(/\s*[|–-]\s*WeaDown\s*$/i, "").trim();

    const imgMatch = block.match(/data-img-url="([^"]+)"/i) ||
                     block.match(/<img[^>]+src="([^"]+)"/i);
    const img = imgMatch ? imgMatch[1] : null;

    const excerptMatch = block.match(/<div[^>]*class="[^"]*td-excerpt[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const excerpt = excerptMatch ? stripTags(excerptMatch[1]).slice(0, 700) : "";

    const dateMatch = block.match(/<time[^>]*datetime="([^"]+)"/i);
    const publishedAt = dateMatch && !Number.isNaN(Date.parse(dateMatch[1]))
      ? new Date(dateMatch[1]).toISOString()
      : null;

    const slug = sourceSlug(url);
    const version = extractVersion(cleanTitle) || "1.0.0";

    items.push({
      sourceUrl: url,
      sourceModifiedAt: publishedAt,
      title: cleanTitle || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      slug,
      version,
      excerpt,
      imageUrl: img,
      sourceCategory: null,
    });
  }

  return items;
}

function parseSourceProduct(html: string, entry: SitemapEntry): SourceProduct {
  const fallbackTitle = stripTags(html.match(/<h1\b[^>]*>([^]*?)<\/h1>/i)?.[1] ?? sourceSlug(entry.sourceUrl));
  const title = stripTags(readMeta(html, "og:title") ?? fallbackTitle)
    .replace(/\s*[|–-]\s*WeaDown\s*$/i, "")
    .trim();
  const description = stripTags(readMeta(html, "og:description") ?? "").slice(0, 700);
  const image = readMeta(html, "og:image");
  const category = readMeta(html, "article:section");
  const published = readMeta(html, "article:published_time") ?? readMeta(html, "article:modified_time");
  const modifiedAt = published && !Number.isNaN(Date.parse(published))
    ? new Date(published).toISOString()
    : entry.sourceModifiedAt;

  return {
    sourceUrl: entry.sourceUrl,
    sourceModifiedAt: modifiedAt,
    title,
    slug: sourceSlug(entry.sourceUrl),
    version: extractVersion(title) || "1.0.0",
    excerpt: description,
    imageUrl: image?.startsWith("https://") ? image : null,
    sourceCategory: category ? stripTags(category) : null,
  };
}

async function mapWithConcurrency<T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(values.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex++;
      results[index] = await mapper(values[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, () => worker()));
  return results;
}

async function loadListingProducts(
  sourceUrl: string,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<SourceProduct[]> {
  const normalized = (sourceUrl || "").trim() || "https://weadown.com/wordpress-theme/";

  // 1. If Sitemap XML URL is explicitly requested
  if (normalized.endsWith(".xml")) {
    let sitemapUrl = normalized;
    if (page > 1 && sitemapUrl.includes("post-sitemap1.xml")) {
      sitemapUrl = sitemapUrl.replace("post-sitemap1.xml", `post-sitemap${page}.xml`);
    }
    const xml = await fetchText(sitemapUrl);
    const entries = parseSitemap(xml, limit);
    if (entries.length === 0) return [];
    return mapWithConcurrency(entries, 5, async (entry) => {
      try {
        const html = await fetchText(entry.sourceUrl);
        return parseSourceProduct(html, entry);
      } catch {
        return {
          ...entry,
          title: sourceSlug(entry.sourceUrl).replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          slug: sourceSlug(entry.sourceUrl),
          version: "1.0.0",
          excerpt: "",
          imageUrl: null,
          sourceCategory: null,
        };
      }
    });
  }

  // 2. Category / Listing URL pagination: WeaDown uses /pages/{page}/
  // Extract existing page from URL if present
  let currentPage = page;
  let cleanBase = normalized;
  const pageMatch = normalized.match(/\/pages\/(\d+)\/?$/i);
  if (pageMatch) {
    if (page === 1) currentPage = parseInt(pageMatch[1], 10);
    cleanBase = normalized.replace(/\/pages\/\d+\/?$/i, "");
  }
  cleanBase = cleanBase.replace(/\/+$/, "");

  const allItems: SourceProduct[] = [];
  const seenUrls = new Set<string>();

  // Fetch page(s) until limit is fulfilled or max 3 pages
  let p = currentPage;
  const maxPagesToFetch = Math.min(3, Math.ceil(limit / 25));

  for (let step = 0; step < maxPagesToFetch; step++) {
    const pageUrl = p === 1 ? `${cleanBase}/` : `${cleanBase}/pages/${p}/`;
    try {
      const html = await fetchText(pageUrl);
      const parsedItems = parseListingHtml(html);
      if (parsedItems.length === 0) break;

      for (const item of parsedItems) {
        if (!seenUrls.has(item.sourceUrl)) {
          seenUrls.add(item.sourceUrl);
          allItems.push(item);
        }
        if (allItems.length >= limit) break;
      }

      if (allItems.length >= limit) break;
      p++;
    } catch (err) {
      // If next page fails, stop gracefully
      break;
    }
  }

  // Fallback: If listing markup did not yield items, try sitemap
  if (allItems.length === 0 && currentPage === 1) {
    const sitemapUrl = `https://weadown.com/post-sitemap${page}.xml`;
    try {
      const xml = await fetchText(sitemapUrl);
      const entries = parseSitemap(xml, Math.min(30, limit));
      for (const entry of entries) {
        allItems.push({
          ...entry,
          title: sourceSlug(entry.sourceUrl).replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          slug: sourceSlug(entry.sourceUrl),
          version: "1.0.0",
          excerpt: "",
          imageUrl: null,
          sourceCategory: null,
        });
      }
    } catch {
      // ignore
    }
  }

  return allItems.slice(0, limit);
}

async function loadSelectedProducts(urls: string[]): Promise<SourceProduct[]> {
  const uniqueUrls = [...new Set(urls.map(assertSourceUrl))].slice(0, MAX_LIMIT);
  return mapWithConcurrency(uniqueUrls, 5, async (sourceUrl) => {
    const html = await fetchText(sourceUrl);
    const published = readMeta(html, "article:published_time") ?? readMeta(html, "article:modified_time");
    return parseSourceProduct(html, {
      sourceUrl,
      sourceModifiedAt: published && !Number.isNaN(Date.parse(published))
        ? new Date(published).toISOString()
        : null,
    });
  });
}

async function requireAdmin(req: Request, supabase: SupabaseClient): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Authentication required");
  const token = authHeader.slice("Bearer ".length);
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (serviceKey && token === serviceKey) {
    return "service-role-admin";
  }
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData.user) throw new Error("Authentication required");
  const { data: admin } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", authData.user.id)
    .maybeSingle();
  if (!admin) throw new Error("Administrator access required");
  return authData.user.id;
}

async function buildPreview(
  supabase: SupabaseClient,
  products: SourceProduct[],
): Promise<ImportPreviewItem[]> {
  if (products.length === 0) return [];
  const urls = products.map((product) => product.sourceUrl);
  const { data, error } = await supabase
    .from("product_source_imports")
    .select("product_id,source_url,source_version,source_modified_at,license_status")
    .in("source_url", urls);
  if (error) throw error;
  const existing = new Map((data ?? []).map((row) => [row.source_url as string, row]));

  return products.map((product) => {
    const current = existing.get(product.sourceUrl);
    let importStatus: ImportStatus = "new";
    if (current) {
      const sourceIsNewer = Boolean(
        product.sourceModifiedAt &&
          (!current.source_modified_at || Date.parse(product.sourceModifiedAt) > Date.parse(current.source_modified_at)),
      );
      const versionChanged = Boolean(product.version && product.version !== current.source_version);
      importStatus = sourceIsNewer || versionChanged ? "update_available" : "up_to_date";
    }
    return {
      ...product,
      importStatus,
      productId: (current?.product_id as string | undefined) ?? null,
      currentVersion: (current?.source_version as string | undefined) ?? null,
      licenseStatus: (current?.license_status as ImportPreviewItem["licenseStatus"] | undefined) ?? "unverified",
    };
  });
}

async function resolveCategory(
  supabase: SupabaseClient,
  requestedId: string | null,
  categoryName?: string | null,
): Promise<string> {
  if (requestedId) {
    const { data } = await supabase.from("categories").select("id").eq("id", requestedId).maybeSingle();
    if (data?.id) return data.id as string;
  }
  if (categoryName && categoryName.trim()) {
    const { data } = await supabase
      .from("categories")
      .select("id")
      .ilike("name", `%${categoryName.trim()}%`)
      .maybeSingle();
    if (data?.id) return data.id as string;
  }
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", IMPORT_CATEGORY_SLUG)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("categories")
    .insert({
      name: "GPL Research Imports",
      slug: IMPORT_CATEGORY_SLUG,
      description: "Draft metadata imported for web-development and catalog workflow testing.",
      icon: "FlaskConical",
      sort_order: 90,
      is_active: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return created.id as string;
}

async function uniqueProductSlug(supabase: SupabaseClient, preferred: string): Promise<string> {
  const candidates = [preferred, `${preferred}-research`, `${preferred}-weadown`];
  for (const candidate of candidates) {
    const { data } = await supabase.from("products").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${preferred}-${crypto.randomUUID().slice(0, 8)}`;
}

function researchDescription(product: SourceProduct): string {
  return product.excerpt || `${product.title} - Official WordPress theme/plugin package. High performance, clean code, and fully responsive layouts.`;
}

async function importOne(
  supabase: SupabaseClient,
  product: SourceProduct,
  categoryId: string,
  price: number,
  overwritePrice: boolean,
  status = "published",
): Promise<{ sourceUrl: string; productId: string; result: "created" | "updated" }> {
  const { data: mapping, error: mappingError } = await supabase
    .from("product_source_imports")
    .select("id,product_id")
    .eq("source_url", product.sourceUrl)
    .maybeSingle();
  if (mappingError) throw mappingError;

  const commonProductFields: Record<string, unknown> = {
    name: product.title,
    short_description: product.excerpt || null,
    description: researchDescription(product),
    thumbnail_url: product.imageUrl,
    version: product.version,
    status: status,
    compatibility: product.sourceCategory || "WordPress 6.0+, PHP 8.0+",
    update_policy: "Source metadata and updates can be applied from admin.",
    delivery_description: "Instant download available in account dashboard.",
    seo_title: product.title.slice(0, 70),
    seo_description: (product.excerpt || product.title).slice(0, 160),
    updated_at: new Date().toISOString(),
  };

  let productId: string;
  let result: "created" | "updated";
  if (mapping?.product_id) {
    productId = mapping.product_id as string;
    const payload = overwritePrice ? { ...commonProductFields, price } : commonProductFields;
    const { error } = await supabase.from("products").update(payload).eq("id", productId);
    if (error) throw error;
    result = "updated";
  } else {
    const slug = await uniqueProductSlug(supabase, product.slug);
    const { data: created, error } = await supabase
      .from("products")
      .insert({
        ...commonProductFields,
        category_id: categoryId,
        slug,
        sku: `WBD-${product.slug.slice(0, 10).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
        price,
        compare_at_price: Math.round(price * 1.5),
        product_type: "digital_download",
        delivery_type: "digital_download",
        status: status,
        featured: false,
        new_product: true,
        requirements: "Standard WordPress hosting requirements",
        support_period: "Lifetime updates",
        sort_order: 0,
        published_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw error;
    productId = created.id as string;
    result = "created";
  }

  if (product.imageUrl) {
    const { data: existingImage } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .eq("image_url", product.imageUrl)
      .maybeSingle();
    if (!existingImage) {
      const { error } = await supabase.from("product_images").insert({
        product_id: productId,
        image_url: product.imageUrl,
        alt_text: product.title,
        sort_order: 0,
      });
      if (error) throw error;
    }
  }

  const demoUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/demo-product-download?product=${encodeURIComponent(productId)}`;
  const { data: existingLink } = await supabase
    .from("product_download_links")
    .select("id")
    .eq("product_id", productId)
    .eq("title", "Research demo manifest")
    .maybeSingle();
  if (existingLink?.id) {
    const { error } = await supabase
      .from("product_download_links")
      .update({ download_url: demoUrl, version: product.version, is_active: true })
      .eq("id", existingLink.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("product_download_links").insert({
      product_id: productId,
      title: "Research demo manifest",
      download_url: demoUrl,
      version: product.version,
      sort_order: 0,
      is_active: true,
    });
    if (error) throw error;
  }

  const mappingPayload = {
    product_id: productId,
    provider: PROVIDER,
    source_url: product.sourceUrl,
    source_slug: product.slug,
    source_title: product.title,
    source_version: product.version,
    source_modified_at: product.sourceModifiedAt,
    metadata: {
      excerpt: product.excerpt,
      image_url: product.imageUrl,
      source_category: product.sourceCategory,
      import_mode: "metadata_demo",
    },
    last_checked_at: new Date().toISOString(),
    last_imported_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error: upsertError } = await supabase
    .from("product_source_imports")
    .upsert(mappingPayload, { onConflict: "source_url" });
  if (upsertError) throw upsertError;

  return { sourceUrl: product.sourceUrl, productId, result };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "method_not_allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) throw new Error("Server configuration missing");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await requireAdmin(req, supabase);

    const body = (await req.json()) as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "preview";

    if (action === "preview") {
      const sourceUrl = typeof body.sourceUrl === "string" && body.sourceUrl.trim()
        ? body.sourceUrl.trim()
        : "https://weadown.com/wordpress-theme/";
      const page = Math.max(1, Number(body.page) || 1);
      const requestedLimit = Number(body.limit ?? DEFAULT_LIMIT);
      const limit = Math.max(1, Math.min(MAX_LIMIT, Number.isFinite(requestedLimit) ? requestedLimit : DEFAULT_LIMIT));

      let products: SourceProduct[] = [];
      if (sourceUrl.includes("/res/")) {
        products = await loadSelectedProducts([sourceUrl]);
      } else {
        products = await loadListingProducts(sourceUrl, page, limit);
      }

      const items = await buildPreview(supabase, products);
      return jsonResponse({
        items,
        count: items.length,
        source: sourceUrl,
        page,
        limit,
      });
    }

    if (action === "preview_urls") {
      const sourceUrls = Array.isArray(body.sourceUrls)
        ? body.sourceUrls.filter((value): value is string => typeof value === "string")
        : [];
      if (sourceUrls.length === 0) return jsonResponse({ error: "A source URL is required" }, 400);
      const products = await loadSelectedProducts(sourceUrls);
      const items = await buildPreview(supabase, products);
      return jsonResponse({ items, count: items.length, source: SOURCE_ORIGIN });
    }

    if (action === "import") {
      const sourceUrls = Array.isArray(body.sourceUrls)
        ? body.sourceUrls.filter((value): value is string => typeof value === "string")
        : [];
      if (sourceUrls.length === 0) return jsonResponse({ error: "No products selected" }, 400);

      const requestedPrice = Number(body.price ?? DEFAULT_PRICE);
      const price = Number.isFinite(requestedPrice) && requestedPrice >= 0 ? requestedPrice : DEFAULT_PRICE;
      const categoryId = await resolveCategory(
        supabase,
        typeof body.categoryId === "string" && body.categoryId ? body.categoryId : null,
        typeof body.categoryName === "string" && body.categoryName ? body.categoryName : null,
      );
      const products = await loadSelectedProducts(sourceUrls);
      const overwritePrice = body.overwritePrice === true;
      const status = typeof body.status === "string" && body.status ? body.status : "published";
      const imported: Array<{ sourceUrl: string; productId: string; result: "created" | "updated" }> = [];
      const errors: Array<{ sourceUrl: string; message: string }> = [];

      for (const product of products) {
        try {
          imported.push(await importOne(supabase, product, categoryId, price, overwritePrice, status));
        } catch (error) {
          errors.push({
            sourceUrl: product.sourceUrl,
            message: formatError(error),
          });
        }
      }

      return jsonResponse(
        {
          imported,
          errors,
          created: imported.filter((item) => item.result === "created").length,
          updated: imported.filter((item) => item.result === "updated").length,
        },
        errors.length === products.length ? 422 : 200,
      );
    }

    return jsonResponse({ error: "unsupported_action" }, 400);
  } catch (error) {
    const message = formatError(error);
    const status = /Authentication|required|Administrator/.test(message) ? 403 : 500;
    console.error(`[WEADOWN_IMPORT] ${message}`);
    return jsonResponse({ error: message }, status);
  }
});
