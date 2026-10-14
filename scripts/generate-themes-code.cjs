const fs = require('fs');
const path = require('path');

const rawItems = JSON.parse(fs.readFileSync(path.join(__dirname, 'scraped-weadown-themes.json'), 'utf-8'));

const prices = [490, 450, 590, 550, 390, 490, 450, 590, 390, 490, 550, 450, 490, 590, 450, 390, 490, 550, 450, 390, 590, 490, 550, 450];
const comparePrices = [2490, 1990, 2990, 2750, 1800, 2500, 2200, 2900, 1750, 2400, 2800, 2300, 2500, 3100, 2100, 1650, 2400, 2850, 2200, 1850, 2990, 2500, 2800, 2250];

const products = rawItems.map((item, idx) => {
  const isFeatured = idx < 8; // Top 8 featured for homepage
  const price = prices[idx % prices.length];
  const compareAtPrice = comparePrices[idx % comparePrices.length];

  return {
    id: `wp-${item.slug}`,
    name: item.name,
    slug: item.slug,
    shortDescription: item.shortDescription,
    description: item.description,
    category: 'WordPress',
    subcategory: 'Themes',
    price: price,
    compareAtPrice: compareAtPrice,
    previousPrice: compareAtPrice,
    featured: isFeatured,
    newProduct: true,
    badge: isFeatured ? 'featured' : 'new',
    icon: 'ShoppingBag',
    accent: 'brand',
    descriptor: item.shortDescription.slice(0, 120),
    thumbnail: item.imageUrl || '',
    images: item.imageUrl ? [
      { id: `${item.slug}-thumb`, url: item.imageUrl, alt: item.name }
    ] : [],
    deliveryType: 'instant-download',
    productType: 'digital_download',
    version: item.version || '1.0.0',
    compatibility: 'WordPress 6.0+, WooCommerce, Elementor, Gutenberg',
    requirements: 'WordPress 6.0+, PHP 8.0 or 8.1+, MySQL 5.7+ or MariaDB 10.4+',
    supportPeriod: 'Lifetime updates and community documentation',
    updatePolicy: 'Future theme version updates are included',
    deliveryDescription: 'Instant demo access. Verified theme file link will be provided in your dashboard upon review.',
    features: [
      'Genuine, clean & 100% GPL licensed WordPress theme',
      'Modern, mobile-responsive layout for all devices',
      'Elementor and WordPress block editor (Gutenberg) ready',
      'Built-in performance and search engine optimization (SEO)',
      'Pre-built demo layouts and templates ready for 1-click import'
    ],
    whatsIncluded: [
      `${item.name} Installable Package`,
      'Demo Download Entitlement (Test Verification)',
      'Complete Setup & Installation Guide',
      'Lifetime Future Updates Access'
    ],
    faq: [
      {
        question: 'Is this theme authentic and clean?',
        answer: 'Yes, this theme package is 100% authentic, untouched, and scanned clean under the GNU General Public License (GPL).'
      },
      {
        question: 'How do I download the theme files?',
        answer: 'Currently demo entitlement is granted with the order. The permanent download link will be available in your customer dashboard.'
      }
    ],
    seoTitle: `${item.name} Download | bdBeginner`,
    seoDescription: `Get ${item.name} at an affordable price from bdBeginner. 100% clean, verified, and secure WordPress theme.`
  };
});

const tsContent = `import type { Product } from '@/types';

export const realWordPressThemes: Product[] = ${JSON.stringify(products, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/data/wordpressThemes.ts'), tsContent, 'utf-8');
console.log(`Generated src/data/wordpressThemes.ts with ${products.length} real themes!`);
