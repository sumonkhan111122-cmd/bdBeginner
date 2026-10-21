import { getSupabase } from '@/lib/supabase';

export interface CourseEnrollmentRecord {
  courseId: string;
  email: string;
  customerName?: string;
  orderNumber?: string;
  enrolledAt: string;
  status: 'active' | 'pending';
}

export interface CourseProgressRecord {
  lastLessonId: string;
  completedLessons: string[];
  playbackPositions: Record<string, number>; // lessonId -> seconds
  lastWatchedAt: string;
}

const ENROLLMENTS_KEY = 'bdb_course_enrollments';
const PROGRESS_KEY_PREFIX = 'bdb_course_progress_';
const ACTIVE_USER_KEY = 'bdb_active_course_user';

/**
 * Get all stored enrollments from localStorage.
 */
export function getAllEnrollments(): CourseEnrollmentRecord[] {
  try {
    const raw = localStorage.getItem(ENROLLMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Check if a course is currently enrolled in the browser or for a specific email.
 * Strictly verifies that status === 'active'. Any 'pending' status is NOT enrolled.
 */
export function isCourseEnrolled(courseId: string, userEmail?: string | null): boolean {
  const enrollments = getAllEnrollments();
  const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : null;

  // 1. Check if an explicit record exists for this email
  if (cleanEmail) {
    const match = enrollments.find(
      (e) => e.courseId === courseId && e.email.toLowerCase().trim() === cleanEmail
    );
    if (match) {
      return match.status === 'active';
    }
  }

  // 2. Check if a device-level enrollment exists
  const deviceEnrollment = enrollments.find((e) => e.courseId === courseId);
  if (deviceEnrollment) {
    if (deviceEnrollment.status === 'pending') {
      return false; // Pending manual verification = strictly NO access
    }
    if (deviceEnrollment.status === 'active') {
      return true;
    }
  }

  // 3. Check sessionStorage receipt (only valid if device is not marked pending)
  try {
    const sessionEnroll = sessionStorage.getItem(`enrolled_${courseId}`);
    if (sessionEnroll === 'true') {
      if (deviceEnrollment && deviceEnrollment.status === 'pending') {
        sessionStorage.removeItem(`enrolled_${courseId}`);
        return false;
      }
      return true;
    }
  } catch {
    // ignore
  }

  return false;
}

/**
 * Get the enrollment record for a course if one exists.
 */
export function getEnrollmentRecord(courseId: string, userEmail?: string | null): CourseEnrollmentRecord | null {
  const enrollments = getAllEnrollments();
  const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : null;
  if (cleanEmail) {
    const match = enrollments.find(
      (e) => e.courseId === courseId && e.email.toLowerCase().trim() === cleanEmail
    );
    if (match) return match;
  }
  return enrollments.find((e) => e.courseId === courseId) || null;
}

/**
 * Record an approved/paid course enrollment.
 */
export function enrollInCourse(
  courseId: string,
  email: string,
  customerName?: string,
  orderNumber?: string
): void {
  const enrollments = getAllEnrollments();
  const cleanEmail = email.toLowerCase().trim();

  const existingIdx = enrollments.findIndex(
    (e) => e.courseId === courseId && e.email === cleanEmail
  );

  const record: CourseEnrollmentRecord = {
    courseId,
    email: cleanEmail,
    customerName: customerName || 'Valued Student',
    orderNumber: orderNumber || `CR-${Date.now().toString(36).toUpperCase()}`,
    enrolledAt: new Date().toISOString(),
    status: 'active',
  };

  if (existingIdx >= 0) {
    enrollments[existingIdx] = record;
  } else {
    enrollments.push(record);
  }

  try {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
    localStorage.setItem(ACTIVE_USER_KEY, cleanEmail);
    sessionStorage.setItem(`enrolled_${courseId}`, 'true');
    window.dispatchEvent(
      new CustomEvent('course-enrollment-changed', {
        detail: { courseId, email: cleanEmail, status: 'active' },
      })
    );
  } catch (err) {
    console.error('Failed to save course enrollment', err);
  }
}

/**
 * Record a pending manual payment order.
 * Strictly revokes active session token so the student CANNOT bypass authorization
 * until the admin verifies and approves the payment in the admin panel.
 */
export function registerPendingCourseOrder(
  courseId: string,
  email: string,
  customerName?: string,
  orderNumber?: string
): void {
  const enrollments = getAllEnrollments();
  const cleanEmail = email.toLowerCase().trim();

  const existingIdx = enrollments.findIndex(
    (e) => e.courseId === courseId && e.email === cleanEmail
  );

  const record: CourseEnrollmentRecord = {
    courseId,
    email: cleanEmail,
    customerName: customerName || 'Valued Student',
    orderNumber: orderNumber || `CR-${Date.now().toString(36).toUpperCase()}`,
    enrolledAt: new Date().toISOString(),
    status: 'pending',
  };

  if (existingIdx >= 0) {
    enrollments[existingIdx] = record;
  } else {
    enrollments.push(record);
  }

  try {
    localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
    // Explicitly delete any active session token
    sessionStorage.removeItem(`enrolled_${courseId}`);
    window.dispatchEvent(
      new CustomEvent('course-enrollment-changed', {
        detail: { courseId, email: cleanEmail, status: 'pending' },
      })
    );
  } catch (err) {
    console.error('Failed to register pending course order', err);
  }
}

/**
 * Sync course enrollment with Supabase orders online.
 * Detects whether the order is 'paid', 'pending', or 'unpaid'.
 */
export async function syncCourseEnrollmentOnline(
  courseId: string,
  userEmail?: string | null,
  userId?: string | null
): Promise<{ isEnrolled: boolean; status: 'active' | 'pending' | 'none'; orderNumber?: string }> {
  try {
    const cleanEmail = userEmail?.toLowerCase().trim();
    if (!cleanEmail && !userId) {
      const local = getEnrollmentRecord(courseId);
      return {
        isEnrolled: isCourseEnrolled(courseId),
        status: local ? local.status : isCourseEnrolled(courseId) ? 'active' : 'none',
        orderNumber: local?.orderNumber,
      };
    }

    const sb = getSupabase();
    let query = sb
      .from('orders')
      .select('id,order_number,customer_email,customer_name,payment_status,created_at,order_items(product_id,product_name)')
      .order('created_at', { ascending: false });

    if (userId && cleanEmail) {
      query = query.or(`user_id.eq.${userId},customer_email.eq.${cleanEmail}`);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else if (cleanEmail) {
      query = query.eq('customer_email', cleanEmail);
    }

    const { data: orders, error } = await query;
    if (error || !orders || orders.length === 0) {
      const local = getEnrollmentRecord(courseId, userEmail);
      return {
        isEnrolled: isCourseEnrolled(courseId, userEmail),
        status: local ? local.status : isCourseEnrolled(courseId, userEmail) ? 'active' : 'none',
        orderNumber: local?.orderNumber,
      };
    }

    // Find latest order with AI motion course
    const matchingOrder = orders.find((o: any) => {
      const items = Array.isArray(o.order_items) ? o.order_items : [];
      return items.some(
        (i: any) =>
          i.product_id === courseId ||
          i.product_id === 'c0000001-0000-4000-8000-000000000001' ||
          (i.product_name && i.product_name.includes('AI মোশন'))
      );
    });

    if (!matchingOrder) {
      const local = getEnrollmentRecord(courseId, userEmail);
      return {
        isEnrolled: isCourseEnrolled(courseId, userEmail),
        status: local ? local.status : isCourseEnrolled(courseId, userEmail) ? 'active' : 'none',
        orderNumber: local?.orderNumber,
      };
    }

    if (matchingOrder.payment_status === 'paid') {
      enrollInCourse(courseId, matchingOrder.customer_email, matchingOrder.customer_name, matchingOrder.order_number);
      return { isEnrolled: true, status: 'active', orderNumber: matchingOrder.order_number };
    } else if (matchingOrder.payment_status === 'pending' || matchingOrder.payment_status === 'unpaid') {
      registerPendingCourseOrder(courseId, matchingOrder.customer_email, matchingOrder.customer_name, matchingOrder.order_number);
      return { isEnrolled: false, status: 'pending', orderNumber: matchingOrder.order_number };
    } else {
      return { isEnrolled: false, status: 'none', orderNumber: matchingOrder.order_number };
    }
  } catch (err) {
    console.warn('Could not sync online course enrollment:', err);
    const local = getEnrollmentRecord(courseId, userEmail);
    return {
      isEnrolled: isCourseEnrolled(courseId, userEmail),
      status: local ? local.status : isCourseEnrolled(courseId, userEmail) ? 'active' : 'none',
      orderNumber: local?.orderNumber,
    };
  }
}


/**
 * Get active user email for course sessions.
 */
export function getActiveCourseEmail(courseId: string): string | null {
  const enrollments = getAllEnrollments();
  const current = enrollments.find((e) => e.courseId === courseId && e.status === 'active');
  if (current) return current.email;
  try {
    return localStorage.getItem(ACTIVE_USER_KEY);
  } catch {
    return null;
  }
}

/**
 * Get saved progress for a course.
 */
export function getCourseProgress(courseId: string): CourseProgressRecord {
  const defaultState: CourseProgressRecord = {
    lastLessonId: '',
    completedLessons: [],
    playbackPositions: {},
    lastWatchedAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(`${PROGRESS_KEY_PREFIX}${courseId}`);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      lastLessonId: parsed.lastLessonId || '',
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      playbackPositions:
        parsed.playbackPositions &&
        typeof parsed.playbackPositions === 'object' &&
        !Array.isArray(parsed.playbackPositions)
          ? parsed.playbackPositions
          : {},
      lastWatchedAt: parsed.lastWatchedAt || new Date().toISOString(),
    };
  } catch {
    return defaultState;
  }
}

let lastProgressDispatchTime = 0;

/**
 * Explicitly save the last active lesson ID.
 */
export function saveLastActiveLesson(courseId: string, lessonId: string): void {
  const current = getCourseProgress(courseId);
  current.lastLessonId = lessonId;
  current.lastWatchedAt = new Date().toISOString();

  try {
    localStorage.setItem(`${PROGRESS_KEY_PREFIX}${courseId}`, JSON.stringify(current));
    window.dispatchEvent(
      new CustomEvent('course-progress-updated', {
        detail: { courseId, lessonId, action: 'change-lesson' },
      })
    );
  } catch (err) {
    console.error('Failed to save last active lesson', err);
  }
}

/**
 * Save playback position in seconds for a specific lesson.
 */
export function saveLessonPlaybackTime(courseId: string, lessonId: string, seconds: number): void {
  const current = getCourseProgress(courseId);
  const safeSeconds = Math.max(0, Math.floor(seconds));
  current.playbackPositions[lessonId] = safeSeconds;
  current.lastLessonId = lessonId;
  current.lastWatchedAt = new Date().toISOString();

  try {
    localStorage.setItem(`${PROGRESS_KEY_PREFIX}${courseId}`, JSON.stringify(current));

    const now = Date.now();
    if (now - lastProgressDispatchTime > 1200) {
      lastProgressDispatchTime = now;
      window.dispatchEvent(
        new CustomEvent('course-progress-updated', {
          detail: { courseId, lessonId, seconds: safeSeconds },
        })
      );
    }
  } catch (err) {
    console.error('Failed to save playback time', err);
  }
}

/**
 * Get saved playback position in seconds for a lesson.
 */
export function getLessonPlaybackTime(courseId: string, lessonId: string): number {
  const current = getCourseProgress(courseId);
  return current.playbackPositions[lessonId] || 0;
}

/**
 * Mark a lesson as completed or incompleted.
 */
export function toggleLessonCompletion(courseId: string, lessonId: string, completed?: boolean): boolean {
  const current = getCourseProgress(courseId);
  const exists = current.completedLessons.includes(lessonId);
  const shouldBeCompleted = completed !== undefined ? completed : !exists;

  if (shouldBeCompleted && !exists) {
    current.completedLessons.push(lessonId);
  } else if (!shouldBeCompleted && exists) {
    current.completedLessons = current.completedLessons.filter((id) => id !== lessonId);
  }

  current.lastWatchedAt = new Date().toISOString();

  try {
    localStorage.setItem(`${PROGRESS_KEY_PREFIX}${courseId}`, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent('course-progress-updated', { detail: { courseId, lessonId, completed: shouldBeCompleted } }));
  } catch (err) {
    console.error('Failed to save lesson completion', err);
  }

  return shouldBeCompleted;
}

/**
 * Calculate completion percentage and stats.
 */
export function getCourseCompletionStats(courseId: string, totalLessons: number): {
  completedCount: number;
  totalLessons: number;
  percentage: number;
  remainingCount: number;
} {
  const progress = getCourseProgress(courseId);
  const completedCount = progress.completedLessons.length;
  const safeTotal = Math.max(1, totalLessons);
  const percentage = Math.min(100, Math.round((completedCount / safeTotal) * 100));
  const remainingCount = Math.max(0, safeTotal - completedCount);

  return {
    completedCount,
    totalLessons: safeTotal,
    percentage,
    remainingCount,
  };
}
