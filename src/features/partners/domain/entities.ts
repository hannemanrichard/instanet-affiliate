export interface PartnerEntity {
  id: number;
  email?: string;
  fullname?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  status: string;
  created_at: string;
  baridimob_rib?: string;
  redotpay_account?: string;
  usdt_address?: string;
}

export interface UpsertPartnerInput {
  email: string;
  fullname?: string;
  username?: string;
  avatar?: string;
}

export interface UpdatePaymentInput {
  baridimob_rib?: string | null;
  redotpay_account?: string | null;
  usdt_address?: string | null;
}
