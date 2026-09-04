"use client";

import { useUser } from "@clerk/nextjs";
import { useStandardQuery } from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type { PartnerEntity } from "../domain";

const currentPartnerKey = ["partners", "current"];

export const useCurrentPartner = () => {
  const { isLoaded, isSignedIn } = useUser();

  const query = useStandardQuery(
    currentPartnerKey,
    () =>
      apiFetch<{ partner: PartnerEntity }>("/api/partner/me").then(
        (data) => data.partner
      ),
    {
      enabled: isLoaded && Boolean(isSignedIn),
      staleTime: 10 * 60 * 1000,
    }
  );

  return {
    partner: query.data ?? null,
    partnerId: query.data?.id ?? null,
    isLoading: !isLoaded || query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
