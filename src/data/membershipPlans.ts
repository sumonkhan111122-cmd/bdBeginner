export type MembershipPlanId = 'monthly' | 'yearly' | 'lifetime';

export interface MembershipPlan {
  id: MembershipPlanId;
  slug: string;
  productId: string;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn: string;
  price: number;
  originalPrice: number;
  durationLabel: string;
  durationLabelBn: string;
  durationDays: number | null; // null = lifetime
  popular?: boolean;
  badge?: string;
  badgeBn?: string;
  savings?: string;
  savingsBn?: string;
  features: { text: string; textBn: string; highlight?: boolean }[];
  ctaText: string;
  ctaTextBn: string;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'monthly',
    slug: 'membership-monthly-pass',
    productId: 'a0000001-0000-0000-0000-000000000001',
    name: 'Monthly Pass',
    nameBn: '১ মাস আনলিমিটেড পাস',
    tagline: 'Great for short-term projects & quick asset needs',
    taglineBn: 'শর্ট-টার্ম প্রজেক্ট ও জরুরি কাজের জন্য সেরা',
    price: 499,
    originalPrice: 999,
    durationLabel: '/ month',
    durationLabelBn: '/ ১ মাস',
    durationDays: 30,
    savings: 'Save 50%',
    savingsBn: '৫০% ডিসকাউন্ট',
    features: [
      { text: 'Full 1-Month (30 Days) All-Access', textBn: 'পুরো ১ মাস (৩০ দিন) আনলিমিটেড এক্সেস', highlight: true },
      { text: 'Download ANY product across website for FREE', textBn: 'ওয়েবসাইটের যেকোনো প্রোডাক্ট ফ্রিতে ডাউনলোড', highlight: true },
      { text: '3,000+ WordPress Themes, Plugins & Software', textBn: '৩,০০০+ ওয়ার্ডপ্রেস থিম, প্লাগইন ও সফটওয়্যার' },
      { text: 'Software, AI Tools & Digital Resources', textBn: 'সফটওয়্যার, এআই টুলস ও ডিজিটাল রিসোর্স' },
      { text: 'Direct High-Speed Cloud Downloads', textBn: 'ডিরেক্ট হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড ডাউনলোড' },
      { text: '100% Virus & Malware Free Verified Files', textBn: '১০০% ভাইরাস ও ম্যালওয়্যার মুক্ত ভেরিফায়েড ফাইল' },
      { text: 'Standard Customer Support', textBn: 'স্ট্যান্ডার্ড কাস্টমার সাপোর্ট' },
    ],
    ctaText: 'Get 1-Month Pass',
    ctaTextBn: '১ মাসের পাস নিন',
  },
  {
    id: 'yearly',
    slug: 'membership-yearly-pass',
    productId: 'a0000001-0000-0000-0000-000000000002',
    name: '1-Year VIP Pass',
    nameBn: '১ বছর ভিআইপি পাস',
    tagline: 'Best for web designers, developers & agencies',
    taglineBn: 'ওয়েব ডিজাইনার, ফ্রিল্যান্সার ও এজেন্সির জন্য পারফেক্ট',
    price: 799,
    originalPrice: 2499,
    durationLabel: '/ year',
    durationLabelBn: '/ ১ বছর',
    durationDays: 365,
    savings: 'Save 68%',
    savingsBn: '৬৮% সাশ্রয়ী',
    badge: 'Recommended',
    badgeBn: 'জনপ্রিয় চয়েস',
    features: [
      { text: 'Full 365 Days Unlimited Access', textBn: 'পুরো ৩৬৫ দিন আনলিমিটেড এক্সেস', highlight: true },
      { text: 'Download ALL current & upcoming products for FREE', textBn: 'সব বর্তমান ও নতুন প্রোডাক্ট সম্পূর্ণ ফ্রি ডাউনলোড', highlight: true },
      { text: 'All New Themes & Plugins Added Throughout Year', textBn: 'সারা বছর নতুন যুক্ত হওয়া সব প্রোডাক্ট ফ্রিতে পাবেন' },
      { text: 'Unlimited Daily Download Limit', textBn: 'কোনো দৈনিক ডাউনলোড লিমিট নেই' },
      { text: 'Direct High-Speed Cloud Downloads', textBn: 'ডিরেক্ট হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড ডাউনলোড' },
      { text: 'Priority Email & WhatsApp Support', textBn: 'প্রায়োরিটি ইমেইল ও হোয়াটসঅ্যাপ সাপোর্ট', highlight: true },
      { text: 'Latest Version Updates for 1 Year', textBn: '১ বছর নিয়মিত লেটেস্ট ভার্সন আপডেট' },
    ],
    ctaText: 'Get 1-Year Pass',
    ctaTextBn: '১ বছরের পাস নিন',
  },
  {
    id: 'lifetime',
    slug: 'membership-lifetime-pass',
    productId: 'a0000001-0000-0000-0000-000000000003',
    name: 'Lifetime VIP All-Access',
    nameBn: 'লাইফটাইম ভিআইপি পাস',
    tagline: 'One-time payment, unlimited downloads forever!',
    taglineBn: 'এককালীন পেমেন্ট, আজীবন সম্পূর্ণ ফ্রি ডাউনলোড!',
    price: 999,
    originalPrice: 4999,
    durationLabel: '/ one-time',
    durationLabelBn: '/ এককালীন (আজীবন)',
    durationDays: null,
    popular: true,
    badge: 'BEST VALUE • আজীবন এক্সেস',
    badgeBn: 'সবচেয়ে সেরা ডিল • আজীবন এক্সেস',
    savings: 'Save 80% • এককালীন পেমেন্ট',
    savingsBn: '৮০% ছাড় • নো রিনিউয়াল ফি',
    features: [
      { text: 'LIFETIME Unlimited Free Downloads Forever', textBn: 'আজীবন আনলিমিটেড সব প্রোডাক্ট ফ্রি ডাউনলোড', highlight: true },
      { text: 'ALL Future Products & Updates Included Forever', textBn: 'ভবিষ্যতের সব নতুন প্রোডাক্ট আজীবন সম্পূর্ণ ফ্রি', highlight: true },
      { text: 'NO Renewal Fees Ever (Pay Once, Enjoy Lifetime)', textBn: 'কোনো রিনিউয়াল বা মাসিক ফি নেই (এককালীন পেমেন্ট)', highlight: true },
      { text: 'Full Catalog of 3,000+ Themes, Plugins, Scripts & Software', textBn: '৩,০০০+ থিম, প্লাগইন, পিএইচপি স্ক্রিপ্ট ও সফটওয়্যার' },
      { text: 'Super Fast Direct Google Drive / Cloud Links', textBn: 'সুপার ফাস্ট গুগল ড্রাইভ ও ক্লাউড ডিরেক্ট লিঙ্ক' },
      { text: 'VIP Private WhatsApp Group & Dedicated Support', textBn: 'ভিআইপি প্রাইভেট সাপোর্ট ও হোয়াটসঅ্যাপ হেল্পডেস্ক', highlight: true },
      { text: '100% Clean, GPL Licensed & Tested Files', textBn: '১০০% ক্লিন ও অরিজিনাল টেস্টেড ফাইল' },
    ],
    ctaText: 'Get Lifetime VIP Pass',
    ctaTextBn: 'লাইফটাইম ভিআইপি পাস নিন',
  },
];

