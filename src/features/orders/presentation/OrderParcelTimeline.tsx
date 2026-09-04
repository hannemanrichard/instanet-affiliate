"use client";

import { formatDistanceToNowStrict, type Locale } from "date-fns";
import { ar, enUS, fr } from "date-fns/locale";
import { MapPin, Truck, User } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import type { ParcelTrackingEvent } from "./orderParcelTrackingDummy";

const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  ar,
  fr,
};

const formatEventTime = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return formatDistanceToNowStrict(date, {
    addSuffix: true,
    locale: DATE_FNS_LOCALES[locale] ?? enUS,
  });
};

const formatEventDate = (value: string, locale: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(
    locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-FR" : "en-GB",
    {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export const OrderParcelTimeline = ({
  events,
  locale,
  emptyLabel,
  compact = false,
}: {
  events: ParcelTrackingEvent[];
  locale: string;
  emptyLabel: string;
  compact?: boolean;
}) => {
  if (events.length === 0) {
    return (
      <p
        className={cn(
          "text-center text-sm text-muted-foreground",
          compact ? "py-2" : "py-6"
        )}
      >
        {emptyLabel}
      </p>
    );
  }

  return (
    <ol className="relative space-y-0" aria-label="Parcel tracking timeline">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const isCurrent = event.isCurrent ?? index === 0;

        return (
          <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast ? (
              <span
                className="absolute start-[11px] top-6 h-[calc(100%-12px)] w-px bg-border"
                aria-hidden="true"
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 mt-1 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full ring-2 ring-background",
                isCurrent
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  "block h-2 w-2 rounded-full",
                  isCurrent ? "bg-primary-foreground" : "bg-muted-foreground"
                )}
              />
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p
                  className={cn(
                    "text-sm leading-snug",
                    isCurrent ? "font-semibold" : "font-medium text-muted-foreground"
                  )}
                >
                  {event.status}
                </p>
                <time
                  dateTime={event.createdAt}
                  className="shrink-0 text-xs text-muted-foreground"
                  title={formatEventDate(event.createdAt, locale)}
                >
                  {formatEventTime(event.createdAt, locale)}
                </time>
              </div>

              {event.note ? (
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {event.note}
                </p>
              ) : null}

              {(event.station || event.deliveryMan) && (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {event.station ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                      {event.station}
                    </span>
                  ) : null}
                  {event.deliveryMan ? (
                    <span className="inline-flex items-center gap-1">
                      {event.deliveryMan === "ZR Express" ? (
                        <Truck
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <User className="h-3 w-3 shrink-0" aria-hidden="true" />
                      )}
                      {event.deliveryMan}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
