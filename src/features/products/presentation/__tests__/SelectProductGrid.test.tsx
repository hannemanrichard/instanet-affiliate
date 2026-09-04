import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ProductPageEntity } from "../../domain";
import { SelectProductGrid } from "../SelectProductGrid";

const mockUseActiveProductPages = jest.fn();

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) => {
    if (key === "selectAria") return `Select ${values?.headline ?? ""}`;
    return key;
  },
}));

jest.mock("../../application", () => ({
  useActiveProductPages: () => mockUseActiveProductPages(),
}));

const pages: ProductPageEntity[] = [
  {
    id: 1,
    product_id: 10,
    slug: "coat",
    headline: "Cashmere Coat",
    hero_media: [{ url: "https://cdn.example.com/coat.jpg" }],
    is_active: true,
    is_affiliate_friendly: true,
    is_freeshipping: false,
    promo_point: 0,
  },
  {
    id: 2,
    product_id: 20,
    slug: "serum",
    headline: "Hair Serum",
    hero_media: [{ url: "https://cdn.example.com/serum.jpg" }],
    is_active: true,
    is_affiliate_friendly: true,
    is_freeshipping: false,
    promo_point: 0,
  },
];

describe("SelectProductGrid", () => {
  beforeEach(() => {
    mockUseActiveProductPages.mockReturnValue({
      data: pages,
      isLoading: false,
    });
  });

  it("renders only hero images and selects the associated product page", async () => {
    const user = userEvent.setup();
    const handleSelect = jest.fn();

    render(
      <SelectProductGrid selectedPageId={null} onSelect={handleSelect} />
    );

    const images = screen.getAllByRole("presentation");
    expect(images.map((image) => image.getAttribute("src"))).toEqual([
      "https://cdn.example.com/coat.jpg",
      "https://cdn.example.com/serum.jpg",
    ]);
    expect(screen.queryByText("Cashmere Coat")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("Select Cashmere Coat"));

    expect(handleSelect).toHaveBeenCalledWith(pages[0]);
    expect(handleSelect.mock.calls[0][0].product_id).toBe(10);
  });

  it("filters pages with the search box", async () => {
    const user = userEvent.setup();

    render(<SelectProductGrid selectedPageId={null} onSelect={jest.fn()} />);

    await user.type(screen.getByLabelText("searchAria"), "serum");

    expect(screen.queryByLabelText("Select Cashmere Coat")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Select Hair Serum")).toBeInTheDocument();
  });
});
