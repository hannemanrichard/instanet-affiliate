import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/shared/utils/apiFetch";
import type { EarningsSummary, WithdrawEntity, WithdrawStatus } from "../domain";

const earningsKey = ["earnings"];
const earningsSummaryKey = [...earningsKey, "summary"];

export const useEarningsSummary = (scope: string, enabled = true) => {
  return useStandardQuery(
    [...earningsSummaryKey, scope],
    () => apiFetch<EarningsSummary>("/api/earnings"),
    {
      enabled,
      staleTime: 60 * 1000,
    }
  );
};

export const useRequestWithdraw = (scope: string) => {
  const queryClient = useQueryClient();
  const scopedSummaryKey = [...earningsSummaryKey, scope];

  return useStandardMutation(
    (amount: number) =>
      apiFetch<WithdrawEntity>("/api/earnings/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount }),
      }),
    {
      onSuccess: (withdraw) => {
        queryClient.setQueryData<EarningsSummary | undefined>(scopedSummaryKey, (current) => {
            if (!current) return current;

            const nextPending = current.pendingWithdrawTotal + withdraw.amount;
            const nextWithdrawn = current.paidWithdrawTotal + nextPending;

            return {
              ...current,
              pendingWithdrawTotal: nextPending,
              withdrawnTotal: nextWithdrawn,
              availableToWithdraw: Math.max(0, current.readyTotal - nextWithdrawn),
              withdraws: [withdraw, ...current.withdraws],
            };
          }
        );
      },
      invalidateQueries: [earningsKey],
      successMessage: "Withdraw request submitted",
      errorMessage: "Failed to request withdraw",
    }
  );
};

export const useUpdateWithdrawStatus = () => {
  return useStandardMutation(
    ({
      withdrawId,
      status,
    }: {
      withdrawId: number;
      status: Exclude<WithdrawStatus, "pending">;
    }) =>
      apiFetch<WithdrawEntity>(`/api/earnings/withdraw/${withdrawId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    {
      invalidateQueries: [earningsKey],
      successMessage: "Withdraw request updated",
      errorMessage: "Failed to update withdraw request",
    }
  );
};
