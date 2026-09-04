import type {
  ProductCatalogEntry,
  ProductEntity,
  ProductInventoryAdjustment,
  ProductInventorySnapshot,
  ProductItemEntity,
  ProductPageEntity,
  ProductPageItemEntity,
  ProductPageWithRelations,
} from "../../domain";
import {
  ProductApplicationService,
  type CreateProductPayload,
  type CreateProductPagePayload,
} from "../../application/services/productApplicationService";
import type {
  ProductItemRepository,
  ProductPageImageRepository,
  ProductPageItemRepository,
  ProductPageRepository,
  ProductPageTestimonialRepository,
  ProductRepository,
} from "../../domain/repositories";

jest.mock("../../data", () => ({
  SupabaseProductService: jest.fn().mockImplementation(() => ({})),
  SupabaseProductItemService: jest.fn().mockImplementation(() => ({})),
  SupabaseProductPageService: jest.fn().mockImplementation(() => ({})),
  SupabaseProductPageItemService: jest.fn().mockImplementation(() => ({})),
  SupabaseProductPageImageService: jest.fn().mockImplementation(() => ({})),
  SupabaseProductPageTestimonialService: jest.fn().mockImplementation(() => ({})),
}));

const createProductRepositoryMock = (): jest.Mocked<ProductRepository> => ({
  getAll: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn(),
  getCatalog: jest.fn(),
  getInventorySnapshot: jest.fn(),
});

const createItemRepositoryMock = (): jest.Mocked<ProductItemRepository> => ({
  getByProductId: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  bulkUpdateQuantities: jest.fn(),
  ensureInventory: jest.fn(),
});

const createPageRepositoryMock = (): jest.Mocked<ProductPageRepository> => ({
  getAll: jest.fn(),
  getActivePages: jest.fn(),
  getById: jest.fn(),
  getBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  searchPages: jest.fn(),
});

const createPageItemRepositoryMock =
  (): jest.Mocked<ProductPageItemRepository> => ({
    getByPageId: jest.fn(),
    upsertItems: jest.fn(),
    deleteByPageId: jest.fn(),
  });

const createPageImageRepositoryMock =
  (): jest.Mocked<ProductPageImageRepository> => ({
    getByPageId: jest.fn(),
    replaceForPage: jest.fn(),
    deleteByPageId: jest.fn(),
  });

const createPageTestimonialRepositoryMock =
  (): jest.Mocked<ProductPageTestimonialRepository> => ({
    getByPageId: jest.fn(),
    replaceForPage: jest.fn(),
    deleteByPageId: jest.fn(),
  });

