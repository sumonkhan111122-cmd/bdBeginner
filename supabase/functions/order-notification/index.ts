import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";
import nodemailer from "npm:nodemailer@6.9.14";
import { Buffer } from "node:buffer";
import {
  getReviewSubmittedAdminHtml,
  getReviewApprovedCustomerHtml,
  getReviewRejectedCustomerHtml,
  type ReviewEmailData,
} from "./emailTemplates.ts";
import { generateInvoicePdf, INVOICE_TEMPLATE_VERSION } from "./pdfGenerator.ts";
import {
  buildTransactionalEmail,
  EMAIL_TEMPLATE_VERSION,
  normalizeTransactionalEvent,
} from "./transactionalEmails.ts";

const absoluteHttpsUrl = (value: string | null | undefined, base: string, fallbackPath: string) => {
  try {
    const url = new URL(value || fallbackPath, base);
    if (url.protocol === "https:") return url.toString();
  } catch {
    // Use the known public fallback below.
  }
  return new URL(fallbackPath, "https://bdbeginner.com").toString();
};

const optionalAbsoluteHttpsUrl = (value: string | null | undefined, base: string) => {
  if (!value) return null;
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const errorReason = (error: unknown) => error instanceof Error ? error.constructor.name : "UnknownError";

type NotificationPayload = {
  event_type?: unknown;
  event_id?: unknown;
  order_id?: unknown;
  order_number?: unknown;
  access_token?: unknown;
  reason?: unknown;
  review_id?: unknown;
  transaction_id?: unknown;
  method?: unknown;
};

type OrderRecord = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  total: number;
  subtotal: number;
  discount_total: number;
  currency_code: string;
  order_status?: string | null;
  status?: string | null;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  payment_method?: string | null;
  payment_reference?: string | null;
  invoice_number?: string | null;
  order_items: Array<Record<string, unknown>>;
};

