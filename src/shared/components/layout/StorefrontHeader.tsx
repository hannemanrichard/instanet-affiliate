"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { cn } from "@/shared/utils/utils";
import { Menu, Search } from "lucide-react";
import Image from "next/image";
import { LanguageSwitcher } from "./language-switcher";

interface NavLink {
  label: string;
  href: string;
}

const MobileNav = ({
  links,
  openLabel,
}: {
  links: NavLink[];
  openLabel: string;
}) => {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label={openLabel}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] sm:max-w-xs">
        <SheetHeader className="mb-4 text-start">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Instanet"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
        </SheetHeader>
        <div className="flex flex-col gap-1">
          {links.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Button
                key={link.href}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className="justify-start text-base"
              >
                <Link href={link.href}>{link.label}</Link>
              </Button>
            );
          })}
        </div>
        <div className="mt-6 rounded-xl border border-border px-3 py-2">
          <LanguageSwitcher />
        </div>
      </SheetContent>
    </Sheet>
  );
};

const DesktopNav = ({ links }: { links: NavLink[] }) => {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              isActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

export const StorefrontHeader = () => {
  const t = useTranslations("storefront.nav");

  const links = useMemo<NavLink[]>(
    () => [
      { label: t("home"), href: "/" },
      { label: t("products"), href: "/search" },
      { label: t("terms"), href: "/terms" },
    ],
    [t]
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Image
            src="/logo.svg"
            alt="Instanet"
            width={140}
            height={38}
            className="h-9 w-auto"
          />
        </Link>
        <DesktopNav links={links} />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            asChild
            aria-label={t("search")}
          >
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          <MobileNav links={links} openLabel={t("openMenu")} />
        </div>
      </div>
    </header>
  );
};
