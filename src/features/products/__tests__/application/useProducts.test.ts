import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import {
  useAdminProducts,
  useBulkInventoryUpdate,
  useProduct,
  useProductCatalog,
  useProductInventory,
  useProductItems,
  useProductPage,
  useProductPageSearch,
  useUpdateProduct,
  useUpdateProductPage,
} from "../../application/useProducts";
import { apiFetch } from "@/shared/utils/apiFetch";

jest.mock("@/shared/utils/apiFetch");
jest.mock("@/shared/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("Products hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches catalog data", async () => {
    const mockCatalog = [{ id: 1, name: "Product" }];
    mockApiFetch.mockResolvedValue(mockCatalog);

    const { result } = renderHook(() => useProductCatalog(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCatalog);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/products/catalog");
  });

  it("searches product pages when term provided", async () => {
    const mockPages = [{ id: 1, slug: "product" }];
    mockApiFetch.mockResolvedValue(mockPages);

    const { result } = renderHook(() => useProductPageSearch("pro"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPages);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/product-pages/search?q=pro"
    );
  });

  it("fetches product page by slug", async () => {
    const mockPage = { page: { id: 1, slug: "product" } };
    mockApiFetch.mockResolvedValue(mockPage);

    const { result } = renderHook(() => useProductPage("product"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPage);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/product-pages/by-slug/product"
    );
  });

  it("fetches admin products", async () => {
    const mockProducts = [{ id: 1, name: "Product" }];
    mockApiFetch.mockResolvedValue(mockProducts);

    const { result } = renderHook(() => useAdminProducts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProducts);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/products/admin");
  });

  it("fetches product items", async () => {
    const mockItems = [{ id: 1, product_id: 1 }];
    mockApiFetch.mockResolvedValue(mockItems);

    const { result } = renderHook(() => useProductItems(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockItems);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/products/1/items");
  });

  it("fetches product by id", async () => {
    const mockProduct = { id: 1, name: "Product" };
    mockApiFetch.mockResolvedValue(mockProduct);

    const { result } = renderHook(() => useProduct(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProduct);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/products/1");
  });

  it("fetches product inventory", async () => {
    const mockInventory = {
      product_id: 1,
      in_stock: 10,
      ordered: 0,
      in_delivery: 0,
      delivered: 0,
    };
    mockApiFetch.mockResolvedValue(mockInventory);

    const { result } = renderHook(() => useProductInventory(1), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockInventory);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/products/1/inventory");
  });

  it("updates product via mutation", async () => {
    mockApiFetch.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      productId: 1,
      payload: {
        product: { name: "Updated" },
      },
    });

    expect(mockApiFetch).toHaveBeenCalledWith("/api/products/1", {
      method: "PATCH",
      body: JSON.stringify({ product: { name: "Updated" } }),
    });
  });

  it("updates product page via mutation", async () => {
    mockApiFetch.mockResolvedValue({
      id: 1,
      slug: "product",
    });

    const { result } = renderHook(() => useUpdateProductPage(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      pageId: 1,
      payload: { headline: "Updated headline" },
    });

    expect(mockApiFetch).toHaveBeenCalledWith("/api/product-pages/1", {
      method: "PATCH",
      body: JSON.stringify({ headline: "Updated headline" }),
    });
  });

  it("updates inventory via mutation", async () => {
    const snapshot = {
      product_id: 1,
      in_stock: 5,
      ordered: 0,
      in_delivery: 0,
      delivered: 0,
    };
    mockApiFetch.mockResolvedValue(snapshot);

    const { result } = renderHook(() => useBulkInventoryUpdate(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      productId: 1,
      adjustments: [{ itemId: 1, quantity: 10 }],
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/products/1/inventory/bulk",
      {
        method: "POST",
        body: JSON.stringify({
          adjustments: [{ itemId: 1, quantity: 10 }],
        }),
      }
    );
  });
});
