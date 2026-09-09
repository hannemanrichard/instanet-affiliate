import { useStandardQuery } from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import type {
  MarketplacePostEntity,
  MarketplacePostStatus,
} from "../../domain";

type MarketplacePostsListResponse = {
  posts: MarketplacePostEntity[];
  total: number;
  page: number;
  limit: number;
};

export const useMarketplacePosts = (params?: {
  status?: MarketplacePostStatus;
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
      "marketplace-posts",
      params?.status ?? "all",
      `page:${params?.page ?? 1}`,
      `limit:${params?.limit ?? 25}`,
    ],
    () =>
      apiFetch<MarketplacePostsListResponse>(
        `/api/dashboard/marketplace-posts${query ? `?${query}` : ""}`
      ),
    {
      enabled: params?.enabled ?? true,
      staleTime: 30 * 1000,
    }
  );
};
