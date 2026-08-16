import { createClient } from "npm:@supabase/supabase-js@2.95.0";
import { corsHeaders } from "../_shared/cors.ts";

// ── Helpers ──────────────────────────────────────────────────

function jsonResponse(
  body: Record<string, unknown>,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getEncryptionKey(): Uint8Array {
  const b64 = Deno.env.get("DELIVERY_ENCRYPTION_KEY");
  if (!b64) throw new Error("DELIVERY_ENCRYPTION_KEY not configured");
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  if (raw.length !== 32)
    throw new Error("DELIVERY_ENCRYPTION_KEY must be 32 bytes");
  return raw;
}

function getPayloadVersion(): number {
  return parseInt(Deno.env.get("DELIVERY_ENCRYPTION_VERSION") || "1", 10);
}

async function encrypt(
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> {
  const keyBytes = getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const encoded = new TextEncoder().encode(plaintext);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decrypt(cipherB64: string, ivB64: string): Promise<string> {
  const keyBytes = getEncryptionKey();
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}

async function sha256Hex(text: string): Promise<string> {
  const encoded = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function maskKey(key: string): string {
  const trimmed = key.trim();
  if (trimmed.length <= 4) return "****";
  const last4 = trimmed.slice(-4);
  const prefix = trimmed.slice(0, -4).replace(/[A-Za-z0-9]/g, "*");
  return prefix + last4;
}

// ── Auth ─────────────────────────────────────────────────────

interface AuthResult {
  userId: string | null;
  isAdmin: boolean;
}

async function resolveAuth(
  req: Request,
  supabase: ReturnType<typeof createClient>
): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return { userId: null, isAdmin: false };

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return { userId: null, isAdmin: false };

  const { data: adminData } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  return { userId: user.id, isAdmin: !!adminData };
}

async function authorizeOrder(
  supabase: ReturnType<typeof createClient>,
  auth: AuthResult,
  body: Record<string, unknown>
): Promise<{ order: Record<string, unknown> | null; error: Response | null }> {
  const { orderId, orderNumber, accessToken } = body as Record<string, string>;

  if (accessToken && orderNumber) {
    // Guest
    const { data: receipt, error: receiptError } = await supabase.rpc(
      "get_order_receipt",
      { p_order_number: orderNumber, p_access_token: accessToken }
    );
    if (receiptError || !receipt) {
      return { order: null, error: jsonResponse({ error: "unauthorized" }, 403) };
    }
    // Fetch the actual order row
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("order_number", orderNumber)
      .single();
    if (!order) {
      return { order: null, error: jsonResponse({ error: "not_found" }, 404) };
    }
    return { order, error: null };
  }

  if (orderId && auth.userId) {
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();
    if (!order) {
      return { order: null, error: jsonResponse({ error: "not_found" }, 404) };
    }
    if (order.user_id !== auth.userId) {
      return { order: null, error: jsonResponse({ error: "unauthorized" }, 403) };
    }
    return { order, error: null };
  }

  return { order: null, error: jsonResponse({ error: "unauthorized" }, 401) };
}

// ── Actions ──────────────────────────────────────────────────

async function adminEncryptLicenses(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>
): Promise<Response> {
  const productId = body.productId as string;
  const keys = body.keys as string[];
  if (!productId || !Array.isArray(keys) || keys.length === 0) {
    return jsonResponse({ error: "Missing productId or keys" }, 400);
  }

  const version = getPayloadVersion();
  const results: { masked_key: string; status: string }[] = [];
  const duplicates: string[] = [];

  for (const rawKey of keys) {
    const trimmed = rawKey.trim();
    if (!trimmed) continue;

    const normalized = trimmed.toLowerCase();
    const fingerprint = await sha256Hex(normalized);

    // Check for duplicate
    const { data: existing } = await supabase
      .from("license_inventory")
      .select("id")
      .eq("product_id", productId)
      .eq("key_fingerprint", fingerprint)
      .maybeSingle();

    if (existing) {
      duplicates.push(maskKey(trimmed));
      continue;
    }

    const { ciphertext, iv } = await encrypt(trimmed);
    const masked = maskKey(trimmed);

    const { error: insertError } = await supabase
      .from("license_inventory")
      .insert({
        product_id: productId,
        encrypted_key: ciphertext,
        key_iv: iv,
        key_fingerprint: fingerprint,
        masked_key: masked,
        payload_version: version,
        status: "available",
      });

    if (insertError) {
      console.error("Insert license error:", insertError.message);
      continue;
    }
    results.push({ masked_key: masked, status: "available" });
  }

  return jsonResponse({
    success: true,
    added: results.length,
    duplicates: duplicates.length,
    duplicate_keys: duplicates,
  });
}

async function adminDecryptLicense(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>
): Promise<Response> {
  const inventoryId = body.inventoryId as string;
  if (!inventoryId) return jsonResponse({ error: "Missing inventoryId" }, 400);

  const { data: row } = await supabase
    .from("license_inventory")
    .select("encrypted_key, key_iv")
    .eq("id", inventoryId)
    .single();

  if (!row) return jsonResponse({ error: "not_found" }, 404);

  const plaintext = await decrypt(row.encrypted_key, row.key_iv);
  return jsonResponse({ success: true, key: plaintext });
}

async function adminListInventory(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>
): Promise<Response> {
  const productId = body.productId as string;
  if (!productId) return jsonResponse({ error: "Missing productId" }, 400);

  const { data: items, error } = await supabase
    .from("license_inventory")
    .select("id, masked_key, status, assigned_order_item_id, assigned_at, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: true });

  if (error) return jsonResponse({ error: "Failed to fetch inventory" }, 500);

  const available = (items || []).filter((i: Record<string, unknown>) => i.status === "available").length;
  const assigned = (items || []).filter((i: Record<string, unknown>) => i.status === "assigned").length;
  const revoked = (items || []).filter((i: Record<string, unknown>) => i.status === "revoked").length;

  return jsonResponse({
    items: items || [],
    counts: { available, assigned, revoked, total: (items || []).length },
  });
}

async function adminSaveFulfillment(
  supabase: ReturnType<typeof createClient>,
  auth: AuthResult,
  body: Record<string, unknown>
): Promise<Response> {
  const fulfillmentId = body.fulfillmentId as string;
  const deliveryType = body.deliveryType as string;
  const newStatus = body.newStatus as string | undefined;
  const publicMessage = body.publicMessage as string | undefined;
  const expiresAt = body.expiresAt as string | undefined;
  const payload = body.payload as Record<string, unknown> | undefined;

  if (!fulfillmentId) return jsonResponse({ error: "Missing fulfillmentId" }, 400);

  const { data: existing } = await supabase
    .from("order_item_fulfillments")
    .select("id, fulfillment_status, delivery_type")
    .eq("id", fulfillmentId)
    .single();

  if (!existing) return jsonResponse({ error: "not_found" }, 404);

  const updates: Record<string, unknown> = {};

  // Encrypt sensitive payload for subscription / manual_delivery
  if (
    payload &&
    (deliveryType === "subscription" || deliveryType === "manual_delivery")
  ) {
    const jsonPayload = JSON.stringify(payload);
    const { ciphertext, iv } = await encrypt(jsonPayload);
    updates.encrypted_payload = ciphertext;
    updates.payload_iv = iv;
    updates.payload_version = getPayloadVersion();
  }

  if (publicMessage !== undefined) {
    updates.public_message = publicMessage;
  }

  if (expiresAt !== undefined) {
    updates.expires_at = expiresAt || null;
  }

  if (newStatus && newStatus !== existing.fulfillment_status) {
    updates.fulfillment_status = newStatus;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updateError } = await supabase
      .from("order_item_fulfillments")
      .update(updates)
      .eq("id", fulfillmentId);

    if (updateError) return jsonResponse({ error: "update_failed" }, 500);

    // Log event
    if (updates.fulfillment_status) {
      await supabase.from("fulfillment_events").insert({
        fulfillment_id: fulfillmentId,
        event_type: "status_change",
        actor_id: auth.userId,
        details: `Status changed to ${updates.fulfillment_status}`,
      });
    }
    if (updates.encrypted_payload) {
      await supabase.from("fulfillment_events").insert({
        fulfillment_id: fulfillmentId,
        event_type: "payload_updated",
        actor_id: auth.userId,
        details: "Delivery payload updated",
      });
    }
  }

  return jsonResponse({ success: true });
}

async function adminSyncPending(
  supabase: ReturnType<typeof createClient>,
  body: Record<string, unknown>
): Promise<Response> {
  const orderId = body.orderId as string;
  const productId = body.productId as string;

  if (orderId) {
    await supabase.rpc("sync_paid_order_fulfillments", {
      p_order_id: orderId,
    });
    return jsonResponse({ success: true, synced: "order" });
  }

  if (productId) {
    // Find all pending fulfillments for this product's license_key orders
    const { data: pendingFulfillments } = await supabase
      .from("order_item_fulfillments")
      .select("order_id, order_item_id, delivery_type")
      .eq("delivery_type", "license_key")
      .eq("fulfillment_status", "pending");

    if (pendingFulfillments && pendingFulfillments.length > 0) {
      // Get unique order_item_ids
      const orderItemIds = pendingFulfillments.map(
        (f: Record<string, unknown>) => f.order_item_id
      );

      // Check which order items belong to this product
      const { data: matchingItems } = await supabase
        .from("order_items")
        .select("id, order_id")
        .in("id", orderItemIds)
        .eq("product_id", productId);

      if (matchingItems) {
        const uniqueOrderIds = [
          ...new Set(matchingItems.map((i: Record<string, unknown>) => i.order_id)),
        ];
        for (const oid of uniqueOrderIds) {
          await supabase.rpc("sync_paid_order_fulfillments", {
            p_order_id: oid,
          });
        }
        return jsonResponse({
          success: true,
          synced: "product_orders",
          count: uniqueOrderIds.length,
        });
      }
    }
    return jsonResponse({ success: true, synced: "none", count: 0 });
  }

  return jsonResponse({ error: "Missing orderId or productId" }, 400);
}

async function customerListFulfillments(
  supabase: ReturnType<typeof createClient>,
  order: Record<string, unknown>
): Promise<Response> {
  const orderId = order.id as string;

  const { data: fulfillments } = await supabase
    .from("order_item_fulfillments")
    .select(
      "id, order_item_id, delivery_type, fulfillment_status, public_message, expires_at, created_at, updated_at"
    )
    .eq("order_id", orderId)
    .order("created_at");

  return jsonResponse({ fulfillments: fulfillments || [] });
}

async function customerReveal(
  supabase: ReturnType<typeof createClient>,
  order: Record<string, unknown>,
  body: Record<string, unknown>
): Promise<Response> {
  const fulfillmentId = body.fulfillmentId as string;
  if (!fulfillmentId) return jsonResponse({ error: "Missing fulfillmentId" }, 400);

  // Verify payment
  if (order.payment_status !== "paid") {
    return jsonResponse({ error: "payment_required" }, 402);
  }

  // Fetch fulfillment
  const { data: fulfillment } = await supabase
    .from("order_item_fulfillments")
    .select("*")
    .eq("id", fulfillmentId)
    .eq("order_id", order.id as string)
    .single();

  if (!fulfillment) {
    return jsonResponse({ error: "not_found" }, 404);
  }

  // Check revoked
  if (fulfillment.fulfillment_status === "revoked") {
    return jsonResponse({ error: "revoked" }, 403);
  }

  // Check expired
  if (fulfillment.expires_at) {
    const expiresAt = new Date(fulfillment.expires_at);
    if (expiresAt < new Date()) {
      return jsonResponse({ error: "expired" }, 403);
    }
  }

  // Check status allows reveal
  const revealableStatuses = ["ready", "processing", "completed"];
  if (!revealableStatuses.includes(fulfillment.fulfillment_status)) {
    return jsonResponse({
      error: "pending",
      message: "Your delivery is being prepared.",
    }, 200);
  }

  const deliveryType = fulfillment.delivery_type;

  // License key: return assigned keys
  if (deliveryType === "license_key") {
    const { data: licenses } = await supabase
      .from("license_inventory")
      .select("id, encrypted_key, key_iv")
      .eq("assigned_order_item_id", fulfillment.order_item_id)
      .eq("status", "assigned")
      .order("assigned_at");

    if (!licenses || licenses.length === 0) {
      return jsonResponse({
        error: "pending",
        message: "License delivery pending. Our team is preparing your license.",
      }, 200);
    }

    const decrypted: string[] = [];
    for (const lic of licenses) {
      const plain = await decrypt(
        lic.encrypted_key as string,
        lic.key_iv as string
      );
      decrypted.push(plain);
    }

    return jsonResponse({
      success: true,
      delivery_type: "license_key",
      keys: decrypted,
    });
  }

  // Subscription / manual_delivery: decrypt payload
  if (
    deliveryType === "subscription" ||
    deliveryType === "manual_delivery"
  ) {
    if (!fulfillment.encrypted_payload || !fulfillment.payload_iv) {
      return jsonResponse({
        error: "pending",
        message: "Your delivery is being prepared.",
      }, 200);
    }

    const decrypted = await decrypt(
      fulfillment.encrypted_payload,
      fulfillment.payload_iv
    );
    const payload = JSON.parse(decrypted);

    return jsonResponse({
      success: true,
      delivery_type: deliveryType,
      payload,
    });
  }

  // Service: return public message + status
  if (deliveryType === "service") {
    return jsonResponse({
      success: true,
      delivery_type: "service",
      status: fulfillment.fulfillment_status,
      public_message: fulfillment.public_message || null,
    });
  }

  return jsonResponse({ error: "unsupported_delivery_type" }, 400);
}

// ── Main Handler ─────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!supabaseUrl || !supabaseServiceKey) {
      return jsonResponse({ error: "configuration_error" }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const auth = await resolveAuth(req, supabase);
    const body = await req.json();
    const action = body.action as string;

    // ── Admin actions ──
    if (
      [
        "admin_encrypt_licenses",
        "admin_decrypt_license",
        "admin_list_inventory",
        "admin_save_fulfillment",
        "admin_sync_pending",
      ].includes(action)
    ) {
      if (!auth.isAdmin) {
        return jsonResponse({ error: "unauthorized" }, 403);
      }

      switch (action) {
        case "admin_encrypt_licenses":
          return await adminEncryptLicenses(supabase, body);
        case "admin_decrypt_license":
          return await adminDecryptLicense(supabase, body);
        case "admin_list_inventory":
          return await adminListInventory(supabase, body);
        case "admin_save_fulfillment":
          return await adminSaveFulfillment(supabase, auth, body);
        case "admin_sync_pending":
          return await adminSyncPending(supabase, body);
      }
    }

    // ── Customer / Guest actions ──
    if (["customer_list_fulfillments", "customer_reveal"].includes(action)) {
      const { order, error: authError } = await authorizeOrder(
        supabase,
        auth,
        body
      );
      if (authError) return authError;
      if (!order) return jsonResponse({ error: "not_found" }, 404);

      switch (action) {
        case "customer_list_fulfillments":
          return await customerListFulfillments(supabase, order);
        case "customer_reveal":
          return await customerReveal(supabase, order, body);
      }
    }

    return jsonResponse({ error: "invalid_action" }, 400);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("secure-fulfillment error:", message);
    return jsonResponse({ error: "internal_server_error" }, 500);
  }
});
