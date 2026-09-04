import type { Metadata } from "next";
import { AffiliateLandingPage } from "@/features/landing";
import { LandingLayout } from "@/shared/components/layout";

export const metadata: Metadata = {
  title: "Instanet — Earn with Affiliate Marketing",
  description:
    "Join Instanet, share conversion-ready product pages, and earn commissions on cash-on-delivery orders.",
};

export default function Home() {
  return (
    <LandingLayout>
      <AffiliateLandingPage />
    </LandingLayout>
  );
}
