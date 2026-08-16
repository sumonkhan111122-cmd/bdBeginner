import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

const PROVIDER = "weadown";
const SOURCE_ORIGIN = "https://weadown.com";
const SITEMAP_URL = `${SOURCE_ORIGIN}/post-sitemap1.xml`;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 50;
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
  if (url.protocol !== "https:" || url.hostname !== "weadown.com" || !url.pathname.startsWith("/res/")) {
    throw new Error("Unsupported source URL");
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
  if (!response.ok) throw new Error(`Source request failed (${response.status})`);
  return response.text();
}

function parseSitemap(xml: string, limit: number): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const blocks = xml.match(/<url>[^]*?<\/url>/gi) ?? [];
  for (const block of blocks) {
    const loc = block.match(/<loc>([^]*?)<\/loc>/i)?.[1];
    if (!loc) continue;
    let sourceUrl: string;
    try {
      sourceUrl = assertSourceUrl(decodeHtml(loc.trim()));
    } catch {
      continue;
    }
    const modified = block.match(/<lastmod>([^]*?)<\/lastmod>/i)?.[1]?.trim() ?? null;
    entries.push({
      sourceUrl,
      sourceModifiedAt: modified && !Number.isNaN(Date.parse(modified))
        ? new Date(modified).toISOString()
        : null,
    });
    if (entries.length >= limit) break;
  }
  return entries;
}

function parseSourceProduct(html: string, entry: SitemapEntry): SourceProduct {
  const fallbackTitle = stripTags(html.match(/<h1\b[^>]*>([^]*?)<\/h1>/i)?.[1] ?? sourceSlug(entry.sourceUrl));
  const title = stripTags(readMeta(html, "og:title") ?? fallbackTitle)
    .replace(/\s*[|–-]\s*WeaDown\s*$/i, "")
    .trim();
  const description = stripTags(readMeta(html, "og:description") ?? "").slice(0, 700);
  const image = readMeta(html, "og:image");
  const category = readMeta(html, "article:section");

  return {
    ...entry,
    title,
    slug: sourceSlug(entry.sourceUrl),
    version: extractVersion(title),
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

async function loadLatestProducts(limit: number): Promise<SourceProduct[]> {
  const sitemap = await fetchText(SITEMAP_URL);
  const entries = parseSitemap(sitemap, limit);
  if (entries.length === 0) throw new Error("No source products found in sitemap");
  return mapWithConcurrency(entries, 6, async (entry) => {
    const html = await fetchText(entry.sourceUrl);
    return parseSourceProduct(html, entry);
  });
}

async function loadSelectedProducts(urls: string[]): Promise<SourceProduct[]> {
  const uniqueUrls = [...new Set(urls.map(assertSourceUrl))].slice(0, MAX_LIMIT);
  const sitemap = parseSitemap(await fetchText(SITEMAP_URL), 200);
  const modifiedByUrl = new Map(sitemap.map((entry) => [entry.sourceUrl, entry.sourceModifiedAt]));
  return mapWithConcurrency(uniqueUrls, 6, async (sourceUrl) => {
    const html = await fetchText(sourceUrl);
    return parseSourceProduct(html, {
      sourceUrl,
      sourceModifiedAt: modifiedByUrl.get(sourceUrl) ?? null,
    });
  });
}

async function requireAdmin(req: Request, supabase: SupabaseClient): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) throw new Error("Authentication required");
  const token = authHeader.slice("Bearer ".length);
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

async function resolveCategory(supabase: SupabaseClient, requestedId: string | null): Promise<string> {
  if (requestedId) {
    const { data } = await supabase.from("categories").select("id").eq("id", requestedId).maybeSingle();
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
  const summary = product.excerpt || `${product.title} source metadata imported for catalog workflow testing.`;
  return `${summary}\n\nResearch catalog notice: This draft record is for importer, update, checkout, and entitlement testing. The original publisher retains all applicable rights. This demo does not copy or deliver the third-party package; its download action returns a generated text manifest only. License and bundled-asset rights must be verified before publishing a real file.`;
}

async function importOne(
  supabase: SupabaseClient,
  product: SourceProduct,
  categoryId: string,
  price: number,
  overwritePrice: boolean,
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
    compatibility: product.sourceCategory || "WordPress (verify before publishing)",
    update_policy: "Source metadata can be checked and applied from the admin importer.",
    delivery_description: "Controlled demo manifest after a completed test purchase.",
    seo_title: product.title.slice(0, 70),
    seo_description: (product.excerpt || product.title).slice(0, 160),
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
        sku: null,
        price,
        compare_at_price: null,
        icon: "Package",
        product_type: "digital_download",
        delivery_type: "digital_download",
        status: "draft",
        featured: false,
        new_product: true,
        requirements: null,
        support_period: "No support included in the research demo",
        sort_order: 0,
        published_at: null,
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

    const body = await req.json() as Record<string, unknown>;
    const action = typeof body.action === "string" ? body.action : "preview";

    if (action === "preview") {
      const requestedLimit = Number(body.limit ?? DEFAULT_LIMIT);
      const limit = Math.max(1, Math.min(MAX_LIMIT, Number.isFinite(requestedLimit) ? requestedLimit : DEFAULT_LIMIT));
      const products = await loadLatestProducts(limit);
      const items = await buildPreview(supabase, products);
      return jsonResponse({ items, count: items.length, source: SITEMAP_URL });
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
      );
      const products = await loadSelectedProducts(sourceUrls);
      const overwritePrice = body.overwritePrice === true;
      const imported: Array<{ sourceUrl: string; productId: string; result: "created" | "updated" }> = [];
      const errors: Array<{ sourceUrl: string; message: string }> = [];

      for (const product of products) {
        try {
          imported.push(await importOne(supabase, product, categoryId, price, overwritePrice));
        } catch (error) {
          errors.push({
            sourceUrl: product.sourceUrl,
            message: error instanceof Error ? error.message : "Import failed",
          });
        }
      }

      return jsonResponse({
        imported,
        errors,
        created: imported.filter((item) => item.result === "created").length,
        updated: imported.filter((item) => item.result === "updated").length,
      }, errors.length === products.length ? 422 : 200);
    }

    return jsonResponse({ error: "unsupported_action" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = /Authentication|required|Administrator/.test(message) ? 403 : 500;
    console.error(`[WEADOWN_IMPORT] ${message}`);
    return jsonResponse({ error: message }, status);
  }
});

