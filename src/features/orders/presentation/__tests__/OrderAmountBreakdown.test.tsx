import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderAmountBreakdown } from "../OrderAmountBreakdown";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "subtotalItems") return `${values?.count ?? 0} items`;
    if (key === "discountMax")
      return `Max ${values?.max ?? ""} ${values?.currency ?? ""}`;
    return key;
  },
}));

const baseProps = {
  subtotal: 8000,
  totalQty: 2,
  deliveryFee: 500 as number | null,
  baseCommission: 1000,
  commission: 600,
  totalDiscount: 400,
  discountedSubtotal: 7600,
  maxDiscount: 500,
  discount: 200,
  onDiscountChange: jest.fn(),
  currency: "DA",
};

describe("OrderAmountBreakdown", () => {
  it("renders subtotal, discount, delivery, total, and commission", () => {
    render(<OrderAmountBreakdown {...baseProps} />);

    expect(screen.getByText("subtotal")).toBeInTheDocument();
    expect(screen.getByText("8,000 DA")).toBeInTheDocument();
    expect(screen.getByText("discountRow")).toBeInTheDocument();
    expect(screen.getByText("−400 DA")).toBeInTheDocument();
    expect(screen.getByText("500 DA")).toBeInTheDocument();
    expect(screen.getByText("8,100 DA")).toBeInTheDocument(); // 7600 + 500
    expect(screen.getByText("yourCommission")).toBeInTheDocument();
    expect(screen.getByText("600 DA")).toBeInTheDocument();
  });

  it("shows discount input with max hint", () => {
    render(<OrderAmountBreakdown {...baseProps} />);

    const input = screen.getByLabelText("discountAria");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("max", "500");
    expect(screen.getByText(/Max 500 DA/)).toBeInTheDocument();
  });

  it("hides discount row when totalDiscount is 0", () => {
    render(
      <OrderAmountBreakdown
        {...baseProps}
        discount={0}
        totalDiscount={0}
        commission={1000}
        discountedSubtotal={8000}
      />
    );

    expect(screen.queryByText("discountRow")).not.toBeInTheDocument();
  });

  it("shows pending hint when wilaya is not selected", () => {
    render(
      <OrderAmountBreakdown {...baseProps} deliveryFee={null} />
    );

    expect(screen.getByText("deliveryFeePending")).toBeInTheDocument();
  });

  it("calls onDiscountChange when input changes", async () => {
    const handleChange = jest.fn();
    render(
      <OrderAmountBreakdown
        {...baseProps}
        discount={0}
        onDiscountChange={handleChange}
      />
    );

    const input = screen.getByLabelText("discountAria");
    await userEvent.clear(input);
    await userEvent.type(input, "300");
    expect(handleChange).toHaveBeenCalled();
  });

  it("hides discount input when maxDiscount is 0", () => {
    render(
      <OrderAmountBreakdown
        {...baseProps}
        maxDiscount={0}
        discount={0}
      />
    );

    expect(screen.queryByLabelText("discountAria")).not.toBeInTheDocument();
  });
});
