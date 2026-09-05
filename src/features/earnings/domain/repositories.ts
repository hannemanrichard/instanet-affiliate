import type {
  CreateCommissionInput,
  CreateWithdrawInput,
  CommissionEntity,
  EarningLine,
  UpdateWithdrawStatusInput,
  WithdrawEntity,
} from "./entities";

export interface CommissionRepository {
  create(data: CreateCommissionInput, changedBy?: number): Promise<CommissionEntity>;
  getByOrderId(orderId: number): Promise<CommissionEntity | null>;
  getByPartnerId(partnerId: number): Promise<CommissionEntity[]>;
  /** Sets is_earned = true for the commission linked to this order */
  markEarnedByOrderId(orderId: number, changedBy?: number): Promise<void>;
}

export interface EarningsRepository {
  getEarningLines(partnerId?: number): Promise<EarningLine[]>;
}

export interface WithdrawRepository {
  getByPartnerId(partnerId?: number): Promise<WithdrawEntity[]>;
  getById(id: number): Promise<WithdrawEntity | null>;
  create(data: CreateWithdrawInput): Promise<WithdrawEntity>;
  updateStatus(input: UpdateWithdrawStatusInput): Promise<WithdrawEntity>;
}
