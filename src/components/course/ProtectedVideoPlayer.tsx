import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Volume2,
  Volume1,
  VolumeX,
  Sparkles,
  Lock,
  Clock,
  ArrowRight,
  ShieldCheck,
  Settings,
  Check,
  Smartphone,
} from 'lucide-react';
import {
  getLessonPlaybackTime,
  saveLessonPlaybackTime,
  toggleLessonCompletion,
} from '@/services/courseEnrollment';

interface ProtectedVideoPlayerProps {
  courseId: string;
  lessonId: string;
  title: string;
  youtubeId?: string;
  videoUrl?: string;
  isLocked?: boolean;
  onUnlockClick?: () => void;
  onEnded?: () => void;
  onNextLesson?: () => void;
  hasNextLesson?: boolean;
}

const QUALITY_OPTIONS = [
  { id: 'auto', label: 'স্বয়ংক্রিয় (Auto)', badge: 'রেকমেন্ডেড', desc: 'নেটওয়ার্ক স্পিড অনুযায়ী সেরা কোয়ালিটি' },
  { id: 'hd1080', label: '1080p (Full HD)', badge: 'সেরা মান', desc: 'সবচেয়ে ক্রিস্টাল ক্লিয়ার কোয়ালিটি' },
  { id: 'hd720', label: '720p (HD)', badge: 'এইচডি', desc: 'হাই-ডেফিনিশন স্মুথ প্লেব্যাক' },
  { id: 'large', label: '480p (SD)', badge: 'স্ট্যান্ডার্ড', desc: 'ডাটা সাশ্রয়ী সাধারণ কোয়ালিটি' },
  { id: 'medium', label: '360p', badge: 'ডাটা সেভার', desc: 'ধীরগতির ইন্টারনেটে দ্রুত প্লেব্যাক' },
];

