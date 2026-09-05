import { z } from "zod";

const optionalTrimmedString = z.string().trim().max(500).optional();
const optionalLongString = z.string().trim().max(5000).optional();

export const leadItemInputSchema = z.object({
  item_id: z.number().int().positive(),
  qty: z.number().int().positive(),
});

const leadWritableFieldsSchema = z.object({
  first_name: optionalTrimmedString,
  last_name: optionalTrimmedString,
  phone: optionalTrimmedString,
  address: optionalTrimmedString,
  commune: optionalTrimmedString,
  wilaya: optionalTrimmedString,
  channel: optionalTrimmedString,
  comment: optionalLongString,
  color: optionalTrimmedString,
  size: optionalTrimmedString,
  product: optionalTrimmedString,
  status: optionalTrimmedString,
  objective: optionalTrimmedString,
  offer: optionalTrimmedString,
  price: optionalTrimmedString,
  agent_id: z.number().int().positive().optional(),
  partner_id: z.number().int().positive().optional(),
  has_recourse: z.boolean().optional(),
  is_abondoned: z.boolean().optional(),
  is_moved: z.boolean().optional(),
  is_wholesale: z.boolean().optional(),
});

export const createLeadFieldsSchema = leadWritableFieldsSchema;

export const updateLeadFieldsSchema = leadWritableFieldsSchema.partial();

export const createLeadBodySchema = z.object({
  lead: createLeadFieldsSchema,
  items: z.array(leadItemInputSchema).max(50).optional(),
});

export const updateLeadBodySchema = z
  .object({
    lead: updateLeadFieldsSchema.optional(),
    items: z.array(leadItemInputSchema).max(50).optional(),
  })
  .refine((body) => body.lead != null || body.items != null, {
    message: "Lead update payload is required",
  });

export const replaceLeadItemsBodySchema = z.object({
  items: z.array(leadItemInputSchema).max(50),
});

export const createLeadHopBodySchema = z.object({
  lead_id: z.number().int().positive(),
  agent_id: z.number().int().positive(),
});

export const updateLeadHopBodySchema = z
  .object({
    lead_id: z.number().int().positive().optional(),
    agent_id: z.number().int().positive().optional(),
  })
  .strict();

export const listLeadsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.string().trim().max(100).optional(),
  search: z.string().trim().max(200).optional(),
});

export const leadHopsQuerySchema = z.object({
  leadId: z.coerce.number().int().positive().optional(),
  agentId: z.coerce.number().int().positive().optional(),
});

/** Public storefront lead submit — allowlisted fields only. */
export const publicLeadFieldsSchema = z
  .object({
    first_name: optionalTrimmedString,
    last_name: optionalTrimmedString,
    phone: optionalTrimmedString,
    address: optionalTrimmedString,
    commune: optionalTrimmedString,
    wilaya: optionalTrimmedString,
    channel: optionalTrimmedString,
    comment: optionalLongString,
    color: optionalTrimmedString,
    size: optionalTrimmedString,
    product: optionalTrimmedString,
    objective: optionalTrimmedString,
    offer: optionalTrimmedString,
    price: optionalTrimmedString,
    is_abondoned: z.boolean().optional(),
    is_moved: z.boolean().optional(),
    is_wholesale: z.boolean().optional(),
    has_recourse: z.boolean().optional(),
  })
  .refine((lead) => Boolean(lead.phone?.trim() || lead.first_name?.trim()), {
    message: "Lead requires at least phone or first_name",
  });

export const publicLeadBodySchema = z.object({
  lead: publicLeadFieldsSchema,
  items: z
    .array(
      z.object({
        item_id: z.coerce.number().int().positive(),
        qty: z.coerce.number().int().positive(),
      })
    )
    .max(50)
    .optional(),
  ref: z.union([z.string().trim().max(100), z.number().int().positive()]).optional(),
});
