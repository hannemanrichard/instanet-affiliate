import { z } from "zod";
import type { ProductEntity } from "./entities";

export const productFormSchema = z.object({
  name: z.string().min(1).max(500),
  description: z.string().max(20000).optional(),
  retail_price: z.number().min(0),
  retail_price_2: z.number().min(0).optional().nullable(),
  retail_price_3: z.number().min(0).optional().nullable(),
  category: z.string().max(200).optional(),
  thumbnail: z.string().max(2000).optional(),
  retail_commission: z.number().min(0).optional(),
  wholesale_price: z.number().min(0).optional(),
  wholesale_commission: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
}) satisfies z.ZodType<Omit<ProductEntity, "id" | "created_at" | "updated_at">>;

export const updateProductSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().max(20000).optional(),
  retail_price: z.number().min(0).optional(),
  retail_price_2: z.number().min(0).optional().nullable(),
  retail_price_3: z.number().min(0).optional().nullable(),
  category: z.string().max(200).optional(),
  thumbnail: z.string().max(2000).optional(),
  retail_commission: z.number().min(0).optional(),
  wholesale_price: z.number().min(0).optional(),
  wholesale_commission: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
}) satisfies z.ZodType<Partial<Omit<ProductEntity, "id" | "created_at" | "updated_at">>>;

const heroMediaSchema = z.object({
  url: z.string().url().max(2000),
  alt_text: z.string().max(500).optional(),
  position: z.number().int().nonnegative().optional(),
  is_primary: z.boolean().optional(),
});

const productPageFieldsSchema = z.object({
  product_id: z.number().int().positive(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i, "Invalid slug"),
  headline: z.string().trim().min(1).max(500),
  subheadline: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(20000).optional(),
  hero_media: z.array(heroMediaSchema).max(20).default([]),
  seo_metadata: z.record(z.unknown()).optional(),
  is_active: z.boolean(),
  is_affiliate_friendly: z.boolean(),
  is_freeshipping: z.boolean(),
  promo_point: z.number().finite().nonnegative(),
  video_url: z
    .union([z.string().url().max(2000), z.literal(""), z.undefined()])
    .optional(),
});

const partialProductPageFieldsSchema = productPageFieldsSchema.partial().extend({
  id: z.number().int().positive().optional(),
});

const productItemPartialSchema = z.object({
  id: z.number().int().positive(),
  product_id: z.number().int().positive().optional(),
  product: z.string().max(500).optional(),
  color: z.string().max(100).optional(),
  colorHex: z.string().max(20).optional(),
  size: z.string().max(100).optional(),
  thumbnail: z.string().max(2000).optional(),
  cog: z.number().finite().optional(),
  quantity: z.number().int().optional(),
});

const pageItemSchema = z.object({
  product_page_id: z.number().int().positive(),
  item_id: z.number().int().positive(),
  display_order: z.number().int().nonnegative().optional(),
});

export const createProductPageBodySchema = z.object({
  page: productPageFieldsSchema,
  itemIds: z.array(z.number().int().positive()).max(100).optional(),
  gallery: z.array(z.string().url().max(2000)).max(50).optional(),
  testimonials: z.array(z.string().url().max(2000)).max(50).optional(),
});

export const updateProductPageBodySchema = partialProductPageFieldsSchema;

export const updateProductPageWithRelationsBodySchema = z.object({
  page: partialProductPageFieldsSchema.optional(),
  itemIds: z.array(z.number().int().positive()).max(100).optional(),
  gallery: z.array(z.string().url().max(2000)).max(50).optional(),
  testimonials: z.array(z.string().url().max(2000)).max(50).optional(),
});

export const updateProductWithRelationsBodySchema = z.object({
  product: updateProductSchema.optional(),
  items: z.array(productItemPartialSchema).max(100).optional(),
  page: partialProductPageFieldsSchema
    .extend({ id: z.number().int().positive() })
    .optional(),
  pageItems: z.array(pageItemSchema).max(100).optional(),
  pageGallery: z
    .object({
      pageId: z.number().int().positive(),
      urls: z.array(z.string().url().max(2000)).max(50),
    })
    .optional(),
  pageTestimonials: z
    .object({
      pageId: z.number().int().positive(),
      testimonials: z.array(z.string().url().max(2000)).max(50),
    })
    .optional(),
});

export const productInventoryAdjustmentsBodySchema = z.object({
  adjustments: z
    .array(
      z.object({
        itemId: z.number().int().positive(),
        quantity: z.number().int(),
      })
    )
    .min(1)
    .max(200),
});

export const catalogSearchQuerySchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
});
