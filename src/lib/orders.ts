import type { OrderItemRow, OrderRow, OrderStatusHistoryRow } from '@/types/orders';

export function getOrderStatus(order: Pick<OrderRow, 'order_status' | 'status'>): string {
  return order.order_status ?? order.status ?? 'pending';
}

export function getHistoryOrderStatus(
  history: Pick<OrderStatusHistoryRow, 'order_status' | 'status'>,
): string {
  return history.order_status ?? history.status ?? 'pending';
}

export function getOrderItemName(item: OrderItemRow): string {
  return item.product_name_snapshot ?? item.product_name ?? 'Product';
}

export function getOrderItemSlug(item: OrderItemRow): string | null {
  return item.product_slug ?? item.slug ?? null;
}

export function getOrderItemSku(item: OrderItemRow): string | null {
  return item.product_sku ?? item.sku ?? null;
}

export function getOrderItemThumbnail(item: OrderItemRow): string | null {
  return item.product_thumbnail_url ?? item.thumbnail_url ?? null;
}

export function getOrderItemCount(order: OrderRow): number {
  return (order.order_items ?? []).reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );
}

export function humanizeOrderValue(value: string | null | undefined): string {
  if (!value) return 'Not set';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatOrderDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function orderReceiptStorageKey(orderNumber: string): string {
  return `bdBeginner-order-access:${orderNumber}`;
}
