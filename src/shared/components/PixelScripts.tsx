"use client";

import { useEffect } from "react";
import { useSettingsMap } from "@/features/settings";
import {
  initFacebookPixel,
  initTikTokPixel,
  initGoogleAnalytics,
  initMicrosoftClarity,
} from "@/shared/utils/pixelTracking";
import logger from "../utils/logger";

/**
 * Defer pixel scripts loading until after page load to improve performance.
 * This prevents tracking scripts from blocking page rendering.
 */
const loadPixelsDeferred = (callback: () => void) => {
  // Wait for page to be fully loaded
  if (document.readyState === "complete") {
    // Use requestIdleCallback if available (better performance)
    if ("requestIdleCallback" in window) {
      requestIdleCallback(callback, { timeout: 2000 });
    } else {
      // Fallback: delay by 1 second after page load
      setTimeout(callback, 1000);
    }
  } else {
    // Wait for window load event, then defer
    window.addEventListener("load", () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(callback, { timeout: 2000 });
      } else {
        setTimeout(callback, 1000);
      }
    });
  }
};

export const PixelScripts = () => {
  const { data: settingsMap } = useSettingsMap();

  useEffect(() => {
    if (!settingsMap) return;

    // Defer loading tracking scripts until after page load
    loadPixelsDeferred(() => {
      if (
        settingsMap.facebook_pixel_id &&
        settingsMap.facebook_pixel_id.trim()
      ) {
        initFacebookPixel(settingsMap.facebook_pixel_id.trim());
      }

      if (settingsMap.tiktok_pixel_id) {
        const raw = settingsMap.tiktok_pixel_id;
        if (raw && typeof raw === "string" && raw.trim()) {
          logger.info("TikTok Pixel ID(s): %s", raw.trim());
          initTikTokPixel(raw.trim());
        }
      }

      if (
        settingsMap.google_analytics_id &&
        settingsMap.google_analytics_id.trim()
      ) {
        initGoogleAnalytics(settingsMap.google_analytics_id.trim());
      }

      if (
        settingsMap.microsoft_clarity_id &&
        settingsMap.microsoft_clarity_id.trim()
      ) {
        initMicrosoftClarity(settingsMap.microsoft_clarity_id.trim());
      }
    });
  }, [
    settingsMap?.facebook_pixel_id,
    settingsMap?.tiktok_pixel_id,
    settingsMap?.google_analytics_id,
    settingsMap?.microsoft_clarity_id,
  ]);

  return null;
};
