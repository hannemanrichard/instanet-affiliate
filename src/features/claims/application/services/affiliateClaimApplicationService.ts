import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import { OrderError } from "@/features/orders/domain";
import { SupabaseAffiliateClaimService } from "../../data";
import type {
  AffiliateClaimEntity,
  CreateAffiliateClaimInput,
  UpdateAffiliateClaimStatusInput,
} from "../../domain";
import { ClaimError } from "../../domain";
import type {
  AffiliateClaimListFilters,
  AffiliateClaimPagination,
  AffiliateClaimRepository,
  PaginatedAffiliateClaimsResult,
} from "../../domain/repositories";

export class AffiliateClaimApplicationService {
  constructor(private readonly claimRepository: AffiliateClaimRepository) {}

  async listClaims(
    filters: AffiliateClaimListFilters,
    pagination: AffiliateClaimPagination
  ): Promise<PaginatedAffiliateClaimsResult> {
    try {
      return await this.claimRepository.list(filters, pagination);
    } catch (error) {
      if (error instanceof ClaimError) throw error;
      throw new ClaimError("Failed to load claims", "CLAIM_FETCH_FAILED");
    }
  }

  async getClaimById(id: number): Promise<AffiliateClaimEntity | null> {
    try {
      return await this.claimRepository.getById(id);
    } catch (error) {
      if (error instanceof ClaimError) throw error;
      throw new ClaimError("Failed to load claim", "CLAIM_FETCH_FAILED");
    }
  }

  async createClaim(
    input: CreateAffiliateClaimInput
  ): Promise<AffiliateClaimEntity> {
    try {
      let orderDetail;
      try {
        orderDetail = await orderApplicationService.getOrderDetail(input.order_id);
      } catch (error) {
        if (error instanceof OrderError && error.code === "ORDER_NOT_FOUND") {
          throw new ClaimError("Order not found", "CLAIM_ORDER_NOT_FOUND");
        }
        throw error;
      }

      if (orderDetail.order.partner_id !== input.partner_id) {
        throw new ClaimError(
          "Order does not belong to this affiliate",
          "CLAIM_ORDER_FORBIDDEN"
        );
      }

      return await this.claimRepository.create({
        ...input,
        title: input.title.trim(),
        description: input.description.trim(),
        attachments: input.attachments ?? [],
      });
    } catch (error) {
      if (error instanceof ClaimError) throw error;
      throw new ClaimError("Failed to create claim", "CLAIM_CREATE_FAILED");
    }
  }

  async updateClaimStatus(
    id: number,
    input: UpdateAffiliateClaimStatusInput
  ): Promise<AffiliateClaimEntity> {
    try {
      const existing = await this.claimRepository.getById(id);
      if (!existing) {
        throw new ClaimError("Claim not found", "CLAIM_NOT_FOUND");
      }

      return await this.claimRepository.updateStatus(id, {
        status: input.status,
        admin_notes: input.admin_notes ?? null,
        resolved_by: input.resolved_by ?? null,
      });
    } catch (error) {
      if (error instanceof ClaimError) throw error;
      throw new ClaimError(
        "Failed to update claim status",
        "CLAIM_UPDATE_FAILED"
      );
    }
  }
}

export const affiliateClaimApplicationService =
  new AffiliateClaimApplicationService(new SupabaseAffiliateClaimService());
