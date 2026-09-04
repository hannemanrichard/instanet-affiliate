import { resolveRateLevel, toRatePercent } from "../../domain/rateLevel";

describe("resolveRateLevel", () => {
  it("marks high rates as good", () => {
    expect(resolveRateLevel(80)).toBe("good");
    expect(resolveRateLevel(92)).toBe("good");
  });

  it("marks mid rates as warning", () => {
    expect(resolveRateLevel(60)).toBe("warning");
    expect(resolveRateLevel(79.9)).toBe("warning");
  });

  it("marks low rates as poor", () => {
    expect(resolveRateLevel(0)).toBe("poor");
    expect(resolveRateLevel(59.9)).toBe("poor");
  });
});

describe("toRatePercent", () => {
  it("returns 0 when the denominator is 0", () => {
    expect(toRatePercent(4, 0)).toBe(0);
  });

  it("computes a percentage from the ratio", () => {
    expect(toRatePercent(8, 10)).toBe(80);
  });
});
