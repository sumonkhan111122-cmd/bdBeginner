import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Play,
  Film,
  Bot,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DownloadCloud,
  Infinity as InfinityIcon,
  Flame,
} from 'lucide-react';
import { AI_MOTION_COURSE, courseToProduct } from '@/data/aiMotionCourse';
import { useCart } from '@/context/CartContext';

export function AiMotionCourseSection() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();

  const handleQuickBuy = () => {
    clearCart();
    addItem(courseToProduct(), 1, false);
    navigate('/checkout');
  };

  return (
    <section className="section-padding bg-gradient-to-b from-[#070b14] via-[#0b1329] to-[#070b14] text-white relative overflow-hidden border-t border-white/10 font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-brand-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-accent-600/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="container-page relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center max-w-6xl mx-auto">
          
          {/* Left Text & Call to Action (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-300">
              <Flame size={15} className="text-amber-400 animate-pulse" />
              <span>নতুন এআই মাস্টারক্লাস • ৯০% ডিসকাউন্ট</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              AI মোশন গ্রাফিক্স মাস্টারক্লাস <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-sky-300 to-accent-300">
                Advanced Agentic Video Editing
              </span>
            </h2>

            <p className="text-sm sm:text-base text-ink-200 leading-relaxed">
              Runway Gen-3, Kling AI, Luma Dream Machine ও Midjourney দিয়ে সিনেমাটিক ভিডিও তৈরি এবং আধুনিক এআই এজেন্টের সাহায্যে ভিডিও এডিটিং স্বয়ংক্রিয় করার ১ ঘণ্টা ৩০ মিনিটের সম্পূর্ণ প্র্যাকটিক্যাল কোর্স।
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-3.5 pt-1 text-sm text-ink-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-brand-400 shrink-0" />
                <span>১০টি প্র্যাক্টিক্যাল ক্লাস</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-amber-400 shrink-0" />
                <span>১ ঘণ্টা ৩০ মিনিট (দেড় ঘণ্টা)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-accent-400 shrink-0" />
                <span>সম্পূর্ণ ফ্রি প্রজেক্ট ফাইল</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>আজীবন এক্সেস ও সাপোর্ট</span>
              </div>
            </div>

            {/* Price & Action Buttons */}
            <div className="pt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-baseline gap-2.5 mr-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">৳290</span>
                <span className="text-base sm:text-lg text-ink-400 line-through font-sans">৳5,000</span>
                <span className="rounded-xl bg-amber-400 text-ink-950 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider font-sans">
                  94% ছাড়
                </span>
              </div>

              <button
                type="button"
                onClick={handleQuickBuy}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 px-7 py-3.5 text-sm sm:text-base font-extrabold text-white shadow-xl hover:opacity-95 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>কোর্সটি কিনুন (৳290)</span>
                <ArrowRight size={17} />
              </button>

              <Link
                to="/course/ai-motion?demo=1"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3.5 text-xs sm:text-sm font-bold text-ink-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Play size={15} className="fill-current" />
                <span>ফ্রি ডেমো ক্লাস দেখুন</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-400 pt-1">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>বিকাশ অটোমেটিক ও ম্যানুয়াল পেমেন্ট সাপোর্টেড • তাৎক্ষণিক এক্সেস</span>
            </div>
          </div>

          {/* Right Card / Visual Teaser (5 cols) */}
          <div className="lg:col-span-5">
            <Link
              to="/course/ai-motion?demo=1"
              className="group block relative rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-2xl hover:border-brand-500/50 transition-all duration-300"
            >
              {/* Image Preview with Play Overlay */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-5 border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
                  alt="AI Motion Graphics Preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-2xl ring-4 ring-brand-500/30 transition-transform duration-300 group-hover:scale-110">
                    <Play size={24} className="translate-x-0.5 fill-white" />
                  </div>
                </div>

                <div className="absolute top-3 left-3 rounded-lg bg-black/80 border border-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  HD 4K Preview
                </div>
                <div className="absolute bottom-3 right-3 rounded-lg bg-brand-600 text-white px-2.5 py-0.5 text-xs font-bold">
                  ফ্রি ডেমো
                </div>
              </div>

              {/* Card Meta */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-bold text-brand-400">bdBeginner AI Lab</span>
                  <span className="font-mono text-ink-300">১০টি ক্লাস • ১.৩০ ঘণ্টা</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                  AI মোশন গ্রাফিক্স ও সিনেমাটিক ভিডিও এডিটিং মাস্টারক্লাস
                </h3>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-emerald-400 font-semibold">
                    🎁 সম্পূর্ণ ফ্রি প্রজেক্ট ফাইল ও প্রম্পট
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    ডেমো দেখুন <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
