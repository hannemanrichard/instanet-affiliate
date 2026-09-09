export const MARKETPLACE_POST_STATUSES = [
  "draft_opened",
  "published",
  "failed",
] as const;

export type MarketplacePostStatus = (typeof MARKETPLACE_POST_STATUSES)[number];

export interface MarketplacePostEntity {
  id: number;
  partner_id: number;
  partner_email: string;
  product_page_id: number;
  product_title: string;
  product_price: number;
  currency: string;
  location?: string;
  status: MarketplacePostStatus;
  marketplace_post_url?: string;
  extension_version?: string;
  error_message?: string;
  metadata: Record<string, unknown>;
  draft_opened_at: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  partner_name?: string;
  partner_avatar?: string;
}

export interface CreateMarketplacePostInput {
  partner_id: number;
  partner_email: string;
  product_page_id: number;
  product_title: string;
  product_price: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMarketplacePostFromExtensionInput {
  status: "published" | "failed";
  location?: string | null;
  marketplace_post_url?: string | null;
  extension_version?: string | null;
  error_message?: string | null;
  metadata?: Record<string, unknown>;
}
