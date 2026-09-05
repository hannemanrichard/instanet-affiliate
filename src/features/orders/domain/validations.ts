import { z } from "zod";

const optionalTrimmedString = z.string().trim().max(500).optional();
const optionalLongString = z.string().trim().max(5000).optional();

export const orderItemInputSchema = z.object({
  item_id: z.number().int().positive(),
  qty: z.number().int().positive().optional(),
  product_page_id: z.number().int().positive().optional(),
});

/** Partner-writable fields on create (privileged fields omitted). */
export const createOrderFieldsSchema = z.object({
  first_name: optionalTrimmedString,
  last_name: optionalTrimmedString,
  phone: optionalTrimmedString,
  phone2: optionalTrimmedString,
  address: optionalTrimmedString,
  commune: optionalTrimmedString,
  wilaya: optionalTrimmedString,
  channel: optionalTrimmedString,
  comment: optionalLongString,
  objective: optionalTrimmedString,
  delivery_notes: z.number().finite().optional(),
  product: optionalTrimmedString,
  product_color: optionalTrimmedString,
  product_size: optionalTrimmedString,
  product_qty: z.number().int().positive().optional().default(1),
  is_exchange_required: z.boolean().optional().default(false),
  is_exchange: z.boolean().optional(),
  has_exchange: z.boolean().optional(),
  has_defect: z.boolean().optional().default(false),
  is_free_shipping: z.boolean().optional(),
  is_stopdesk: z.boolean().optional(),
  is_wholesale: z.boolean().optional(),
  stopdesk: optionalTrimmedString,
});

/** Partner-writable fields on update (no product_price / status). */
export const updateOrderFieldsSchema = z.object({
  first_name: optionalTrimmedString,
  last_name: optionalTrimmedString,
  phone: optionalTrimmedString,
  phone2: optionalTrimmedString,
  address: optionalTrimmedString,
  commune: optionalTrimmedString,
  wilaya: optionalTrimmedString,
  channel: optionalTrimmedString,
  comment: optionalLongString,
  objective: optionalTrimmedString,
  delivery_fees: z.number().finite().optional(),
  delivery_notes: z.number().finite().optional(),
  product: optionalTrimmedString,
  product_color: optionalTrimmedString,
  product_size: optionalTrimmedString,
  product_qty: z.number().int().positive().optional(),
  shipping_price: z.number().finite().nonnegative().optional(),
  is_exchange_required: z.boolean().optional(),
  is_exchange: z.boolean().optional(),
  has_exchange: z.boolean().optional(),
  has_defect: z.boolean().optional(),
  is_free_shipping: z.boolean().optional(),
  is_stopdesk: z.boolean().optional(),
  is_wholesale: z.boolean().optional(),
  stopdesk: optionalTrimmedString,
});

export const orderDeliveryLocationSchema = z.object({
  wilayaId: z.string().trim().min(1).max(100),
  communeId: z.string().trim().min(1).max(100),
  agencyId: z.string().trim().min(1).max(100).optional(),
});

export const createOrderBodySchema = z.object({
  order: createOrderFieldsSchema,
  items: z.array(orderItemInputSchema).max(50).optional(),
  productId: z.number().int().positive().optional(),
  deliveryLocation: orderDeliveryLocationSchema.optional(),
  discount: z.number().finite().nonnegative().optional(),
});

export const updateOrderBodySchema = z
  .object({
    order: updateOrderFieldsSchema.optional(),
    items: z.array(orderItemInputSchema).max(50).optional(),
    status: z.unknown().optional(),
  })
  .refine((body) => body.order != null || body.items != null, {
    message: "Order update payload is required",
  });

export const replaceOrderItemsBodySchema = z.object({
  items: z.array(orderItemInputSchema).max(50),
});

export const listOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  status: z.string().trim().max(100).optional(),
  search: z.string().trim().max(200).optional(),
});

/** @deprecated Prefer createOrderFieldsSchema */
export const createOrderRequestSchema = createOrderFieldsSchema;
