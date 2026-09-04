import { toZrPhoneNumber } from "../../data/zrDeliveryParcelGateway";

describe("toZrPhoneNumber", () => {
  it("converts local 0-prefixed numbers to +213", () => {
    expect(toZrPhoneNumber("0550123456")).toBe("+213550123456");
  });

  it("keeps numbers that already include 213", () => {
    expect(toZrPhoneNumber("213550123456")).toBe("+213550123456");
  });

  it("prefixes bare 9-digit mobiles", () => {
    expect(toZrPhoneNumber("550123456")).toBe("+213550123456");
  });
});
