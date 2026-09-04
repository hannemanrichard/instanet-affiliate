/**
 * Facebook Pixel and TikTok Pixel tracking utilities
 */

declare global {
  interface Window {
    fbq?: (
      action: string,
      event: string,
      params?: Record<string, unknown>
    ) => void;
    ttq?: {
      load: (pixelId: string) => void;
      page: () => void;
      track: (event: string, params?: Record<string, unknown>) => void;
      identify: (params: Record<string, unknown>) => void;
      instance: (pixelId: string) => {
        track: (event: string, params?: Record<string, unknown>) => void;
      };
    };
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

/**
 * Initialize Facebook Pixel
 */
export const initFacebookPixel = (pixelId: string) => {
  if (typeof window === "undefined" || window.fbq) return;

  // Facebook Pixel initialization script
  (function (f: Window, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n = (f.fbq = function () {
      const args = Array.prototype.slice.call(arguments);
      (n as any).callMethod
        ? (n as any).callMethod.apply(n, args)
        : (n as any).queue.push(args);
    }) as any;
    if (!(f as any)._fbq) (f as any)._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.getElementsByTagName(e)[0];
    const s = b.createElement(e) as HTMLScriptElement;
    s.async = true;
    s.src = v;
    if (t && t.parentNode) {
      t.parentNode.insertBefore(s, t);
    }
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  if (window.fbq) {
    (window.fbq as any)("init", pixelId);
    (window.fbq as any)("track", "PageView");
  }
};

/** Pixel IDs already passed to TikTok `ttq.load` (avoids duplicate script loads). */
const loadedTikTokPixelIds = new Set<string>();

/**
 * Parse a DB settings value that may contain multiple TikTok Pixel IDs
 * separated by commas (with optional whitespace).
 */
export const parseTikTokPixelIds = (raw: string | null | undefined): string[] => {
  if (!raw || typeof raw !== "string") return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(",")) {
    const id = part.trim();
    if (id.length === 0 || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
};

/**
 * Initialize TikTok Pixel(s). `pixelIdsRaw` may be a single ID or several
 * separated by commas (e.g. `"ABC123, DEF456"`).
 * Bootstraps the official TikTok snippet once, then calls `load` per ID.
 */
export const initTikTokPixel = (pixelIdsRaw: string) => {
  if (typeof window === "undefined") return;

  const ids = parseTikTokPixelIds(pixelIdsRaw);
  if (ids.length === 0) {
    console.error("TikTok Pixel: No valid pixel IDs");
    return;
  }

  // Official TikTok Pixel bootstrap — run once per page lifetime
  if (!(window as any).TiktokAnalyticsObject) {
    (function (w: Window, d: Document, t: string) {
      (w as any).TiktokAnalyticsObject = t;
      var ttq = ((w as any)[t] = (w as any)[t] || []);
      (ttq as any).methods = [
        "page",
        "track",
        "identify",
        "instances",
        "debug",
        "on",
        "off",
        "once",
        "ready",
        "alias",
        "group",
        "enableCookie",
        "disableCookie",
      ];
      (ttq as any).setAndDefer = function (t: any, e: string) {
        t[e] = function () {
          t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (var i = 0; i < (ttq as any).methods.length; i++) {
        (ttq as any).setAndDefer(ttq, (ttq as any).methods[i]);
      }
      (ttq as any).instance = function (t: string) {
        var e = (ttq as any)._i[t] || [];
        for (var n = 0; n < (ttq as any).methods.length; n++) {
          (ttq as any).setAndDefer(e, (ttq as any).methods[n]);
        }
        return e;
      };
      (ttq as any).load = function (e: string, n?: any) {
        if (!e || e.trim().length === 0) {
          console.error("TikTok Pixel: Cannot load with empty pixel ID");
          return;
        }

        var i = "https://analytics.tiktok.com/i18n/pixel/events.js";
        (ttq as any)._i = (ttq as any)._i || {};
        (ttq as any)._i[e] = [];
        (ttq as any)._i[e]._u = i;
        (ttq as any)._t = (ttq as any)._t || {};
        (ttq as any)._t[e] = +new Date();
        (ttq as any)._o = (ttq as any)._o || {};
        (ttq as any)._o[e] = n || {};
        var o = document.createElement("script");
        o.type = "text/javascript";
        o.async = true;
        o.src = i + "?sdkid=" + e + "&lib=" + t;
        var a = document.getElementsByTagName("script")[0];
        if (a && a.parentNode) {
          a.parentNode.insertBefore(o, a);
        }
      };
    })(window, document, "ttq");
  }

  const ttq = window.ttq;
  if (!ttq) {
    console.error("TikTok Pixel: ttq not available after bootstrap");
    return;
  }

  let anyNewLoad = false;
  for (const cleanId of ids) {
    if (loadedTikTokPixelIds.has(cleanId)) continue;
    ttq.load(cleanId);
    loadedTikTokPixelIds.add(cleanId);
    anyNewLoad = true;
  }

  if (anyNewLoad) {
    ttq.page();
  }
};

/**
 * Track Facebook Pixel event
 */
export const trackFacebookEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window === "undefined" || !window.fbq) {
    console.warn("Facebook Pixel not initialized");
    return;
  }
  window.fbq("track", eventName, params);
};

/**
 * Track TikTok Pixel event
 */
export const trackTikTokEvent = (
  event: string,
  params?: Record<string, unknown>
) => {
  if (typeof window === "undefined" || !window.ttq) {
    console.warn("TikTok Pixel not initialized");
    return;
  }
  window.ttq.track(event, params);
};

/**
 * Initialize Google Analytics 4
 */
export const initGoogleAnalytics = (measurementId: string) => {
  if (typeof window === "undefined") return;

  // Load gtag script
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: unknown[]) {
    if (window.dataLayer) {
      window.dataLayer.push(args);
    }
  }
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId);
};

/**
 * Initialize Microsoft Clarity
 */
export const initMicrosoftClarity = (projectId: string) => {
  if (typeof window === "undefined") return;

  (function (c: Window, l: Document, a: string, r: string, i: string) {
    (c as any)[a] =
      (c as any)[a] ||
      function () {
        ((c as any)[a].q = (c as any)[a].q || []).push(arguments);
      };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    if (y && y.parentNode) {
      y.parentNode.insertBefore(t, y);
    }
  })(window, document, "clarity", "script", projectId);
};

/**
 * Get Facebook Pixel browser ID (fbp) from cookies
 */
const getFbp = (): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "_fbp") {
      return value;
    }
  }
  return undefined;
};

