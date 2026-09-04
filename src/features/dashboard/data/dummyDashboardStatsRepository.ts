import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
  DashboardStatsRepository,
} from "../domain";
import { DUMMY_DAILY_SNAPSHOTS } from "./dummyDashboardStats";

const isWithinRange = (
  date: string,
  range: DashboardDateRange
) => date >= range.fromDate && date <= range.toDate;

export class DummyDashboardStatsRepository implements DashboardStatsRepository {
  constructor(
    private readonly snapshots: DailyDashboardSnapshot[] = DUMMY_DAILY_SNAPSHOTS
  ) {}

  async getDailySnapshots(
    range: DashboardDateRange
  ): Promise<DailyDashboardSnapshot[]> {
    return this.snapshots.filter((snapshot) =>
      isWithinRange(snapshot.date, range)
    );
  }
}
