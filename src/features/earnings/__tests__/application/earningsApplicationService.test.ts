import type {
  EarningLine,
  WithdrawEntity,
} from "../../domain";
import { EarningsApplicationService } from "../../application/services/earningsApplicationService";
import type {
  EarningsRepository,
  WithdrawRepository,
} from "../../domain/repositories";

const createEarningsRepositoryMock = (): jest.Mocked<EarningsRepository> => ({
  getEarningLines: jest.fn(),
});

const createWithdrawRepositoryMock = (): jest.Mocked<WithdrawRepository> => ({
  getByPartnerId: jest.fn(),
  create: jest.fn(),
});

describe("EarningsApplicationService", () => {
  let earningsRepository: jest.Mocked<EarningsRepository>;
  let withdrawRepository: jest.Mocked<WithdrawRepository>;
  let service: EarningsApplicationService;

  const readyLine: EarningLine = {
    commissionId: 11,
    orderId: 1,
    productName: "Serum",
    quantity: 2,
    commissionRate: 500,
    unitDiscount: 0,
    commissionAmount: 1000,
    status: "delivered",
    dcRecentStatus: "encaisse",
    bucket: "ready",
  };

  const notReadyLine: EarningLine = {
    commissionId: 12,
    orderId: 2,
    productName: "Serum",
    quantity: 1,
    commissionRate: 500,
    unitDiscount: 0,
    commissionAmount: 500,
    status: "delivered",
    dcRecentStatus: undefined,
    bucket: "not_ready",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    earningsRepository = createEarningsRepositoryMock();
    withdrawRepository = createWithdrawRepositoryMock();
    service = new EarningsApplicationService(
      earningsRepository,
      withdrawRepository
    );
  });

  it("computes earnings summary from snapshotted commission amounts", async () => {
    earningsRepository.getEarningLines.mockResolvedValue([
      readyLine,
      notReadyLine,
    ]);
    withdrawRepository.getByPartnerId.mockResolvedValue([
      {
        id: 1,
        partner_id: 42,
        amount: 200,
        is_paid: true,
        created_at: "2026-01-01",
      },
      {
        id: 2,
        partner_id: 42,
        amount: 100,
        is_paid: false,
        created_at: "2026-01-02",
      },
    ] as WithdrawEntity[]);

    const summary = await service.getEarningsSummary(42);

    expect(summary.readyTotal).toBe(1000);
    expect(summary.notReadyTotal).toBe(500);
    expect(summary.withdrawnTotal).toBe(300);
    expect(summary.availableToWithdraw).toBe(700);
  });

  it("rejects withdraw above available balance", async () => {
    earningsRepository.getEarningLines.mockResolvedValue([readyLine]);
    withdrawRepository.getByPartnerId.mockResolvedValue([]);

    await expect(
      service.requestWithdraw({ partner_id: 42, amount: 1500 })
    ).rejects.toMatchObject({ code: "WITHDRAW_EXCEEDS_AVAILABLE" });
  });

  it("creates withdraw when amount is available", async () => {
    earningsRepository.getEarningLines.mockResolvedValue([readyLine]);
    withdrawRepository.getByPartnerId.mockResolvedValue([]);
    withdrawRepository.create.mockResolvedValue({
      id: 10,
      partner_id: 42,
      amount: 400,
      is_paid: false,
      created_at: "2026-01-03",
    });

    const result = await service.requestWithdraw({
      partner_id: 42,
      amount: 400,
    });

    expect(withdrawRepository.create).toHaveBeenCalledWith({
      partner_id: 42,
      amount: 400,
    });
    expect(result.id).toBe(10);
  });
});
