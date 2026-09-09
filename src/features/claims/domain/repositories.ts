import type {
  AffiliateClaimEntity,
  CreateAffiliateClaimInput,
  UpdateAffiliateClaimStatusInput,
} from "./entities";

export interface AffiliateClaimListFilters {
  partnerId?: number;
  status?: AffiliateClaimEntity["status"];
}

export interface AffiliateClaimPagination {
  page: number;
  limit: number;
}

export interface PaginatedAffiliateClaimsResult {
  claims: AffiliateClaimEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface AffiliateClaimRepository {
  list(
    filters: AffiliateClaimListFilters,
    pagination: AffiliateClaimPagination
  ): Promise<PaginatedAffiliateClaimsResult>;
  getById(id: number): Promise<AffiliateClaimEntity | null>;
  create(input: CreateAffiliateClaimInput): Promise<AffiliateClaimEntity>;
  updateStatus(
    id: number,
    input: UpdateAffiliateClaimStatusInput
  ): Promise<AffiliateClaimEntity>;
}
