import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";

const manualMethods = ["bkash_personal", "nagad_personal", "rocket_personal"] as const;
const rejectionReasons = {
  invalid_transaction_id: "The transaction ID is invalid.",
  transaction_not_found: "The transaction could not be found.",
  incorrect_amount: "The paid amount does not match the order total.",
  duplicate_transaction: "This transaction ID has already been used.",
  payment_not_received: "The payment was not received.",
  wrong_recipient: "The payment was sent to the wrong recipient.",
  transaction_already_used: "The transaction has already been used for another order.",
  information_mismatch: "The submitted payment information does not match.",
  other: "The payment could not be verified.",
  request_resubmission: "Payment information needs to be submitted again.",
} as const;

type ManualMethod = typeof manualMethods[number];
type RejectionReasonCode = keyof typeof rejectionReasons;
type JsonRecord = Record<string, unknown>;

const json = (body: JsonRecord, status = 200) => Response.json(body, {
  status,
  headers: corsHeaders,
});

const messageFrom = (error: unknown) => error instanceof Error ? error.message : "Unknown error";

function requiredEnvironment(names: string[]): { values?: Record<string, string>; response?: Response } {
  const values: Record<string, string> = {};
  for (const name of names) {
    const value = Deno.env.get(name);
    if (!value) return { response: json({ error: "configuration_error", code: "configuration_error", message: `Missing server configuration: ${name}` }, 500) };
    values[name] = value;
  }
  return { values };
}

function bearerToken(req: Request): string | null {
  const value = req.headers.get("Authorization");
  if (!value?.startsWith("Bearer ")) return null;
  return value.slice(7).trim() || null;
}

async function authenticatedUserId(req: Request, admin: SupabaseClient): Promise<string | null> {
  const token = bearerToken(req);
  if (!token) return null;
  const { data: { user }, error } = await admin.auth.getUser(token);
  return error || !user ? null : user.id;
}

async function authorizeOrder(
  req: Request,
  admin: SupabaseClient,
  orderNumber: string,
  accessToken: string | null,
): Promise<{ order: JsonRecord | null; response?: Response }> {
  const { data: order, error } = await admin
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (error) return { order: null, response: json({ error: "order_lookup_failed", message: "The order could not be loaded." }, 500) };
  if (!order) return { order: null, response: json({ error: "not_found", message: "Order not found." }, 404) };

  if (accessToken) {
    const { data: guestOrder, error: guestError } = await admin
      .from("orders")
      .select("id")
      .eq("order_number", orderNumber)
      .eq("access_token", accessToken)
      .maybeSingle();
    if (!guestError && guestOrder?.id === order.id) return { order: order as JsonRecord };
  }

  const userId = await authenticatedUserId(req, admin);
  if (userId && order.user_id === userId) return { order: order as JsonRecord };
  return { order: null, response: json({ error: "unauthorized", message: "You are not authorized to access this order." }, 401) };
}

async function requireAdmin(req: Request, admin: SupabaseClient): Promise<{ userId?: string; response?: Response }> {
  const userId = await authenticatedUserId(req, admin);
  if (!userId) return { response: json({ error: "unauthorized", message: "Admin sign-in is required." }, 401) };
  const { data, error } = await admin.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
  if (error || !data) return { response: json({ error: "forbidden", message: "Admin access is required." }, 403) };
  return { userId };
}

async function notify(
  admin: SupabaseClient,
  eventType: string,
  orderNumber: string,
  eventId: string,
  reason?: string,
) {
  try {
    const { error } = await admin.functions.invoke("order-notification", {
      body: { event_type: eventType, event_id: eventId, order_number: orderNumber, ...(reason ? { reason } : {}) },
    });
    if (error) console.error(`[MANUAL_PAYMENT] notification_failed event=${eventType}`);
  } catch {
    console.error(`[MANUAL_PAYMENT] notification_failed event=${eventType}`);
  }
}

