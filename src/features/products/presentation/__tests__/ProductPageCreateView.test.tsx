import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductPageCreateView } from "../ProductPageCreateView";

const mutateMock = jest.fn();
const mockUseAdminProducts = jest.fn();
const mockUseCreateProductPage = jest.fn();
const mockUseProductItems = jest.fn();

jest.mock("@/features/products/application", () => ({
  useAdminProducts: () => mockUseAdminProducts(),
  useCreateProductPage: () => mockUseCreateProductPage(),
  useProductItems: (productId: number) => mockUseProductItems(productId),
}));

jest.mock("@/shared/components/ui/upload-area", () => ({
  UploadArea: ({
    value,
    onChange,
    endpoint,
  }: {
    value?: string;
    onChange?: (url: string) => void;
    endpoint?: string;
  }) => {
    const isHero = endpoint === "productImage";
    const label = isHero ? "Upload hero" : "Upload video";
    const testId = isHero ? "hero-upload-value" : "video-upload-value";
    return (
      <div>
        <p data-testid={testId}>{value}</p>
        <button
          type="button"
          onClick={() =>
            onChange?.(
              isHero
                ? "https://cdn.example.com/hero.jpg"
                : "https://cdn.example.com/video.mp4"
            )
          }
        >
          {label}
        </button>
        <button type="button" onClick={() => onChange?.("")}>
          Clear {isHero ? "hero" : "video"}
        </button>
      </div>
    );
  },
}));

jest.mock("@/shared/components/ui/upload-area-multiple", () => ({
  UploadAreaMultiple: ({
    value = [],
    onChange,
    alt,
  }: {
    value?: string[];
    onChange?: (urls: string[]) => void;
    alt?: string;
  }) => {
    const isGallery = alt === "Product gallery image";
    const label = isGallery ? "Upload gallery" : "Upload testimonials";
    const testId = isGallery ? "gallery-count" : "testimonials-count";
    return (
      <div>
        <p data-testid={testId}>{value.length}</p>
        <button
          type="button"
          onClick={() =>
            onChange?.(
              isGallery
                ? [
                    "https://cdn.example.com/gallery-1.jpg",
                    "https://cdn.example.com/gallery-2.jpg",
                  ]
                : ["https://cdn.example.com/testimonial-1.jpg"]
            )
          }
        >
          {label}
        </button>
      </div>
    );
  },
}));

beforeAll(() => {
  // Radix UI relies on ResizeObserver which is not available in jsdom by default.
  // Provide a lightweight mock to keep layout effects predictable during testing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global as any).ResizeObserver = class {
    observe() {
      return null;
    }
    // eslint-disable-next-line class-methods-use-this
    unobserve() {
      return null;
    }
    // eslint-disable-next-line class-methods-use-this
    disconnect() {
      return null;
    }
  };

  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
});

describe("ProductPageCreateView", () => {
  beforeEach(() => {
    mutateMock.mockReset();
    mockUseAdminProducts.mockReturnValue({
      data: [{ id: 1, name: "Cashmere Coat" }],
      isLoading: false,
    });
    mockUseCreateProductPage.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
    });
    mockUseProductItems.mockImplementation((productId: number) =>
      productId > 0
        ? {
            data: [
              {
                id: 10,
                color: "Blue",
                size: "M",
                quantity: 12,
              },
            ],
            isLoading: false,
          }
        : { data: [], isLoading: false }
    );
  });

  it("submits hero and gallery uploads with selected variants", async () => {
    const user = userEvent.setup();
    mutateMock.mockImplementation((payload, options) => {
      options?.onSuccess?.();
    });

    render(<ProductPageCreateView />);

    expect(
      screen.getByText("Select a product to load variants.")
    ).toBeInTheDocument();

    await user.click(screen.getByLabelText("Select product"));
    const productChoices = screen.getAllByText("Cashmere Coat");
    await user.click(productChoices[productChoices.length - 1]);

    await user.type(
      screen.getByPlaceholderText("cashmere-coat"),
      "cashmere-coat"
    );
    await user.type(
      screen.getByPlaceholderText("Primary hero headline"),
      "Hero Title"
    );
    await user.type(
      screen.getByPlaceholderText(
        "Introduce the product, highlight benefits, and add Markdown formatting."
      ),
      "Rich **markdown** copy"
    );

    await waitFor(() =>
      expect(
        screen.queryByText("Select a product to load variants.")
      ).not.toBeInTheDocument()
    );

    await user.click(screen.getByText("Blue · M"));

    await user.click(screen.getByRole("button", { name: "Upload hero" }));
    expect(screen.getByTestId("hero-upload-value")).toHaveTextContent(
      "https://cdn.example.com/hero.jpg"
    );

    await user.click(screen.getByRole("button", { name: "Upload gallery" }));
    expect(screen.getByTestId("gallery-count")).toHaveTextContent("2");

    await user.click(screen.getByRole("button", { name: /Create page/i }));

    await waitFor(() => expect(mutateMock).toHaveBeenCalledTimes(1));

    const [payload, callbacks] = mutateMock.mock.calls[0];
    expect(payload).toEqual({
      page: {
        product_id: 1,
        promo_point: 1,
        slug: "cashmere-coat",
        headline: "Hero Title",
        subheadline: undefined,
        description: "Rich **markdown** copy",
        hero_media: [
          {
            url: "https://cdn.example.com/hero.jpg",
            alt_text: undefined,
            position: 0,
            is_primary: true,
          },
        ],
        seo_metadata: undefined,
        is_active: true,
        is_affiliate_friendly: false,
        is_freeshipping: false,
        video_url: undefined,
      },
      itemIds: [10],
      gallery: [
        "https://cdn.example.com/gallery-1.jpg",
        "https://cdn.example.com/gallery-2.jpg",
      ],
      testimonials: [],
    });
    expect(typeof callbacks?.onSuccess).toBe("function");
  });
});


