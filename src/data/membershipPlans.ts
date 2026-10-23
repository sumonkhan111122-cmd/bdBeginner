import type { Product } from '@/types';

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
  dailyDownloadLimit: number | null; // 10, 20, null = unlimited
  popular?: boolean;
  badge?: string;
  badgeBn?: string;
  savings?: string;
  savingsBn?: string;
  decoyNoteBn?: string;
  features: { text: string; textBn: string; highlight?: boolean; unavailable?: boolean }[];
  ctaText: string;
  ctaTextBn: string;
}

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'monthly',
    slug: 'membership-monthly-pass',
    productId: 'a0000001-0000-4000-8000-000000000001',
    name: '10-Day Paid All-Access Pass',
    nameBn: '১০ দিন পেইড পাস',
    tagline: '10 days download access to all paid products (Courses, Software, Tools)',
    taglineBn: '১০ দিনের জন্য সাইটের সমস্ত পেইড প্রোডাক্ট (কোর্স, সফটওয়্যার, এআই টুলস) ডাউনলোড এক্সেস',
    price: 499,
    originalPrice: 999,
    durationLabel: '/ 10 days',
    durationLabelBn: '/ ১০ দিন',
    durationDays: 10,
    dailyDownloadLimit: 10,
    savings: 'Save 50%',
    savingsBn: '৫০% ডিসকাউন্ট • ১০ দিন মেয়াদ',
    features: [
      { text: 'All Paid Products (Courses, Software, AI Tools & Assets)', textBn: 'সাইটের সমস্ত পেইড প্রোডাক্ট (কোর্স, সফটওয়্যার ও এআই টুলস)', highlight: true },
      { text: 'Themes, Plugins & Scripts are 100% FREE for Everyone', textBn: 'ওয়ার্ডপ্রেস থিম, প্লাগইন ও স্ক্রিপ্ট সবার জন্য সম্পূর্ণ ফ্রি', highlight: true },
      { text: 'Daily Limit: Maximum 10 files per day', textBn: 'দৈনিক ডাউনলোড লিমিট: সর্বোচ্চ ১০টি ফাইল', highlight: true },
      { text: 'Full 10 Days Download Access', textBn: 'পুরো ১০ দিন পেইড এক্সেস মেয়াদ' },
      { text: 'Direct High-Speed Cloud Downloads', textBn: 'ডিরেক্ট হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড ডাউনলোড' },
      { text: '100% Virus & Malware Free Verified Files', textBn: '১০০% ভাইরাস ও ম্যালওয়্যার মুক্ত ভেরিফায়েড ফাইল' },
      { text: 'Standard Customer Support', textBn: 'স্ট্যান্ডার্ড কাস্টমার সাপোর্ট' },
      { text: 'Access expires strictly after 10 days', textBn: '১০ দিন পর ডাউনলোড এক্সেস বন্ধ হয়ে যাবে', unavailable: true },
    ],
    ctaText: 'Get 10-Day Pass (৳499)',
    ctaTextBn: '১০ দিন পেইড পাস নিন (৳৪৯৯)',
  },
  {
    id: 'lifetime',
    slug: 'membership-lifetime-pass',
    productId: 'a0000001-0000-4000-8000-000000000003',
    name: 'Lifetime VIP All-Access Pass',
    nameBn: 'আজীবন ভিআইপি পাস',
    tagline: 'One-time payment, unlimited downloads forever to everything!',
    taglineBn: 'এককালীন পেমেন্ট — সারাজীবন সাইটের সমস্ত বর্তমান ও নতুন প্রোডাক্ট ফ্রি!',
    price: 1199,
    originalPrice: 7999,
    durationLabel: '/ one-time',
    durationLabelBn: '/ এককালীন (আজীবন)',
    durationDays: null,
    dailyDownloadLimit: null,
    popular: true,
    badge: 'BEST VALUE • MOST POPULAR',
    badgeBn: 'সবচেয়ে সেরা ভ্যালু • সর্বাধিক জনপ্রিয়',
    savings: 'Save 85% • Lifetime Deal',
    savingsBn: '৮৫% ছাড় • নো রিনিউয়াল ফি',
    decoyNoteBn: '১ মাস অল-এক্সেস ৮৯৯ টাকা — আর মাত্র ৩০০ টাকা বেশিতেই আজীবন আনলিমিটেড!',
    features: [
      { text: 'LIFETIME Unlimited Free Downloads Forever', textBn: 'আজীবন আনলিমিটেড সকল প্রোডাক্ট ফ্রি ডাউনলোড', highlight: true },
      { text: 'No Daily Limits: Unlimited downloads every day', textBn: 'কোনো দৈনিক লিমিট নেই — আনলিমিটেড ডাউনলোড', highlight: true },
      { text: 'ALL 3,000+ Themes, Plugins, Scripts, Courses & Software', textBn: 'সব ৩,০০০+ থিম, প্লাগইন, কোর্স, সফটওয়্যার ও এআই টুলস', highlight: true },
      { text: 'ALL Future New Products Included Forever', textBn: 'ভবিষ্যতের সব নতুন প্রোডাক্ট আজীবন সম্পূর্ণ ফ্রি', highlight: true },
      { text: 'Lifetime Regular Latest Version Updates', textBn: 'সকল প্রোডাক্টের আজীবন নিয়মিত লেটেস্ট আপডেট', highlight: true },
      { text: 'NO Renewal Fees Ever (Pay Once, Enjoy Lifetime)', textBn: 'কোনো মাসিক বা বার্ষিক রিনিউয়াল ফি নেই', highlight: true },
      { text: 'VIP Private WhatsApp Support & On-Demand Requests', textBn: 'ভিআইপি প্রাইভেট সাপোর্ট ও অন-ডিমান্ড ফাইল রিকোয়েস্ট', highlight: true },
      { text: 'Super Fast Direct Google Drive / Cloud Links', textBn: 'সুপার ফাস্ট গুগল ড্রাইভ ও ক্লাউড লিঙ্ক' },
      { text: '100% Clean, GPL Licensed & Tested Files', textBn: '১০০% ক্লিন ও অরিজিনাল টেস্টেড ফাইল' },
    ],
    ctaText: 'Claim Lifetime VIP (৳1,199)',
    ctaTextBn: 'আজীবন ভিআইপি পাস নিন (৳১,১৯৯)',
  },
  {
    id: 'yearly',
    slug: 'membership-yearly-pass',
    productId: 'a0000001-0000-4000-8000-000000000002',
    name: 'All-Access 1-Month Pass',
    nameBn: '১ মাস অল-এক্সেস পাস',
    tagline: '30 days full access to all products across the website',
    taglineBn: '১ মাসের জন্য সাইটের সমস্ত প্রোডাক্ট (থিম, প্লাগইন, কোর্স, সফটওয়্যার)',
    price: 899,
    originalPrice: 1999,
    durationLabel: '/ 30 days',
    durationLabelBn: '/ ১ মাস (৩০ দিন)',
    durationDays: 30,
    dailyDownloadLimit: 20,
    savings: 'Save 55%',
    savingsBn: '৫৫% সাশ্রয়ী • অল-এক্সেস',
    features: [
      { text: 'All 3,000+ Products across Website', textBn: 'সাইটের সমস্ত প্রোডাক্ট (থিম, প্লাগইন, কোর্স, সফটওয়্যার)', highlight: true },
      { text: 'Daily Limit: Maximum 20 files per day', textBn: 'দৈনিক ডাউনলোড লিমিট: সর্বোচ্চ ২০টি ফাইল', highlight: true },
      { text: 'Full 30 Days Download Access', textBn: '৩০ দিন এক্সেস মেয়াদ' },
      { text: 'PHP Scripts, AI Tools & Video Courses', textBn: 'পিএইচপি স্ক্রিপ্ট, এআই টুলস ও ডিজিটাল কোর্স' },
      { text: 'Direct High-Speed Cloud Downloads', textBn: 'ডিরেক্ট হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড ডাউনলোড' },
      { text: 'Priority Customer Support', textBn: 'প্রায়োরিটি কাস্টমার সাপোর্ট' },
      { text: 'Access expires strictly after 30 days (Renewal ৳899/mo)', textBn: 'মেয়াদ মাত্র ৩০ দিন (পরের মাসে রিনিউয়াল ৳৮৯৯)', unavailable: true },
      { text: 'No lifetime updates after 30 days', textBn: 'মেয়াদ শেষে আর কোনো ফ্রি ডাউনলোড বা আপডেট নেই', unavailable: true },
    ],
    ctaText: 'Get 1-Month All-Access (৳899)',
    ctaTextBn: '১ মাস অল-এক্সেস নিন (৳৮৯৯)',
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

export function planToProduct(plan: MembershipPlan): Product {
  return {
    id: plan.productId,
    name: plan.nameBn ? `${plan.name} (${plan.nameBn})` : plan.name,
    slug: plan.slug,
    shortDescription: plan.taglineBn || plan.tagline,
    description: `${plan.name} - ${plan.taglineBn || plan.tagline}. Full VIP unlimited access to 3,000+ digital products on bdBeginner.`,
    category: 'membership',
    price: plan.price,
    compareAtPrice: plan.originalPrice,
    featured: true,
    newProduct: false,
    images: [],
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    deliveryType: 'subscription',
    productType: 'subscription',
    deliveryDescription: 'Instant VIP membership activation upon payment verification',
    features: plan.features.map((f) => f.textBn || f.text),
    whatsIncluded:
      plan.id === 'monthly'
        ? [
            '১০ দিনের জন্য সাইটের সমস্ত পেইড প্রোডাক্ট ফ্রি ডাউনলোড',
            'ওয়ার্ডপ্রেস থিম, প্লাগইন ও স্ক্রিপ্ট সবার জন্য চিরতরে সম্পূর্ণ ফ্রি',
            'ডিরেক্ট হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড লিঙ্ক',
            'দৈনিক সর্বোচ্চ ১০টি পেইড ফাইল ডাউনলোড এক্সেস',
          ]
        : [
            'ওয়েবসাইটের ৩,০০০+ সব প্রোডাক্ট ফ্রি ডাউনলোড',
            'ডিরেক্ট হাই-স্পিড গুগল ড্রাইভ ও ক্লাউড লিঙ্ক',
            'নিয়মিত নতুন রিলিজ ও আপডেট',
            'প্রায়োরিটি ভিআইপি সাপোর্ট',
          ],
    faq: [],
    icon: 'Crown',
    accent: plan.id === 'lifetime' ? 'amber' : 'brand',
    descriptor: plan.durationLabelBn || plan.durationLabel,
  };
}
