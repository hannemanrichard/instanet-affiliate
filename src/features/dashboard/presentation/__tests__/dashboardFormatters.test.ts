import {
  formatDashboardAmount,
  formatTrendPercent,
} from "../dashboardFormatters";

describe("dashboardFormatters", () => {
  it("formats amounts with latin digits and grouping", () => {
    expect(formatDashboardAmount(12500)).toBe("12,500");
  });

  it("formats trend percents without sign", () => {
    expect(formatTrendPercent(12.4)).toBe("12.4%");
    expect(formatTrendPercent(-3)).toBe("3%");
    expect(formatTrendPercent(0)).toBe("0%");
  });
});
