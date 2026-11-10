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
import '@/course-redesign.css';
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

  if (checking) {
    return <Layout><div className="academy-container academy-access-state"><div className="academy-access-card" role="status"><div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600" /><p className="academy-eyebrow">GETTING YOUR CLASSROOM READY</p><h1>একটু অপেক্ষা করুন।</h1><p>আপনার কোর্স এক্সেস যাচাই করা হচ্ছে।</p></div></div></Layout>;
  }
  if (pendingOrder) {
    return <Layout><div className="academy-container academy-access-state"><div className="academy-access-card"><Clock size={30} /><p className="academy-eyebrow">YOUR NEXT CHAPTER IS ALMOST HERE</p><h1>পেমেন্ট পেয়েছি।<br />যাচাই করেই শুরু করুন।</h1><p>আপনার ম্যানুয়াল পেমেন্ট ট্রানজেকশন আমাদের কাছে জমা হয়েছে। পেমেন্ট যাচাই করে অ্যাপ্রুভ করার সঙ্গে সঙ্গেই কোর্সের সব ক্লাস আনলক হয়ে যাবে।</p><div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">অর্ডার নম্বর: <strong>#{pendingOrder.orderNumber || 'Pending'}</strong><br />এই পেজ স্বয়ংক্রিয়ভাবে পেমেন্টের স্ট্যাটাস যাচাই করছে।</div><a className="academy-btn academy-btn-primary" href={`https://wa.me/8801798583122?text=${encodeURIComponent(`AI Motion Masterclass payment verification. Order: #${pendingOrder.orderNumber || ''}, Email: ${pendingOrder.email}`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />সাপোর্ট টিমকে জানান</a><button type="button" className="academy-btn academy-btn-outline" onClick={() => window.location.reload()}><RotateCw size={15} />স্ট্যাটাস আবার দেখুন</button><Link to="/account/courses" className="mt-5 inline-flex items-center gap-2 text-xs text-brand-600"><ArrowLeft size={14} />আমার কোর্সে ফিরে যান</Link></div></div></Layout>;
  }
  return <Layout><div className="academy-container academy-access-state"><div className="academy-access-card"><Lock size={30} /><p className="academy-eyebrow">A NEW CREATIVE CHAPTER AWAITS</p><h1>আপনার আইডিয়াগুলো<br />বাস্তবে রূপ দিন।</h1><p>AI Motion Masterclass-এর সব ক্লাস, সোর্স ফাইল ও প্রম্পট লাইব্রেরির এক্সেস পেতে কোর্সে এনরোল করুন। আগে কিনে থাকলে আপনার সঠিক অ্যাকাউন্টে লগইন করুন।</p><Link to="/course/ai-motion" className="academy-btn academy-btn-primary">কোর্সের বিস্তারিত দেখুন<ArrowRight size={16} /></Link><Link to="/login?redirect=%2Fcourse%2Fai-motion%2Flearn" className="academy-btn academy-btn-outline">আমার অ্যাকাউন্টে লগইন করুন<ArrowRight size={16} /></Link><Link to="/account/courses" className="mt-5 inline-flex items-center gap-2 text-xs text-brand-600"><ArrowLeft size={14} />আমার কোর্সে ফিরে যান</Link></div></div></Layout>;
}
export default CourseLearnPage;