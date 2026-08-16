import { getSupabase } from '@/lib/supabase';

export interface AnalyticsSummary {
  paid_sales: number;
  paid_orders: number;
  discounts_given: number;
  refunded_order_value: number;
  unique_paid_customers: number;
  new_paid_customers: number;
  returning_paid_customers: number;
}

export interface SalesSeriesBucket {
  bucket_date: string;
  paid_sales: number;
  paid_orders: number;
}

export interface TopProductRow {
  product_id: string;
  product_name: string;
  units_sold: number;
  paid_orders: number;
  gross_sales: number;
}

export interface PaymentStatsRow {
  provider: string;
  attempts: number;
  succeeded: number;
  failed: number;
  pending: number;
  cancelled: number;
  succeeded_amount: number;
}

export interface DiscountStatsRow {
  discount_source: string | null;
  discount_code: string | null;
  paid_orders: number;
  subtotal_before: number;
  discount_given: number;
  paid_sales_after: number;
}

export async function fetchAnalyticsSummary(
  startDate: string,
  endDate: string
): Promise<AnalyticsSummary> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('admin_analytics_summary', {
    start_date: startDate,
    end_date: endDate,
  });
  if (error) throw error;
  return data as AnalyticsSummary;
}

export async function fetchSalesSeries(
  startDate: string,
  endDate: string,
  interval: string
): Promise<SalesSeriesBucket[]> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('admin_sales_series', {
    start_date: startDate,
    end_date: endDate,
    interval_expr: interval,
  });
  if (error) throw error;
  return data as SalesSeriesBucket[];
}

export async function fetchTopProducts(
  startDate: string,
  endDate: string
): Promise<TopProductRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('admin_top_products', {
    start_date: startDate,
    end_date: endDate,
  });
  if (error) throw error;
  return data as TopProductRow[];
}

export async function fetchPaymentStats(
  startDate: string,
  endDate: string
): Promise<PaymentStatsRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('admin_payment_stats', {
    start_date: startDate,
    end_date: endDate,
  });
  if (error) throw error;
  return data as PaymentStatsRow[];
}

export async function fetchDiscountStats(
  startDate: string,
  endDate: string
): Promise<DiscountStatsRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc('admin_discount_stats', {
    start_date: startDate,
    end_date: endDate,
  });
  if (error) throw error;
  return data as DiscountStatsRow[];
}

export function generateCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escapeCell = (cell: string | number | null | undefined) => {
    if (cell === null || cell === undefined) return '""';
    const cellStr = String(cell);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  };

  const csvRows = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ];

  return csvRows.join('\n');
}

export function triggerCSVDownload(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
