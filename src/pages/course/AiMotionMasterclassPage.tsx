import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  Clock,
  Infinity as InfinityIcon,
  Crown,
  Star,
  ChevronDown,
  Gift,
  ArrowRight,
  DownloadCloud,
  Layers,
  Film,
  Bot,
  Laptop,
  CheckCircle2,
  FileText,
  KeyRound,
  Lock,
  Headphones,
  Eye,
  X,
  MessageCircle,
  RotateCw,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { AI_MOTION_COURSE, courseToProduct } from '@/data/aiMotionCourse';
import { CourseDiscountModal } from '@/components/course/CourseDiscountModal';
import { ProtectedVideoPlayer } from '@/components/course/ProtectedVideoPlayer';
import {
  isCourseEnrolled,
  getActiveCourseEmail,
  getEnrollmentRecord,
  syncCourseEnrollmentOnline,
  type CourseEnrollmentRecord,
} from '@/services/courseEnrollment';
import { recordCourseView } from '@/services/courseAnalytics';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useCart } from '@/context/CartContext';
import { useMembership } from '@/context/MembershipContext';
import { trackViewContent, trackStartTrial, trackInitiateCheckout } from '@/lib/tracking';

export function AiMotionMasterclassPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useCustomerAuth();
  const { isVip } = useMembership();
  const { addItem, clearCart, applyCoupon } = useCart();

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCurriculumMod, setActiveCurriculumMod] = useState<number>(0);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  // Discount modal state & claimed tracker
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountClaimed, setDiscountClaimed] = useState(() => {
    return sessionStorage.getItem('ai_motion_discount_status') === 'claimed';
  });

  // Track course page view
  useEffect(() => {
    recordCourseView();
    trackViewContent(courseToProduct(AI_MOTION_COURSE));
  }, []);

  // Check enrollment
  const [enrolled, setEnrolled] = useState(() => {
    return isVip || isCourseEnrolled(AI_MOTION_COURSE.id, session?.user?.email);
  });

  const [pendingOrder, setPendingOrder] = useState<CourseEnrollmentRecord | null>(() => {
    const record = getEnrollmentRecord(AI_MOTION_COURSE.id, session?.user?.email);
    return record?.status === 'pending' ? record : null;
  });

  // 10-Second Discount Popup Timer: triggers after 10s on page if not enrolled and not yet dismissed
  useEffect(() => {
    if (enrolled) return;
    const status = sessionStorage.getItem('ai_motion_discount_status');
    if (status === 'claimed' || status === 'dismissed') return;

    const timer = setTimeout(() => {
      const current = sessionStorage.getItem('ai_motion_discount_status');
      if (!current) {
        setShowDiscountModal(true);
      }
    }, 10000); // exactly 10 seconds

    return () => clearTimeout(timer);
  }, [enrolled]);

  // Sync online enrollment status from Supabase with auto-polling for pending orders
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
    };

    checkStatus();

    // Auto-poll every 6 seconds while pending so admin approval immediately unlocks the course
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

  // Handle URL params for demo and watch
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('demo') === '1') {
      setIsDemoModalOpen(true);
    } else if (params.get('watch') === '1' || params.get('portal') === '1') {
      const isEnr = isVip || isCourseEnrolled(AI_MOTION_COURSE.id, session?.user?.email);
      if (isEnr) {
        navigate('/course/ai-motion/learn', { replace: true });
      } else {
        // If not enrolled, open the demo video
        setIsDemoModalOpen(true);
      }
    }
  }, [location.search, isVip, session?.user?.email, navigate]);

  useEffect(() => {
    const checkEnroll = () => {
      const isNowEnrolled = isVip || isCourseEnrolled(AI_MOTION_COURSE.id, session?.user?.email);
      setEnrolled(isNowEnrolled);
      const record = getEnrollmentRecord(AI_MOTION_COURSE.id, session?.user?.email);
      setPendingOrder(record?.status === 'pending' ? record : null);
    };

    window.addEventListener('course-enrollment-changed', checkEnroll);
    checkEnroll();
    return () => window.removeEventListener('course-enrollment-changed', checkEnroll);
  }, [isVip, session?.user?.email]);

  // Primary Purchase Handler: Routes directly to site checkout with bKash automatic / manual options
  const handleEnrollNow = async () => {
    if (enrolled) {
      navigate('/course/ai-motion/learn');
      return;
    }
    if (pendingOrder && !enrolled) {
      alert(
        `আপনার একটি ম্যানুয়াল অর্ডার ${
          pendingOrder.orderNumber ? `(অর্ডার নং: #${pendingOrder.orderNumber})` : ''
        } বর্তমানে ভেরিফিকেশনের জন্য পেন্ডিং আছে। অ্যাডমিন TrxID যাচাই করে অ্যাপ্রুভ করার সাথে সাথেই কোর্সটি আনলক হয়ে যাবে। দ্রুত অ্যাপ্রুভ করাতে আমাদের WhatsApp নম্বরে (+8801798583122) মেসেজ দিন।`
      );
      return;
    }
    const finalPrice = discountClaimed ? 240 : 290;
    trackInitiateCheckout(
      [
        {
          productId: AI_MOTION_COURSE.id,
          name: AI_MOTION_COURSE.title,
          price: finalPrice,
          quantity: 1,
        },
      ],
      finalPrice
    );
    clearCart();
    addItem(courseToProduct(AI_MOTION_COURSE), 1, false);
    if (discountClaimed) {
      await applyCoupon('AIMOTION50');
    }
    navigate('/checkout');
  };

  const handleClaimDiscount = async () => {
    sessionStorage.setItem('ai_motion_discount_status', 'claimed');
    setDiscountClaimed(true);
    setShowDiscountModal(false);
    clearCart();
    addItem(courseToProduct(AI_MOTION_COURSE), 1, false);
    await applyCoupon('AIMOTION50');
    navigate('/checkout');
  };

  const handleCloseDiscount = () => {
    sessionStorage.setItem('ai_motion_discount_status', 'dismissed');
    setShowDiscountModal(false);
  };

  const handleWatchDemo = () => {
    trackStartTrial('AI Motion Masterclass Demo', 0);
    if (enrolled) {
      navigate('/course/ai-motion/learn');
    } else {
      setIsDemoModalOpen(true);
    }
  };

  const demoLesson = AI_MOTION_COURSE.modules[0].lessons[0];

  return (
    <Layout>
      <div className="font-sans bg-[#070b14] text-ink-100">
        
        {/* ENROLLED TOP BANNER (Visible if user already purchased & paid) */}
        {enrolled && (
          <div className="bg-gradient-to-r from-purple-900 via-brand-900 to-purple-950 text-white py-3.5 px-4 text-sm font-semibold shadow-md border-b border-purple-500/30">
            <div className="container-page flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>
                  অভিনন্দন! আপনার কোর্স এক্সেস সক্রিয় রয়েছে। সম্পূর্ণ ১০টি ক্লাস ও প্রজেক্ট ফাইল দেখতে ক্লাসরুমে যান।
                </span>
              </div>
              <Link
                to="/course/ai-motion/learn"
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-brand-500 text-white rounded-xl font-bold text-xs sm:text-sm hover:brightness-110 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Play size={14} fill="currentColor" />
                <span>কোর্সের ক্লাসরুমে যান 🎬</span>
              </Link>
            </div>
          </div>
        )}

        {/* PENDING MANUAL VERIFICATION TOP BANNER */}
        {pendingOrder && !enrolled && (
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white py-3.5 px-4 text-sm font-semibold shadow-md border-b border-amber-400/30">
            <div className="container-page flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock size={18} className="text-white shrink-0 animate-pulse" />
                <span>
                  আপনার ম্যানুয়াল পেমেন্ট ভেরিফিকেশন পেন্ডিং রয়েছে{' '}
                  {pendingOrder.orderNumber ? `(অর্ডার নং: #${pendingOrder.orderNumber})` : ''}। অ্যাডমিন TrxID যাচাই করে
                  অ্যাপ্রুভ করার সাথে সাথেই লার্নিং পোর্টাল স্বয়ংক্রিয়ভাবে খুলে যাবে।
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await syncCourseEnrollmentOnline(AI_MOTION_COURSE.id, session?.user?.email, session?.user?.id);
                    if (res.isEnrolled) {
                      alert('অভিনন্দন! আপনার পেমেন্ট ভেরিফাই হয়েছে এবং কোর্সটি সফলভাবে আনলক হয়েছে 🎉');
                    } else {
                      alert('অর্ডারটি এখনও পেন্ডিং রয়েছে। অ্যাডমিন TrxID মিলিয়ে দেখার পর স্বয়ংক্রিয়ভাবে অ্যাপ্রুভ হয়ে যাবে।');
                    }
                  }}
                  className="px-3.5 py-1.5 bg-black/25 hover:bg-black/40 border border-white/20 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="স্ট্যাটাস পুনরায় যাচাই করুন"
                >
                  <RotateCw size={13} />
                  <span>স্ট্যাটাস রিফ্রেশ করুন</span>
                </button>
                <a
                  href={`https://wa.me/8801798583122?text=${encodeURIComponent(
                    `আসসালামু আলাইকুম, আমি AI মোশন কোর্সের জন্য ম্যানুয়াল পেমেন্ট করেছি। অর্ডার নম্বর: ${
                      pendingOrder.orderNumber || ''
                    }। দয়া করে ভেরিফাই ও অ্যাপ্রুভ করে দিন।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 bg-white text-amber-900 rounded-xl font-bold text-xs hover:bg-amber-50 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp সাপোর্ট</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#0b1329] via-[#070b14] to-black text-white pt-14 pb-20 lg:pt-24 lg:pb-32">
          {/* Ambient Lighting */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[45rem] h-[25rem] bg-brand-500/15 blur-[140px] pointer-events-none rounded-full" />
          <div className="absolute top-1/3 right-10 w-[35rem] h-[22rem] bg-accent-500/15 blur-[120px] pointer-events-none rounded-full" />

          <div className="container-page relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-300 shadow-inner backdrop-blur-md">
                <Sparkles size={15} className="text-amber-400" />
                <span>{AI_MOTION_COURSE.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.25]">
                AI মোশন গ্রাফিক্স মাস্টারক্লাস <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-accent-300">
                  Advanced Agentic Video Editing
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-ink-200 max-w-2xl mx-auto leading-relaxed">
                {AI_MOTION_COURSE.tagline}
              </p>

              {/* Course Highlights Bar */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium text-ink-300">
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                  <Film size={15} className="text-brand-400" />
                  ১০টি প্র্যাক্টিক্যাল ক্লাস
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                  <Clock size={15} className="text-amber-400" />
                  ১ ঘণ্টা ৩০ মিনিট (দেড় ঘণ্টা)
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                  <DownloadCloud size={15} className="text-accent-400" />
                  সম্পূর্ণ ফ্রি প্রজেক্ট ফাইল
                </span>
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                  <InfinityIcon size={15} className="text-emerald-400" />
                  আজীবন এক্সেস
                </span>
              </div>

              {/* Price & Primary CTA Card */}
              <div className="pt-6 max-w-xl mx-auto">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-7 sm:p-9 backdrop-blur-2xl shadow-2xl space-y-6">
                  <div className="flex items-baseline justify-center gap-3.5">
                    {discountClaimed ? (
                      <>
                        <span className="text-4xl sm:text-5xl font-extrabold text-emerald-400 tracking-tight font-sans">৳240</span>
                        <span className="text-lg sm:text-xl text-ink-400 line-through font-sans">৳290</span>
                        <span className="rounded-xl bg-emerald-500 text-white px-3 py-1 text-xs font-black uppercase tracking-wider font-sans">
                          ৳৫০ স্পেশাল ছাড় সক্রিয়
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-sans">৳290</span>
                        <span className="text-lg sm:text-xl text-ink-400 line-through font-sans">৳5,000</span>
                        <span className="rounded-xl bg-amber-400 text-ink-950 px-3 py-1 text-xs font-black uppercase tracking-wider font-sans">
                          94% বিশেষ অফার
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-ink-300 leading-relaxed">
                    ⚡ এককালীন পেমেন্ট — বিকাশ অটোমেটিকে তাৎক্ষণিক এক্সেস অথবা বিকাশ ম্যানুয়াল পেমেন্টে অ্যাডমিন ভেরিফিকেশনের পর এক্সেস!
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                    {enrolled ? (
                      <Link
                        to="/course/ai-motion/learn"
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-brand-500 to-purple-600 px-8 py-4 text-base font-extrabold text-white shadow-xl hover:brightness-110 transition-all cursor-pointer"
                      >
                        <Play size={18} fill="currentColor" />
                        <span>কোর্স ক্লাসরুমে যান (ক্লাস দেখুন 🎬)</span>
                      </Link>
                    ) : pendingOrder ? (
                      <button
                        type="button"
                        onClick={handleEnrollNow}
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 px-8 py-4 text-base font-extrabold text-white shadow-xl hover:opacity-95 transition-all cursor-pointer"
                      >
                        <Clock size={18} className="animate-pulse" />
                        <span>পেমেন্ট ভেরিফিকেশন পেন্ডিং</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnrollNow}
                        className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 px-8 py-4 text-base font-extrabold text-white shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                      >
                        <span>{discountClaimed ? 'কোর্সটি কিনুন (৳240 • ৳50 ছাড়)' : 'কোর্সটি কিনুন (৳290)'}</span>
                        <ArrowRight size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleWatchDemo}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm sm:text-base font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <Play size={16} className="fill-white" />
                      <span>{enrolled ? 'ক্লাস লিস্ট দেখুন' : 'ফ্রি ডেমো দেখুন'}</span>
                    </button>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-2 text-xs text-ink-400">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>কেনার পর ব্রাউজারে সাথে সাথে সেভ থাকবে • পাসওয়ার্ড ছাড়াই দেখতে পারবেন</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* VALUE PILLARS */}
        <section className="section-padding bg-[#070b14] text-white border-t border-white/10">
          <div className="container-page">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-400">
                হ্যান্ডস-অন কারিকুলাম ও প্রযুক্তি
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                এই মাস্টারক্লাসে আপনি কী কী শিখবেন?
              </h2>
              <p className="text-sm sm:text-base text-ink-300 leading-relaxed">
                শুধু থিওরি নয়—বাস্তব প্রজেক্টের মাধ্যমে শিখবেন কীভাবে লেটেস্ট এআই মডেল দিয়ে সিনেমাটিক মোশন গ্রাফিক্স ও অটোমেটেড ভিডিও তৈরি করবেন।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AI_MOTION_COURSE.features.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] p-7 hover:border-brand-500/40 hover:bg-white/[0.04] transition-all duration-300 space-y-3"
                >
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-4">
                    {idx === 0 && <Film size={24} />}
                    {idx === 1 && <Bot size={24} />}
                    {idx === 2 && <Sparkles size={24} />}
                    {idx === 3 && <DownloadCloud size={24} />}
                    {idx === 4 && <InfinityIcon size={24} />}
                    {idx === 5 && <Headphones size={24} />}
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="text-sm text-ink-300 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CURRICULUM EXPLORER (10 Lessons across 4 Modules) */}
        <section className="section-padding bg-black text-white border-t border-white/10">
          <div className="container-page">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                সম্পূর্ণ সিলেবাস (লকড)
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                ১০টি এক্সক্লুসিভ প্র্যাক্টিক্যাল ক্লাস
              </h2>
              <p className="text-sm sm:text-base text-ink-300 leading-relaxed">
                মোট ১ ঘণ্টা ৩০ মিনিট (দেড় ঘণ্টা) টু-দ্য-পয়েন্ট হ্যান্ডস-অন টিউটোরিয়াল। ১ম ক্লাসটি ফ্রি ডেমো হিসেবে দেখতে পারবেন, বাকি ক্লাসগুলো কোর্স ক্রয়ের পর আনলক হবে।
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-4">
              {AI_MOTION_COURSE.modules.map((mod, modIdx) => {
                const isOpen = activeCurriculumMod === modIdx;
                return (
                  <div
                    key={mod.id}
                    className="rounded-3xl border border-white/10 bg-[#070b14] overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveCurriculumMod(isOpen ? -1 : modIdx)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 text-sm font-extrabold">
                          {mod.moduleNumber}
                        </span>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white">
                            {mod.title}
                          </h3>
                          <span className="text-xs sm:text-sm text-ink-400">
                            {mod.lessons.length}টি ক্লাস • {mod.description}
                          </span>
                        </div>
                      </div>
                      <ChevronDown
                        size={20}
                        className={`text-ink-400 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-brand-400' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/10 divide-y divide-white/5 bg-black/60 p-3 sm:p-4">
                        {mod.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/[0.03] transition-colors"
                          >
                            <div className="flex items-center gap-3.5">
                              <span className="text-xs font-mono font-bold text-brand-400">
                                {lesson.lessonNumber}
                              </span>
                              <div>
                                <h4 className="text-sm sm:text-base font-semibold text-white">
                                  {lesson.title}
                                </h4>
                                <p className="text-xs text-ink-400 line-clamp-1 mt-0.5">
                                  {lesson.summary}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3.5 shrink-0 ml-3">
                              <span className="text-xs sm:text-sm font-mono text-ink-300">
                                {lesson.duration}
                              </span>
                              {lesson.isFreePreview ? (
                                <button
                                  type="button"
                                  onClick={handleWatchDemo}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600/30 border border-brand-500/50 px-3.5 py-1.5 text-xs font-bold text-brand-300 hover:bg-brand-600 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Play size={12} className="fill-current" />
                                  <span>ফ্রি ডেমো দেখুন</span>
                                </button>
                              ) : enrolled ? (
                                <button
                                  type="button"
                                  onClick={() => navigate('/course/ai-motion/learn')}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/50 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                                >
                                  <Play size={12} className="fill-current" />
                                  <span>ক্লাস দেখুন</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleEnrollNow}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-semibold text-ink-400 hover:text-white hover:border-amber-400/40 hover:bg-amber-400/10 transition-colors cursor-pointer"
                                  title="কোর্সটি কিনলে আনলক হবে"
                                >
                                  <Lock size={13} className="text-amber-400" />
                                  <span>লকড (৳290)</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <button
                type="button"
                onClick={handleEnrollNow}
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-8 py-4 text-base font-extrabold text-white shadow-xl hover:bg-brand-500 transition-all cursor-pointer"
              >
                <span>মাত্র ২৯০ টাকায় সম্পূর্ণ সিলেবাস আনলক করুন</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* BONUSES (CLEAN, NO FAKE PRICE TAGS) */}
        <section className="section-padding bg-gradient-to-b from-[#070b14] via-[#0b1329] to-[#070b14] text-white border-t border-white/10">
          <div className="container-page">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-300">
                <Gift size={16} />
                <span>সম্পূর্ণ ফ্রি • ৪টি মেগা বোনাস প্যাক</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                কোর্সের সাথে সম্পূর্ণ ফ্রিতে পাচ্ছেন এক্সক্লুসিভ অ্যাসেটস
              </h2>
              <p className="text-sm sm:text-base text-ink-300">
                আজই ২৯০ টাকায় এনরোল করলে নিচের সমস্ত প্রিমিয়াম প্যাকগুলো পাবেন কোনো অতিরিক্ত ফি ছাড়াই।
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {AI_MOTION_COURSE.bonuses.map((bonus, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-amber-400/20 bg-black/50 p-6 hover:border-amber-400/40 transition-colors space-y-2.5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                      বোনাস #{idx + 1}
                    </span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-0.5 text-xs font-bold">
                      সম্পূর্ণ ফ্রি
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{bonus.title}</h3>
                  <p className="text-xs sm:text-sm text-ink-300 leading-relaxed">{bonus.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="section-padding bg-black text-white border-t border-white/10">
          <div className="container-page">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-400">
                স্টুডেন্ট ফিডব্যাক
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                স্টুডেন্টরা কী বলছেন?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {AI_MOTION_COURSE.reviews.map((rev, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-white/10 bg-[#070b14] p-7 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-ink-200 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">{rev.name}</h4>
                      <span className="text-xs text-ink-400">{rev.role}</span>
                    </div>
                    <span className="text-xs text-ink-500">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-[#070b14] text-white border-t border-white/10">
          <div className="container-page max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-400">
                সাধারণ জিজ্ঞাসা
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)
              </h2>
            </div>

            <div className="space-y-3.5">
              {AI_MOTION_COURSE.faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={18}
                        className={`text-ink-400 transition-transform duration-200 shrink-0 ml-3 ${
                          isOpen ? 'rotate-180 text-brand-400' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 text-sm text-ink-300 leading-relaxed border-t border-white/5 bg-black/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* WHATSAPP SUPPORT SECTION */}
        <section className="py-12 bg-black border-t border-white/10 text-white">
          <div className="container-page max-w-2xl mx-auto text-center space-y-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              ২৪/৭ স্টুডেন্ট হেল্পডেস্ক
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              যেকোনো প্রশ্ন বা পেমেন্ট সহায়তায় সরাসরি যোগাযোগ করুন
            </h3>
            <p className="text-sm text-ink-300">
              বিকাশ পেমেন্ট বা কোর্স অ্যাক্সেস সংক্রান্ত যেকোনো প্রয়োজনে আমাদের অফিসিয়াল হোয়াটসঅ্যাপে মেসেজ দিন:
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/8801798583122?text=Hello%20bdBeginner,%20I%20need%20help%20with%20AI%20Motion%20Masterclass"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-7 py-3.5 text-sm sm:text-base shadow-xl transition-all"
              >
                <MessageCircle size={20} className="fill-current" />
                <span>WhatsApp: +8801798583122</span>
              </a>
            </div>
          </div>
        </section>

        {/* BOTTOM FINAL CTA */}
        <section className="py-20 bg-gradient-to-t from-black via-[#0b1329] to-[#070b14] text-white text-center border-t border-white/10">
          <div className="container-page max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              এআই দিয়ে ভিডিও এডিটিংয়ের ভবিষ্যৎ আয়ত্ত করুন
            </h2>
            <p className="text-sm sm:text-base text-ink-300 max-w-xl mx-auto leading-relaxed">
              মাত্র ২৯০ টাকায় আজীবন এক্সেস নিন। ১০টি প্র্যাক্টিক্যাল ক্লাস (১ ঘণ্টা ৩০ মিনিট) ও সম্পূর্ণ ফ্রি সোর্স ফাইল দিয়ে আপনার ক্যারিয়ার এগিয়ে নিন।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleEnrollNow}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl ${
                  pendingOrder && !enrolled
                    ? 'bg-amber-600 hover:bg-amber-500'
                    : 'bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 hover:opacity-95'
                } px-9 py-4 text-base font-extrabold text-white shadow-2xl transition-all cursor-pointer`}
              >
                {pendingOrder && !enrolled ? (
                  <>
                    <Clock size={18} className="animate-pulse" />
                    <span>পেমেন্ট ভেরিফিকেশন পেন্ডিং</span>
                  </>
                ) : (
                  <>
                    <span>এখনই ২৯০ টাকায় ভর্তি হন</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* STICKY MOBILE BOTTOM BAR */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 border-t border-white/10 p-3.5 backdrop-blur-xl flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white font-sans">৳290</span>
              <span className="text-xs text-ink-500 line-through font-sans">৳5,000</span>
            </div>
            <span className="text-[11px] text-amber-400 font-bold block">১০টি ক্লাস • আজীবন এক্সেস</span>
          </div>

          <button
            type="button"
            onClick={handleEnrollNow}
            className={`inline-flex items-center gap-1.5 rounded-xl ${
              pendingOrder && !enrolled ? 'bg-amber-600 hover:bg-amber-500' : 'bg-brand-600 hover:bg-brand-500'
            } px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-colors cursor-pointer`}
          >
            {pendingOrder && !enrolled ? (
              <>
                <Clock size={14} className="animate-pulse" />
                <span>ভেরিফিকেশন পেন্ডিং</span>
              </>
            ) : (
              <>
                <span>এনরোল করুন (৳290)</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* FREE DEMO VIDEO MODAL (Mobile-first edge-to-edge layout with full rotation support) */}
        {isDemoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-black/95 backdrop-blur-2xl overflow-y-auto">
            <div className="relative w-full max-w-5xl sm:rounded-3xl bg-[#070b14] sm:bg-[#0b1329] border-0 sm:border border-white/15 p-0 sm:p-6 shadow-2xl text-white my-auto flex flex-col min-h-screen sm:min-h-0">
              
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-0 sm:pt-0 sm:pb-4 border-b border-white/10 shrink-0 bg-[#070b14]/95 sm:bg-transparent backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 shrink-0 border border-brand-500/30">
                    <Play size={16} className="fill-current" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        ফ্রি ডেমো ক্লাস
                      </span>
                      <span className="text-xs text-ink-400 font-mono hidden sm:inline">
                        সময়: {demoLesson.duration}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                      ১ম ক্লাস: {demoLesson.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsDemoModalOpen(false)}
                    className="h-9 w-9 rounded-full sm:rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-ink-200 hover:text-white transition-all flex items-center justify-center cursor-pointer border border-white/15"
                    title="বন্ধ করুন"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Video Player: 100% full width edge-to-edge on mobile! */}
              <div className="w-full my-0 sm:my-4 overflow-hidden sm:rounded-2xl shrink-0">
                <ProtectedVideoPlayer
                  courseId={AI_MOTION_COURSE.id}
                  lessonId={demoLesson.id}
                  title={`১ম ক্লাস (ফ্রি ডেমো): ${demoLesson.title}`}
                  youtubeId={demoLesson.youtubeId || 'B1l3tNihOZI'}
                  videoUrl={demoLesson.videoUrl}
                  isLocked={false}
                  onUnlockClick={handleEnrollNow}
                />
              </div>

              {/* Bottom Conversion Prompt */}
              <div className="p-3.5 sm:p-0 mt-2 sm:mt-2 grow sm:grow-0">
                <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/80 via-[#0a1020] to-brand-950/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xl">
                  <div className="w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles size={14} />
                        <span>অফার প্রাইস: মাত্র ২৯০ টাকা (নিয়মিত ৫,০০০ টাকা)</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-200 leading-relaxed">
                      সম্পূর্ণ কোর্সের ১০টি ক্লাস (দেড় ঘণ্টা), প্রম্পট লাইব্রেরি এবং সকল প্রজেক্ট ফাইলের আজীবন এক্সেস পেতে এখনই এনরোল করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDemoModalOpen(false);
                      handleEnrollNow();
                    }}
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 px-6 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-xl hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>সম্পূর্ণ কোর্স আনলক করুন (৳290)</span>
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 10-Second Special Discount Popup Modal */}
        <CourseDiscountModal
          isOpen={showDiscountModal}
          onClose={handleCloseDiscount}
          onClaim={handleClaimDiscount}
          originalPrice={290}
          discountAmount={50}
        />

      </div>
    </Layout>
  );
}
