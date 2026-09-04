import { subDays } from "date-fns";
import { formatDashboardDate } from "../domain/dateRange";
import type { DailyDashboardSnapshot } from "../domain";

const DUMMY_DAY_COUNT = 180;

const hashDate = (isoDate: string) => {
  let hash = 0;
  for (let index = 0; index < isoDate.length; index += 1) {
    hash = (hash * 31 + isoDate.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const buildSnapshotForDate = (isoDate: string): DailyDashboardSnapshot => {
  const hash = hashDate(isoDate);
  const weekdayBoost = new Date(`${isoDate}T00:00:00`).getDay() % 6 === 0 ? 0.72 : 1;
  const orderCount = Math.max(
    4,
    Math.round((10 + (hash % 16)) * weekdayBoost)
  );
  const confirmationRate = 0.58 + ((hash % 28) / 100);
  const deliveryRate = 0.52 + ((hash % 36) / 100);
  const confirmedCount = Math.min(
    orderCount,
    Math.round(orderCount * confirmationRate)
  );
  const deliveredCount = Math.min(
    confirmedCount,
    Math.round(confirmedCount * deliveryRate)
  );
  const averageOrderValue = 4200 + (hash % 2800);
  const salesAmount = orderCount * averageOrderValue;

  return {
    date: isoDate,
    salesAmount,
    orderCount,
    confirmedCount,
    deliveredCount,
  };
};

export const buildDummyDailySnapshots = (
  now = new Date(),
  dayCount = DUMMY_DAY_COUNT
): DailyDashboardSnapshot[] => {
  return Array.from({ length: dayCount }, (_, index) => {
    const date = subDays(now, dayCount - 1 - index);
    return buildSnapshotForDate(formatDashboardDate(date));
  });
};

/** Dummy daily stats used until a live dashboard API exists. */
export const DUMMY_DAILY_SNAPSHOTS = buildDummyDailySnapshots();
