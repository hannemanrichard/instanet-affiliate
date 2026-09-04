import {
  collectProductPageAssetUrls,
  extractProductPageHeroUrl,
  getAssetFileExtension,
} from "../productPageMedia";
import type {
  ProductPageEntity,
  ProductPageWithRelations,
} from "../../domain";

describe("extractProductPageHeroUrl", () => {
  it("returns the first media url from an object entry", () => {
    const heroMedia = [
      { url: "https://cdn.example.com/hero.jpg", alt_text: "Hero" },
    ] as ProductPageEntity["hero_media"];

    expect(extractProductPageHeroUrl(heroMedia)).toBe(
      "https://cdn.example.com/hero.jpg"
    );
  });

  it("returns the first string url", () => {
    expect(
      extractProductPageHeroUrl([
        "https://cdn.example.com/plain.jpg",
      ] as ProductPageEntity["hero_media"])
    ).toBe("https://cdn.example.com/plain.jpg");
  });

  it("returns undefined when media is missing", () => {
    expect(extractProductPageHeroUrl([])).toBeUndefined();
    expect(extractProductPageHeroUrl(undefined)).toBeUndefined();
  });
});

describe("collectProductPageAssetUrls", () => {
  it("collects unique hero, gallery, testimonial, library, and thumbnail urls", () => {
    const page = {
      page: {
        id: 1,
        product_id: 10,
        slug: "coat",
        headline: "Coat",
        hero_media: [
          { url: "https://cdn.example.com/hero.jpg" },
          { url: "https://cdn.example.com/hero.jpg" },
        ],
        is_active: true,
        is_affiliate_friendly: true,
        is_freeshipping: false,
        promo_point: 0,
      },
      product: {
        id: 10,
        name: "Coat",
        retail_price: 100,
        thumbnail: "https://cdn.example.com/thumb.jpg",
        created_at: "2026-01-01",
      },
      items: [],
      pageItems: [],
      images: [
        { id: 1, product_page_id: 1, url: "https://cdn.example.com/g1.jpg" },
      ],
      testimonials: [
        { id: 2, product_page_id: 1, url: "https://cdn.example.com/t1.jpg" },
      ],
      assets: [
        {
          id: 3,
          product_page_id: 1,
          url: "https://cdn.example.com/library.mp4",
          media_type: "video",
          file_name: "promo.mp4",
        },
        {
          id: 4,
          product_page_id: 1,
          url: "https://cdn.example.com/hero.jpg",
          media_type: "image",
          file_name: "dup.jpg",
        },
      ],
    } as ProductPageWithRelations;

    expect(collectProductPageAssetUrls(page)).toEqual([
      "https://cdn.example.com/hero.jpg",
      "https://cdn.example.com/g1.jpg",
      "https://cdn.example.com/t1.jpg",
      "https://cdn.example.com/library.mp4",
      "https://cdn.example.com/thumb.jpg",
    ]);
  });
});

describe("getAssetFileExtension", () => {
  it("prefers extension from the url path", () => {
    expect(getAssetFileExtension("https://cdn.example.com/a.PNG?x=1")).toBe(
      "png"
    );
  });

  it("falls back to content-type when path has no extension", () => {
    expect(
      getAssetFileExtension("https://cdn.example.com/asset", "image/jpeg")
    ).toBe("jpg");
  });
});
