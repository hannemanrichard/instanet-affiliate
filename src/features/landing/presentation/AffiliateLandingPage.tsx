"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  LayoutTemplate,
  Package,
  Share2,
  Truck,
  Wallet,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils/utils";

const STEP_KEYS = ["1", "2", "3"] as const;

const FEATURE_KEYS = ["commissions", "pages", "orders", "tracking"] as const;

const FEATURE_ICONS = {
  commissions: Wallet,
  pages: LayoutTemplate,
  orders: Share2,
  tracking: Truck,
} as const;

const STAT_KEYS = ["cod", "delivery", "free"] as const;

const STAT_ICONS = {
  cod: Banknote,
  delivery: Package,
  free: CheckCircle2,
} as const;

export const AffiliateLandingPage = () => {
  const t = useTranslations("landing");
  const { isLoaded, isSignedIn } = useUser();

  const primaryHref = isSignedIn ? "/dashboard" : "/sign-up";
  const primaryLabel = isSignedIn ? t("hero.ctaDashboard") : t("hero.ctaPrimary");

  return (
    <>
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/[0.06] via-background to-background">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(81,56,245,0.15),transparent)]"
          aria-hidden
        />
        <div className="container relative mx-auto px-4 py-16 md:py-24 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="secondary"
              className="mb-6 border border-primary/15 bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10"
            >
              {t("hero.badge")}
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              {t("hero.headline")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
              {t("hero.subheadline")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" className="h-12 min-w-[200px] px-8 text-base" asChild>
                <Link href={primaryHref}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {isLoaded && !isSignedIn ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 min-w-[200px] px-8 text-base"
                  asChild
                >
                  <Link href="/sign-in">{t("hero.ctaSecondary")}</Link>
                </Button>
              ) : null}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">{t("hero.trustLine")}</p>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="scroll-mt-20 border-b bg-muted/30 py-16 md:py-24"
        aria-labelledby="how-it-works-title"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="how-it-works-title"
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {t("howItWorks.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("howItWorks.subtitle")}</p>
          </div>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
            {STEP_KEYS.map((step, index) => (
              <li
                key={step}
                className="relative flex flex-col items-center text-center"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-sm"
                  aria-hidden
                >
                  {step}
                </span>
                {index < STEP_KEYS.length - 1 ? (
                  <span
                    className="absolute top-6 hidden h-px w-full bg-border md:block md:translate-x-1/2"
                    aria-hidden
                  />
                ) : null}
                <h3 className="mt-5 text-lg font-semibold">
                  {t(`howItWorks.steps.${step}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`howItWorks.steps.${step}.description`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-20 py-16 md:py-24"
        aria-labelledby="features-title"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="features-title"
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {t("features.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("features.subtitle")}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2">
            {FEATURE_KEYS.map((key) => {
              const Icon = FEATURE_ICONS[key];
              return (
                <article
                  key={key}
                  className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">
                    {t(`features.items.${key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`features.items.${key}.description`)}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30 py-12 md:py-16" aria-label={t("stats.cod")}>
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
            {STAT_KEYS.map((key) => {
              const Icon = STAT_ICONS[key];
              return (
                <div key={key} className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="mt-3 font-semibold">{t(`stats.${key}`)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`stats.${key}Desc`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24" aria-labelledby="cta-title">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-lg sm:px-12 md:py-16">
            <h2 id="cta-title" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              {t("cta.subtitle")}
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 h-12 min-w-[220px] bg-background text-foreground hover:bg-background/90"
              asChild
            >
              <Link href={primaryHref}>
                {isSignedIn ? t("hero.ctaDashboard") : t("cta.button")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};
