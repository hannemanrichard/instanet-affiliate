import { z } from "zod";

const optionalNullableString = z
  .union([z.string().trim().max(500), z.null()])
  .optional();

export const updatePartnerPaymentBodySchema = z.object({
  baridimob_rib: optionalNullableString,
  redotpay_account: optionalNullableString,
  usdt_address: optionalNullableString,
});

export const updatePartnerStatusBodySchema = z.object({
  status: z.enum(["active", "inactive"]),
});
