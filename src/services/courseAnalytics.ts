import type { OrderRow } from '@/types/orders';

export const AI_MOTION_COURSE_ID = 'c0000001-0000-4000-8000-000000000001';

const STORAGE_KEY_TOTAL_VIEWS = 'bdb_ai_motion_views_total';
const STORAGE_KEY_VISITORS = 'bdb_ai_motion_visitors_set';
const STORAGE_KEY_LAST_VIEW = 'bdb_ai_motion_last_view_time';
const STORAGE_KEY_VISITOR_ID = 'bdb_browser_visitor_uuid';

export interface CourseViewsStats {
  totalViews: number;
  uniqueVisitors: number;
  lastViewedAt: string | null;
}

export interface CoursePerformanceMetrics {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  failedOrders: number;
  totalRevenue: number;
  totalUnitsSold: number;
  views: CourseViewsStats;
  conversionRate: number; // percentage
  courseOrders: OrderRow[];
}

/**
 * Check if a given order contains the AI Motion Course product
 */
export function isAiMotionCourseOrder(order: OrderRow): boolean {
  if (order.order_items && Array.isArray(order.order_items)) {
    const hasItem = order.order_items.some((item) => {
      const pid = item.product_id;
      const pname = (item as any).product_name || '';
      return (
        pid === AI_MOTION_COURSE_ID ||
        pname.includes('AI মোশন') ||
        pname.toLowerCase().includes('agentic video')
      );
    });
    if (hasItem) return true;
  }
  return false;
}

/**
 * Record a page view for the AI Motion Course
 */
export function recordCourseView(): void {
  try {
    // 1. Get or create unique visitor ID for this browser
    let visitorId = localStorage.getItem(STORAGE_KEY_VISITOR_ID);
    if (!visitorId) {
      visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem(STORAGE_KEY_VISITOR_ID, visitorId);
    }

    // 2. Increment total views counter
    const currentTotal = parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_VIEWS) || '0', 10);
    const newTotal = currentTotal + 1;
    localStorage.setItem(STORAGE_KEY_TOTAL_VIEWS, newTotal.toString());

    // 3. Track unique visitors set
    let visitors: string[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VISITORS);
      visitors = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(visitors)) visitors = [];
    } catch {
      visitors = [];
    }

    if (!visitors.includes(visitorId)) {
      visitors.push(visitorId);
      localStorage.setItem(STORAGE_KEY_VISITORS, JSON.stringify(visitors));
    }

    // 4. Update last viewed timestamp
    const nowIso = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY_LAST_VIEW, nowIso);

    // 5. Notify open admin tabs/windows
    window.dispatchEvent(new CustomEvent('course-views-updated', {
      detail: { totalViews: newTotal, uniqueVisitors: visitors.length, lastViewedAt: nowIso }
    }));
  } catch (err) {
    console.debug('Failed to record course view', err);
  }
}

/**
 * Read current view statistics
 */
export function getCourseViewsStats(): CourseViewsStats {
  try {
    const totalViews = Math.max(parseInt(localStorage.getItem(STORAGE_KEY_TOTAL_VIEWS) || '0', 10), 0);
    let visitorsCount = 0;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_VISITORS);
      const parsed = raw ? JSON.parse(raw) : [];
      visitorsCount = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      visitorsCount = totalViews > 0 ? 1 : 0;
    }

    const lastViewedAt = localStorage.getItem(STORAGE_KEY_LAST_VIEW) || null;

    return {
      totalViews,
      uniqueVisitors: visitorsCount,
      lastViewedAt,
    };
  } catch {
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      lastViewedAt: null,
    };
  }
}

/**
 * Compute real-time performance metrics from orders list
 */
export function computeCourseMetrics(orders: OrderRow[]): CoursePerformanceMetrics {
  const courseOrders = orders.filter(isAiMotionCourseOrder);
  
  let totalRevenue = 0;
  let paidOrders = 0;
  let pendingOrders = 0;
  let failedOrders = 0;
  let totalUnitsSold = 0;

  courseOrders.forEach((o) => {
    const isPaid = o.payment_status === 'paid';
    const isPending = o.payment_status === 'pending' || o.payment_status === 'unpaid';
    const isFailed = o.payment_status === 'failed' || o.payment_status === 'refunded';

    if (isPaid) {
      paidOrders++;
      totalRevenue += Number(o.total) || 290;
    } else if (isPending) {
      pendingOrders++;
    } else if (isFailed) {
      failedOrders++;
    }

    // Units
    if (o.order_items && Array.isArray(o.order_items)) {
      o.order_items.forEach((item) => {
        if (
          item.product_id === AI_MOTION_COURSE_ID ||
          (item as any).product_name?.includes('AI মোশন')
        ) {
          totalUnitsSold += item.quantity || 1;
        }
      });
    } else {
      totalUnitsSold += 1;
    }
  });

  const views = getCourseViewsStats();
  const baseDenominator = Math.max(views.uniqueVisitors, views.totalViews, 1);
  const conversionRate = Math.min(Math.round((paidOrders / baseDenominator) * 1000) / 10, 100);

  return {
    totalOrders: courseOrders.length,
    paidOrders,
    pendingOrders,
    failedOrders,
    totalRevenue,
    totalUnitsSold,
    views,
    conversionRate,
    courseOrders,
  };
}
