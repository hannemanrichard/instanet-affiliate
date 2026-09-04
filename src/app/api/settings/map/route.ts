import { NextResponse } from "next/server";
import { settingsApplicationService } from "@/features/settings/application/services/settingsApplicationService";
import type { SettingsMap } from "@/features/settings/domain";
import { jsonError } from "@/shared/server/jsonError";

/**
 * Public pixel IDs for storefront tracking scripts.
 * Never returns secrets such as meta_conversion_api_access_token.
 */
export async function GET() {
  try {
    const map = await settingsApplicationService.getSettingsMap();
    const publicMap: SettingsMap = {
      facebook_pixel_id: map.facebook_pixel_id,
      tiktok_pixel_id: map.tiktok_pixel_id,
      google_analytics_id: map.google_analytics_id,
      microsoft_clarity_id: map.microsoft_clarity_id,
    };
    return NextResponse.json(publicMap);
  } catch (error) {
    return jsonError(error);
  }
}
