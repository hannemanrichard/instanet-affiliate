import {
  getPreviousDashboardDateRange,
  resolveDashboardDateRange,
} from "../../domain/dateRange";

describe("resolveDashboardDateRange", () => {
  const now = new Date("2026-08-18T12:00:00");

  it("resolves inclusive last 7 days ending today", () => {
    expect(resolveDashboardDateRange("last_7_days", now)).toEqual({
      preset: "last_7_days",
      fromDate: "2026-08-12",
      toDate: "2026-08-18",
    });
  });

  it("resolves last 30 days", () => {
    expect(resolveDashboardDateRange("last_30_days", now)).toEqual({
      preset: "last_30_days",
      fromDate: "2026-07-20",
      toDate: "2026-08-18",
    });
  });

  it("resolves this month from the first day through today", () => {
    expect(resolveDashboardDateRange("this_month", now)).toEqual({
      preset: "this_month",
      fromDate: "2026-08-01",
      toDate: "2026-08-18",
    });
  });
});

describe("getPreviousDashboardDateRange", () => {
  it("returns the equal-length period immediately before the current range", () => {
    expect(
      getPreviousDashboardDateRange({
        preset: "last_7_days",
        fromDate: "2026-08-12",
        toDate: "2026-08-18",
      })
    ).toEqual({
      preset: "last_7_days",
      fromDate: "2026-08-05",
      toDate: "2026-08-11",
    });
  });
});
