import type {
  Category,
  Service,
  TrustItem,
  FaqItem,
  DeliveryType,
} from '@/types';

export const categories: Category[] = [
  {
    slug: 'wordpress',
    name: 'WordPress',
    tagline: 'Themes, plugins and templates',
    description: 'Premium WordPress themes, plugins, and templates for every kind of website.',
    icon: 'WordPress',
    color: 'brand',
  },
  {
    slug: 'software',
    name: 'Software',
    tagline: 'Professional tools and utilities',
    description: 'Professional software tools and utilities for productivity and development.',
    icon: 'Code2',
    color: 'ink',
  },
  {
    slug: 'ai-tools',
    name: 'AI Tools',
    tagline: 'AI and productivity solutions',
    description: 'AI-powered tools and productivity solutions for modern workflows.',
    icon: 'Sparkles',
    color: 'accent',
  },
  {
    slug: 'courses',
    name: 'Courses',
    tagline: 'Practical learning resources',
    description: 'Practical, project-based learning resources for developers and creators.',
    icon: 'GraduationCap',
    color: 'success',
  },
  {
    slug: 'digital-resources',
    name: 'Digital Resources',
    tagline: 'Templates, graphics and assets',
    description: 'Downloadable templates, graphics, UI kits, and digital assets.',
    icon: 'FolderOpen',
    color: 'warning',
  },
  {
    slug: 'web-services',
    name: 'Web Services',
    tagline: 'Professional website solutions',
    description: 'Professional website development, redesign, and optimization services.',
    icon: 'Globe',
    color: 'brand',
  },
];

export const deliveryLabels: Record<DeliveryType, string> = {
  'instant-download': 'Instant Download',
  'license-key': 'License Key',
  'manual-delivery': 'Manual Delivery',
  'subscription': 'Subscription',
  'service': 'Service',
};

export const services: Service[] = [
  {
    id: 's1',
    slug: 'wordpress-website-development',
    title: 'WordPress Website Development',
    description: 'Custom WordPress websites built with premium themes and tailored plugins.',
    icon: 'WordPress',
    features: ['Custom theme setup', 'Plugin configuration', 'Responsive design'],
  },
  {
    id: 's2',
    slug: 'business-website-development',
    title: 'Business Website Development',
    description: 'Professional business websites that communicate credibility and trust.',
    icon: 'Building2',
    features: ['Custom design', 'CMS integration', 'SEO-ready structure'],
  },
  {
    id: 's3',
    slug: 'ecommerce-development',
    title: 'E-commerce Development',
    description: 'Full-featured online stores with product management and order tracking.',
    icon: 'ShoppingCart',
    features: ['Store setup', 'Inventory management', 'Order workflow'],
  },
  {
    id: 's4',
    slug: 'landing-page-design',
    title: 'Landing Page Design',
    description: 'High-converting landing pages for product launches and campaigns.',
    icon: 'Layout',
    features: ['Conversion-focused design', 'Fast loading', 'Mobile optimized'],
  },
  {
    id: 's5',
    slug: 'website-redesign',
    title: 'Website Redesign',
    description: 'Modernize your existing website with improved design and performance.',
    icon: 'RefreshCw',
    features: ['UX audit', 'Visual refresh', 'Content migration'],
  },
  {
    id: 's6',
    slug: 'speed-optimization',
    title: 'Speed Optimization',
    description: 'Make your website faster with Core Web Vitals optimization and caching.',
    icon: 'Gauge',
    features: ['Performance audit', 'Caching strategy', 'Image optimization'],
  },
];

export const whyItems: TrustItem[] = [
  {
    title: 'Clear Product Information',
    description: 'Every product listing includes honest descriptions, requirements, and what is included.',
    icon: 'FileText',
  },
  {
    title: 'Transparent Delivery Details',
    description: 'Delivery type and access method are shown on each product before you purchase.',
    icon: 'Truck',
  },
  {
    title: 'After-Sales Assistance',
    description: 'If something is not right with your purchase, our support team is here to help.',
    icon: 'LifeBuoy',
  },
  {
    title: 'Simple Purchase Experience',
    description: 'A straightforward checkout process designed to get you from cart to product quickly.',
    icon: 'ShoppingBag',
  },
];

export const heroTrustItems: TrustItem[] = [
  {
    title: 'Clear Product Details',
    description: 'Honest descriptions',
    icon: 'FileText',
  },
  {
    title: 'Flexible Digital Delivery',
    description: 'Shown per product',
    icon: 'Truck',
  },
  {
    title: 'Responsive Support',
    description: 'We respond and help',
    icon: 'LifeBuoy',
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'How are digital products delivered?',
    answer:
      'After a successful purchase, digital products are made available in your account dashboard. Most items are available for download immediately, while some may include setup instructions or access details.',
  },
  {
    question: 'How long does delivery take?',
    answer:
      'Most digital products are available instantly after payment confirmation. Service-related purchases may involve a follow-up conversation to scope the work before delivery begins.',
  },
  {
    question: 'How does support work?',
    answer:
      'You can reach our support team through the Get Support option in the navigation. We aim to respond to product and order-related questions within one business day.',
  },
  {
    question: 'What should I check before purchasing?',
    answer:
      'We recommend reviewing the product description, requirements, compatibility information, and what is included before purchasing. If anything is unclear, you can ask support before buying.',
  },
  {
    question: 'Are refunds available?',
    answer:
      'Refund eligibility depends on the type of product and the circumstances. Please review our Refund Policy page for details on what qualifies, or contact support if you have concerns about a purchase.',
  },
];
