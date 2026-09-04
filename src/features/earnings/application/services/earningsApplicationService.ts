import {
  SupabaseEarningsService,
  SupabaseWithdrawService,
} from "../../data";
import type {
  CreateWithdrawInput,
  EarningsSummary,
  WithdrawEntity,
} from "../../domain";
import { EarningsError } from "../../domain";
import type {
  EarningsRepository,
  WithdrawRepository,
} from "../../domain/repositories";

export class EarningsApplicationService {
  constructor(
    private readonly earningsRepository: EarningsRepository,
    private readonly withdrawRepository: WithdrawRepository
  ) {}

  async getEarningsSummary(partnerId: number): Promise<EarningsSummary> {
    try {
      if (!partnerId) {
        throw new EarningsError(
          "Partner id is required",
          "EARNINGS_PARTNER_REQUIRED"
        );
      }

      const [lines, withdraws] = await Promise.all([
        this.earningsRepository.getEarningLines(partnerId),
        this.withdrawRepository.getByPartnerId(partnerId),
      ]);

      const readyLines = lines.filter((line) => line.bucket === "ready");
      const notReadyLines = lines.filter((line) => line.bucket === "not_ready");

      const readyTotal = readyLines.reduce(
        (sum, line) => sum + line.commissionAmount,
        0
      );
      const notReadyTotal = notReadyLines.reduce(
        (sum, line) => sum + line.commissionAmount,
        0
      );
      const pendingWithdrawTotal = withdraws
        .filter((withdraw) => !withdraw.is_paid)
        .reduce((sum, withdraw) => sum + withdraw.amount, 0);
      const paidWithdrawTotal = withdraws
        .filter((withdraw) => withdraw.is_paid)
        .reduce((sum, withdraw) => sum + withdraw.amount, 0);
      const withdrawnTotal = pendingWithdrawTotal + paidWithdrawTotal;
      const availableToWithdraw = Math.max(0, readyTotal - withdrawnTotal);

      return {
        readyTotal,
        notReadyTotal,
        withdrawnTotal,
        pendingWithdrawTotal,
        paidWithdrawTotal,
        availableToWithdraw,
        readyLines,
        notReadyLines,
        withdraws,
      };
    } catch (error) {
      if (error instanceof EarningsError) throw error;
      throw new EarningsError(
        "Failed to load earnings",
        "EARNINGS_FETCH_FAILED"
      );
    }
  }

  async requestWithdraw(
    input: CreateWithdrawInput
  ): Promise<WithdrawEntity> {
    try {
      if (!input.partner_id) {
        throw new EarningsError(
          "Partner id is required",
          "EARNINGS_PARTNER_REQUIRED"
        );
      }
      if (!Number.isFinite(input.amount) || input.amount <= 0) {
        throw new EarningsError(
          "Withdraw amount must be greater than zero",
          "WITHDRAW_INVALID_AMOUNT"
        );
      }

      const summary = await this.getEarningsSummary(input.partner_id);
      if (input.amount > summary.availableToWithdraw) {
        throw new EarningsError(
          "Withdraw amount exceeds available balance",
          "WITHDRAW_EXCEEDS_AVAILABLE"
        );
      }

      return await this.withdrawRepository.create(input);
    } catch (error) {
      if (error instanceof EarningsError) throw error;
      throw new EarningsError(
        "Failed to request withdraw",
        "WITHDRAW_CREATE_FAILED"
      );
    }
  }
}

const earningsService = new SupabaseEarningsService();
const withdrawService = new SupabaseWithdrawService();

export const earningsApplicationService = new EarningsApplicationService(
  earningsService,
  withdrawService
);
