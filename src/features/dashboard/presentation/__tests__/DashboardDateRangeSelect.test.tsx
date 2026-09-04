import { render, screen } from "@testing-library/react";
import { DashboardDateRangeSelect } from "../DashboardDateRangeSelect";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("DashboardDateRangeSelect", () => {
  it("announces the control and shows the selected preset", () => {
    render(
      <DashboardDateRangeSelect value="last_30_days" onChange={jest.fn()} />
    );

    expect(screen.getByLabelText("dateRange.aria")).toBeInTheDocument();
    expect(screen.getByText("dateRange.last30Days")).toBeInTheDocument();
  });
});
