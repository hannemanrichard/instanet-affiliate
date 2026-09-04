import { z } from "zod";

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be yyyy-MM-dd");

export const dashboardOverviewQuerySchema = z.object({
  from: isoDateSchema,
  to: isoDateSchema,
  preset: z
    .enum([
      "last_7_days",
      "last_14_days",
      "last_30_days",
      "last_90_days",
      "this_month",
    ])
    .optional()
    .default("last_30_days"),
});
