import { z } from "zod";
import type { ProductEntity } from "./entities";

export const productFormSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  retail_price: z.number().min(0),
  retail_price_2: z.number().min(0).optional().nullable(),
  retail_price_3: z.number().min(0).optional().nullable(),
  category: z.string().optional(),
  thumbnail: z.string().optional(),
  retail_commission: z.number().min(0).optional(),
  wholesale_price: z.number().min(0).optional(),
  wholesale_commission: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
}) satisfies z.ZodType<Omit<ProductEntity, "id" | "created_at" | "updated_at">>;

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  retail_price: z.number().min(0).optional(),
  retail_price_2: z.number().min(0).optional().nullable(),
  retail_price_3: z.number().min(0).optional().nullable(),
  category: z.string().optional(),
  thumbnail: z.string().optional(),
  retail_commission: z.number().min(0).optional(),
  wholesale_price: z.number().min(0).optional(),
  wholesale_commission: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
}) satisfies z.ZodType<Partial<Omit<ProductEntity, "id" | "created_at" | "updated_at">>>;

