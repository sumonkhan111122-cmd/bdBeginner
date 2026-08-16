import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";
import { generateInvoicePdf } from "../order-notification/pdfGenerator.ts";

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderNumber = url.searchParams.get("order");
    const accessToken = url.searchParams.get("token");

    if (!orderNumber) {
      return new Response("Missing order parameter", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Auth Validation
    const authHeader = req.headers.get("Authorization");
    let callerUserId: string | null = null;
    let isAdmin = false;

    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (bearer) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(bearer);
      if (!authError && user) {
        callerUserId = user.id;
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        isAdmin = !!adminData;
      }
    }

    // Fetch authoritative order data
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber)
      .maybeSingle();

    if (orderError || !order) {
      return new Response("Order not found", { status: 404, headers: corsHeaders });
    }

    // Validate access based on user type
    if (isAdmin) {
      // Admins can access any invoice
    } else if (callerUserId) {
      // Authenticated customer must own the order
      if (order.user_id !== callerUserId) {
        return new Response("Unauthorized access", { status: 403, headers: corsHeaders });
      }
    } else if (accessToken) {
      // Guest must provide a valid access token
      const { data: receipt, error: receiptError } = await supabase.rpc("get_order_receipt", {
        p_order_number: order.order_number,
        p_access_token: accessToken,
      });
      if (receiptError || !receipt) {
        return new Response("Invalid guest access token", { status: 403, headers: corsHeaders });
      }
    } else {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    // Fetch site settings
    const { data: siteData } = await supabase.from("site_settings").select("site_name,logo_url,support_email").eq("id", 1).maybeSingle();
    const siteSettings = {
      site_name: siteData?.site_name || "bdBeginner",
      logo_url: siteData?.logo_url || null,
      support_email: siteData?.support_email || "support@bdbeginner.com"
    };

    const orderDataForTemplate = {
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total: order.total,
      discount_total: order.discount_total,
      currency_code: order.currency_code,
      order_status: order.order_status || order.status || 'pending',
      payment_status: order.payment_status,
      created_at: order.created_at,
      payment_method: order.payment_method,
      items: order.order_items.map((item: Record<string, unknown>) => ({
        product_name: item.product_name_snapshot || item.product_name || "Product",
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      })),
      invoice_number: order.invoice_number,
    };

    const pdfType = order.payment_status === 'paid' ? 'PAID_INVOICE' : 'ORDER_SUMMARY';
    const pdfBytes = await generateInvoicePdf(orderDataForTemplate, siteSettings, pdfType);

    // Update invoice_number if missing
    if (!order.invoice_number) {
      const generatedInv = `INV-${order.order_number}`;
      await supabase.from('orders').update({ invoice_number: generatedInv, invoice_issued_at: new Date().toISOString() }).eq('id', order.id);
      orderDataForTemplate.invoice_number = generatedInv;
    }

    const filename = order.payment_status === 'paid' 
      ? `bdBeginner-Invoice-${orderDataForTemplate.invoice_number}.pdf` 
      : `bdBeginner-OrderSummary-${orderDataForTemplate.invoice_number || order.order_number}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error(`[DOWNLOAD_INVOICE] Error:`, error);
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
}

export default { fetch: handler };
