import { computeOrderAmounts } from "../orderAmounts";

describe("computeOrderAmounts", () => {
  it("returns zeros for empty lines", () => {
    const result = computeOrderAmounts([]);
    expect(result.totalQty).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.baseCommission).toBe(0);
    expect(result.commission).toBe(0);
    expect(result.totalDiscount).toBe(0);
    expect(result.discountedSubtotal).toBe(0);
    expect(result.maxDiscount).toBe(0);
    expect(result.hasPricedLines).toBe(false);
  });

  it("computes subtotal and commission for a single line without discount", () => {
    const result = computeOrderAmounts([
      { qty: 3, unitPrice: 4000, unitCommission: 500 },
    ]);

    expect(result.totalQty).toBe(3);
    expect(result.subtotal).toBe(12000);
    expect(result.baseCommission).toBe(1500);
    expect(result.commission).toBe(1500);
    expect(result.totalDiscount).toBe(0);
    expect(result.discountedSubtotal).toBe(12000);
    expect(result.maxDiscount).toBe(500);
    expect(result.hasPricedLines).toBe(true);
  });

  it("applies a per-unit discount from the commission", () => {
    const result = computeOrderAmounts(
      [{ qty: 2, unitPrice: 4000, unitCommission: 500 }],
      200
    );

    // discount = 200/unit × 2 = 400
    expect(result.totalDiscount).toBe(400);
    // commission = (500 − 200) × 2 = 600
    expect(result.commission).toBe(600);
    // discounted subtotal = 8000 − 400 = 7600
    expect(result.discountedSubtotal).toBe(7600);
    // base stays
    expect(result.baseCommission).toBe(1000);
    expect(result.subtotal).toBe(8000);
  });

  it("caps discount at the minimum commission across lines", () => {
    const result = computeOrderAmounts(
      [
        { qty: 1, unitPrice: 4000, unitCommission: 500 },
        { qty: 1, unitPrice: 3000, unitCommission: 300 },
      ],
      999 // way more than max (300)
    );

    // maxDiscount = min(500, 300) = 300
    expect(result.maxDiscount).toBe(300);
    // discount capped to 300/unit × 2 items
    expect(result.totalDiscount).toBe(600);
    // commission = (500-300) + (300-300) = 200
    expect(result.commission).toBe(200);
  });

  it("handles discount = maxDiscount (full commission sacrifice)", () => {
    const result = computeOrderAmounts(
      [{ qty: 1, unitPrice: 4000, unitCommission: 500 }],
      500
    );

    expect(result.commission).toBe(0);
    expect(result.totalDiscount).toBe(500);
    expect(result.discountedSubtotal).toBe(3500);
  });

  it("ignores negative discount", () => {
    const result = computeOrderAmounts(
      [{ qty: 1, unitPrice: 4000, unitCommission: 500 }],
      -100
    );

    expect(result.totalDiscount).toBe(0);
    expect(result.commission).toBe(500);
  });

  it("skips lines without a resolved product", () => {
    const result = computeOrderAmounts([
      { qty: 2 },
      { qty: 1, unitPrice: null, unitCommission: null },
    ]);

    expect(result.totalQty).toBe(3);
    expect(result.subtotal).toBe(0);
    expect(result.commission).toBe(0);
    expect(result.hasPricedLines).toBe(false);
    expect(result.maxDiscount).toBe(0);
  });

  it("handles missing commission while price exists", () => {
    const result = computeOrderAmounts([{ qty: 2, unitPrice: 1000 }]);

    expect(result.subtotal).toBe(2000);
    expect(result.baseCommission).toBe(0);
    expect(result.commission).toBe(0);
    expect(result.hasPricedLines).toBe(true);
  });

  it("guards against invalid quantities", () => {
    const result = computeOrderAmounts([
      { qty: 0, unitPrice: 1000, unitCommission: 100 },
      { qty: Number.NaN, unitPrice: 1000, unitCommission: 100 },
      { qty: -2, unitPrice: 1000, unitCommission: 100 },
    ]);

    expect(result.totalQty).toBe(0);
    expect(result.subtotal).toBe(0);
    expect(result.commission).toBe(0);
    expect(result.hasPricedLines).toBe(true);
  });
});
