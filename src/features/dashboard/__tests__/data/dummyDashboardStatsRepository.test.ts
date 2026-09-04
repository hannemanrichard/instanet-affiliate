import { DummyDashboardStatsRepository } from "../../data/dummyDashboardStatsRepository";
import type { DailyDashboardSnapshot } from "../../domain";

const snapshots: DailyDashboardSnapshot[] = [
  {
    date: "2026-08-10",
    salesAmount: 1000,
    orderCount: 2,
    confirmedCount: 2,
    deliveredCount: 1,
  },
  {
    date: "2026-08-11",
    salesAmount: 2000,
    orderCount: 4,
    confirmedCount: 3,
    deliveredCount: 2,
  },
  {
    date: "2026-08-12",
    salesAmount: 3000,
    orderCount: 5,
    confirmedCount: 4,
    deliveredCount: 3,
  },
];

describe("DummyDashboardStatsRepository", () => {
  it("returns only snapshots inside the requested range", async () => {
    const repository = new DummyDashboardStatsRepository(snapshots);
    const result = await repository.getDailySnapshots(42, {
      preset: "last_7_days",
      fromDate: "2026-08-11",
      toDate: "2026-08-12",
    });

    expect(result.map((snapshot) => snapshot.date)).toEqual([
      "2026-08-11",
      "2026-08-12",
    ]);
  });
});
