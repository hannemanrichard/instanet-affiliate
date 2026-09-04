export type ProductCategory = string;

export type ProductPageSlug = string;

export type ProductStatus = "active" | "inactive";

export type ProductPageStatus = "draft" | "published";

export type InventoryPhase = "in_stock" | "ordered" | "in_delivery" | "delivered";

export interface ProductSeoMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  [key: string]: unknown;
}

