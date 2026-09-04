import { DashboardApplicationService } from "../../application/services/dashboardApplicationService";
import type {
  DailyDashboardSnapshot,
  DashboardStatsRepository,
} from "../../domain";

const createRepositoryMock = (): jest.Mocked<DashboardStatsRepository> => ({
  getDailySnapshots: jest.fn(),
});

const snapshot = (
  date: string,
  values: Partial<DailyDashboardSnapshot> = {}
): DailyDashboardSnapshot => ({
  date,
  salesAmount: 1000,
  orderCount: 10,
  confirmedCount: 8,
  deliveredCount: 6,
  ...values,
});

describe("DashboardApplicationService", () => {
  let repository: jest.Mocked<DashboardStatsRepository>;
  let service: DashboardApplicationService;

  beforeEach(() => {
    repository = createRepositoryMock();
    service = new DashboardApplicationService(repository);
  });

  it("aggregates rates, sales, and series from current and previous snapshots", async () => {
    repository.getDailySnapshots.mockImplementation(async (_partnerId, range) => {
      if (range.fromDate === "2026-08-12") {
        return [
          snapshot("2026-08-12", {
            salesAmount: 2000,
            orderCount: 10,
            confirmedCount: 8,
            deliveredCount: 8,
          }),
          snapshot("2026-08-13", {
            salesAmount: 3000,
            orderCount: 10,
            confirmedCount: 8,
            deliveredCount: 8,
          }),
        ];
      }

      return [
        snapshot("2026-08-10", {
          salesAmount: 1000,
          orderCount: 10,
          confirmedCount: 5,
          deliveredCount: 2,
        }),
        snapshot("2026-08-11", {
          salesAmount: 1000,
          orderCount: 10,
          confirmedCount: 5,
          deliveredCount: 2,
        }),
      ];
    });

    const overview = await service.getOverview(42, {
      preset: "last_7_days",
      fromDate: "2026-08-12",
      toDate: "2026-08-13",
    });

    expect(overview.sales.total).toBe(5000);
    expect(overview.sales.changePercent).toBe(150);
    expect(overview.confirmation.ratePercent).toBe(80);
    expect(overview.delivery.ratePercent).toBe(100);
    expect(overview.delivery.level).toBe("good");
    expect(overview.confirmation.level).toBe("good");
    expect(overview.salesSeries).toHaveLength(2);
    expect(overview.ordersSeries.map((point) => point.value)).toEqual([10, 10]);
    expect(repository.getDailySnapshots).toHaveBeenCalledTimes(2);
  });

  it("rejects an inverted date range", async () => {
    await expect(
      service.getOverview(42, {
        preset: "last_7_days",
        fromDate: "2026-08-18",
        toDate: "2026-08-01",
      })
    ).rejects.toMatchObject({ code: "DASHBOARD_RANGE_INVALID" });
  });

  it("rejects a missing partner id", async () => {
    await expect(
      service.getOverview(0, {
        preset: "last_7_days",
        fromDate: "2026-08-01",
        toDate: "2026-08-07",
      })
    ).rejects.toMatchObject({ code: "DASHBOARD_PARTNER_REQUIRED" });
  });
});
