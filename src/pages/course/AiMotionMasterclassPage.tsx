import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Play,
  Sparkles,
  Check,
  ShieldCheck,
  Clock,
  Infinity as InfinityIcon,
  ChevronDown,
  Gift,
  ArrowRight,
  DownloadCloud,
  Layers,
  Film,
  Bot,
  CheckCircle2,
  Lock,
  Headphones,
  X,
  MessageCircle,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Globe2,
} from 'lucide-react';
import '@/course-redesign.css';
import { Layout } from '@/components/layout/Layout';
import { AI_MOTION_COURSE, courseToProduct } from '@/data/aiMotionCourse';
import { CourseDiscountModal } from '@/components/course/CourseDiscountModal';
import { ProtectedVideoPlayer } from '@/components/course/ProtectedVideoPlayer';
import {
  isCourseEnrolled,
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

  const course = AI_MOTION_COURSE;
  const demoLesson = course.modules[0].lessons[0];
  const price = discountClaimed ? 240 : course.price;
  const featureIcons = [Film, Bot, Sparkles, DownloadCloud, InfinityIcon, Headphones];

  useEffect(() => {
    if (!isDemoModalOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    const dialog = document.getElementById('course-demo-dialog');
    const closeButton = dialog?.querySelector<HTMLButtonElement>('button');
    closeButton?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDemoModalOpen(false);
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href], input, [tabindex="0"]')).filter(el => !el.hasAttribute('disabled'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [isDemoModalOpen]);

  const purchaseLabel = enrolled ? 'ক্লাসরুমে যান' : pendingOrder ? 'পেমেন্ট যাচাই হচ্ছে' : 'এখনই শেখা শুরু করুন';

  return (
    <Layout>
      <div className="academy-course">
        {enrolled && <div className="academy-status academy-status-success"><div className="academy-container"><CheckCircle2 size={18} /><span>আপনার কোর্স এক্সেস সক্রিয়। নতুন কিছু তৈরির সময় এখনই।</span><Link to="/course/ai-motion/learn">ক্লাসরুমে যান <ArrowRight size={16} /></Link></div></div>}
        {pendingOrder && !enrolled && <div className="academy-status"><div className="academy-container"><Clock size={18} /><span>অর্ডার #{pendingOrder.orderNumber || 'Pending'} · আপনার পেমেন্ট যাচাই করা হচ্ছে।</span><Link to="/course/ai-motion/learn">স্ট্যাটাস দেখুন <ArrowRight size={16} /></Link></div></div>}

        <section className="academy-course-hero">
          <div className="academy-container">
            <nav className="academy-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><ChevronRight size={13} /><Link to="/products?category=courses">Courses</Link><ChevronRight size={13} /><span>AI Motion Masterclass</span></nav>
            <div className="academy-hero-grid">
              <div className="academy-hero-copy">
                <div className="academy-eyebrow"><span className="academy-live-dot" /> BDBEGINNER CREATIVE ACADEMY</div>
                <h1>Big ideas.<br /><span>Made to move.</span></h1>
                <h2>AI Motion Graphics Masterclass</h2>
                <p className="academy-hero-description">{course.tagline}</p>
                <div className="academy-hero-actions"><button type="button" onClick={handleEnrollNow} className="academy-btn academy-btn-primary">{purchaseLabel}<ArrowUpRight size={19} /></button><button type="button" onClick={handleWatchDemo} className="academy-btn academy-btn-quiet"><span className="academy-mini-play"><Play size={12} fill="currentColor" /></span>{enrolled ? 'ক্লাসগুলো দেখুন' : 'ফ্রি ক্লাস দেখুন'}</button></div>
                <div className="academy-hero-metadata"><span><BookOpen size={15} /> {course.totalLessons} practical lessons</span><span><Globe2 size={15} /> বাংলায় শিখুন</span><span><InfinityIcon size={16} /> Lifetime access</span></div>
              </div>
              <button type="button" className="academy-course-cover" onClick={handleWatchDemo} aria-label="Watch the free AI Motion Masterclass preview">
                <div className="academy-cover-top"><span>CREATIVE CLASS / 001</span><Sparkles size={21} /></div>
                <div className="academy-cover-title">AI<br /><span>MOTION.</span></div>
                <div className="academy-cover-orbit academy-cover-orbit-one" aria-hidden="true" /><div className="academy-cover-orbit academy-cover-orbit-two" aria-hidden="true" /><div className="academy-cover-sphere" aria-hidden="true" />
                <span className="academy-cover-play"><Play size={25} fill="currentColor" /></span>
                <div className="academy-cover-bottom"><span>FROM PROMPT TO PICTURE.</span><span>01:30:00 <ArrowUpRight size={16} /></span></div>
              </button>
            </div>
          </div>
        </section>

        <div className="academy-course-facts"><div className="academy-container"><div><Film size={23} /><span><strong>{course.totalLessons}টি ক্লাস</strong><small>হাতে-কলমে শেখার অভিজ্ঞতা</small></span></div><div><Clock size={23} /><span><strong>১ ঘণ্টা ৩০ মিনিট</strong><small>নিজের সুবিধামতো শিখুন</small></span></div><div><Layers size={23} /><span><strong>প্রজেক্ট ও প্রম্পট</strong><small>শেখার সঙ্গে কাজের রিসোর্স</small></span></div><div><InfinityIcon size={24} /><span><strong>আজীবন এক্সেস</strong><small>একবার কিনুন, বারবার শিখুন</small></span></div></div></div>

        <div className="academy-container academy-detail-grid">
          <div className="academy-detail-main">
            <nav className="academy-section-nav" aria-label="Course sections"><a href="#course-overview">Overview</a><a href="#course-curriculum">Curriculum</a><a href="#course-resources">Resources</a><a href="#course-faq">FAQs</a></nav>

            <section className="academy-content-section" id="course-overview">
              <p className="academy-eyebrow">A NEW CREATIVE SKILLSET</p><h2>শুধু দেখবেন না।<br /><span>নিজের মতো তৈরি করুন।</span></h2><p className="academy-section-description">সিনেমাটিক ভিজ্যুয়াল থেকে অটোমেটেড ভিডিও এডিটিং—প্রতিটি ক্লাসে শেখা টেকনিক সরাসরি আপনার কাজে ব্যবহার করুন।</p>
              <div className="academy-outcomes-grid">{course.features.map((feature, index) => { const Icon = featureIcons[index] || Sparkles; return <article className="academy-outcome" key={feature.title}><span className={`academy-feature-icon academy-feature-icon-${index % 3}`}><Icon size={22} strokeWidth={1.6} /></span><h3>{feature.title}</h3><p>{feature.desc}</p></article>; })}</div>
            </section>

            <section className="academy-content-section" id="course-curriculum">
              <div className="academy-section-title"><div><p className="academy-eyebrow">YOUR LEARNING ROADMAP</p><h2>ছোট ছোট ক্লাস।<br /><span>বড় একটা পরিবর্তন।</span></h2></div><span className="academy-count-tag">{course.totalLessons} lessons</span></div>
              <p className="academy-section-description">প্রথম ক্লাসটি ফ্রি দেখে নিন। কোর্সে এনরোল করলে সব ক্লাস ও রিসোর্স একসঙ্গে পাবেন।</p>
              <div className="academy-curriculum">{course.modules.map((module, moduleIndex) => { const isOpen = activeCurriculumMod === moduleIndex; return <div key={module.id} className="academy-module"><button type="button" className="academy-module-toggle" onClick={() => setActiveCurriculumMod(isOpen ? -1 : moduleIndex)} aria-expanded={isOpen} aria-controls={`curriculum-${module.id}`}><span className="academy-module-number">{String(module.moduleNumber).padStart(2, '0')}</span><span><strong>{module.title}</strong><small>{module.description}</small></span><ChevronDown size={19} className={isOpen ? 'is-open' : ''} /></button>{isOpen && <div id={`curriculum-${module.id}`} className="academy-lesson-list">{module.lessons.map(lesson => <div className="academy-lesson" key={lesson.id}><span className={`academy-lesson-icon ${lesson.isFreePreview ? 'is-free' : ''}`}>{lesson.isFreePreview || enrolled ? <Play size={14} /> : <Lock size={13} />}</span><div className="academy-lesson-copy"><h4>{lesson.title}</h4><span>{lesson.titleEn}</span></div>{lesson.isFreePreview && <button type="button" className="academy-preview-link" onClick={handleWatchDemo}>Free preview <ArrowUpRight size={13} /></button>}<span className="academy-lesson-duration">{lesson.duration}</span>{enrolled && !lesson.isFreePreview && <Link className="academy-preview-link" to="/course/ai-motion/learn" aria-label={`ক্লাস দেখুন: ${lesson.title}`}><ArrowUpRight size={16} /></Link>}</div>)}</div>}</div>; })}</div>
            </section>

            <section className="academy-content-section" id="course-resources"><div className="academy-resource-heading"><span className="academy-feature-icon academy-feature-icon-1"><Gift size={25} /></span><div><p className="academy-eyebrow">MORE ROOM TO CREATE</p><h2>কোর্সের সঙ্গেই<br /><span>আপনার ক্রিয়েটিভ টুলকিট।</span></h2></div></div><div className="academy-bonus-grid">{course.bonuses.map((bonus, index) => <article key={bonus.title}><span className="academy-bonus-number">0{index + 1}</span><h3>{bonus.title}</h3><p>{bonus.desc}</p><span className="academy-included"><Check size={13} /> Included with your course</span></article>)}</div></section>

            <section className="academy-instructor"><span className="academy-lab-mark"><Film size={32} strokeWidth={1.3} /></span><div><p className="academy-eyebrow">MEET YOUR CREATIVE GUIDE</p><h3>{course.instructor.name}</h3><p>{course.instructor.role}</p><p className="academy-instructor-bio">{course.instructor.bio}</p></div></section>

            <section className="academy-content-section" id="course-faq"><p className="academy-eyebrow">BEFORE YOU BEGIN</p><h2>প্রশ্ন থাকতেই পারে।<br /><span>উত্তর এখানেই।</span></h2><div className="academy-faq-list">{course.faqs.map((faq, index) => <div className="academy-faq" key={faq.q}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} aria-controls={`course-faq-${index}`}><span>{faq.q}</span><ChevronDown size={18} className={openFaq === index ? 'is-open' : ''} /></button>{openFaq === index && <p id={`course-faq-${index}`}>{faq.a}</p>}</div>)}</div></section>
          </div>

          <aside className="academy-purchase-column"><div className="academy-purchase-card"><div className="academy-purchase-top"><span className="academy-small-label">YOUR NEXT CHAPTER</span><span className="academy-course-type"><Film size={13} /> MASTERCLASS</span></div><h3>সৃজনশীলতার নতুন<br />দরজা খুলে দিন।</h3><div className="academy-purchase-price"><strong>৳{price}</strong><del>৳{discountClaimed ? course.price : course.originalPrice.toLocaleString('en-US')}</del><span>{discountClaimed ? '৳৫০ ছাড় সক্রিয়' : `${course.discountPercentage}% OFF`}</span></div><p className="academy-payment-note">এককালীন পেমেন্ট। আজীবন শেখার সুযোগ।</p><button type="button" onClick={handleEnrollNow} className="academy-btn academy-btn-primary">{purchaseLabel}<ArrowUpRight size={18} /></button><button type="button" onClick={handleWatchDemo} className="academy-btn academy-btn-outline"><Play size={15} />{enrolled ? 'ক্লাসগুলো দেখুন' : 'আগে ফ্রি ক্লাস দেখুন'}</button><div className="academy-purchase-includes"><p>EVERYTHING YOU NEED TO BEGIN</p>{['১০টি পূর্ণাঙ্গ প্র্যাক্টিক্যাল ক্লাস', 'বাংলায় সহজ ব্যাখ্যা ও গাইড', 'সোর্স ফাইল ও প্রম্পট লাইব্রেরি', 'সিনেমাটিক সাউন্ড ও প্রিসেট প্যাক', 'আজীবন কোর্স এক্সেস', 'স্টুডেন্ট সাপোর্ট'].map(item => <span key={item}><Check size={15} />{item}</span>)}</div><div className="academy-secure-note"><ShieldCheck size={16} /><span>বিকাশ অটোমেটিক ও ম্যানুয়াল পেমেন্ট সুবিধা। ম্যানুয়াল পেমেন্টে যাচাইয়ের পর এক্সেস।</span></div></div><div className="academy-help-card"><MessageCircle size={20} /><div><strong>একটু সাহায্য দরকার?</strong><Link to="/support">আমাদের টিমের সঙ্গে কথা বলুন <ArrowUpRight size={13} /></Link></div></div></aside>
        </div>

        <section className="academy-final-cta"><div className="academy-container"><div><p className="academy-eyebrow">YOUR IDEAS DESERVE TO BE SEEN.</p><h2>Let’s make<br /><span>something move.</span></h2></div><div><button type="button" onClick={handleEnrollNow} className="academy-btn academy-btn-primary">{purchaseLabel}<ArrowUpRight size={19} /></button><p>১০টি ক্লাস · বাংলায় শেখা · আজীবন এক্সেস</p></div></div></section>

        <div className="academy-mobile-purchase"><span><strong>৳{price}</strong><small>Lifetime course access</small></span><button type="button" onClick={handleEnrollNow} className="academy-btn academy-btn-primary">{purchaseLabel}<ArrowRight size={16} /></button></div>

        {isDemoModalOpen && <div className="academy-demo-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setIsDemoModalOpen(false); }}><div id="course-demo-dialog" className="academy-demo-dialog" role="dialog" aria-modal="true" aria-labelledby="course-demo-title"><div className="academy-demo-header"><div><span className="academy-small-label">A LITTLE PREVIEW OF WHAT’S POSSIBLE</span><h3 id="course-demo-title">প্রথম ক্লাস, সম্পূর্ণ ফ্রি।</h3></div><button type="button" onClick={() => setIsDemoModalOpen(false)} aria-label="Close course preview"><X size={21} /></button></div><ProtectedVideoPlayer courseId={course.id} lessonId={demoLesson.id} title={demoLesson.title} youtubeId={demoLesson.youtubeId} videoUrl={demoLesson.videoUrl} isLocked={false} onUnlockClick={handleEnrollNow} /><div className="academy-demo-footer"><p><strong>{demoLesson.title}</strong><span>শেখা চালিয়ে যেতে সম্পূর্ণ কোর্সটি আনলক করুন।</span></p><button type="button" className="academy-btn academy-btn-primary" onClick={() => { setIsDemoModalOpen(false); handleEnrollNow(); }}>সম্পূর্ণ কোর্স · ৳{price}<ArrowRight size={17} /></button></div></div></div>}
        <CourseDiscountModal isOpen={showDiscountModal && !isDemoModalOpen} onClose={handleCloseDiscount} onClaim={handleClaimDiscount} originalPrice={course.price} discountAmount={50} />
      </div>
    </Layout>
  );
}
