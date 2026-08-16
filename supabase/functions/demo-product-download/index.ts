import { createClient } from "@supabase/supabase-js";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const productId = new URL(req.url).searchParams.get("product");
  if (!productId || !/^[0-9a-f-]{36}$/i.test(productId)) {
    return new Response("Invalid product", { status: 400, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response("Server configuration missing", { status: 500, headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("product_source_imports")
    .select("source_title,source_url,source_version,source_modified_at,license_status")
    .eq("product_id", productId)
    .maybeSingle();

  if (error || !data) {
    return new Response("Demo manifest not found", { status: 404, headers: corsHeaders });
  }

  const manifest = [
    "bdBeginner research importer demo",
    "================================",
    `Product: ${data.source_title}`,
    `Version: ${data.source_version ?? "Not detected"}`,
    `Source: ${data.source_url}`,
    `Source modified: ${data.source_modified_at ?? "Unknown"}`,
    `License review: ${data.license_status}`,
    "",
    "This generated text file tests checkout and download entitlement only.",
    "No third-party theme, plugin, executable, archive, or premium asset is included.",
    "Verify the complete package license and bundled-asset rights before publishing a real download.",
    "",
  ].join("\n");

  return new Response(manifest, {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="research-import-${productId.slice(0, 8)}.txt"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

