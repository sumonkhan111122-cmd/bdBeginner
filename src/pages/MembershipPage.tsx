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
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { MEMBERSHIP_PLANS, MEMBERSHIP_PERKS, type MembershipPlan } from '@/data/membershipPlans';
import { useCart } from '@/context/CartContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useMembership } from '@/context/MembershipContext';

export function MembershipPage() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { session } = useCustomerAuth();
  const { isVip, status, testPlan, setTestPlan } = useMembership();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSelectPlan = (plan: MembershipPlan) => {
    // Clear existing cart and add only the membership package
    clearCart();
    addItem(plan.productId, 1);
    navigate('/checkout');
  };

  const faqs = [
    {
      q: 'মেম্বারশিপ নিলে কি সত্যিই ওয়েবসাইটের সমস্ত প্রোডাক্ট ফ্রিতে ডাউনলোড করা যাবে?',
      a: 'হ্যাঁ, সম্পূর্ণ সত্য! আপনি মেম্বারশিপ এক্টিভ করার পর bdBeginner-এর ৩,০০০+ ওয়ার্ডপ্রেস থিম, প্লাগইন, পিএইচপি স্ক্রিপ্ট ও সফটওয়্যারের যেকোনো প্রোডাক্টের ডাউনলোড লিঙ্কে ক্লিক করলেই কোনো অতিরিক্ত ফি ছাড়া সরাসরি ডাউনলোড করতে পারবেন।',
    },
    {
      q: 'লাইফটাইম (৳৯৯৯) প্যাকেজে কি ভবিষ্যতে কোনো রিনিউয়াল বা অতিরিক্ত ফি আছে?',
      a: 'না, কোনো রিনিউয়াল ফি নেই! ৯৯৯ টাকা সম্পূর্ণ এককালীন পেমেন্ট। একবার নিলে আজীবন সমস্ত বর্তমান এবং ভবিষ্যতে যুক্ত হওয়া সব নতুন প্রোডাক্ট ও আপডেট সম্পূর্ণ ফ্রিতে ডাউনলোড করতে পারবেন।',
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
      a: 'হ্যাঁ! আপনার মেম্বারশিপের মেয়াদ চলাকালীন (এবং লাইফটাইম পাসের ক্ষেত্রে আজীবন) সাইটে যত নতুন প্রিমিয়াম প্রোডাক্ট আপলোড করা হবে, সবগুলোই আপনার জন্য ফ্রিতে ডাউনলোডযোগ্য হবে।',
    },
    {
      q: 'ডাউনলোডের পর ফাইল ব্যবহারে কোনো সমস্যা হলে সাপোর্ট পাব?',
      a: 'অবশ্যই! আমাদের ডেডিকেটেড হোয়াটসঅ্যাপ ও ইমেইল হেল্পডেস্ক টিম রয়েছে। যেকোনো ফাইল ডাউনলোড বা ব্যবহারে সমস্যা হলে দ্রুত সহায়তা প্রদান করা হয়।',
    },
  ];

  return (
    <Layout>
      {/* LOCALHOST DEVELOPER TEST BAR */}
      <div className="bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-purple-500/10 border-b border-brand-200/50 py-2.5 px-4 text-xs text-ink-700">
        <div className="container-page flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-brand-700">
              <Sparkles size={14} className="text-amber-500 animate-pulse" />
              লোকালহোস্ট টেস্ট কন্ট্রোল:
            </span>
            <span>
              বর্তমান স্ট্যাটাস:{' '}
              {isVip ? (
                <strong className="text-success-700 bg-success-50 px-2 py-0.5 rounded-full border border-success-200">
                  {status.planName} (সক্রিয়)
                </strong>
              ) : (
                <strong className="text-ink-600 bg-ink-100 px-2 py-0.5 rounded-full">
                  রেগুলার ইউজার
                </strong>
              )}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-ink-500 font-medium">টেস্ট মোড সুইচ করুন:</span>
            <button
              onClick={() => setTestPlan(null)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                !testPlan ? 'bg-ink-800 text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
              }`}
            >
              None
            </button>
            <button
              onClick={() => setTestPlan('monthly')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                testPlan === 'monthly' ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
              }`}
            >
              1 Month (৳499)
            </button>
            <button
              onClick={() => setTestPlan('yearly')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                testPlan === 'yearly' ? 'bg-brand-600 text-white' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
              }`}
            >
              1 Year (৳799)
            </button>
            <button
              onClick={() => setTestPlan('lifetime')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                testPlan === 'lifetime' ? 'bg-amber-600 text-white shadow-sm' : 'bg-white border border-ink-200 text-ink-700 hover:bg-ink-50'
              }`}
            >
              👑 Lifetime (৳999)
            </button>
          </div>
        </div>
      </div>

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
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl transition-all duration-300 ${
                    isLifetime
                      ? 'bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950 text-white shadow-2xl ring-2 ring-amber-400 lg:-translate-y-4 hover:shadow-amber-500/10'
                      : 'bg-white text-ink-900 border border-ink-100 shadow-soft hover:shadow-lg'
                  }`}
                >
                  {/* Top Popular/Best Value Ribbon */}
                  {plan.badge && (
                    <div
                      className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold tracking-wide uppercase shadow-md flex items-center gap-1.5 ${
                        isLifetime
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-ink-950 ring-2 ring-amber-300'
                          : 'bg-brand-600 text-white'
                      }`}
                    >
                      {isLifetime ? <Flame size={13} className="fill-ink-950 text-ink-950" /> : <Star size={13} />}
                      {plan.badgeBn || plan.badge}
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-display text-xl font-bold ${isLifetime ? 'text-white' : 'text-ink-900'}`}>
                          {plan.nameBn}
                        </h3>
                        <p className={`mt-1 text-xs ${isLifetime ? 'text-ink-300' : 'text-ink-500'}`}>
                          {plan.taglineBn}
                        </p>
                      </div>
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          isLifetime ? 'bg-amber-400/20 text-amber-300' : 'bg-brand-50 text-brand-600'
                        }`}
                      >
                        {isLifetime ? <Crown size={24} /> : plan.id === 'yearly' ? <Sparkles size={22} /> : <Zap size={22} />}
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
                      <span className={`text-xs font-medium ${isLifetime ? 'text-ink-300' : 'text-ink-500'}`}>
                        {plan.durationLabelBn}
                      </span>
                    </div>

                    {plan.savingsBn && (
                      <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-success-500/10 border border-success-500/20 px-2 py-0.5 text-xs font-bold text-success-600">
                        <Gift size={12} />
                        {plan.savingsBn}
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
                                isLifetime
                                  ? 'bg-amber-400/20 text-amber-300'
                                  : 'bg-brand-50 text-brand-600'
                              }`}
                            >
                              <Check size={11} strokeWidth={3} />
                            </span>
                            <span
                              className={`${
                                feature.highlight
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
                          ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-ink-950 hover:brightness-110 shadow-amber-400/20 hover:shadow-lg'
                          : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-600/20 hover:shadow-md'
                      }`}
                    >
                      <span>{plan.ctaTextBn}</span>
                      <ArrowRight size={16} />
                    </button>
                    <p className={`mt-2.5 text-center text-[11px] ${isLifetime ? 'text-ink-400' : 'text-ink-500'}`}>
                      {isLifetime ? 'এককালীন পেমেন্ট • কোনো লুকানো চার্জ নেই' : 'ইনস্ট্যান্ট এক্টিভেশন • bKash / Nagad / Rocket'}
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
              এক নজরে দেখে নিন কোন প্যাকেজটিতে আপনি কি কি সুবিধা পাবেন
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ink-200 bg-ink-50/50">
                  <th className="py-3.5 px-4 font-semibold text-ink-700">ফিচার ও সুবিধা</th>
                  <th className="py-3.5 px-4 font-semibold text-ink-700 text-center">১ মাস (৳৪৯৯)</th>
                  <th className="py-3.5 px-4 font-semibold text-ink-700 text-center">১ বছর (৳৭৯৯)</th>
                  <th className="py-3.5 px-4 font-bold text-amber-700 bg-amber-50/50 text-center rounded-t-xl">
                    👑 লাইফটাইম (৳৯৯৯)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">ডাউনলোড এক্সেস মেয়াদ</td>
                  <td className="py-3.5 px-4 text-center text-ink-600">৩০ দিন</td>
                  <td className="py-3.5 px-4 text-center text-ink-600">৩৬৫ দিন</td>
                  <td className="py-3.5 px-4 text-center font-bold text-brand-700 bg-amber-50/30">আজীবন (Lifetime)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">সকল বর্তমান ৩,০০০+ প্রোডাক্ট ফ্রি</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold">✓</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold">✓</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold bg-amber-50/30">✓ (আনলিমিটেড)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">ভবিষ্যতের নতুন রিলিজ অন্তর্ভুক্ত</td>
                  <td className="py-3.5 px-4 text-center text-ink-400">১ মাসের ভেতর</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold">✓ (১ বছরব্যাপী)</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold bg-amber-50/30">✓ (আজীবন সব রিলিজ)</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">দৈনিক ডাউনলোড লিমিট</td>
                  <td className="py-3.5 px-4 text-center text-ink-600">আনলিমিটেড</td>
                  <td className="py-3.5 px-4 text-center text-ink-600">আনলিমিটেড</td>
                  <td className="py-3.5 px-4 text-center font-bold text-brand-700 bg-amber-50/30">আনলিমিটেড</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">হাই-স্পিড গুগল ড্রাইভ লিঙ্ক</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold">✓</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold">✓</td>
                  <td className="py-3.5 px-4 text-center text-success-600 font-bold bg-amber-50/30">✓</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">প্রায়োরিটি সাপোর্ট</td>
                  <td className="py-3.5 px-4 text-center text-ink-400">স্ট্যান্ডার্ড</td>
                  <td className="py-3.5 px-4 text-center text-brand-600 font-medium">প্রায়োরিটি</td>
                  <td className="py-3.5 px-4 text-center font-bold text-amber-700 bg-amber-50/30">ভিআইপি হোয়াটসঅ্যাপ</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 text-ink-800 font-medium">রিনিউয়াল ফি</td>
                  <td className="py-3.5 px-4 text-center text-ink-500">মাসিক ৳৪৯৯</td>
                  <td className="py-3.5 px-4 text-center text-ink-500">বার্ষিক ৳৭৯৯</td>
                  <td className="py-3.5 px-4 text-center font-bold text-success-700 bg-amber-50/30">
                    কোনো রিনিউয়াল ফি নেই
                  </td>
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
                আপনার বাজেট ও প্রয়োজন অনুযায়ী ১ মাস (৳৪৯৯), ১ বছর (৳৭৯৯) বা লাইফটাইম (৳৯৯৯) সিলেক্ট করুন।
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
              আর দেরি না করে আজই ভিআইপি মেম্বারশিপে যুক্ত হোন!
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-ink-200 max-w-lg mx-auto">
              মাত্র ৯৯৯ টাকায় লাইফটাইম এক্সেস নিয়ে বাঁচান হাজার হাজার টাকা।
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => handleSelectPlan(MEMBERSHIP_PLANS[2])}
                className="rounded-2xl bg-amber-400 px-6 py-3 font-display text-sm font-bold text-ink-950 shadow-lg transition-transform hover:scale-105"
              >
                👑 ৳৯৯৯-এ লাইফটাইম ভিআইপি নিন
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
