import { z } from "zod";

export const updateInventoryQuantityBodySchema = z.object({
  quantity: z.number().int(),
});

export const inventoryAdjustmentsBodySchema = z.object({
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

export const soldUnitsQuerySchema = z.object({
  fromDate: z.string().trim().min(1).max(40),
  toDate: z.string().trim().min(1).max(40),
});

export const inventoryPhaseDetailsQuerySchema = z.object({
  phases: z
    .string()
    .trim()
    .min(1)
    .transform((value, ctx) => {
      const phases = value
        .split(",")
        .map((phase) => phase.trim())
        .filter(Boolean);
      const allowed = new Set([
        "ordered",
        "in_delivery",
        "delivered",
        "other",
      ]);
      const valid = phases.filter((phase) => allowed.has(phase));
      if (!valid.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one valid phase is required",
        });
        return z.NEVER;
      }
      return valid as Array<
        "ordered" | "in_delivery" | "delivered" | "other"
      >;
    }),
  productName: z.string().trim().max(200).optional(),
});