export const MEMBERSHIP_PERKS = [
  {
    title: '৩,০০০+ প্রিমিয়াম ডিজিটাল এসেট',
    titleEn: '3,000+ Premium Digital Assets',
    desc: 'ওয়ার্ডপ্রেস থিম, প্লাগইন, পিএইচপি স্ক্রিপ্ট, মোবাইল অ্যাপ সোর্স কোড ও ডিজিটাল কোর্স।',
    icon: 'Package',
  },
  {
    title: 'সুপার ফাস্ট ডিরেক্ট ডাউনলোড',
    titleEn: 'Super-Fast Direct Download',
    desc: 'কোনো অতিরিক্ত অ্যাড বা রিডাইরেক্ট নেই—সরাসরি হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড লিঙ্ক।',
    icon: 'Zap',
  },
  {
    title: '১০০% ক্লিন ও ভাইরাস-মুক্ত',
    titleEn: '100% Clean & Virus-Free',
    desc: 'প্রতিটি ফাইল VirusTotal এবং সিকিউরিটি স্ক্যানার দ্বারা পুঙ্খানুপুঙ্খভাবে পরীক্ষিত।',
    icon: 'ShieldCheck',
  },
  {
    title: 'নিয়মিত আপডেট ও নতুন রিলিজ',
    titleEn: 'Regular Updates & New Releases',
    desc: 'প্রতি সপ্তাহে নতুন নতুন ডিজিটাল প্রোডাক্ট ও লেটেস্ট ভার্সন আপডেট যুক্ত করা হয়।',
    icon: 'RefreshCw',
  },
  {
    title: 'সহজ ও ইনস্ট্যান্ট এক্টিভেশন',
    titleEn: 'Instant Account Activation',
    desc: 'bKash, Nagad বা Rocket-এ পেমেন্ট সম্পন্ন হলেই স্বয়ংক্রিয়ভাবে আপনার একাউন্ট সক্রিয় হবে।',
    icon: 'CheckCircle2',
  },
  {
    title: 'ডেডিকেটেড হোয়াটসঅ্যাপ সাপোর্ট',
    titleEn: 'Dedicated WhatsApp Support',
    desc: 'ডাউনলোড বা ফাইল ইনস্টলেশনে যেকোনো সমস্যায় তাৎক্ষণিক সহায়তা পেতে আমাদের সাপোর্ট টিম প্রস্তুত।',
    icon: 'Headphones',
  },
];
