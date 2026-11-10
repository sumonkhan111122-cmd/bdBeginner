import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Clock, DownloadCloud, FileText, Sparkles, ChevronLeft, ChevronRight, Copy, Check, ExternalLink, Lock, ArrowLeft, MessageCircle, Award, ArrowRight, Sun, Moon, PanelRightClose, PanelRightOpen, Maximize2, Minimize2, BookOpen, FolderArchive } from 'lucide-react';
import { AI_MOTION_COURSE, courseToProduct, type CourseLesson } from '@/data/aiMotionCourse';
import { ProtectedVideoPlayer } from './ProtectedVideoPlayer';
import { getCourseProgress, getCourseCompletionStats, saveLastActiveLesson, toggleLessonCompletion, getActiveCourseEmail, isCourseEnrolled } from '@/services/courseEnrollment';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import { useCart } from '@/context/CartContext';
import '@/course-redesign.css';

interface CourseLearningPortalProps {
  onBackToLanding?: () => void;
  enrolledEmail?: string | null;
  onOpenPurchaseModal?: () => void;
}
const course = AI_MOTION_COURSE;
const allLessons = course.modules.flatMap(module => module.lessons);
const tabs = [
  { id: 'resources', label: 'সোর্স ফাইল', icon: DownloadCloud },
  { id: 'overview', label: 'ক্লাস ওভারভিউ', icon: BookOpen },
  { id: 'prompts', label: 'AI প্রম্পট', icon: Sparkles },
  { id: 'support', label: 'সাপোর্ট', icon: MessageCircle },
] as const;
function savedPreference(key: string, fallback: string) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
export function CourseLearningPortal({ onBackToLanding, enrolledEmail, onOpenPurchaseModal }: CourseLearningPortalProps) {
  const navigate = useNavigate();
  const { session } = useCustomerAuth();
  const { isVip } = useMembership();
  const { addItem, clearCart } = useCart();
  const isEnrolled = isVip || isCourseEnrolled(course.id, session?.user?.email);
  const activeEmail = enrolledEmail || session?.user?.email || getActiveCourseEmail(course.id) || '';
  const [isDarkMode, setIsDarkMode] = useState(() => savedPreference('ai_motion_theme', 'light') === 'dark');
  const [showSidebar, setShowSidebar] = useState(() => savedPreference('ai_motion_sidebar', 'true') === 'true');
  const [isWideMode, setIsWideMode] = useState(() => savedPreference('ai_motion_wide', 'false') === 'true');
  const [progress, setProgress] = useState(() => getCourseProgress(course.id));
  const [completionStats, setCompletionStats] = useState(() => getCourseCompletionStats(course.id, allLessons.length));
  const [activeLessonId, setActiveLessonId] = useState(() => {
    const saved = getCourseProgress(course.id).lastLessonId;
    return allLessons.some(lesson => lesson.id === saved) ? saved : allLessons[0].id;
  });
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('resources');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copyError, setCopyError] = useState(false);
  const currentLesson = allLessons.find(lesson => lesson.id === activeLessonId) || allLessons[0];
  const currentIndex = allLessons.findIndex(lesson => lesson.id === currentLesson.id);
  const previousLesson = allLessons[currentIndex - 1];
  const nextLesson = allLessons[currentIndex + 1];
  const isCompleted = progress.completedLessons.includes(currentLesson.id);
  const totalCourseSeconds = allLessons.reduce((sum, lesson) => sum + lesson.durationSeconds, 0);
  const totalWatchedSeconds = useMemo(() => allLessons.reduce((sum, lesson) => sum + (progress.completedLessons.includes(lesson.id) ? lesson.durationSeconds : Math.min(lesson.durationSeconds, progress.playbackPositions[lesson.id] || 0)), 0), [progress]);
  const number = (value: number) => value.toLocaleString('bn-BD');
  useEffect(() => {
    const updateProgress = () => { setProgress(getCourseProgress(course.id)); setCompletionStats(getCourseCompletionStats(course.id, allLessons.length)); };
    window.addEventListener('course-progress-updated', updateProgress);
    return () => window.removeEventListener('course-progress-updated', updateProgress);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('ai_motion_theme', isDarkMode ? 'dark' : 'light');
      localStorage.setItem('ai_motion_sidebar', String(showSidebar));
      localStorage.setItem('ai_motion_wide', String(isWideMode));
    } catch { /* Preferences are optional when browser storage is unavailable. */ }
  }, [isDarkMode, showSidebar, isWideMode]);
  useEffect(() => {
    if (!copiedPromptId) return;
    const timer = window.setTimeout(() => setCopiedPromptId(null), 2500);
    return () => window.clearTimeout(timer);
  }, [copiedPromptId]);
  const selectLesson = (lesson: CourseLesson) => {
    setActiveLessonId(lesson.id); saveLastActiveLesson(course.id, lesson.id);
    setCopiedPromptId(null); setCopyError(false); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const toggleComplete = () => {
    toggleLessonCompletion(course.id, currentLesson.id); setProgress(getCourseProgress(course.id));
    setCompletionStats(getCourseCompletionStats(course.id, allLessons.length));
  };
  const copyPrompt = async (id: string, prompt: string) => {
    try { await navigator.clipboard.writeText(prompt); setCopiedPromptId(id); setCopyError(false); } catch { setCopyError(true); }
  };
  if (!isEnrolled) {
    return <div className={`academy-classroom ${isDarkMode ? 'is-dark' : ''}`}><div className="academy-container academy-access-state"><div className="academy-access-card"><Lock size={30} /><p className="academy-eyebrow">YOUR CREATIVE CLASSROOM</p><h2>শেখার যাত্রা শুরু করুন।</h2><p>সম্পূর্ণ ক্লাসরুম, প্রজেক্ট ফাইল ও প্রম্পট লাইব্রেরির এক্সেস পেতে কোর্সে এনরোল করুন।</p><button type="button" className="academy-btn academy-btn-primary" onClick={() => { clearCart(); addItem(courseToProduct(), 1, false); navigate('/checkout'); }}>কোর্সটি কিনুন · ৳{course.price}<ArrowRight size={16} /></button><button type="button" className="academy-btn academy-btn-outline" onClick={onBackToLanding || (() => navigate('/course/ai-motion'))}>কোর্সের বিস্তারিত দেখুন<ArrowRight size={16} /></button></div></div></div>;
  }
  return (
    <div className={`academy-classroom ${isDarkMode ? 'is-dark' : ''}`}>
      <header className="academy-class-header"><div className="academy-class-header-inner">
        <button type="button" className="academy-class-back" onClick={onBackToLanding || (() => navigate('/course/ai-motion'))} aria-label="Back to course overview"><ArrowLeft size={16} /></button>
        <Link to="/" className="academy-class-brand">bd<span>Beginner</span><span aria-hidden="true">.</span></Link>
        <div className="academy-class-header-divider" />
        <div className="academy-class-header-title"><strong>AI Motion Masterclass</strong><small>Your creative classroom</small></div>
        <div className="academy-class-tools">
          <button type="button" onClick={() => setIsWideMode(!isWideMode)} className={isWideMode ? 'is-active' : ''} aria-label={isWideMode ? 'Use standard width' : 'Use cinema width'} aria-pressed={isWideMode}>{isWideMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}</button>
          <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} aria-label={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'} aria-pressed={isDarkMode}>{isDarkMode ? <Sun size={15} /> : <Moon size={15} />}</button>
          <button type="button" className={showSidebar ? 'is-active' : ''} onClick={() => setShowSidebar(!showSidebar)} aria-label={showSidebar ? 'Hide course playlist' : 'Show course playlist'} aria-pressed={showSidebar}>{showSidebar ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}</button>
        </div>
        <span className="academy-class-avatar" title={activeEmail || 'Student'}>{(activeEmail[0] || 'S').toUpperCase()}</span>
      </div></header>
      <main className={`academy-class-workspace ${isWideMode ? 'is-wide' : ''}`}>
        <div className="academy-class-heading"><div><p className="academy-class-kicker">KEEP LEARNING. KEEP CREATING.</p><h1>{currentLesson.title}</h1></div><span><Clock size={13} /> ক্লাস {number(currentIndex + 1)} / {number(allLessons.length)} · {currentLesson.duration}</span></div>
        <div className={`academy-class-grid ${showSidebar ? '' : 'is-focused'}`}>
          <div className="academy-class-main">
            <div className="academy-class-video"><ProtectedVideoPlayer courseId={course.id} lessonId={currentLesson.id} title={`${currentLesson.lessonNumber}. ${currentLesson.title}`} youtubeId={currentLesson.youtubeId} videoUrl={currentLesson.videoUrl} isLocked={!isEnrolled && !currentLesson.isFreePreview} onUnlockClick={onOpenPurchaseModal} onEnded={() => { if (nextLesson) selectLesson(nextLesson); }} onNextLesson={nextLesson ? () => selectLesson(nextLesson) : undefined} hasNextLesson={!!nextLesson} /></div>
            <div className="academy-class-actionbar"><button type="button" className={`academy-complete-btn ${isCompleted ? 'is-complete' : ''}`} onClick={toggleComplete} aria-pressed={isCompleted}><CheckCircle2 size={17} />{isCompleted ? 'ক্লাস সম্পন্ন হয়েছে' : 'সম্পন্ন হিসেবে চিহ্নিত করুন'}</button><div className="academy-class-navigation"><button type="button" disabled={!previousLesson} onClick={() => previousLesson && selectLesson(previousLesson)}><ChevronLeft size={14} />আগের ক্লাস</button><button type="button" disabled={!nextLesson} onClick={() => nextLesson && selectLesson(nextLesson)}>পরের ক্লাস<ChevronRight size={14} /></button></div></div>
            <section className="academy-class-tabs-panel">
              <div className="academy-class-tabs" role="tablist" aria-label="Lesson information">{tabs.map(tab => <button type="button" key={tab.id} role="tab" id={`lesson-tab-${tab.id}`} aria-selected={activeTab === tab.id} aria-controls={`lesson-panel-${tab.id}`} onClick={() => setActiveTab(tab.id)}><tab.icon size={16} />{tab.label}</button>)}</div>
              <div className="academy-class-tab-content" role="tabpanel" id={`lesson-panel-${activeTab}`} aria-labelledby={`lesson-tab-${activeTab}`}>
                {activeTab === 'overview' && <div><p className="academy-class-kicker">LESSON {String(currentIndex + 1).padStart(2, '0')} / OVERVIEW</p><h2>{currentLesson.title}</h2><p>{currentLesson.summary}</p><ul>{currentLesson.keyPoints.map(point => <li key={point}><CheckCircle2 size={16} /><span>{point}</span></li>)}</ul></div>}
                {activeTab === 'resources' && <div><p className="academy-class-kicker">LESSON RESOURCES / INCLUDED WITH YOUR COURSE</p><h2>শেখা থেকে তৈরি করার পথে।</h2><p>ক্লাসের সোর্স ফাইল ডাউনলোড করুন। নিজের প্রজেক্টে টেকনিকগুলো ব্যবহার করে দেখুন।</p><div className="academy-class-resource-grid">{currentLesson.resources?.length ? currentLesson.resources.map(resource => <article className="academy-class-resource" key={resource.id}>{resource.type === 'zip' ? <FolderArchive size={26} /> : <FileText size={26} />}<h3>{resource.title}</h3><p>{resource.description}</p>{resource.downloadUrl && resource.downloadUrl !== '#' ? <a href={resource.downloadUrl} target="_blank" rel="noopener noreferrer"><DownloadCloud size={14} />ডাউনলোড · {resource.size}<ExternalLink size={12} /></a> : <span>ডাউনলোড লিংক এখনো যুক্ত হয়নি</span>}</article>) : <><article className="academy-class-resource"><FolderArchive size={26} /><h3>Motion Style Kit v2</h3><p>কোর্সের মোশন গ্রাফিক্স স্টাইল কিট, সিনেমাটিক কম্পোজিশন টেমপ্লেট ও প্রজেক্ট ফাইল।</p><a href="https://founders.com.bd/attachments/28" target="_blank" rel="noopener noreferrer"><DownloadCloud size={14} />স্টাইল কিট ডাউনলোড<ExternalLink size={12} /></a></article><article className="academy-class-resource"><FileText size={26} /><h3>Lesson Resource Guide v3</h3><p>এআই মোশন মাস্টারক্লাসের রোডম্যাপ, এআই সাইট ডিরেক্টরি ও প্র্যাকটিস গাইড।</p><a href="https://founders.com.bd/attachments/45" target="_blank" rel="noopener noreferrer"><DownloadCloud size={14} />পিডিএফ গাইড ডাউনলোড<ExternalLink size={12} /></a></article></>}</div><div className="academy-class-bonus-list"><h3>আপনার ক্রিয়েটিভ টুলকিট</h3><div>{course.bonuses.map(bonus => <article key={bonus.title}><h4>{bonus.title}</h4><p>{bonus.desc}</p></article>)}</div></div></div>}
                {activeTab === 'prompts' && <div><p className="academy-class-kicker">THE PROMPT LIBRARY</p><h2>একটি প্রম্পট। অসংখ্য সম্ভাবনা।</h2><p>ক্লাসের প্রম্পট কপি করে আপনার পছন্দের AI টুলে ব্যবহার করুন।</p>{currentLesson.prompts?.length ? currentLesson.prompts.map(prompt => <article className="academy-class-prompt" key={prompt.id}><div><div><span>{prompt.tool}</span><h3>{prompt.title}</h3></div><button type="button" onClick={() => copyPrompt(prompt.id, prompt.prompt)}>{copiedPromptId === prompt.id ? <Check size={14} /> : <Copy size={14} />}{copiedPromptId === prompt.id ? 'কপি হয়েছে' : 'কপি করুন'}</button></div><pre>{prompt.prompt}</pre></article>) : <div className="academy-class-empty">এই ক্লাসের জন্য আলাদা প্রম্পট যুক্ত হয়নি। অন্যান্য ক্লাসের প্রম্পট এবং সোর্স ফাইল থেকে অনুশীলন করুন।</div>}{copyError && <p role="status">কপি করা যায়নি। প্রম্পটের লেখা নির্বাচন করে কপি করুন।</p>}</div>}
                {activeTab === 'support' && <div><p className="academy-class-kicker">YOU DON’T HAVE TO FIGURE IT OUT ALONE.</p><h2>আপনার পাশে আছি।</h2><p>কোনো টেকনিক বুঝতে সমস্যা হলে বা কোর্স সংক্রান্ত প্রশ্ন থাকলে আমাদের জানান।</p><div className="academy-class-support"><div><MessageCircle size={25} /><h3>স্টুডেন্ট হেল্পডেস্ক</h3><p>কোর্স ইন্সট্রাক্টর ও সাপোর্ট টিমের সঙ্গে WhatsApp-এ কথা বলুন।</p><a href="https://wa.me/8801798583122?text=AI%20Motion%20Masterclass%20Support" target="_blank" rel="noopener noreferrer">WhatsApp-এ মেসেজ দিন ↗</a></div><div><Award size={25} /><h3>প্রজেক্ট ও সার্টিফিকেট</h3><p>{completionStats.percentage >= 100 ? 'সব ক্লাস সম্পন্ন করেছেন। প্রজেক্ট রিভিউ ও সার্টিফিকেটের জন্য সাপোর্ট টিমের সঙ্গে যোগাযোগ করুন।' : `এখন পর্যন্ত ${number(completionStats.completedCount)}টি ক্লাস সম্পন্ন। সব ক্লাস শেষে প্রজেক্ট রিভিউ ও সার্টিফিকেটের জন্য যোগাযোগ করুন।`}</p><a href="https://wa.me/8801798583122?text=AI%20Motion%20Masterclass%20Project%20Review%20and%20Certificate" target="_blank" rel="noopener noreferrer">সার্টিফিকেট সম্পর্কে জানুন ↗</a></div></div></div>}
              </div>
            </section>
          </div>
          {showSidebar && <aside className="academy-class-playlist" aria-label="Course playlist"><div className="academy-class-progress"><div><h2>Your learning path</h2><strong>{number(completionStats.percentage)}%</strong></div><p>{number(completionStats.completedCount)} / {number(allLessons.length)} ক্লাস সম্পন্ন · একটু একটু করে এগিয়ে যান।</p><div className="academy-progress-track" role="progressbar" aria-valuenow={completionStats.percentage} aria-valuemin={0} aria-valuemax={100} aria-label="Course completion"><div style={{ width: `${completionStats.percentage}%` }} /></div><div className="academy-class-progress-stats"><span>{number(Math.floor(totalWatchedSeconds / 60))} মিনিট দেখা হয়েছে</span><span>{number(Math.ceil(Math.max(0, totalCourseSeconds - totalWatchedSeconds) / 60))} মিনিট বাকি</span></div></div><div className="academy-class-playlist-scroll">{course.modules.map(module => <div key={module.id}><div className="academy-class-module-title">MODULE {String(module.moduleNumber).padStart(2, '0')} · {module.lessons.length} LESSONS</div>{module.lessons.map(lesson => { const complete = progress.completedLessons.includes(lesson.id); const active = activeLessonId === lesson.id; const percent = complete ? 100 : Math.min(99, Math.round(((progress.playbackPositions[lesson.id] || 0) / lesson.durationSeconds) * 100)); return <button type="button" key={lesson.id} className={`academy-playlist-lesson ${active ? 'is-active' : ''} ${complete ? 'is-completed' : ''}`} aria-current={active ? 'true' : undefined} onClick={() => selectLesson(lesson)}><span className="academy-playlist-number">{complete ? <Check size={14} /> : active ? <Play size={12} fill="currentColor" /> : lesson.lessonNumber}</span><span className="academy-playlist-copy"><h3>{lesson.title}</h3><div><span>{lesson.duration} · {lesson.isFreePreview ? 'Free preview' : `${number(percent)}% দেখা হয়েছে`}</span><span>{complete ? 'সম্পন্ন' : active ? 'চলছে' : ''}</span></div>{percent > 0 && <div className="academy-progress-track"><div style={{ width: `${percent}%` }} /></div>}</span></button>; })}</div>)}</div></aside>}
        </div>
      </main>
    </div>
  );
}