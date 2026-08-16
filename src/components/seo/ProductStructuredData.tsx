import { useEffect } from 'react';
import type { Product } from '@/types';
import type { ProductReviewStats, ProductReviewPublic } from '@/types/reviews';
import { applyStructuredData } from '@/lib/seo';

type ProductStructuredDataProps = {
  product: Product;
  reviewStats?: ProductReviewStats | null;
  reviews?: ProductReviewPublic[];
};

export function ProductStructuredData({ product, reviewStats, reviews }: ProductStructuredDataProps) {
  useEffect(() => {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
    const productUrl = `${siteUrl}/products/${product.slug}`;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.seoDescription || product.description,
      image: product.images.length > 0 ? product.images.map(img => img.url) : [product.thumbnail],
      offers: {
        '@type': 'Offer',
        url: productUrl,
        priceCurrency: 'BDT',
        price: product.price,
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'bdBeginner'
        }
      }
    };

    if (reviewStats && reviewStats.review_count > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviewStats.average_rating.toFixed(1),
        reviewCount: reviewStats.review_count
      };
    }

    if (reviews && reviews.length > 0) {
      schema.review = reviews.map(r => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5
        },
        author: {
          '@type': 'Person',
          name: r.reviewer_name
        },
        reviewBody: r.review_text,
        datePublished: new Date(r.created_at).toISOString().split('T')[0]
      }));
    }

    applyStructuredData('product-jsonld', schema);

    return () => {
      applyStructuredData('product-jsonld', null);
    };
  }, [product, reviewStats, reviews]);

  return null;
}