describe("ProductApplicationService", () => {
  let productRepo: jest.Mocked<ProductRepository>;
  let itemRepo: jest.Mocked<ProductItemRepository>;
  let pageRepo: jest.Mocked<ProductPageRepository>;
  let pageItemRepo: jest.Mocked<ProductPageItemRepository>;
  let pageImageRepo: jest.Mocked<ProductPageImageRepository>;
  let pageTestimonialRepo: jest.Mocked<ProductPageTestimonialRepository>;
  let service: ProductApplicationService;

  beforeEach(() => {
    productRepo = createProductRepositoryMock();
    itemRepo = createItemRepositoryMock();
    pageRepo = createPageRepositoryMock();
    pageItemRepo = createPageItemRepositoryMock();
    pageImageRepo = createPageImageRepositoryMock();
    pageTestimonialRepo = createPageTestimonialRepositoryMock();

    service = new ProductApplicationService(
      productRepo,
      itemRepo,
      pageRepo,
      pageItemRepo,
      pageImageRepo,
      pageTestimonialRepo
    );
  });

  describe("getCatalog", () => {
    it("returns catalog when no search term is provided", async () => {
      const mockCatalog: ProductCatalogEntry[] = [
        {
          id: 1,
          name: "Product",
          description: "Desc",
          price: 100,
          total_stock: 10,
          primary_image: "img",
          category: "hair",
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      productRepo.getCatalog.mockResolvedValue(mockCatalog);

      const result = await service.getCatalog();

      expect(result).toEqual(mockCatalog);
      expect(productRepo.getCatalog).toHaveBeenCalledTimes(1);
      expect(productRepo.search).not.toHaveBeenCalled();
    });

    it("searches catalog when term provided", async () => {
      const mockCatalog: ProductCatalogEntry[] = [];
      productRepo.search.mockResolvedValue(mockCatalog);

      const result = await service.getCatalog("shampoo");

      expect(result).toEqual(mockCatalog);
      expect(productRepo.search).toHaveBeenCalledWith("shampoo");
    });
  });

  describe("createProductWithRelations", () => {
    it("creates product with items and page", async () => {
      const product: ProductEntity = {
        id: 10,
        name: "Product",
        retail_price: 100,
        description: "Desc",
        category: "hair",
        thumbnail: undefined,
        retail_commission: undefined,
        wholesale_price: undefined,
        wholesale_commission: undefined,
        weight: undefined,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: undefined,
      };

      const createdItem: ProductItemEntity = {
        id: 20,
        product_id: 10,
        product: "Product",
        color: "Red",
        size: "M",
        cog: undefined,
        thumbnail: undefined,
        quantity: undefined,
        created_at: "2024-01-01T00:00:00Z",
      };

      const createdPage: ProductPageEntity = {
        id: 30,
        product_id: 10,
        slug: "product",
        headline: "Product headline",
        subheadline: undefined,
        description: "Landing details",
        hero_media: [],
        seo_metadata: undefined,
        is_active: true,
        is_affiliate_friendly: false,
        is_freeshipping: false,
        promo_point: 1,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: undefined,
      };

      const payload: CreateProductPayload = {
        product: {
          name: "Product",
          retail_price: 100,
          description: "Desc",
          category: "hair",
        },
        items: [
          {
            color: "Red",
            size: "M",
            colorHex: "#ff0000",
            initialQuantity: 5,
          },
        ],
        page: {
          slug: "product",
          headline: "Product headline",
          subheadline: undefined,
          description: "Landing details",
          hero_media: [],
          seo_metadata: undefined,
          is_active: true,
          is_affiliate_friendly: false,
          is_freeshipping: false,
          promo_point: 1,
        },
        pageItems: [
          {
            product_page_id: 0,
            item_id: 20,
            display_order: 0,
          },
        ],
        pageGallery: ["https://cdn.example.com/gallery-1.jpg"],
      };

      productRepo.create.mockResolvedValue(product);
      itemRepo.create.mockResolvedValue(createdItem);
      pageRepo.create.mockResolvedValue(createdPage);
      pageItemRepo.upsertItems.mockResolvedValue(
        payload.pageItems as ProductPageItemEntity[]
      );
      pageImageRepo.replaceForPage.mockResolvedValue([]);
      itemRepo.ensureInventory.mockResolvedValue(undefined);

      const result = await service.createProductWithRelations(payload);

      expect(productRepo.create).toHaveBeenCalledWith(payload.product);
      expect(itemRepo.create).toHaveBeenCalledTimes(1);
      expect(itemRepo.create).toHaveBeenCalledWith({
        color: "Red",
        colorHex: "#ff0000",
        size: "M",
        product_id: product.id,
      });
      expect(itemRepo.ensureInventory).toHaveBeenCalledWith(createdItem.id, 5);
      expect(pageRepo.create).toHaveBeenCalledTimes(1);
      expect(pageItemRepo.upsertItems).toHaveBeenCalledWith(
        createdPage.id,
        payload.pageItems
      );
      expect(pageImageRepo.replaceForPage).toHaveBeenCalledWith(
        createdPage.id,
        payload.pageGallery
      );
      expect(result).toEqual({
        product,
        items: [
          {
            ...createdItem,
            quantity: 5,
          },
        ],
        page: createdPage,
      });
    });
  });

  describe("addProductItem", () => {
    it("creates item and initial inventory", async () => {
      const variant: CreateProductPayload["items"][0] = {
        color: "Blue",
        size: "L",
        colorHex: "#0000ff",
        initialQuantity: 3,
      };

      const createdItem: ProductItemEntity = {
        id: 99,
        product_id: 50,
        product: "Product Name",
        color: "Blue",
        size: "L",
        colorHex: "#0000ff",
        cog: undefined,
        thumbnail: undefined,
        quantity: undefined,
        created_at: "2024-01-01T00:00:00Z",
      };

      itemRepo.create.mockResolvedValue(createdItem);
      itemRepo.ensureInventory.mockResolvedValue(undefined);

      const result = await service.addProductItem(50, variant!);

      expect(itemRepo.create).toHaveBeenCalledWith({
        color: "Blue",
        colorHex: "#0000ff",
        size: "L",
        product_id: 50,
      });
      expect(itemRepo.ensureInventory).toHaveBeenCalledWith(99, 3);
      expect(result.quantity).toBe(3);
    });
  });

  describe("createProductPage", () => {
    it("creates page and assigns items", async () => {
      const payload: CreateProductPagePayload = {
        page: {
          product_id: 7,
          slug: "cashmere-coat",
          headline: "Cashmere Coat",
          subheadline: "Stay warm in style",
          hero_media: [],
          seo_metadata: null,
          is_active: true,
          is_affiliate_friendly: false,
          is_freeshipping: false,
        },
        itemIds: [11, 12],
        gallery: ["https://cdn.example.com/gallery-1.jpg"],
      };

      const createdPage: ProductPageEntity = {
        id: 44,
        product_id: 7,
        slug: "cashmere-coat",
        headline: "Cashmere Coat",
        subheadline: "Stay warm in style",
        hero_media: [],
        seo_metadata: undefined,
        is_active: true,
        is_affiliate_friendly: false,
        is_freeshipping: false,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: undefined,
      };

      const withRelations: ProductPageWithRelations = {
        page: createdPage,
        product: {
          id: 7,
          name: "Product name",
          retail_price: 100,
          description: undefined,
          category: undefined,
          thumbnail: undefined,
          retail_commission: undefined,
          wholesale_price: undefined,
          wholesale_commission: undefined,
          weight: undefined,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: undefined,
        },
        items: [],
        pageItems: [],
      };

      pageRepo.create.mockResolvedValue(createdPage);
      pageRepo.getBySlug.mockResolvedValue(withRelations);
      pageImageRepo.replaceForPage.mockResolvedValue([]);

      const result = await service.createProductPage(payload);

      const expectedPageItems = payload.itemIds?.map((itemId, index) => ({
        product_page_id: createdPage.id,
        item_id: itemId,
        display_order: index,
      }));

      expect(pageRepo.create).toHaveBeenCalledWith(payload.page);
      expect(pageItemRepo.upsertItems).toHaveBeenCalledWith(
        createdPage.id,
        expectedPageItems
      );
      expect(pageImageRepo.replaceForPage).toHaveBeenCalledWith(
        createdPage.id,
        payload.gallery
      );
      expect(pageRepo.getBySlug).toHaveBeenCalledWith("cashmere-coat");
      expect(result).toEqual(withRelations);
    });
  });

  describe("bulkUpdateInventory", () => {
    it("delegates to repository and returns refreshed snapshot", async () => {
      const adjustments: ProductInventoryAdjustment[] = [
        { itemId: 10, quantity: 5 },
      ];
      const snapshot: ProductInventorySnapshot = {
        product_id: 1,
        in_stock: 10,
        ordered: 2,
        in_delivery: 1,
        delivered: 5,
      };

      productRepo.getInventorySnapshot.mockResolvedValue(snapshot);

      const result = await service.bulkUpdateInventory(1, adjustments);

      expect(itemRepo.bulkUpdateQuantities).toHaveBeenCalledWith(1, adjustments);
      expect(productRepo.getInventorySnapshot).toHaveBeenCalledWith(1);
      expect(result).toEqual(snapshot);
    });
  });
});
