import type { Product } from '@/types';

export interface CourseResource {
  id: string;
  title: string;
  type: 'pdf' | 'zip' | 'preset' | 'notion' | 'audio' | 'code' | 'html' | 'file';
  size: string;
  downloadUrl: string;
  description: string;
}

export interface CoursePrompt {
  id: string;
  tool: 'Midjourney' | 'Runway Gen-3' | 'Kling AI' | 'Claude / GPT-4o' | 'ElevenLabs';
  title: string;
  prompt: string;
}

export interface CourseLesson {
  id: string;
  moduleId: string;
  lessonNumber: string;
  title: string;
  titleEn: string;
  duration: string;
  durationSeconds: number;
  isFreePreview?: boolean;
  youtubeId?: string;
  videoUrl?: string;
  summary: string;
  keyPoints: string[];
  resources?: CourseResource[];
  prompts?: CoursePrompt[];
}

export interface CourseModule {
  id: string;
  moduleNumber: number;
  title: string;
  titleEn: string;
  description: string;
  lessons: CourseLesson[];
}

export interface CourseData {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  tagline: string;
  badge: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  totalDuration: string;
  totalLessons: number;
  language: string;
  access: string;
  level: string;
  certificate: boolean;
  instructor: {
    name: string;
    role: string;
    avatar: string;
    bio: string;
  };
  features: { icon: string; title: string; desc: string }[];
  bonuses: { title: string; desc: string }[];
  modules: CourseModule[];
  faqs: { q: string; a: string }[];
  reviews: { name: string; role: string; rating: number; comment: string; date: string }[];
}

