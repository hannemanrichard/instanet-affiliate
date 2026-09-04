import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ProductPageEntity } from "@/features/products/domain";
import {
  CreateOrderItemsField,
  createInitialOrderLines,
  isOrderLineComplete,
  type OrderLineDraft,
} from "../CreateOrderItemsField";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "itemLabel") return `Item ${values?.index ?? ""}`;
    if (key === "deleteItemAria") return `Delete item ${values?.index ?? ""}`;
    return key;
  },
}));

jest.mock("@/features/products", () => ({
  useProductItems: jest.fn(() => ({ data: [], isLoading: false })),
}));

jest.mock("@/features/products/presentation/SelectProductGrid", () => ({
  SelectProductGrid: ({
    onSelect,
  }: {
    selectedPageId?: number | null;
    onSelect: (page: ProductPageEntity) => void;
  }) => (
    <button
      type="button"
      aria-label="productAria"
      onClick={() =>
        onSelect({
          id: 12,
          product_id: 7,
          slug: "cashmere-coat",
          headline: "Cashmere Coat",
          hero_media: [],
          is_active: true,
          is_affiliate_friendly: true,
          is_freeshipping: false,
          promo_point: 0,
        })
      }
    >
      product
    </button>
  ),
}));

const productPages: ProductPageEntity[] = [
  {
    id: 12,
    product_id: 7,
    slug: "cashmere-coat",
    headline: "Cashmere Coat",
    hero_media: [],
    is_active: true,
    is_affiliate_friendly: false,
    is_freeshipping: false,
    promo_point: 0,
  },
];

const completeLine = (
  overrides: Partial<OrderLineDraft> = {}
): OrderLineDraft => ({
  key: "line-1",
  productPageId: 12,
  productId: 7,
  color: "Black",
  size: "M",
  qty: 1,
  itemId: 21,
  ...overrides,
});

describe("createInitialOrderLines", () => {
  it("starts with an empty product page selection", () => {
    const [line] = createInitialOrderLines();

    expect(line.productPageId).toBeNull();
    expect(line.productId).toBeNull();
    expect(line.color).toBe("");
    expect(line.itemId).toBeNull();
    expect(line.qty).toBe(1);
  });

  it("preselects a locked product page id", () => {
    const [line] = createInitialOrderLines(12);

    expect(line.productPageId).toBe(12);
    expect(line.color).toBe("");
  });
});

describe("isOrderLineComplete", () => {
  it("returns true when product page, color, item, and qty are set", () => {
    expect(isOrderLineComplete(completeLine())).toBe(true);
  });

  it("returns false when the product page is missing", () => {
    expect(isOrderLineComplete(completeLine({ productPageId: null }))).toBe(
      false
    );
  });
});

describe("CreateOrderItemsField", () => {
  it("hides the product page field when a page is locked", () => {
    render(
      <CreateOrderItemsField
        productPages={productPages}
        lines={createInitialOrderLines(12)}
        onChange={jest.fn()}
        lockedProductPageId={12}
      />
    );

    expect(screen.queryByLabelText("productAria")).not.toBeInTheDocument();
    expect(screen.queryByText("product")).not.toBeInTheDocument();
    expect(screen.getByLabelText("colorAria")).toBeInTheDocument();
  });

  it("shows the product page field when no page is locked", () => {
    render(
      <CreateOrderItemsField
        productPages={productPages}
        lines={createInitialOrderLines()}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByLabelText("productAria")).toBeInTheDocument();
  });

  it("adds another line with the locked product page id", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const lines = createInitialOrderLines(12);

    render(
      <CreateOrderItemsField
        productPages={productPages}
        lines={lines}
        onChange={handleChange}
        lockedProductPageId={12}
      />
    );

    await user.click(screen.getByLabelText("addItemAria"));

    expect(handleChange).toHaveBeenCalledTimes(1);
    const nextLines = handleChange.mock.calls[0][0] as OrderLineDraft[];
    expect(nextLines).toHaveLength(2);
    expect(nextLines[0].productPageId).toBe(12);
    expect(nextLines[1].productPageId).toBe(12);
  });
});
