// Domain Entities for Settings feature

export interface SettingEntity {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type SettingKey =
  | "facebook_pixel_id"
  | "tiktok_pixel_id"
  | "google_analytics_id"
  | "microsoft_clarity_id"
  | "meta_conversion_api_access_token";

export interface SettingsMap {
  facebook_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  google_analytics_id?: string | null;
  microsoft_clarity_id?: string | null;
  meta_conversion_api_access_token?: string | null;
}

