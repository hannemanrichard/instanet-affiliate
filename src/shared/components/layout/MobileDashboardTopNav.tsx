"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils/utils";
import { AppIcon } from "./AppIcon";
import { DashboardBalanceLink } from "./DashboardBalanceLink";
import { uiIcons } from "./navIcons";

const isDashboardHome = (pathname: string) =>
  pathname === "/dashboard" || pathname === "/dashboard/";

const resolveTitleKey = (pathname: string): string => {
  if (isDashboardHome(pathname)) return "home";
  if (pathname.startsWith("/dashboard/orders")) return "orders";
  if (pathname.startsWith("/dashboard/earnings")) return "earnings";
  if (pathname.startsWith("/dashboard/products")) return "products";
  if (pathname.startsWith("/dashboard/settings")) return "settings";
  if (pathname.startsWith("/dashboard/product-pages")) return "productPages";
  if (pathname.startsWith("/dashboard/inventory")) return "inventory";
  return "dashboard";
};

/**
 * Mobile-only top bar: page title, balance, and back (hidden on dashboard home).
 * Fixed so it stays visible while the page scrolls.
 */
export const MobileDashboardTopNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("navigation");
  const isHome = isDashboardHome(pathname);
  const title = t(resolveTitleKey(pathname));

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/dashboard");
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-30 border-b border-border bg-background/95",
          "backdrop-blur supports-[backdrop-filter]:bg-background/80",
          "pt-[env(safe-area-inset-top)] md:hidden"
        )}
      >
        <div className="flex h-14 items-center gap-1 px-2">
          {!isHome ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0"
              onClick={handleBack}
              aria-label={t("back")}
            >
              <AppIcon
                icon={uiIcons.chevronLeft}
                size={22}
                className="rtl:rotate-180"
              />
            </Button>
          ) : (
            <div className="w-2 shrink-0" aria-hidden />
          )}

          <h1 className="min-w-0 flex-1 truncate text-start text-base font-bold tracking-tight text-foreground">
            {title}
          </h1>

          <DashboardBalanceLink className="me-1" />
        </div>
      </header>
      <div
        className="h-[calc(3.5rem+env(safe-area-inset-top))] shrink-0 md:hidden"
        aria-hidden
      />
    </>
  );
};
