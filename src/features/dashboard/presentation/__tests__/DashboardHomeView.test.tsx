import { render, screen } from "@testing-library/react";
import type { DashboardOverview } from "../../domain";
import { DashboardHomeView } from "../DashboardHomeView";

const overview: DashboardOverview = {
  range: {
    preset: "last_30_days",
    fromDate: "2026-07-20",
    toDate: "2026-08-18",
  },
  delivery: {
    ratePercent: 82,
    level: "good",
    changePercent: 3.1,
    series: [{ date: "2026-08-18", value: 82 }],
  },
  confirmation: {
    ratePercent: 64,
    level: "warning",
    changePercent: -1.4,
    series: [{ date: "2026-08-18", value: 64 }],
  },
  sales: {
    total: 125000,
    changePercent: 8.5,
  },
  salesSeries: [{ date: "2026-08-18", value: 125000 }],
  ordersSeries: [{ date: "2026-08-18", value: 12 }],
};

const mockUseDashboardOverview = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => {
    const translate = (key: string) => {
      if (namespace === "affiliateDashboard" && key === "currencySymbol") {
        return "DA";
      }
      if (key.startsWith("vsPrevious")) return "trend";
      return key;
    };
    return translate;
  },
}));

jest.mock("../../application", () => ({
  useDashboardOverview: (...args: unknown[]) => mockUseDashboardOverview(...args),
}));

jest.mock("../RateStatCard", () => ({
  RateStatCard: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("../SalesStatCard", () => ({
  SalesStatCard: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("../DashboardTrendChart", () => ({
  DashboardTrendChart: ({ title }: { title: string }) => <div>{title}</div>,
}));

describe("DashboardHomeView", () => {
  beforeEach(() => {
    mockUseDashboardOverview.mockReturnValue({
      data: overview,
      isLoading: false,
      isError: false,
    });
  });

  it("renders rate, sales, and recent-activity sections", () => {
    render(<DashboardHomeView />);

    expect(screen.getByText("deliveryRate")).toBeInTheDocument();
    expect(screen.getByText("confirmationRate")).toBeInTheDocument();
    expect(screen.getByText("sales")).toBeInTheDocument();
    expect(screen.getByText("salesRecent")).toBeInTheDocument();
    expect(screen.getByText("ordersRecent")).toBeInTheDocument();
    expect(screen.getByLabelText("dateRange.aria")).toBeInTheDocument();
  });
});
