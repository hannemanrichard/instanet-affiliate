/**
 * Meta Conversion API server-side tracking utilities
 *
 * This module provides server-side event tracking to Meta's Conversion API.
 * Unlike client-side pixel tracking, this cannot be blocked by ad blockers
 * and provides more reliable conversion tracking.
 */

import logger from "./logger";

export interface MetaConversionEvent {
  eventName: string;
  eventTime: number;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: {
    em?: string[]; // Email (hashed)
    ph?: string[]; // Phone (hashed)
    fn?: string[]; // First name (hashed)
    ln?: string[]; // Last name (hashed)
    external_id?: string[]; // External ID
    client_ip_address?: string; // IP address
    client_user_agent?: string; // User agent
    fbp?: string; // Facebook browser ID
    fbc?: string; // Facebook click ID
  };
  customData?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_ids?: string[];
    num_items?: number;
    content_type?: string;
  };
  actionSource?:
    | "website"
    | "email"
    | "app"
    | "phone_call"
    | "chat"
    | "physical_store"
    | "system_generated"
    | "other";
}

export interface MetaConversionApiResponse {
  events_received: number;
  messages?: Array<{
    message?: string;
    type?: string;
  }>;
  fbtrace_id?: string;
}

/**
 * Hash a value using SHA-256 for Meta Conversion API
 * Meta requires certain user data fields to be hashed
 */
const hashValue = async (value: string): Promise<string> => {
  if (typeof window !== "undefined") {
    // Client-side: use Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(value.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } else {
    // Server-side: use Node.js crypto
    const crypto = await import("crypto");
    return crypto
      .createHash("sha256")
      .update(value.toLowerCase().trim())
      .digest("hex");
  }
};

/**
 * Hash user data fields that require hashing
 */
const hashUserData = async (
  userData: MetaConversionEvent["userData"]
): Promise<MetaConversionEvent["userData"]> => {
  if (!userData) return undefined;

  const hashed: MetaConversionEvent["userData"] = {};

  if (userData.em) {
    hashed.em = await Promise.all(userData.em.map((email) => hashValue(email)));
  }

  if (userData.ph) {
    hashed.ph = await Promise.all(
      userData.ph.map((phone) => hashValue(phone.replace(/\D/g, "")))
    );
  }

  if (userData.fn) {
    hashed.fn = await Promise.all(userData.fn.map((name) => hashValue(name)));
  }

  if (userData.ln) {
    hashed.ln = await Promise.all(userData.ln.map((name) => hashValue(name)));
  }

  // Non-hashed fields
  if (userData.external_id) {
    hashed.external_id = userData.external_id;
  }
  if (userData.client_ip_address) {
    hashed.client_ip_address = userData.client_ip_address;
  }
  if (userData.client_user_agent) {
    hashed.client_user_agent = userData.client_user_agent;
  }
  if (userData.fbp) {
    hashed.fbp = userData.fbp;
  }
  if (userData.fbc) {
    hashed.fbc = userData.fbc;
  }

  return hashed;
};

/**
 * Send event to Meta Conversion API
 *
 * @param pixelId - Facebook Pixel ID
 * @param accessToken - Meta Conversion API access token
 * @param event - Event data to send
 * @returns Response from Meta API
 */
export const sendMetaConversionEvent = async (
  pixelId: string,
  accessToken: string,
  event: MetaConversionEvent
): Promise<MetaConversionApiResponse> => {
  try {
    // Hash user data if provided
    const hashedUserData = event.userData
      ? await hashUserData(event.userData)
      : undefined;

    // Prepare the event payload
    const payload = {
      data: [
        {
          event_name: event.eventName,
          event_time: event.eventTime,
          event_id: event.eventId,
          event_source_url: event.eventSourceUrl,
          user_data: hashedUserData,
          custom_data: event.customData,
          action_source: event.actionSource || "website",
        },
      ],
      access_token: accessToken,
    };

    // Send to Meta Conversion API
    const apiUrl = `https://graph.facebook.com/v21.0/${pixelId}/events`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMessage = `Meta Conversion API error: ${response.status} ${response.statusText}. ${errorText}`;
      logger.error("Meta Conversion API error", new Error(errorMessage));
      throw new Error(errorMessage);
    }

    const result: MetaConversionApiResponse = await response.json();

    logger.info("Meta Conversion API event sent", {
      eventName: event.eventName,
      eventsReceived: result.events_received,
      fbtraceId: result.fbtrace_id,
    });

    return result;
  } catch (error) {
    logger.error(
      "Failed to send Meta Conversion API event",
      error instanceof Error ? error : new Error(String(error))
    );
    throw error;
  }
};

/**
 * Track a Purchase event via Meta Conversion API
 */
export const trackMetaPurchase = async (
  pixelId: string,
  accessToken: string,
  purchaseData: {
    value: number;
    currency: string;
    content_name?: string;
    content_ids?: string[];
    num_items?: number;
    userData?: MetaConversionEvent["userData"];
    eventId?: string;
    eventSourceUrl?: string;
  }
): Promise<MetaConversionApiResponse> => {
  return sendMetaConversionEvent(pixelId, accessToken, {
    eventName: "Purchase",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: purchaseData.eventId,
    eventSourceUrl: purchaseData.eventSourceUrl,
    userData: purchaseData.userData,
    customData: {
      value: purchaseData.value,
      currency: purchaseData.currency,
      content_name: purchaseData.content_name,
      content_ids: purchaseData.content_ids,
      num_items: purchaseData.num_items,
      content_type: "product",
    },
    actionSource: "website",
  });
};

/**
 * Track a Lead event via Meta Conversion API
 */
export const trackMetaLead = async (
  pixelId: string,
  accessToken: string,
  leadData: {
    userData?: MetaConversionEvent["userData"];
    eventId?: string;
    eventSourceUrl?: string;
    value?: number;
    currency?: string;
  }
): Promise<MetaConversionApiResponse> => {
  return sendMetaConversionEvent(pixelId, accessToken, {
    eventName: "Lead",
    eventTime: Math.floor(Date.now() / 1000),
    eventId: leadData.eventId,
    eventSourceUrl: leadData.eventSourceUrl,
    userData: leadData.userData,
    customData: leadData.value
      ? {
          value: leadData.value,
          currency: leadData.currency || "DZD",
        }
      : undefined,
    actionSource: "website",
  });
};
