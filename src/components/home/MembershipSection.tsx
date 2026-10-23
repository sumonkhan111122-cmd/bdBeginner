import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Check, ArrowRight, Zap, ShieldCheck, Sparkles, Download, RefreshCw, X, Package, Star } from 'lucide-react';
import { MEMBERSHIP_PLANS, planToProduct, type MembershipPlan } from '@/data/membershipPlans';
import { useCart } from '@/context/CartContext';

export function MembershipSection() {
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();

  const handleSelectPlan = (plan: MembershipPlan) => {
    clearCart();
    addItem(planToProduct(plan), 1, false);
    navigate('/checkout');
  };

  return (
    <section className="section-padding bg-ink-50/40 border-y border-ink-100 relative overflow-hidden">
      <div className="container-page relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-900 shadow-xs">
            <Crown size={14} className="text-amber-600" strokeWidth={2} />
            <span>VIP ALL-ACCESS MEMBERSHIP</span>
          </div>

          <h2 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink-900">
            ৩,০০০+ ডিজিটাল প্রোডাক্ট — <span className="text-brand-600">সবকিছু একটি মেম্বারশিপে</span>
          </h2>

          <p className="mt-3 text-sm sm:text-base leading-relaxed text-ink-600 max-w-2xl mx-auto">
            ওয়ার্ডপ্রেস থিম, প্লাগইন ও পিএইচপি স্ক্রিপ্ট সবার জন্য সম্পূর্ণ ফ্রি! আর সাইটের সমস্ত প্রিমিয়াম পেইড কোর্স, সফটওয়্যার ও এআই টুলস আনলক করতে বেছে নিন আপনার পছন্দের VIP পাস।
          </p>
        </div>

        {/* 3 Balanced Pricing Cards with Center-Stage Lifetime VIP Hero */}
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-6 items-stretch max-w-5xl mx-auto">
          {MEMBERSHIP_PLANS.map((plan) => {
            const isLifetime = plan.id === 'lifetime';
            const isDecoy = plan.id === 'yearly';

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-300 ${
                  isLifetime
                    ? 'border-2 border-amber-400 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/20 shadow-2xl ring-4 ring-amber-400/20 lg:-translate-y-4 lg:scale-105 z-10'
                    : isDecoy
                    ? 'border border-brand-200 bg-white shadow-card hover:border-brand-300 hover:shadow-md'
                    : 'border border-ink-200 bg-white shadow-card hover:border-ink-300 hover:shadow-md'
                }`}
              >
                {/* Top Badge */}
                {plan.badge && (
                  <div
                    className={`absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 text-[11px] font-extrabold tracking-wide uppercase shadow-md flex items-center gap-1.5 ${
                      isLifetime
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-ink-950 ring-2 ring-amber-300'
                        : isDecoy
                        ? 'bg-brand-700 text-white'
                        : 'bg-ink-800 text-white'
                    }`}
                  >
                    {isLifetime ? <Sparkles size={12} className="text-ink-950" /> : <Star size={12} />}
                    <span>{plan.badgeBn || plan.badge}</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-900">
                        {plan.nameBn}
                      </h3>
                      <p className="mt-1 text-xs text-ink-500">{plan.taglineBn}</p>
                    </div>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isLifetime
                          ? 'bg-amber-100 text-amber-700'
                          : isDecoy
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-brand-50 text-brand-600'
                      }`}
                    >
                      {isLifetime ? <Crown size={20} className="text-amber-600" strokeWidth={2} /> : isDecoy ? <Sparkles size={20} /> : <Package size={20} />}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="mt-6 flex items-baseline gap-2">
                    <span className="font-display text-4xl font-extrabold text-ink-900">
                      ৳{plan.price}
                    </span>
                    <span className="text-sm font-semibold text-ink-400 line-through">
                      ৳{plan.originalPrice}
                    </span>
                    <span className="text-xs font-medium text-ink-500">
                      {plan.durationLabelBn}
                    </span>
                  </div>

                  {plan.savingsBn && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                      <Sparkles size={11} className="text-amber-600" />
                      <span>{plan.savingsBn}</span>
                    </div>
                  )}

                  {/* Decoy callout note for Lifetime */}
                  {plan.decoyNoteBn && (
                    <div className="mt-2.5 rounded-lg bg-amber-400/15 border border-amber-400/30 px-2.5 py-1 text-[11px] font-bold text-amber-900 flex items-center justify-center gap-1">
                      <Sparkles size={12} className="text-amber-700 shrink-0" />
                      <span>{plan.decoyNoteBn}</span>
                    </div>
                  )}

                  <div className="my-5 h-px bg-ink-100" />

                  {/* Feature Checklist */}
                  <ul className="space-y-2.5 text-xs text-ink-700">
                    {plan.features.slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                            f.unavailable
                              ? 'bg-rose-50 text-rose-500'
                              : isLifetime
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-brand-50 text-brand-700'
                          }`}
                        >
                          {f.unavailable ? <X size={10} strokeWidth={3} /> : <Check size={11} strokeWidth={3} />}
                        </span>
                        <span className={f.unavailable ? 'text-ink-400 line-through' : f.highlight ? 'font-bold text-ink-900' : 'text-ink-600'}>
                          {f.textBn}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-4 rounded-xl font-display font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                      isLifetime
                        ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-ink-950 hover:brightness-105 active:scale-[0.99] shadow-md shadow-amber-500/20 font-extrabold text-sm'
                        : isDecoy
                        ? 'bg-brand-700 text-white hover:bg-brand-800 active:scale-[0.99] shadow-sm'
                        : 'bg-ink-900 text-white hover:bg-ink-800 active:scale-[0.99]'
                    }`}
                  >
                    <span>{plan.ctaTextBn}</span>
                    <ArrowRight size={15} />
                  </button>
                  <p className={`mt-2 text-center text-[10px] ${isLifetime ? 'text-amber-800 font-semibold' : 'text-ink-400'}`}>
                    {isLifetime ? 'এককালীন পেমেন্ট • আজীবন ফ্রি এক্সেস' : 'তাত্ক্ষণিক সক্রিয়করণ • বিকাশ / নগদ'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Value Trust Bar & Full Details Link */}
        <div className="mt-12 rounded-2xl border border-ink-100 bg-white p-5 shadow-soft max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-ink-100">
            <div className="flex items-center gap-3 justify-center sm:justify-start sm:px-3 pt-2 sm:pt-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs">
                <div className="font-bold text-ink-900">তাত্ক্ষণিক সক্রিয়করণ</div>
                <div className="text-ink-500">বিকাশ/নগদ পেমেন্টে একাউন্ট চালু</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start sm:px-3 pt-2 sm:pt-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Download size={18} />
              </div>
              <div className="text-xs">
                <div className="font-bold text-ink-900">সরাসরি ক্লাউড ডাউনলোড</div>
                <div className="text-ink-500">গুগল ড্রাইভ ও হাই-স্পিড লিঙ্ক</div>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center sm:justify-start sm:px-3 pt-2 sm:pt-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <RefreshCw size={18} />
              </div>
              <div className="text-xs">
                <div className="font-bold text-ink-900">নিয়মিত নতুন আপডেট</div>
                <div className="text-ink-500">নতুন রিলিজ ফ্রিতে সংযুক্ত হয়</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-ink-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-ink-500">
              কোন প্ল্যানটি আপনার জন্য সেরা তা বুঝতে চান?
            </span>
            <Link
              to="/membership"
              className="inline-flex items-center gap-1.5 font-bold text-brand-600 hover:text-brand-700 hover:underline"
            >
              সম্পূর্ণ ফিচার তুলনা ও FAQ পেজ দেখুন
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
