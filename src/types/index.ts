export * from './reviews';

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
};

export type ProductBadge = 'featured' | 'new';

export type DeliveryType =
  | 'instant-download'
  | 'license-key'
  | 'manual-delivery'
  | 'subscription'
  | 'service';

export type ProductType =
  | 'digital_download'
  | 'license_key'
  | 'subscription'
  | 'manual_delivery'
  | 'service';

export type ProductImage = {
  id: string;
  url: string;
  alt: string;
};

export type ProductFaqItem = {
  question: string;
  answer: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  featured: boolean;
  newProduct: boolean;
  images: ProductImage[];
  thumbnail: string;
  deliveryType: DeliveryType;
  productType: ProductType;
  compatibility?: string;
  requirements?: string;
  version?: string;
  supportPeriod?: string;
  updatePolicy?: string;
  deliveryDescription: string;
  features: string[];
  whatsIncluded: string[];
  faq: ProductFaqItem[];
  seoTitle?: string;
  seoDescription?: string;
  reviewStats?: {
    averageRating: number;
    reviewCount: number;
  };
  /** @deprecated kept for backward compatibility with existing ProductCard */
  badge?: ProductBadge;
  /** @deprecated kept for backward compatibility with existing ProductCard */
  icon: string;
  /** @deprecated kept for backward compatibility with existing ProductCard */
  accent: string;
  /** @deprecated kept for backward compatibility with existing ProductCard */
  descriptor: string;
  /** @deprecated kept for backward compatibility with existing ProductCard */
  previousPrice?: number;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
};

export type TrustItem = {
  title: string;
  description: string;
  icon: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  thumbnail: string;
  icon: string;
  accent: string;
  deliveryType: DeliveryType;
  quantity: number;
};
