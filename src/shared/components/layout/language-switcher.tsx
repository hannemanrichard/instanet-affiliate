"use client";

import { useI18n } from "@/shared/lib/providers/i18n-provider";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { AppIcon } from "./AppIcon";
import { uiIcons } from "./navIcons";

const languages = [
  { code: "en", name: "English" },
  { code: "ar", name: "العربية" },
  { code: "fr", name: "Français" },
] as const;

type LanguageSwitcherProps = {
  /** `sidebar` requires SidebarProvider; use `default` on storefront/header. */
  variant?: "sidebar" | "default";
};

export const LanguageSwitcher = ({
  variant = "default",
}: LanguageSwitcherProps) => {
  const { locale, changeLanguage, isRTL } = useI18n();
  const currentLanguage = languages.find((lang) => lang.code === locale);
  const label = currentLanguage?.name ?? "Language";

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "sidebar" ? (
          <SidebarMenuButton
            size="sm"
            tooltip={label}
            className="h-9 ps-3 pe-3"
            aria-label="Change language"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <AppIcon icon={uiIcons.globe} size={20} className="!size-5" />
            <span>{label}</span>
          </SidebarMenuButton>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 gap-2"
            aria-label="Change language"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <AppIcon icon={uiIcons.globe} size={16} />
            <span>{label}</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={variant === "sidebar" ? "top" : "bottom"}
        align={isRTL ? "end" : "start"}
        className="min-w-44"
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className="justify-between"
          >
            {language.name}
            {locale === language.code ? (
              <AppIcon icon={uiIcons.check} size={16} />
            ) : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (variant !== "sidebar") {
    return menu;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>{menu}</SidebarMenuItem>
    </SidebarMenu>
  );
};
