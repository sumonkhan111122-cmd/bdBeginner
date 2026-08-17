import { getSupabase } from '@/lib/supabase';
import type { CartItem } from '@/types';
import type {
  CheckoutCatalogProduct,
  CheckoutResult,
  FulfillmentStatus,
  OrderItemRow,
  OrderRow,
  OrderStatus,
  OrderStatusHistoryRow,
  OrderWithDetails,
  PaymentStatus,
} from '@/types/orders';

type CheckoutInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerNote: string | null;
  items: { product_id: string; quantity: number }[];
  couponCode?: string | null;
};

function firstRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === 'object' ? (first as Record<string, unknown>) : null;
  }
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function unwrapRpcRecord(value: unknown, functionName: string): Record<string, unknown> | null {
  const record = firstRecord(value);
  if (!record) return null;
  return firstRecord(record[functionName]) ?? record;
}

function normalizeCheckoutResult(value: unknown): CheckoutResult {
  const result = unwrapRpcRecord(value, 'create_checkout_order_priced');
  if (!result) throw new Error('The checkout service returned an empty response.');
  const orderId = String(result.order_id ?? result.id ?? '');
  const orderNumber = String(result.order_number ?? '');
  const accessToken = String(result.access_token ?? '');
  const subtotal = Number(result.subtotal ?? 0);
  const discountTotal = Number(result.discount_total ?? 0);
  const total = Number(result.total);
  const currencyCode = String(result.currency_code ?? 'BDT');
  const discountSource = result.discount_source ? String(result.discount_source) : null;
  const discountCode = result.discount_code ? String(result.discount_code) : null;
  const discountName = result.discount_name ? String(result.discount_name) : null;
  const paymentStatus = String(result.payment_status ?? 'unpaid');
  if (!orderId || !orderNumber || !accessToken || !Number.isFinite(total)) {
    throw new Error('The checkout service returned an invalid order response.');
  }
  return {
    order_id: orderId,
    order_number: orderNumber,
    access_token: accessToken,
    subtotal,
    discount_total: discountTotal,
    total,
    currency_code: currencyCode,
    discount_source: discountSource,
    discount_code: discountCode,
    discount_name: discountName,
    payment_status: paymentStatus,
  };
}

export function friendlyCheckoutError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (message.includes('coupon') && (message.includes('invalid') || message.includes('inactive'))) {
    return 'The coupon code is invalid or no longer active. Please remove it and try again.';
  }
  if (message.includes('coupon') && message.includes('minimum')) {
    return 'Your order no longer meets the coupon minimum. Please remove it and try again.';
  }
  if (message.includes('coupon') && (message.includes('limit') || message.includes('exceeded'))) {
    return 'This coupon has reached its usage limit.';
  }
  if (message.includes('coupon') && message.includes('expired')) {
    return 'This coupon has expired. Please remove it and try again.';
  }
  if (message.includes('empty') || message.includes('item')) {
    return 'Your cart is empty or contains an invalid item. Please review it and try again.';
  }
  if (message.includes('published') || message.includes('unavailable') || message.includes('product')) {
    return 'One or more products are no longer available. Please review your cart.';
  }
  if (message.includes('email') || message.includes('customer') || message.includes('name')) {
    return 'Please check your name and email address, then try again.';
  }
  if (message.includes('fetch') || message.includes('network') || message.includes('connect')) {
    return 'Unable to reach checkout right now. Please check your connection and try again.';
  }
  return 'We could not create your order. Please review your details and try again.';
}

export async function validateCheckoutCart(items: CartItem[]): Promise<{
  available: CheckoutCatalogProduct[];
  unavailable: CartItem[];
}> {
  if (items.length === 0) return { available: [], unavailable: [] };
  const ids = [...new Set(items.map((item) => item.productId))];
  const { data, error } = await getSupabase()
    .from('products')
    .select('id,name,slug,price,thumbnail_url,delivery_type,status')
    .in('id', ids)
    .eq('status', 'published');
  if (error) throw error;
  const available = (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    price: Number(row.price),
    thumbnail_url: row.thumbnail_url ? String(row.thumbnail_url) : null,
    delivery_type: String(row.delivery_type),
  }));
  const availableIds = new Set(available.map((product) => product.id));
  return {
    available,
    unavailable: items.filter((item) => !availableIds.has(item.productId)),
  };
}

