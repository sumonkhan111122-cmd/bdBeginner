import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Lock, Clock, ArrowLeft, ArrowRight, MessageCircle, RotateCw } from 'lucide-react';
import { AI_MOTION_COURSE } from '@/data/aiMotionCourse';
import { CourseLearningPortal } from '@/components/course/CourseLearningPortal';
import {
  isCourseEnrolled,
  getActiveCourseEmail,
  getEnrollmentRecord,
  syncCourseEnrollmentOnline,
  type CourseEnrollmentRecord,
} from '@/services/courseEnrollment';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import { Layout } from '@/components/layout/Layout';

export function CourseLearnPage() {
  const navigate = useNavigate();
  const { session } = useCustomerAuth();
  const { isVip } = useMembership();

  const [enrolled, setEnrolled] = useState(() => {
    return isVip || isCourseEnrolled(AI_MOTION_COURSE.id, session?.user?.email);
  });

  const [pendingOrder, setPendingOrder] = useState<CourseEnrollmentRecord | null>(() => {
    const record = getEnrollmentRecord(AI_MOTION_COURSE.id, session?.user?.email);
    return record?.status === 'pending' ? record : null;
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      const result = await syncCourseEnrollmentOnline(AI_MOTION_COURSE.id, session?.user?.email, session?.user?.id);
      if (!active) return;
      if (result.status === 'active') {
        setEnrolled(true);
        setPendingOrder(null);
      } else if (result.status === 'pending') {
        setEnrolled(false);
        const record = getEnrollmentRecord(AI_MOTION_COURSE.id, session?.user?.email);
        setPendingOrder(record);
      } else {
        setEnrolled(isVip || isCourseEnrolled(AI_MOTION_COURSE.id, session?.user?.email));
        setPendingOrder(null);
      }
      setChecking(false);
    };

    checkStatus();

    // Auto-poll while pending
    const interval = setInterval(() => {
      const record = getEnrollmentRecord(AI_MOTION_COURSE.id, session?.user?.email);
      if (record?.status === 'pending') {
        checkStatus();
      }
    }, 6000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [session?.user?.email, session?.user?.id, isVip]);

  // If enrolled, render the full dedicated learning portal!
  if (enrolled) {
    return (
      <CourseLearningPortal
        onBackToLanding={() => navigate('/course/ai-motion')}
        enrolledEmail={session?.user?.email || getActiveCourseEmail(AI_MOTION_COURSE.id)}
      />
    );
  }

  // If still verifying
  if (checking) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-600/30 border-t-brand-600" />
          <p className="mt-4 text-sm font-semibold text-ink-600">কোর্স এক্সেস যাচাই করা হচ্ছে...</p>
        </div>
      </Layout>
    );
  }

  // If pending approval
  if (pendingOrder) {
    return (
      <Layout>
        <div className="container-page py-12 sm:py-16">
          <div className="mx-auto max-w-xl rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-white to-white p-6 sm:p-10 shadow-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-600 border border-amber-500/30">
              <Clock size={32} className="animate-pulse" />
            </div>
            <span className="mt-5 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
              পেমেন্ট ভেরিফিকেশন পেন্ডিং
            </span>
            <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">
              {AI_MOTION_COURSE.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              আপনার ম্যানুয়াল পেমেন্ট ট্রানজেকশন (TrxID) আমাদের কাছে জমা হয়েছে। অ্যাডমিন TrxID যাচাই করে অর্ডারটি <strong>অ্যাপ্রুভ করার সাথে সাথে কোর্স ক্লাসরুমটি আনলক হয়ে যাবে</strong>।
            </p>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900">
              <p>অর্ডার নম্বর: <strong>#{pendingOrder.orderNumber || 'Pending'}</strong></p>
              <p className="mt-1">সাধারণত ১৫-৩০ মিনিটের মধ্যে অ্যাপ্রুভ সম্পন্ন হয়।</p>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`https://wa.me/8801798583122?text=${encodeURIComponent(
                  `আসসালামু আলাইকুম, আমি AI মোশন কোর্সের জন্য পেমেন্ট করেছি। অর্ডার নম্বর: #${pendingOrder.orderNumber}, ইমেইল: ${pendingOrder.email}। দয়া করে কোর্সটি অ্যাপ্রুভ করে দিন।`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-md transition-colors"
              >
                <MessageCircle size={16} />
                <span>WhatsApp-এ দ্রুত অ্যাপ্রুভ করান</span>
              </a>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors"
              >
                <RotateCw size={15} />
                <span>স্ট্যাটাস চেক করুন</span>
              </button>
            </div>

            <div className="mt-6 border-t border-ink-100 pt-5">
              <Link to="/account/courses" className="text-xs font-semibold text-brand-600 hover:underline">
                ← আমার কোর্স ড্যাশবোর্ডে ফিরে যান
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // If not enrolled
  return (
    <Layout>
      <div className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-ink-100 bg-white p-6 sm:p-10 shadow-xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <Lock size={32} />
          </div>
          <span className="mt-5 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-800">
            কোর্স এক্সেস সংরক্ষিত
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-900">
            {AI_MOTION_COURSE.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            এই কোর্সের ক্লাসরুমে প্রবেশ করতে প্রথমে কোর্সে এনরোল বা কোর্সটি পারচেস করতে হবে। আপনি যদি ইতিমধ্যে কোর্সটি কিনে থাকেন তবে সঠিক একাউন্টে লগইন করুন।
          </p>

          <div className="mt-7 flex flex-col gap-3">
            <Link
              to="/course/ai-motion"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-colors"
            >
              <span>কোর্সের বিস্তারিত ও এনরোল করুন</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/account/courses"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>আমার ড্যাশবোর্ডে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default CourseLearnPage;
