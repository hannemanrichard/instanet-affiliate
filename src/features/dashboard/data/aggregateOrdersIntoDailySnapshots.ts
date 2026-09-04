import { addDays, differenceInCalendarDays } from "date-fns";
import { formatDashboardDate } from "../domain/dateRange";
import type {
  DailyDashboardSnapshot,
  DashboardDateRange,
} from "../domain";

/** Order row fields needed to build daily dashboard snapshots. */
export type DashboardOrderRow = {
  created_at: string | null;
  status: string | null;
  product_price: number | null;
  product_qty: number | null;
};

/**
 * Confirmed = progressed past the initial create state.
 * Matches the COD funnel: placed → confirmed → delivered.
 */
const isConfirmedStatus = (status: string | null): boolean => {
  const normalized = (status ?? "").toLowerCase();
  return (
    normalized === "processing" ||
    normalized === "delivered" ||
    normalized === "returned"
  );
};

const isDeliveredStatus = (status: string | null): boolean =>
  (status ?? "").toLowerCase() === "delivered";

const toOrderDateKey = (createdAt: string | null): string | null => {
  if (!createdAt) return null;
  // ISO timestamps from Postgres → calendar day (yyyy-MM-dd)
  const key = createdAt.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(key) ? key : null;
};

const emptySnapshot = (date: string): DailyDashboardSnapshot => ({
  date,
  salesAmount: 0,
  orderCount: 0,
  confirmedCount: 0,
  deliveredCount: 0,
});

const buildEmptyRange = (range: DashboardDateRange): DailyDashboardSnapshot[] => {
  const from = new Date(`${range.fromDate}T00:00:00`);
  const to = new Date(`${range.toDate}T00:00:00`);
  const dayCount = Math.max(0, differenceInCalendarDays(to, from) + 1);

  return Array.from({ length: dayCount }, (_, index) =>
    emptySnapshot(formatDashboardDate(addDays(from, index)))
  );
};

/**
 * Groups partner orders into one DailyDashboardSnapshot per calendar day
 * in `range`, filling days with no activity with zeros.
 */
export const aggregateOrdersIntoDailySnapshots = (
  orders: DashboardOrderRow[],
  range: DashboardDateRange
): DailyDashboardSnapshot[] => {
  const snapshots = buildEmptyRange(range);
  if (snapshots.length === 0) return snapshots;

  const byDate = new Map(snapshots.map((snapshot) => [snapshot.date, snapshot]));

  for (const order of orders) {
    const dateKey = toOrderDateKey(order.created_at);
    if (!dateKey) continue;

    const snapshot = byDate.get(dateKey);
    if (!snapshot) continue;

    const qty =
      order.product_qty != null && Number.isFinite(order.product_qty)
        ? Math.max(0, order.product_qty)
        : 0;
    const unitPrice =
      order.product_price != null && Number.isFinite(order.product_price)
        ? order.product_price
        : 0;

    snapshot.orderCount += 1;
    snapshot.salesAmount += unitPrice * qty;

    if (isConfirmedStatus(order.status)) {
      snapshot.confirmedCount += 1;
    }
    if (isDeliveredStatus(order.status)) {
      snapshot.deliveredCount += 1;
    }
  }

  return snapshots;
};
