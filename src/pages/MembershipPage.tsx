import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Crown,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Package,
  Clock,
  Infinity as InfinityIcon,
  Star,
  ChevronDown,
  Gift,
  Flame,
  X,
  AlertCircle,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { MEMBERSHIP_PLANS, MEMBERSHIP_PERKS, planToProduct, type MembershipPlan } from '@/data/membershipPlans';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';
import { trackSubscribe, trackViewContent } from '@/lib/tracking';

export function MembershipPage() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { session } = useCustomerAuth();
  const { isVip, status } = useMembership();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  React.useEffect(() => {
    trackViewContent({
      id: 'vip-membership',
      name: 'VIP All-Access Membership',
      price: 1199,
      category: 'Membership',
    });
  }, []);

  const handleSelectPlan = (plan: MembershipPlan) => {
    trackSubscribe(plan.name, plan.price);
    // Clear existing cart and add only the membership package
    clearCart();
    addItem(planToProduct(plan), 1, false);
    navigate('/checkout');
  };

  const faqs = [
    {
      q: '১ মাস ওয়ার্ডপ্রেস পাস (৳৪৯৯), ১ মাস অল-এক্সেস (৳৮৯৯) এবং লাইফটাইম (৳১,১৯৯)-এর মধ্যে পার্থক্য কী?',
      a: '১ মাস ওয়ার্ডপ্রেস পাস (৳৪৯৯) দিয়ে শুধুমাত্র ৩,০০০+ ওয়ার্ডপ্রেস থিম ও প্লাগইন ৩০ দিনের জন্য ডাউনলোড করা যাবে (কোর্স, সফটওয়্যার বা স্ক্রিপ্ট অন্তর্ভুক্ত নয়)। ১ মাস অল-এক্সেস (৳৮৯৯) দিয়ে সাইটের সমস্ত প্রোডাক্ট ডাউনলোড করা যাবে তবে মেয়াদ মাত্র ৩০ দিন। পক্ষান্তরে, লাইফটাইম ভিআইপি পাসে (৳১,১৯৯) মাত্র ৩০০ টাকা বেশিতে আপনি পাবেন সমস্ত থিম, প্লাগইন, কোর্স, সফটওয়্যার, স্ক্রিপ্ট ও এআই টুলস — আজীবন সম্পূর্ণ ফ্রি এবং ভবিষ্যতের সব নতুন আপডেট সহ! তাই এটি সবচেয়ে লাভজনক ও জনপ্রিয় চয়েস।',
    },
    {
      q: 'লাইফটাইম (৳১,১৯৯) প্যাকেজে কি ভবিষ্যতে কোনো রিনিউয়াল বা অতিরিক্ত ফি আছে?',
      a: 'না, কোনো রিনিউয়াল বা মাসিক ফি নেই! ১,১৯৯ টাকা সম্পূর্ণ এককালীন (One-Time) পেমেন্ট। একবার নিলে আজীবন সমস্ত বর্তমান এবং ভবিষ্যতে যুক্ত হওয়া সব নতুন প্রোডাক্ট ও আপডেট সম্পূর্ণ ফ্রিতে ডাউনলোড করতে পারবেন।',
    },
    {
      q: '১ মাস ওয়ার্ডপ্রেস পাস (৳৪৯৯) নিলে কি কোর্স বা সফটওয়্যার ডাউনলোড করা যাবে?',
      a: 'না, ৳৪৯৯ প্যাকেজটি শুধুমাত্র ওয়ার্ডপ্রেস থিম ও প্লাগইনের জন্য নির্ধারিত। ভিডিও কোর্স, প্রিমিয়াম সফটওয়্যার, পিএইচপি স্ক্রিপ্ট বা এআই টুলস আনলিমিটেড ডাউনলোড করতে চাইলে আজীবন ভিআইপি পাস অথবা ১ মাস অল-এক্সেস পাস বেছে নিন।',
    },
    {
      q: 'পেমেন্ট কিভাবে করতে হবে এবং একাউন্ট কখন এক্টিভ হবে?',
      a: 'আপনি বিকাশ (bKash), নগদ (Nagad) অথবা রকেটের মাধ্যমে সরাসরি পেমেন্ট করতে পারবেন। পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই আপনার মেম্বারশিপ ইনস্ট্যান্টলি এক্টিভ হয়ে যাবে।',
    },
    {
      q: 'ফাইলগুলো কি অরিজিনাল ও ভাইরাস মুক্ত?',
      a: 'হ্যাঁ, আমাদের প্ল্যাটফর্মের সমস্ত প্রোডাক্ট ১০০% অরিজিনাল, ক্লিন ও ম্যালওয়্যার-মুক্ত। প্রতিটি ফাইল VirusTotal এবং কড়া সিকিউরিটি টেস্ট পাস করার পরই আপলোড করা হয়।',
    },
    {
      q: 'ভবিষ্যতে নতুন থিম বা প্লাগইন এলে কি সেগুলোও ফ্রিতে পাব?',
      a: 'হ্যাঁ! লাইফটাইম ভিআইপি মেম্বারদের জন্য ভবিষ্যতে সাইটে যত নতুন প্রিমিয়াম প্রোডাক্ট ও লেটেস্ট ভার্সন আপডেট আপলোড করা হবে, সবগুলোই আজীবন সম্পূর্ণ ফ্রিতে ডাউনলোডযোগ্য হবে।',
    },
    {
      q: 'ডাউনলোডের পর ফাইল ব্যবহারে কোনো সমস্যা হলে সাপোর্ট পাব?',
      a: 'অবশ্যই! লাইফটাইম ভিআইপি মেম্বারদের জন্য আমাদের ডেডিকেটেড ভিআইপি হোয়াটসঅ্যাপ হেল্পডেস্ক এবং প্রায়োরিটি সাপোর্ট টিম রয়েছে। যেকোনো ফাইল ডাউনলোড বা ব্যবহারে সমস্যা হলে সরাসরি সহায়তা পাবেন।',
    },
  ];

  return (
    <Layout>
      {/* Active VIP Member Notice (only for real paid VIPs) */}
      {isVip && (
        <div className="bg-amber-500/10 border-b border-amber-300/40 py-2.5 px-4 text-xs sm:text-sm text-ink-800">
          <div className="container-page flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-amber-500 shrink-0" />
              <span>
                আপনি একজন সক্রিয় <strong>{status.planName}</strong> মেম্বার!
              </span>
            </div>
            <Link
              to="/account/downloads"
              className="font-semibold text-brand-700 hover:text-brand-800 underline underline-offset-2 flex items-center gap-1"
            >
              ডাউনলোড লাইব্রেরিতে যান <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-ink-950 text-white py-16 lg:py-24">
        {/* Glow circles */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 right-10 h-96 w-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="container-page relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300 shadow-inner backdrop-blur-sm">
            <Crown size={15} className="text-amber-400" />
            <span>VIP ALL-ACCESS CLUB • লিমিটেড টাইম স্পেশাল ডিল</span>
          </div>

          <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            একটি সাবস্ক্রিপশনেই সকল প্রিমিয়াম প্রোডাক্ট{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-brand-300">
              আনলিমিটেড ফ্রি ডাউনলোড
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-ink-200 max-w-2xl mx-auto leading-relaxed">
            ৩,০০০+ প্রিমিয়াম ওয়ার্ডপ্রেস থিম, প্লাগইন, পিএইচপি স্ক্রিপ্ট ও সফটওয়্যার। প্রতিটি ফাইল আলাদা আলাদা না কিনে এককালীন মেম্বারশিপে উপভোগ করুন সম্পূর্ণ আনলিমিটেড ফ্রি এক্সেস!
          </p>

          {/* Quick value badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-ink-200">
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
              <Package size={14} className="text-brand-400" />
              ৩,০০০+ প্রিমিয়াম প্রোডাক্ট
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
              <Zap size={14} className="text-amber-400" />
              হাই-স্পিড ডিরেক্ট ক্লাউড ডাউনলোড
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-success-400" />
              ১০০% ভাইরাস ও ম্যালওয়্যার মুক্ত
            </span>
            <span className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3.5 py-1.5 backdrop-blur-sm">
              <Clock size={14} className="text-purple-400" />
              ইনস্ট্যান্ট একাউন্ট এক্টিভেশন
            </span>
          </div>
        </div>
      </section>

      {/* PRICING CARDS SECTION */}
      <section className="relative -mt-10 lg:-mt-14 pb-20">
        <div className="container-page">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6 items-stretch">
            {MEMBERSHIP_PLANS.map((plan) => {
              const isLifetime = plan.id === 'lifetime';
              const isDecoy = plan.id === 'yearly';

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl transition-all duration-300 ${
                    isLifetime
                      ? 'bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 text-white shadow-2xl ring-2 ring-amber-400 lg:-translate-y-5 lg:scale-105 z-20 hover:shadow-amber-500/20'
                      : isDecoy
                      ? 'bg-white text-ink-900 border border-brand-200 shadow-soft hover:shadow-lg'
                      : 'bg-white text-ink-900 border border-ink-200 shadow-soft hover:shadow-lg'
                  }`}
                >
                  {/* Top Popular/Best Value Ribbon */}
                  {plan.badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 text-xs font-bold tracking-wide uppercase shadow-sm flex items-center gap-1.5 ${
                        isLifetime
                          ? 'bg-amber-400 text-ink-950 ring-2 ring-amber-300 font-extrabold'
                          : 'bg-brand-600 text-white'
                      }`}
                    >
                      {isLifetime ? <Sparkles size={12} className="text-ink-950" /> : <Star size={12} />}
                      <span>{plan.badgeBn || plan.badge}</span>
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-display text-xl font-bold ${isLifetime ? 'text-white' : 'text-ink-900'}`}>
                          {plan.nameBn}
                        </h3>
                        <p className={`mt-1 text-xs ${isLifetime ? 'text-amber-200/80' : 'text-ink-500'}`}>
                          {plan.taglineBn}
                        </p>
                      </div>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isLifetime ? 'bg-amber-400/20 text-amber-300' : isDecoy ? 'bg-purple-50 text-purple-600' : 'bg-brand-50 text-brand-600'
                        }`}
                      >
                        {isLifetime ? <Crown size={22} className="text-amber-400" strokeWidth={2} /> : isDecoy ? <Sparkles size={20} /> : <Package size={20} />}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight">
                        ৳{plan.price}
                      </span>
                      <span className={`text-sm font-semibold line-through ${isLifetime ? 'text-ink-400' : 'text-ink-400'}`}>
                        ৳{plan.originalPrice}
                      </span>
                      <span className={`text-xs font-medium ${isLifetime ? 'text-amber-300' : 'text-ink-500'}`}>
                        {plan.durationLabelBn}
                      </span>
                    </div>

                    {plan.savingsBn && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-success-500/10 border border-success-500/20 px-2.5 py-0.5 text-xs font-bold text-success-600">
                        <Gift size={12} />
                        <span>{plan.savingsBn}</span>
                      </div>
                    )}

                    {/* Decoy psychological callout note for Lifetime */}
                    {plan.decoyNoteBn && (
                      <div className="mt-3 rounded-xl bg-amber-400/15 border border-amber-400/30 p-2.5 text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 shadow-inner">
                        <Sparkles size={13} className="text-amber-300 shrink-0" />
                        <span>{plan.decoyNoteBn}</span>
                      </div>
                    )}

                    {/* Divider */}
                    <div className={`my-6 h-px ${isLifetime ? 'bg-ink-800' : 'bg-ink-100'}`} />

                    {/* Features List */}
                    <div className="space-y-3">
                      <p className={`text-xs font-bold uppercase tracking-wider ${isLifetime ? 'text-amber-300' : 'text-ink-500'}`}>
                        প্যাকেজের অন্তর্ভুক্ত সুবিধা:
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                            <span
                              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                                feature.unavailable
                                  ? 'bg-rose-500/15 text-rose-500'
                                  : isLifetime
                                  ? 'bg-amber-400/20 text-amber-300'
                                  : 'bg-brand-50 text-brand-600'
                              }`}
                            >
                              {feature.unavailable ? (
                                <X size={11} strokeWidth={3} />
                              ) : (
                                <Check size={11} strokeWidth={3} />
                              )}
                            </span>
                            <span
                              className={`${
                                feature.unavailable
                                  ? 'text-ink-400 line-through'
                                  : feature.highlight
                                  ? isLifetime
                                    ? 'font-bold text-amber-100'
                                    : 'font-bold text-brand-700'
                                  : isLifetime
                                  ? 'text-ink-200'
                                  : 'text-ink-700'
                              }`}
                            >
                              {feature.textBn}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="p-6 sm:p-8 pt-0">
                    <button
                      type="button"
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3.5 px-6 rounded-2xl font-display font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                        isLifetime
                          ? 'bg-amber-400 text-ink-950 hover:bg-amber-300 active:scale-[0.99] shadow-amber-400/20 hover:shadow-lg font-extrabold text-base'
                          : isDecoy
                          ? 'bg-brand-700 text-white hover:bg-brand-800 shadow-brand-700/20 hover:shadow-md'
                          : 'bg-ink-900 text-white hover:bg-ink-800 shadow-ink-900/20 hover:shadow-md'
                      }`}
                    >
                      <span>{plan.ctaTextBn}</span>
                      <ArrowRight size={16} />
                    </button>
                    <p className={`mt-2.5 text-center text-[11px] ${isLifetime ? 'text-amber-200/80 font-medium' : 'text-ink-500'}`}>
                      {isLifetime ? 'এককালীন পেমেন্ট • আজীবন ফ্রি এক্সেস • নো রিনিউয়াল' : 'ইনস্ট্যান্ট এক্টিভেশন • বিকাশ / নগদ / রকেট'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PLAN COMPARISON SECTION */}
      <section className="py-16 bg-white border-y border-ink-100">
        <div className="container-page max-w-4xl">
          <div className="text-center">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
              প্ল্যান তুলনা ও ফিচার কম্প্যারিজন
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              এক নজরে দেখে নিন কোন প্যাকেজটিতে আপনি কি কি সুবিধা পাবেন এবং কেন লাইফটাইম পাস সেরা
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50/50">
                  <th className="py-3.5 px-4 font-semibold text-ink-700">ফিচার ও সুবিধা</th>
                  <th className="py-3.5 px-4 font-semibold text-ink-700 text-center">১ মাস WP পাস (৳৪৯৯)</th>
                  <th className="py-3.5 px-4 font-bold text-amber-950 bg-amber-100/70 text-center rounded-t-xl ring-1 ring-amber-300">
                    <div className="flex items-center justify-center gap-1.5">
                      <Crown size={15} className="text-amber-600 shrink-0" />
                      <span>আজীবন ভিআইপি (৳১,১৯৯)</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 font-semibold text-ink-700 text-center">১ মাস অল-এক্সেস (৳৮৯৯)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">ডাউনলোড এক্সেস মেয়াদ</td>
                  <td className="py-3.5 px-4 text-center text-ink-600">৩০ দিন</td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-900 bg-amber-50/40">আজীবন (Lifetime)</td>
                  <td className="py-3.5 px-4 text-center text-ink-600">৩০ দিন</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">দৈনিক ডাউনলোড লিমিট</td>
                  <td className="py-3.5 px-4 text-center font-bold text-ink-800">সর্বোচ্চ ১০টি ফাইল / দিন</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-amber-50/40">
                    <span className="inline-flex items-center gap-1">
                      <Check size={14} className="text-emerald-600" />
                      <span>আনলিমিটেড (সীমাহীন)</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-ink-800">সর্বোচ্চ ২০টি ফাইল / দিন</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">ওয়ার্ডপ্রেস থিম ও প্লাগইন (৩,০০০+)</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> অন্তর্ভুক্ত (৩০ দিন)
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-700 font-bold bg-amber-50/40">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> আজীবন ফ্রি
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> অন্তর্ভুক্ত (৩০ দিন)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">প্রিমিয়াম ভিডিও কোর্স ও টিউটোরিয়াল</td>
                  <td className="py-3.5 px-4 text-center text-rose-500 font-medium">
                    <X size={15} className="inline mr-1 text-rose-500" /> অন্তর্ভুক্ত নয়
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-700 font-bold bg-amber-50/40">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> আজীবন আনলিমিটেড
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> অন্তর্ভুক্ত (৩০ দিন)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">সফটওয়্যার, এআই টুলস ও পিএইচপি স্ক্রিপ্ট</td>
                  <td className="py-3.5 px-4 text-center text-rose-500 font-medium">
                    <X size={15} className="inline mr-1 text-rose-500" /> অন্তর্ভুক্ত নয়
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-700 font-bold bg-amber-50/40">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> আজীবন আনলিমিটেড
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> অন্তর্ভুক্ত (৩০ দিন)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">ভবিষ্যতের সকল নতুন রিলিজ ও প্রোডাক্ট</td>
                  <td className="py-3.5 px-4 text-center text-ink-400">
                    <X size={15} className="inline mr-1 text-rose-400" /> নেই
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-700 font-bold bg-amber-50/40">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> আজীবন সব নতুন প্রোডাক্ট ফ্রি
                  </td>
                  <td className="py-3.5 px-4 text-center text-ink-400">
                    <X size={15} className="inline mr-1 text-rose-400" /> মেয়াদ শেষে বন্ধ
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">নিয়মিত লেটেস্ট ভার্সন আপডেট</td>
                  <td className="py-3.5 px-4 text-center text-ink-400">৩০ দিন পর বন্ধ</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-amber-50/40">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> আজীবন সম্পূর্ণ ফ্রি আপডেট
                  </td>
                  <td className="py-3.5 px-4 text-center text-ink-400">৩০ দিন পর বন্ধ</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড লিঙ্ক</td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> ডিরেক্ট ক্লাউড
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-700 font-bold bg-amber-50/40">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> হাই-স্পিড ক্লাউড
                  </td>
                  <td className="py-3.5 px-4 text-center text-emerald-600 font-medium">
                    <Check size={15} className="inline mr-1 text-emerald-600" /> ডিরেক্ট ক্লাউড
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">কাস্টমার ও টেকনিক্যাল সাপোর্ট</td>
                  <td className="py-3.5 px-4 text-center text-ink-500">স্ট্যান্ডার্ড</td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-900 bg-amber-50/40">
                    ভিআইপি প্রাইভেট সাপোর্ট
                  </td>
                  <td className="py-3.5 px-4 text-center text-brand-600 font-medium">প্রায়োরিটি</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">রিনিউয়াল ফি</td>
                  <td className="py-3.5 px-4 text-center text-ink-500">মাসিক ৳৪৯৯</td>
                  <td className="py-3.5 px-4 text-center font-bold text-emerald-700 bg-amber-50/40">
                    কোনো রিনিউয়াল ফি নেই (এককালীন)
                  </td>
                  <td className="py-3.5 px-4 text-center text-ink-500">মাসিক ৳৮৯৯</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="py-16 bg-ink-50/50">
        <div className="container-page">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">কেন bdBeginner VIP বেছে নেবেন?</span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink-900">
              ডিজিটাল কাজের জন্য আপনার সম্পূর্ণ টুলকিট
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {MEMBERSHIP_PERKS.map((perk, i) => (
              <div
                key={i}
                className="rounded-2xl border border-ink-100 bg-white p-6 shadow-soft transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  {perk.icon === 'Package' ? (
                    <Package size={22} />
                  ) : perk.icon === 'Zap' ? (
                    <Zap size={22} />
                  ) : perk.icon === 'ShieldCheck' ? (
                    <ShieldCheck size={22} />
                  ) : perk.icon === 'RefreshCw' ? (
                    <Sparkles size={22} />
                  ) : (
                    <HelpCircle size={22} />
                  )}
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-ink-900">{perk.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-ink-500 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white">
        <div className="container-page max-w-4xl text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
            মাত্র ৩টি সহজ ধাপে শুরু করুন
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-display text-xl font-bold shadow-brand-600/30 shadow-lg">
                ১
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">প্ল্যান বেছে নিন</h3>
              <p className="mt-2 text-xs text-ink-500">
                আপনার বাজেট ও প্রয়োজন অনুযায়ী ১ মাস WP পাস (৳৪৯৯), ১ মাস অল-এক্সেস (৳৮৯৯) বা সেরা অফারে আজীবন ভিআইপি পাস (৳১,১৯৯) সিলেক্ট করুন।
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-display text-xl font-bold shadow-brand-600/30 shadow-lg">
                ২
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">সহজ পেমেন্ট</h3>
              <p className="mt-2 text-xs text-ink-500">
                বিকাশ, নগদ বা রকেটের মাধ্যমে ইনস্ট্যান্ট পেমেন্ট সম্পন্ন করুন।
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-display text-xl font-bold shadow-brand-600/30 shadow-lg">
                ৩
              </span>
              <h3 className="mt-4 font-display text-base font-bold text-ink-900">আনলিমিটেড ডাউনলোড</h3>
              <p className="mt-2 text-xs text-ink-500">
                একাউন্ট এক্টিভ হওয়া মাত্রই যেকোনো প্রোডাক্ট ১ ক্লিকে হাই-স্পিডে ডাউনলোড করা শুরু করুন!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-16 bg-ink-50/50 border-t border-ink-100">
        <div className="container-page max-w-3xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">সাধারণ প্রশ্ন ও উত্তর</span>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-ink-900">
              সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ (FAQ)
            </h2>
          </div>

          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-ink-100 bg-white shadow-soft transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-display text-sm sm:text-base font-semibold text-ink-900"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-ink-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-ink-600 leading-relaxed border-t border-ink-50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Final Callout */}
          <div className="mt-14 rounded-3xl bg-gradient-to-r from-brand-600 to-ink-900 p-8 text-center text-white shadow-xl">
            <h3 className="font-display text-xl sm:text-2xl font-bold">
              আর দেরি না করে আজই ভিআইপি ক্লাবে যুক্ত হোন!
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-ink-200 max-w-lg mx-auto">
              মাত্র ১,১৯৯ টাকায় আজীবন ভিআইপি এক্সেস নিয়ে বাঁচান হাজার হাজার টাকা।
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  const lifetimePlan = MEMBERSHIP_PLANS.find(p => p.id === 'lifetime') || MEMBERSHIP_PLANS[1];
                  handleSelectPlan(lifetimePlan);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 px-6 py-3 font-display text-sm font-bold text-ink-950 shadow-lg transition-transform hover:scale-105"
              >
                <Crown size={17} className="text-ink-950 shrink-0" strokeWidth={2.2} />
                <span>আজীবন ভিআইপি পাস নিন (৳১,১৯৯)</span>
              </button>
              <Link
                to="/products"
                className="rounded-2xl bg-white/10 border border-white/20 px-6 py-3 font-display text-sm font-semibold text-white hover:bg-white/20"
              >
                প্রোডাক্টগুলো ব্রাউজ করুন &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
export default MembershipPage;
