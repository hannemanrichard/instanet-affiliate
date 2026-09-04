import { z } from "zod";

export const withdrawBodySchema = z.object({
  amount: z.number().finite().positive(),
});
