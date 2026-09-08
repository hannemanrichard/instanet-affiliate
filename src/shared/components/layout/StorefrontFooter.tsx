import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Separator } from "@/shared/components/ui/separator";

interface FooterLink {
  label: string;
  href: string;
}

export const StorefrontFooter = () => {
  const t = useTranslations("storefront.footer");
  const year = new Date().getFullYear();
  const supportEmail = t("supportEmail");

  const links = useMemo<FooterLink[]>(
    () => [
      { label: t("links.catalog"), href: "/search" },
      { label: t("links.terms"), href: "/terms" },
      { label: "Privacy Policy", href: "/privacy-policy" },
    ],
    [t]
  );

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo.svg"
                alt="Instanet"
                width={40}
                height={40}
                className="size-10 rounded-lg"
              />
            </Link>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("description")}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{t("copyright", { year })}</p>
          <p>
            {t("supportPrompt")}{" "}
            <Link
              href={`mailto:${supportEmail}`}
              className="font-medium text-primary transition-colors hover:text-primary/80"
            >
              {supportEmail}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};
