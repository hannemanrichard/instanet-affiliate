"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/components/ui/sheet";
import { LanguageSwitcher } from "./language-switcher";

interface NavLink {
  label: string;
  href: string;
}

export const LandingHeader = () => {
  const t = useTranslations("landing.nav");
  const { isLoaded, isSignedIn } = useUser();

  const links = useMemo<NavLink[]>(
    () => [
      { label: t("howItWorks"), href: "#how-it-works" },
      { label: t("features"), href: "#features" },
      { label: t("terms"), href: "/terms" },
    ],
    [t]
  );

  const primaryHref = isSignedIn ? "/dashboard" : "/sign-up";
  const primaryLabel = isSignedIn ? t("dashboard") : t("getStarted");

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
          aria-label="Instanet"
        >
          <Image
            src="/logo.svg"
            alt="Instanet"
            width={140}
            height={38}
            className="h-9 w-auto"
          />
        </Link>

        <nav
          className="hidden items-center gap-8 text-sm font-medium md:flex"
          aria-label={t("openMenu")}
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>

          {isLoaded && !isSignedIn ? (
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/sign-in">{t("signIn")}</Link>
            </Button>
          ) : null}

          <Button className="hidden sm:inline-flex" asChild>
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("openMenu")}
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
                {links.map((link) => (
                  <Button
                    key={link.href}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
                {isLoaded && !isSignedIn ? (
                  <Button asChild variant="ghost" className="justify-start text-base">
                    <Link href="/sign-in">{t("signIn")}</Link>
                  </Button>
                ) : null}
                <Button asChild className="mt-2 justify-start text-base">
                  <Link href={primaryHref}>{primaryLabel}</Link>
                </Button>
              </div>
              <div className="mt-6 rounded-xl border border-border px-3 py-2">
                <LanguageSwitcher />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
