import { formatDistanceToNow } from "date-fns";
import { ar, enUS, fr } from "date-fns/locale";

const DATE_FNS_LOCALES = {
  en: enUS,
  ar,
  fr,
} as const;

type SupportedLocale = keyof typeof DATE_FNS_LOCALES;

export const formatRelativeDate = (
  value?: string | null,
  locale = "en"
): string => {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  const dateFnsLocale =
    DATE_FNS_LOCALES[locale as SupportedLocale] ?? DATE_FNS_LOCALES.en;

  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale: dateFnsLocale,
  });
};
