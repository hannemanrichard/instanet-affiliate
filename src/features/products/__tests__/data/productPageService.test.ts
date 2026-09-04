import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import { SupabaseProductPageService } from "../../data/productPageService";

jest.mock("@/shared/utils/databaseWrapper");
jest.mock("@/shared/utils/performanceMonitor");
jest.mock("@/infrastructure/supabase/server", () => ({
  supabaseServer: {
    from: jest.fn(),
  },
}));

const mockDatabaseWrapper = DatabaseWrapper as jest.Mocked<typeof DatabaseWrapper>;
const mockWithPerformanceTracking = withPerformanceTracking as jest.MockedFunction<
  typeof withPerformanceTracking
>;

describe("SupabaseProductPageService", () => {
  let service: SupabaseProductPageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SupabaseProductPageService();
    mockWithPerformanceTracking.mockImplementation(
      async (_className: string, _methodName: string, fn: any) => fn()
    );
  });

  it("maps page rows including hero media and metadata", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue([
      {
        id: 1,
        product_id: 5,
        slug: "product-a",
        headline: "Product A",
        subheadline: "Best seller",
        description: "Page copy",
        hero_media: [{ url: "hero.jpg", alt_text: "Hero", position: 0, is_primary: undefined }],
        seo_metadata: { title: "SEO title" },
        is_active: true,
        is_affiliate_friendly: true,
        is_freeshipping: true,
        promo_point: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ]);

    const pages = await service.getAll();

    expect(pages).toEqual([
      {
        id: 1,
        product_id: 5,
        slug: "product-a",
        headline: "Product A",
        subheadline: "Best seller",
        description: "Page copy",
        hero_media: [
          { url: "hero.jpg", alt_text: "Hero", position: 0, is_primary: undefined },
        ],
        seo_metadata: { title: "SEO title" },
        is_active: true,
        is_affiliate_friendly: true,
        is_freeshipping: true,
        promo_point: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      },
    ]);
  });

  it("returns relations when fetching by slug", async () => {
    mockDatabaseWrapper.executeQuery.mockResolvedValue({
      id: 2,
      product_id: 8,
      slug: "product-b",
      headline: "Product B",
      description: "Landing description",
      hero_media: [],
      seo_metadata: null,
      is_active: true,
      is_affiliate_friendly: false,
      is_freeshipping: false,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: null,
      products: {
        id: 8,
        name: "Product B",
        description: "Desc",
        retail_price: 120,
        category: "hair",
        thumbnail: null,
        retail_commission: null,
        wholesale_price: null,
        wholesale_commission: null,
        weight: null,
        created_at: "2024-01-01T00:00:00Z",
      },
      product_page_items: [
        {
          product_page_id: 2,
          item_id: 30,
          display_order: 0,
          items: {
            id: 30,
            product_id: 8,
            product: "Product B",
            color: "Black",
            color_hex: "#000000",
            size: "M",
            thumbnail: null,
            cog: 40,
            created_at: "2024-01-01T00:00:00Z",
            inventory: {
              quantity: 15,
            },
          },
        },
      ],
    });

    const result = await service.getBySlug("product-b");

    expect(result).toEqual({
      page: {
        id: 2,
        product_id: 8,
        slug: "product-b",
        headline: "Product B",
        subheadline: undefined,
        description: "Landing description",
        hero_media: [],
        seo_metadata: undefined,
        is_active: true,
        is_affiliate_friendly: false,
        is_freeshipping: false,
        promo_point: 1,
        video_url: undefined,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: undefined,
      },
      product: {
        id: 8,
        name: "Product B",
        description: "Desc",
        retail_price: 120,
        retail_price_2: null,
        retail_price_3: null,
        category: "hair",
        thumbnail: undefined,
        retail_commission: undefined,
        wholesale_price: undefined,
        wholesale_commission: undefined,
        weight: undefined,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: undefined,
      },
      items: [
        {
          id: 30,
          product_id: 8,
          product: "Product B",
          color: "Black",
          colorHex: "#000000",
          size: "M",
          thumbnail: undefined,
          cog: 40,
          quantity: 15,
          created_at: "2024-01-01T00:00:00Z",
        },
      ],
      pageItems: [
        {
          product_page_id: 2,
          item_id: 30,
          display_order: 0,
        },
      ],
      images: [],
      testimonials: [],
    });
  });
});

