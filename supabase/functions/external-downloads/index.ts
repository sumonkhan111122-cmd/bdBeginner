import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";

type ExternalOrderItem = {
  id: string;
  product_id: string;
  delivery_type: string;
};

export async function serve(req: Request) {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    // We also need a client with the user's JWT if available
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const userSupabase = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || "", {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    }

    const body = await req.json();
    const { action, orderId, orderNumber, accessToken, orderItemId, linkId } = body;

    if (!["list", "open"].includes(action)) {
      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    let orderData = null;

    if (accessToken && orderNumber) {
      // Guest mode
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("order_number", orderNumber)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (order.access_token !== accessToken) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      orderData = order;
    } else if (orderId && userId) {
      // Authenticated mode
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (*)
        `)
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      if (order.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      orderData = order;
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Verify payment status
    if (orderData.payment_status !== "paid") {
      return new Response(JSON.stringify({ error: "Payment required" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Gather digital products in the order
    const orderItems = (orderData.order_items ?? []) as ExternalOrderItem[];
    const digitalProductIds = orderItems
      .filter((item) => item.delivery_type === "digital_download")
      .map((item) => item.product_id);

    if (digitalProductIds.length === 0) {
      return new Response(JSON.stringify({ error: "No digital downloads in this order" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      // Return safe metadata
      const { data: links, error: linksError } = await supabase
        .from("product_download_links")
        .select("id, product_id, title, version, sort_order")
        .in("product_id", digitalProductIds)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      if (linksError) {
        throw linksError;
      }

      return new Response(JSON.stringify({ links }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "open") {
      if (!orderItemId || !linkId) {
        return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Check that the order item belongs to this order
      const orderItem = orderItems.find((item) => item.id === orderItemId);
      if (!orderItem) {
        return new Response(JSON.stringify({ error: "Invalid order item" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Check that the product is a digital download
      if (orderItem.delivery_type !== "digital_download") {
        return new Response(JSON.stringify({ error: "Not a digital download product" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Check that the requested link belongs to the requested product and is active
      const { data: link, error: linkError } = await supabase
        .from("product_download_links")
        .select("id, product_id, download_url")
        .eq("id", linkId)
        .eq("product_id", orderItem.product_id)
        .eq("is_active", true)
        .single();

      if (linkError || !link) {
        return new Response(JSON.stringify({ error: "Link not found or unauthorized" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Validate URL safety server-side
      try {
        const urlObj = new URL(link.download_url);
        if (urlObj.protocol !== "https:") {
          return new Response(JSON.stringify({ error: "Insecure download link" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
      } catch {
        return new Response(JSON.stringify({ error: "Invalid download link format" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ success: true, url: link.download_url }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

  } catch (error: unknown) {
    console.error(`[EXTERNAL_DOWNLOADS] errorClass=${error instanceof Error ? error.constructor.name : "UnknownError"} message=${error instanceof Error ? error.message : String(error)}`);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "internal_server_error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

Deno.serve(serve);
