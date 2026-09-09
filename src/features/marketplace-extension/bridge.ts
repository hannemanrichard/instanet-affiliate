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
  /** Tracking fields created by the web app when draft is opened */
  attempt_id?: number;
  attempt_token?: string;
  api_base_url?: string;
};

const SOURCE_WEB = "instanet-affiliate-web";
const LEGACY_SOURCE_WEB = "bellami-affiliate-web";
const SOURCE_EXT = "instanet-helper-extension";
const LEGACY_SOURCE_EXT = "bellami-marketplace-extension";
const EXTENSION_DATASET_KEYS = [
  "instanetHelperExt",
  "instanetHelperExtension",
  "instanetMarketplaceExtension",
  "instanetMarketplaceExt",
  "instanetAffiliateExtension",
  "instanetAffiliateExt",
  "bellamiMarketplaceExt",
] as const;

const MESSAGE_TYPES = {
  PING: ["INSTANET_MARKETPLACE_PING", "BELLAMI_MARKETPLACE_PING"],
  PONG: ["INSTANET_MARKETPLACE_PONG", "BELLAMI_MARKETPLACE_PONG"],
  OPEN_DRAFT: [
    "INSTANET_MARKETPLACE_OPEN_DRAFT",
    "BELLAMI_MARKETPLACE_OPEN_DRAFT",
  ],
  OPEN_DRAFT_RESULT: [
    "INSTANET_MARKETPLACE_OPEN_DRAFT_RESULT",
    "BELLAMI_MARKETPLACE_OPEN_DRAFT_RESULT",
  ],
} as const;

export const isMarketplaceExtensionInstalled = (): boolean => {
  if (typeof document === "undefined") return false;

  return EXTENSION_DATASET_KEYS.some(
    (key) => document.documentElement.dataset[key] === "1"
  );
};

const isMarketplaceExtensionSource = (source: unknown): boolean =>
  source === SOURCE_EXT ||
  source === LEGACY_SOURCE_EXT ||
  source === "instanet-affiliate-extension";

const matchesMarketplaceType = (
  value: unknown,
  acceptedTypes: readonly string[]
): boolean => acceptedTypes.includes(String(value));

const postMarketplaceMessage = (
  messageType: readonly [string, string],
  payload?: unknown,
  timeoutMs = 400
) => {
  window.postMessage(
    {
      source: LEGACY_SOURCE_WEB,
      type: messageType[1],
      ...(payload !== undefined ? { payload } : {}),
    },
    "*"
  );

  const fallbackDelay = Math.min(250, Math.max(100, Math.floor(timeoutMs / 2)));
  window.setTimeout(() => {
    window.postMessage(
      {
        source: SOURCE_WEB,
        type: messageType[0],
        ...(payload !== undefined ? { payload } : {}),
      },
      "*"
    );
  }, fallbackDelay);
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
      if (!data || !isMarketplaceExtensionSource(data.source)) return;
      if (!matchesMarketplaceType(data.type, MESSAGE_TYPES.PONG)) return;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve(true);
    };

    window.addEventListener("message", onMessage);
    postMarketplaceMessage(MESSAGE_TYPES.PING, undefined, timeoutMs);
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
      if (!data || !isMarketplaceExtensionSource(data.source)) return;
      if (!matchesMarketplaceType(data.type, MESSAGE_TYPES.OPEN_DRAFT_RESULT)) {
        return;
      }
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      resolve({
        ok: Boolean(data.ok),
        error: typeof data.error === "string" ? data.error : undefined,
      });
    };

    window.addEventListener("message", onMessage);
    postMarketplaceMessage(MESSAGE_TYPES.OPEN_DRAFT, payload, timeoutMs);
  });
};
