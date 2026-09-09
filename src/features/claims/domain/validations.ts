import { z } from "zod";
import {
  AFFILIATE_CLAIM_CATEGORIES,
  AFFILIATE_CLAIM_STATUSES,
} from "./entities";

export const createAffiliateClaimAttachmentSchema = z.object({
  file_url: z.string().trim().url(),
  file_name: z.string().trim().max(255).optional(),
  file_type: z.string().trim().max(100).optional(),
});

export const createAffiliateClaimBodySchema = z.object({
  order_id: z.coerce.number().int().positive(),
  category: z.enum(AFFILIATE_CLAIM_CATEGORIES),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(10).max(4000),
  attachments: z.array(createAffiliateClaimAttachmentSchema).max(5).optional(),
});

export const listAffiliateClaimsQuerySchema = z.object({
  status: z.enum(AFFILIATE_CLAIM_STATUSES).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const updateAffiliateClaimStatusBodySchema = z.object({
  status: z.enum(AFFILIATE_CLAIM_STATUSES),
  admin_notes: z.string().trim().max(4000).nullable().optional(),
});

export const affiliateClaimIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
