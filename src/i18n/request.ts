import { getRequestConfig } from "next-intl/server";
import { routing } from "./config";

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number]
  )
    ? locale
    : routing.defaultLocale;

  return {
    locale: currentLocale,
    messages: (await import(`./messages/${currentLocale}.json`)).default,
    timeZone: "Africa/Algiers", // Algeria timezone (DZ)
  };
});
