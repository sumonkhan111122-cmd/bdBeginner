import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";
import {
  buildTransactionalEmail,
  EMAIL_TEMPLATE_VERSION,
  type TransactionalEmailEvent,
} from "../order-notification/transactionalEmails.ts";

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let template = "";
    if (req.method === "POST") {
      const body = await req.json();
      template = body.template;
    } else {
      const url = new URL(req.url);
      template = url.searchParams.get("template") || "";
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("Unauthorized", { status: 401, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    let isAdmin = false;

    if (bearer) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(bearer);
      if (!authError && user) {
        const { data: adminData } = await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        isAdmin = !!adminData;
      }
    }

    if (!isAdmin) {
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const { data: siteData } = await supabase.from("site_settings").select("site_name,logo_url,support_email").eq("id", 1).maybeSingle();
    const siteUrl = "https://bdbeginner.com";
    let logoUrl: string | null = null;
    if (siteData?.logo_url) {
      try {
        const candidate = new URL(siteData.logo_url, siteUrl);
        if (candidate.protocol === "https:") logoUrl = candidate.toString();
      } catch {
        // The wordmark remains visible when no safe public image exists.
      }
    }
    const siteSettings = {
      site_name: siteData?.site_name || "bdBeginner",
      logo_url: logoUrl,
      support_email: siteData?.support_email || "support@bdbeginner.com"
    };

    const mockOrder = {
      order_number: "TEST-0001",
      customer_name: "John Doe",
      customer_email: "john@example.com",
      customer_phone: "+8801711122233",
      subtotal: 1490,
      total: 1290,
      discount_total: 200,
      currency_code: "BDT",
      order_status: "pending",
      payment_status: template === "payment_approved" ? "paid" : "pending",
      created_at: new Date().toISOString(),
      payment_method: "bKash",
      items: [
        { product_name: "Premium Web Toolkit v2", quantity: 1, unit_price: 1490, line_total: 1490 }
      ],
      invoice_number: "INV-TEST-0001",
    };

    const previewEvents: Record<string, TransactionalEmailEvent> = {
      order_received: "order_received",
      payment_pending: "manual_payment_submitted",
      payment_approved: "payment_confirmed",
      payment_rejected: "payment_rejected",
      product_ready: "product_ready",
      refund_confirmation: "refund_confirmation",
      account_activation: "account_activation",
    };
    const eventType = previewEvents[template];
    if (!eventType) {
      return new Response(JSON.stringify({ error: "invalid_template" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const builtEmail = buildTransactionalEmail({
      eventType,
      order: mockOrder,
      site: siteSettings,
      siteUrl,
      transactionId: "TXN12345678",
      method: "bkash_personal",
      reason: "The transaction ID did not match our payment record.",
      actionLink: `${siteUrl}/account/set-password#preview-token`,
    });

    return new Response(JSON.stringify({
      html: builtEmail.html,
      subject: builtEmail.subject,
      template: builtEmail.templateName,
      templateVersion: EMAIL_TEMPLATE_VERSION,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error: unknown) {
    console.error(`[EMAIL_PREVIEW] errorClass=${error instanceof Error ? error.constructor.name : "UnknownError"}`);
    return new Response("Internal Server Error", { status: 500, headers: corsHeaders });
  }
}

export default { fetch: handler };
