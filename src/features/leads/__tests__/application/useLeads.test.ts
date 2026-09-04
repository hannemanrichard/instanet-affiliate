import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import {
  useCreateLead,
  useDeleteLead,
  useLead,
  useLeadItems,
  useLeadSummary,
  useLeads,
  useReplaceLeadItems,
  useUpdateLead,
} from "../../application/useLeads";
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

describe("Lead hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches leads", async () => {
    const page = {
      data: [{ id: 1 }],
      total: 1,
      page: 1,
      limit: 10,
    };
    mockApiFetch.mockResolvedValue(page);

    const { result } = renderHook(() => useLeads(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1 }]);
    expect(result.current.total).toBe(1);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads?page=1&limit=10");
  });

  it("fetches single lead", async () => {
    const leadDetail = { lead: { id: 1 }, items: [] };
    mockApiFetch.mockResolvedValue(leadDetail);

    const { result } = renderHook(() => useLead(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(leadDetail);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads/1");
  });

  it("fetches lead items", async () => {
    const items = [{ lead_id: 1, item_id: 2, qty: 3 }];
    mockApiFetch.mockResolvedValue(items);

    const { result } = renderHook(() => useLeadItems(1), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(items);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads/1/items");
  });

  it("fetches lead summary", async () => {
    const summary = {
      total_leads: 5,
      total_pending: 3,
      total_confirmed: 1,
      total_wholesale: 1,
    };
    mockApiFetch.mockResolvedValue(summary);

    const { result } = renderHook(() => useLeadSummary(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(summary);
    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads/summary");
  });

  it("creates lead via mutation", async () => {
    mockApiFetch.mockResolvedValue({
      lead: { id: 1 },
      items: [],
    });

    const { result } = renderHook(() => useCreateLead(), { wrapper: createWrapper() });

    await result.current.mutateAsync({
      lead: {
        first_name: "Jane",
        last_name: "Doe",
        phone: "123",
      } as any,
    });

    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads", {
      method: "POST",
      body: JSON.stringify({
        lead: {
          first_name: "Jane",
          last_name: "Doe",
          phone: "123",
        },
      }),
    });
  });

  it("updates lead", async () => {
    mockApiFetch.mockResolvedValue({
      lead: { id: 1 },
      items: [],
    });

    const { result } = renderHook(() => useUpdateLead(), { wrapper: createWrapper() });

    await result.current.mutateAsync({
      leadId: 1,
      payload: {
        lead: { status: "qualified" },
      },
    });

    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads/1", {
      method: "PATCH",
      body: JSON.stringify({
        lead: { status: "qualified" },
      }),
    });
  });

  it("replaces lead items", async () => {
    mockApiFetch.mockResolvedValue([]);

    const { result } = renderHook(() => useReplaceLeadItems(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      leadId: 1,
      items: [{ item_id: 2, qty: 4 }],
    });

    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads/1/items", {
      method: "PUT",
      body: JSON.stringify({ items: [{ item_id: 2, qty: 4 }] }),
    });
  });

  it("deletes lead", async () => {
    mockApiFetch.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useDeleteLead(), { wrapper: createWrapper() });

    await result.current.mutateAsync(1);

    expect(mockApiFetch).toHaveBeenCalledWith("/api/leads/1", {
      method: "DELETE",
    });
  });
});
