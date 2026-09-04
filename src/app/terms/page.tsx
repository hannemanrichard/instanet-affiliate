import type { Metadata } from "next";
import { LandingLayout } from "@/shared/components/layout";
import { StorefrontTermsContent } from "@/shared/components/storefront";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read the terms that govern your use of our platform.",
};

export default function TermsPage() {
  return (
    <LandingLayout>
      <StorefrontTermsContent />
    </LandingLayout>
  );
}