async function updateSuccessfulTransaction(admin: SupabaseClient, id: string, metadata: JsonRecord, reviewedBy: string) {
  const preferred = await admin.from("payment_transactions").update({ 
    status: "succeeded", 
    metadata, 
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
    review_reason_code: null,
    review_reason_text: null,
    updated_at: new Date().toISOString() 
  }).eq("id", id).eq("status", "pending").select("id").maybeSingle();
  if (!preferred.error) return preferred;
  // Existing projects may use the older `completed` check value. Preserve compatibility safely.
  return admin.from("payment_transactions").update({ 
    status: "completed", 
    metadata,
    reviewed_by: reviewedBy,
    reviewed_at: new Date().toISOString(),
    review_reason_code: null,
    review_reason_text: null,
    updated_at: new Date().toISOString() 
  }).eq("id", id).eq("status", "pending").select("id").maybeSingle();
}

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return Response.json({ ok: true }, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed", message: "POST is required." }, 405);

  const environment = requiredEnvironment(["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);
  if (environment.response) return environment.response;
  const admin = createClient(environment.values!.SUPABASE_URL, environment.values!.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object") return json({ error: "invalid_request", message: "A JSON request body is required." }, 400);
    const body = parsed as JsonRecord;
    const action = typeof body.action === "string" ? body.action : "";

    if (action === "submit" || action === "status") {
      const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
      const accessTokenValue = body.accessToken ?? body.guestToken;
      const accessToken = typeof accessTokenValue === "string" ? accessTokenValue : null;
      if (!orderNumber) return json({ error: "invalid_order", message: "Order number is required." }, 400);
      const authorization = await authorizeOrder(req, admin, orderNumber, accessToken);
      if (authorization.response) return authorization.response;
      const order = authorization.order!;

      if (action === "status") {
        const { data, error } = await admin
          .from("payment_transactions")
          .select("status,metadata")
          .eq("order_id", order.id)
          .in("provider", manualMethods)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return json({ error: "payment_lookup_failed", message: "Payment status could not be loaded." }, 500);
        if (!data) return json({ success: true, status: "none", rejectionReason: null });
        const metadata = data.metadata && typeof data.metadata === "object" ? data.metadata as JsonRecord : {};
        const normalizedStatus = data.status === "completed" || data.status === "succeeded" ? "succeeded" : data.status === "failed" ? "failed" : "pending";
        // Also support fetching reason from new DB columns (via casting data if possible, though select list needs update)
        return json({ success: true, status: normalizedStatus, rejectionReason: typeof metadata.rejection_reason === "string" ? metadata.rejection_reason : null });
      }

      const methodValue = body.method ?? body.provider;
      const method = typeof methodValue === "string" && manualMethods.includes(methodValue as ManualMethod) ? methodValue as ManualMethod : null;
      const transactionId = typeof body.transactionId === "string" ? body.transactionId.trim() : "";
      if (!method || transactionId.length < 4 || transactionId.length > 100) return json({ error: "invalid_payment_details", message: "Select a valid method and enter a valid transaction ID." }, 400);

      const orderStatus = String(order.order_status ?? order.status ?? "pending");
      const paymentStatus = String(order.payment_status ?? "unpaid");
      if (orderStatus === "cancelled" || paymentStatus === "paid" || paymentStatus === "refunded") return json({ error: "payment_not_allowed", message: "This order is not eligible for manual payment." }, 409);

      const { data: setting, error: settingError } = await admin.from("payment_method_settings").select("method,enabled").eq("method", method).maybeSingle();
      if (settingError || !setting?.enabled) return json({ error: "method_unavailable", message: "This payment method is currently unavailable." }, 409);

      const { data: existing, error: existingError } = await admin.from("payment_transactions").select("id,order_id,status").eq("provider_transaction_id", transactionId).limit(1).maybeSingle();
      if (existingError) return json({ error: "transaction_lookup_failed", message: "The transaction ID could not be checked." }, 500);
      if (existing) {
        if (existing.order_id === order.id && existing.status === "pending") return json({ success: true, status: "pending", message: "Payment submitted for verification" });
        return json({ error: "duplicate_transaction", message: "This transaction ID has already been submitted." }, 409);
      }

      const { data: pendingSubmission, error: pendingSubmissionError } = await admin
        .from("payment_transactions")
        .select("id")
        .eq("order_id", order.id)
        .in("provider", manualMethods)
        .eq("status", "pending")
        .limit(1)
        .maybeSingle();
      if (pendingSubmissionError) return json({ error: "payment_lookup_failed", message: "The current payment status could not be checked." }, 500);
      if (pendingSubmission) return json({ error: "payment_pending", message: "A manual payment is already pending verification for this order." }, 409);

      const { data: transaction, error: insertError } = await admin.from("payment_transactions").insert({
        order_id: order.id,
        provider: method,
        provider_transaction_id: transactionId,
        amount: order.total,
        currency: order.currency_code,
        status: "pending",
        metadata: { submitted_at: new Date().toISOString() },
      }).select("id").single();
      if (insertError || !transaction) {
        console.error(`[MANUAL_PAYMENT] submit_insert_failed code=${insertError?.code ?? "unknown"}`);
        return json({ error: "payment_record_failed", message: "The payment submission could not be recorded." }, 500);
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
        await admin.from("payment_transactions").update({ status: "failed", metadata: { submitted_at: new Date().toISOString(), system_error: "order_status_update_failed" } }).eq("id", transaction.id);
        return json({ error: "order_update_failed", message: "The order is no longer eligible for this payment submission." }, orderUpdateError ? 500 : 409);
      }
      await notify(admin, "payment_status_pending_customer", String(order.order_number), transaction.id);
      return json({ success: true, status: "pending", message: "Payment submitted for verification" });
    }

    if (action === "approve" || action === "reject" || action === "request_resubmission") {
      const adminAuth = await requireAdmin(req, admin);
      if (adminAuth.response) return adminAuth.response;
      const transactionId = typeof body.transactionId === "string" ? body.transactionId : "";
      if (!transactionId) return json({ error: "invalid_transaction", message: "Transaction ID is required." }, 400);

      const { data: transaction, error: transactionError } = await admin.from("payment_transactions").select("*").eq("id", transactionId).maybeSingle();
      if (transactionError || !transaction) return json({ error: "not_found", message: "Transaction not found." }, 404);
      if (!manualMethods.includes(transaction.provider as ManualMethod)) return json({ error: "invalid_provider", message: "Only manual payments can be reviewed here." }, 400);
      const alreadySucceeded = transaction.status === "succeeded" || transaction.status === "completed";
      if ((action === "approve" && alreadySucceeded) || ((action === "reject" || action === "request_resubmission") && transaction.status === "failed")) return json({ success: true, status: action === "approve" ? "succeeded" : "failed", message: `Payment already ${action === "approve" ? "approved" : "rejected"}.` });
      if (transaction.status !== "pending") return json({ error: "already_processed", message: "Only a pending transaction can be reviewed." }, 409);

      const { data: order, error: orderError } = await admin.from("orders").select("*").eq("id", transaction.order_id).maybeSingle();
      if (orderError || !order) return json({ error: "order_not_found", message: "The related order could not be found." }, 404);
      const currentMetadata = transaction.metadata && typeof transaction.metadata === "object" ? transaction.metadata as JsonRecord : {};

      if (action === "approve") {
        const transactionUpdate = await updateSuccessfulTransaction(admin, transaction.id, currentMetadata, adminAuth.userId!);
        if (transactionUpdate.error || !transactionUpdate.data) return json({ error: "concurrent_update", message: "This payment has already been reviewed." }, 409);
        const { data: paidOrder, error: orderUpdateError } = await admin
          .from("orders")
          .update({ payment_status: "paid", payment_method: transaction.provider, payment_reference: transaction.provider_transaction_id, updated_at: new Date().toISOString() })
          .eq("id", order.id)
          .in("payment_status", ["pending", "unpaid"])
          .neq("order_status", "cancelled")
          .select("id")
          .maybeSingle();
        if (orderUpdateError || !paidOrder) {
          await admin.from("payment_transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null }).eq("id", transaction.id);
          return json({ error: "order_update_failed", message: "The order is no longer eligible to be marked paid." }, orderUpdateError ? 500 : 409);
        }
        await notify(admin, "payment_status_paid_customer", order.order_number, transaction.id);
        return json({ success: true, status: "succeeded", message: "Payment approved successfully." });
      }

      let reasonCode: RejectionReasonCode | null = null;
      let reasonText = "";
      
      if (action === "request_resubmission") {
        reasonCode = "request_resubmission";
        reasonText = typeof body.reasonText === "string" ? body.reasonText.trim() : rejectionReasons["request_resubmission"];
      } else {
        reasonCode = typeof body.reasonCode === "string" && body.reasonCode in rejectionReasons ? body.reasonCode as RejectionReasonCode : null;
        reasonText = typeof body.reasonText === "string" ? body.reasonText.trim() : "";
      }

      if (!reasonCode || ((reasonCode === "other" || action === "request_resubmission") && !reasonText)) return json({ error: "rejection_reason_required", message: "A valid rejection reason is required." }, 400);
      const customerReason = (reasonCode === "other" || action === "request_resubmission") ? reasonText : rejectionReasons[reasonCode];
      
      const { data: rejected, error: rejectError } = await admin.from("payment_transactions").update({ 
        status: "failed", 
        metadata: { ...currentMetadata, rejection_reason: customerReason },
        reviewed_by: adminAuth.userId,
        reviewed_at: new Date().toISOString(),
        review_reason_code: reasonCode,
        review_reason_text: customerReason,
        updated_at: new Date().toISOString() 
      }).eq("id", transaction.id).eq("status", "pending").select("id").maybeSingle();
      
      if (rejectError || !rejected) return json({ error: "concurrent_update", message: "This payment has already been reviewed." }, 409);
      const { data: unpaidOrder, error: orderUpdateError } = await admin
        .from("orders")
        .update({ payment_status: "unpaid", updated_at: new Date().toISOString() })
        .eq("id", order.id)
        .in("payment_status", ["pending", "unpaid"])
        .neq("order_status", "cancelled")
        .select("id")
        .maybeSingle();
      if (orderUpdateError || !unpaidOrder) {
        await admin.from("payment_transactions").update({ status: "pending", reviewed_by: null, reviewed_at: null, review_reason_code: null, review_reason_text: null }).eq("id", transaction.id);
        return json({ error: "order_update_failed", message: "The order payment status could not be reset safely." }, orderUpdateError ? 500 : 409);
      }
      await notify(admin, "payment_status_unpaid_customer", order.order_number, transaction.id, customerReason);
      return json({ success: true, status: "failed", message: "Payment rejected. The order remains available for another payment attempt." });
    }

    return json({ error: "invalid_action", message: "Unsupported manual payment action." }, 400);
  } catch (error: unknown) {
    console.error(`[MANUAL_PAYMENT] unhandled_error message=${messageFrom(error)}`);
    return json({ error: "server_error", message: "The payment service could not process the request." }, 500);
  }
}

export default { fetch: handler };
