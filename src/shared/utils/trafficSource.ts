/**
 * Utility to detect traffic source from URL parameters
 * Supports UTM parameters, Facebook Click ID (fbclid), and TikTok Click ID (ttclid)
 */

export type TrafficSource = "facebook" | "tiktok" | "storefront" | null;

/**
 * Detects the traffic source from URL search parameters
 * @param searchParams - URLSearchParams object from useSearchParams()
 * @returns The detected traffic source or null
 */
export const detectTrafficSource = (
  searchParams: URLSearchParams
): TrafficSource => {
  // Check for TikTok Click ID (ttclid) - most reliable indicator
  if (searchParams.has("ttclid")) {
    return "tiktok";
  }

  // Check for Facebook Click ID (fbclid) - most reliable indicator
  if (searchParams.has("fbclid")) {
    return "facebook";
  }

  // Check UTM source parameter
  const utmSource = searchParams.get("utm_source")?.toLowerCase();
  if (utmSource) {
    if (utmSource.includes("tiktok")) {
      return "tiktok";
    }
    if (utmSource.includes("facebook") || utmSource.includes("fb")) {
      return "facebook";
    }
  }

  // Check custom source parameter
  const source = searchParams.get("source")?.toLowerCase();
  if (source) {
    if (source === "tiktok") {
      return "tiktok";
    }
    if (source === "facebook" || source === "fb") {
      return "facebook";
    }
  }

  // Default to storefront if no source detected
  return null;
};

/**
 * Gets the channel value to store in the lead
 * @param source - The detected traffic source
 * @returns The channel string to store
 */
export const getChannelFromSource = (source: TrafficSource): string => {
  if (source === "facebook") {
    return "meta";
  }
  if (source === "tiktok") {
    return "tiktok";
  }
  return "storefront";
};
