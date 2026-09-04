import { supabaseAdmin } from "@/infrastructure/supabase/client";
import logger from "@/shared/utils/logger";
import {
  trackMetaLead,
  trackMetaPurchase,
  type MetaConversionEvent,
} from "@/shared/utils/metaConversionApi";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/meta-conversion
 *
 * Track events via Meta Conversion API (server-side)
 *
 * Body:
 * {
 *   eventType: "Purchase" | "Lead",
 *   eventData: {
 *     value?: number;
 *     currency?: string;
 *     content_name?: string;
 *     content_ids?: string[];
 *     num_items?: number;
 *     userData?: {
 *       em?: string[];
 *       ph?: string[];
 *       fn?: string[];
 *       ln?: string[];
 *       external_id?: string[];
 *       client_ip_address?: string;
 *       client_user_agent?: string;
 *       fbp?: string;
 *       fbc?: string;
 *     };
 *     eventId?: string;
 *     eventSourceUrl?: string;
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, eventData } = body;

    if (!eventType || !eventData) {
      return NextResponse.json(
        { error: "Missing required fields: eventType and eventData" },
        { status: 400 }
      );
    }

    if (!["Purchase", "Lead"].includes(eventType)) {
      return NextResponse.json(
        { error: "Invalid eventType. Must be 'Purchase' or 'Lead'" },
        { status: 400 }
      );
    }

    // Get settings from database
    // Use service role client for reading settings (no auth required)
    if (!supabaseAdmin) {
      logger.error(
        "Supabase service role client not configured. SUPABASE_SERVICE_ROLE_KEY is missing."
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = supabaseAdmin;
    const { data: settings, error: settingsError } = await supabase
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

    // Extract pixel ID and access token
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
      // Return success but don't track - client-side pixel tracking will still work
      return NextResponse.json({
        success: true,
        skipped: true,
        message:
          "Meta Conversion API not configured - using client-side tracking only",
      });
    }

    // Get client IP and user agent from request
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";

    // Prepare user data with IP and user agent
    const userData: MetaConversionEvent["userData"] = {
      ...eventData.userData,
      client_ip_address: clientIp,
      client_user_agent: userAgent,
    };

    // Track the event
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
    } else if (eventType === "Lead") {
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