const notificationMatchesOrderState = (
  canonicalEvent: ReturnType<typeof normalizeTransactionalEvent>,
  sourceEvent: string,
  order: OrderRecord,
) => {
  if (!canonicalEvent) return false;
  if (canonicalEvent === "manual_payment_submitted") return order.payment_status === "pending";
  if (canonicalEvent === "payment_confirmed") return order.payment_status === "paid";
  if (canonicalEvent === "payment_rejected") return order.payment_status === "unpaid" || order.payment_status === "failed";
  if (canonicalEvent === "product_ready") return order.fulfillment_status === "fulfilled";
  if (canonicalEvent === "refund_confirmation") return order.payment_status === "refunded";
  if (canonicalEvent === "order_status_update") {
    const match = /^order_status_([a-z_]+)_customer$/.exec(sourceEvent);
    return Boolean(match && (order.order_status || order.status) === match[1]);
  }
  if (canonicalEvent === "fulfillment_status_update") {
    const match = /^fulfillment_status_([a-z_]+)_customer$/.exec(sourceEvent);
    return Boolean(match && order.fulfillment_status === match[1]);
  }
  return true;
};

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const payload = await req.json() as NotificationPayload;
    const event_type = typeof payload.event_type === "string" ? payload.event_type : "";
    const event_id = typeof payload.event_id === "string" ? payload.event_id : undefined;
    const order_id = typeof payload.order_id === "string" ? payload.order_id : undefined;
    const order_number = typeof payload.order_number === "string" ? payload.order_number : undefined;
    const access_token = typeof payload.access_token === "string" ? payload.access_token : undefined;
    const reason = typeof payload.reason === "string" ? payload.reason : undefined;
    const review_id = typeof payload.review_id === "string" ? payload.review_id : undefined;
    const transaction_id = typeof payload.transaction_id === "string" ? payload.transaction_id : undefined;
    const method = typeof payload.method === "string" ? payload.method : undefined;
    const canonicalEvent = normalizeTransactionalEvent(event_type);

    if (!event_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!order_id && !order_number && !review_id && event_type !== "smtp_test") {
      return new Response(
        JSON.stringify({ error: "Missing resource identifier" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Config Check
    const requiredEnv = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_USER",
      "SMTP_PASS",
      "SMTP_FROM_EMAIL",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];
    for (const envVar of requiredEnv) {
      if (!Deno.env.get(envVar)) {
        console.error(`Missing server configuration: ${envVar}`);
        return new Response(
          JSON.stringify({ error: "configuration_error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
    const isInternalService = !!bearer && bearer === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (isInternalService) {
      isAdmin = true;
    } else if (bearer) {
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
    let order: OrderRecord | null = null;
    if (order_id || order_number) {
      const orderQuery = order_id
        ? supabase.from("orders").select("*, order_items(*)").eq("id", order_id).maybeSingle()
        : supabase.from("orders").select("*, order_items(*)").eq("order_number", order_number).maybeSingle();
      const { data: o } = await orderQuery;
      order = o as OrderRecord | null;
    }

    let review: (ReviewEmailData & { status?: string | null }) | null = null;
    if (review_id) {
      const { data: rev, error: revError } = await supabase
        .from('product_reviews')
        .select('*, product:products(name, slug), user:customer_profiles(email)')
        .eq('id', review_id)
        .maybeSingle();
      if (revError || !rev) {
        return new Response(
          JSON.stringify({ error: "Review not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      review = rev as (ReviewEmailData & { status?: string | null });
    }

    if (!order && !review && event_type !== "smtp_test") {
      return new Response(
        JSON.stringify({ error: "Resource not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const effectiveOrderId = order?.id || null;

    // Validate access based on user type
    if (review) {
      const canSendSubmittedNotice = event_type === "review_submitted_admin" && callerUserId === review.user_id;
      if (!isAdmin && !isInternalService && !canSendSubmittedNotice) {
        return new Response(
          JSON.stringify({ error: "Unauthorized access to review" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const expectedReviewStatus = event_type === "review_submitted_admin"
        ? "pending"
        : event_type === "review_approved_customer"
          ? "approved"
          : event_type === "review_rejected_customer"
            ? "rejected"
            : null;
      if (!expectedReviewStatus || review.status !== expectedReviewStatus) {
        return new Response(
          JSON.stringify({ error: "notification_state_mismatch" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    } else if (isAdmin || isInternalService) {
      // Admins can trigger notifications for any order
    } else if (callerUserId) {
      // Authenticated customer must own the order
      if (order && order.user_id !== callerUserId) {
        return new Response(
          JSON.stringify({ error: "Unauthorized access to order" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      // Guest must provide a valid access token
      if (order && !review_id) {
        const { data: receipt, error: receiptError } = await supabase.rpc("get_order_receipt", {
          p_order_number: order.order_number,
          p_access_token: access_token,
        });
        if (receiptError || !receipt) {
          return new Response(
            JSON.stringify({ error: "Invalid guest access token" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    if (canonicalEvent === "account_activation" && !isAdmin && !isInternalService) {
      return new Response(
        JSON.stringify({ error: "Privileged notification" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (canonicalEvent && order && !notificationMatchesOrderState(canonicalEvent, event_type, order)) {
      return new Response(
        JSON.stringify({ error: "notification_state_mismatch" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const safeEventId = (isAdmin || isInternalService) && event_id && /^[a-zA-Z0-9-]{1,64}$/.test(event_id)
      ? event_id
      : undefined;

    const configuredSiteUrl = Deno.env.get("SITE_URL") || "https://bdbeginner.com";
    const siteUrl = absoluteHttpsUrl(configuredSiteUrl, "https://bdbeginner.com", "/").replace(/\/$/, "");

    // Fetch site settings and normalize assets for email clients.
    const { data: siteData } = await supabase.from("site_settings").select("site_name,logo_url,support_email").eq("id", 1).maybeSingle();
    const siteSettings = {
      site_name: siteData?.site_name || "bdBeginner",
      logo_url: optionalAbsoluteHttpsUrl(siteData?.logo_url, siteUrl),
      support_email: siteData?.support_email || "support@bdbeginner.com"
    };

    const orderDataForTemplate = order ? {
      order_number: order.order_number,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total: order.total,
      subtotal: order.subtotal,
      discount_total: order.discount_total,
      currency_code: order.currency_code,
      order_status: order.order_status || order.status || 'pending',
      payment_status: order.payment_status,
      created_at: order.created_at,
      payment_method: order.payment_method,
      payment_reference: order.payment_reference,
      items: order.order_items.map((item: Record<string, unknown>) => ({
        product_name: item.product_name_snapshot || item.product_name || "Product",
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
      })),
      invoice_number: order.invoice_number,
    } : null;

    let recipientEmail = "";
    let subject = "";
    let htmlBody = "";
    let textBody = "";
    let activationLink: string | null = null;
    let attachmentBuffer: Uint8Array | null = null;
    let attachmentFilename = "";
    let templateName = "";
    let canonicalEventName = event_type;

    if (canonicalEvent && order && orderDataForTemplate) {
      canonicalEventName = canonicalEvent;

      if (canonicalEvent === "order_received" && !order.user_id) {
        const { data: profile } = await supabase.from("customer_profiles").select("user_id").eq("email", order.customer_email).maybeSingle();
        if (profile?.user_id) {
          await supabase.from("orders").update({ user_id: profile.user_id }).eq("id", order.id);
        } else {
          const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
            type: "invite",
            email: order.customer_email,
            options: { redirectTo: `${siteUrl}/account/set-password` },
          });
          if (!linkError && linkData?.user) {
            await supabase.from("orders").update({ user_id: linkData.user.id }).eq("id", order.id);
            activationLink = linkData.properties.action_link;
          } else {
            console.error(`[EMAIL] event=account_activation link-generation-failed reason=${errorReason(linkError)}`);
          }
        }
      }

      let actionLink: string | undefined;
      if (canonicalEvent === "account_activation") {
        const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: order.customer_email,
          options: { redirectTo: `${siteUrl}/account/set-password` },
        });
        if (linkError || !linkData) {
          return new Response(JSON.stringify({ error: "activation_link_failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        actionLink = linkData.properties.action_link;
      }

      let transactionMethod = typeof method === "string" ? method : order.payment_method || undefined;
      let transactionReference = typeof transaction_id === "string" ? transaction_id : order.payment_reference || undefined;
      let rejectionReason = typeof reason === "string" ? reason : undefined;

      if (safeEventId) {
        const { data: paymentTransaction, error: transactionError } = await supabase
          .from("payment_transactions")
          .select("provider,provider_transaction_id,metadata")
          .eq("id", safeEventId)
          .eq("order_id", order.id)
          .maybeSingle();
        if (transactionError) {
          console.error(`[EMAIL] event=${canonicalEvent} transaction-load-failed code=${transactionError.code || "unknown"}`);
        } else if (paymentTransaction) {
          const metadata = paymentTransaction.metadata && typeof paymentTransaction.metadata === "object"
            ? paymentTransaction.metadata as Record<string, unknown>
            : {};
          transactionMethod = transactionMethod || paymentTransaction.provider;
          transactionReference = transactionReference
            || (typeof metadata.trx_id === "string" ? metadata.trx_id : undefined)
            || paymentTransaction.provider_transaction_id;
          rejectionReason = rejectionReason
            || (typeof metadata.rejection_reason === "string" ? metadata.rejection_reason : undefined);
        }
      }

      if (canonicalEvent === "payment_confirmed" && !orderDataForTemplate.invoice_number) {
        const generatedInvoiceNumber = `INV-${order.order_number}`;
        const { error: invoiceUpdateError } = await supabase
          .from("orders")
          .update({ invoice_number: generatedInvoiceNumber, invoice_issued_at: new Date().toISOString() })
          .eq("id", order.id);
        if (invoiceUpdateError) console.error(`[INVOICE] number-save-failed code=${invoiceUpdateError.code || "unknown"}`);
        orderDataForTemplate.invoice_number = generatedInvoiceNumber;
      }

      recipientEmail = canonicalEvent === "order_created_admin"
        ? Deno.env.get("ADMIN_ORDER_EMAIL") || siteSettings.support_email
        : order.customer_email;
      if (!recipientEmail) {
        return new Response(JSON.stringify({ error: "recipient_not_configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const builtEmail = buildTransactionalEmail({
        eventType: canonicalEvent,
        sourceEventType: event_type,
        order: orderDataForTemplate,
        site: siteSettings,
        siteUrl,
        transactionId: transactionReference,
        method: transactionMethod,
        reason: rejectionReason,
        actionLink,
      });
      subject = builtEmail.subject;
      htmlBody = builtEmail.html;
      textBody = builtEmail.text;
      templateName = builtEmail.templateName;

      if (builtEmail.pdfType) {
        const plannedFilename = builtEmail.pdfType === "PAID_INVOICE"
          ? `bdBeginner-Invoice-${orderDataForTemplate.invoice_number || `INV-${order.order_number}`}.pdf`
          : `bdBeginner-Order-${order.order_number}.pdf`;
        console.log(`[INVOICE] generation-start type=${builtEmail.pdfType} templateVersion=${INVOICE_TEMPLATE_VERSION}`);
        try {
          const pdfBytes = await generateInvoicePdf(orderDataForTemplate, siteSettings, builtEmail.pdfType);
          attachmentBuffer = pdfBytes;
          attachmentFilename = plannedFilename;
          console.log(`[INVOICE] generation-success bytes=${pdfBytes.byteLength} templateVersion=${INVOICE_TEMPLATE_VERSION}`);
        } catch (pdfError: unknown) {
          console.error(`[INVOICE] generation-failed reason=${errorReason(pdfError)}`);
        }
      }

    } else if (event_type === "smtp_test" && (isAdmin || isInternalService)) {
      recipientEmail = Deno.env.get("ADMIN_ORDER_EMAIL") || siteSettings.support_email;
      subject = "bdBeginner SMTP Test";
      htmlBody = `<!doctype html><html><body style="font-family:Arial,sans-serif"><p>bdBeginner SMTP configuration is working correctly.</p><!-- templateVersion=${EMAIL_TEMPLATE_VERSION} --></body></html>`;
      textBody = "SMTP configuration is working correctly.";
      templateName = "smtp_test_v2";

    } else if (event_type === "review_submitted_admin" && review) {
      recipientEmail = Deno.env.get("ADMIN_ORDER_EMAIL") || siteSettings.support_email;
      subject = "New Product Review Submitted";
      htmlBody = getReviewSubmittedAdminHtml(review, siteSettings, siteUrl);
      textBody = `New review submitted for ${review.product?.name} by ${review.author_name}.`;
      templateName = "branded_review_submitted_v2";

    } else if (event_type === "review_approved_customer" && review) {
      recipientEmail = review.user?.email;
      if (!recipientEmail) throw new Error("No customer email found");
      subject = "Your review is now live!";
      htmlBody = getReviewApprovedCustomerHtml(review, siteSettings, siteUrl);
      textBody = `Your review for ${review.product?.name} has been published.`;
      templateName = "branded_review_approved_v2";

    } else if (event_type === "review_rejected_customer" && review) {
      recipientEmail = review.user?.email;
      if (!recipientEmail) throw new Error("No customer email found");
      subject = "Update needed on your review";
      htmlBody = getReviewRejectedCustomerHtml(review, siteSettings);
      textBody = `Your review for ${review.product?.name} needs an update.`;
      templateName = "branded_review_rejected_v2";
      
    } else {
      return new Response(JSON.stringify({ error: "Invalid event_type or missing payload" }), { status: 400, headers: corsHeaders });
    }

    console.log(`[EMAIL] event=${canonicalEventName}`);
    console.log(`[EMAIL] template=${templateName} templateVersion=${EMAIL_TEMPLATE_VERSION}`);
    console.log(`[EMAIL] pdf=${Boolean(attachmentBuffer)} sender=${canonicalEventName === "account_activation" ? "auth" : "orders"}`);

    // Deduplication logic
    const eventLogKey = safeEventId
      ? `${canonicalEventName}:${safeEventId.slice(0, 24)}`
      : canonicalEventName;
      
    let query = supabase
      .from("order_email_log")
      .select("id")
      .eq("event_type", eventLogKey)
      .eq("recipient_email", recipientEmail)
      .eq("status", "sent");
      
    if (effectiveOrderId) {
      query = query.eq("order_id", effectiveOrderId);
    } else if (review_id) {
      query = query.eq("order_id", review_id); // reuse column
    }

    const { data: existingLog } = await query.maybeSingle();

    if (existingLog) {
      console.log(`[EMAIL] send-skip reason=already_sent templateVersion=${EMAIL_TEMPLATE_VERSION}`);
      return new Response(
        JSON.stringify({ status: "already_sent", templateVersion: EMAIL_TEMPLATE_VERSION, template: templateName }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Transport configuration
    const smtpPort = Number(Deno.env.get("SMTP_PORT"));
    const transporter = nodemailer.createTransport({
      host: Deno.env.get("SMTP_HOST"),
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      connectionTimeout: 15_000,
      greetingTimeout: 15_000,
      socketTimeout: 30_000,
      auth: {
        user: Deno.env.get("SMTP_USER"),
        pass: Deno.env.get("SMTP_PASS"),
      },
    });

    const ordersFromAddress = `"${Deno.env.get("SMTP_FROM_NAME") || "bdBeginner"}" <${Deno.env.get("SMTP_FROM_EMAIL")}>`;
    const authFromAddress = `"${Deno.env.get("AUTH_SMTP_FROM_NAME") || "bdBeginner"}" <${Deno.env.get("AUTH_SMTP_FROM_EMAIL") || "no-reply@bdbeginner.com"}>`;
    const fromAddress = canonicalEventName === "account_activation" ? authFromAddress : ordersFromAddress;

    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
      ...(attachmentBuffer && attachmentFilename ? {
        attachments: [{
          filename: attachmentFilename,
          content: Buffer.from(attachmentBuffer),
          contentType: "application/pdf",
        }],
      } : {}),
    };

    try {
      console.log(`[EMAIL] send-start event=${canonicalEventName} templateVersion=${EMAIL_TEMPLATE_VERSION}`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL] send-success event=${canonicalEventName} templateVersion=${EMAIL_TEMPLATE_VERSION}`);

      // Log success
      await supabase.from("order_email_log").insert({
        order_id: effectiveOrderId || review_id,
        event_type: eventLogKey,
        recipient_email: recipientEmail,
        provider: "cpanel_smtp",
        provider_message_id: info.messageId,
        status: "sent",
        attachment: attachmentFilename || null,
        error_message: null,
      });

      // If we generated an activation link during order creation, send the activation email now
      if (activationLink && order && orderDataForTemplate) {
        const activationEmail = buildTransactionalEmail({
          eventType: "account_activation",
          order: orderDataForTemplate,
          site: siteSettings,
          siteUrl,
          actionLink: activationLink,
        });
        try {
          console.log(`[EMAIL] send-start event=account_activation templateVersion=${EMAIL_TEMPLATE_VERSION}`);
          const actInfo = await transporter.sendMail({
            from: authFromAddress,
            to: recipientEmail,
            subject: activationEmail.subject,
            text: activationEmail.text,
            html: activationEmail.html,
          });
          console.log(`[EMAIL] send-success event=account_activation templateVersion=${EMAIL_TEMPLATE_VERSION}`);
          await supabase.from("order_email_log").insert({
            order_id: effectiveOrderId,
            event_type: "account_activation",
            recipient_email: recipientEmail,
            provider: "cpanel_smtp",
            provider_message_id: actInfo.messageId,
            status: "sent",
            error_message: null,
          });
        } catch (actError: unknown) {
          console.error(`[EMAIL] send-failed event=account_activation reason=${errorReason(actError)}`);
          await supabase.from("order_email_log").insert({
            order_id: effectiveOrderId,
            event_type: "account_activation",
            recipient_email: recipientEmail,
            provider: "cpanel_smtp",
            status: "failed",
            error_message: actError instanceof Error ? actError.message.substring(0, 500) : "Unknown error",
          });
        }
      }

      return new Response(
        JSON.stringify({
          status: "success",
          templateVersion: EMAIL_TEMPLATE_VERSION,
          template: templateName,
          attachment: attachmentFilename || null,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (sendError: unknown) {
      console.error(`[EMAIL] send-failed event=${canonicalEventName} reason=${errorReason(sendError)}`);
      // Log failure
      await supabase.from("order_email_log").insert({
        order_id: effectiveOrderId,
        event_type: eventLogKey,
        recipient_email: recipientEmail,
        provider: "cpanel_smtp",
        status: "failed",
        attachment: attachmentFilename || null,
        error_message: sendError instanceof Error ? sendError.message.substring(0, 500) : "Unknown error",
      });

      return new Response(
        JSON.stringify({ status: "failed", error: "email_delivery_failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: unknown) {
    console.error(`[ORDER_NOTIFICATION] errorClass=${error instanceof Error ? error.constructor.name : "UnknownError"}`);
    return new Response(
      JSON.stringify({ error: "internal_server_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

export default { fetch: handler };
