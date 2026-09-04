"use client";

import { useStandardMutation } from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type { PartnerEntity, UpdatePaymentInput } from "../domain";

export const useUpdatePaymentSettings = () => {
  return useStandardMutation<{ partner: PartnerEntity }, UpdatePaymentInput>(
    (data) =>
      apiFetch<{ partner: PartnerEntity }>("/api/partner/me/payment", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    {
      invalidateQueries: [["partners", "current"]],
      showSuccessToast: true,
      successMessage: "Payment settings saved",
      showErrorToast: true,
      errorMessage: "Failed to save payment settings",
    }
  );
};
