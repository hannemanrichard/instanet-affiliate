import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ProductItemEntity } from "../../domain";
import { OrderProductForm } from "../OrderProductForm";

jest.mock("next-intl", () => {
  const messages = require("@/i18n/messages/en.json");

  const formatUnits = (count: number) =>
    `${count} unit${count === 1 ? "" : "s"}`;

  const resolveMessage = (fullKey: string): string | undefined => {
    return fullKey.split(".").reduce<any>((acc, segment) => acc?.[segment], messages);
  };

  return {
    useTranslations: (namespace?: string) => {
      return (key: string, values: Record<string, any> = {}) => {
        const fullKey = namespace ? `${namespace}.${key}` : key;

        switch (fullKey) {
          case "storefront.orderForm.bundleOption":
            return formatUnits(values.count ?? 0);
          case "storefront.orderForm.bundleSummary":
            return `${formatUnits(values.units ?? 0)} • ${values.price ?? ""} each`;
          case "storefront.orderForm.bundleTotal":
            return `Total: ${values.price ?? ""}`;
          case "storefront.orderForm.unitsLabel":
            return `Unit ${values.index ?? ""}`;
          case "storefront.orderForm.labels.color":
            return `Color · Unit ${values.index ?? ""}`;
          case "storefront.orderForm.labels.size":
            return `Size · Unit ${values.index ?? ""}`;
          case "storefront.orderForm.offerLabel":
            return `Offer: ${values.offer ?? ""}`;
          case "storefront.orderForm.validation.variantCount":
            return `Select ${values.count ?? ""} variant${values.count === 1 ? "" : "s"}`;
          case "storefront.product.pricing.label":
            return `${values.label ?? ""} • Total ${values.price ?? ""}`;
          case "storefront.product.pricing.badge":
            return `${values.label ?? ""}: ${values.price ?? ""} / unit`;
          case "storefront.product.status.updated":
            return `Updated ${values.date ?? ""}`;
          case "storefront.product.info.inventoryLow":
            return `Only ${values.count ?? ""} units left in stock.`;
          case "storefront.product.gallery.aria":
            return `View gallery image ${values.index ?? ""}`;
          case "storefront.search.results": {
            const count = values.count ?? 0;
            return `Showing ${count} page${count === 1 ? "" : "s"}`;
          }
          case "storefront.search.stock.in":
            return `${values.count ?? 0} in stock`;
          case "storefront.search.cardAria":
            return `Open product page for ${values.headline ?? ""}`;
          default: {
            const message = resolveMessage(fullKey);
            return typeof message === "string" ? message : fullKey;
          }
        }
      };
    },
    useFormatter: () => ({
      number: (value: number, options?: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat("en-US", options).format(value),
      dateTime: (value: Date, options?: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("en-US", options).format(value),
    }),
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

const baseVariants: ProductItemEntity[] = [
  {
    id: 1,
    product_id: 1,
    product: "Example",
    color: "Red",
    size: "M",
    quantity: 10,
  },
  {
    id: 2,
    product_id: 1,
    product: "Example",
    color: "Blue",
    size: "S",
    quantity: 5,
  },
  {
    id: 3,
    product_id: 1,
    product: "Example",
    color: "Blue",
    size: "M",
    quantity: 7,
  },
];

const sameVarietyInventoryVariants: ProductItemEntity[] = [
  {
    id: 20,
    product_id: 1,
    product: "Example",
    color: "Green",
    size: "S",
    quantity: 3,
  },
  {
    id: 21,
    product_id: 1,
    product: "Example",
    color: "Green",
    size: "M",
    quantity: 4,
  },
  {
    id: 22,
    product_id: 1,
    product: "Example",
    color: "Black",
    size: "S",
    quantity: 10,
  },
  {
    id: 23,
    product_id: 1,
    product: "Example",
    color: "Black",
    size: "M",
    quantity: 12,
  },
];

const stockSensitiveVariants: ProductItemEntity[] = [
  {
    id: 10,
    product_id: 1,
    product: "Example",
    color: "Red",
    size: "M",
    quantity: 8,
  },
  {
    id: 11,
    product_id: 1,
    product: "Example",
    color: "Blue",
    size: "M",
    quantity: 6,
  },
  {
    id: 12,
    product_id: 1,
    product: "Example",
    color: "Blue",
    size: "XS",
    quantity: 0,
  },
  {
    id: 13,
    product_id: 1,
    product: "Example",
    color: "Green",
    size: "S",
    quantity: 0,
  },
];

const createPromotionOptions = () => [
  {
    id: "1",
    units: 1,
    unitPrice: 1000,
    totalPrice: 1000,
    label: "1 unit",
  },
  {
    id: "2",
    units: 2,
    unitPrice: 900,
    totalPrice: 1800,
    label: "2 units",
  },
];

describe("OrderProductForm promotion selection", () => {
  it("renders promotion options when multiple bundles exist", () => {
    render(
      <OrderProductForm
        variants={baseVariants}
        promotionOptions={createPromotionOptions()}
        onSubmit={jest.fn()}
      />
    );

    expect(
      screen.getByRole("radio", { name: /select bundle: 1 unit/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: /select bundle: 2 units/i })
    ).toBeInTheDocument();
  });

  it("updates selection summary when choosing another bundle", async () => {
    const user = userEvent.setup();
    render(
      <OrderProductForm
        variants={baseVariants}
        promotionOptions={createPromotionOptions()}
        onSubmit={jest.fn()}
      />
    );

    await user.click(screen.getByRole("radio", { name: /select bundle: 2 units/i }));

    const summaryContainer = screen.getByText(/order total/i).closest("div");
    expect(summaryContainer).not.toBeNull();
    expect(
      within(summaryContainer as HTMLElement).getByText(/1,800\s*DA/i)
    ).toBeInTheDocument();
  });

  it("allows selecting distinct variants for each unit", async () => {
    const user = userEvent.setup();
    render(
      <OrderProductForm
        variants={baseVariants}
        promotionOptions={createPromotionOptions()}
        onSubmit={jest.fn()}
      />
    );

    await user.click(screen.getByRole("radio", { name: /select bundle: 2 units/i }));

    const colorGroups = screen.getAllByRole("radiogroup", {
      name: /color.*unit/i,
    });
    expect(colorGroups).toHaveLength(2);

    // Default: Blue (2 sizes) for unit 1, Red for unit 2 when cycling enabled colors
    expect(
      screen.getByRole("radio", { name: /color.*unit 1: blue/i })
    ).toHaveAttribute("aria-checked", "true");

    await user.click(
      screen.getByRole("radio", { name: /color.*unit 2: blue/i })
    );
    await user.click(
      screen.getByRole("radio", { name: /size.*unit 2: s/i })
    );

    const unit1Color = screen.getByRole("radio", {
      name: /color.*unit 1: blue/i,
    });
    const unit2Color = screen.getByRole("radio", {
      name: /color.*unit 2: blue/i,
    });
    const unit2Size = screen.getByRole("radio", {
      name: /size.*unit 2: s/i,
    });

    expect(unit1Color).toHaveAttribute("aria-checked", "true");
    expect(unit2Color).toHaveAttribute("aria-checked", "true");
    expect(unit2Size).toHaveAttribute("aria-checked", "true");
  });

  it("defaults to the color with more inventory when size variety matches", () => {
    render(
      <OrderProductForm
        variants={sameVarietyInventoryVariants}
        promotionOptions={createPromotionOptions()}
        onSubmit={jest.fn()}
      />
    );

    expect(
      screen.getByRole("radio", { name: /color.*unit 1: black/i })
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("radio", { name: /size.*unit 1: m/i })
    ).toHaveAttribute("aria-checked", "true");
  });

  it("disables variants below the reorder point", async () => {
    const user = userEvent.setup();
    render(
      <OrderProductForm
        variants={stockSensitiveVariants}
        promotionOptions={createPromotionOptions()}
        onSubmit={jest.fn()}
      />
    );

    const greenColorRadio = screen.getByRole("radio", {
      name: /color.*unit 1: green/i,
    });
    expect(greenColorRadio).toHaveAttribute("aria-disabled", "true");

    await user.click(
      screen.getByRole("radio", { name: /color.*unit 1: blue/i })
    );

    const disabledSize = screen.getByRole("radio", {
      name: /size.*unit 1: xs/i,
    });
    expect(disabledSize).toHaveAttribute("aria-disabled", "true");

    await user.click(disabledSize);

    const unit1Blue = screen.getByRole("radio", {
      name: /color.*unit 1: blue/i,
    });
    const unit1SizeM = screen.getByRole("radio", {
      name: /size.*unit 1: m/i,
    });

    expect(unit1Blue).toHaveAttribute("aria-checked", "true");
    expect(unit1SizeM).toHaveAttribute("aria-checked", "true");
  });

  it("hides bundle radios when a single option is available", () => {
    render(
      <OrderProductForm
        variants={baseVariants}
        promotionOptions={[
          {
            id: "1",
            units: 1,
            unitPrice: 950,
            totalPrice: 950,
            label: "1 unit",
          },
        ]}
        onSubmit={jest.fn()}
      />
    );

    expect(screen.queryByRole("radiogroup", { name: /select bundle/i })).toBeNull();
    const totalContainer = screen.getByText(/order total/i).closest("div");
    expect(totalContainer).not.toBeNull();
    expect(
      within(totalContainer as HTMLElement).getAllByText(/950\s*DA/i).length
    ).toBeGreaterThan(0);
  });
});

