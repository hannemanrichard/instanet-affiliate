import { getPublicProductPageUrl } from "@/shared/config/productPageUrl";

describe("getPublicProductPageUrl", () => {
  const originalBaseUrl = process.env.NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL;

  afterEach(() => {
    if (originalBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL;
      return;
    }

    process.env.NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL = originalBaseUrl;
  });

  it("builds a URL from the default base", () => {
    delete process.env.NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL;

    expect(getPublicProductPageUrl("summer-dress")).toBe(
      "https://bellami.fashion/products/summer-dress"
    );
  });

  it("uses NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL when set", () => {
    process.env.NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL = "https://shop.example.com/";

    expect(getPublicProductPageUrl("summer-dress")).toBe(
      "https://shop.example.com/products/summer-dress"
    );
  });

  it("encodes slug segments", () => {
    delete process.env.NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL;

    expect(getPublicProductPageUrl("robe été")).toBe(
      "https://bellami.fashion/products/robe%20%C3%A9t%C3%A9"
    );
  });
});
