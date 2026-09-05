export type EarningBucket = "ready" | "not_ready";
export type WithdrawStatus = "pending" | "approved" | "denied";

export interface CommissionEntity {
  id: number;
  partner_id: number;
  order_id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  /** Original (base) commission per unit from products.retail_commission */
  unit_commission: number;
  /** Per-unit discount the affiliate applied from their commission (0 when none) */
  unit_discount: number;
  /** Effective total: (unit_commission − unit_discount) × quantity */
  amount: number;
  /** false at create; true once linked order status is delivered */
  is_earned: boolean;
  created_at: string;
}

export interface CreateCommissionInput {
  partner_id: number;
  order_id: number;
  product_id?: number;
  product_name?: string;
  quantity: number;
  /** Original (base) commission per unit */
  unit_commission: number;
  /** Per-unit discount applied by the affiliate (defaults to 0) */
  unit_discount?: number;
  /** Effective total: (unit_commission − unit_discount) × quantity */
  amount: number;
  /** Always false on create; delivery trigger/app flips later */
  is_earned?: boolean;
}

export interface EarningLine {
  commissionId: number;
  orderId: number;
  productName?: string;
  quantity: number;
  commissionRate: number;
  unitDiscount: number;
  commissionAmount: number;
  status?: string;
  dcRecentStatus?: string;
  bucket: EarningBucket;
  createdAt?: string;
}

export interface WithdrawEntity {
  id: number;
  partner_id: number;
  partner_avatar?: string;
  partner_name?: string;
  partner_email?: string;
  partner_username?: string;
  partner_baridimob_rib?: string;
  partner_redotpay_account?: string;
  partner_usdt_address?: string;
  amount: number;
  is_paid: boolean;
  status: WithdrawStatus;
  created_at: string;
}

export interface CreateWithdrawInput {
  partner_id: number;
  amount: number;
}

export interface UpdateWithdrawStatusInput {
  id: number;
  status: WithdrawStatus;
}

export interface EarningsSummary {
  readyTotal: number;
  notReadyTotal: number;
  withdrawnTotal: number;
  pendingWithdrawTotal: number;
  paidWithdrawTotal: number;
  availableToWithdraw: number;
  readyLines: EarningLine[];
  notReadyLines: EarningLine[];
  withdraws: WithdrawEntity[];
}
