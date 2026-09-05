import { SupabaseDashboardStatsRepository } from "../../data";
import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
  DashboardMetricStat,
  DashboardOverview,
  DashboardRateStat,
  DashboardSeriesPoint,
  DashboardStatsRepository,
} from "../../domain";
import { DashboardError } from "../../domain";
import { getPreviousDashboardDateRange } from "../../domain/dateRange";
import {
  resolveRateLevel,
  roundRatePercent,
  toRatePercent,
} from "../../domain/rateLevel";

const sumBy = (
  snapshots: DailyDashboardSnapshot[],
  selector: (snapshot: DailyDashboardSnapshot) => number
) => snapshots.reduce((total, snapshot) => total + selector(snapshot), 0);

const toChangePercent = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return roundRatePercent(((current - previous) / previous) * 100);
};

const toRateChangePoints = (current: number, previous: number) =>
  roundRatePercent(current - previous);

const buildRateStat = (
  currentSnapshots: DailyDashboardSnapshot[],
  previousSnapshots: DailyDashboardSnapshot[],
  getNumerator: (snapshot: DailyDashboardSnapshot) => number,
  getDenominator: (snapshot: DailyDashboardSnapshot) => number
): DashboardRateStat => {
  const currentRate = toRatePercent(
    sumBy(currentSnapshots, getNumerator),
    sumBy(currentSnapshots, getDenominator)
  );
  const previousRate = toRatePercent(
    sumBy(previousSnapshots, getNumerator),
    sumBy(previousSnapshots, getDenominator)
  );

  const series: DashboardSeriesPoint[] = currentSnapshots.map((snapshot) => ({
    date: snapshot.date,
    value: roundRatePercent(
      toRatePercent(getNumerator(snapshot), getDenominator(snapshot))
    ),
  }));

  const ratePercent = roundRatePercent(currentRate);

  return {
    ratePercent,
    level: resolveRateLevel(ratePercent),
    changePercent: toRateChangePoints(currentRate, previousRate),
    series,
  };
};

const buildSalesStat = (
  currentSnapshots: DailyDashboardSnapshot[],
  previousSnapshots: DailyDashboardSnapshot[]
): DashboardMetricStat => {
  const currentTotal = sumBy(currentSnapshots, (snapshot) => snapshot.salesAmount);
  const previousTotal = sumBy(
    previousSnapshots,
    (snapshot) => snapshot.salesAmount
  );

  return {
    total: currentTotal,
    changePercent: toChangePercent(currentTotal, previousTotal),
  };
};

export class DashboardApplicationService {
  constructor(private readonly statsRepository: DashboardStatsRepository) {}

  async getOverview(
    partnerId: number | undefined,
    range: DashboardDateRange
  ): Promise<DashboardOverview> {
    try {
      if (!range.fromDate || !range.toDate) {
        throw new DashboardError(
          "A date range is required",
          "DASHBOARD_RANGE_REQUIRED"
        );
      }

      if (range.fromDate > range.toDate) {
        throw new DashboardError(
          "The start date must be on or before the end date",
          "DASHBOARD_RANGE_INVALID"
        );
      }

      const previousRange = getPreviousDashboardDateRange(range);
      const [currentSnapshots, previousSnapshots] = await Promise.all([
        this.statsRepository.getDailySnapshots(partnerId, range),
        this.statsRepository.getDailySnapshots(partnerId, previousRange),
      ]);

      return {
        range,
        delivery: buildRateStat(
          currentSnapshots,
          previousSnapshots,
          (snapshot) => snapshot.deliveredCount,
          (snapshot) => snapshot.confirmedCount
        ),
        confirmation: buildRateStat(
          currentSnapshots,
          previousSnapshots,
          (snapshot) => snapshot.confirmedCount,
          (snapshot) => snapshot.orderCount
        ),
        sales: buildSalesStat(currentSnapshots, previousSnapshots),
        salesSeries: currentSnapshots.map((snapshot) => ({
          date: snapshot.date,
          value: snapshot.salesAmount,
        })),
        ordersSeries: currentSnapshots.map((snapshot) => ({
          date: snapshot.date,
          value: snapshot.orderCount,
        })),
      };
    } catch (error) {
      if (error instanceof DashboardError) throw error;
      throw new DashboardError(
        "Failed to load dashboard overview",
        "DASHBOARD_FETCH_FAILED"
      );
    }
  }
}

const statsRepository = new SupabaseDashboardStatsRepository();

export const dashboardApplicationService = new DashboardApplicationService(
  statsRepository
);
