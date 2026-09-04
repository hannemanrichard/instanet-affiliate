import { z } from "zod";

export const metaConversionBodySchema = z.object({
  eventType: z.enum(["Purchase", "Lead"]),
  eventData: z.object({
    value: z.number().finite().optional(),
    currency: z.string().trim().max(10).optional(),
    content_name: z.string().trim().max(500).optional(),
    content_ids: z.array(z.string().max(200)).max(100).optional(),
    num_items: z.number().int().nonnegative().optional(),
    userData: z
      .object({
        em: z.array(z.string().max(320)).max(20).optional(),
        ph: z.array(z.string().max(50)).max(20).optional(),
        fn: z.array(z.string().max(200)).max(20).optional(),
        ln: z.array(z.string().max(200)).max(20).optional(),
        external_id: z.array(z.string().max(200)).max(20).optional(),
        client_ip_address: z.string().max(100).optional(),
        client_user_agent: z.string().max(1000).optional(),
        fbp: z.string().max(500).optional(),
        fbc: z.string().max(500).optional(),
      })
      .optional(),
    eventId: z.string().max(200).optional(),
    eventSourceUrl: z.string().url().max(2000).optional(),
  }),
});

export const updateClerkUserBodySchema = z.object({
  userId: z.string().min(1).max(200),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
});
