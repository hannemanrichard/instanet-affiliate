import { z } from "zod";
import { MARKETPLACE_POST_STATUSES } from "./entities";

export const createMarketplacePostBodySchema = z.object({
  product_page_id: z.coerce.number().int().positive(),
  product_title: z.string().trim().min(1).max(255),
  product_price: z.coerce.number().finite().nonnegative(),
  currency: z.string().trim().min(1).max(16).optional().default("DZD"),
  slug: z.string().trim().max(255).optional(),
});

export const listMarketplacePostsQuerySchema = z.object({
  status: z.enum(MARKETPLACE_POST_STATUSES).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(25),
});

export const updateMarketplacePostExtensionBodySchema = z.object({
  status: z.enum(["published", "failed"]),
  location: z.string().trim().max(255).nullable().optional(),
  // Soft-validate URL so a bad/missing link never blocks status updates.
  marketplace_post_url: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => {
      if (!value) return null;
      try {
        const parsed = new URL(value);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          return null;
        }
        return parsed.toString();
      } catch {
        return null;
      }
    }),
  extension_version: z.string().trim().max(64).nullable().optional(),
  error_message: z.string().trim().max(2000).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const marketplacePostIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
