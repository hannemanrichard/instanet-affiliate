import { z } from "zod";

export const updateSettingBodySchema = z.object({
  key: z.string().trim().min(1).max(200),
  value: z.union([z.string().max(5000), z.null()]).optional(),
});
