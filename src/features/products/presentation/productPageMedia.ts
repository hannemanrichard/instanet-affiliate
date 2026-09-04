import type {
  ProductPageEntity,
  ProductPageWithRelations,
} from "../domain";

export const extractProductPageHeroUrl = (
  heroMedia?: ProductPageEntity["hero_media"] | null
): string | undefined => {
  if (!heroMedia || heroMedia.length === 0) return undefined;

  const [first] = heroMedia;
  if (typeof first === "string") {
    const url = first.trim();
    return url.length > 0 ? url : undefined;
  }

  if (first && typeof first === "object" && "url" in first) {
    const url = (first as { url?: string }).url?.trim();
    return url && url.length > 0 ? url : undefined;
  }

  return undefined;
};

const pushUniqueUrl = (urls: string[], value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return;
  if (urls.includes(trimmed)) return;
  urls.push(trimmed);
};

/** Collect unique downloadable media URLs for a product page. */
export const collectProductPageAssetUrls = (
  page: ProductPageWithRelations
): string[] => {
  const urls: string[] = [];

  (page.page.hero_media ?? []).forEach((entry) => {
    if (typeof entry === "string") {
      pushUniqueUrl(urls, entry);
      return;
    }
    pushUniqueUrl(urls, entry?.url);
  });

  (page.images ?? []).forEach((image) => {
    pushUniqueUrl(urls, image.url);
  });

  (page.testimonials ?? []).forEach((testimonial) => {
    pushUniqueUrl(urls, testimonial.url);
  });

  (page.assets ?? []).forEach((asset) => {
    pushUniqueUrl(urls, asset.url);
  });

  pushUniqueUrl(urls, page.product?.thumbnail);

  return urls;
};

export const getAssetFileExtension = (
  url: string,
  contentType?: string | null
) => {
  const path = url.split("?")[0] ?? url;
  const fromPath = path.match(/\.([a-zA-Z0-9]{2,5})$/)?.[1]?.toLowerCase();
  if (fromPath) return fromPath;

  const mime = contentType?.split(";")[0]?.trim().toLowerCase();
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "video/mp4") return "mp4";
  if (mime === "application/pdf") return "pdf";
  return "bin";
};
