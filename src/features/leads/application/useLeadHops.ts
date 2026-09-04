import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type {
  CreateLeadHopInput,
  LeadHopEntity,
  UpdateLeadHopInput,
} from "../domain";

const leadHopsKey = ["lead-hops"];
const leadHopsByLeadKey = (leadId: number) => [
  ...leadHopsKey,
  "lead",
  leadId.toString(),
];
const leadHopsByAgentKey = (agentId: number) => [
  ...leadHopsKey,
  "agent",
  agentId.toString(),
];
const leadHopKey = (leadId: number, agentId: number) => [
  ...leadHopsKey,
  leadId.toString(),
  agentId.toString(),
];

/**
 * Hook to fetch all lead hops
 */
export const useLeadHops = () => {
  return useStandardQuery(
    leadHopsKey,
    () => apiFetch<LeadHopEntity[]>("/api/leads/hops"),
    {
      staleTime: 60 * 1000,
    }
  );
};

/**
 * Hook to fetch lead hops for a specific lead
 * @param leadId - The ID of the lead
 */
export const useLeadHopsByLeadId = (leadId: number) => {
  return useStandardQuery(
    leadHopsByLeadKey(leadId),
    () =>
      apiFetch<LeadHopEntity[]>(`/api/leads/hops?leadId=${leadId}`),
    {
      enabled: leadId > 0,
      staleTime: 60 * 1000,
    }
  );
};

/**
 * Hook to fetch lead hops for a specific agent
 * @param agentId - The ID of the agent
 */
export const useLeadHopsByAgentId = (agentId: number) => {
  return useStandardQuery(
    leadHopsByAgentKey(agentId),
    () =>
      apiFetch<LeadHopEntity[]>(`/api/leads/hops?agentId=${agentId}`),
    {
      enabled: agentId > 0,
      staleTime: 60 * 1000,
    }
  );
};

/**
 * Hook to fetch a specific lead hop
 * @param leadId - The ID of the lead
 * @param agentId - The ID of the agent
 */
export const useLeadHop = (leadId: number, agentId: number) => {
  return useStandardQuery(
    leadHopKey(leadId, agentId),
    () =>
      apiFetch<LeadHopEntity | null>(
        `/api/leads/hops/${leadId}/${agentId}`
      ),
    {
      enabled: leadId > 0 && agentId > 0,
      staleTime: 60 * 1000,
    }
  );
};

/**
 * Hook to create a new lead hop
 */
export const useCreateLeadHop = () => {
  return useStandardMutation(
    (data: CreateLeadHopInput) =>
      apiFetch<LeadHopEntity>("/api/leads/hops", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    {
      invalidateQueries: [leadHopsKey],
      successMessage: "Lead hop created successfully",
      errorMessage: "Failed to create lead hop",
    }
  );
};

/**
 * Hook to update a lead hop
 */
export const useUpdateLeadHop = () => {
  return useStandardMutation(
    ({
      leadId,
      agentId,
      data,
    }: {
      leadId: number;
      agentId: number;
      data: UpdateLeadHopInput;
    }) =>
      apiFetch<LeadHopEntity>(`/api/leads/hops/${leadId}/${agentId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    {
      invalidateQueries: [leadHopsKey],
      successMessage: "Lead hop updated successfully",
      errorMessage: "Failed to update lead hop",
    }
  );
};

/**
 * Hook to delete a specific lead hop
 */
export const useDeleteLeadHop = () => {
  return useStandardMutation(
    ({ leadId, agentId }: { leadId: number; agentId: number }) =>
      apiFetch<{ success: boolean }>(
        `/api/leads/hops/${leadId}/${agentId}`,
        { method: "DELETE" }
      ),
    {
      invalidateQueries: [leadHopsKey],
      successMessage: "Lead hop deleted",
      errorMessage: "Failed to delete lead hop",
    }
  );
};

/**
 * Hook to delete all lead hops for a specific lead
 */
export const useDeleteLeadHopsByLeadId = () => {
  return useStandardMutation(
    (leadId: number) =>
      apiFetch<{ success: boolean }>(`/api/leads/${leadId}/hops`, {
        method: "DELETE",
      }),
    {
      invalidateQueries: [leadHopsKey],
      successMessage: "Lead hops deleted",
      errorMessage: "Failed to delete lead hops",
    }
  );
};
