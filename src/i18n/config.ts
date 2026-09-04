import type { Routing } from "next-intl/routing";

export const routing = {
  locales: ["en", "ar", "fr"],
  defaultLocale: "ar",
  localePrefix: "never",
} satisfies Routing;

// Client-side configuration for localStorage-based language switching
export const clientConfig = {
  locales: ["en", "ar", "fr"],
  defaultLocale: "ar",
  storageKey: "referio-language",
};
