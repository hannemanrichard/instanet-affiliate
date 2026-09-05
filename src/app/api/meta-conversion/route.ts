import { supabaseServer } from "@/infrastructure/supabase/server";
import logger from "@/shared/utils/logger";
import {
  trackMetaLead,
  trackMetaPurchase,
  type MetaConversionEvent,
} from "@/shared/utils/metaConversionApi";
import { NextRequest, NextResponse } from "next/server";
import { metaConversionBodySchema } from "@/shared/server/requestSchemas";
import { parseJsonBody, ValidationError } from "@/shared/server/parseRequest";
import {
  applyRateLimit,
  createRateLimitResponse,
} from "@/shared/server/rateLimit";

/**
 * POST /api/meta-conversion
 * Track events via Meta Conversion API (server-side).
 */
export async function POST(req: NextRequest) {
  try {
    const rateLimit = applyRateLimit(req, {
      bucket: "meta-conversion",
      limit: 30,
      windowMs: 5 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(
        "Too many Meta Conversion requests",
        rateLimit.retryAfterSeconds
      );
    }

    const { eventType, eventData } = await parseJsonBody(
      req,
      metaConversionBodySchema
    );

    const { data: settings, error: settingsError } = await supabaseServer
      .from("settings")
      .select("key, value")
      .in("key", ["facebook_pixel_id", "meta_conversion_api_access_token"])
      .eq("is_active", true);

    if (settingsError) {
      logger.error("Failed to fetch settings", settingsError);
      return NextResponse.json(
        { error: "Failed to fetch settings" },
        { status: 500 }
      );
    }

    const pixelIdSetting = settings?.find((s) => s.key === "facebook_pixel_id");
    const accessTokenSetting = settings?.find(
      (s) => s.key === "meta_conversion_api_access_token"
    );

    if (!pixelIdSetting?.value) {
      logger.warn("Facebook Pixel ID not configured");
      return NextResponse.json(
        { error: "Facebook Pixel ID not configured" },
        { status: 400 }
      );
    }

    if (!accessTokenSetting?.value) {
      logger.warn(
        "Meta Conversion API access token not configured - skipping server-side tracking"
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        message:
          "Meta Conversion API not configured - using client-side tracking only",
      });
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";

    const userData: MetaConversionEvent["userData"] = {
      ...eventData.userData,
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    let result;
    if (eventType === "Purchase") {
      result = await trackMetaPurchase(
        pixelIdSetting.value,
        accessTokenSetting.value,
        {
          value: eventData.value || 0,
          currency: eventData.currency || "DZD",
          content_name: eventData.content_name,
          content_ids: eventData.content_ids,
          num_items: eventData.num_items,
          userData,
          eventId: eventData.eventId,
          eventSourceUrl: eventData.eventSourceUrl,
        }
      );
    } else {
      result = await trackMetaLead(
        pixelIdSetting.value,
        accessTokenSetting.value,
        {
          userData,
          eventId: eventData.eventId,
          eventSourceUrl: eventData.eventSourceUrl,
          value: eventData.value,
          currency: eventData.currency,
        }
      );
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    logger.error(
      "Error in Meta Conversion API route",
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
