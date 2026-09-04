export type MarketplaceContactMethod = "phone" | "whatsapp" | "both";

export type MarketplaceListingDraft = {
  product_page_id: number;
  slug: string;
  title: string;
  price: number;
  currency: string;
  description: string;
  image_urls: string[];
  order_link: string;
  default_contact_method?: MarketplaceContactMethod;
  phone?: string;
  whatsapp?: string;
  condition?: "new" | "used";
  country: "DZ";
};

const SOURCE_WEB = "bellami-affiliate-web";
const SOURCE_EXT = "bellami-marketplace-extension";

const MESSAGE_TYPES = {
  PING: "BELLAMI_MARKETPLACE_PING",
  PONG: "BELLAMI_MARKETPLACE_PONG",
  OPEN_DRAFT: "BELLAMI_MARKETPLACE_OPEN_DRAFT",
  OPEN_DRAFT_RESULT: "BELLAMI_MARKETPLACE_OPEN_DRAFT_RESULT",
} as const;

export const isMarketplaceExtensionInstalled = (): boolean => {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.bellamiMarketplaceExt === "1";
};

export const pingMarketplaceExtension = (timeoutMs = 400): Promise<boolean> => {
  if (typeof window === "undefined") return Promise.resolve(false);

  if (isMarketplaceExtensionInstalled()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve(isMarketplaceExtensionInstalled());
    }, timeoutMs);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== SOURCE_EXT) return;
      if (data.type !== MESSAGE_TYPES.PONG) return;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(true);
    };

    window.addEventListener("message", onMessage);
    window.postMessage({ source: SOURCE_WEB, type: MESSAGE_TYPES.PING }, "*");
  });
};

export const openMarketplaceDraft = (
  payload: MarketplaceListingDraft,
  timeoutMs = 5000
): Promise<{ ok: boolean; error?: string }> => {
  if (typeof window === "undefined") {
    return Promise.resolve({ ok: false, error: "Window unavailable" });
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", onMessage);
      resolve({
        ok: false,
        error: "Extension did not respond. Is it installed and enabled?",
      });
    }, timeoutMs);

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== SOURCE_EXT) return;
      if (data.type !== MESSAGE_TYPES.OPEN_DRAFT_RESULT) return;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve({
        ok: Boolean(data.ok),
        error: typeof data.error === "string" ? data.error : undefined,
      });
    };

    window.addEventListener("message", onMessage);
    window.postMessage(
      {
        source: SOURCE_WEB,
        type: MESSAGE_TYPES.OPEN_DRAFT,
        payload,
      },
      "*"
    );
  });
};
