import { z } from "zod";

export const withdrawBodySchema = z.object({
  amount: z.number().finite().positive(),
});

export const updateWithdrawStatusBodySchema = z.object({
  status: z.enum(["approved", "denied"]),
});
