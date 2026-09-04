import { render, screen } from "@testing-library/react";
import { Package } from "lucide-react";
import type { DashboardRateStat } from "../../domain";
import { RateStatCard } from "../RateStatCard";

const stat: DashboardRateStat = {
  ratePercent: 87.4,
  level: "good",
  changePercent: 4.2,
  series: [
    { date: "2026-08-17", value: 80 },
    { date: "2026-08-18", value: 87 },
  ],
};

describe("RateStatCard", () => {
  it("renders the percentage and simplified trend", () => {
    render(
      <RateStatCard title="Delivery rate" stat={stat} icon={Package} />
    );

    expect(screen.getByText("Delivery rate")).toBeInTheDocument();
    expect(screen.getByLabelText("Delivery rate: 87%")).toBeInTheDocument();
    expect(screen.getByLabelText("4.2% up")).toBeInTheDocument();
    expect(screen.getByText("4.2%")).toBeInTheDocument();
  });
});
