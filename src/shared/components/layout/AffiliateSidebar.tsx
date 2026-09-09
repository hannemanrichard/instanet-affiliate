"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/shared/components/ui/sidebar";
import { cn } from "@/shared/utils/utils";
import { useAuth } from "@/shared/hooks/use-auth";
import { useI18n } from "@/shared/lib/providers/i18n-provider";
import { AppIcon } from "./AppIcon";
import { NavHugeIcon } from "./NavHugeIcon";
import { navIcons, uiIcons, type NavIconKey } from "./navIcons";

type NavLink = {
  key: string;
  href: string;
  iconKey: NavIconKey;
};

type NavSection = {
  labelKey: string;
  items: NavLink[];
  collapsible?: boolean;
  /** Icon for the collapsible section trigger. */
  triggerIconKey?: NavIconKey;
};

const partnerSection: NavSection = {
  labelKey: "workspace",
  items: [
    { key: "dashboard", href: "/dashboard", iconKey: "home" },
    { key: "products", href: "/dashboard/products", iconKey: "products" },
    { key: "orders", href: "/dashboard/orders", iconKey: "orders" },
    { key: "earnings", href: "/dashboard/earnings", iconKey: "earnings" },
  ],
};

const adminMainSection: NavSection = {
  labelKey: "admin",
  items: [
    { key: "dashboard", href: "/dashboard", iconKey: "home" },
    { key: "products", href: "/dashboard/products", iconKey: "products" },
    { key: "orders", href: "/dashboard/orders", iconKey: "orders" },
    { key: "withdrawals", href: "/dashboard/withdrawals", iconKey: "earnings" },
    { key: "inventory", href: "/dashboard/inventory", iconKey: "inventory" },
    { key: "affiliates", href: "/dashboard/affiliates", iconKey: "products" },
    { key: "claims", href: "/dashboard/claims", iconKey: "orders" },
    { key: "audit", href: "/dashboard/audit", iconKey: "orders" },
  ],
};

const accountSection: NavSection = {
  labelKey: "account",
  items: [{ key: "settings", href: "/dashboard/settings", iconKey: "settings" }],
};

const isNavActive = (pathname: string, href: string) =>
  pathname === href ||
  (href !== "/dashboard" && pathname.startsWith(href));

/** Active styles — solid primary (Sidebar 01 / Modern Minimal). */
const activeItemClassName =
  "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground data-[active=true]:bg-primary data-[active=true]:text-primary-foreground";

/**
 * Nav row: icon + label packed at inline-start.
 * Keep asChild+Link+tooltip — SidebarMenuButton now merges tooltip in a
 * single Slot so RTL `dir` is preserved on the anchor.
 */
const SidebarNavItem = ({
  href,
  iconKey,
  label,
  active,
}: {
  href: string;
  iconKey: NavIconKey;
  label: string;
  active: boolean;
}) => {
  const { isRTL } = useI18n();
  const dir = isRTL ? "rtl" : "ltr";

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        tooltip={label}
        className={cn("h-9 ps-3 pe-3", active && activeItemClassName)}
      >
        <Link
          href={href}
          aria-label={label}
          dir={dir}
          style={{ direction: dir }}
          className="justify-start"
        >
          <NavHugeIcon icons={navIcons[iconKey]} active={active} className="!size-5" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NavSectionBlock = ({ section }: { section: NavSection }) => {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { isRTL } = useI18n();
  const hasActiveChild = section.items.some((item) =>
    isNavActive(pathname, item.href)
  );
  const [open, setOpen] = useState(hasActiveChild || !section.collapsible);
  const chevronIcon = isRTL ? uiIcons.chevronLeft : uiIcons.chevronRight;

  useEffect(() => {
    if (hasActiveChild) setOpen(true);
  }, [hasActiveChild]);

  if (section.collapsible) {
    const triggerIcons =
      navIcons[section.triggerIconKey ?? "productPages"];

    return (
      <SidebarGroup>
        <SidebarMenu>
          <Collapsible
            open={open}
            onOpenChange={setOpen}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={t(section.labelKey)}
                  isActive={hasActiveChild}
                  dir={isRTL ? "rtl" : "ltr"}
                  className={cn(
                    "h-9 ps-3 pe-3",
                    hasActiveChild && activeItemClassName
                  )}
                >
                  <NavHugeIcon icons={triggerIcons} active={hasActiveChild} />
                  <span>{t(section.labelKey)}</span>
                  <AppIcon
                    icon={chevronIcon}
                    size={16}
                    className={cn(
                      "ms-auto transition-transform duration-200",
                      open && "rotate-90"
                    )}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {section.items.map((item) => {
                    const active = isNavActive(pathname, item.href);
                    const label = t(item.key);
                    return (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton asChild isActive={active}>
                          <Link
                            href={item.href}
                            aria-label={label}
                            dir={isRTL ? "rtl" : "ltr"}
                          >
                            <NavHugeIcon
                              icons={navIcons[item.iconKey]}
                              active={active}
                            />
                            <span>{label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t(section.labelKey)}</SidebarGroupLabel>
      <SidebarMenu>
        {section.items.map((item) => (
          <SidebarNavItem
            key={item.href}
            href={item.href}
            iconKey={item.iconKey}
            label={t(item.key)}
            active={isNavActive(pathname, item.href)}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

const SidebarUpgradeCard = () => {
  const t = useTranslations("navigation");

  return (
    <Card className="mx-2 mb-2 overflow-hidden border-border bg-secondary shadow-none group-data-[collapsible=icon]:hidden">
      <CardContent className="flex flex-col gap-3 p-4 text-start">
        <div className="flex size-10 items-center justify-center self-start rounded-lg bg-accent text-accent-foreground">
          <NavHugeIcon icons={navIcons.sparkles} active />
        </div>
        <div className="w-full space-y-1 text-start">
          <p className="text-sm font-semibold leading-none">
            {t("upgradeTitle")}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t("upgradeDescription")}
          </p>
        </div>
        <Button asChild size="sm" className="w-full">
          <Link href="/dashboard/products" aria-label={t("upgradeCta")}>
            {t("upgradeCta")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export function AffiliateSidebar() {
  const { isRTL } = useI18n();
  const { isAdmin, roleLabel } = useAuth();
  const dir = isRTL ? "rtl" : "ltr";

  const sections = useMemo(() => {
    const next = [isAdmin ? adminMainSection : partnerSection];
    next.push(accountSection);
    return next;
  }, [isAdmin]);

  return (
    <Sidebar
      key={dir}
      collapsible="icon"
      side={isRTL ? "right" : "left"}
      dir={dir}
    >
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/dashboard"
                aria-label="Instanet Affiliate home"
                dir={dir}
                className="gap-3"
              >
                <Image
                  src="/logo.svg"
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-lg"
                  aria-hidden
                  priority
                />
                <div className="grid min-w-0 flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">Instanet</span>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      Affiliate
                    </span>
                    {isAdmin ? (
                      <Badge
                        variant="secondary"
                        className="h-5 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide"
                      >
                        {roleLabel ?? "Admin"}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0">
        <div className="flex flex-col gap-1 py-2">
          {sections.map((section) => (
            <NavSectionBlock key={section.labelKey} section={section} />
          ))}
          {!isAdmin ? (
            <div className="mt-2 pt-2">
              <SidebarUpgradeCard />
            </div>
          ) : null}
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
