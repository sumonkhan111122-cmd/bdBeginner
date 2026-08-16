export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';
export type FulfillmentStatus = 'unfulfilled' | 'processing' | 'fulfilled' | 'cancelled';

export type PaymentProvider = 'manual' | 'bkash' | 'bkash_personal' | 'nagad_personal' | 'rocket_personal' | 'sslcommerz' | 'stripe';

export type PaymentTransactionRow = {
  id: string;
  order_id: string;
  provider: PaymentProvider;
  provider_transaction_id?: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'completed' | 'failed' | 'refunded';
  metadata?: Record<string, unknown> | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_reason_code?: string | null;
  review_reason_text?: string | null;
  created_at: string;
  updated_at?: string;
};

export interface PaymentGatewayInterface {
  createPayment(order: OrderRow): Promise<{ url?: string; token?: string }>;
  verifyPayment(transactionId: string): Promise<boolean>;
  processCallback(payload: unknown): Promise<void>;
  refundPayment(transactionId: string, amount?: number): Promise<boolean>;
}

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_note: string | null;
  currency_code: string;
  subtotal: number;
  discount_total: number;
  total: number;
  discount_source?: string | null;
  discount_code?: string | null;
  discount_name?: string | null;
  coupon_id?: string | null;
  promotion_id?: string | null;
  order_status?: OrderStatus;
  status?: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string | null;
  fulfillment_status: FulfillmentStatus;
  admin_note?: string | null;
  created_at: string;
  updated_at?: string;
  order_items?: Pick<OrderItemRow, 'id' | 'quantity' | 'product_id'>[];
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name?: string;
  product_name_snapshot?: string;
  product_slug?: string | null;
  slug?: string | null;
  sku?: string | null;
  product_sku?: string | null;
  thumbnail_url?: string | null;
  product_thumbnail_url?: string | null;
  delivery_type: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at?: string;
};

export type OrderStatusHistoryRow = {
  id: string;
  order_id: string;
  order_status?: OrderStatus;
  status?: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  created_by?: string | null;
  created_at: string;
};

export type OrderWithDetails = {
  order: OrderRow;
  items: OrderItemRow[];
  history: OrderStatusHistoryRow[];
  transactions?: PaymentTransactionRow[];
};

export type CheckoutResult = {
  order_id: string;
  order_number: string;
  access_token: string;
  subtotal: number;
  discount_total: number;
  total: number;
  currency_code: string;
  discount_source: string | null;
  discount_code: string | null;
  discount_name: string | null;
  payment_status: string;
};

export type CheckoutCatalogProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  thumbnail_url: string | null;
  delivery_type: string;
};

// ── Fulfillment Types ──

export type ItemFulfillmentStatus =
  | 'pending'
  | 'ready'
  | 'processing'
  | 'completed'
  | 'revoked'
  | 'expired';

export type FulfillmentRow = {
  id: string;
  order_item_id: string;
  delivery_type: string;
  fulfillment_status: ItemFulfillmentStatus;
  public_message: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type FulfillmentEventRow = {
  id: string;
  fulfillment_id: string;
  event_type: string;
  actor_id: string | null;
  details: string | null;
  created_at: string;
};

export type LicenseInventoryMasked = {
  id: string;
  masked_key: string;
  status: 'available' | 'assigned' | 'revoked';
  assigned_order_item_id: string | null;
  assigned_at: string | null;
  created_at: string;
};

export type LicenseInventoryCounts = {
  available: number;
  assigned: number;
  revoked: number;
  total: number;
};

export type RevealedLicensePayload = {
  success: true;
  delivery_type: 'license_key';
  keys: string[];
};

export type RevealedSubscriptionPayload = {
  success: true;
  delivery_type: 'subscription';
  payload: {
    login_url?: string;
    username?: string;
    password?: string;
    plan?: string;
    instructions?: string;
  };
};

export type RevealedManualPayload = {
  success: true;
  delivery_type: 'manual_delivery';
  payload: {
    content?: string;
    [key: string]: unknown;
  };
};

export type RevealedServicePayload = {
  success: true;
  delivery_type: 'service';
  status: string;
  public_message: string | null;
};

export type RevealResult =
  | RevealedLicensePayload
  | RevealedSubscriptionPayload
  | RevealedManualPayload
  | RevealedServicePayload
  | { error: string; message?: string };