export const AI_MOTION_COURSE: CourseData = {
  id: 'c0000001-0000-4000-8000-000000000001',
  slug: 'ai-motion-masterclass',
  title: 'AI মোশন গ্রাফিক্স মাস্টারক্লাস | Advanced Agentic Video Editing',
  titleEn: 'AI Motion Graphics Masterclass | Advanced Agentic Video Editing',
  tagline: 'AI দিয়ে সিনেমাটিক মোশন গ্রাফিক্স, প্রম্পট অ্যানিমেশন এবং অটোমেটেড এজেন্টিক ভিডিও এডিটিং-এর পূর্ণাঙ্গ হ্যান্ডস-অন মাস্টারক্লাস।',
  badge: '🔥 মেগা অফার • মাত্র ১৯৯ টাকা',
  price: 199,
  originalPrice: 1999,
  discountPercentage: 90,
  totalDuration: '১ ঘণ্টা ৩০ মিনিট (দেড় ঘণ্টা)',
  totalLessons: 10,
  language: 'বাংলা (Hind Siliguri)',
  access: 'আজীবন এক্সেস (Lifetime Access)',
  level: 'বিগিনার থেকে অ্যাডভান্সড',
  certificate: true,
  instructor: {
    name: 'bdBeginner AI Creative Lab',
    role: 'Senior Motion Designer & AI Workflow Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'আধুনিক জেনারেটিভ AI টুলস এবং এজেন্টিক অটোমেশন দিয়ে ভিডিও এডিটিংয়ের সময় ৯০% বাঁচিয়ে সিনেমাটিক কোয়ালিটি নিশ্চিত করার বিশেষ গাইড।',
  },
  features: [
    {
      icon: 'Film',
      title: 'সিনেমাটিক AI ভিডিও জেনারেশন',
      desc: 'Runway Gen-3, Kling AI ও Luma Dream Machine দিয়ে 4K সিনেমাটিক ভিজ্যুয়াল তৈরির প্র্যাকটিক্যাল টেকনিক।',
    },
    {
      icon: 'Bot',
      title: 'Advanced Agentic Video Editing',
      desc: 'AI এজেন্টের সাহায্যে অটোমেটেড স্ক্রিপ্টিং, ক্যাপশনিং ও ব্যাকগ্রাউন্ড স্কোর সাজিয়ে এডিটিং ১০ গুণ দ্রুত করার ফ্রেমওয়ার্ক।',
    },
    {
      icon: 'Sparkles',
      title: 'ডাইনামিক মোশন গ্রাফিক্স ও 3D ক্যামেরা',
      desc: 'Midjourney এবং আফটার এফেক্টস ইন্টিগ্রেশন করে চোখ ধাঁধানো 3D ক্যামেরা ডেপথ ও মোশন অ্যানিমেশন।',
    },
    {
      icon: 'DownloadCloud',
      title: 'সম্পূর্ণ ফ্রি সোর্স ফাইল ও প্রম্পট প্যাক',
      desc: 'কোর্সের সাথে ব্যবহৃত সমস্ত প্রজেক্ট ফাইল, সিনেমাটিক সাউন্ড FX এবং রেডি-টু-ইউজ প্রম্পট সম্পূর্ণ বিনামূল্যে অন্তর্ভুক্ত।',
    },
    {
      icon: 'Infinity',
      title: 'আজীবন এক্সেস ও নিয়মিত আপডেট',
      desc: 'একবার কিনলেই আজীবন এক্সেস। ভবিষ্যতে যত নতুন এআই মডেল বা টুলস আসবে, সব আপডেট ফ্রিতে পাবেন।',
    },
    {
      icon: 'Headphones',
      title: 'ভিআইপি সাপোর্ট ও প্রাইভেট ডিসকাশন',
      desc: 'যেকোনো সমস্যায় আমাদের ডেডিকেটেড সাপোর্ট টিম ও প্রাইভেট স্টুডেন্ট কমিউনিটি থেকে সার্বক্ষণিক সাহায্য।',
    },
  ],
  bonuses: [
    {
      title: '৫০০+ সিনেমাটিক সাউন্ড FX ও BGM কালেকশন',
      desc: 'উচ্চমানের হুশ, রাইজার, সিনেমাটিক ইমপ্যাক্ট ও অ্যাম্বিয়েন্স অডিও যা আপনার ভিডিওকে সিনেমাটিক রূপ দেবে।',
    },
    {
      title: 'এজেন্টিক ভিডিও এডিটিং মাস্টার প্রম্পট লাইব্রেরি',
      desc: 'Runway, Midjourney, Kling AI ও GPT-4o-এর টেস্টেড প্রম্পট যা ডিরেক্ট কপি-পেস্ট করে ব্যবহারযোগ্য।',
    },
    {
      title: 'Premiere Pro & DaVinci Resolve কালার প্রিসেট প্যাক',
      desc: 'এক ক্লিকেই হলিউড সিনেমাটিক টিল অ্যান্ড অরেঞ্জ ও মুডি কালার গ্রেডিং লুক পাওয়ার প্রিসেট ফাইল।',
    },
    {
      title: 'সোশ্যাল মিডিয়া ভাইরাল রিলস ও শর্টস টেমপ্লেট',
      desc: 'ইউটিউব শর্টস ও ইনস্টাগ্রাম রিলসের জন্য হাই-এনগেজমেন্ট হুক ফ্রেমওয়ার্ক ও মোশন অ্যাসেটস।',
    },
  ],
  modules: [
    {
      id: 'module-1',
      moduleNumber: 1,
      title: 'মডিউল ০১: AI মোশন গ্রাফিক্স ও এজেন্টিক ভিডিও এডিটিং মাস্টারক্লাস',
      titleEn: 'Module 01: AI Motion Graphics & Agentic Video Editing Masterclass',
      description: '১০টি পূর্ণাঙ্গ প্র্যাকটিক্যাল ক্লাস, রিসোর্স ও সোর্স ফাইল।',
      lessons: [
        {
          id: 'lesson-1',
          moduleId: 'module-1',
          lessonNumber: '০১',
          title: 'কোর্স ওভারভিউ ও এআই ভিডিওর ভবিষ্যত (ফ্রি ডেমো)',
          titleEn: 'Course Overview & Future of AI Motion Graphics (Free Demo)',
          duration: '০৮:০০',
          durationSeconds: 480,
          isFreePreview: true,
          youtubeId: 'B1l3tNihOZI', // User's Free Demo Video Link
          summary: 'এআই ভিডিও এডিটিং কীভাবে কাজ করে, ইন্ডাস্ট্রি কীভাবে পরিবর্তিত হচ্ছে এবং এই কোর্সে কী কী শিখবেন তার সম্পূর্ণ বাস্তব ডেমো।',
          keyPoints: [
            'ট্র্যাডিশনাল এডিটিং বনাম এআই এজেন্টিক এডিটিংয়ের গতি ও সুবিধা',
            'প্রয়োজনীয় ব্রাউজার এক্সটেনশন ও এআই টুলস কনফিগারেশন',
            'সম্পূর্ণ প্রজেক্ট ওয়ার্কফ্লো প্রিভিউ',
          ],
          resources: [
            {
              id: 'res-1',
              title: 'AI Video Masterclass Roadmap & Asset Directory.pdf',
              type: 'pdf',
              size: '2.8 MB',
              downloadUrl: '#',
              description: 'কোর্সের সম্পূর্ণ গাইডলাইন এবং প্রয়োজনীয় এআই টুলসের রেফারেন্স বুক।',
            },
          ],
          prompts: [
            {
              id: 'p-1',
              tool: 'Claude / GPT-4o',
              title: 'High-Converting Cinematic Storyboard Generator',
              prompt: 'Act as an award-winning creative video director. Generate a 30-second high-energy visual script about AI motion graphics. Include 6 distinct camera angles, subject motion, lighting cues, and exact sound design timestamps.',
            },
          ],
        },
        {
          id: 'lesson-2',
          moduleId: 'module-1',
          lessonNumber: '০২',
          title: 'এআই দিয়ে মোশন গ্রাফিক্স কীভাবে কাজ করে + সেটআপ',
          titleEn: 'How AI Motion Graphics Works & Environment Setup',
          duration: '১০:০০',
          durationSeconds: 600,
          youtubeId: 'RGls4AiwA0k',
          summary: 'এআই মোশন গ্রাফিক্স কীভাবে কাজ করে, প্রয়োজনীয় টুলস এবং প্রোজেক্টের এনভায়রনমেন্ট সেটআপ গাইড।',
          keyPoints: [
            'এআই মোশন ইঞ্জিন ও লেয়ার আর্কিটেকচার বোঝা',
            'প্রজেক্ট এনভায়রনমেন্ট ও স্টাইল কিট সেটআপ',
            'স্মুথ মোশন প্রিভিউ ও অপ্টিমাইজেশন টেকনিক',
          ],
          resources: [
            {
              id: 'res-2-1',
              title: 'motion-style-kit-v2.zip',
              type: 'zip',
              size: 'ZIP ফাইল',
              downloadUrl: 'https://founders.com.bd/attachments/28',
              description: 'মোশন গ্রাফিক্স স্টাইল কিট ও প্রজেক্ট ফাইল v2',
            },
            {
              id: 'res-2-2',
              title: 'Lesson-1-Resource-Guide-v3.pdf',
              type: 'pdf',
              size: 'PDF গাইড',
              downloadUrl: 'https://founders.com.bd/attachments/45',
              description: 'লেসন ১ ও ২-এর রিসোর্স গাইড ও স্টেপ-বাই-স্টেপ ডকুমেন্টেশন v3',
            },
          ],
          prompts: [
            {
              id: 'p-2',
              tool: 'Midjourney',
              title: 'Abstract Kinetic Motion Background',
              prompt: 'Fluid kinetic typography background, glowing iridescent glass shards in 3D motion, cinematic lighting, 8k render --ar 16:9 --style raw',
            },
          ],
        },
        {
          id: 'lesson-3',
          moduleId: 'module-1',
          lessonNumber: '০৩',
          title: 'এআই দিয়ে প্রফেশনাল স্ক্রিপ্ট ও বাংলা ভয়েস জেনারেশন',
          titleEn: 'Professional Scriptwriting & Bengali Voice Generation with AI',
          duration: '১১:০০',
          durationSeconds: 660,
          youtubeId: 'RW3FG7fbao0',
          summary: 'উচ্চমানের স্ক্রিপ্ট তৈরি, ইমোশন কন্ট্রোল এবং এআই দিয়ে ন্যাচারাল ও প্রফেশনাল বাংলা ভয়েস জেনারেট করার টেকনিক।',
          keyPoints: [
            'হাই-কনভার্টিং ভিডিও স্ক্রিপ্ট ফ্রেমওয়ার্ক',
            'ইমোশন ও টোন নিয়ন্ত্রণ করে পারফেক্ট ভয়েসওভার তৈরি',
            'ভয়েস টু মোশন গ্রাফিক্স সিঙ্কিং মেথড',
          ],
          resources: [
            {
              id: 'res-3-1',
              title: 'Add Emotion _ Project Setup _ Voice to Motion Graphic File 01 .html',
              type: 'html',
              size: 'HTML / সোর্স ফাইল',
              downloadUrl: 'https://founders.com.bd/attachments/46',
              description: 'Add Emotion ও প্রোজেক্ট সেটআপ - Voice to Motion Graphic ফাইল ০১',
            },
          ],
          prompts: [
            {
              id: 'p-3',
              tool: 'ElevenLabs',
              title: 'Bengali Cinematic Voiceover Tuning',
              prompt: 'Natural Bengali male narrator voice, deep resonant tone, engaging pacing, studio microphone quality with subtle audio compression.',
            },
          ],
        },
        {
          id: 'lesson-4',
          moduleId: 'module-1',
          lessonNumber: '০৪',
          title: 'Agentic Motion Graphic Workflow কোডিং + প্রিভিউ + রেন্ডারিং',
          titleEn: 'Agentic Motion Graphic Workflow: Coding, Preview & Rendering',
          duration: '১২:০০',
          durationSeconds: 720,
          youtubeId: 'dtAxiyd5TTM',
          summary: 'এজেন্টিক ওয়ার্কফ্লো ব্যবহার করে কোড-বেসড মোশন অ্যানিমেশন, রিয়েল-টাইম প্রিভিউ এবং হাই-কোয়ালিটি রেন্ডারিং পাইপলাইন।',
          keyPoints: [
            'এজেন্টিক এআই কোডিং দিয়ে মোশন এলিমেন্ট নিয়ন্ত্রণ',
            'লাইভ প্রিভিউ ও ফ্রেম-বাই-ফ্রেম অ্যাডজাস্টমেন্ট',
            'ক্রিস্টাল ক্লিয়ার কোয়ালিটিতে দ্রুত রেন্ডারিং ও এক্সপোর্ট',
          ],
          resources: [
            {
              id: 'res-4-1',
              title: 'motion-style-kit-v2.zip',
              type: 'zip',
              size: 'ZIP ফাইল',
              downloadUrl: 'https://founders.com.bd/attachments/29',
              description: 'মোশন গ্রাফিক্স স্টাইল কিট v2 (রেন্ডারিং ও প্রজেক্ট ফাইল)',
            },
            {
              id: 'res-4-2',
              title: 'Add Emotion _ Project Setup _ Voice to Motion Graphic File 01 .html',
              type: 'html',
              size: 'HTML / সোর্স ফাইল',
              downloadUrl: 'https://founders.com.bd/attachments/48',
              description: 'Add Emotion ও প্রোজেক্ট সেটআপ - Voice to Motion Graphic ফাইল ০১ (আপডেটেড)',
            },
          ],
        },
        {
          id: 'lesson-5',
          moduleId: 'module-1',
          lessonNumber: '০৫',
          title: 'ক্যামেরা দিয়ে রেকর্ড করা ভিডিও কিভাবে ইডিট করাবেন?',
          titleEn: 'How to Edit Camera Recorded Footage with AI',
          duration: '১০:০০',
          durationSeconds: 600,
          youtubeId: 'cQP_gONg9PY',
          summary: 'মোবাইল বা ক্যামেরা দিয়ে রেকর্ড করা র ভিডিও এআই টুলের মাধ্যমে সিনেমাটিক লেভেলে এডিটিং ও ক্যারেক্টার এনহ্যান্সমেন্ট।',
          keyPoints: [
            'ক্যামেরা ফুটেজের লাইটিং ও ফেস কারেকশন',
            'ক্যারেক্টার শিট দিয়ে পার্সোনালিটি ও হেডশট সিঙ্ক',
            'ব্যাকগ্রাউন্ড নয়েজ ক্লিন ও প্রফেশনাল কালার ব্যালেন্স',
          ],
          resources: [
            {
              id: 'res-5-1',
              title: 'Character Sheet _ Project Setup _ HeadShot Video File 02.html',
              type: 'html',
              size: 'HTML / সোর্স ফাইল',
              downloadUrl: 'https://founders.com.bd/attachments/47',
              description: 'Character Sheet ও প্রোজেক্ট সেটআপ - HeadShot Video ফাইল ০২',
            },
          ],
        },
        {
          id: 'lesson-6',
          moduleId: 'module-1',
          lessonNumber: '০৬',
          title: 'কিভাবে স্টোরি ভিত্তিক B-Roll ফুটেজ জেনারেট করবেন ?',
          titleEn: 'Generating Story-Driven B-Roll Footage with AI',
          duration: '০৯:০০',
          durationSeconds: 540,
          youtubeId: 'B4upW6VGrNY',
          summary: 'ভিডিওর গল্পের সাথে সামঞ্জস্য রেখে পারফেক্ট সিনেমাটিক B-Roll ভিডিও ক্লিপ এআই দিয়ে নিখুঁতভাবে তৈরি।',
          keyPoints: [
            'স্ক্রিপ্টের সিন অনুযায়ী B-Roll প্রম্পট ইঞ্জিনিয়ারিং',
            'ক্যামেরা মুভমেন্ট ও ডাইনামিক লাইটিং কন্ট্রোল',
            'ভিডিওতে B-Roll প্লেসমেন্ট ও পেসিং স্ট্র্যাটেজি',
          ],
          prompts: [
            {
              id: 'p-6',
              tool: 'Runway Gen-3',
              title: 'Cinematic B-Roll Macro Shot',
              prompt: 'Extreme close up cinematic macro shot of hands working on high-tech luminous interface, shallow depth of field, neon particles drifting, moody anamorphic lens --ar 16:9',
            },
          ],
        },
        {
          id: 'lesson-7',
          moduleId: 'module-1',
          lessonNumber: '০৭',
          title: 'কিভাবে ভিডিওতে স্টোরিটেলিং ইডিট করতে হয়',
          titleEn: 'How to Master Storytelling Video Editing',
          duration: '০৮:০০',
          durationSeconds: 480,
          youtubeId: 'U9Js-BfHlfc',
          summary: 'দর্শকের মনোযোগ ধরে রাখতে স্টোরিটেলিং আর্ট, হুক পেসিং, ট্রানজিশন ও সিনেমাটিক মোশন রিদম তৈরি।',
          keyPoints: [
            'প্রথম ৩ সেকেন্ডের ভাইরাল হুক ও ভিজ্যুয়াল স্টোরিটেলিং',
            'সিন-বাই-সিন রিদম ও ইমোশনাল পিক তৈরি',
            'সাউন্ড ইফেক্ট ও ট্রানজিশনের নিখুঁত ব্যালেন্স',
          ],
        },
        {
          id: 'lesson-8',
          moduleId: 'module-1',
          lessonNumber: '০৮',
          title: 'AI দিয়ে বিফোর-আফটার শোকেস ভিডিও বানানো',
          titleEn: 'Creating Before-After Showcase Videos with AI',
          duration: '০৭:০০',
          durationSeconds: 420,
          youtubeId: 'uh7vLmStnTc',
          summary: 'ক্লায়েন্টকে ইমপ্রেস করার মতো হাই-কনভার্টিং বিফোর-আফটার শোকেস ও পোর্টফোলিও ভিডিও তৈরির কৌশল।',
          keyPoints: [
            'স্মুথ ওয়াইপ ও স্প্লিট-স্ক্রিন মোশন এফেক্ট',
            'ক্লায়েন্ট কেস স্টাডি ভিজ্যুয়ালাইজেশন',
            'সোশ্যাল মিডিয়ায় পোর্টফোলিও শোকেসিং স্ট্র্যাটেজি',
          ],
        },
        {
          id: 'lesson-9',
          moduleId: 'module-1',
          lessonNumber: '০৯',
          title: 'json প্রোম্পট দিয়ে কিভাবে প্রোডাক্টের প্রিমিয়াম ফুটেজ জেনারেট করবেন?',
          titleEn: 'Generating Premium Product Footage Using JSON Prompts',
          duration: '০৮:০০',
          durationSeconds: 480,
          youtubeId: 'B4upW6VGrNY',
          summary: 'স্ট্রাকচার্ড JSON প্রম্পট ব্যবহার করে ই-কমার্স ও ডিজিটাল প্রোডাক্টের জন্য আল্ট্রা-রিয়েলিস্টিক 3D প্রোডাক্ট রিভিল ফুটেজ তৈরি।',
          keyPoints: [
            'JSON প্রম্পট স্ট্রাকচার ও অবজেক্ট কন্ট্রোল প্যারামিটার',
            'স্টুডিও লাইটিং, রিফ্লেকশন ও ক্যামেরা স্পিন সেটআপ',
            'ব্র্যান্ডের জন্য রেডি-টু-ইউজ কমার্শিয়াল প্রোডাক্ট ফুটেজ',
          ],
          prompts: [
            {
              id: 'p-9',
              tool: 'Kling AI',
              title: 'JSON-Structured 3D Product Reveal',
              prompt: '{\n  "subject": "sleek minimalist matte black smartwatch",\n  "lighting": "soft cinematic rim light with purple neon accent",\n  "camera": "slow 360 orbit rotation with macro lens blur",\n  "surface": "dark reflective obsidian marble",\n  "quality": "photorealistic 8k commercial"\n}',
            },
          ],
        },
        {
          id: 'lesson-10',
          moduleId: 'module-1',
          lessonNumber: '১০',
          title: 'কিভাবে ক্লায়েন্টের কাছে বেশি চার্জ করবেন? Value & Pricing strategy',
          titleEn: 'How to Charge Higher Rates: Value & Pricing Strategy',
          duration: '০৭:০০',
          durationSeconds: 420,
          youtubeId: 'B4upW6VGrNY',
          summary: 'এআই ভিডিও ও মোশন গ্রাফিক্স সার্ভিসে প্রিমিয়াম প্রাইসিং, হাই-টিকেটিং ক্লায়েন্ট পিচ ও ভ্যালু বেসড অফার মেকিং।',
          keyPoints: [
            'ঘণ্টার হিসেব বাদ দিয়ে ভ্যালু-বেসড প্রাইসিং মডেল',
            'দেশি ও বিদেশি ক্লায়েন্টদের জন্য প্রপোজাল তৈরি',
            'রেগুলার হাই-পেয়িং ক্লায়েন্ট রিটেইনার পাওয়ার মেথড',
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: 'কোর্সের মূল্য কি সত্যিই মাত্র ১৯৯ টাকা?',
      a: 'হ্যাঁ, কোর্সটির মূল্য সম্পূর্ণ এককালীন মাত্র ১৯৯ টাকা! কোনো মাসিক ফি, হিডেন চার্জ বা ভবিষ্যতে অতিরিক্ত কোনো পেমেন্ট লাগবে না। এটি আমাদের বিশেষ লঞ্চ ডিসকাউন্ট।',
    },
    {
      q: 'কোর্সের মোট সময় এবং কয়টি ভিডিও রয়েছে?',
      a: 'কোর্সটিতে সর্বমোট ১০টি এক্সক্লুসিভ প্র্যাক্টিক্যাল ক্লাস রয়েছে, যার মোট সময়সীমা প্রায় ১ ঘণ্টা ৩০ মিনিট (দেড় ঘণ্টা)। সম্পূর্ণ অপ্রয়োজনীয় বকবক মুক্ত, টু-দ্য-পয়েন্ট হ্যান্ডস-অন টিউটোরিয়াল।',
    },
    {
      q: 'কোর্স কেনার পর আমি কীভাবে ভিডিও দেখতে পারব?',
      a: 'কোর্স কেনার সাথে সাথেই আপনার এই ব্রাউজারে কোর্সটি সক্রিয় হয়ে যাবে। আপনি সাথে সাথে সমস্ত ভিডিও প্লে করতে পারবেন। কোনো পাসওয়ার্ড ছাড়াই তাৎক্ষণিক দেখতে পারবেন, এবং পরবর্তীতে অন্য ডিভাইসে দেখতে একটি পাসওয়ার্ড সেট করে নিতে পারবেন।',
    },
    {
      q: 'ফ্রি ডেমো ভিডিওটি আমি কীভাবে দেখতে পারব?',
      a: 'কোর্স পেজে "ফ্রি ডেমো দেখুন" বাটনে ক্লিক করলেই সরাসরি প্রথম ক্লাসটি সম্পূর্ণ ফ্রিতে দেখতে পারবেন।',
    },
    {
      q: 'ভিডিও দেখা চলাকালীন মাঝপথে কেটে দিলে পরবর্তীতে কি সেখান থেকেই শুরু হবে?',
      a: 'হ্যাঁ! আমাদের স্মার্ট প্লেয়ার আপনার প্রতিটি ভিডিওর ঠিক কত মিনিট কত সেকেন্ড দেখা হয়েছে তা স্বয়ংক্রিয়ভাবে সেভ করে রাখে। পরবর্তীতে প্লে করলে ঠিক সেই সেকেন্ড থেকেই ভিডিও শুরু হবে।',
    },
    {
      q: 'সোর্স ফাইল ও প্রম্পটগুলো কি সম্পূর্ণ ফ্রি?',
      a: 'হ্যাঁ! কোর্সের সমস্ত রিসোর্স ফাইল, ৫০০+ সিনেমাটিক সাউন্ড FX প্যাক, কালার প্রিসেট এবং টেস্টেড এআই প্রম্পটগুলো আপনি ১-ক্লিকেই সম্পূর্ণ ফ্রিতে ডাউনলোড ও কপি করতে পারবেন। কোনো অতিরিক্ত টাকা লাগবে না।',
    },
    {
      q: 'পেমেন্ট কীভাবে করতে হবে?',
      a: 'আপনি বিকাশ (bKash), নগদ (Nagad) অথবা রকেটের মাধ্যমে খুব সহজেই পেমেন্ট করতে পারবেন। পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই কোর্সটি তাৎক্ষণিক সক্রিয় হয়ে যাবে।',
    },
  ],
  reviews: [
    {
      name: 'তানভীর হাসান',
      role: 'ইউটিউবার ও কনটেন্ট ক্রিয়েটর',
      rating: 5,
      comment: '১৯৯ টাকায় এমন টু-দ্য-পয়েন্ট কোর্স পাওয়া ভাগ্যের ব্যাপার! দেড় ঘণ্টার এই ১০টি ক্লাসে যা পেয়েছি তা অনেক ১০ ঘণ্টার কোর্সেও নেই। Runway আর Kling AI দিয়ে এখন চোখের পলকে ক্লিপ বানাতে পারি।',
      date: '৩ দিন আগে',
    },
    {
      name: 'ফারহানা ইসলাম',
      role: 'ফ্রিল্যান্স মোশন ডিজাইনার',
      rating: 5,
      comment: 'Midjourney দিয়ে ব্যাকগ্রাউন্ড বানিয়ে ৩D প্যারালাক্স অ্যানিমেশন করার টেকনিকটা জাস্ট ওয়াও! বাংলা ফন্ট এবং প্লেয়ারের ডিজাইন অনেক পরিষ্কার ও আধুনিক।',
      date: '১ সপ্তাহ আগে',
    },
    {
      name: 'সাকিব আল মাহমুদ',
      role: 'ডিজিটাল মার্কেটার',
      rating: 5,
      comment: 'প্লেয়ারে যেখান থেকে পজ করেছি ঠিক সেখান থেকেই শুরু হওয়াটা দুর্দান্ত ফিচার। সাউন্ড FX প্যাক আর প্রম্পটগুলো অনেক কাজে লেগেছে। হাইলি রেকমেন্ডেড!',
      date: '২ সপ্তাহ আগে',
    },
  ],
};

export function courseToProduct(course: CourseData = AI_MOTION_COURSE): Product {
  return {
    id: course.id,
    name: course.title,
    slug: course.slug,
    shortDescription: course.tagline,
    description: `${course.title} - ${course.tagline}. Complete hands-on masterclass with 10 practical lessons (1.30 hours), resources, and lifetime access.`,
    category: 'courses',
    subcategory: 'AI Video Editing',
    price: course.price,
    compareAtPrice: course.originalPrice,
    featured: true,
    newProduct: true,
    images: [],
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    deliveryType: 'instant-download',
    productType: 'digital_download',
    deliveryDescription: 'Instant course portal access upon purchase verification',
    features: [
      '১০টি পূর্ণাঙ্গ প্র্যাকটিক্যাল ক্লাস (১ ঘণ্টা ৩০ মিনিট)',
      'Runway Gen-3, Kling AI, Luma & Midjourney পাইপলাইন',
      'Advanced Agentic Video Editing ওয়ার্কফ্লো',
      'সম্পূর্ণ ফ্রি প্রজেক্ট ফাইল ও সিনেমাটিক সাউন্ড FX প্যাক',
      'আজীবন এক্সেস ও নিয়মিত লেটেস্ট আপডেট',
      'সার্টিফিকেট অব কমপ্লিশন',
    ],
    whatsIncluded: [
      'সম্পূর্ণ অনলাইন কোর্স এক্সেস',
      'কোর্স প্লেয়ার উইথ অটো-রিজিউম ও প্রগ্রেস ট্র্যাকার',
      '৫০০+ সিনেমাটিক সাউন্ড FX ও BGM কালেকশন (ফ্রি)',
      'মাস্টার এআই প্রম্পট লাইব্রেরি',
      'ভিআইপি সাপোর্ট ও কমিউনিটি এক্সেস',
    ],
    faq: course.faqs.map((f) => ({ question: f.q, answer: f.a })),
    icon: 'Film',
    accent: 'brand',
    descriptor: '১ ঘণ্টা ৩০ মিনিট • ১০টি ক্লাস • আজীবন এক্সেস',
  };
}