export async function createCheckoutOrderPriced(input: CheckoutInput): Promise<CheckoutResult> {
  const { data, error } = await getSupabase().rpc('create_checkout_order_priced', {
    p_customer_name: input.customerName,
    p_customer_email: input.customerEmail,
    p_customer_phone: input.customerPhone,
    p_customer_note: input.customerNote,
    p_items: input.items,
    p_coupon_code: input.couponCode || null,
  });
  if (error) {
    console.error('create_checkout_order_priced failed', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
  return normalizeCheckoutResult(data);
}

export async function triggerOrderNotification(
  eventType: string,
  orderNumber: string,
  accessToken?: string
) {
  const payload = {
    event_type: eventType,
    order_number: orderNumber,
    ...(accessToken ? { access_token: accessToken } : {}),
  };
  const { data, error } = await getSupabase().functions.invoke('order-notification', { body: payload });
  if (error) throw error;
  return data;
}

function normalizeReceipt(value: unknown): OrderWithDetails {
  const record = unwrapRpcRecord(value, 'get_order_receipt');
  if (!record) throw new Error('Order receipt not found.');
  const rawOrder = firstRecord(record.order) ?? record;
  const order = {
    ...rawOrder,
    id: String(rawOrder.id ?? record.order_id ?? ''),
  } as unknown as OrderRow;
  const rawItems = record.items ?? record.order_items ?? rawOrder.items ?? rawOrder.order_items;
  const rawHistory = record.history ?? record.order_status_history ?? rawOrder.history ?? rawOrder.order_status_history;
  const items = (Array.isArray(rawItems) ? rawItems : []) as OrderItemRow[];
  const history = (Array.isArray(rawHistory) ? rawHistory : []) as OrderStatusHistoryRow[];
  if (!order.order_number) throw new Error('Order receipt not found.');
  return { order, items, history };
}

export async function getGuestOrderReceipt(
  orderNumber: string,
  accessToken: string,
): Promise<OrderWithDetails> {
  const { data, error } = await getSupabase().rpc('get_order_receipt', {
    p_order_number: orderNumber,
    p_access_token: accessToken,
  });
  if (error) throw error;
  return normalizeReceipt(data);
}

async function fetchOrderRelations(orderId: string): Promise<{
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
  transactions: import('@/types/orders').PaymentTransactionRow[];
}> {
  const sb = getSupabase();
  const [itemsResult, historyResult, transactionsResult] = await Promise.all([
    sb.from('order_items').select('*').eq('order_id', orderId),
    sb.from('order_status_history').select('*').eq('order_id', orderId).order('created_at'),
    sb.from('payment_transactions').select('*').eq('order_id', orderId).order('created_at', { ascending: false }),
  ]);
  if (itemsResult.error) throw itemsResult.error;
  if (historyResult.error) throw historyResult.error;
  if (transactionsResult.error && transactionsResult.error.code !== '42P01') {
      // Ignore table not found if it doesn't exist yet, although it should
      throw transactionsResult.error;
  }
  return {
    items: (itemsResult.data ?? []) as OrderItemRow[],
    history: (historyResult.data ?? []) as OrderStatusHistoryRow[],
    transactions: (transactionsResult?.data ?? []) as import('@/types/orders').PaymentTransactionRow[],
  };
}

const customerOrderColumns = [
  'id',
  'order_number',
  'user_id',
  'customer_name',
  'customer_email',
  'customer_phone',
  'customer_note',
  'currency_code',
  'subtotal',
  'discount_total',
  'total',
  'payment_status',
  'fulfillment_status',
  'created_at',
].join(',');

async function fetchCustomerOrderRows(userId: string): Promise<OrderRow[]> {
  const runQuery = (statusColumn: 'order_status' | 'status') => getSupabase()
    .from('orders')
    .select(`${customerOrderColumns},${statusColumn},order_items(id,quantity,product_id)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const primary = await runQuery('order_status');
  if (!primary.error) return (primary.data ?? []) as unknown as OrderRow[];

  const fallback = await runQuery('status');
  if (fallback.error) throw primary.error;
  return (fallback.data ?? []) as unknown as OrderRow[];
}

async function fetchCustomerOrderRecord(
  field: 'id' | 'order_number',
  value: string,
  userId: string,
): Promise<OrderRow | null> {
  const runQuery = (statusColumn: 'order_status' | 'status') => getSupabase()
    .from('orders')
    .select(`${customerOrderColumns},${statusColumn}`)
    .eq(field, value)
    .eq('user_id', userId)
    .maybeSingle();

  const primary = await runQuery('order_status');
  if (!primary.error) return (primary.data as OrderRow | null) ?? null;

  const fallback = await runQuery('status');
  if (fallback.error) throw primary.error;
  return (fallback.data as OrderRow | null) ?? null;
}

async function fetchCustomerOrderRelations(orderId: string): Promise<{
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
}> {
  const itemsPromise = getSupabase()
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  const historyColumns = 'id,order_id,payment_status,fulfillment_status,created_at';
  const runHistoryQuery = (statusColumn: 'order_status' | 'status') => getSupabase()
    .from('order_status_history')
    .select(`${historyColumns},${statusColumn}`)
    .eq('order_id', orderId)
    .order('created_at');

  const [itemsResult, primaryHistory] = await Promise.all([
    itemsPromise,
    runHistoryQuery('order_status'),
  ]);
  if (itemsResult.error) throw itemsResult.error;

  let historyData = primaryHistory.data;
  if (primaryHistory.error) {
    const fallbackHistory = await runHistoryQuery('status');
    if (fallbackHistory.error) throw primaryHistory.error;
    historyData = fallbackHistory.data;
  }

  return {
    items: (itemsResult.data ?? []) as OrderItemRow[],
    history: (historyData ?? []) as OrderStatusHistoryRow[],
  };
}

export async function getCustomerOrders(userId: string): Promise<OrderRow[]> {
  return fetchCustomerOrderRows(userId);
}

export async function getCustomerOrderById(
  id: string,
  userId: string,
): Promise<OrderWithDetails | null> {
  const order = await fetchCustomerOrderRecord('id', id, userId);
  if (!order) return null;
  const relations = await fetchCustomerOrderRelations(id);
  return { order, ...relations };
}

export async function getCustomerOrderByNumber(
  orderNumber: string,
  userId: string,
): Promise<OrderWithDetails | null> {
  const order = await fetchCustomerOrderRecord('order_number', orderNumber, userId);
  if (!order) return null;
  const relations = await fetchCustomerOrderRelations(order.id);
  return { order, ...relations };
}

export async function getAdminOrders(): Promise<OrderRow[]> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*,order_items(id,quantity,product_id)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as OrderRow[];
}

export async function getAdminOrderById(id: string): Promise<OrderWithDetails | null> {
  const { data, error } = await getSupabase()
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const relations = await fetchOrderRelations(id);
  return { order: data as OrderRow, ...relations };
}

export async function updateAdminOrderStatus(
  order: OrderRow,
  input: {
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    fulfillmentStatus: FulfillmentStatus;
    adminNote: string | null;
  },
): Promise<OrderRow> {
  const statusKey = Object.prototype.hasOwnProperty.call(order, 'order_status')
    ? 'order_status'
    : 'status';
  const payload: Record<string, unknown> = {
    [statusKey]: input.orderStatus,
    payment_status: input.paymentStatus,
    fulfillment_status: input.fulfillmentStatus,
    admin_note: input.adminNote,
  };
  const { data, error } = await getSupabase()
    .from('orders')
    .update(payload)
    .eq('id', order.id)
    .select()
    .single();
  if (error) throw error;
  
  const updatedOrder = data as OrderRow;
  
  // Trigger notifications if statuses actually changed
  const oldOrderStatus = (order.order_status || order.status) as OrderStatus;
  if (input.orderStatus !== oldOrderStatus) {
    triggerOrderNotification(`order_status_${input.orderStatus}_customer` as Parameters<typeof triggerOrderNotification>[0], order.order_number);
  }
  if (input.paymentStatus !== order.payment_status) {
    triggerOrderNotification(`payment_status_${input.paymentStatus}_customer` as Parameters<typeof triggerOrderNotification>[0], order.order_number);
  }
  if (input.fulfillmentStatus !== order.fulfillment_status) {
    triggerOrderNotification(`fulfillment_status_${input.fulfillmentStatus}_customer` as Parameters<typeof triggerOrderNotification>[0], order.order_number);
  }
  
  return updatedOrder;
}

export async function deleteAdminOrders(orderIds: string[]): Promise<void> {
  if (orderIds.length === 0) return;
  const sb = getSupabase();

  // Try to safely delete from dependent tables first to handle missing ON DELETE CASCADE
  // We swallow errors here so that if a table doesn't exist or RLS blocks it, we still try to delete the order
  await sb.from('order_items').delete().in('order_id', orderIds).catch(() => {});
  await sb.from('payment_transactions').delete().in('order_id', orderIds).catch(() => {});
  await sb.from('order_email_log').delete().in('order_id', orderIds).catch(() => {});
  
  const { error } = await sb
    .from('orders')
    .delete()
    .in('id', orderIds);
  if (error) throw error;
}
