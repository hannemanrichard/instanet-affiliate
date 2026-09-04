"use client";

import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { useI18n } from "@/shared/lib/providers/i18n-provider";
import { AppIcon } from "./AppIcon";
import { uiIcons } from "./navIcons";

const getInitials = (name?: string | null) => {
  if (!name?.trim()) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function UserNav() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { isRTL } = useI18n();
  const t = useTranslations("navigation");
  const fullName = user?.fullName ?? "";
  const email = user?.emailAddresses[0]?.emailAddress ?? "";
  const initials = getInitials(fullName || email);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/sign-in" });
    router.push("/sign-in");
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              dir={isRTL ? "rtl" : "ltr"}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 shrink-0 rounded-lg">
                <AvatarImage src={user?.imageUrl} alt={fullName} />
                <AvatarFallback className="rounded-lg text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-start text-sm leading-tight">
                <span className="truncate font-semibold">
                  {fullName || email || "—"}
                </span>
                {fullName && email ? (
                  <span className="truncate text-xs">{email}</span>
                ) : null}
              </div>
              <AppIcon
                icon={uiIcons.chevronsUpDown}
                size={16}
                className="ms-auto"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.imageUrl} alt={fullName} />
                  <AvatarFallback className="rounded-lg text-xs font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {fullName || email || "—"}
                  </span>
                  {email ? (
                    <span className="truncate text-xs">{email}</span>
                  ) : null}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                void handleSignOut();
              }}
              className="cursor-pointer text-destructive focus:text-destructive"
              aria-label={t("logout")}
            >
              <AppIcon icon={uiIcons.logout} size={16} />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
