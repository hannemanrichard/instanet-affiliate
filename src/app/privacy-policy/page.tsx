import type { Metadata } from "next";
import { LandingLayout } from "@/shared/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read how Instanet handles data for the platform and extension.",
};

const sections = [
  {
    title: "Overview",
    content:
      "This Privacy Policy explains how Instanet collects, uses, and protects information when you use the Instanet affiliate platform and the Instanet Helper Chrome extension. The extension is designed for a single purpose: helping affiliates move Instanet product information into Facebook Marketplace more efficiently.",
  },
  {
    title: "Information We Process",
    content:
      "Instanet and Instanet Helper may process limited information required to support the Marketplace publishing workflow. This may include product titles, descriptions, images, links, listing price, affiliate-related listing details, and location details such as wilaya or region when provided during listing creation. The extension may also temporarily process listing draft data needed to open and complete the publishing flow.",
  },
  {
    title: "How We Use Information",
    content:
      "We use this information only to support the extension and platform workflow, including preparing Marketplace drafts, opening the publishing interface, improving the listing process, verifying publishing activity when required for affiliate rewards, and maintaining the security and reliability of the service.",
  },
  {
    title: "Data Sharing",
    content:
      "We do not sell user data. We do not use or transfer user data for purposes unrelated to the extension's single purpose. Information may be transferred only as needed to provide the requested functionality, such as sending listing data to Facebook Marketplace pages during the publishing flow or to Instanet services used to support affiliate operations.",
  },
  {
    title: "Storage and Retention",
    content:
      "The extension may temporarily store draft listing data, prepared images, and workflow preferences locally or in extension storage only for the time needed to support the publishing process. Instanet may retain related operational data for platform functionality, support, fraud prevention, and affiliate program administration.",
  },
  {
    title: "Security",
    content:
      "We take reasonable technical and organizational measures to protect information against unauthorized access, misuse, or disclosure. However, no system can guarantee absolute security.",
  },
  {
    title: "Your Choices",
    content:
      "You can stop all extension-related processing at any time by disabling or uninstalling the extension. You may also stop using the Instanet platform if you no longer want your information processed for affiliate workflow purposes.",
  },
  {
    title: "Policy Updates",
    content:
      "We may update this Privacy Policy from time to time to reflect product, legal, or operational changes. The latest version published on this page will apply.",
  },
] as const;

export default function PrivacyPolicyPage() {
  return (
    <LandingLayout>
      <div className="container mx-auto space-y-8 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective date: September 8, 2026
          </p>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            This page describes how Instanet handles information for the affiliate
            platform and the Instanet Helper extension.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Instanet Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.title} className="space-y-3">
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {section.content}
                </p>
                {index < sections.length - 1 ? <Separator /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </LandingLayout>
  );
}
