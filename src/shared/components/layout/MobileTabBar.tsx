"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/shared/hooks/use-auth";
import { cn } from "@/shared/utils/utils";
import { NavHugeIcon } from "./NavHugeIcon";
import { navIcons, type NavIconKey } from "./navIcons";

type TabItem = {
  key: string;
  href: string;
  iconKey: NavIconKey;
};

const partnerTabItems: TabItem[] = [
  { key: "home", href: "/dashboard", iconKey: "home" },
  { key: "products", href: "/dashboard/products", iconKey: "products" },
  { key: "orders", href: "/dashboard/orders", iconKey: "orders" },
  { key: "earnings", href: "/dashboard/earnings", iconKey: "earnings" },
  { key: "settings", href: "/dashboard/settings", iconKey: "settings" },
];

const adminTabItems: TabItem[] = [
  { key: "dashboard", href: "/dashboard", iconKey: "home" },
  { key: "products", href: "/dashboard/products", iconKey: "products" },
  { key: "orders", href: "/dashboard/orders", iconKey: "orders" },
  { key: "withdrawals", href: "/dashboard/withdrawals", iconKey: "earnings" },
  { key: "settings", href: "/dashboard/settings", iconKey: "settings" },
];

const isActive = (pathname: string, href: string) =>
  pathname === href ||
  (href !== "/dashboard" && pathname.startsWith(href));

export const MobileTabBar = () => {
  const pathname = usePathname();
  const t = useTranslations("navigation");
  const { isAdmin } = useAuth();
  const tabItems = isAdmin ? adminTabItems : partnerTabItems;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid grid-cols-5 gap-0.5 px-1 pt-1.5 pb-1">
        {tabItems.map((item) => {
          const active = isActive(pathname, item.href);
          const label = t(item.key);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-auto flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-muted-foreground transition-colors",
                "hover:bg-accent/60 focus:bg-accent/60 focus-visible:bg-accent/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-accent/60 text-primary hover:bg-accent/60 hover:text-primary focus:bg-accent/60 focus:text-primary focus-visible:bg-accent/60 focus-visible:text-primary"
                  : "hover:text-foreground"
              )}
            >
              <NavHugeIcon
                icons={navIcons[item.iconKey]}
                active={active}
                size={24}
                className={cn(active && "text-primary")}
              />
              <span
                className={cn(
                  "truncate text-[10px] font-medium",
                  active && "font-bold text-primary"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
