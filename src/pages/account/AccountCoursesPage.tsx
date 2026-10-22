import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Play,
  Film,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MessageCircle,
  DownloadCloud,
  FileCode,
  RotateCw,
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import { AI_MOTION_COURSE } from '@/data/aiMotionCourse';
import {
  isCourseEnrolled,
  getEnrollmentRecord,
  getCourseCompletionStats,
  syncCourseEnrollmentOnline,
  type CourseEnrollmentRecord,
} from '@/services/courseEnrollment';
import { Button } from '@/components/ui/Button';

export function AccountCoursesPage() {
  const { session, profile } = useCustomerAuth();
  const { isVip } = useMembership();
  const email = session?.user?.email || profile?.email;
  const totalLessons = AI_MOTION_COURSE.modules.reduce((sum, m) => sum + m.lessons.length, 0);

  const [enrolled, setEnrolled] = useState(() => {
    return isVip || isCourseEnrolled(AI_MOTION_COURSE.id, email);
  });

  const [pendingOrder, setPendingOrder] = useState<CourseEnrollmentRecord | null>(() => {
    const record = getEnrollmentRecord(AI_MOTION_COURSE.id, email);
    return record?.status === 'pending' ? record : null;
  });

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(() => getCourseCompletionStats(AI_MOTION_COURSE.id, totalLessons));

  useEffect(() => {
    let active = true;

    async function checkCourses() {
      if (!email && !session?.user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const result = await syncCourseEnrollmentOnline(AI_MOTION_COURSE.id, email, session?.user?.id);
        if (!active) return;

        if (result.status === 'active') {
          setEnrolled(true);
          setPendingOrder(null);
        } else if (result.status === 'pending') {
          setEnrolled(false);
          const record = getEnrollmentRecord(AI_MOTION_COURSE.id, email);
          setPendingOrder(record);
        } else {
          setEnrolled(isVip || isCourseEnrolled(AI_MOTION_COURSE.id, email));
          setPendingOrder(null);
        }

        setStats(getCourseCompletionStats(AI_MOTION_COURSE.id, totalLessons));
      } catch (err) {
        console.error('Failed to sync courses', err);
      } finally {
        if (active) setLoading(false);
      }
    }

    checkCourses();

    return () => {
      active = false;
    };
  }, [email, session?.user?.id, isVip]);

  return (
    <AccountLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <GraduationCap size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-ink-900">আমার কোর্সসমূহ (My Courses)</h1>
              <p className="mt-0.5 text-sm text-ink-500">আপনার ক্রয়কৃত অনলাইন কোর্স, ক্লাসরুম ও প্রজেক্ট রিসোর্স।</p>
            </div>
          </div>
        </div>

        {/* Pending Order Notice */}
        {pendingOrder && !enrolled && (
          <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500/10 via-amber-50/70 to-white p-5 shadow-soft">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-ink-950 font-bold shadow-sm">
                  <Clock size={20} className="text-ink-950" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 uppercase">
                    পেমেন্ট ভেরিফিকেশন পেন্ডিং
                  </span>
                  <h3 className="mt-1 font-display text-base font-bold text-ink-900">
                    {AI_MOTION_COURSE.title}
                  </h3>
                  <p className="mt-1 text-xs text-ink-600 max-w-xl leading-relaxed">
                    আপনার অর্ডারের (<strong>#{pendingOrder.orderNumber}</strong>) বিকাশ ট্রানজেকশন আইডি আমাদের কাছে জমা হয়েছে। অ্যাডমিন অনুমোদন করার সাথে সাথে কোর্সটি স্বয়ংক্রিয়ভাবে সক্রিয় হয়ে যাবে।
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto shrink-0">
                <a
                  href={`https://wa.me/8801798583122?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম, আমি AI মোশন কোর্সের জন্য পেমেন্ট করেছি। অর্ডার নম্বর: #${pendingOrder.orderNumber}, ইমেইল: ${email}। দয়া করে কোর্সটি অ্যাপ্রুভ করে দিন।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors"
                >
                  <MessageCircle size={15} />
                  <span>দ্রুত অ্যাপ্রুভ করাতে WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-50"
                  title="স্ট্যাটাস চেক করুন"
                >
                  <RotateCw size={14} />
                  <span>চেক করুন</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex h-56 items-center justify-center rounded-2xl border border-ink-100 bg-white shadow-soft">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600/30 border-t-purple-600" />
          </div>
        ) : enrolled ? (
          /* ACTIVE ENROLLED COURSE CARD */
          <div className="overflow-hidden rounded-2xl border border-purple-200/80 bg-white shadow-soft transition-all hover:border-purple-300">
            <div className="grid gap-6 p-6 sm:grid-cols-12 sm:items-center">
              {/* Course Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-purple-950 sm:col-span-5 lg:col-span-4">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                  alt={AI_MOTION_COURSE.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/80 via-transparent to-transparent" />
                <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md bg-purple-600/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                  <Film size={11} /> {AI_MOTION_COURSE.totalLessons} ক্লাসের কোর্স
                </span>
                <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  সক্রিয়
                </span>
              </div>

              {/* Course Details */}
              <div className="flex flex-col justify-between sm:col-span-7 lg:col-span-8">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-purple-50 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                      লাইফটাইম এক্সেস
                    </span>
                    <span className="text-xs text-ink-400">• {AI_MOTION_COURSE.totalDuration}</span>
                  </div>

                  <h3 className="mt-2 font-display text-lg font-bold text-ink-900 line-clamp-2">
                    {AI_MOTION_COURSE.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-ink-500 line-clamp-2 leading-relaxed">
                    {AI_MOTION_COURSE.tagline}
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-ink-600 mb-1.5">
                      <span>কোর্স অগ্রগতি ({stats.completedCount}/{stats.totalLessons} ক্লাস)</span>
                      <span className="font-bold text-purple-700">{stats.percentage}% সম্পন্ন</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-brand-600 transition-all duration-500"
                        style={{ width: `${Math.max(stats.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap items-center gap-3 pt-4 border-t border-ink-100">
                  <Link
                    to="/course/ai-motion/learn"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md transition-colors"
                  >
                    <Play size={15} fill="currentColor" />
                    <span>ক্লাস শুরু করুন (ক্লাসরুমে যান)</span>
                  </Link>
                  <Link
                    to="/course/ai-motion"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors"
                  >
                    <span>কোর্স ওভারভিউ</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* NO ENROLLED COURSES - SHOW PROMO */
          <div className="rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-soft">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
              <GraduationCap size={32} />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-ink-900">
              আপনার এখনো কোনো কোর্সে এক্সেস সক্রিয় নেই
            </h3>
            <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto">
              আমাদের জনপ্রিয় <strong>AI মোশন গ্রাফিক্স ও ভিডিও এডিটিং মাস্টারক্লাস</strong> এ জয়েন করে AI দিয়ে সিনেমাটিক ভিডিও তৈরি শিখুন।
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/course/ai-motion"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-colors"
              >
                <Film size={16} />
                <span>AI মোশন কোর্সটি দেখুন (৳২৯০)</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}

        {/* Resources & Bonuses Callout */}
        {enrolled && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <DownloadCloud size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-ink-900">প্রজেক্ট সোর্স ফাইল ও সাউন্ড FX</h4>
                  <p className="text-xs text-ink-500 mt-0.5">সব ক্লাসের রিসোর্স সরাসরি ক্লাসরুমের ভেতরে অন্তর্ভুক্ত।</p>
                </div>
              </div>
              <Link
                to="/course/ai-motion/learn"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
              >
                রিসোর্স ডাউনলোড করতে ক্লাসে যান →
              </Link>
            </div>

            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <FileCode size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-ink-900">মাস্টার AI প্রম্পট লাইব্রেরি</h4>
                  <p className="text-xs text-ink-500 mt-0.5">Midjourney, Runway ও Kling এর রেডি-টু-ইউজ প্রম্পট।</p>
                </div>
              </div>
              <Link
                to="/course/ai-motion/learn"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:underline"
              >
                প্রম্পট দেখতে ক্লাসে যান →
              </Link>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
export default AccountCoursesPage;
