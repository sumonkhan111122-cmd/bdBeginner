import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";
import { BkashClient, BkashProviderError, missingBkashConfiguration, type JsonRecord } from "./bkash.ts";

function redirect(siteUrl: string, params: Record<string, string | undefined>): Response {
  const url = new URL("/payment/result", siteUrl);
  Object.entries(params).forEach(([key, value]) => { if (value) url.searchParams.set(key, value); });
  return new Response(null, { status: 302, headers: { ...corsHeaders, Location: url.toString(), "Cache-Control": "no-store" } });
}

async function markTransactionSucceeded(admin: SupabaseClient, id: string, metadata: JsonRecord) {
  const preferred = await admin.from("payment_transactions").update({ status: "succeeded", metadata, updated_at: new Date().toISOString() }).eq("id", id).eq("status", "pending").select("id").maybeSingle();
  if (!preferred.error) return preferred;
  return admin.from("payment_transactions").update({ status: "completed", metadata, updated_at: new Date().toISOString() }).eq("id", id).eq("status", "pending").select("id").maybeSingle();
}

async function failPendingPayment(admin: SupabaseClient, transactionId: string, orderId: string) {
  const { data: failed } = await admin
    .from("payment_transactions")
    .update({ status: "failed", updated_at: new Date().toISOString() })
    .eq("id", transactionId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();
  if (failed) {
    await admin.from("orders").update({ payment_status: "unpaid", updated_at: new Date().toISOString() }).eq("id", orderId).eq("payment_status", "pending");
  }
}

async function notifyPaid(admin: SupabaseClient, orderNumber: string, transactionId: string) {
  try {
    const { error } = await admin.functions.invoke("order-notification", { body: { event_type: "payment_status_paid_customer", event_id: transactionId, order_number: orderNumber } });
    if (error) console.error("[BKASH_CALLBACK] notification_failed");
  } catch {
    console.error("[BKASH_CALLBACK] notification_failed");
  }
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return Response.json({ ok: true }, { headers: corsHeaders });

  const missingServer = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SITE_URL"].find((name) => !Deno.env.get(name));
  const missing = missingServer ?? missingBkashConfiguration();
  if (missing) {
    console.error(`[BKASH_CALLBACK] stage=CONFIG missing=${missing}`);
    return Response.json(
      { error: "configuration_error", message: `Missing server configuration: ${missing}` },
      { status: 500, headers: corsHeaders },
    );
  }

  const siteUrl = Deno.env.get("SITE_URL")!;
  try { new URL(siteUrl); } catch { return new Response("Invalid SITE_URL", { status: 500, headers: corsHeaders }); }
  if (req.method !== "GET") return redirect(siteUrl, { status: "error", message: "method_not_allowed" });

  const url = new URL(req.url);
  const paymentID = url.searchParams.get("paymentID");
  const callbackStatus = url.searchParams.get("status");
  if (!paymentID || !callbackStatus) return redirect(siteUrl, { status: "error", message: "missing_parameters" });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let orderNumber: string | undefined;

  try {
    const { data: transaction, error: transactionError } = await admin
      .from("payment_transactions")
      .select("*")
      .eq("provider", "bkash")
      .eq("provider_transaction_id", paymentID)
      .maybeSingle();
    if (transactionError || !transaction) return redirect(siteUrl, { status: "not_found" });

    const { data: order, error: orderError } = await admin.from("orders").select("*").eq("id", transaction.order_id).maybeSingle();
    if (orderError || !order) return redirect(siteUrl, { status: "error", message: "order_not_found" });
    orderNumber = order.order_number;

    if (transaction.status === "succeeded" || transaction.status === "completed" || order.payment_status === "paid") {
      return redirect(siteUrl, { order_number: orderNumber, status: "success", reason: "already_paid" });
    }

    if (callbackStatus === "cancel" || callbackStatus === "failure") {
      await failPendingPayment(admin, transaction.id, order.id);
      return redirect(siteUrl, { order_number: orderNumber, status: callbackStatus });
    }
    if (callbackStatus !== "success") return redirect(siteUrl, { order_number: orderNumber, status: "error", message: "unknown_state" });

    const bkash = new BkashClient();
    console.log("[BKASH_CALLBACK] stage=GRANT_TOKEN start");
    const tokenResponse = await bkash.grantToken();
    console.log("[BKASH_CALLBACK] stage=EXECUTE_PAYMENT start");
    const executeResponse = await bkash.executePayment(tokenResponse.id_token, paymentID);

    let result = executeResponse;
    if (executeResponse.statusCode === "2062") {
      console.log("[BKASH_CALLBACK] stage=QUERY_PAYMENT start");
      result = await bkash.queryPayment(tokenResponse.id_token, paymentID);
    }
    if (result.statusCode !== "0000" || result.transactionStatus !== "Completed") {
      console.error(`[BKASH_CALLBACK] stage=EXECUTE_PAYMENT responseCode=${result.statusCode || "unknown"}`);
      await failPendingPayment(admin, transaction.id, order.id);
      return redirect(siteUrl, { order_number: orderNumber, status: "failure" });
    }
    if (Number(result.amount) !== Number(order.total) || result.currency !== order.currency_code) {
      console.error("[BKASH_CALLBACK] stage=VERIFY_PAYMENT result=mismatch");
      await failPendingPayment(admin, transaction.id, order.id);
      return redirect(siteUrl, { order_number: orderNumber, status: "failure", message: "verification_failed" });
    }

    const oldMetadata = transaction.metadata && typeof transaction.metadata === "object" ? transaction.metadata as JsonRecord : {};
    const transactionUpdate = await markTransactionSucceeded(admin, transaction.id, { ...oldMetadata, trx_id: result.trxID, verified_at: new Date().toISOString() });
    if (transactionUpdate.error || !transactionUpdate.data) return redirect(siteUrl, { order_number: orderNumber, status: "error", message: "transaction_update_failed" });

    const { data: paidOrder, error: orderUpdateError } = await admin
      .from("orders")
      .update({ payment_status: "paid", payment_method: "bkash", payment_reference: result.trxID, updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("payment_status", "pending")
      .neq("order_status", "cancelled")
      .select("id")
      .maybeSingle();
    if (orderUpdateError || !paidOrder) {
      await admin.from("payment_transactions").update({ status: "pending", metadata: oldMetadata }).eq("id", transaction.id);
      return redirect(siteUrl, { order_number: orderNumber, status: "error", message: "order_update_failed" });
    }

    await notifyPaid(admin, orderNumber, transaction.id);
    return redirect(siteUrl, { order_number: orderNumber, status: "success" });
  } catch (error: unknown) {
    if (error instanceof BkashProviderError) console.error(`[BKASH_CALLBACK] stage=${error.stage} httpStatus=${error.httpStatus ?? "unknown"} responseCode=${error.responseCode ?? "unknown"}`);
    else console.error(`[BKASH_CALLBACK] stage=UNKNOWN errorClass=${error instanceof Error ? error.constructor.name : "UnknownError"}`);
    return redirect(siteUrl, { order_number: orderNumber, status: "provider_error" });
  }
}

export default { fetch: handler };
