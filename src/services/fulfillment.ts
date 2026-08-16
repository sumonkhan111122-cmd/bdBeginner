import { getSupabase } from '@/lib/supabase';
import type {
  FulfillmentRow,
  FulfillmentEventRow,
  LicenseInventoryMasked,
  LicenseInventoryCounts,
  RevealResult,
} from '@/types/orders';

// ── Helper ───────────────────────────────────────────────────

async function invokeFulfillment(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke('secure-fulfillment', { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error as string);
  return data as Record<string, unknown>;
}

// ── Customer / Guest ─────────────────────────────────────────

export async function listFulfillmentsAuth(orderId: string): Promise<FulfillmentRow[]> {
  const data = await invokeFulfillment({ action: 'customer_list_fulfillments', orderId });
  return (data.fulfillments || []) as FulfillmentRow[];
}

export async function listFulfillmentsGuest(
  orderNumber: string,
  accessToken: string
): Promise<FulfillmentRow[]> {
  const data = await invokeFulfillment({
    action: 'customer_list_fulfillments',
    orderNumber,
    accessToken,
  });
  return (data.fulfillments || []) as FulfillmentRow[];
}

export async function revealFulfillmentAuth(
  orderId: string,
  fulfillmentId: string
): Promise<RevealResult> {
  const data = await invokeFulfillment({
    action: 'customer_reveal',
    orderId,
    fulfillmentId,
  });
  return data as RevealResult;
}

export async function revealFulfillmentGuest(
  orderNumber: string,
  accessToken: string,
  fulfillmentId: string
): Promise<RevealResult> {
  const data = await invokeFulfillment({
    action: 'customer_reveal',
    orderNumber,
    accessToken,
    fulfillmentId,
  });
  return data as RevealResult;
}

// ── Admin ────────────────────────────────────────────────────

export async function adminListInventory(
  productId: string
): Promise<{ items: LicenseInventoryMasked[]; counts: LicenseInventoryCounts }> {
  const data = await invokeFulfillment({ action: 'admin_list_inventory', productId });
  return {
    items: (data.items || []) as LicenseInventoryMasked[],
    counts: data.counts as LicenseInventoryCounts,
  };
}

export async function adminEncryptLicenses(
  productId: string,
  keys: string[]
): Promise<{ added: number; duplicates: number; duplicate_keys: string[] }> {
  const data = await invokeFulfillment({ action: 'admin_encrypt_licenses', productId, keys });
  return {
    added: data.added as number,
    duplicates: data.duplicates as number,
    duplicate_keys: (data.duplicate_keys || []) as string[],
  };
}

export async function adminDecryptLicense(inventoryId: string): Promise<string> {
  const data = await invokeFulfillment({ action: 'admin_decrypt_license', inventoryId });
  return data.key as string;
}

export async function adminSaveFulfillment(
  fulfillmentId: string,
  deliveryType: string,
  payload: Record<string, unknown> | undefined,
  newStatus?: string,
  publicMessage?: string,
  expiresAt?: string
): Promise<void> {
  await invokeFulfillment({
    action: 'admin_save_fulfillment',
    fulfillmentId,
    deliveryType,
    payload,
    newStatus,
    publicMessage,
    expiresAt,
  });
}

export async function adminSyncPending(
  options: { orderId?: string; productId?: string }
): Promise<{ synced: string; count?: number }> {
  const data = await invokeFulfillment({
    action: 'admin_sync_pending',
    ...options,
  });
  return { synced: data.synced as string, count: data.count as number | undefined };
}

export async function adminListFulfillmentEvents(
  fulfillmentId: string
): Promise<FulfillmentEventRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('fulfillment_events')
    .select('*')
    .eq('fulfillment_id', fulfillmentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as FulfillmentEventRow[];
}

export async function adminListOrderFulfillments(
  orderId: string
): Promise<FulfillmentRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from('order_item_fulfillments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at');
  if (error) throw error;
  return (data ?? []) as FulfillmentRow[];
}
