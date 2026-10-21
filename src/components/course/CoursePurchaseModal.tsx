import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  CreditCard,
  KeyRound,
  AlertCircle,
  Film,
} from 'lucide-react';
import { AI_MOTION_COURSE, courseToProduct } from '@/data/aiMotionCourse';
import { enrollInCourse } from '@/services/courseEnrollment';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface CoursePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnrollSuccess: (email: string) => void;
}

export function CoursePurchaseModal({
  isOpen,
  onClose,
  onEnrollSuccess,
}: CoursePurchaseModalProps) {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { session } = useCustomerAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState(session?.user?.email || '');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Handle standard site checkout redirect
  const handleGoToFullCheckout = () => {
    clearCart();
    addItem(courseToProduct(), 1, false);
    onClose();
    navigate('/checkout');
  };

  // Handle instant course enrollment with bKash/Nagad
  const handleQuickEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    handleGoToFullCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto font-['Hind_Siliguri',sans-serif]">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#0b1329] border border-white/10 p-6 sm:p-8 shadow-2xl text-white my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-ink-300 hover:text-white hover:bg-white/20 transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4 animate-scale-in">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-2xl font-bold text-white">
              অভিনন্দন! কোর্সটি সক্রিয় হয়েছে 🎉
            </h3>

            <p className="text-sm sm:text-base text-ink-300 max-w-md mx-auto leading-relaxed">
              আপনার জিমেইল (<strong className="text-brand-300">{email}</strong>) এই ব্রাউজারে স্বয়ংক্রিয়ভাবে সেভ করা হয়েছে। আপনাকে সরাসরি কোর্স প্লেয়ারে নিয়ে যাওয়া হচ্ছে...
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onEnrollSuccess(email)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg hover:bg-brand-500 transition-all"
              >
                <span>কোর্সের ক্লাস শুরু করুন</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="text-center pb-5 border-b border-white/10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 border border-brand-500/40 px-3 py-1 text-xs font-bold text-brand-300 mb-2">
                <Sparkles size={13} className="text-amber-400" />
                <span>লিমিটেড টাইম লঞ্চ অফার</span>
              </span>

              <h2 className="text-lg sm:text-xl font-bold text-white">
                {AI_MOTION_COURSE.title}
              </h2>

              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="text-3xl font-extrabold text-white">৳১৯৯</span>
                <span className="text-base text-ink-500 line-through">৳১,৯৯৯</span>
                <span className="rounded-xl bg-amber-400 text-ink-950 px-2.5 py-0.5 text-xs font-black">
                  ৯০% ছাড়
                </span>
              </div>
            </div>

            {/* Quick value badges */}
            <div className="my-4 flex items-center justify-center gap-4 text-xs text-ink-300">
              <span className="flex items-center gap-1.5">
                <Film size={14} className="text-brand-400" /> ১০টি ক্লাস
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-amber-400" /> ইনস্ট্যান্ট এক্সেস
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" /> আজীবন মেয়াদ
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleQuickEnroll} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-ink-300 mb-1" htmlFor="student-name">
                  আপনার নাম (পূর্ণ নাম)
                </label>
                <input
                  id="student-name"
                  type="text"
                  required
                  placeholder="যেমন: মোঃ সুমন"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-10 rounded-xl border border-ink-700 bg-ink-950 px-3.5 text-xs text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-300 mb-1" htmlFor="student-email">
                  আপনার Gmail / Email <span className="text-brand-400 font-bold">*</span>
                </label>
                <input
                  id="student-email"
                  type="email"
                  required
                  placeholder="yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 rounded-xl border border-ink-700 bg-ink-950 px-3.5 text-xs text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-[11px] text-ink-400 mt-1 block">
                  কেনার সময় কোনো পাসওয়ার্ড লাগবে না। এই জিমেইল দিয়েই সরাসরি দেখতে পারবেন।
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-300 mb-1" htmlFor="student-phone">
                  মোবাইল নম্বর (bKash / Nagad) <span className="text-brand-400 font-bold">*</span>
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 rounded-xl border border-ink-700 bg-ink-950 px-3.5 text-xs text-white placeholder:text-ink-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-ink-300 mb-1.5">
                  পেমেন্ট মাধ্যম বেছে নিন
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bkash', label: 'bKash', color: 'border-pink-500 text-pink-400 bg-pink-500/10' },
                    { id: 'nagad', label: 'Nagad', color: 'border-orange-500 text-orange-400 bg-orange-500/10' },
                    { id: 'rocket', label: 'Rocket', color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === pm.id
                          ? `${pm.color} ring-1 ring-white/20`
                          : 'border-ink-800 bg-ink-950 text-ink-400 hover:border-ink-700'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-accent-600 px-6 py-3 text-sm font-extrabold text-white shadow-xl hover:opacity-95 transition-all disabled:opacity-50"
              >
                <span>{submitting ? 'প্রসেসিং হচ্ছে...' : 'এখনই ১৯৯ টাকায় ভর্তি হন'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Alternative Full Checkout Link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={handleGoToFullCheckout}
                  className="text-xs text-ink-400 hover:text-brand-300 underline underline-offset-2"
                >
                  অথবা রেগুলার শপিং কার্ট ও চেকআউটে যান
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
