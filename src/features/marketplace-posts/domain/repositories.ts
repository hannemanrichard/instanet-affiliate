import type {
  CreateMarketplacePostInput,
  MarketplacePostEntity,
  MarketplacePostStatus,
  UpdateMarketplacePostFromExtensionInput,
} from "./entities";

export interface MarketplacePostListFilters {
  partnerId?: number;
  status?: MarketplacePostStatus;
}

export interface MarketplacePostPagination {
  page: number;
  limit: number;
}

export interface PaginatedMarketplacePostsResult {
  posts: MarketplacePostEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface MarketplacePostRepository {
  list(
    filters: MarketplacePostListFilters,
    pagination: MarketplacePostPagination
  ): Promise<PaginatedMarketplacePostsResult>;
  getById(id: number): Promise<MarketplacePostEntity | null>;
  create(input: CreateMarketplacePostInput): Promise<MarketplacePostEntity>;
  updateFromExtension(
    id: number,
    input: UpdateMarketplacePostFromExtensionInput
  ): Promise<MarketplacePostEntity>;
}
