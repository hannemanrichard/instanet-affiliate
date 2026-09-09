"use client";

import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import type { KeyboardEvent } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/utils/utils";
import { useI18n } from "@/shared/lib/providers/i18n-provider";
import { useAuth } from "@/shared/hooks/use-auth";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
import { AnalyticsSettingsSection } from "./AnalyticsSettingsSection";
import { ClaimsSettingsSection } from "./ClaimsSettingsSection";
import { PaymentSettingsSection } from "./PaymentSettingsSection";

const LANGUAGES = [
  { code: "en", nameKey: "english" as const },
  { code: "fr", nameKey: "french" as const },
  { code: "ar", nameKey: "arabic" as const },
] as const;

const getInitials = (name?: string | null) => {
  if (!name?.trim()) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const SettingsManagementView = () => {
  const t = useTranslations("affiliateDashboard.settings");
  const tNav = useTranslations("navigation");
  const { locale, changeLanguage } = useI18n();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useAuth();
  const router = useRouter();

  const fullName = user?.fullName ?? "";
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const initials = getInitials(fullName || email);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/sign-in" });
    router.push("/sign-in");
  };

  const handleLanguageKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    code: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      changeLanguage(code);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
          {t("subtitle")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("language.title")}</CardTitle>
          <CardDescription>{t("language.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="grid gap-2 sm:grid-cols-3"
            role="radiogroup"
            aria-label={t("language.title")}
          >
            {LANGUAGES.map((language) => {
              const selected = locale === language.code;
              return (
                <button
                  key={language.code}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => changeLanguage(language.code)}
                  onKeyDown={(event) =>
                    handleLanguageKeyDown(event, language.code)
                  }
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-start text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-primary bg-accent text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  )}
                >
                  <span>{t(`language.${language.nameKey}`)}</span>
                  {selected ? (
                    <AppIcon icon={uiIcons.check} size={16} aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("account.title")}</CardTitle>
          <CardDescription>{t("account.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="size-12 rounded-lg">
              <AvatarImage src={user?.imageUrl} alt={fullName} />
              <AvatarFallback className="rounded-lg text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {fullName || email || "—"}
              </p>
              {email ? (
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              ) : null}
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-destructive hover:bg-destructive/5 hover:text-destructive sm:w-auto"
            onClick={() => void handleSignOut()}
            aria-label={tNav("logout")}
          >
            <AppIcon icon={uiIcons.logout} size={16} />
            {tNav("logout")}
          </Button>
        </CardContent>
      </Card>

      <PaymentSettingsSection />

      {!isAdmin ? <ClaimsSettingsSection /> : null}

      {isAdmin ? <AnalyticsSettingsSection /> : null}
    </div>
  );
};
