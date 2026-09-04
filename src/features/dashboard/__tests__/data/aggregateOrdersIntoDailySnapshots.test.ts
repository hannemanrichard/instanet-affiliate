import { aggregateOrdersIntoDailySnapshots } from "../../data/aggregateOrdersIntoDailySnapshots";

describe("aggregateOrdersIntoDailySnapshots", () => {
  const range = {
    preset: "last_7_days" as const,
    fromDate: "2026-08-10",
    toDate: "2026-08-12",
  };

  it("fills every day in the range and aggregates sales, confirmation, and delivery", () => {
    const snapshots = aggregateOrdersIntoDailySnapshots(
      [
        {
          created_at: "2026-08-10T09:00:00.000Z",
          status: "initial",
          product_price: 4000,
          product_qty: 1,
        },
        {
          created_at: "2026-08-10T15:00:00.000Z",
          status: "processing",
          product_price: 3000,
          product_qty: 2,
        },
        {
          created_at: "2026-08-11T12:00:00.000Z",
          status: "delivered",
          product_price: 5000,
          product_qty: 1,
        },
        {
          created_at: "2026-08-11T18:00:00.000Z",
          status: "returned",
          product_price: 2000,
          product_qty: 1,
        },
        {
          created_at: "2026-08-11T20:00:00.000Z",
          status: "cancelled",
          product_price: 1000,
          product_qty: 1,
        },
      ],
      range
    );

    expect(snapshots.map((snapshot) => snapshot.date)).toEqual([
      "2026-08-10",
      "2026-08-11",
      "2026-08-12",
    ]);

    expect(snapshots[0]).toEqual({
      date: "2026-08-10",
      salesAmount: 10000,
      orderCount: 2,
      confirmedCount: 1,
      deliveredCount: 0,
    });

    expect(snapshots[1]).toEqual({
      date: "2026-08-11",
      salesAmount: 8000,
      orderCount: 3,
      confirmedCount: 2,
      deliveredCount: 1,
    });

    expect(snapshots[2]).toEqual({
      date: "2026-08-12",
      salesAmount: 0,
      orderCount: 0,
      confirmedCount: 0,
      deliveredCount: 0,
    });
  });

  it("ignores orders outside the requested range", () => {
    const snapshots = aggregateOrdersIntoDailySnapshots(
      [
        {
          created_at: "2026-08-09T23:00:00.000Z",
          status: "delivered",
          product_price: 9000,
          product_qty: 1,
        },
        {
          created_at: "2026-08-13T01:00:00.000Z",
          status: "delivered",
          product_price: 9000,
          product_qty: 1,
        },
      ],
      range
    );

    expect(snapshots.every((snapshot) => snapshot.orderCount === 0)).toBe(true);
  });
});
