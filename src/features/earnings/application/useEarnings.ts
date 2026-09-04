import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type { EarningsSummary, WithdrawEntity } from "../domain";

const earningsKey = ["earnings"];
const earningsSummaryKey = [...earningsKey, "summary"];

export const useEarningsSummary = (enabled = true) => {
  return useStandardQuery(
    earningsSummaryKey,
    () => apiFetch<EarningsSummary>("/api/earnings"),
    {
      enabled,
      staleTime: 60 * 1000,
    }
  );
};

export const useRequestWithdraw = () => {
  return useStandardMutation(
    (amount: number) =>
      apiFetch<WithdrawEntity>("/api/earnings/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
    {
      invalidateQueries: [earningsKey],
      successMessage: "Withdraw request submitted",
      errorMessage: "Failed to request withdraw",
    }
  );
};
