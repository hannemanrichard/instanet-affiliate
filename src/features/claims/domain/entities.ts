export const AFFILIATE_CLAIM_CATEGORIES = [
  "delivery_delay",
  "lost_parcel",
  "damaged",
  "wrong_item",
  "exchange_request",
  "contact_delivery_company",
  "other",
] as const;

export const AFFILIATE_CLAIM_STATUSES = [
  "open",
  "in_progress",
  "resolved",
  "rejected",
] as const;

export type AffiliateClaimCategory = (typeof AFFILIATE_CLAIM_CATEGORIES)[number];
export type AffiliateClaimStatus = (typeof AFFILIATE_CLAIM_STATUSES)[number];

export interface AffiliateClaimAttachmentEntity {
  id: number;
  claim_id: number;
  file_url: string;
  file_name?: string;
  file_type?: string;
  created_at: string;
}

export interface AffiliateClaimEntity {
  id: number;
  partner_id: number;
  order_id: number;
  category: AffiliateClaimCategory;
  title: string;
  description: string;
  status: AffiliateClaimStatus;
  admin_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  attachments: AffiliateClaimAttachmentEntity[];
  partner_name?: string;
  partner_email?: string;
  partner_avatar?: string;
  order_product?: string;
  order_status?: string;
  order_tracking_id?: string;
  order_customer_name?: string;
  order_phone?: string;
  order_wilaya?: string;
  order_commune?: string;
}

export interface CreateAffiliateClaimAttachmentInput {
  file_url: string;
  file_name?: string;
  file_type?: string;
}

export interface CreateAffiliateClaimInput {
  partner_id: number;
  order_id: number;
  category: AffiliateClaimCategory;
  title: string;
  description: string;
  attachments?: CreateAffiliateClaimAttachmentInput[];
}

export interface UpdateAffiliateClaimStatusInput {
  status: AffiliateClaimStatus;
  admin_notes?: string | null;
  resolved_by?: string | null;
}
