import type {
  CreateCommissionInput,
  CreateWithdrawInput,
  CommissionEntity,
  EarningLine,
  WithdrawEntity,
} from "./entities";

export interface CommissionRepository {
  create(data: CreateCommissionInput): Promise<CommissionEntity>;
  getByOrderId(orderId: number): Promise<CommissionEntity | null>;
  getByPartnerId(partnerId: number): Promise<CommissionEntity[]>;
  /** Sets is_earned = true for the commission linked to this order */
  markEarnedByOrderId(orderId: number): Promise<void>;
}

export interface EarningsRepository {
  getEarningLines(partnerId: number): Promise<EarningLine[]>;
}

export interface WithdrawRepository {
  getByPartnerId(partnerId: number): Promise<WithdrawEntity[]>;
  create(data: CreateWithdrawInput): Promise<WithdrawEntity>;
}
