import { SupabaseProductPageService } from "@/features/products/data";
import { SupabaseMarketplacePostService } from "../../data";
import type {
  CreateMarketplacePostInput,
  MarketplacePostEntity,
  UpdateMarketplacePostFromExtensionInput,
} from "../../domain";
import { MarketplacePostError } from "../../domain";
import type {
  MarketplacePostListFilters,
  MarketplacePostPagination,
  MarketplacePostRepository,
  PaginatedMarketplacePostsResult,
} from "../../domain/repositories";

const productPageService = new SupabaseProductPageService();

export class MarketplacePostApplicationService {
  constructor(private readonly repository: MarketplacePostRepository) {}

  async listPosts(
    filters: MarketplacePostListFilters,
    pagination: MarketplacePostPagination
  ): Promise<PaginatedMarketplacePostsResult> {
    try {
      return await this.repository.list(filters, pagination);
    } catch (error) {
      if (error instanceof MarketplacePostError) throw error;
      throw new MarketplacePostError(
        "Failed to load marketplace posts",
        "MARKETPLACE_POST_FETCH_FAILED"
      );
    }
  }

  async getById(id: number): Promise<MarketplacePostEntity | null> {
    try {
      return await this.repository.getById(id);
    } catch (error) {
      if (error instanceof MarketplacePostError) throw error;
      throw new MarketplacePostError(
        "Failed to load marketplace post",
        "MARKETPLACE_POST_FETCH_FAILED"
      );
    }
  }

  async createDraftOpened(
    input: CreateMarketplacePostInput
  ): Promise<MarketplacePostEntity> {
    try {
      const page = await productPageService.getById(input.product_page_id);
      if (!page) {
        throw new MarketplacePostError(
          "Product page not found",
          "MARKETPLACE_POST_PRODUCT_NOT_FOUND"
        );
      }

      return await this.repository.create({
        ...input,
        product_title: input.product_title.trim(),
        partner_email: input.partner_email.trim().toLowerCase(),
        currency: input.currency?.trim() || "DZD",
      });
    } catch (error) {
      if (error instanceof MarketplacePostError) throw error;
      throw new MarketplacePostError(
        "Failed to create marketplace post",
        "MARKETPLACE_POST_CREATE_FAILED"
      );
    }
  }

  async updateFromExtension(
    id: number,
    input: UpdateMarketplacePostFromExtensionInput
  ): Promise<MarketplacePostEntity> {
    try {
      const existing = await this.repository.getById(id);
      if (!existing) {
        throw new MarketplacePostError(
          "Marketplace post not found",
          "MARKETPLACE_POST_NOT_FOUND"
        );
      }

      if (existing.status !== "draft_opened") {
        throw new MarketplacePostError(
          "Marketplace post already finalized",
          "MARKETPLACE_POST_ALREADY_FINALIZED"
        );
      }

      return await this.repository.updateFromExtension(id, {
        ...input,
        metadata: {
          ...existing.metadata,
          ...(input.metadata ?? {}),
        },
      });
    } catch (error) {
      if (error instanceof MarketplacePostError) throw error;
      throw new MarketplacePostError(
        "Failed to update marketplace post",
        "MARKETPLACE_POST_UPDATE_FAILED"
      );
    }
  }
}

export const marketplacePostApplicationService =
  new MarketplacePostApplicationService(new SupabaseMarketplacePostService());
