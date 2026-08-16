export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  thumbnail_url: string | null;
  icon: string | null;
  product_type: string;
  delivery_type: string;
  status: string;
  featured: boolean;
  new_product: boolean;
  version: string | null;
  compatibility: string | null;
  requirements: string | null;
  support_period: string | null;
  update_policy: string | null;
  delivery_description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type ProductFeatureRow = {
  id: string;
  product_id: string;
  feature: string;
  sort_order: number;
};

export type ProductIncludeRow = {
  id: string;
  product_id: string;
  item: string;
  sort_order: number;
};

export type ProductFaqRow = {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  sort_order: number;
};

export type ProductWithCategory = ProductRow & {
  category: CategoryRow;
};

export type ProductWithRelations = ProductRow & {
  category: CategoryRow;
  images: ProductImageRow[];
  features: ProductFeatureRow[];
  includes: ProductIncludeRow[];
  faqs: ProductFaqRow[];
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  subtotal: number;
  discount_total: number;
  total: number;
  currency_code: string;
  payment_method: string;
  payment_status: string;
  status: string;
  invoice_number: string | null;
  invoice_issued_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderEmailLogRow = {
  id: string;
  order_id: string;
  email_type: string;
  recipient: string;
  status: 'success' | 'error' | 'pending';
  attachment: string | null;
  error_message: string | null;
  sent_at: string;
};
