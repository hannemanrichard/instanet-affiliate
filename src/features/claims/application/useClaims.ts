import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type {
  AffiliateClaimEntity,
  AffiliateClaimStatus,
  CreateAffiliateClaimAttachmentInput,
  CreateAffiliateClaimInput,
} from "../domain";

type CreateClaimClientInput = Omit<CreateAffiliateClaimInput, "partner_id"> & {
  attachments?: CreateAffiliateClaimAttachmentInput[];
};

type UpdateClaimStatusClientInput = {
  id: number;
  status: AffiliateClaimStatus;
  admin_notes?: string | null;
};

type ClaimsListResponse = {
  claims: AffiliateClaimEntity[];
  total: number;
  page: number;
  limit: number;
};

export const useAffiliateClaims = (params?: {
  status?: AffiliateClaimStatus;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) => {
  const search = new URLSearchParams();
  if (params?.status) search.set("status", params.status);
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  const query = search.toString();

  return useStandardQuery(
    [
      "claims",
      params?.status ?? "all",
      `page:${params?.page ?? 1}`,
      `limit:${params?.limit ?? 20}`,
    ],
    () =>
      apiFetch<ClaimsListResponse>(
        `/api/claims${query ? `?${query}` : ""}`
      ),
    {
      enabled: params?.enabled ?? true,
      staleTime: 30 * 1000,
    }
  );
};

export const useCreateAffiliateClaim = () =>
  useStandardMutation<AffiliateClaimEntity, CreateClaimClientInput>(
    (input) =>
      apiFetch<AffiliateClaimEntity>("/api/claims", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    {
      invalidateQueries: [["claims"]],
      successMessage: "Claim submitted successfully",
      errorMessage: "Unable to submit claim",
    }
  );

export const useUpdateAffiliateClaimStatus = () =>
  useStandardMutation<AffiliateClaimEntity, UpdateClaimStatusClientInput>(
    ({ id, ...body }) =>
      apiFetch<AffiliateClaimEntity>(`/api/dashboard/claims/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    {
      invalidateQueries: [["claims"]],
      successMessage: "Claim updated successfully",
      errorMessage: "Unable to update claim",
    }
  );
