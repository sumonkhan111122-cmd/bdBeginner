import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";
import {
  BkashClient,
  BkashProviderError,
  missingBkashConfiguration,
  type JsonRecord,
} from "../_shared/bkash.ts";

const json = (body: JsonRecord, status = 200) => Response.json(body, { status, headers: corsHeaders });

function missingServerConfiguration(): string | null {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SITE_URL"];
  return required.find((name) => !Deno.env.get(name)) ?? missingBkashConfiguration();
}

function bearerToken(req: Request): string | null {
  const value = req.headers.get("Authorization");
  return value?.startsWith("Bearer ") ? value.slice(7).trim() || null : null;
}

async function authorizeOrder(
  req: Request,
  admin: SupabaseClient,
  orderNumber: string,
  accessToken: string | null,
): Promise<{ order?: JsonRecord; response?: Response }> {
  const { data: order, error } = await admin.from("orders").select("*").eq("order_number", orderNumber).maybeSingle();
  if (error) return { response: json({ error: "order_lookup_failed", message: "The order could not be loaded." }, 500) };
  if (!order) return { response: json({ error: "not_found", message: "Order not found." }, 404) };

  if (accessToken) {
    const { data: guestOrder, error: guestError } = await admin.from("orders").select("id").eq("order_number", orderNumber).eq("access_token", accessToken).maybeSingle();
    if (!guestError && guestOrder?.id === order.id) return { order: order as JsonRecord };
  }

  const token = bearerToken(req);
  if (token) {
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (!userError && user && order.user_id === user.id) return { order: order as JsonRecord };
  }
  return { response: json({ error: "unauthorized", message: "You are not authorized to pay for this order." }, 401) };
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return Response.json({ ok: true }, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed", message: "POST is required." }, 405);

  const missing = missingServerConfiguration();
  if (missing) {
    console.error(`[BKASH] stage=CONFIG missing=${missing}`);
    return json({ error: "configuration_error", code: "configuration_error", message: `Missing server configuration: ${missing}` }, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const siteUrl = Deno.env.get("SITE_URL")!;
  try {
    new URL(siteUrl);
  } catch {
    console.error("[BKASH] stage=CONFIG invalid=SITE_URL");
    return json({ error: "configuration_error", code: "configuration_error", message: "Invalid server configuration: SITE_URL" }, 500);
  }

  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object") return json({ error: "invalid_request", message: "A JSON request body is required." }, 400);
    const body = parsed as JsonRecord;
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const accessToken = typeof body.accessToken === "string" ? body.accessToken : null;
    if (!orderNumber) return json({ error: "invalid_order", message: "Order number is required." }, 400);

    const authorization = await authorizeOrder(req, admin, orderNumber, accessToken);
    if (authorization.response) return authorization.response;
    const order = authorization.order!;
    const orderStatus = String(order.order_status ?? order.status ?? "pending");
    const paymentStatus = String(order.payment_status ?? "unpaid");
    if (orderStatus === "cancelled") return json({ error: "order_cancelled", message: "A cancelled order cannot be paid." }, 409);
    if (paymentStatus === "paid" || paymentStatus === "refunded") return json({ error: "payment_not_allowed", message: "This order is not eligible for another payment." }, 409);

    const { data: methodSetting, error: methodError } = await admin.from("payment_method_settings").select("enabled").eq("method", "bkash").maybeSingle();
    if (methodError || !methodSetting?.enabled) return json({ error: "method_unavailable", message: "Direct bKash is currently unavailable." }, 409);

    const { data: pendingPayment, error: pendingError } = await admin
      .from("payment_transactions")
      .select("provider,metadata")
      .eq("order_id", order.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (pendingError) return json({ error: "payment_lookup_failed", message: "The current payment status could not be checked." }, 500);
    if (pendingPayment) {
      const metadata = pendingPayment.metadata && typeof pendingPayment.metadata === "object" ? pendingPayment.metadata as JsonRecord : {};
      const existingUrl = typeof metadata.payment_url === "string" ? metadata.payment_url : "";
      if (pendingPayment.provider === "bkash" && existingUrl) {
        try {
          const url = new URL(existingUrl);
          if (url.protocol === "https:") return json({ success: true, paymentUrl: url.toString(), resumed: true });
        } catch {
          // A malformed stored URL must never be returned to the browser.
        }
      }
      return json({ error: "payment_pending", message: "A payment is already pending for this order." }, 409);
    }

    const bkash = new BkashClient();
    console.log("[BKASH] stage=GRANT_TOKEN start");
    const tokenResponse = await bkash.grantToken();
    console.log("[BKASH] stage=GRANT_TOKEN status=200");

    const callbackURL = `${supabaseUrl.replace(/\/$/, "")}/functions/v1/bkash-payment-callback`;
    console.log("[BKASH] stage=CREATE_PAYMENT start");
    const createResponse = await bkash.createPayment(tokenResponse.id_token, {
      mode: "0011",
      payerReference: `order-${String(order.order_number)}`,
      callbackURL,
      amount: Number(order.total).toFixed(2),
      currency: String(order.currency_code),
      intent: "sale",
      merchantInvoiceNumber: String(order.order_number),
    });
    console.log(`[BKASH] stage=CREATE_PAYMENT status=200 responseCode=${createResponse.statusCode}`);

    const paymentUrl = bkash.paymentUrl(createResponse);
    console.log(`[BKASH] stage=RETURN_PAYMENT_URL present=${Boolean(paymentUrl)}`);
    if (!paymentUrl) return json({ error: "payment_url_missing", message: "bKash did not return a valid payment address." }, 502);

    const { data: transaction, error: transactionError } = await admin.from("payment_transactions").insert({
      order_id: order.id,
      provider: "bkash",
      provider_transaction_id: createResponse.paymentID,
      amount: order.total,
      currency: order.currency_code,
      status: "pending",
      metadata: {
        invoice_number: order.order_number,
        payment_create_time: createResponse.paymentCreateTime ?? null,
        payment_url: paymentUrl,
      },
    }).select("id").single();
    if (transactionError || !transaction) {
      console.error(`[BKASH] stage=CREATE_PAYMENT local_record_failed code=${transactionError?.code ?? "unknown"}`);
      return json({ error: "payment_record_failed", message: "The bKash payment could not be recorded." }, 500);
    }

    const { data: pendingOrder, error: orderUpdateError } = await admin
      .from("orders")
      .update({ payment_status: "pending", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("payment_status", "unpaid")
      .neq("order_status", "cancelled")
      .select("id")
      .maybeSingle();
    if (orderUpdateError || !pendingOrder) {
      await admin.from("payment_transactions").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", transaction.id).eq("status", "pending");
      return json({ error: "order_update_failed", message: "The order is no longer eligible for this payment." }, orderUpdateError ? 500 : 409);
    }

    return json({ success: true, paymentUrl });
  } catch (error: unknown) {
    if (error instanceof BkashProviderError) {
      console.error(`[BKASH] stage=${error.stage} httpStatus=${error.httpStatus ?? "unknown"} responseCode=${error.responseCode ?? "unknown"}`);
      return json({ error: "provider_error", code: "provider_error", message: "bKash could not start the payment.", stage: error.stage }, 502);
    }
    console.error(`[BKASH] stage=UNKNOWN errorClass=${error instanceof Error ? error.constructor.name : "UnknownError"}`);
    return json({ error: "server_error", message: "The bKash payment service could not process the request." }, 500);
  }
}

export default { fetch: handler };