/**
 * Get Facebook Click ID (fbc) from cookies or URL parameters
 */
const getFbc = (): string | undefined => {
  if (typeof document === "undefined") return undefined;

  // Check URL parameters first
  const urlParams = new URLSearchParams(window.location.search);
  const fbclid = urlParams.get("fbclid");
  if (fbclid) {
    // Format: fb.{timestamp}.{random}.{fbclid}
    return `fb.${Date.now()}.${Math.random().toString(36).substring(2)}.${fbclid}`;
  }

  // Check cookies
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "_fbc") {
      return value;
    }
  }
  return undefined;
};

/**
 * Track Purchase event via Meta Conversion API (server-side)
 */
const trackMetaConversionPurchase = async (purchaseData: {
  value: number;
  currency: string;
  content_name?: string;
  content_ids?: string[];
  num_items?: number;
  userData?: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    external_id?: string[];
  };
}) => {
  try {
    const fbp = getFbp();
    const fbc = getFbc();

    const response = await fetch("/api/meta-conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "Purchase",
        eventData: {
          value: purchaseData.value,
          currency: purchaseData.currency,
          content_name: purchaseData.content_name,
          content_ids: purchaseData.content_ids,
          num_items: purchaseData.num_items,
          userData: {
            ...purchaseData.userData,
            fbp: fbp,
            fbc: fbc,
          },
          eventId: `purchase_${Date.now()}_${Math.random().toString(36).substring(2)}`,
          eventSourceUrl:
            typeof window !== "undefined" ? window.location.href : undefined,
        },
      }),
    });

    if (!response.ok) {
      console.warn("Failed to track purchase via Meta Conversion API");
    }
  } catch (error) {
    // Silently fail - don't block the purchase flow
    console.warn("Error tracking purchase via Meta Conversion API:", error);
  }
};

/**
 * Track Purchase event for both pixels and Meta Conversion API
 */
export const trackPurchase = async (purchaseData: {
  value: number;
  currency: string;
  content_name?: string;
  content_ids?: string[];
  num_items?: number;
  userData?: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    external_id?: string[];
  };
}) => {
  // Facebook Pixel Purchase event (client-side)
  trackFacebookEvent("Purchase", {
    value: purchaseData.value,
    currency: purchaseData.currency,
    content_name: purchaseData.content_name,
    content_ids: purchaseData.content_ids,
    num_items: purchaseData.num_items,
  });

  // TikTok Pixel CompletePayment event
  trackTikTokEvent("CompletePayment", {
    value: purchaseData.value,
    currency: purchaseData.currency,
    content_name: purchaseData.content_name,
    content_ids: purchaseData.content_ids,
    quantity: purchaseData.num_items,
  });

  // Google Analytics 4 purchase event
  if ((window as any).gtag) {
    (window as any).gtag("event", "purchase", {
      transaction_id: `purchase_${Date.now()}`,
      value: purchaseData.value,
      currency: purchaseData.currency,
      items: purchaseData.content_ids?.map((id) => ({
        item_id: id,
        item_name: purchaseData.content_name,
        quantity: purchaseData.num_items,
        price: purchaseData.value / (purchaseData.num_items || 1),
      })),
    });
  }

  // Meta Conversion API (server-side) - fire and forget
  trackMetaConversionPurchase(purchaseData).catch(() => {
    // Already handled in the function
  });
};
