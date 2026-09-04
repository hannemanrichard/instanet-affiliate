const DEFAULT_PRODUCT_PAGE_BASE_URL = "https://bellami.fashion";

/**
 * Public customer-facing product page URL (hosted outside this affiliate app).
 */
export const getPublicProductPageUrl = (slug: string): string => {
  const base = (
    process.env.NEXT_PUBLIC_PRODUCT_PAGE_BASE_URL ?? DEFAULT_PRODUCT_PAGE_BASE_URL
  ).replace(/\/$/, "");

  return `${base}/products/${encodeURIComponent(slug)}`;
};
