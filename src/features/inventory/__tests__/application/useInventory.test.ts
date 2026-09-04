import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import {
  useBulkAdjustInventory,
  useItemInventory,
  useProductInventory,
  useProductInventoryPhases,
  useSoldUnitsByDateRange,
  useUpdateInventoryQuantity,
} from "../../application/useInventory";
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
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe("Inventory hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches inventory by product", async () => {
    const inventory = [{ inventory: { id: 1, item_id: 2, quantity: 5 } }];
    mockApiFetch.mockResolvedValue({ inventory });

    const { result } = renderHook(() => useProductInventory(5), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(inventory);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/inventory/products/5");
  });

  it("fetches inventory by item", async () => {
    const record = { id: 1, item_id: 2, quantity: 8 };
    mockApiFetch.mockResolvedValue({ inventory: record });

    const { result } = renderHook(() => useItemInventory(2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(record);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/inventory/items/2");
  });

  it("fetches phase summary", async () => {
    const summary = {
      product_id: 7,
      in_stock: 20,
      ordered: 5,
      in_delivery: 2,
      delivered: 10,
    };
    mockApiFetch.mockResolvedValue({ summary });

    const { result } = renderHook(() => useProductInventoryPhases(7), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(summary);
    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/inventory/products/7/phases"
    );
  });

  it("fetches sold units by date range", async () => {
    mockApiFetch.mockResolvedValue({
      soldUnits: [
        { key: "product1", value: 33 },
        { key: "product2", value: 12 },
      ],
    });

    const { result } = renderHook(
      () =>
        useSoldUnitsByDateRange({
          fromDate: "2026-03-01",
          toDate: "2026-03-31",
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([
      { key: "product1", value: 33 },
      { key: "product2", value: 12 },
    ]);
  });

  it("updates inventory quantity via mutation", async () => {
    mockApiFetch.mockResolvedValue({
      inventory: { id: 1, item_id: 2, quantity: 15 },
    });

    const { result } = renderHook(() => useUpdateInventoryQuantity(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({ inventoryId: 1, quantity: 15 });

    expect(mockApiFetch).toHaveBeenCalledWith("/api/inventory/1", {
      method: "PATCH",
      body: JSON.stringify({ quantity: 15 }),
    });
  });

  it("bulk adjusts inventory via mutation", async () => {
    const summary = {
      product_id: 5,
      in_stock: 25,
      ordered: 4,
      in_delivery: 1,
      delivered: 12,
    };
    mockApiFetch.mockResolvedValue({ summary });

    const { result } = renderHook(() => useBulkAdjustInventory(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      productId: 5,
      adjustments: [{ itemId: 2, quantity: 5 }],
    });

    expect(mockApiFetch).toHaveBeenCalledWith(
      "/api/inventory/products/5/bulk-adjust",
      {
        method: "POST",
        body: JSON.stringify({
          adjustments: [{ itemId: 2, quantity: 5 }],
        }),
      }
    );
  });
});
