import { useState, useEffect } from 'react';
import { X, Sparkles, Gift, ArrowRight, ShieldCheck, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CourseDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaim: () => void;
  originalPrice?: number;
  discountAmount?: number;
}

export function CourseDiscountModal({
  isOpen,
  onClose,
  onClaim,
  originalPrice = 290,
  discountAmount = 50,
}: CourseDiscountModalProps) {
  const finalPrice = originalPrice - discountAmount;
  const [secondsLeft, setSecondsLeft] = useState(300); // 5 min countdown urgency

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-purple-400/80 bg-white p-6 sm:p-8 text-center shadow-2xl animate-scale-in">
        {/* Top Glow & Badge */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 h-28 w-44 rounded-full bg-gradient-to-b from-purple-500/30 to-transparent blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-ink-50 text-ink-500 hover:bg-ink-100 hover:text-ink-800 transition-colors"
          aria-label="Close offer"
        >
          <X size={18} />
        </button>

        {/* Gift Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-brand-500 text-white shadow-lg ring-8 ring-purple-100">
          <Gift size={32} className="animate-bounce" />
        </div>

        {/* Discount Pill */}
        <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-100 via-brand-100 to-purple-100 px-3.5 py-1 text-xs font-bold text-purple-900 border border-purple-200">
          <Sparkles size={14} className="text-purple-600 fill-purple-500" />
          <span>স্পেশাল সারপ্রাইজ অফার • ৳৫০ ডিসকাউন্ট</span>
        </div>

        {/* Heading */}
        <h3 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-ink-900 leading-tight">
          চিন্তা করবেন না! আপনার জন্য বিশেষ ছাড় 🎉
        </h3>

        {/* Subtitle */}
        <p className="mt-2.5 text-sm text-ink-600 leading-relaxed max-w-md mx-auto">
          ২৯০ টাকার সম্পূর্ণ <strong>AI মোশন গ্রাফিক্স মাস্টারক্লাস</strong> এখনই পেয়ে যাচ্ছেন মাত্র <strong>২৪০ টাকায়</strong>! ৫০ টাকা সরাসরি ক্যাশ ডিসকাউন্ট পেতে এখনই অফারটি ক্লেইম করুন।
        </p>

        {/* Pricing Box */}
        <div className="mt-6 rounded-2xl border border-purple-200 bg-gradient-to-b from-purple-50/70 to-brand-50/30 p-4">
          <div className="flex items-center justify-center gap-4">
            <div className="text-left">
              <span className="text-xs text-ink-400 block line-through">রেগুলার মূল্য: ৳{originalPrice}</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-semibold text-purple-700">অফার মূল্য:</span>
                <span className="font-display text-3xl font-black text-purple-900">
                  ৳{finalPrice}
                </span>
              </div>
            </div>

            <div className="h-10 w-px bg-purple-200" />

            <div className="rounded-xl bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20 text-emerald-800 text-xs font-bold">
              <span className="block text-[11px] font-normal text-emerald-600">আপনি বাঁচাচ্ছেন</span>
              ৳{discountAmount} সাশ্রয়!
            </div>
          </div>

          {/* Countdown timer */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 rounded-lg py-1 px-3 w-fit mx-auto border border-amber-200">
            <Clock size={13} className="text-amber-600 animate-spin" />
            <span>অফারের সময় বাকি: <strong className="font-mono font-bold text-amber-900">{timeFormatted}</strong></span>
          </div>
        </div>

        {/* Offer Points */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs font-medium text-ink-700 max-w-xs mx-auto">
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>১০টি সম্পূর্ণ ক্লাস</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>প্রজেক্ট সোর্স ফাইল</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>আজীবন এক্সেস</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check size={14} className="text-emerald-600 shrink-0" />
            <span>ইনস্ট্যান্ট এক্সেস</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            size="lg"
            variant="primary"
            onClick={onClaim}
            className="w-full bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white font-bold py-3.5 shadow-lg shadow-purple-600/20 text-base"
          >
            <span>অফারটি গ্রহণ করুন (৳২৪০-তে কিনুন)</span>
            <ArrowRight size={18} />
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium text-ink-500 hover:text-ink-800 py-1 transition-colors"
          >
            না, ধন্যবাদ (২৯০ টাকা দিয়েই কিনবো)
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-ink-400">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>১০০% নিরাপদ বিকাশ পেমেন্ট ও ইনস্ট্যান্ট অ্যাক্টিভেশন</span>
        </div>
      </div>
    </div>
  );
}
export default CourseDiscountModal;
