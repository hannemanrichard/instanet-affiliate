import type {
  ProductEntity,
  ProductItemEntity,
  ProductPageEntity,
  ProductPageItemEntity,
} from "../domain";

export interface CreateProductVariantInput
  extends Omit<ProductItemEntity, "id" | "product_id" | "quantity"> {
  initialQuantity?: number;
}

export interface CreateProductPayload {
  product: Omit<ProductEntity, "id" | "created_at" | "updated_at">;
  items?: CreateProductVariantInput[];
  page?: Omit<ProductPageEntity, "id" | "created_at" | "updated_at">;
  pageItems?: ProductPageItemEntity[];
  pageGallery?: string[];
  pageTestimonials?: string[];
}

export interface CreateProductPagePayload {
  page: Omit<ProductPageEntity, "id" | "created_at" | "updated_at">;
  itemIds?: number[];
  gallery?: string[];
  testimonials?: string[];
}

export interface UpdateProductPagePayload {
  page?: Partial<ProductPageEntity>;
  itemIds?: number[];
  gallery?: string[];
  testimonials?: string[];
}

export interface UpdateProductPayload {
  product?: Partial<ProductEntity>;
  items?: Array<Partial<ProductItemEntity> & { id: number }>;
  page?: Partial<ProductPageEntity> & { id: number };
  pageItems?: ProductPageItemEntity[];
  pageGallery?: {
    pageId: number;
    urls: string[];
  };
  pageTestimonials?: {
    pageId: number;
    testimonials: string[];
  };
}