export function ProtectedVideoPlayer({
  courseId,
  lessonId,
  title,
  youtubeId = 'B1l3tNihOZI', // User's Free Demo Video
  videoUrl,
  isLocked = false,
  onUnlockClick,
  onEnded,
  onNextLesson,
  hasNextLesson,
}: ProtectedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserStartedPlaying, setHasUserStartedPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [resumeNotice, setResumeNotice] = useState<string | null>(null);
  const [playerReady, setPlayerReady] = useState(false);

  const prevVolumeRef = useRef<number>(100);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentTimeRef = useRef<number>(currentTime);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Listen for native fullscreen changes across browsers
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
      if (!isFs) {
        setIsPseudoFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  // Detect mobile device orientation (when phone is turned horizontally)
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;
      const isMobile = window.innerWidth <= 960 || window.innerHeight <= 540;
      const isLand = window.innerWidth > window.innerHeight;
      setIsMobileLandscape(isMobile && isLand);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Saved resume position for current lesson (seconds)
  const savedResumeSeconds = useMemo(() => {
    return Math.floor(getLessonPlaybackTime(courseId, lessonId));
  }, [courseId, lessonId]);

  // Format seconds into mm:ss
  const formatTime = (secs: number) => {
    const s = Math.floor(secs);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h > 0) {
      return `${h}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Synchronize on lessonId change - strictly pause and reset user interaction flag
  useEffect(() => {
    setIsPlaying(false);
    setHasUserStartedPlaying(false);
    const saved = getLessonPlaybackTime(courseId, lessonId);
    setCurrentTime(saved);
    currentTimeRef.current = saved;
    if (saved > 3) {
      setResumeNotice(`আপনি শেষবার ${formatTime(saved)} মিনিটে ছিলেন — প্লে করলে সেখান থেকেই শুরু হবে`);
      const t = setTimeout(() => setResumeNotice(null), 4500);
      return () => clearTimeout(t);
    }
  }, [courseId, lessonId]);

  // Save on unmount / lesson change
  useEffect(() => {
    return () => {
      if (currentTimeRef.current > 3) {
        saveLessonPlaybackTime(courseId, lessonId, currentTimeRef.current);
      }
    };
  }, [courseId, lessonId]);

  // Save on window beforeunload (reload / tab close)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentTimeRef.current > 3) {
        saveLessonPlaybackTime(courseId, lessonId, currentTimeRef.current);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [courseId, lessonId]);

  // YouTube postMessage controller
  const postToPlayer = useCallback((func: string, args: any[] = []) => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    );
  }, []);

  // Listen to YouTube player state events
  useEffect(() => {
    if (isLocked) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data !== 'string') return;
        const data = JSON.parse(event.data);

        if (data.event === 'onReady') {
          setPlayerReady(true);
          postToPlayer('setVolume', [volume]);
          postToPlayer('pauseVideo');
          const saved = getLessonPlaybackTime(courseId, lessonId);
          if (saved > 3) {
            postToPlayer('seekTo', [saved, false]);
            postToPlayer('pauseVideo');
          }
        }

        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            const time = Math.floor(data.info.currentTime);
            setCurrentTime(time);
            currentTimeRef.current = time;

            // Safety guard: Do not overwrite a valid saved position with 0 during initial load
            const saved = getLessonPlaybackTime(courseId, lessonId);
            if (time > 0 || saved <= 3) {
              if (isPlaying || time >= saved - 3 || saved <= 3) {
                saveLessonPlaybackTime(courseId, lessonId, time);
              }
            }

            // Auto complete if watched 90% or reached end
            if (duration > 30 && time / duration >= 0.9) {
              toggleLessonCompletion(courseId, lessonId, true);
            }
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(Math.floor(data.info.duration));
          }
          if (typeof data.info.playerState === 'number') {
            if (data.info.playerState === 1) {
              // STRICT AUTOPLAY GUARD: If user has not explicitly clicked play, force pause!
              if (!hasUserStartedPlaying) {
                postToPlayer('pauseVideo');
                setIsPlaying(false);
                return;
              }
              setIsPlaying(true);
            }
            if (data.info.playerState === 2) setIsPlaying(false);
            if (data.info.playerState === 0) {
              setIsPlaying(false);
              toggleLessonCompletion(courseId, lessonId, true);
              if (onEnded) onEnded();
            }
          }
        }
      } catch {
        // Non-JSON message
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [courseId, lessonId, duration, onEnded, postToPlayer, isLocked, volume, isPlaying, hasUserStartedPlaying]);

  // Continuous tracking loop: saves playback every second while playing
  useEffect(() => {
    if (!isPlaying || isLocked) return;

    const tracker = setInterval(() => {
      postToPlayer('getCurrentTime');
      postToPlayer('getDuration');

      setCurrentTime((prev) => {
        const next = prev + 1;
        currentTimeRef.current = next;
        saveLessonPlaybackTime(courseId, lessonId, next);

        if (duration > 30 && next / duration >= 0.9) {
          toggleLessonCompletion(courseId, lessonId, true);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(tracker);
  }, [isPlaying, isLocked, courseId, lessonId, duration, postToPlayer]);

  // Click outside quality dropdown menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };
    if (showQualityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQualityMenu]);

  // Play / Pause
  const togglePlay = () => {
    if (isLocked) {
      if (onUnlockClick) onUnlockClick();
      return;
    }
    setHasUserStartedPlaying(true);
    if (isPlaying) {
      postToPlayer('pauseVideo');
      setIsPlaying(false);
      saveLessonPlaybackTime(courseId, lessonId, currentTimeRef.current);
    } else {
      postToPlayer('playVideo');
      setIsPlaying(true);
      if (savedResumeSeconds > 3 && currentTime < 3) {
        postToPlayer('seekTo', [savedResumeSeconds, true]);
      }
    }
  };

  // Seek relative (-10s / +10s)
  const handleSeekRelative = (seconds: number) => {
    if (isLocked) return;
    const target = Math.max(0, Math.min(duration || 9999, currentTime + seconds));
    postToPlayer('seekTo', [target, true]);
    setCurrentTime(target);
    saveLessonPlaybackTime(courseId, lessonId, target);
  };

  // Scrubber drag
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const target = Number(e.target.value);
    postToPlayer('seekTo', [target, true]);
    setCurrentTime(target);
    saveLessonPlaybackTime(courseId, lessonId, target);
  };

  // Speed change
  const cycleSpeed = () => {
    if (isLocked) return;
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextRate = speeds[nextIdx];
    setPlaybackRate(nextRate);
    postToPlayer('setPlaybackRate', [nextRate]);
  };

  // Volume Slider Change (0-100)
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const val = Number(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      postToPlayer('mute');
    } else {
      if (isMuted) {
        setIsMuted(false);
        postToPlayer('unMute');
      }
      prevVolumeRef.current = val;
      postToPlayer('setVolume', [val]);
    }
  };

  // Mute / Unmute
  const toggleMute = () => {
    if (isLocked) return;
    if (isMuted || volume === 0) {
      const restoreVal = prevVolumeRef.current > 0 ? prevVolumeRef.current : 80;
      setVolume(restoreVal);
      setIsMuted(false);
      postToPlayer('unMute');
      postToPlayer('setVolume', [restoreVal]);
    } else {
      prevVolumeRef.current = volume;
      setIsMuted(true);
      postToPlayer('mute');
    }
  };

  // Quality Selection
  const handleQualitySelect = (qualityId: string) => {
    if (isLocked) return;
    setSelectedQuality(qualityId);
    setShowQualityMenu(false);

    // Call YouTube iframe API methods
    postToPlayer('setPlaybackQuality', [qualityId]);
    postToPlayer('setPlaybackQualityRange', [qualityId, qualityId]);

    const opt = QUALITY_OPTIONS.find((q) => q.id === qualityId);
    setResumeNotice(`ভিডিও কোয়ালিটি: ${opt ? opt.label : qualityId}`);
    setTimeout(() => setResumeNotice(null), 3000);
  };

  const getQualityShortLabel = (id: string) => {
    switch (id) {
      case 'hd1080':
        return '1080p';
      case 'hd720':
        return '720p';
      case 'large':
        return '480p';
      case 'medium':
        return '360p';
      case 'auto':
      default:
        return 'Auto';
    }
  };

  // Cross-browser request native fullscreen
  const requestNativeFs = async (el: HTMLElement) => {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    }
    if ((el as any).webkitRequestFullscreen) {
      (el as any).webkitRequestFullscreen();
      return true;
    }
    if ((el as any).mozRequestFullScreen) {
      (el as any).mozRequestFullScreen();
      return true;
    }
    if ((el as any).msRequestFullscreen) {
      (el as any).msRequestFullscreen();
      return true;
    }
    return false;
  };

  // Cross-browser exit native fullscreen
  const exitNativeFs = async () => {
    if (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement
    ) {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      }
    }
  };

  // Toggle fullscreen (with fallback to pseudo-fullscreen on iOS/restricted browsers)
  const toggleFullscreen = async () => {
    if (isLocked) {
      if (onUnlockClick) onUnlockClick();
      return;
    }

    if (isFullscreen || isPseudoFullscreen) {
      await exitNativeFs();
      setIsFullscreen(false);
      setIsPseudoFullscreen(false);
      try {
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch {}
    } else {
      let nativeSuccess = false;
      if (containerRef.current) {
        try {
          nativeSuccess = await requestNativeFs(containerRef.current);
          if (nativeSuccess) setIsFullscreen(true);
        } catch {
          nativeSuccess = false;
        }
      }
      if (!nativeSuccess) {
        // Fallback for iOS / mobile browsers that restrict div fullscreen
        setIsPseudoFullscreen(true);
      }
    }
  };

  // Dedicated Mobile Landscape / Rotation Toggle
  const toggleRotateLandscape = async () => {
    if (isLocked) {
      if (onUnlockClick) onUnlockClick();
      return;
    }

    if (isFullscreen || isPseudoFullscreen || isMobileLandscape) {
      await exitNativeFs();
      setIsFullscreen(false);
      setIsPseudoFullscreen(false);
      try {
        if (screen.orientation && (screen.orientation as any).unlock) {
          (screen.orientation as any).unlock();
        }
      } catch {}
    } else {
      // First attempt native fullscreen
      let nativeSuccess = false;
      if (containerRef.current) {
        try {
          nativeSuccess = await requestNativeFs(containerRef.current);
          if (nativeSuccess) setIsFullscreen(true);
        } catch {
          nativeSuccess = false;
        }
      }
      if (!nativeSuccess) {
        setIsPseudoFullscreen(true);
      }

      // Try orientation lock if supported (Android Chrome / Edge / etc.)
      try {
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape');
        }
      } catch {
        // User may turn device manually if orientation lock API is restricted
      }
    }
  };

  // Auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setPlayerReady(true);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'listening' }),
        '*'
      );
      postToPlayer('pauseVideo');
      if (savedResumeSeconds > 3) {
        postToPlayer('seekTo', [savedResumeSeconds, false]);
        postToPlayer('pauseVideo');
      }
    }
  };

  // YouTube embed URL with explicit autoplay=0 and native start parameter
  const startParam = savedResumeSeconds > 3 ? `&start=${savedResumeSeconds}` : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1${startParam}&origin=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.origin : ''
  )}`;

  const isAnyFullscreen = isFullscreen || isPseudoFullscreen;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => {
        e.preventDefault();
        return false;
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      className={`group relative w-full bg-black select-none font-sans transition-all duration-300 ${
        isAnyFullscreen || isMobileLandscape
          ? 'fixed inset-0 z-[999999] w-screen h-screen rounded-none border-0 shadow-none'
          : 'aspect-video rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_-15px_rgba(59,130,246,0.35)]'
      }`}
    >
      {/* LOCKED VIDEO SHIELD (For non-enrolled students on premium classes) */}
      {isLocked ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 sm:p-6 text-center bg-gradient-to-b from-ink-950/95 via-black/95 to-brand-950/95 backdrop-blur-xl">
          <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-brand-500/10 text-brand-400 border border-brand-500/30 mb-3 sm:mb-5 shadow-2xl">
            <Lock size={26} className="sm:hidden" />
            <Lock size={34} className="hidden sm:block" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 border border-brand-500/40 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-bold text-brand-300 mb-2 sm:mb-3">
            <Sparkles size={12} className="text-amber-400" />
            <span>প্রিমিয়াম ক্লাস • লকড</span>
          </span>

          <h3 className="text-lg sm:text-2xl font-bold text-white max-w-lg mb-1.5 sm:mb-2 line-clamp-2">
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-ink-300 max-w-md leading-relaxed mb-4 sm:mb-6">
            এই সম্পূর্ণ প্র্যাকটিক্যাল ক্লাস এবং প্রজেক্ট ফাইলগুলো দেখতে মাত্র ২৯০ টাকায় আজীবন এক্সেস নিন।
          </p>

          <button
            type="button"
            onClick={onUnlockClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 px-6 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-base font-extrabold text-white shadow-xl hover:opacity-95 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>মাত্র ২৯০ টাকায় সম্পূর্ণ কোর্স আনলক করুন</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* UNCROPPED 16:9 VIDEO IFRAME */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <iframe
              key={`${courseId}_${lessonId}_${youtubeId}`}
              ref={iframeRef}
              src={embedUrl}
              onLoad={handleIframeLoad}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              className="absolute inset-0 w-full h-full pointer-events-auto"
              tabIndex={-1}
            />
          </div>

          {/* TOP BRANDED BAR (Masks top border and displays bdBeginner Studio branding & quick toggle) */}
          <div
            className="absolute top-0 left-0 right-0 h-12 sm:h-16 bg-gradient-to-b from-black/95 via-black/60 to-transparent z-20 flex items-center justify-between px-3 sm:px-6 pointer-events-auto"
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 cursor-pointer" onClick={togglePlay}>
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-brand-600 text-white font-extrabold text-xs sm:text-sm shadow-md shrink-0">
                bd
              </span>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-400 block truncate">
                  bdBeginner AI Studio • HD
                </span>
                <span className="text-xs sm:text-sm font-bold text-white tracking-wide truncate max-w-[170px] sm:max-w-md block">
                  {title}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-brand-300 backdrop-blur-md">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>মাস্টারক্লাস প্লেয়ার</span>
              </span>

              {/* Quick Screen Rotate / Fullscreen Button on Top Right */}
              <button
                type="button"
                onClick={toggleRotateLandscape}
                className="inline-flex items-center gap-1 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 px-2.5 py-1 text-[11px] sm:text-xs font-bold text-white backdrop-blur-md transition-colors cursor-pointer"
                title={isAnyFullscreen ? 'ছোট করুন' : 'রোটেট / ফুলস্ক্রিন'}
              >
                {isAnyFullscreen || isMobileLandscape ? (
                  <>
                    <Minimize2 size={13} className="text-amber-400" />
                    <span>ছোট করুন</span>
                  </>
                ) : (
                  <>
                    <Smartphone size={12} className="rotate-90 text-amber-400" />
                    <span className="hidden xs:inline">স্ক্রিন বড় করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* INVISIBLE CLICK CATCHER (For Play / Pause) */}
          <div
            onClick={togglePlay}
            className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer bg-transparent"
          >
            {!isPlaying && (
              <div className="flex h-16 w-16 sm:h-22 sm:w-22 items-center justify-center rounded-full bg-brand-600/90 text-white shadow-[0_0_40px_rgba(37,99,235,0.6)] ring-4 ring-white/20 backdrop-blur-md transition-all transform hover:scale-110 active:scale-95 group-hover:bg-brand-500">
                <Play size={28} className="translate-x-0.5 fill-white sm:hidden" />
                <Play size={34} className="translate-x-1 fill-white hidden sm:block" />
              </div>
            )}
          </div>

          {/* RESUME / QUALITY NOTIFICATION TOAST */}
          {resumeNotice && (
            <div className="absolute top-14 sm:top-20 left-3 sm:left-6 z-30 flex items-center gap-2 rounded-2xl bg-ink-900/95 border border-brand-500/50 px-3.5 py-2 text-[11px] sm:text-xs font-semibold text-white shadow-2xl backdrop-blur-md animate-fade-in">
              <Clock size={15} className="text-brand-400 shrink-0" />
              <span>{resumeNotice}</span>
            </div>
          )}

          {/* CUSTOM BRANDED BOTTOM CONTROLS BAR */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black via-black/85 to-transparent pt-8 pb-3 px-2.5 sm:px-6 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Scrubber / Progress Slider */}
            <div className="relative mb-2 sm:mb-3 flex items-center group/scrubber cursor-pointer">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleScrubberChange}
                className="w-full h-2 sm:h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-brand-500 transition-all hover:h-2.5 py-1"
                style={{
                  background: `linear-gradient(to right, #2f6bf6 0%, #2f6bf6 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) 100%)`,
                }}
              />
            </div>

            {/* Buttons Row */}
            <div className="flex items-center justify-between text-white text-xs sm:text-sm">
              {/* Left Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Play / Pause */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={17} /> : <Play size={17} className="fill-white" />}
                </button>

                {/* Rewind 10s */}
                <button
                  type="button"
                  onClick={() => handleSeekRelative(-10)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-white/10 transition-colors text-ink-300 hover:text-white flex items-center gap-0.5 cursor-pointer"
                  title="10s Rewind"
                >
                  <RotateCcw size={15} />
                  <span className="text-[10px] font-bold hidden md:inline">-১০</span>
                </button>

                {/* Forward 10s */}
                <button
                  type="button"
                  onClick={() => handleSeekRelative(10)}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-white/10 transition-colors text-ink-300 hover:text-white flex items-center gap-0.5 cursor-pointer"
                  title="10s Forward"
                >
                  <RotateCw size={15} />
                  <span className="text-[10px] font-bold hidden md:inline">+১০</span>
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-1 group/vol">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1.5 sm:p-2 rounded-xl hover:bg-white/10 transition-colors text-ink-300 hover:text-white cursor-pointer"
                    title={isMuted || volume === 0 ? 'আনমিউট করুন' : 'মিউট করুন'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={16} className="text-rose-400" />
                    ) : volume < 50 ? (
                      <Volume1 size={16} />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>

                  {/* Volume slider (hidden on small phones to save space) */}
                  <div className="hidden sm:flex w-14 sm:w-20 items-center">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-full h-1 sm:h-1.5 bg-white/25 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:h-2 transition-all"
                      style={{
                        background: `linear-gradient(to right, #2f6bf6 0%, #2f6bf6 ${
                          isMuted ? 0 : volume
                        }%, rgba(255,255,255,0.2) ${
                          isMuted ? 0 : volume
                        }%, rgba(255,255,255,0.2) 100%)`,
                      }}
                      title={`ভলিউম: ${isMuted ? 0 : volume}%`}
                    />
                  </div>
                </div>

                {/* Readable Timestamp */}
                <div className="text-[10px] sm:text-xs font-semibold text-ink-300 ml-0.5 whitespace-nowrap font-mono">
                  <span className="text-white font-bold">{formatTime(currentTime)}</span>
                  <span className="mx-0.5 text-ink-500">/</span>
                  <span>{formatTime(duration || 480)}</span>
                </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Video Quality Selector */}
                <div className="relative" ref={qualityMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowQualityMenu((prev) => !prev)}
                    className={`px-1.5 sm:px-2.5 py-1 rounded-lg transition-colors text-[11px] sm:text-xs font-bold flex items-center gap-1 cursor-pointer ${
                      showQualityMenu
                        ? 'bg-brand-600 text-white shadow-lg'
                        : 'bg-white/10 hover:bg-white/20 text-ink-200 hover:text-white'
                    }`}
                    title="ভিডিও কোয়ালিটি"
                  >
                    <Settings size={12} className={showQualityMenu ? 'animate-spin' : ''} />
                    <span>{getQualityShortLabel(selectedQuality)}</span>
                  </button>

                  {/* Dropdown Quality Menu Popup */}
                  {showQualityMenu && (
                    <div className="absolute bottom-full right-0 mb-2 w-56 sm:w-60 rounded-2xl bg-ink-950/98 border border-white/20 p-2 shadow-2xl backdrop-blur-2xl z-50">
                      <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Settings size={12} className="text-brand-400" />
                          <span className="text-xs font-bold text-white">ভিডিও কোয়ালিটি</span>
                        </div>
                        <span className="text-[10px] font-bold text-brand-300 bg-brand-500/20 px-1.5 py-0.5 rounded border border-brand-500/30">
                          HD 4K
                        </span>
                      </div>

                      <div className="space-y-1">
                        {QUALITY_OPTIONS.map((opt) => {
                          const isActive = selectedQuality === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleQualitySelect(opt.id)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-brand-600/30 text-white font-bold border border-brand-500/40 shadow-sm'
                                  : 'text-ink-300 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className={isActive ? 'text-white font-bold' : 'text-ink-200'}>
                                    {opt.label}
                                  </span>
                                  {opt.badge && (
                                    <span
                                      className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                        isActive
                                          ? 'bg-brand-500 text-white'
                                          : 'bg-white/10 text-ink-400'
                                      }`}
                                    >
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-ink-400 leading-tight mt-0.5 truncate">
                                  {opt.desc}
                                </span>
                              </div>
                              {isActive && <Check size={14} className="text-brand-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Playback speed selector */}
                <button
                  type="button"
                  onClick={cycleSpeed}
                  className="px-1.5 sm:px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-[11px] sm:text-xs font-bold text-brand-300 cursor-pointer"
                  title="Playback Speed"
                >
                  {playbackRate}x
                </button>

                {/* Next lesson button (desktop / tablet) */}
                {hasNextLesson && onNextLesson && (
                  <button
                    type="button"
                    onClick={onNextLesson}
                    className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <span>পরবর্তী ক্লাস</span>
                    <RotateCw size={13} className="rotate-90" />
                  </button>
                )}

                {/* Dedicated Mobile Rotate / Landscape Screen Button */}
                <button
                  type="button"
                  onClick={toggleRotateLandscape}
                  className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  title="স্ক্রিন ঘোরান (ল্যান্ডস্কেপ)"
                >
                  <Smartphone size={16} className="rotate-90 text-amber-400" />
                  <span className="text-[10px] font-bold hidden sm:inline">রোটেট</span>
                </button>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1.5 sm:p-2 rounded-xl hover:bg-white/10 transition-colors text-ink-300 hover:text-white cursor-pointer"
                  title={isAnyFullscreen ? 'ছোট করুন' : 'ফুলস্ক্রিন'}
                >
                  {isAnyFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

