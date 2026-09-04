import {
  formatDcRecentStatusLabel,
  formatOrderStatusLabel,
  getOrderAmount,
  getOrderCustomerName,
  getOrderLocationLabel,
  getOrderStatusTone,
  canDeleteOrder,
} from "../orderTableUtils";

describe("orderTableUtils", () => {
  it("builds customer and location labels", () => {
    expect(
      getOrderCustomerName({ first_name: "Sara", last_name: "Ali" })
    ).toBe("Sara Ali");
    expect(
      getOrderLocationLabel({ wilaya: "Alger", commune: "Bab Ezzouar" })
    ).toBe("Alger, Bab Ezzouar");
    expect(getOrderLocationLabel({})).toBe("—");
  });

  it("maps status tones", () => {
    expect(getOrderStatusTone("processing")).toBe("info");
    expect(getOrderStatusTone("delivered")).toBe("success");
    expect(getOrderStatusTone("returned")).toBe("error");
    expect(getOrderStatusTone("initial")).toBe("neutral");
  });

  it("formats status labels", () => {
    expect(formatOrderStatusLabel("initial")).toBe("Initial");
  });

  it("computes order amount with shipping", () => {
    expect(
      getOrderAmount({
        product_price: 5000,
        product_qty: 2,
        shipping_price: 400,
      })
    ).toBe(10400);
    expect(getOrderAmount({ product_price: 1000, product_qty: 1 })).toBe(1000);
  });

  it("formats DC recent status labels", () => {
    expect(formatDcRecentStatusLabel("en_preparation")).toBe("En Preparation");
    expect(formatDcRecentStatusLabel("IN_TRANSIT")).toBe("In Transit");
  });

  it("allows delete only for initial status", () => {
    expect(canDeleteOrder("initial")).toBe(true);
    expect(canDeleteOrder("Initial")).toBe(true);
    expect(canDeleteOrder("processing")).toBe(false);
    expect(canDeleteOrder("delivered")).toBe(false);
    expect(canDeleteOrder(undefined)).toBe(false);
  });
});
