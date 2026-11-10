/**
 * Seed 50 Premium Bangladeshi Trending Courses & Digital Products
 * 
 * Niches:
 * - AI Video & Motion Graphics
 * - YouTube Automation & Content Creation
 * - Video Editing & Color Grading (Premiere Pro, CapCut, After Effects)
 * - Facebook Marketing, Ads & Local E-Commerce
 * - WordPress, Elementor & Web Development
 * - Shopify & Dropshipping Masterclass
 * - Graphic Design, Canva Pro & UI/UX (Figma)
 * - Freelancing, Upwork, Fiverr & Client Hunting
 * - Spoken English for Freelancers & Career
 * - Mega Asset Bundles (LUTs, Templates, Stock Footage, Prompts)
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const parseEnv = (content) => content.split('\n').reduce((acc, line) => {
  const [key, ...val] = line.split('=');
  if (key && val.length) acc[key.trim()] = val.join('=').trim();
  return acc;
}, {});

let envLocal = {};
try { envLocal = parseEnv(fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8')); } catch(e) {}
let env = {};
try { env = parseEnv(fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8')); } catch(e) {}

const mergedEnv = { ...env, ...envLocal };
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || mergedEnv.VITE_SUPABASE_URL || 'https://ldmpxupslnfgzmmtpyat.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || mergedEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('Error: Missing SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const CATEGORIES = {
  COURSES: '9658a4a6-c141-433a-8e0a-964a081b3455',
  DIGITAL_RESOURCES: 'd7ac2ba6-4368-4adf-b314-d7e6b4c14956',
  AI_TOOLS: '46e77cdb-bc84-4658-b6f1-3af0b9833a6d',
  SOFTWARE: '4c9fd83b-2ead-488b-8652-4eff6b87c212'
};

const PRODUCTS = [
  // 1. AI Video Making
  {
    name: 'এআই ভিডিও ক্রিয়েশন ও রিলস মেকিং মাস্টারক্লাস (ChatGPT + Midjourney + ElevenLabs + HeyGen)',
    slug: 'ai-video-creation-reels-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    short_description: 'নিজের চেহারা বা কণ্ঠ না দেখিয়ে এআই দিয়ে প্রফেশনাল ভাইরাল শর্টস, রিলস ও ইউটিউব ভিডিও তৈরি করে ফেসবুক ও ইউটিউব থেকে প্রতি মাসে সম্মানজনক আয়ের কমপ্লিট সিক্রেট ব্লুপ্রিন্ট।',
    description: `<p>আপনি কি কোনো ক্যামেরার সামনে না দাঁড়িয়ে অথবা নিজের ভয়েস না দিয়ে প্রফেশনাল ভাইরাল ভিডিও তৈরি করতে চান? এই প্রিমিয়াম মাস্টারক্লাসে শেখানো হয়েছে কীভাবে ChatGPT দিয়ে স্ক্রিপ্ট তৈরি, Midjourney দিয়ে আল্ট্রা-রিয়েলিস্টিক ছবি, ElevenLabs দিয়ে জীবন্ত বাংলা ও ইংরেজি ভয়েস এবং HeyGen/Runway দিয়ে সিনেমাটিক ভিডিও বানিয়ে ফেসবুক ও ইউটিউব শর্টস ভাইরাল করা যায়।</p>
    <h4>কোর্সে যা যা শিখবেন:</h4>
    <ul>
      <li>ফেসলেস এআই শর্টস ও রিলস মেকিং স্ট্র্যাটেজি</li>
      <li>Midjourney ও Leonardo AI দিয়ে হাই-রেজ্যুলুশন আর্ট ও ক্যারেক্টার জেনারেশন</li>
      <li>ElevenLabs ও CapCut দিয়ে স্টুডিও কোয়ালিটি ভয়েসওভার ও অটো-ক্যাপশন তৈরি</li>
      <li>ফেসবুক মনিটাইজেশন পলিসি ও কপিরাইট-ফ্রি মেথডলজি</li>
      <li>মাসে ৩০টি ভাইরাল ভিডিও অটোমেশন করার প্র্যাক্টিক্যাল ফর্মুলা</li>
    </ul>`,
    features: [
      'সম্পূর্ণ বাংলা ভাষায় প্র্যাক্টিক্যাল স্টেপ-বাই-স্টেপ ভিডিও টিউটোরিয়াল',
      'প্রিমিয়াম প্রম্পট লাইব্রেরি ও রেডিমেড টেমপ্লেট ফ্রি',
      'মোবাইল এবং কম্পিউটার উভয় ডিভাইসেই শেখার উপযোগী',
      'লাইফটাইম এক্সেস ও ফিউচার আপডেট অন্তর্ভুক্ত',
      '২৪/৭ কমিউনিটি ও স্টুডেন্ট সাপোর্ট'
    ]
  },
  // 2. YouTube Automation & Cash Cow
  {
    name: 'ইউটিউব অটোমেশন ও ক্যাশ কাউ চ্যানেল মাস্টারকোর্স - ফেসলেস চ্যানেল থেকে প্যাসিভ ইনকাম',
    slug: 'youtube-automation-cash-cow-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    short_description: 'ইউটিউবে নিজের ফেস না দেখিয়ে ক্যাশ কাউ চ্যানেল বানিয়ে আমেরিকান ও ইউরোপীয়ান ট্রাফিকের মাধ্যমে প্রতি মাসে হাজার ডলার আয়ের বিশ্বমানের ফ্রেমওয়ার্ক।',
    description: `<p>ইউটিউব অটোমেশন বা ক্যাশ কাউ চ্যানেল হলো বর্তমান বিশ্বের অন্যতম সেরা ডিজিটাল বিজনেস মডেল। এই কোর্সে শেখানো হয়েছে হাই-সিপিএম (High-CPM) নিশ নির্বাচন, টিম ম্যানেজমেন্ট, প্রফেশনাল স্ক্রিপ্ট রাইটিং, ভয়েসওভার এবং অ্যালগরিদম হ্যাক করার পরীক্ষিত ফর্মুলা।</p>
    <h4>কোর্সের মূল বিষয়বস্তু:</h4>
    <ul>
      <li>টপ প্রফিটেবল নিশ সিলেকশন (ফিন্যান্স, লাক্সারি, টেক, ফ্যাক্টস)</li>
      <li>ভাইরাল টাইটেল ও হাই-ক্লিক থ্রু রেট (CTR) থাম্বনেইল ডিজাইন সিক্রেট</li>
      <li>ইউটিউব এসইও ও অ্যালগরিদম রেকমেন্ডেশন অপটিমাইজেশন</li>
      <li>মনিটাইজেশন ছাড়াও স্পনসরশিপ ও এফিলিয়েট মার্কেটিং থেকে মাল্টিপল ইনকাম স্ট্রিম</li>
    </ul>`,
    features: [
      '৪০+ ঘণ্টার সম্পূর্ণ ফুল এইচডি রেকর্ডেড ক্লাস',
      'টপ ১০ হাই-সিপিএম নিশ রিসার্চ শিট অন্তর্ভুক্ত',
      'কপিরাইট স্ট্রাইক মুক্ত কনটেন্ট তৈরির লাইভ ডেমো',
      'লাইফটাইম ক্লাউড স্টোরেজ এক্সেস'
    ]
  },
  // 3. Premiere Pro & After Effects
  {
    name: 'সিনেমাটিক ভিডিও এডিটিং মাস্টারক্লাস - প্রিমিয়ার প্রো ও আফটার ইফেক্টস (বেসিক টু অ্যাডভান্সড)',
    slug: 'cinematic-video-editing-premiere-after-effects',
    category_id: CATEGORIES.COURSES,
    price: 299,
    compare_at_price: 3999,
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    short_description: 'আন্তর্জাতিক মানের ভিডিও এডিটর হয়ে লোকাল এজেন্সি এবং ফাইভার-আপওয়ার্কে প্রতি প্রোজেক্টে ১০০-৫০০ ডলার আয়ের কমপ্লিট সিনেমাটিক এডিটিং গাইড।',
    description: `<p>ভিডিও এডিটিং বর্তমান অনলাইন মার্কেটের সবচেয়ে চাহিদাসম্পন্ন স্কিলগুলোর একটি। প্রিমিয়ার প্রো দিয়ে সিনেমাটিক কাট, সাউন্ড ডিজাইন, কালার গ্রেডিং এবং আফটার ইফেক্টস দিয়ে মোশন ট্র্যাকিং ও চোখ ধাঁধানো ভিজ্যুয়াল ইফেক্টস তৈরির এ টু জেড শিখুন।</p>`,
    features: [
      '৫০+ রিয়েল-লাইফ প্রজেক্ট ভিত্তিক ক্লাস',
      '১৫ জিবি প্রিমিয়াম সাউন্ড এফেক্টস ও ট্রানজিশন প্যাক ফ্রি',
      'প্রফেশনাল কালার গ্রেডিং ও সিনেমাটিক LUTs বান্ডেল',
      'আন্তর্জাতিক ক্লায়েন্ট পাওয়ার স্পেশাল পোর্টফোলিও গাইডলাইন'
    ]
  },
  // 4. CapCut Mobile & PC
  {
    name: 'ক্যাপকাট ভাইরাল ভিডিও এডিটিং কোর্স (স্মার্টফোন ও পিসি - হরমুজি স্টাইল এডিটিং)',
    slug: 'capcut-viral-video-editing-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
    short_description: 'শুধুমাত্র একটি মোবাইল দিয়ে ক্যাপকাটের মাধ্যমে অ্যালেক্স হরমুজি ও আলী আবদাল স্টাইলে ভাইরাল শর্টস ও রিলস এডিটিং শেখার সেরা প্র্যাক্টিক্যাল কোর্স।',
    description: `<p>আজকাল টিকটক, ফেসবুক রিলস এবং ইনস্টাগ্রামে ভাইরাল হওয়ার মূল চাবিকাঠি হলো দৃষ্টিনন্দন শর্ট-ফর্ম কন্টেন্ট এডিটিং। গতিশীল টেক্সট অ্যানিমেশন, সাউন্ড পপিং, ব্যাকগ্রাউন্ড রিমুভাল ও ভাইরাল বি-রোল ইফেক্টস শিখুন সহজে।</p>`,
    features: [
      'মোবাইল ও ল্যাপটপ উভয়েই ব্যবহার উপযোগী',
      'অ্যালেক্স হরমুজি স্টাইল অটো-ক্যাপশন ও টেক্সট ট্রিকস',
      'সাউন্ড ইফেক্টস ও ভাইরাল সাউন্ডট্র্যাক লাইব্রেরি',
      'শর্টস ও রিলস ভাইরাল করার অ্যালগরিদম গাইড'
    ]
  },
  // 5. Facebook Ads & Local E-Commerce
  {
    name: 'লোকাল ই-কমার্স ও ফেসবুক পেইড অ্যাডস মেগা কোর্স (বাজেট ৩x রিটার্ন স্ট্র্যাটেজি)',
    slug: 'local-ecommerce-facebook-paid-ads-blueprint',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    short_description: 'বাংলাদেশে ফেসবুক বুস্টিং করে প্রডাক্ট বিক্রি, উইনিং প্রডাক্ট সোর্সিং, কুরিয়ার রিটার্ন কমানো ও কোটি টাকার লোকাল ই-কমার্স বিজনেস দাঁড় করানোর মাস্টারপ্ল্যান।',
    description: `<p>ফেসবুক পেজ খুলে বিক্রি না হওয়ার দিন শেষ! শিখুন কীভাবে উইনিং প্রডাক্ট রিসার্চ করতে হয়, চকবাজার বা চায়না থেকে সোর্সিং, সিবিও (CBO) অ্যাডস ক্যাম্পেইন, রিটার্ন রেশিও ১০% এর নিচে নামিয়ে আনা এবং কাস্টমার হ্যান্ডলিংয়ের সিক্রেট টেকনিক।</p>`,
    features: [
      'উইনিং প্রোডাক্ট রিসার্চের ১০টি সিক্রেট মেথড',
      'ফেসবুক পিক্সেল ও কনভার্সন এপিআই ফুল সেটআপ',
      'ডেলিভারি রিটার্ন কমানোর প্রমাণিত চেকআউট স্ক্রিপ্ট',
      'সরাসরি প্র্যাক্টিক্যাল লাইভ ক্যাম্পেইন কেস স্টাডি'
    ]
  },
  // 6. Shopify Dropshipping
  {
    name: 'শপিফাই গ্লোবাল ড্রপশিপিং মাস্টারক্লাস - বাংলাদেশ থেকে সারা বিশ্বে পণ্য বিক্রির গাইড',
    slug: 'shopify-global-dropshipping-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 299,
    compare_at_price: 4499,
    thumbnail_url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    short_description: 'কোনো ইনভেন্টরি ছাড়া বাংলাদেশ থেকেই ইউএসএ ও ইউরোপের মার্কেটে শপিফাই স্টোর বানিয়ে ডলার উপার্জনের সম্পূর্ণ প্রফেশনাল ড্রপশিপিং গাইড।',
    description: `<p>স্টোর ক্রিয়েশন, আলিবাবা/সিজে ড্রপশিপিং ইন্টিগ্রেশন, স্ট্রাইপ/পেপাল সেটআপ ট্রিকস, টিকটক অ্যাডস ও ফেসবুক অ্যাডস দিয়ে স্কেলিং শেখার কমপ্লিট আন্তর্জাতিক ড্রপশিপিং কোর্স।</p>`,
    features: [
      'হাই কনভার্টিং শপিফাই প্রিমিয়াম থিম সেটআপ',
      'সাপ্লায়ার নেগোশিয়েশন ও ফাস্ট শিপিং মেথড',
      'আন্তর্জাতিক পেমেন্ট গেটওয়ে সল্যুশন গাইডলাইন',
      'রিয়েল স্টোর প্রফিট কেস স্টাডি'
    ]
  },
  // 7. WordPress & Elementor Freelancing
  {
    name: 'ফুল-স্ট্যাক ওয়ার্ডপ্রেস ও এলিমেন্টর ফ্রিল্যান্সিং ক্যারিয়ার ব্লুপ্রিন্ট',
    slug: 'full-stack-wordpress-elementor-freelancing',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    short_description: 'কোনো কোডিং ছাড়া যেকোনো ক্লায়েন্টের জন্য আকর্ষণীয় ওয়েবসাইট, ল্যান্ডিং পেজ ও ই-কমার্স সাইট তৈরি করে আপওয়ার্ক ও ফাইভার থেকে আয়ের কমপ্লিট কোর্স।',
    description: `<p>বিশ্বের ৪৩% ওয়েবসাইট তৈরি হয় ওয়ার্ডপ্রেস দিয়ে। এলিমেন্টর প্রো, কাস্টম সিএসএস, স্পিড অপটিমাইজেশন, ক্লাউডফ্লেয়ার ও সিকিউরিটি সেটআপ শিখে যেকোনো ক্লায়েন্টের মন জয় করুন।</p>`,
    features: [
      '১০টি লাইভ ক্লায়েন্ট প্রজেক্ট রেডি ডিজাইন',
      'ই-কমার্স, রিয়েল এস্টেট ও এজেন্সি পোর্টফোলিও সেটআপ',
      'স্পিড অপটিমাইজেশন ও ৯৫+ গুগল পেজস্পিড গাইড',
      'মার্কেটপ্লেস ও ডিরেক্ট ক্লায়েন্ট হান্টিং মেথড'
    ]
  },
  // 8. Canva Pro & Graphic Design
  {
    name: 'ক্যানভা প্রো কমপ্লিট গ্রাফিক্স ডিজাইন ও ফ্রিল্যান্সিং ইনকাম কোর্স',
    slug: 'canva-pro-graphic-design-freelancing',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
    short_description: 'ভারী সফটওয়্যার ছাড়াই ক্যানভা দিয়ে ফেসবুক পোস্ট, ইউটিউব থাম্বনেইল, ব্যানার, রিলস ও লোগো ডিজাইন করে ঘরে বসে আয়ের সহজ উপায়।',
    description: `<p>ফটোশপ কঠিন লাগলে ক্যানভাই আপনার সেরা অস্ত্র! মোবাইল অথবা পিসি দিয়ে মুহূর্তের মধ্যে হাই-কনভার্টিং সোশ্যাল মিডিয়া গ্রাফিক্স, প্রেজেন্টেশন ও মার্কেটিং ব্যানার তৈরি শিখুন।</p>`,
    features: [
      'মোবাইল দিয়ে প্রফেশনাল গ্রাফিক্স ডিজাইনিং',
      'ক্যানভা এআই টুলস ও ম্যাজিক স্টুডিও ফুল গাইড',
      'সোশ্যাল মিডিয়া পোস্ট ও থাম্বনেইল মাস্টারি',
      'লোকাল ক্লায়েন্ট হ্যান্ডলিং ও ফ্রিল্যান্সিং গাইড'
    ]
  },
  // 9. UI/UX Design with Figma
  {
    name: 'ইউআই/ইউএক্স (UI/UX) ডিজাইন মাস্টারক্লাস - ওয়েবসাইট ও অ্যাপ ডিজাইন উইথ ফিগমা (Figma)',
    slug: 'ui-ux-design-figma-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80',
    short_description: 'বিশ্বমানের প্রডাক্ট ডিজাইনার হয়ে রিমোট জব ও হাই-টিকিট ফ্রিল্যান্সিংয়ের জন্য ফিগমা, অটো লেআউট ও ইউজার রিসার্চের পূর্ণাঙ্গ কোর্স।',
    description: `<p>আন্তর্জাতিক টেক কোম্পানিতে ইউআই/ইউএক্স ডিজাইনারদের বেতন সবচেয়ে বেশি। ফিগমা অটো লেআউট, কম্পোনেন্টস, ডিজাইন সিস্টেম ও প্রোটোটাইপিং শিখুন লাইভ প্রজেক্টে।</p>`,
    features: [
      'কমপ্লিট মোবাইল অ্যাপ ও ওয়েব ড্যাশবোর্ড ডিজাইন প্রজেক্ট',
      'ফিগমা অটো-লেআউট ও ভ্যারিয়েন্ট মাস্টারি',
      'ডিজাইন সিস্টেম তৈরি ও ডেভেলপার হ্যান্ডঅফ',
      'বিহ্যান্স ও ড্রিবল পোর্টফোলিও বিল্ডিং গাইডলাইন'
    ]
  },
  // 10. Spoken English for Freelancers
  {
    name: 'স্পোকেন ইংলিশ ও ইন্টারন্যাশনাল ক্লায়েন্ট কমিউনিকেশন মাস্টারি (ফর ফ্রিল্যান্সারস)',
    slug: 'spoken-english-client-communication-mastery',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 1999,
    thumbnail_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    short_description: 'আন্তর্জাতিক ক্লায়েন্টের সাথে জুম বা গুগল মিটে সাবলীলভাবে ইংরেজিতে কথা বলা, প্রজেক্ট ক্লোজিং ও নেগোশিয়েশন করার ১০০% প্র্যাক্টিক্যাল কোর্স।',
    description: `<p>ভালো স্কিল থাকা সত্ত্বেও কেবল ইংরেজি ভীতি ও দুর্বল কমিউনিকেশনের কারণে কাজ হারাচ্ছেন? এই কোর্সে শেখানো হয়েছে কীভাবে কনফিডেন্টলি ক্লায়েন্ট ইন্টারভিউ ফেস করতে হয়।</p>`,
    features: [
      'রিয়েল ক্লায়েন্ট ইন্টারভিউ কল রেকর্ডিং ও এনালাইসিস',
      'প্রস্তাবনা (Proposal) লেখার ১০০+ উইনিং টেমপ্লেট',
      'ডেইলি স্পোকেন প্র্যাকটিস ও সঠিক উচ্চারণ গাইড',
      'কাজের রেট বাড়ানো ও টিপস নেওয়ার নেগোশিয়েশন ট্রিকস'
    ]
  },
  // 11. Upwork & Fiverr Mastery
  {
    name: 'আপওয়ার্ক ও ফাইভার টপ-রেটেড ফ্রিল্যান্সিং ব্লুপ্রিন্ট - ক্লায়েন্ট হান্টিং ফ্রেমওয়ার্ক',
    slug: 'upwork-fiverr-top-rated-freelancing-blueprint',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80',
    short_description: 'ফাইভার গিগ প্রথম পেজে র‍্যাংক করানো এবং আপওয়ার্কে প্রথম বিডেই কাজ পাওয়ার প্রফেশনাল সিক্রেট ফ্রেমওয়ার্ক।',
    description: `<p>গিগ খুলে বসে থাকার দিন শেষ! অ্যালগরিদম অনুযায়ী কিওয়ার্ড রিসার্চ, প্রপোজাল লেখার সাইকোলজি, এবং আউট অফ মার্কেটপ্লেস লিঙ্কডইন ও কোল্ড ইমেইলিং মেথড শিখুন।</p>`,
    features: [
      'ফাইভার গিগ এসইও ও প্রথম অর্ডারের গোপন কৌশল',
      'আপওয়ার্ক কানেক্টস সেভ করে হাই-কনভার্টিং কভার লেটার তৈরি',
      'লিঙ্কডইন থেকে ডিরেক্ট ক্লায়েন্ট পাওয়ার কোল্ড আউটরিচ ফর্মুলা',
      'পেমেন্ট সুরক্ষিত রাখার এসক্রো ও কন্ট্রাক্ট সিকিউরিটি'
    ]
  },
  // 12. Python Programming & Automation
  {
    name: 'পাইথন প্রোগ্রামিং ও অটোমেশন ফর বিগিনার্স টু অ্যাডভান্সড',
    slug: 'python-programming-automation-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    short_description: 'জিরো থেকে পাইথন কোডিং শিখে ওয়েব স্ক্র্যাপিং, টাস্ক অটোমেশন ও বট তৈরির মাধ্যমে আধুনিক প্রোগ্রামার হওয়ার সম্পূর্ণ কোর্স।',
    description: `<p>প্রোগ্রামিংয়ের জাদুকরী ভাষা পাইথন শিখুন সহজ বাংলায়। ডেটা স্ক্র্যাপিং, অটো-মেইলিং, এক্সেল অটোমেশন ও বেসিক এআই প্রোজেক্ট তৈরির বাস্তব অভিজ্ঞতা অর্জন করুন।</p>`,
    features: [
      'জিরো নলেজ থেকে শুরু করার পূর্ণাঙ্গ কারিকুলাম',
      'Selenium ও BeautifulSoup দিয়ে ওয়েব স্ক্র্যাপিং',
      'অটোমেশন বট তৈরির ১০টি রিয়েল প্রজেক্ট',
      'লাইফটাইম সাপোর্ট ও কোড রিপোজিটরি এক্সেস'
    ]
  },
  // 13. SEO & Blogging Passive Income
  {
    name: 'অ্যাডভান্সড এসইও (SEO) ও ব্লগিং থেকে প্যাসিভ ইনকাম মাস্টারকোর্স',
    slug: 'advanced-seo-blogging-passive-income',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=800&q=80',
    short_description: 'ওয়েবসাইটে গুগল থেকে লক্ষ লক্ষ অর্গানিক ভিজিটর এনে গুগল অ্যাডসেন্স ও এফিলিয়েট মার্কেটিং থেকে প্রতি মাসে আজীবন প্যাসিভ ইনকামের রোডম্যাপ।',
    description: `<p>অন-পেজ, অফ-পেজ, টেকনিক্যাল এসইও, কিওয়ার্ড রিসার্চ এবং ব্যাকলিংক তৈরির আন্তর্জাতিক নিয়মাবলী শিখুন লাইভ কেস স্টাডি সহ।</p>`,
    features: [
      'লো কম্পিটিশন হাই সিভিসি কিওয়ার্ড ফাইন্ডিং টেকনিক',
      'এআই কন্টেন্টকে গুগলে র‍্যাংক করানোর সিক্রেট ফর্মুলা',
      'হাই অথরিটি ডু-ফলো ব্যাকলিংক স্ট্র্যাটেজি',
      'গুগল অ্যাডসেন্স দ্রুত অ্যাপ্রুভাল নেওয়ার গাইড'
    ]
  },
  // 14. Ethical Hacking & Cyber Security
  {
    name: 'এথিক্যাল হ্যাকিং ও সাইবার সিকিউরিটি হ্যান্ডস-অন বুটক্যাম্প',
    slug: 'ethical-hacking-cyber-security-bootcamp',
    category_id: CATEGORIES.COURSES,
    price: 299,
    compare_at_price: 4999,
    thumbnail_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
    short_description: 'হ্যাকারদের হাত থেকে সিস্টেম সুরক্ষিত রাখা, পেনিট্রেশন টেস্টিং ও বাগ বাউন্টি হান্টিং শিখে হাই-পেইড সাইবার সিকিউরিটি ক্যারিয়ার গড়ার কমপ্লিট কোর্স।',
    description: `<p>কালি লিনাক্স, নেটওয়ার্ক স্ক্যানিং, ওয়েব অ্যাপ্লিকেশন ভালনারেবিলিটি ও মেটাস্প্লয়েটের বাস্তব ব্যবহার শিখুন লিগ্যাল এবং এথিক্যাল উপায়ে।</p>`,
    features: [
      'ভার্চুয়াল ল্যাব সেটআপ ও প্র্যাক্টিক্যাল হ্যাকিং ডেমো',
      'বাগ বাউন্টি দিয়ে আন্তর্জাতিক প্ল্যাটফর্ম থেকে আয়ের গাইড',
      'ওয়াইফাই ও নেটওয়ার্ক সিকিউরিটি অ্যানালাইসিস',
      'সাইবার সিকিউরিটি সার্টিফিকেশন রোডম্যাপ'
    ]
  },
  // 15. Adobe Photoshop & Illustrator
  {
    name: 'অ্যাডোবি ফটোশপ ও ইলাস্ট্রেটর ফ্রিল্যান্সিং ক্যারিয়ার মেগা কোর্স',
    slug: 'adobe-photoshop-illustrator-freelancing-mega-course',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    short_description: 'লোগো ডিজাইন, ফটো ম্যানিপুলেশন, ব্র্যান্ড আইডেন্টিটি ও প্রিন্ট মিডিয়া ডিজাইন শিখে টপ গ্রাফিক্স ডিজাইনার হওয়ার লাইভ কোর্স।',
    description: `<p>গ্রাফিক ডিজাইন হলো ফ্রিল্যান্সিংয়ের চিরসবুজ প্ল্যাটফর্ম। ফটোশপের লেয়ার মাস্কিং, রিটাচিং এবং ইলাস্ট্রেটরের ভেক্টর আর্ট ও টাইপোগ্রাফি শিখুন এ টু জেড।</p>`,
    features: [
      '৬০+ হ্যান্ডস-অন প্রজেক্ট ভিত্তিক ক্লাস',
      'প্রিমিয়াম ভেক্টর, ব্রাশ ও ফন্ট কালেকশন ফ্রি',
      'মার্কেটপ্লেস ও নন-মার্কেটপ্লেস ক্লায়েন্ট পাওয়ার কৌশল',
      'লাইফটাইম রিসোর্স এক্সেস'
    ]
  },
  // 16. Local Courier & Business Growth
  {
    name: 'ফেসবুক পেজ গ্রোথ ও ভাইরাল কনটেন্ট মেকিং সিক্রেটস',
    slug: 'facebook-page-growth-viral-content-secrets',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    short_description: 'কোনো পেইড বুস্ট ছাড়াই অর্গানিক উপায়ে ফেসবুক পেজে লক্ষ লক্ষ ফলোয়ার বৃদ্ধি ও লাখ লাখ ভিউ পাওয়ার প্রমাণিত স্ট্র্যাটেজি।',
    description: `<p>কীভাবে ভাইরাল কনটেন্ট রিসার্চ করতে হয়, ভিডিওর প্রথম ৩ সেকেন্ডে দর্শক ধরে রাখা, ক্যাপশন সাইকোলজি ও ফেসবুক রিলসের অ্যালগরিদম ক্র্যাক করার গোপন রহস্য।</p>`,
    features: [
      'অর্গানিক ভাইরাল হওয়ার ট্রাস্টেড কেস স্টাডি',
      'পেজ কোয়ালিটি ও রেকমেন্ডেশন ক্লিন রাখার উপায়',
      'মনিটাইজেশন ওয়াচটাইম দ্রুত পূরণ করার টেকনিক',
      'ফলোয়ারদের বিশ্বস্ত কাস্টমারে রূপান্তরের ফর্মুলা'
    ]
  },
  // 17. Google Ads & YouTube Marketing
  {
    name: 'গুগল অ্যাডস ও ইউটিউব ভিডিও মার্কেটিং প্রফেশনাল কোর্স',
    slug: 'google-ads-youtube-video-marketing-professional',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    short_description: 'গুগল সার্চ অ্যাডস, ডিসপ্লে ক্যাম্পেইন ও ইউটিউব স্কিপেবল ভিডিও অ্যাডস মাস্টারি করে বিদেশি ব্র্যান্ড ও কোম্পানির সেলস বৃদ্ধির গাইড।',
    description: `<p>গুগল অ্যাডস এক্সপার্টদের বিশ্বজুড়ে ব্যাপক চাহিদা। কিওয়ার্ড ম্যাচ টাইপ, বিডিং স্ট্র্যাটেজি, কনভার্সন ট্র্যাকিং ও রিটার্গেটিংয়ের গভীর জ্ঞান অর্জন করুন।</p>`,
    features: [
      'গুগল সার্চ ও শপিং অ্যাডস মাস্টারি',
      'ইউটিউব স্কিপেবল ও বাম্পার অ্যাডস সেটআপ',
      'গুগল ট্যাগ ম্যানেজার (GTM) ও জিএ৪ (GA4) ট্র্যাকিং',
      'ক্লায়েন্টের বিজ্ঞাপনী খরচ বাঁচিয়ে রেজাল্ট আনার ট্রিকস'
    ]
  },
  // 18. Motion Graphics with Blender 3D
  {
    name: 'ব্লেন্ডার থ্রিডি (Blender 3D) অ্যানিমেশন ও মডেলিং কমপ্লিট বিগিনার্স গাইড',
    slug: 'blender-3d-animation-modeling-guide',
    category_id: CATEGORIES.COURSES,
    price: 299,
    compare_at_price: 4499,
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    short_description: 'সম্পূর্ণ ফ্রি সফটওয়্যার ব্লেন্ডার দিয়ে ৩ডি ক্যারেক্টার, প্রোডাক্ট মডেলিং, লাইটিং ও হলিউড কোয়ালিটি অ্যানিমেশন তৈরির বাংলা কোর্স।',
    description: `<p>থ্রিডি অ্যানিমেশনের আন্তর্জাতিক বাজারে অভাবনীয় ডিমান্ড। প্রোডাকশন গ্রেড ৩ডি রেন্ডারিং, ফিজিক্স সিমুলেশন ও প্রোডাক্ট অ্যানিমেশন শিখুন ধাপে ধাপে।</p>`,
    features: [
      'বেসিক ইন্টারফেস থেকে অ্যাডভান্সড ৩ডি রেন্ডারিং',
      'প্রোডাক্ট মডেলিং ও টেক্সচারিং লাইভ প্রজেক্ট',
      'লো-পলি ও হাই-পলি ক্যারেক্টার ডিজাইনিং',
      'রেন্ডার অপটিমাইজেশন ও দ্রুত রেন্ডার নেওয়ার ট্রিকস'
    ]
  },
  // 19. React JS & Modern Frontend
  {
    name: 'রিয়্যাক্ট জেএস ও নেক্সট জেএস (Next.js) মডার্ন ফ্রন্টএন্ড ওয়েব ডেভেলপমেন্ট',
    slug: 'react-nextjs-modern-frontend-development',
    category_id: CATEGORIES.COURSES,
    price: 299,
    compare_at_price: 3999,
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    short_description: 'আধুনিক ফুল-স্ট্যাক ও ফ্রন্টএন্ড ডেভেলপার হয়ে হাই-স্যালারি রিমোট জব পাওয়ার জন্য React, Next.js ও Tailwind CSS-এর প্রজেক্ট-বেজড কোর্স।',
    description: `<p>স্টেট ম্যানেজমেন্ট, এপিআই ইন্টিগ্রেশন, সার্ভার সাইড রেন্ডারিং (SSR) ও ফুল-স্ট্যাক সাস (SaaS) অ্যাপ তৈরির মাধ্যমে নিজের পোর্টফোলিও সমৃদ্ধ করুন।</p>`,
    features: [
      '৫টি লাইভ রিয়েল-ওয়ার্ল্ড ফুলস্ট্যাক প্রজেক্ট',
      'Tailwind CSS ও মডার্ন রেসপন্সিভ ডিজাইন',
      'Authentication ও Supabase/Firebase ডাটাবেজ ইন্টিগ্রেশন',
      'Vercel-এ লাইভ ডেপ্লয়মেন্ট ও ইন্টারভিউ প্রস্তুতি'
    ]
  },
  // 20. TikTok Ads & Viral Marketing
  {
    name: 'টিকটক অ্যাডস ও ভাইরাল ড্রপশিপিং মার্কেটিং সিক্রেট মাস্টারক্লাস',
    slug: 'tiktok-ads-viral-dropshipping-marketing',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=800&q=80',
    short_description: 'টিকটক অ্যাডস ম্যানেজারের মাধ্যমে কম খরচে লক্ষ লক্ষ ভিউ ও ই-কমার্স পণ্যের হাজার হাজার সেলস নিয়ে আসার আধুনিক ফর্মুলা।',
    description: `<p>আন্তর্জাতিক ও লোকাল ই-কমার্সে টিকটক এখন এক নম্বর সেলস ড্রাইভ প্ল্যাটফর্ম। টিকটক পিক্সেল সেটআপ, ইউজার জেনারেটেড কন্টেন্ট (UGC) এবং স্কেলিং টেকনিক শিখুন।</p>`,
    features: [
      'টিকটক এজেন্সি অ্যাকাউন্ট তৈরি ও পেমেন্ট সেটআপ',
      'ইউজিসি (UGC) ভিডিও স্ক্রিপ্টিং ও মেকিং ট্রিকস',
      'কম্পিটিটর স্পাইং ও উইনিং ক্রিয়েটিভ ফাইন্ডিং',
      'লাইভ টিকটক ক্যাম্পেইন সেটআপ ও রেজাল্ট এনালাইসিস'
    ]
  },
  // 21. Microsoft Excel & Power BI
  {
    name: 'মাইক্রোসফট এক্সেল ও পাওয়ার বিআই (Power BI) প্রফেশনাল ডাটা অ্যানালিস্ট কোর্স',
    slug: 'excel-power-bi-data-analyst-course',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    short_description: 'অফিসের জটিল হিসাব, অটোমেটিক ড্যাশবোর্ড এবং পাওয়ার বিআই দিয়ে বিজনেস ইন্টেলিজেন্স রিপোর্টিং তৈরির কর্পোরেট মাস্টারক্লাস।',
    description: `<p>এক্সেলের VLOOKUP, XLOOKUP, Pivot Table থেকে শুরু করে Power BI এর মাধ্যমে আকর্ষণীয় ভিজ্যুয়াল ড্যাশবোর্ড তৈরি করে যেকোনো চাকরিতে সেরা পারফর্ম করুন।</p>`,
    features: [
      '১০০+ অ্যাডভান্সড ফর্মুলা ও ফাংশন মাস্টারি',
      'ডায়নামিক অটোমেটেড এক্সেল ড্যাশবোর্ড মেকিং',
      'পাওয়ার বিআই ডেটা মডেলিং ও ভিজ্যুয়ালাইজেশন',
      'মাল্টিন্যাশনাল জব ইন্টারভিউ প্রিপারেশন গাইড'
    ]
  },
  // 22. IELTS Band 8.0 Preparation
  {
    name: 'আইইএলটিএস (IELTS) ব্যান্ড ৮.০ কমপ্লিট প্রিপারেশন ভিডিও কোর্স (লিসেনিং, রিডিং, রাইটিং, স্পিকিং)',
    slug: 'ielts-band-8-complete-preparation-course',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3999,
    thumbnail_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    short_description: 'বিদেশে উচ্চশিক্ষা বা পিআর-এর জন্য কোনো কোচিং সেন্টারে না গিয়ে ঘরে বসেই প্রথমবার পরীক্ষায় ব্যান্ড ৮.০ পাওয়ার কমপ্লিট বাংলা গাইড।',
    description: `<p>ক্যামব্রিজ টেস্ট সল্যুশন, রাইটিং টাস্ক ১ ও ২ এর ব্যান্ড ৯ স্ট্রাকচার, স্পিকিং ফ্লুয়েন্সি হ্যাকস এবং লিসেনিংয়ের নিখুঁত কৌশল শিখুন সহজ বাংলায়।</p>`,
    features: [
      'চারটি মডিউলের ১০০+ ডিটেইলড ক্লাস ও মক টেস্ট',
      'রাইটিং টাস্ক ব্যান্ড ৯ ভোকাবুলারি ও স্ট্রাকচার পিডিএফ',
      'স্পিকিং কিউ কার্ডস ও রিয়েল এক্সাম অ্যানালাইসিস',
      'ক্যামব্রিজ ১৬-১৯ সল্যুশন টেকনিক্স'
    ]
  },
  // 23. ChatGPT Prompt Engineering
  {
    name: 'চ্যাটজিপিটি (ChatGPT) প্রম্পট ইঞ্জিনিয়ারিং ও এআই ফ্রিল্যান্সিং ব্লুপ্রিন্ট',
    slug: 'chatgpt-prompt-engineering-ai-freelancing',
    category_id: CATEGORIES.AI_TOOLS,
    price: 99,
    compare_at_price: 1999,
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    short_description: 'চ্যাটজিপিটিকে নিজের দক্ষ পার্সোনাল অ্যাসিস্ট্যান্ট বানিয়ে কন্টেন্ট রাইটিং, কোডিং, মার্কেটিং ও ফ্রিল্যান্সিংয়ে কাজের গতি ১০ গুণ বাড়ানোর কৌশল।',
    description: `<p>এআই আপনার চাকরি খাবে না, যে এআই ব্যবহার করতে পারে সে আপনার চাকরি নিবে! প্রম্পট ইঞ্জিনিয়ারিংয়ের মেগা ফর্মুলা দিয়ে রিয়েল মানি আর্ন করুন।</p>`,
    features: [
      '৫,০০০+ রেডিমেড হাই-কনভার্টিং প্রম্পট লাইব্রেরি',
      'ব্লগ পোস্ট, সেলস কপি ও স্ক্রিপ্ট তৈরির এআই ট্রিকস',
      'কাস্টম জিপিটি (Custom GPT) তৈরি ও মনিটাইজেশন',
      'এআই দিয়ে ফ্রিল্যান্সিং প্রপোজাল রাইটিং'
    ]
  },
  // 24. Dropservicing Business
  {
    name: 'ড্রপসার্ভিসিং ও ডিজিটাল এজেন্সি গ্রোথ মাস্টারক্লাস (জিরো স্কিলে ডলার আয়)',
    slug: 'dropservicing-digital-agency-growth-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80',
    short_description: 'নিজে কোনো কাজ না জেনেও বিদেশি ক্লায়েন্টের কাছ থেকে কাজ নিয়ে ফ্রিল্যান্সারদের দিয়ে করিয়ে মাঝখান থেকে মোটা অঙ্কের কমিশন আয়ের বিজনেস মডেল।',
    description: `<p>ড্রপসার্ভিসিং হলো সার্ভিসের ড্রপশিপিং! হাই-ভ্যালু ক্লায়েন্ট পাওয়া, আউটসোর্সিং করা ও নিজস্ব আন্তর্জাতিক ডিজিটাল এজেন্সি ব্র্যান্ডিংয়ের সম্পূর্ণ দিকনির্দেশনা।</p>`,
    features: [
      'টপ ৫টি ড্রপসার্ভিসিং নিশ আইডিয়া ও প্রাইসিং মডেল',
      'ক্লায়েন্ট ক্লোজিং ও কোল্ড ইমেইল অটোমেশন ফ্রেমওয়ার্ক',
      'দক্ষ ফ্রিল্যান্সার খুঁজে নেওয়ার ভেরিফাইড মেথড',
      'এজেন্সি লিগ্যাল সেটআপ ও পেমেন্ট রিসিভ গাইড'
    ]
  },
  // 25. Affiliate Marketing
  {
    name: 'অ্যামাজন ও ক্লিকব্যাংক এফিলিয়েট মার্কেটিং কমপ্লিট সিক্রেট কোর্স',
    slug: 'amazon-clickbank-affiliate-marketing-course',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80',
    short_description: 'আন্তর্জাতিক মার্কেটে পণ্য রেকমেন্ড করে ঘরে বসেই প্রতিমাসে প্যাসিভ ডলার কমিশন উপার্জনের প্র্যাক্টিক্যাল এফিলিয়েট গাইড।',
    description: `<p>অ্যামাজন ও ক্লিকব্যাংক এফিলিয়েটের নিশ রিসার্চ, রিভিউ ওয়েবসাইট তৈরি, ফ্রি ট্রাফিক জেনারেশন ও পেইড ফানেল সেটআপ শিখুন বিস্তারিতভাবে।</p>`,
    features: [
      'উইনিং এফিলিয়েট প্রোডাক্ট রিসার্চ মেথডলজি',
      'হাই-কনভার্টিং ল্যান্ডিং পেজ ও সেলস ফানেল মেকিং',
      'পিন্টারেস্ট ও ফেসবুক ফ্রি ট্রাফিক স্ট্র্যাটেজি',
      'অ্যাকাউন্ট ভেরিফিকেশন ও পেওনিয়ারে টাকা আনার উপায়'
    ]
  },
  // 26. WhatsApp & Messenger Chatbot
  {
    name: 'হোয়াটসঅ্যাপ ও ফেসবুক মেসেঞ্জার চ্যাটবট অটোমেশন (ManyChat Masterclass)',
    slug: 'whatsapp-messenger-chatbot-automation-manychat',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80',
    short_description: '২৪ ঘণ্টা ঘুমিয়ে ঘুমিয়ে কাস্টমার সার্ভিস ও স্বয়ংক্রিয়ভাবে প্রডাক্ট সেলস করার জন্য ManyChat বট তৈরির প্রফেশনাল কোর্স।',
    description: `<p>কাস্টমারের মেসেজের সাথে সাথে রিপ্লাই দেওয়া, অটোমেটিক অর্ডার কনফার্মেশন ও ফলো-আপ মেসেজ পাঠানো শিখুন কোনো কোডিং ছাড়াই।</p>`,
    features: [
      'ManyChat ফুল ফ্লো ও ড্র্যাগ অ্যান্ড ড্রপ বিল্ডার',
      'হোয়াটসঅ্যাপ বিজনেস এপিআই ও ক্লাউড ইন্টিগ্রেশন',
      'অর্ডার কনফার্মেশনের সাথে গুগল শিট সিঙ্ক করা',
      'ই-কমার্স ও কোচিং বিজনেসের রেডি চ্যাটবট টেমপ্লেট'
    ]
  },
  // 27. 3D Cartoon Animation
  {
    name: 'এআই দিয়ে বাচ্চাদের শিক্ষামূলক 3D কার্টুন ও স্টোরি ভিডিও মেকিং কোর্স',
    slug: 'kids-3d-cartoon-animation-ai-story-making',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    short_description: 'ইউটিউবে সবচেয়ে বেশি ভিউ পাওয়া কিডস অ্যানিমেশন ও মোরাল স্টোরি ভিডিও এআই দিয়ে তৈরি করে দ্রুত চ্যানেল গ্রো করার কৌশল।',
    description: `<p>বাচ্চাদের কার্টুন ও রাইমস ভিডিওতে কোটি কোটি ভিউ হয়। এআই ক্যারেক্টার জেনারেট করে তা দিয়ে সুন্দর গল্প ও অ্যানিমেশন বানানোর পূর্ণাঙ্গ নিয়মাবলী।</p>`,
    features: [
      'এআই গল্প ও সাউন্ডস্কেপ তৈরি করার প্রম্পট গাইড',
      '3D অ্যানিমেশন ও লিপ-সিঙ্ক (Lip Sync) টেকনিকস',
      'কপিরাইট ফ্রি ব্যাকগ্রাউন্ড মিউজিক ও সাউন্ড লাইব্রেরি',
      'ইউটিউব কিডস পলিসি ও মনিটাইজেশন সিক্রেটস'
    ]
  },
  // 28. Smartphone Freelancing
  {
    name: 'স্মার্টফোন দিয়ে ফ্রিল্যান্সিং ও অনলাইন আর্নিং মেগা গাইড (কম্পিউটার ছাড়া ক্যারিয়ার)',
    slug: 'smartphone-freelancing-online-earning-guide',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?auto=format&fit=crop&w=800&q=80',
    short_description: 'যাদের কম্পিউটার নেই কিন্তু একটি স্মার্টফোন আছে, তাদের জন্য কনটেন্ট রাইটিং, ডাটা এন্ট্রি ও সোশ্যাল মিডিয়া ম্যানেজমেন্টের সহজ কোর্স।',
    description: `<p>কম্পিউটার না থাকায় যারা ফ্রিল্যান্সিং শুরু করতে পারছেন না, তাদের জন্য একটি মোবাইল দিয়েই মাসে ১৫-২০ হাজার টাকা আয়ের বাস্তবমুখী গাইডলাইন।</p>`,
    features: [
      'মোবাইল দিয়ে কন্টেন্ট রাইটিং ও প্রুফরিডিং',
      'ক্যানভা মোবাইল অ্যাপ দিয়ে গ্রাফিক্স ও থাম্বনেইল তৈরি',
      'ক্যাপকাট মোবাইল দিয়ে রিলস এডিটিং ফ্রিল্যান্সিং',
      'বিশ্বস্ত লোকাল ক্লায়েন্ট পাওয়ার কৌশল'
    ]
  },
  // 29. Mega Asset Bundle: 10,000+ Canva Templates
  {
    name: '১০,০০০+ ক্যানভা প্রিমিয়াম এডিটেবল টেমপ্লেট মেগা বান্ডেল (সোশ্যাল মিডিয়া, বিজনেস, পিওডি)',
    slug: '10000-canva-premium-editable-templates-mega-bundle',
    category_id: CATEGORIES.DIGITAL_RESOURCES,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    short_description: '১০ হাজারেরও বেশি রেডিমেড এডিটেবল ক্যানভা টেমপ্লেট — যেকোনো ব্যবসার বিজ্ঞাপন, ফেসবুক পোস্ট ও ইনস্টাগ্রাম রিলস তৈরিতে ব্যবহারের জন্য পারফেক্ট।',
    description: `<p>গ্রাফিক্সের পেছনে সময় নষ্ট না করে সরাসরি রেডিমেড টেমপ্লেটে টেক্সট পরিবর্তন করে নিজের বা ক্লায়েন্টের জন্য অসাধারণ পোস্ট ডিজাইন করুন মাত্র ২ মিনিটে।</p>`,
    features: [
      'ফেসবুক ও ইনস্টাগ্রাম পোস্ট, স্টোরি ও ক্যারোজেল টেমপ্লেট',
      'ই-কমার্স সেলস ব্যানার ও ডিসকাউন্ট পোস্টার্স',
      'রেস্টুরেন্ট, রিয়েল এস্টেট, ফ্যাশন ও টেক ক্যাটাগরি প্যাক',
      'আজীবন কমার্শিয়াল ব্যবহারের পূর্ণ লাইসেন্স'
    ]
  },
  // 30. Mega Asset Bundle: 50,000+ Video Footage & SFX
  {
    name: '৫০,০০০+ আল্ট্রা এইচডি রয়্যালটি-ফ্রি ভিডিও ফুটেজ, মোশন ব্যাকগ্রাউন্ড ও সাউন্ড এফেক্টস মেগা প্যাক',
    slug: '50000-ultra-hd-stock-footage-sfx-mega-pack',
    category_id: CATEGORIES.DIGITAL_RESOURCES,
    price: 199,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    short_description: 'ইউটিউব, রিলস ও সিনেমাটিক ভিডিও এডিটরদের জন্য ৫০ হাজারের বেশি 4K স্টক ফুটেজ, সিনেমাটিক সাউন্ড এবং মোশন গ্রাফিক্স এলিমেন্টস।',
    description: `<p>কোনো কপিরাইট স্ট্রাইকের ভয় নেই! লাইফটাইম রয়্যালটি ফ্রি স্টক ফুটেজ, ড্রোন শট, হুশ/পপ সাউন্ড এফেক্টস ও ব্যাকগ্রাউন্ড মিউজিক এক ক্লিকেই গুগল ড্রাইভে।</p>`,
    features: [
      '4K ও Full HD কোয়ালিটির আসল ভিডিও ফুটেজ',
      '১০,০০০+ ক্যাটাগরাইজড সাউন্ড এফেক্টস (Whoosh, Pop, Cinematic Boom)',
      'ইউটিউব ও ফেসবুকে ১০০% মনিটাইজেশন সেফ',
      'হাই-স্পিড গুগল ড্রাইভ ডিরেক্ট ক্লাউড ডাউনলোড'
    ]
  },
  // 31. 5000+ Cinematic LUTs & Lightroom Presets
  {
    name: '৫,০০০+ সিনেমাটিক এলইউটি (LUTs) ও লাইটরুম প্রিসেটস মেগা বান্ডেল',
    slug: '5000-cinematic-luts-lightroom-presets-bundle',
    category_id: CATEGORIES.DIGITAL_RESOURCES,
    price: 99,
    compare_at_price: 1999,
    thumbnail_url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=800&q=80',
    short_description: 'যেকোনো সাধারণ ছবি বা ভিডিওকে ১ ক্লিকেই নেটফ্লিক্স ও হলিউড সিনেমাটিক লুক দেওয়ার জন্য প্রিমিয়াম কালার গ্রেডিং LUTs ও প্রিসেটস।',
    description: `<p>প্রিমিয়ার প্রো, আফটার ইফেক্টস, ডাভিঞ্চি রিজলভ, ফাইনাল কাট প্রো এবং মোবাইলের লাইটরুম ও ক্যাপকাটে এক ক্লিকেই কালার গ্রেডিং করার জাদুকরী প্রিসেট প্যাক।</p>`,
    features: [
      'মুডি ডার্ক, গোল্ডেন আওয়ার, টিল অ্যান্ড অরেঞ্জ সিনেমাটিক লুক',
      'মোবাইল (DNG) ও পিসি (XMP/CUBE) ফাইল ফরম্যাট অন্তর্ভুক্ত',
      'ওয়েডিং, ট্রাভেল ও পোর্ট্রেট ফটোগ্রাফির পারফেক্ট কালেকশন',
      'সহজ ইন্সটলেশন ভিডিও গাইডলাইন'
    ]
  },
  // 32. 1,000+ Presentation Pitch Deck Templates
  {
    name: '১,০০০+ প্রফেশনাল পাওয়ারপয়েন্ট ও পিচ ডেক প্রেজেন্টেশন টেমপ্লেট বান্ডেল',
    slug: '1000-powerpoint-pitch-deck-presentation-bundle',
    category_id: CATEGORIES.DIGITAL_RESOURCES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    short_description: 'অফিস মিটিং, ইনভেস্টর পিচ ডেক ও বিজনেস প্রপোজালের জন্য আধুনিক, অ্যানিমেটেড ও দৃষ্টিনন্দন প্রিমিয়াম পাওয়ারপয়েন্ট স্লাইড কালেকশন।',
    description: `<p>ক্লান্তিকর সাদা-কালো স্লাইড বাদ দিন! ইনফোগ্রাফিক, ডাটা চার্ট এবং অ্যানিমেশন সমৃদ্ধ বিশ্বমানের পিচ ডেক টেমপ্লেট দিয়ে মিটিংয়ে সবাইকে মুগ্ধ করুন।</p>`,
    features: [
      '১৬:৯ ফুল এইচডি ওয়াইডস্ক্রিন স্লাইড ডিজাইন',
      'ইনফোগ্রাফিক, টাইমলাইন ও ডাটা অ্যানালিসিস চার্টস',
      'সহজেই ড্র্যাগ অ্যান্ড ড্রপ করে ছবি ও টেক্সট পরিবর্তনযোগ্য',
      'পাওয়ারপয়েন্ট, গুগল স্লাইডস ও কি-নোট সাপোর্টেড'
    ]
  },
  // 33. Logo Design & Brand Identity
  {
    name: 'প্রফেশনাল লোগো ডিজাইন ও ব্র্যান্ড আইডেন্টিটি মাস্টারক্লাস',
    slug: 'professional-logo-design-brand-identity-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    short_description: 'আন্তর্জাতিক ক্লায়েন্টদের জন্য মিনিমালিস্ট, ভেক্টর ও মডার্ন লোগো তৈরি করে প্রতিটি প্রজেক্টে ১৫০-৫০০ ডলার আয়ের প্রফেশনাল মেথড।',
    description: `<p>লোগো ডিজাইনের থিওরি, কালার সাইকোলজি, গোল্ডেন রেশিও এবং ব্র্যান্ড গাইডলাইন মেকিংয়ের ফুল প্র্যাক্টিক্যাল কোর্স।</p>`,
    features: [
      'গোল্ডেন রেশিও ও গ্রিড সিস্টেম লোগো মেকিং',
      'মকআপ প্রেজেন্টেশন ও ক্লায়েন্ট এপ্রুভাল ট্রিকস',
      'কপিরাইট চেকিং ও অরিজিনাল আর্টওয়ার্ক প্রটেকশন',
      'ফাইভার ও ৯৯ডিজাইনস কনটেস্ট উইনিং স্ট্র্যাটেজি'
    ]
  },
  // 34. Print on Demand (POD) & T-Shirt Design
  {
    name: 'প্রিন্ট অন ডিমান্ড (POD) ও টি-শার্ট ডিজাইন থেকে ডলার আয়ের গোপন ফর্মুলা',
    slug: 'print-on-demand-t-shirt-design-mastery',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    short_description: 'টি-স্প্রিং, রেডবাবল ও মার্চ বাই অ্যামাজনে টি-শার্ট ও মার্চেন্ডাইজ ডিজাইন আপলোড করে প্যাসিভ রয়্যালটি আয়ের কমপ্লিট কোর্স।',
    description: `<p>কোনো ইনভেস্টমেন্ট ছাড়াই টি-শার্ট ডিজাইন আপলোড করে আজীবন রয়্যালটি আয় করার আন্তর্জাতিক প্ল্যাটফর্ম গাইড।</p>`,
    features: [
      'ইউএসএ ট্রেন্ডিং নিশ ও কিওয়ার্ড রিসার্চ মেথড',
      'ফটোশপ ও ইলাস্ট্রেটরে দ্রুত প্রিন্ট-রেডি ভেক্টর ডিজাইন তৈরি',
      'রেডবাবল ও টি-স্প্রিং এসইও অপটিমাইজেশন',
      'কপিরাইট ও ট্রেডমার্ক এভয়েড করার নিয়মাবলী'
    ]
  },
  // 35. Email Marketing & Sales Funnel
  {
    name: 'ইমেইল মার্কেটিং ও অটোমেটেড সেলস ফানেল মাস্টারি (Mailchimp + Klaviyo)',
    slug: 'email-marketing-automated-sales-funnel-klaviyo',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&q=80',
    short_description: 'ই-কমার্স ব্র্যান্ড ও বিজনেসের জন্য অটোমেটিক ইমেইল ফ্লো, কার্ট রিকভারি ও নিউজলেটার ডিজাইন করে হাই-কনভার্টিং সেলস আনার গাইড।',
    description: `<p>ইমেইল মার্কেটিংয়ে প্রতি $১ খরচে রিটার্ন আসে $৩৬! ক্লাভিয়ো ও মেইলচিম্পের অটোমেশন ফ্লো সেটআপের প্র্যাক্টিক্যাল কোর্স।</p>`,
    features: [
      'ওয়েলকাম সিরিজ, অ্যাবান্ডন্ড কার্ট ও পোস্ট-পারচেজ অটোমেশন',
      'হাই ওপেন-রেট ইমেইল সাবজেক্ট লাইন সাইকোলজি',
      'রেসপন্সিভ ইমেইল টেমপ্লেট ডিজাইন',
      'ইন্টারন্যাশনাল ই-কমার্স ক্লায়েন্ট সার্ভিস গাইড'
    ]
  },
  // 36. LinkedIn Lead Generation
  {
    name: 'লিঙ্কডইন লিড জেনারেশন ও বি২বি ক্লায়েন্ট একুইজিশন মাস্টারক্লাস',
    slug: 'linkedin-lead-generation-b2b-client-acquisition',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80',
    short_description: 'আমেরিকা ও ইউরোপের কোম্পানির সিইও (CEO) ও ডিসিশন মেকারদের সাথে কানেক্ট করে হাই-টিকেটের কাজ পাওয়ার B2B ফ্রেমওয়ার্ক।',
    description: `<p>লিঙ্কডইন সেলস নেভিগেটর, স্ক্র্যাপিং টুলস ও পার্সোনালাইজড কোল্ড আউটরিচ দিয়ে সরাসরি ডিরেক্ট ক্লায়েন্ট ক্লোজিং শিখুন।</p>`,
    features: [
      'প্রফেশনাল লিঙ্কডইন প্রোফাইল অল-স্টার অপটিমাইজেশন',
      'সেলস নেভিগেটর দিয়ে টার্গেটেড লিড ফাইন্ডিং',
      'কোল্ড মেসেজিং ও হাই-রেসপন্স ফলো-আপ টেমপ্লেট',
      'সরাসরি ক্যালেন্ডার মিটিং বুক করার স্ট্র্যাটেজি'
    ]
  },
  // 37. Podcast Audio Editing
  {
    name: 'পডকাস্ট অডিও এডিটিং ও ভয়েস প্রসেসিং মাস্টারি (Audacity & Adobe Audition)',
    slug: 'podcast-audio-editing-adobe-audition-mastery',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
    short_description: 'যেকোনো সাধারণ মাইকের রেকর্ডিং থেকে ব্যাকগ্রাউন্ড নয়েজ দূর করে স্টুডিও কোয়ালিটির ক্রিস্পি ও ডিপ ভয়েস তৈরির কোর্স।',
    description: `<p>অ্যাডোবি অডিশন ও অডাসিটি দিয়ে অডিও ক্লিনআপ, কম্প্রেসার, ইকুয়ালাইজার ও ভয়েস মডুলেশনের টেকনিক্যাল কাজ শিখুন সহজে।</p>`,
    features: [
      'ব্যাকগ্রাউন্ড নয়েজ ও রুম ইকো ১০০% রিমুভ করার উপায়',
      'রেডিও ও সিনেমাটিক ডাইনামিক ভয়েস প্রসেসিং প্রিসেটস',
      'পডকাস্ট ইন্ট্রো, আউট্রো ও সাউন্ড মিক্সিং',
      'ফাইভার পডকাস্ট এডিটিং সার্ভিস গিগ গাইড'
    ]
  },
  // 38. Web Scraping & Data Extraction
  {
    name: 'নো-কোড ওয়েব স্ক্র্যাপিং ও ডাটা এক্সট্র্যাকশন মাস্টারকোর্স',
    slug: 'no-code-web-scraping-data-extraction-course',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=800&q=80',
    short_description: 'যেকোনো ওয়েবসাইট, ডিরেক্টরি বা সোশ্যাল মিডিয়া থেকে কোডিং ছাড়াই হাজার হাজার ইমেইল ও ডাটা এক্সেল শিটে বের করার ম্যাজিক ট্রিকস।',
    description: `<p>লোকাল বা আন্তর্জাতিক লিড জেনারেশন ও মার্কেট রিসার্চের জন্য অটোমেটেড এক্সট্র্যাকশন টুলসের বাস্তবমুখী ব্যবহার।</p>`,
    features: [
      'Google Maps, YellowPages ও লিঙ্কডইন স্ক্র্যাপিং মেথড',
      'ফ্রি স্ক্র্যাপিং এক্সটেনশন ও অটোমেশন স্ক্রিপ্টস',
      'ডাটা ক্লিনিং ও এক্সেল ফরম্যাটিং',
      'হাই-পেইড লিড জেনারেশন ফ্রিল্যান্সিং গাইড'
    ]
  },
  // 39. Freelance Contract & Client Safety
  {
    name: 'ফ্রিল্যান্সারদের ক্লায়েন্ট সেফটি, পেমেন্ট রিকভারি ও কন্ট্রাক্ট লিগ্যাল ব্লুপ্রিন্ট',
    slug: 'freelance-client-safety-payment-recovery-blueprint',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
    short_description: 'মার্কেটপ্লেসের বাইরে ক্লায়েন্টের কাজ করে পেমেন্ট প্রতারণা থেকে বাঁচা এবং ৫০% অগ্রিম নেওয়ার আইনি চুক্তিপত্র গাইড।',
    description: `<p>ক্লায়েন্ট কাজ করিয়ে নিয়ে টাকা দিচ্ছে না? এই কোর্স আপনাকে শেখাবে কীভাবে প্রফেশনাল কন্ট্রাক্ট সাইন করাতে হয় এবং পেমেন্ট সিকিউর করতে হয়।</p>`,
    features: [
      'ইন্টারন্যাশনাল ফ্রিল্যান্স কন্ট্রাক্ট এগ্রিমেন্ট টেমপ্লেট',
      'ইনভয়েস ও মাইলস্টোন পেমেন্ট সেটআপের নিয়ম',
      'প্রতারক ক্লায়েন্ট চেনার ১০টি লাল সংকেত (Red Flags)',
      'পেওনিয়ার ও ওয়াইজ দিয়ে নিরাপদে টাকা আনার প্রসেস'
    ]
  },
  // 40. Midjourney & AI Art Mastery
  {
    name: 'মিডজার্নি (Midjourney v6) ও এআই আর্ট মাস্টারি - প্রম্পট দিয়ে আর্ট বিক্রির কৌশল',
    slug: 'midjourney-ai-art-mastery-selling-secrets',
    category_id: CATEGORIES.AI_TOOLS,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    short_description: 'মিডজার্নি দিয়ে ফটোগ্রাফি, ক্যারেক্টার ও স্ট্রিট আর্ট জেনারেট করে অ্যাডোবি স্টক ও ফ্রিপিক থেকে রয়্যালটি ইনকামের মাস্টারক্লাস।',
    description: `<p>হাইপার-রিয়েলিস্টিক এআই আর্টের জন্য ক্যামেরা লেন্স, লাইটিং ও স্টাইল প্রম্পট লেখার সিক্রেট মেথড শিখে স্টক সাইটে আর্ট বিক্রি করুন।</p>`,
    features: [
      'মিডজার্নি v6 এর সব প্যারামিটার ও ফ্ল্যাগ গাইড',
      'ফটোগ্রাফি ও সিনেমাটিক লাইটিং প্রম্পট মেগা শিট',
      'অ্যাডোবি স্টক ও শাটারস্টকে এআই ছবি বিক্রির পলিসি',
      'ইমেজ আপস্কেলিং ও প্রিন্ট-রেডি 300 DPI কনভার্সন'
    ]
  },
  // 41. Complete Bangla Typing & Office Secret
  {
    name: 'বাংলা ও ইংরেজি দ্রুত টাইপিং ও অফিস সিক্রেটস মাস্টারক্লাস',
    slug: 'bangla-english-speed-typing-office-secrets',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1299,
    thumbnail_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    short_description: 'না দেখে মিনিটে ৬০+ শব্দ দ্রুত টাইপ করার গোপন ফিঙ্গার পজিশন ট্রিকস ও প্রফেশনাল অফিস ফাইল ম্যানেজমেন্ট।',
    description: `<p>অফিসে বা পড়াশোনায় কাজের স্পিড বাড়াতে টাচ টাইপিংয়ের সেরা টেকনিক। বিজয় এবং অভ্র কিবোর্ডের সব যুক্তাক্ষর সহজে টাইপ করার ফর্মুলা।</p>`,
    features: [
      'না দেখে অন্ধের মতো টাইপ করার ফিঙ্গার ম্যাপিং',
      'বিজয় ও অভ্র কিবোর্ডের সব জটিল যুক্তাক্ষর শিট',
      'কিবোর্ড শর্টকাট যা আপনার প্রতিদিন ঘণ্টার পর ঘণ্টা বাঁচাবে',
      'অফিসিয়াল ডকুমেন্ট ড্রাফটিং ফরম্যাটস'
    ]
  },
  // 42. E-Commerce Product Photography
  {
    name: 'স্মার্টফোন দিয়ে ই-কমার্স প্রোডাক্ট ফটোগ্রাফি ও ব্যাকগ্রাউন্ড রিটাচিং কোর্স',
    slug: 'smartphone-product-photography-retouching',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 1999,
    thumbnail_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    short_description: 'দামি ক্যামেরা ছাড়াই একটি সাধারণ মোবাইল ও ঘরোয়া আলো ব্যবহার করে স্টুডিও মানের প্রোডাক্ট ফটো তোলার কমপ্লিট গাইড।',
    description: `<p>অনলাইন বিজনেসে প্রডাক্টের ছবিই আসল সেলস এনে দেয়। সাধারণ মোবাইল দিয়ে জুয়েলারি, কাপড় ও গ্যাজেটের সিনেমাটিক ছবি তোলার কৌশল।</p>`,
    features: [
      'ঘরোয়া ডিআইওয়াই (DIY) লাইটবক্স তৈরির নিয়ম',
      'মোবাইল ক্যামেরা প্রো মোড ও ফোকাস সেটিংস',
      'এআই দিয়ে ১-ক্লিকে ব্যাকগ্রাউন্ড পরিবর্তন ও শ্যাডো মেকিং',
      'সোশ্যাল মিডিয়া সেলস বুস্টিং ইমেজ সাইকোলজি'
    ]
  },
  // 43. 100+ High-Converting Landing Page Templates
  {
    name: '১০০+ হাই-কনভার্টিং এলিমেন্টর ও শপিফাই ল্যান্ডিং পেজ রেডি টেমপ্লেট প্যাক',
    slug: '100-high-converting-landing-page-templates-pack',
    category_id: CATEGORIES.DIGITAL_RESOURCES,
    price: 199,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    short_description: 'ই-কমার্স, কোর্স ও রিয়েল এস্টেট বিজনেসের জন্য ১০ গুণ সেলস এনে দেওয়ার প্রমাণিত ল্যান্ডিং পেজ ডিজাইন — ১ ক্লিকেই ইমপোর্টযোগ্য।',
    description: `<p>সেলস বাড়ানোর গোপন অস্ত্র হলো হাই-কনভার্টিং ল্যান্ডিং পেজ। জেসন (JSON) ফাইল ইমপোর্ট করেই রেডি পেজ ব্যবহার করুন কোনো কোডিং ছাড়া।</p>`,
    features: [
      '১০০টি ইউনিক ও আল্ট্রা-ফাস্ট লোডিং ল্যান্ডিং পেজ',
      'মোবাইল ও ট্যাবলেটে ১০০% অপটিমাইজড রেসপন্সিভ ডিজাইন',
      'কল-টু-অ্যাকশন (CTA) ও রিভিউজ সাইকোলজি বিল্ট-ইন',
      'ওয়ার্ডপ্রেস এলিমেন্টর ও শপিফাই উভয়েই কাজ করে'
    ]
  },
  // 44. Content Writing & Copywriting
  {
    name: 'হাই-কনভার্টিং কপিরাইটিং ও কনটেন্ট রাইটিং মাস্টারি (বিজ্ঞাপনে কোটি টাকার সেলস)',
    slug: 'high-converting-copywriting-content-writing-mastery',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    short_description: 'এমন বিজ্ঞাপন ও লেখা যা পড়া মাত্রই মানুষ পণ্য কিনতে বাধ্য হয় — হুক, স্টোরি ও অফার ফর্মুলার এ টু জেড কপিরাইটিং গাইড।',
    description: `<p>পণ্য যতই ভালো হোক, বিজ্ঞাপনের লেখা দুর্বল হলে সেলস আসবে না। হিউম্যান সাইকোলজি, পেইন পয়েন্ট ও সেলস ফানেল ড্রাফটিং শিখুন সহজে।</p>`,
    features: [
      'AIDA ও PAS কপিরাইটিং ফর্মুলার বাস্তব উদাহরণ',
      'ফেসবুক অ্যাডের ১০০+ প্রমাণিত হেডলাইন ও হুক্স',
      'প্রডাক্ট ডেসক্রিপশন লিখে কনভার্সন দ্বিগুণ করার ট্রিকস',
      'ফ্রিল্যান্স কপিরাইটার হিসেবে রিমোট জব গাইড'
    ]
  },
  // 45. Motion Graphics for Advertisements
  {
    name: 'আফটার ইফেক্টস সোশ্যাল মিডিয়া অ্যাডস ও মোশন গ্রাফিক্স কোর্স',
    slug: 'after-effects-social-media-ads-motion-graphics',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    short_description: 'ব্র্যান্ডের বিজ্ঞাপনের জন্য চোখ ধাঁধানো মোশন গ্রাফিক্স, টাইপোগ্রাফি অ্যানিমেশন ও সোশ্যাল অ্যাডস তৈরির কমপ্লিট ট্রেনিং।',
    description: `<p>স্ট্যাটিক ইমেজ বিজ্ঞাপনের চেয়ে মোশন ভিডিও বিজ্ঞাপনে সেলস আসে ৩ গুণ বেশি। আফটার ইফেক্টসের কমার্শিয়াল অ্যাড মেকিং শিখুন।</p>`,
    features: [
      '৩০টি রিয়েল কমার্শিয়াল বিজ্ঞাপন অ্যানিমেশন প্রজেক্ট',
      'লোগো অ্যানিমেশন ও লোয়ার থার্ডস মেকিং',
      'প্রিমিয়াম প্রজেক্ট ফাইল ও অ্যাসেটস অন্তর্ভুক্ত',
      'এজেন্সি ও লোকাল ক্লায়েন্ট পোর্টফোলিও গাইড'
    ]
  },
  // 46. Ghostwriting & Ebook Publishing
  {
    name: 'আমাজন কিন্ডল (KDP) ইবুক পাবলিশিং ও প্যাসিভ রয়্যালটি ইনকাম',
    slug: 'amazon-kindle-kdp-ebook-publishing-course',
    category_id: CATEGORIES.COURSES,
    price: 199,
    compare_at_price: 2999,
    thumbnail_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    short_description: 'আমাজন কিন্ডলে ইবুক ও পেপারব্যাক বই প্রকাশ করে আমেরিকান রিডারদের কাছে বিক্রি করে প্রতি মাসে আজীবন রয়্যালটি ইনকামের গাইড।',
    description: `<p>নিজে বই না লিখেও এআই ও আউটসোর্সিংয়ের মাধ্যমে কিন্ডলে বুক পাবলিশ করে প্যাসিভ আর্নিংয়ের বিশ্বমানের সিক্রেট মেথড।</p>`,
    features: [
      'আমাজন বেস্টসেলার নিশ রিসার্চ ফর্মুলা',
      'বুক কভার ডিজাইন ও ফরম্যাটিংয়ের সঠিক নিয়ম',
      'আমাজন কেডিপি অ্যাকাউন্ট সেটআপ ও ট্যাক্স ইন্টারভিউ',
      'পেওনিয়ারে সরাসরি ডলার রিসিভ করার প্রসেস'
    ]
  },
  // 47. Webflow No-Code Web Development
  {
    name: 'ওয়েবফ্লো (Webflow) নো-কোড ওয়েবসাইট ডেভেলপমেন্ট মাস্টারক্লাস',
    slug: 'webflow-no-code-website-development-masterclass',
    category_id: CATEGORIES.COURSES,
    price: 249,
    compare_at_price: 3499,
    thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    short_description: 'সিলিকন ভ্যালির স্টার্টআপদের জন্য আধুনিক ওয়েবফ্লো ওয়েবসাইট তৈরি করে প্রতি প্রোজেক্টে ৫০০-২০০০ ডলার আয়ের কোর্স।',
    description: `<p>কোনো কোড না লিখেও পিওর এইচটিএমএল-সিএসএস আর্কিটেকচারে বিশ্বমানের ইন্টারঅ্যাক্টিভ ওয়েবসাইট তৈরির মোস্ট ডিমান্ডিং স্কিল।</p>`,
    features: [
      'ওয়েবফ্লো সিএমএস ও ইন্টারঅ্যাকশন অ্যানিমেশন মাস্টারি',
      'ফিগমা ডিজাইনকে সরাসরি ওয়েবফ্লোতে কনভার্ট করার কৌশল',
      'ক্লায়েন্ট বিলিং ও প্রজেক্ট ট্রান্সফার মেথড',
      'হাই-টিকিট আন্তর্জাতিক ক্লায়েন্ট হ্যান্ডলিং'
    ]
  },
  // 48. Sound Design & Audio Branding
  {
    name: '১,০০০+ সাউন্ড ডিজাইন, বিটস ও কপিরাইট ফ্রি ব্যাকগ্রাউন্ড মিউজিক প্যাক',
    slug: '1000-sound-design-beats-royalty-free-music-pack',
    category_id: CATEGORIES.DIGITAL_RESOURCES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    short_description: 'ভিডিও এডিটর ও কনটেন্ট ক্রিয়েটরদের জন্য হাই-এনার্জি ট্রাভেল, সিনেমাটিক ড্রামা ও পডকাস্ট মিউজিকের বিশাল লাইব্রেরি।',
    description: `<p>ইউটিউব, ফেসবুক ও ইনস্টাগ্রামে কোনো কপিরাইট ক্লেইমের ভয় ছাড়াই ব্যবহারযোগ্য স্টুডিও মাস্টার্ড মিউজিক ট্র্যাকস।</p>`,
    features: [
      '১০০০+ হাই-কোয়ালিটি WAV ও MP3 অডিও ফাইলস',
      'সিনেমাটিক, কর্পোরেট, লো-ফাই ও ড্রামাটিক ক্যাটাগরি',
      'ইউটিউব ও ফেসবুকে ১০০% লাইসেন্সড ও সেফ',
      'লাইফটাইম ক্লাউড স্টোরেজ ডিরেক্ট ডাউনলোড'
    ]
  },
  // 49. Cold Email Outreach Mastery
  {
    name: 'কোল্ড ইমেইল আউটরিচ দিয়ে হাই-টিকিট রিমোট জব ও ক্লায়েন্ট পাওয়ার ফ্রেমওয়ার্ক',
    slug: 'cold-email-outreach-high-ticket-client-acquisition',
    category_id: CATEGORIES.COURSES,
    price: 149,
    compare_at_price: 2499,
    thumbnail_url: 'https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&q=80',
    short_description: 'ফাইভার-আপওয়ার্কের বাইরে বিদেশি কোম্পানির প্রতিষ্ঠাতা ও ডিরেক্টরদের সরাসরি ইমেইল পাঠিয়ে কাজ নেওয়ার প্রফেশনাল ফ্রেমওয়ার্ক।',
    description: `<p>কীভাবে স্প্যাম বক্সে না গিয়ে ইনবক্সে ইমেইল ল্যান্ড করাতে হয়, ডিকেআইএম/এসপিএফ সেটআপ, এবং ৩০%+ রিপ্লাই পাওয়ার সাইকোলজিক্যাল কপিরাইটিং।</p>`,
    features: [
      'ইনবক্স ডেলিভারিবিলিটি ও ডোমেইন ওয়ার্মআপ গাইড',
      '৫০+ প্রমাণিত কোল্ড ইমেইল স্ক্রিপ্ট ও সাবজেক্ট লাইন',
      'ফ্রি ইমেইল ভেরিফায়ার ও স্ক্র্যাপার টুলস লিস্ট',
      'জুম কলে ক্লায়েন্ট কনভার্ট করার সিক্রেট মেথড'
    ]
  },
  // 50. Viral Reels & Shorts Growth Formula
  {
    name: 'ফেসবুক ও ইনস্টাগ্রাম রিলস অ্যালগরিদম ক্র্যাক - লাখ লাখ ভিউয়ের মাস্টারপ্ল্যান',
    slug: 'facebook-instagram-reels-algorithm-growth-formula',
    category_id: CATEGORIES.COURSES,
    price: 99,
    compare_at_price: 1499,
    thumbnail_url: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    short_description: 'ভিডিওর প্রথম ৩ সেকেন্ডে দর্শকের মনোযোগ আটকে রেখে অ্যালগরিদমের সাহায্যে প্রতিটা ভিডিও ভাইরাল করার সাইন্টিফিক মেথডলজি।',
    description: `<p>রিলসে কেন ভিউ আসে না? অডিয়েন্স রিটেনশন, লুপ ট্রিকস, ট্রেন্ডিং অডিও ব্যবহার এবং অর্গানিক ফলোয়ার বাড়ানোর কমপ্লিট সিক্রেট ফ্রেমওয়ার্ক।</p>`,
    features: [
      '১০০টি ভাইরাল রিলস হুক ও ওপেনিং আইডিয়া',
      'অ্যালগরিদমের ফেভারিট অডিয়েন্স রিটেনশন হ্যাকস',
      'রিলস থেকে সরাসরি প্রোডাক্ট ও কোর্স বিক্রির ফানেল',
      'রিয়েল প্রোফাইল ভাইরাল গ্রোথ কেস স্টাডি'
    ]
  }
];

async function seed() {
  console.log(`\n======================================================`);
  console.log(`🚀 Seeding 50 Premium Bangladeshi Trending Courses & Products`);
  console.log(`Total Products to Insert: ${PRODUCTS.length}`);
  console.log(`======================================================\n`);

  let inserted = 0;
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const sku = `BDB-PRO-${String(i + 1).padStart(3, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      // Check if product exists by slug
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', p.slug)
        .maybeSingle();

      let productId;

      if (existing) {
        productId = existing.id;
        await supabase.from('products').update({
          name: p.name,
          category_id: p.category_id,
          price: p.price,
          compare_at_price: p.compare_at_price,
          short_description: p.short_description,
          description: p.description,
          thumbnail_url: p.thumbnail_url,
          status: 'published',
          featured: i < 10, // top 10 featured
          new_product: true,
          product_type: 'digital_download',
          delivery_type: 'digital_download',
          seo_title: `${p.name} | bdBeginner`,
          seo_description: p.short_description,
          updated_at: new Date().toISOString()
        }).eq('id', productId);
        updated++;
      } else {
        const { data: created, error: insErr } = await supabase
          .from('products')
          .insert({
            name: p.name,
            slug: p.slug,
            sku: sku,
            category_id: p.category_id,
            price: p.price,
            compare_at_price: p.compare_at_price,
            short_description: p.short_description,
            description: p.description,
            thumbnail_url: p.thumbnail_url,
            status: 'published',
            featured: i < 10,
            new_product: true,
            version: '2026 Pro Edition',
            compatibility: 'Mobile, Laptop, Desktop Universal Access',
            requirements: 'Internet connection to stream / download',
            support_period: 'Lifetime Access & Dedicated Support',
            update_policy: 'Future modules & updates included',
            delivery_description: 'Instant Google Drive & Cloud Access link provided in your user dashboard.',
            product_type: 'digital_download',
            delivery_type: 'digital_download',
            seo_title: `${p.name} | bdBeginner`,
            seo_description: p.short_description,
            published_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (insErr) throw insErr;
        productId = created.id;
        inserted++;
      }

      // Add features
      if (p.features && p.features.length > 0) {
        await supabase.from('product_features').delete().eq('product_id', productId);
        const featureRows = p.features.map((feat, idx) => ({
          product_id: productId,
          feature: feat,
          sort_order: idx + 1
        }));
        await supabase.from('product_features').insert(featureRows);
      }

      console.log(`✅ [${String(i + 1).padStart(2, ' ')}/50] (${p.price}৳) ${p.name.slice(0, 48)}...`);
    } catch (err) {
      errors++;
      console.error(`❌ [${i + 1}/50] Error: ${err.message}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 50 Premium Products Successfully Processed!`);
  console.log(`Inserted: ${inserted} | Updated: ${updated} | Errors: ${errors}`);
  console.log(`======================================================\n`);
}

seed().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});

