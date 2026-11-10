import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Play, Film, Clock, CheckCircle2, ArrowRight, ArrowUpRight, MessageCircle, DownloadCloud, FileCode, RotateCw, BookOpen } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import { AI_MOTION_COURSE } from '@/data/aiMotionCourse';
import { isCourseEnrolled, getEnrollmentRecord, getCourseCompletionStats, syncCourseEnrollmentOnline, type CourseEnrollmentRecord } from '@/services/courseEnrollment';

export function AccountCoursesPage() {
  const { session, profile } = useCustomerAuth();
  const { isVip } = useMembership();
  const email = session?.user?.email || profile?.email;
  const totalLessons = AI_MOTION_COURSE.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const [enrolled, setEnrolled] = useState(() => isVip || isCourseEnrolled(AI_MOTION_COURSE.id, email));
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
          setPendingOrder(getEnrollmentRecord(AI_MOTION_COURSE.id, email));
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
    return () => { active = false; };
  }, [email, session?.user?.id, isVip]);

  return (
    <AccountLayout>
      <div className="my-courses-page">
        <header className="my-courses-heading">
          <div><span className="interior-eyebrow"><span />YOUR LEARNING JOURNEY</span><h1>My courses<span>.</span></h1><p>নতুন কিছু শেখার প্রতিটি ধাপ, এক জায়গায়।</p></div>
          <Link to="/courses" className="account-back-link">Explore courses<ArrowUpRight size={16} /></Link>
        </header>

        {pendingOrder && !enrolled && (
          <div className="course-pending-notice" role="status">
            <span className="course-pending-icon"><Clock size={22} /></span>
            <div><strong>পেমেন্ট যাচাই করা হচ্ছে</strong><p>অর্ডার <b>#{pendingOrder.orderNumber}</b> জমা হয়েছে। অনুমোদনের পর আপনার কোর্সটি স্বয়ংক্রিয়ভাবে সক্রিয় হবে।</p>
              <div className="course-pending-actions"><a href={`https://wa.me/8801798583122?text=${encodeURIComponent(`আসসালামু আলাইকুম, আমি AI মোশন কোর্সের জন্য পেমেন্ট করেছি। অর্ডার নম্বর: #${pendingOrder.orderNumber}, ইমেইল: ${email}। দয়া করে কোর্সটি অ্যাপ্রুভ করে দিন।`)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={14} />WhatsApp সাপোর্ট</a><button type="button" onClick={() => window.location.reload()}><RotateCw size={14} />স্ট্যাটাস চেক করুন</button></div>
            </div>
          </div>
        )}

        {loading ? <div className="account-loading-state" role="status"><span className="account-loading-spinner" /><span>আপনার কোর্স লোড হচ্ছে…</span></div> : enrolled ? (
          <>
            <div className="learning-stats-grid">
              <div><span className="learning-stat-icon"><BookOpen size={20} /></span><div><strong>01</strong><span>Active course</span></div></div>
              <div><span className="learning-stat-icon is-mint"><CheckCircle2 size={20} /></span><div><strong>{String(stats.completedCount).padStart(2, '0')}</strong><span>Lessons completed</span></div></div>
              <div><span className="learning-stat-icon is-peach"><GraduationCap size={20} /></span><div><strong>{stats.percentage}<small>%</small></strong><span>Course progress</span></div></div>
            </div>
            <article className="enrolled-course-card">
              <Link to="/course/ai-motion/learn" className="enrolled-course-art" aria-label="Open AI Motion classroom">
                <span className="enrolled-course-art-label"><Film size={14} />CREATIVE MASTERCLASS</span>
                <strong>MAKE<br />IT <em>MOVE.</em></strong>
                <span className="enrolled-course-play"><Play size={22} fill="currentColor" /></span>
                <span className="enrolled-course-art-bottom">AI + MOTION DESIGN<ArrowUpRight size={18} /></span>
              </Link>
              <div className="enrolled-course-details">
                <div className="enrolled-course-status"><span><i />সক্রিয় কোর্স</span><span>লাইফটাইম এক্সেস</span></div>
                <h2>{AI_MOTION_COURSE.title}</h2><p>{AI_MOTION_COURSE.tagline}</p>
                <div className="enrolled-course-meta"><span><Film size={14} />{totalLessons} ক্লাস</span><span><Clock size={14} />{AI_MOTION_COURSE.totalDuration}</span></div>
                <div className="enrolled-progress-label"><span>কোর্স অগ্রগতি</span><strong>{stats.completedCount}/{stats.totalLessons} ক্লাস · {stats.percentage}%</strong></div>
                <div className="enrolled-progress-track" role="progressbar" aria-label="কোর্স অগ্রগতি" aria-valuenow={stats.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, stats.percentage))}%` }} /></div>
                <div className="enrolled-course-actions"><Link to="/course/ai-motion/learn" className="account-primary-button"><Play size={15} fill="currentColor" />{stats.completedCount > 0 ? 'শেখা চালিয়ে যান' : 'ক্লাস শুরু করুন'}<ArrowRight size={17} /></Link><Link to="/course/ai-motion">কোর্স ওভারভিউ<ArrowUpRight size={15} /></Link></div>
              </div>
            </article>
            <div className="learning-resources-grid">
              <Link to="/course/ai-motion/learn"><span className="resource-link-icon"><DownloadCloud size={22} /></span><div><h3>প্রজেক্ট ফাইল ও সাউন্ড FX</h3><p>ক্লাসের রিসোর্স ও প্র্যাকটিস ফাইল ডাউনলোড করুন।</p><span>ক্লাসরুমে দেখুন<ArrowRight size={14} /></span></div></Link>
              <Link to="/course/ai-motion/learn"><span className="resource-link-icon is-lilac"><FileCode size={22} /></span><div><h3>AI প্রম্পট লাইব্রেরি</h3><p>Midjourney, Runway ও Kling-এর প্রম্পটগুলো দেখুন।</p><span>প্রম্পট এক্সপ্লোর করুন<ArrowRight size={14} /></span></div></Link>
            </div>
          </>
        ) : (
          <div className="learning-empty-state"><span className="learning-empty-icon"><GraduationCap size={36} strokeWidth={1.4} /></span><span className="interior-eyebrow">EVERY EXPERT STARTED SOMEWHERE</span><h2>আপনার পরের দক্ষতা<br />শুরু হোক এখানেই।</h2><p>এখনো কোনো কোর্সে এক্সেস সক্রিয় নেই। AI Motion Masterclass-এ সিনেমাটিক ভিডিও ও মোশন ডিজাইন শেখার প্রথম ধাপ নিন।</p><Link to="/course/ai-motion" className="account-primary-button">AI Motion Masterclass দেখুন<ArrowRight size={17} /></Link><Link to="/course/ai-motion?demo=1" className="learning-demo-link"><Play size={14} />আগে ফ্রি ডেমো দেখুন</Link></div>
        )}
      </div>
    </AccountLayout>
  );
}
export default AccountCoursesPage;
