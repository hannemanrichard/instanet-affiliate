// Domain Entities for Products feature
import type { ProductCategory } from "./valueObjects";

export interface ProductEntity {
  id: number;
  name: string;
  description?: string;
  retail_price: number;
  retail_price_2?: number | null;
  retail_price_3?: number | null;
  category?: ProductCategory;
  thumbnail?: string;
  retail_commission?: number;
  wholesale_price?: number;
  wholesale_commission?: number;
  weight?: number;
  created_at: string;
  updated_at?: string;
}

export interface ProductItemEntity {
  id: number;
  product_id: number;
  product?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  thumbnail?: string;
  cog?: number;
  quantity?: number;
  created_at?: string;
}

export interface ProductPageEntity {
  id: number;
  product_id: number;
  slug: string;
  headline: string;
  subheadline?: string;
  description?: string;
  hero_media: ProductPageHeroMedia[];
  seo_metadata?: Record<string, unknown>;
  is_active: boolean;
  is_affiliate_friendly: boolean;
  is_freeshipping: boolean;
  promo_point: number;
  video_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductPageItemEntity {
  product_page_id: number;
  item_id: number;
  display_order?: number;
}

export interface ProductCatalogEntry {
  id: number;
  name: string;
  description?: string;
  price?: number;
  total_stock?: number;
  primary_image?: string;
  category?: ProductCategory;
  created_at?: string;
}

export interface ProductInventorySnapshot {
  product_id: number;
  in_stock: number;
  ordered: number;
  in_delivery: number;
  delivered: number;
}

export interface ProductPageWithRelations {
  page: ProductPageEntity;
  product: ProductEntity;
  items: ProductItemEntity[];
  pageItems: ProductPageItemEntity[];
  images?: ProductPageImageEntity[];
  testimonials?: ProductPageTestimonialEntity[];
  assets?: ProductPageAssetEntity[];
}

export interface ProductInventoryAdjustment {
  itemId: number;
  quantity: number;
}

export interface ProductPageHeroMedia {
  url: string;
  alt_text?: string;
  position?: number;
  is_primary?: boolean;
}

export interface ProductPageImageEntity {
  id: number;
  product_page_id: number;
  url: string;
}

export interface ProductPageTestimonialEntity {
  id: number;
  product_page_id: number;
  url: string;
}

export type ProductPageAssetMediaType = "image" | "video";

export interface ProductPageAssetEntity {
  id: number;
  product_page_id: number;
  url: string;
  media_type: ProductPageAssetMediaType;
  file_name?: string | null;
}