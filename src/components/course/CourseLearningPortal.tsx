import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  CheckCircle2,
  Clock,
  DownloadCloud,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Lock,
  ArrowLeft,
  MessageCircle,
  Award,
  ArrowRight,
  Sun,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  ListVideo,
  FolderArchive,
  FileCode,
  BookOpen,
  Music,
  Sliders,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { AI_MOTION_COURSE, courseToProduct, type CourseLesson } from '@/data/aiMotionCourse';
import { ProtectedVideoPlayer } from './ProtectedVideoPlayer';
import {
  getCourseProgress,
  getCourseCompletionStats,
  saveLastActiveLesson,
  toggleLessonCompletion,
  getActiveCourseEmail,
  isCourseEnrolled,
} from '@/services/courseEnrollment';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import { useCart } from '@/context/CartContext';

interface CourseLearningPortalProps {
  onBackToLanding?: () => void;
  enrolledEmail?: string | null;
  onOpenPurchaseModal?: () => void;
}

export function CourseLearningPortal({
  onBackToLanding,
  enrolledEmail,
  onOpenPurchaseModal,
}: CourseLearningPortalProps) {
  const navigate = useNavigate();
  const { session } = useCustomerAuth();
  const { isVip } = useMembership();
  const { addItem, clearCart } = useCart();

  const isEnrolled = isVip || isCourseEnrolled(AI_MOTION_COURSE.id, session?.user?.email);
  const activeEmail =
    enrolledEmail ||
    session?.user?.email ||
    getActiveCourseEmail(AI_MOTION_COURSE.id) ||
    'student@gmail.com';

  // 1. Theme State: Default is Dark Mode, toggleable to White/Light Mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ai_motion_theme');
      return saved !== null ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ai_motion_theme', next ? 'dark' : 'light');
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 2. Sidebar Visibility State: Hide / Show sidebar column
  const [showSidebar, setShowSidebar] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ai_motion_sidebar');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const toggleSidebar = () => {
    setShowSidebar((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ai_motion_sidebar', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // 3. Widescreen / Cinema Mode State
  const [isWideMode, setIsWideMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('ai_motion_wide') === 'true';
    } catch {
      return false;
    }
  });

  const toggleWideMode = () => {
    setIsWideMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('ai_motion_wide', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Strict Protection Guard: If not enrolled, show clean locked card
  if (!isEnrolled) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 font-sans ${
          isDarkMode ? 'bg-[#070b14] text-white' : 'bg-slate-50 text-slate-900'
        }`}
      >
        <div
          className={`max-w-md w-full rounded-3xl p-8 text-center space-y-6 shadow-2xl border ${
            isDarkMode
              ? 'bg-[#0b1329] border-white/10 text-white'
              : 'bg-white border-slate-200 text-slate-900'
          }`}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Lock size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-bold">কোর্সটি লক করা রয়েছে</h2>
            <p
              className={`mt-2 text-sm leading-relaxed ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              এই লার্নিং পোর্টালের ক্লাসগুলো দেখার জন্য আপনাকে প্রথমে কোর্সটি কিনতে হবে। মাত্র ২৯০
              টাকায় আজীবন এক্সেস পান।
            </p>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                clearCart();
                addItem(courseToProduct(), 1, false);
                navigate('/checkout');
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-6 py-3.5 text-base font-bold text-white shadow-lg transition-all cursor-pointer"
            >
              <span>এখনই কোর্সটি কিনুন (৳290)</span>
              <ArrowRight size={18} />
            </button>
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                ফ্রি ডেমো দেখুন ও কোর্সের বিস্তারিত
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // All 10 lessons from Module 1
  const allLessons = useMemo(() => {
    return AI_MOTION_COURSE.modules.flatMap((m) => m.lessons);
  }, []);

  // Saved progress state
  const [progress, setProgress] = useState(() => getCourseProgress(AI_MOTION_COURSE.id));
  const [completionStats, setCompletionStats] = useState(() =>
    getCourseCompletionStats(AI_MOTION_COURSE.id, allLessons.length)
  );

  // Active lesson state
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    const saved = getCourseProgress(AI_MOTION_COURSE.id);
    if (saved.lastLessonId && allLessons.some((l) => l.id === saved.lastLessonId)) {
      return saved.lastLessonId;
    }
    return allLessons[0]?.id || 'lesson-1';
  });

  // Active tab: 'resources' | 'overview' | 'prompts' | 'support' (Source files is 1st priority)
  const [activeTab, setActiveTab] = useState<'resources' | 'overview' | 'prompts' | 'support'>(
    'resources'
  );

  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Current lesson
  const currentLesson = useMemo(() => {
    return allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  }, [allLessons, activeLessonId]);

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const isCompleted = progress.completedLessons.includes(currentLesson.id);
  const isCurrentLessonLocked = !isEnrolled && !currentLesson.isFreePreview;

  // Listen for progress updates
  useEffect(() => {
    const updateStats = () => {
      const p = getCourseProgress(AI_MOTION_COURSE.id);
      setProgress(p);
      setCompletionStats(getCourseCompletionStats(AI_MOTION_COURSE.id, allLessons.length));
    };

    window.addEventListener('course-progress-updated', updateStats);
    return () => window.removeEventListener('course-progress-updated', updateStats);
  }, [allLessons.length]);

  // Bengali numeral formatter
  const toBengaliNumber = (num: number | string): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/[0-9]/g, (d) => bengaliDigits[parseInt(d, 10)]);
  };

  // Total Course duration in seconds
  const totalCourseSeconds = useMemo(() => {
    return allLessons.reduce((sum, l) => sum + (l.durationSeconds || 600), 0);
  }, [allLessons]);

  // Overall course watched & remaining metrics
  const { totalWatchedMinutes, totalRemainingMinutes } = useMemo(() => {
    const watched = allLessons.reduce((sum, l) => {
      if (progress.completedLessons?.includes(l.id)) {
        return sum + (l.durationSeconds || 600);
      }
      return sum + Math.min(l.durationSeconds || 600, progress.playbackPositions?.[l.id] || 0);
    }, 0);
    const remaining = Math.max(0, totalCourseSeconds - watched);
    return {
      totalWatchedMinutes: Math.floor(watched / 60),
      totalRemainingMinutes: Math.ceil(remaining / 60),
    };
  }, [allLessons, progress, totalCourseSeconds]);

  // Current Lesson progress & remaining time
  const currentWatchedSeconds = progress.playbackPositions?.[currentLesson.id] || 0;
  const currentTotalSeconds = currentLesson.durationSeconds || 600;
  const currentPercent = isCompleted
    ? 100
    : Math.min(99, Math.round((currentWatchedSeconds / currentTotalSeconds) * 100));
  const currentRemainingSec = isCompleted ? 0 : Math.max(0, currentTotalSeconds - currentWatchedSeconds);
  const currentRemainingMin = Math.ceil(currentRemainingSec / 60);

  const handleSelectLesson = (lesson: CourseLesson) => {
    setActiveLessonId(lesson.id);
    saveLastActiveLesson(AI_MOTION_COURSE.id, lesson.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCurrentComplete = () => {
    toggleLessonCompletion(AI_MOTION_COURSE.id, currentLesson.id);
    const p = getCourseProgress(AI_MOTION_COURSE.id);
    setProgress(p);
    setCompletionStats(getCourseCompletionStats(AI_MOTION_COURSE.id, allLessons.length));
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  // Color theme utility classes
  const theme = {
    bg: isDarkMode ? 'bg-[#070b14]' : 'bg-[#f8fafc]',
    textPrimary: isDarkMode ? 'text-white' : 'text-slate-900',
    textSecondary: isDarkMode ? 'text-slate-300' : 'text-slate-600',
    textMuted: isDarkMode ? 'text-slate-400' : 'text-slate-500',
    headerBg: isDarkMode
      ? 'bg-[#070b14]/95 border-white/10'
      : 'bg-white/95 border-slate-200 shadow-sm',
    cardBg: isDarkMode ? 'bg-[#0b1329]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm',
    cardSubtle: isDarkMode ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200',
    tabBarBg: isDarkMode ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200',
    itemActive: isDarkMode
      ? 'bg-brand-500/15 border-brand-500 text-white'
      : 'bg-brand-50 border-brand-500 text-brand-950 font-semibold',
    itemInactive: isDarkMode
      ? 'hover:bg-white/5 border-transparent text-slate-300 hover:text-white'
      : 'hover:bg-slate-100 border-transparent text-slate-700 hover:text-slate-950',
    border: isDarkMode ? 'border-white/10' : 'border-slate-200',
  };

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.textPrimary} font-sans transition-colors duration-200 selection:bg-brand-500 selection:text-white`}
    >
      {/* 1. TOP MINIMALIST HEADER BAR */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl ${theme.headerBg}`}>
        <div
          className={`${
            isWideMode ? 'w-full px-4 sm:px-6' : 'max-w-[1700px] px-3 sm:px-6'
          } mx-auto flex h-16 items-center justify-between gap-3 transition-all duration-300`}
        >
          {/* Left: Back Link & Lesson Title */}
          <div className="flex items-center gap-3 min-w-0">
            {onBackToLanding ? (
              <button
                type="button"
                onClick={onBackToLanding}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="কোর্স ওভারভিউ পেজে ফিরে যান"
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">ওভারভিউ</span>
              </button>
            ) : (
              <Link
                to="/"
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors shrink-0 ${
                  isDarkMode
                    ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <ArrowLeft size={15} />
                <span className="hidden sm:inline">হোম</span>
              </Link>
            )}

            <div className="h-5 w-px bg-slate-700/30 hidden sm:block" />

            <div className="min-w-0">
              <span className="text-[11px] font-bold text-brand-500 uppercase tracking-wider block leading-none">
                ক্লাস {currentLesson.lessonNumber} / ১০
              </span>
              <h1 className="text-xs sm:text-sm font-bold truncate mt-0.5 leading-snug">
                {currentLesson.title}
              </h1>
            </div>
          </div>

          {/* Right Action Controls: Progress, Wide Toggle, Theme Switcher, Sidebar Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Progress Pill */}
            <div
              className={`hidden md:flex items-center gap-2.5 rounded-lg border px-3 py-1.5 text-xs font-bold ${
                isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'
              }`}
            >
              <div className="w-16 bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${completionStats.percentage}%` }}
                />
              </div>
              <span className="text-brand-500 font-mono text-[11px]">
                {completionStats.completedCount}/১০
              </span>
            </div>

            {/* Widescreen / Cinema Mode Toggle */}
            <button
              type="button"
              onClick={toggleWideMode}
              className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isWideMode
                  ? 'border-brand-500 text-brand-500 bg-brand-500/10'
                  : isDarkMode
                  ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isWideMode ? 'স্ট্যান্ডার্ড প্রস্থে ফিরুন' : 'ওয়াইড স্ক্রিন / ফুলস্ক্রিন করুন'}
            >
              {isWideMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isDarkMode
                  ? 'border-white/10 bg-white/5 text-amber-300 hover:text-amber-200 hover:bg-white/10'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={isDarkMode ? 'হোয়াইট মোড (White Mode)' : 'ডার্ক মোড (Dark Mode)'}
            >
              {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Sidebar Toggle Button */}
            <button
              type="button"
              onClick={toggleSidebar}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                showSidebar
                  ? 'bg-brand-600 text-white border-brand-500 shadow-sm'
                  : isDarkMode
                  ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={showSidebar ? 'প্লেলিস্ট লুকান (Hide Sidebar)' : 'প্লেলিস্ট দেখান (Show Sidebar)'}
            >
              {showSidebar ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
              <span className="hidden sm:inline">
                {showSidebar ? 'সাইডবার লুকান' : 'প্লেলিস্ট দেখান'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN WIDESCREEN LMS WORKSPACE */}
      <main
        className={`${
          isWideMode ? 'w-full px-2 sm:px-4' : 'max-w-[1700px] px-3 sm:px-6'
        } py-4 sm:py-6 mx-auto transition-all duration-300`}
      >
        <div
          className={`grid gap-5 lg:gap-6 items-start ${
            showSidebar ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {/* LEFT / CENTER COLUMN: Video Player & Details */}
          <div
            className={`${
              showSidebar ? 'lg:col-span-8 xl:col-span-8 2xl:col-span-9' : 'w-full max-w-[1500px] mx-auto'
            } space-y-4`}
          >
            {/* Custom Video Player Component */}
            <div className="w-full">
              <ProtectedVideoPlayer
                courseId={AI_MOTION_COURSE.id}
                lessonId={currentLesson.id}
                title={`${currentLesson.lessonNumber}. ${currentLesson.title}`}
                youtubeId={currentLesson.youtubeId}
                videoUrl={currentLesson.videoUrl}
                isLocked={isCurrentLessonLocked}
                onUnlockClick={onOpenPurchaseModal}
                onEnded={() => {
                  if (nextLesson && (!isCurrentLessonLocked || isEnrolled)) {
                    handleSelectLesson(nextLesson);
                  }
                }}
                onNextLesson={nextLesson ? () => handleSelectLesson(nextLesson) : undefined}
                hasNextLesson={!!nextLesson}
              />
            </div>

            {/* Clean Under-Player Action Toolbar */}
            <div
              className={`flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border ${theme.cardBg}`}
            >
              {/* Mark Completed & Live Remaining Tracker */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleCurrentComplete}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                      : isDarkMode
                      ? 'bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-white/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <CheckCircle2
                    size={17}
                    className={isCompleted ? 'text-emerald-400 fill-emerald-500/20' : 'text-slate-400'}
                  />
                  <span>
                    {isCompleted ? 'ক্লাস সম্পন্ন হয়েছে ✅' : 'সম্পন্ন হিসেবে চিহ্নিত করুন'}
                  </span>
                </button>

                {/* Live Lesson Watch & Remaining Time Tracking Pill */}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono ${
                    isCompleted
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold'
                      : currentPercent > 0
                      ? isDarkMode
                        ? 'border-brand-500/30 bg-brand-500/10 text-brand-300'
                        : 'border-brand-200 bg-brand-50 text-brand-800'
                      : isDarkMode
                      ? 'border-white/10 bg-white/5 text-slate-400'
                      : 'border-slate-200 bg-slate-100 text-slate-600'
                  }`}
                >
                  <Clock size={13} className={isCompleted ? 'text-emerald-400' : 'text-brand-400'} />
                  <span>
                    {isCompleted
                      ? 'সম্পূর্ণ দেখা হয়েছে (১০০%)'
                      : currentPercent > 0
                      ? `${toBengaliNumber(currentPercent)}% দেখা হয়েছে • বাকি ${toBengaliNumber(currentRemainingMin)} মিনিট`
                      : `মোট সময়সীমা: ${currentLesson.duration}`}
                  </span>
                </div>
              </div>

              {/* Prev / Next Buttons & Sidebar Toggle when hidden */}
              <div className="flex items-center gap-2">
                {!showSidebar && (
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer mr-1 ${
                      isDarkMode
                        ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="প্লেলিস্ট সাইডবার খুলুন"
                  >
                    <ListVideo size={15} />
                    <span>প্লেলিস্ট (১০টি)</span>
                  </button>
                )}

                <button
                  type="button"
                  disabled={!previousLesson}
                  onClick={() => previousLesson && handleSelectLesson(previousLesson)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer ${
                    isDarkMode
                      ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ChevronLeft size={16} />
                  <span>আগের ক্লাস</span>
                </button>

                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && handleSelectLesson(nextLesson)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-xs sm:text-sm font-bold text-white hover:bg-brand-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
                >
                  <span>পরবর্তী ক্লাস</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* TABBED DETAILS SECTION (Overview, Resources, Prompts, Support) */}
            <div className={`rounded-2xl border overflow-hidden ${theme.cardBg}`}>
              {/* Tab Navigation: 1st Source Files, 2nd Overview, 3rd Prompts, 4th Support */}
              <div className={`flex border-b overflow-x-auto ${theme.tabBarBg}`}>
                {/* 1st Tab: Source Files */}
                <button
                  type="button"
                  onClick={() => setActiveTab('resources')}
                  className={`inline-flex items-center gap-2.5 px-5 sm:px-7 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'resources'
                      ? 'border-brand-500 text-brand-500 bg-brand-500/[0.05]'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <DownloadCloud
                    size={17}
                    className={activeTab === 'resources' ? 'text-brand-500' : 'text-slate-400'}
                  />
                  <span>১. সোর্স ফাইল ও প্রজেক্ট এসেটস</span>
                  {currentLesson.resources && currentLesson.resources.length > 0 && (
                    <span className="rounded-full bg-brand-500/20 text-brand-500 px-2.5 py-0.5 text-[11px] font-extrabold font-mono">
                      {toBengaliNumber(currentLesson.resources.length)}টি ফাইল
                    </span>
                  )}
                  <span className="rounded-full bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    ফ্রি
                  </span>
                </button>

                {/* 2nd Tab: Class Overview */}
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`inline-flex items-center gap-2 px-5 sm:px-7 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-brand-500 text-brand-500 bg-brand-500/[0.05]'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <BookOpen
                    size={16}
                    className={activeTab === 'overview' ? 'text-brand-500' : 'text-slate-400'}
                  />
                  <span>২. ক্লাস ওভারভিউ ও গাইড</span>
                </button>

                {/* 3rd Tab: AI Prompts */}
                <button
                  type="button"
                  onClick={() => setActiveTab('prompts')}
                  className={`inline-flex items-center gap-1.5 px-5 sm:px-7 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'prompts'
                      ? 'border-brand-500 text-brand-500 bg-brand-500/[0.05]'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Sparkles
                    size={14}
                    className={activeTab === 'prompts' ? 'text-amber-400' : 'text-amber-500/70'}
                  />
                  <span>৩. এআই প্রম্পট লাইব্রেরি</span>
                </button>

                {/* 4th Tab: Support & Certificate */}
                <button
                  type="button"
                  onClick={() => setActiveTab('support')}
                  className={`inline-flex items-center gap-2 px-5 sm:px-7 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'support'
                      ? 'border-brand-500 text-brand-500 bg-brand-500/[0.05]'
                      : isDarkMode
                      ? 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Award
                    size={16}
                    className={activeTab === 'support' ? 'text-brand-500' : 'text-slate-400'}
                  />
                  <span>৪. সহায়তা ও সার্টিফিকেট</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 sm:p-8">
                {/* 1. SOURCE FILES TAB (Primary First Tab) */}
                {activeTab === 'resources' && (
                  <div className="space-y-8 animate-fade-in">
                    {/* Header with large typography & badges */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 dark:border-white/10">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Sparkles size={13} className="text-emerald-400" />
                            <span>১০০% ফ্রি লাইফটাইম এক্সেস</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-500/20 text-brand-400 border border-brand-500/30">
                            ক্লাস {toBengaliNumber(currentLesson.lessonNumber)} এর সমস্ত ফাইল
                          </span>
                        </div>
                        <h3 className={`text-xl sm:text-2xl lg:text-3xl font-black ${theme.textPrimary}`}>
                          ডাউনলোডযোগ্য সোর্স ফাইল ও প্রজেক্ট এসেটস
                        </h3>
                        <p className={`text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed ${theme.textSecondary}`}>
                          এই ক্লাসের ভিডিওতে ব্যবহৃত সমস্ত অরিজিনাল প্রজেক্ট ফাইল, এআই সোর্স কোড ও এসেট নিচে দেওয়া হয়েছে। ১-ক্লিকেই ডাউনলোড করে সরাসরি প্র্যাকটিস শুরু করুন।
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border shadow-sm ${
                            isDarkMode
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          <ShieldCheck size={18} className="text-emerald-400" />
                          <span>ভেরিফায়েড হাই-স্পিড ডাউনলোড</span>
                        </span>
                      </div>
                    </div>

                    {/* Class-Specific Attached Files */}
                    {currentLesson.resources && currentLesson.resources.length > 0 ? (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brand-400 flex items-center gap-2">
                            <span>ক্লাস স্পেসিফিক সোর্স ফাইলসমূহ:</span>
                          </h4>
                          <span className="text-xs font-mono text-slate-400">
                            {toBengaliNumber(currentLesson.resources.length)}টি ফাইল প্রস্তুত
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {currentLesson.resources.map((res) => (
                            <div
                              key={res.id}
                              className={`group relative rounded-3xl border p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl flex flex-col justify-between ${
                                isDarkMode
                                  ? 'bg-gradient-to-br from-[#0c142b] via-[#090f21] to-[#070b18] border-white/10 hover:border-brand-500/60 shadow-[0_4px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_45px_rgba(59,130,246,0.25)]'
                                  : 'bg-white border-slate-200 hover:border-brand-500 shadow-md hover:shadow-2xl'
                              }`}
                            >
                              <div>
                                {/* Card Top: Icon & Metadata Badges */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                  {/* Dynamic File Type Icon */}
                                  <div
                                    className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
                                      res.type === 'zip'
                                        ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30'
                                        : res.type === 'pdf'
                                        ? 'bg-gradient-to-br from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30'
                                        : res.type === 'html' || res.type === 'code'
                                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30'
                                        : 'bg-gradient-to-br from-brand-500/20 to-indigo-500/20 text-brand-400 border-brand-500/30'
                                    }`}
                                  >
                                    {res.type === 'zip' ? (
                                      <FolderArchive size={28} />
                                    ) : res.type === 'pdf' ? (
                                      <FileText size={28} />
                                    ) : res.type === 'html' || res.type === 'code' ? (
                                      <FileCode size={28} />
                                    ) : (
                                      <DownloadCloud size={28} />
                                    )}
                                  </div>

                                  {/* Badges */}
                                  <div className="flex flex-wrap items-center justify-end gap-2">
                                    <span
                                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase tracking-wider border ${
                                        res.type === 'zip'
                                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                          : res.type === 'pdf'
                                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                          : res.type === 'html'
                                          ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                                          : 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                                      }`}
                                    >
                                      {res.type === 'zip'
                                        ? 'ZIP আর্কাইভ'
                                        : res.type === 'pdf'
                                        ? 'PDF রোডম্যাপ'
                                        : res.type === 'html'
                                        ? 'HTML সোর্স কোড'
                                        : res.type
                                        ? res.type.toUpperCase()
                                        : 'সোর্স ফাইল'}
                                    </span>
                                    <span
                                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
                                        isDarkMode
                                          ? 'bg-white/5 border-white/10 text-slate-300'
                                          : 'bg-slate-100 border-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {res.size}
                                    </span>
                                  </div>
                                </div>

                                {/* Title in large, crisp font */}
                                <h4
                                  className={`text-base sm:text-lg font-bold leading-snug line-clamp-2 mb-2 ${theme.textPrimary}`}
                                >
                                  {res.title}
                                </h4>

                                {/* Description in clear readable 14px font */}
                                <p
                                  className={`text-xs sm:text-sm leading-relaxed mb-4 line-clamp-2 ${theme.textSecondary}`}
                                >
                                  {res.description}
                                </p>

                                {/* Feature checklist */}
                                <div
                                  className={`pt-3 pb-4 mb-4 border-t border-dashed flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs ${
                                    isDarkMode
                                      ? 'border-white/10 text-slate-400'
                                      : 'border-slate-200 text-slate-500'
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                    <Check size={14} strokeWidth={3} />
                                    সম্পূর্ণ সোর্স ফাইল
                                  </span>
                                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                    <Check size={14} strokeWidth={3} />
                                    কমার্শিয়াল ব্যবহারে অনুমতি
                                  </span>
                                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                    <Check size={14} strokeWidth={3} />
                                    ১০০% নিরাপদ
                                  </span>
                                </div>
                              </div>

                              {/* Large, prominent Download Button */}
                              <div className="pt-2">
                                <a
                                  href={res.downloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm sm:text-base font-extrabold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                                  title={`ডাউনলোড: ${res.title}`}
                                >
                                  <DownloadCloud size={19} />
                                  <span>সরাসরি ডাউনলোড করুন</span>
                                  <ExternalLink size={15} className="opacity-80" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Fallback for classes without separate attached files: Show the Master Toolkit Vault! */
                      <div className="space-y-4">
                        <div
                          className={`p-5 rounded-2xl border flex items-center gap-3.5 ${
                            isDarkMode
                              ? 'bg-brand-500/[0.04] border-brand-500/20 text-slate-300'
                              : 'bg-brand-50 border-brand-200 text-slate-700'
                          }`}
                        >
                          <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400 shrink-0">
                            <Sparkles size={20} />
                          </div>
                          <div className="text-xs sm:text-sm">
                            <span className="font-bold text-brand-400 block mb-0.5">
                              মাস্টার টুলকিট ও সোর্স ভল্ট
                            </span>
                            এই ক্লাসে ব্যবহৃত সমস্ত কোডিং টেমপ্লেট ও রিসোর্স নিচের মাস্টার স্টাইল কিট এবং বোনাস প্যাক থেকে সরাসরি ডাউনলোড করে ব্যবহার করতে পারবেন:
                          </div>
                        </div>

                        {/* Master style kit cards */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          <div
                            className={`rounded-3xl border p-6 flex flex-col justify-between ${
                              isDarkMode
                                ? 'bg-gradient-to-br from-[#0c142b] via-[#090f21] to-[#070b18] border-white/10 hover:border-brand-500/60 shadow-xl'
                                : 'bg-white border-slate-200 hover:border-brand-500 shadow-md'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                                  <FolderArchive size={26} />
                                </div>
                                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                  ZIP আর্কাইভ
                                </span>
                              </div>
                              <h4 className={`text-base sm:text-lg font-bold mb-1.5 ${theme.textPrimary}`}>
                                motion-style-kit-v2.zip (মাস্টার স্টাইল কিট)
                              </h4>
                              <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${theme.textSecondary}`}>
                                সম্পূর্ণ কোর্সের মোশন গ্রাফিক্স স্টাইল কিট, সিনেমাটিক কম্পোজিশন টেমপ্লেট ও প্রিমিয়াম প্রজেক্ট ফাইল v2।
                              </p>
                            </div>
                            <a
                              href="https://founders.com.bd/attachments/28"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-lg transition-all"
                            >
                              <DownloadCloud size={18} />
                              <span>স্টাইল কিট ডাউনলোড করুন</span>
                              <ExternalLink size={14} />
                            </a>
                          </div>

                          <div
                            className={`rounded-3xl border p-6 flex flex-col justify-between ${
                              isDarkMode
                                ? 'bg-gradient-to-br from-[#0c142b] via-[#090f21] to-[#070b18] border-white/10 hover:border-brand-500/60 shadow-xl'
                                : 'bg-white border-slate-200 hover:border-brand-500 shadow-md'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="h-12 w-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                                  <FileText size={26} />
                                </div>
                                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                                  PDF ডকুমেন্ট
                                </span>
                              </div>
                              <h4 className={`text-base sm:text-lg font-bold mb-1.5 ${theme.textPrimary}`}>
                                Lesson-1-Resource-Guide-v3.pdf
                              </h4>
                              <p className={`text-xs sm:text-sm mb-4 leading-relaxed ${theme.textSecondary}`}>
                                এআই মোশন মাস্টারক্লাসের স্টেপ-বাই-স্টেপ রোডম্যাপ, এআই সাইট ডিরেক্টরি ও প্র্যাকটিস গাইড v3।
                              </p>
                            </div>
                            <a
                              href="https://founders.com.bd/attachments/45"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-lg transition-all"
                            >
                              <DownloadCloud size={18} />
                              <span>পিডিএফ গাইড ডাউনলোড করুন</span>
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Master Free Mega Bonus Vault (Value ৳5,000+) */}
                    <div className={`pt-6 border-t ${theme.border}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                              <Sparkles size={14} />
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-amber-400">
                              🎁 ১০০% ফ্রি মেগা বোনাস ভল্ট (মূল্য ৳৫,০০০+)
                            </h4>
                          </div>
                          <p className={`text-xs sm:text-sm mt-0.5 ${theme.textMuted}`}>
                            এই কোর্সের অন্তর্ভুক্ত ৪টি হাই-ভ্যালু বোনাস রিসোর্স যা আপনি আজীবন বিনামূল্যে ব্যবহার করতে পারবেন:
                          </p>
                        </div>
                        <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold shrink-0">
                          সব বোনাস আনলকড
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Bonus 1 */}
                        <div
                          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                            isDarkMode
                              ? 'bg-gradient-to-br from-[#121128] to-[#0c0b1a] border-purple-500/30 hover:border-purple-500/50'
                              : 'bg-purple-50/70 border-purple-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                              <Music size={24} />
                            </div>
                            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-400 border border-purple-500/30">
                              অডিও প্যাক • WAV/MP3
                            </span>
                          </div>
                          <h5 className={`text-sm sm:text-base font-bold mb-1.5 ${theme.textPrimary}`}>
                            ৫০০+ সিনেমাটিক সাউন্ড FX ও BGM কালেকশন
                          </h5>
                          <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                            উচ্চমানের সিনেমাটিক হুশ, রাইজার, ইমপ্যাক্ট, ড্রপ ও অ্যাম্বিয়েন্স সাউন্ড যা আপনার ভিডিওকে সিনেমাটিক রূপ দেবে।
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                              <Check size={13} strokeWidth={3} />
                              ১০০% কপিরাইট ফ্রি লাইসেন্স
                            </span>
                          </div>
                        </div>

                        {/* Bonus 2 */}
                        <div
                          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                            isDarkMode
                              ? 'bg-gradient-to-br from-[#1a1710] to-[#120f0a] border-amber-500/30 hover:border-amber-500/50'
                              : 'bg-amber-50/70 border-amber-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                              <Sparkles size={24} />
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab('prompts')}
                              className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                            >
                              প্রম্পট শিট খুলুন ↗
                            </button>
                          </div>
                          <h5 className={`text-sm sm:text-base font-bold mb-1.5 ${theme.textPrimary}`}>
                            এজেন্টিক ভিডিও এডিটিং মাস্টার প্রম্পট লাইব্রেরি
                          </h5>
                          <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                            Runway Gen-3, Midjourney, Kling AI ও GPT-4o-এর টেস্টেড প্রম্পট যা ডিরেক্ট কপি-পেস্ট করে ব্যবহারযোগ্য।
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveTab('prompts')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                          >
                            <span>প্রম্পট লাইব্রেরি ট্যাব দেখুন</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>

                        {/* Bonus 3 */}
                        <div
                          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                            isDarkMode
                              ? 'bg-gradient-to-br from-[#0c181f] to-[#081016] border-emerald-500/30 hover:border-emerald-500/50'
                              : 'bg-emerald-50/70 border-emerald-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                              <Sliders size={24} />
                            </div>
                            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              .CUBE LUTs
                            </span>
                          </div>
                          <h5 className={`text-sm sm:text-base font-bold mb-1.5 ${theme.textPrimary}`}>
                            Premiere Pro & DaVinci Resolve কালার প্রিসেট প্যাক
                          </h5>
                          <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                            এক ক্লিকেই হলিউড সিনেমাটিক টিল অ্যান্ড অরেঞ্জ ও মুডি কালার গ্রেডিং লুক পাওয়ার প্রিসেট ফাইল।
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                              <Check size={13} strokeWidth={3} />
                              সকল ভিডিও এডিটরে সাপোর্টেড
                            </span>
                          </div>
                        </div>

                        {/* Bonus 4 */}
                        <div
                          className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                            isDarkMode
                              ? 'bg-gradient-to-br from-[#1a1019] to-[#120811] border-rose-500/30 hover:border-rose-500/50'
                              : 'bg-rose-50/70 border-rose-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
                              <Zap size={24} />
                            </div>
                            <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
                              রিলস ও শর্টস
                            </span>
                          </div>
                          <h5 className={`text-sm sm:text-base font-bold mb-1.5 ${theme.textPrimary}`}>
                            সোশ্যাল মিডিয়া ভাইরাল রিলস ও শর্টস টেমপ্লেট
                          </h5>
                          <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                            ইউটিউব শর্টস ও ইনস্টাগ্রাম রিলসের জন্য হাই-এনগেজমেন্ট হুক ফ্রেমওয়ার্ক ও মোশন অ্যাসেটস।
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                              <Check size={13} strokeWidth={3} />
                              ১০ গুণ বেশি এনগেজমেন্ট গ্যারান্টি
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. CLASS OVERVIEW TAB (Second Tab) */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* Header with large typography */}
                    <div className="pb-5 border-b border-white/10 dark:border-white/10">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-brand-500 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                          মডিউল ০১ • ক্লাস {toBengaliNumber(currentLesson.lessonNumber)} / ১০
                        </span>
                        <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                          সময়সীমা: {currentLesson.duration} মিনিট
                        </span>
                      </div>
                      <h2 className={`text-xl sm:text-2xl lg:text-3xl font-black mt-2 leading-tight ${theme.textPrimary}`}>
                        {currentLesson.title}
                      </h2>
                      <p className={`text-xs sm:text-sm font-mono mt-1 ${theme.textMuted}`}>
                        {currentLesson.titleEn}
                      </p>
                    </div>

                    {/* Rich Executive Summary Card */}
                    <div
                      className={`p-6 sm:p-7 rounded-3xl border relative overflow-hidden ${
                        isDarkMode
                          ? 'bg-gradient-to-br from-[#0c142b] to-[#070b18] border-brand-500/30 shadow-xl'
                          : 'bg-brand-50/80 border-brand-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-brand-500 font-bold text-xs uppercase tracking-wider mb-2.5">
                        <BookOpen size={16} />
                        <span>ক্লাস সারসংক্ষেপ (Overview & Summary)</span>
                      </div>
                      <p className={`text-base sm:text-lg leading-relaxed font-medium ${theme.textPrimary}`}>
                        {currentLesson.summary}
                      </p>
                    </div>

                    {/* Key Takeaways & Learning Points */}
                    {currentLesson.keyPoints && currentLesson.keyPoints.length > 0 && (
                      <div className="pt-2">
                        <h3
                          className={`text-sm sm:text-base font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${theme.textPrimary}`}
                        >
                          <Sparkles size={16} className="text-brand-500" />
                          <span>এই ক্লাসের মূল শিখনীয় বিষয়সমূহ:</span>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {currentLesson.keyPoints.map((point, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border transition-all ${
                                isDarkMode
                                  ? 'bg-white/[0.03] border-white/10 hover:border-brand-500/40 shadow-sm'
                                  : 'bg-white border-slate-200 hover:border-brand-400 shadow-xs'
                              }`}
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white text-sm font-black shadow-md shadow-brand-500/20">
                                {toBengaliNumber(idx + 1)}
                              </span>
                              <div className="pt-0.5">
                                <span className={`text-sm sm:text-base font-bold leading-relaxed block ${theme.textPrimary}`}>
                                  {point}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick navigation to Resources & Prompts */}
                    <div
                      className={`pt-6 border-t ${theme.border} flex flex-wrap items-center justify-between gap-3`}
                    >
                      <span className={`text-xs font-semibold ${theme.textMuted}`}>
                        প্র্যাকটিস করার জন্য সোর্স ফাইল প্রয়োজন?
                      </span>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => setActiveTab('resources')}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                        >
                          <DownloadCloud size={16} />
                          <span>সোর্স ফাইল ডাউনলোড করুন</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('prompts')}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                            isDarkMode
                              ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                              : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <Sparkles size={14} className="text-amber-500" />
                          <span>এআই প্রম্পট দেখুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'prompts' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-base font-bold ${theme.textPrimary}`}>
                        এআই মোশন প্রম্পট লাইব্রেরি
                      </h3>
                      <p className={`text-xs mt-1 ${theme.textMuted}`}>
                        ক্লিপ জেনারেট করতে সরাসরি প্রম্পট কপি করে এআই টুলে ব্যবহার করুন।
                      </p>
                    </div>

                    {currentLesson.prompts && currentLesson.prompts.length > 0 ? (
                      <div className="space-y-3.5">
                        {currentLesson.prompts.map((p) => {
                          const isCopied = copiedPromptId === p.id;
                          return (
                            <div
                              key={p.id}
                              className={`p-4 rounded-xl border space-y-2.5 ${theme.cardSubtle}`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="rounded bg-brand-500/20 text-brand-500 px-2 py-0.5 text-xs font-bold">
                                    {p.tool}
                                  </span>
                                  <span className={`text-xs sm:text-sm font-bold ${theme.textPrimary}`}>
                                    {p.title}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPrompt(p.id, p.prompt)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    isCopied
                                      ? 'bg-emerald-500 text-white'
                                      : isDarkMode
                                      ? 'bg-white/10 text-slate-300 hover:text-white border border-white/10'
                                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
                                  }`}
                                >
                                  {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                  <span>{isCopied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                                </button>
                              </div>
                              <pre
                                className={`p-3.5 rounded-lg border text-xs font-mono whitespace-pre-wrap leading-relaxed ${
                                  isDarkMode
                                    ? 'bg-black/60 border-white/10 text-slate-200'
                                    : 'bg-slate-100 border-slate-200 text-slate-800'
                                }`}
                              >
                                {p.prompt}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div
                        className={`p-5 rounded-xl border text-xs sm:text-sm leading-relaxed ${theme.cardSubtle} ${theme.textSecondary}`}
                      >
                        <span className="font-bold text-brand-500">মাস্টার প্রম্পট:</span> এই ক্লাসের
                        বিশেষ প্রম্পট ও প্যারামিটারসমূহ অন্যান্য ক্লাসের সোর্স ফাইল ও বোনাস শিটে
                        যুক্ত করা হয়েছে।
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'support' && (
                  <div className="space-y-4">
                    <div>
                      <h3 className={`text-base font-bold ${theme.textPrimary}`}>
                        স্টুডেন্ট হেল্পডেস্ক ও সাপোর্ট
                      </h3>
                      <p className={`text-xs mt-1 ${theme.textMuted}`}>
                        যেকোনো সমস্যা বা প্রশ্নের জন্য আমাদের সাপোর্ট টিমের সাথে সরাসরি যোগাযোগ
                        করুন।
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* WhatsApp Helpdesk */}
                      <div
                        className={`p-4 rounded-xl border space-y-2.5 ${
                          isDarkMode
                            ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                            : 'border-emerald-300 bg-emerald-50/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                          <MessageCircle size={18} />
                          <span>ভিআইপি হোয়াটসঅ্যাপ হেল্পডেস্ক</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
                          সরাসরি কোর্স ইন্সট্রাক্টর ও সাপোর্ট টিমের কাছ থেকে দ্রুত সমাধান পেতে মেসেজ
                          দিন।
                        </p>
                        <div className="pt-1 flex flex-wrap items-center gap-2">
                          <a
                            href="https://wa.me/8801798583122?text=AI%20Motion%20Masterclass%20Support"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                          >
                            <MessageCircle size={14} />
                            <span>WhatsApp-এ মেসেজ দিন</span>
                            <ExternalLink size={12} />
                          </a>
                          <span
                            className={`text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border ${
                              isDarkMode
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                : 'bg-emerald-100 border-emerald-200 text-emerald-800'
                            }`}
                          >
                            +880 1798-583122
                          </span>
                        </div>
                      </div>

                      {/* Project Review & Certificate */}
                      <div className={`p-4 rounded-xl border space-y-2.5 ${theme.cardSubtle}`}>
                        <div className="flex items-center gap-2 text-brand-500 font-bold text-sm">
                          <Award size={18} />
                          <span>সার্টিফিকেট ও প্রজেক্ট রিভিউ</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${theme.textSecondary}`}>
                          ১০টি ক্লাস সম্পন্ন করার পর আপনার প্রজেক্ট সাবমিট করে ভেরিফায়েড
                          সার্টিফিকেট অর্জন করুন।
                        </p>
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={() =>
                              alert('১০টি ক্লাস সম্পন্ন করার পর সার্টিফিকেট অপশন চালু হবে।')
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                              isDarkMode
                                ? 'border-white/10 bg-white/5 text-slate-300 hover:text-white'
                                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <span>সার্টিফিকেট স্ট্যাটাস দেখুন</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Minimalist Course Playlist Sidebar (Module 1 with all 10 videos) */}
          {showSidebar && (
            <aside className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-3">
              <div
                className={`rounded-2xl border p-4 sm:p-5 sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto backdrop-blur-xl ${theme.cardBg}`}
              >
                {/* Playlist Sidebar Header & Live Tracking Dashboard */}
                <div className={`pb-3.5 border-b ${theme.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ListVideo size={17} className="text-brand-500" />
                      <h3 className={`text-sm font-bold ${theme.textPrimary}`}>
                        কোর্স প্লেলিস্ট ও লাইভ ট্র্যাকার
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSidebar}
                      className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-white/10'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      title="সাইডবার লুকান"
                    >
                      <PanelRightClose size={16} />
                    </button>
                  </div>

                  {/* Course Progress Tracking Widget */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-colors ${
                      isDarkMode
                        ? 'bg-[#0f1a36]/90 border-brand-500/30'
                        : 'bg-brand-50/70 border-brand-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-brand-500/20 text-brand-400">
                          <Sparkles size={14} />
                        </div>
                        <span className={`text-xs font-bold ${theme.textPrimary}`}>
                          লার্নিং প্রগ্রেস ট্র্যাকার
                        </span>
                      </div>
                      <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30">
                        {toBengaliNumber(completionStats.percentage)}%
                      </span>
                    </div>

                    {/* Overall Gradient Progress Bar */}
                    <div className="w-full bg-slate-500/20 h-2 rounded-full overflow-hidden mt-1 relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-emerald-400 transition-all duration-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                        style={{ width: `${completionStats.percentage}%` }}
                      />
                    </div>

                    {/* 3 Quick Stats Badges */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-white/10 dark:border-white/10 text-center">
                      <div
                        className={`p-1.5 rounded-xl ${
                          isDarkMode ? 'bg-white/5' : 'bg-white shadow-xs'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block">সম্পন্ন ক্লাস</span>
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          {toBengaliNumber(completionStats.completedCount)} / {toBengaliNumber(allLessons.length)}
                        </span>
                      </div>
                      <div
                        className={`p-1.5 rounded-xl ${
                          isDarkMode ? 'bg-white/5' : 'bg-white shadow-xs'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block">দেখা হয়েছে</span>
                        <span className="text-xs font-bold font-mono text-brand-400">
                          {toBengaliNumber(totalWatchedMinutes)} মি.
                        </span>
                      </div>
                      <div
                        className={`p-1.5 rounded-xl ${
                          isDarkMode ? 'bg-white/5' : 'bg-white shadow-xs'
                        }`}
                      >
                        <span className="text-[10px] text-slate-400 block">বাকি সময়</span>
                        <span className="text-xs font-bold font-mono text-amber-400">
                          {completionStats.percentage >= 100
                            ? '০ মি.'
                            : `${toBengaliNumber(totalRemainingMinutes)} মি.`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Single Module 01 - All 10 Lessons List */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-brand-500 py-1.5 px-2">
                    মডিউল ০১: AI মোশন গ্রাফিক্স মাস্টারক্লাস (১০টি ক্লাস)
                  </div>

                  <div className="space-y-2 mt-1">
                    {allLessons.map((lesson) => {
                      const isActive = lesson.id === activeLessonId;
                      const isLessonCompleted = progress.completedLessons?.includes(lesson.id);
                      const watched = progress.playbackPositions?.[lesson.id] || 0;
                      const total = lesson.durationSeconds || 600;
                      const percent = isLessonCompleted
                        ? 100
                        : Math.min(99, Math.round((watched / total) * 100));
                      const remainingSec = isLessonCompleted ? 0 : Math.max(0, total - watched);
                      const remainingMin = Math.ceil(remainingSec / 60);

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                            isActive
                              ? theme.itemActive
                              : isLessonCompleted
                              ? isDarkMode
                                ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-slate-300 hover:text-white hover:border-emerald-500/40'
                                : 'bg-emerald-50/50 border-emerald-200 text-slate-800 hover:bg-emerald-50'
                              : theme.itemInactive
                          }`}
                        >
                          {/* Top Row: Icon + Title + Badges */}
                          <div className="flex items-start gap-3 w-full">
                            {/* Number / Status Icon */}
                            <div className="pt-0.5 shrink-0">
                              {isLessonCompleted ? (
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/40 ring-2 ring-emerald-400/20"
                                  title="ক্লাস সম্পন্ন হয়েছে (১০০%)"
                                >
                                  <Check size={14} strokeWidth={3} />
                                </div>
                              ) : isActive ? (
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-md shadow-brand-500/40 animate-pulse"
                                  title="বর্তমানে চলছে"
                                >
                                  <Play size={12} className="fill-current translate-x-0.5" />
                                </div>
                              ) : (
                                <span
                                  className={`flex h-7 w-7 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                                    percent > 0
                                      ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                                      : isDarkMode
                                      ? 'bg-white/5 text-slate-400 border border-white/10'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  {toBengaliNumber(lesson.lessonNumber)}
                                </span>
                              )}
                            </div>

                            {/* Lesson Title & Badges */}
                            <div className="min-w-0 flex-1">
                              <h4
                                className={`text-xs sm:text-[13px] leading-snug line-clamp-2 ${
                                  isActive
                                    ? 'font-bold text-brand-400'
                                    : isLessonCompleted
                                    ? 'font-semibold text-emerald-400'
                                    : isDarkMode
                                    ? 'text-slate-200'
                                    : 'text-slate-800'
                                }`}
                              >
                                {lesson.title}
                              </h4>

                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                {lesson.isFreePreview && (
                                  <span className="text-[10px] font-bold bg-amber-500/15 text-amber-500 px-1.5 py-0.2 rounded">
                                    ফ্রি ডেমো
                                  </span>
                                )}

                                {lesson.resources && lesson.resources.length > 0 && (
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                                      isDarkMode
                                        ? 'bg-white/10 text-slate-300'
                                        : 'bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {toBengaliNumber(lesson.resources.length)} ফাইল
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Individual Lesson Progress Timeline */}
                          <div className="w-full pt-1">
                            {/* Horizontal progress track */}
                            <div className="w-full bg-slate-500/20 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isLessonCompleted
                                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                    : percent > 0
                                    ? 'bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                    : 'bg-transparent'
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>

                            {/* Track stats: Watch percent & Remaining time */}
                            <div className="flex items-center justify-between text-[11px] font-mono mt-1.5 leading-tight">
                              <span
                                className={
                                  isLessonCompleted
                                    ? 'text-emerald-400 font-bold flex items-center gap-1'
                                    : percent > 0
                                    ? 'text-brand-400 font-semibold'
                                    : theme.textMuted
                                }
                              >
                                {isLessonCompleted ? (
                                  <>
                                    <CheckCircle2 size={12} className="text-emerald-400 inline" />
                                    <span>সম্পন্ন (১০০%)</span>
                                  </>
                                ) : percent > 0 ? (
                                  `${toBengaliNumber(percent)}% দেখা হয়েছে`
                                ) : (
                                  `শুরু হয়নি • ${lesson.duration}`
                                )}
                              </span>

                              <span
                                className={
                                  isLessonCompleted
                                    ? 'text-emerald-500/80 font-medium'
                                    : percent > 0
                                    ? 'text-amber-400 font-medium'
                                    : theme.textMuted
                                }
                              >
                                {isLessonCompleted
                                  ? 'রিভিউ করুন'
                                  : percent > 0
                                  ? `বাকি ${toBengaliNumber(remainingMin)} মিনিট`
                                  : 'শুরু করুন'}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
