import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type {
  LeadEntity,
  LeadFilters,
  LeadItemEntity,
  LeadSummary,
  LeadWithItems,
  PaginatedLeadsResult,
  UpdateLeadItemInput,
  UpdateLeadInput,
  CreateLeadItemInput,
} from "../domain";

const leadsKey = ["leads"];
const leadDetailKey = (leadId: number) => [...leadsKey, leadId.toString()];
const leadItemsKey = (leadId: number) => [...leadsKey, leadId.toString(), "items"];
const leadSummaryKey = [...leadsKey, "summary"];

export type CreateLeadPayload = {
  lead: import("../domain").CreateLeadInput;
  items?: CreateLeadItemInput[];
};

export type UpdateLeadPayload = {
  lead?: UpdateLeadInput;
  items?: UpdateLeadItemInput[];
};

export type CreatePublicLeadPayload = {
  lead: Omit<
    CreateLeadPayload["lead"],
    "status" | "agent_id" | "partner_id" | "last_changed_status"
  >;
  items?: CreateLeadItemInput[];
  /** Optional partner id or username — validated server-side */
  ref?: string | number;
};

export const usePaginatedLeads = (
  filters: Omit<LeadFilters, "partnerId"> = {},
  page = 1,
  limit = 10,
  enabled = true
) => {
  const trimmedSearch = filters.search?.trim() ?? "";

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (filters.status) params.set("status", String(filters.status));
  if (trimmedSearch) params.set("search", trimmedSearch);

  return useStandardQuery(
    [
      ...leadsKey,
      "paginated",
      filters.status ?? "all",
      trimmedSearch || "nosearch",
      `page:${page}`,
      `limit:${limit}`,
    ],
    () =>
      apiFetch<PaginatedLeadsResult>(`/api/leads?${params.toString()}`),
    {
      enabled: enabled && (!trimmedSearch || trimmedSearch.length > 1),
      staleTime: 60 * 1000,
    }
  );
};

/** Compatibility wrapper — returns the page `data` array like the old list hook. */
export const useLeads = (
  filters?: LeadFilters,
  page = 1,
  limit = 10
) => {
  const query = usePaginatedLeads(
    {
      status: filters?.status,
      search: filters?.search,
      agentId: filters?.agentId,
    },
    page,
    limit
  );

  return {
    ...query,
    data: query.data?.data as LeadEntity[] | undefined,
    total: query.data?.total,
    page: query.data?.page,
    limit: query.data?.limit,
  };
};

export const useLead = (leadId: number) => {
  return useStandardQuery(
    leadDetailKey(leadId),
    () => apiFetch<LeadWithItems>(`/api/leads/${leadId}`),
    {
      enabled: leadId > 0,
      staleTime: 60 * 1000,
    }
  );
};

export const useLeadItems = (leadId: number) => {
  return useStandardQuery(
    leadItemsKey(leadId),
    () => apiFetch<LeadItemEntity[]>(`/api/leads/${leadId}/items`),
    {
      enabled: leadId > 0,
      staleTime: 60 * 1000,
    }
  );
};

export const useLeadSummary = () => {
  return useStandardQuery(
    leadSummaryKey,
    () => apiFetch<LeadSummary>("/api/leads/summary"),
    {
      staleTime: 5 * 60 * 1000,
    }
  );
};

export const useCreateLead = () => {
  return useStandardMutation(
    (payload: CreateLeadPayload) =>
      apiFetch<LeadWithItems>("/api/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    {
      invalidateQueries: [leadsKey, leadSummaryKey],
      successMessage: "Lead created successfully",
      errorMessage: "Failed to create lead",
    }
  );
};

/** Storefront / unauthenticated lead submit */
export const useCreatePublicLead = () => {
  return useStandardMutation(
    (payload: CreatePublicLeadPayload) =>
      apiFetch<LeadWithItems>("/api/leads/public", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    {
      invalidateQueries: [leadsKey, leadSummaryKey],
      successMessage: "Lead created successfully",
      errorMessage: "Failed to create lead",
    }
  );
};

export const useUpdateLead = () => {
  return useStandardMutation(
    ({
      leadId,
      payload,
    }: {
      leadId: number;
      payload: UpdateLeadPayload;
    }) =>
      apiFetch<LeadWithItems>(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    {
      invalidateQueries: [leadsKey],
      successMessage: "Lead updated successfully",
      errorMessage: "Failed to update lead",
    }
  );
};

export const useReplaceLeadItems = () => {
  return useStandardMutation(
    ({
      leadId,
      items,
    }: {
      leadId: number;
      items: UpdateLeadItemInput[];
    }) =>
      apiFetch<LeadItemEntity[]>(`/api/leads/${leadId}/items`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      }),
    {
      invalidateQueries: [leadsKey],
      successMessage: "Lead items updated",
      errorMessage: "Failed to update lead items",
    }
  );
};

export const useDeleteLead = () => {
  return useStandardMutation(
    (leadId: number) =>
      apiFetch<{ success: boolean }>(`/api/leads/${leadId}`, {
        method: "DELETE",
      }),
    {
      invalidateQueries: [leadsKey, leadSummaryKey],
      successMessage: "Lead deleted",
      errorMessage: "Failed to delete lead",
    }
  );
};
