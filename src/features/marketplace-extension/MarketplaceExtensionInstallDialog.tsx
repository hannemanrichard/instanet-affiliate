"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

export const INSTANET_HELPER_CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/instanet-helper/bhbcpjcgjccbeimnaaaclibbnpbpoaed";

type MarketplaceExtensionInstallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  steps: string[];
  installLabel: string;
  closeLabel: string;
  installUrl?: string;
};

export const MarketplaceExtensionInstallDialog = ({
  open,
  onOpenChange,
  title,
  description,
  steps,
  installLabel,
  closeLabel,
  installUrl = INSTANET_HELPER_CHROME_STORE_URL,
}: MarketplaceExtensionInstallDialogProps) => {
  const handleClose = () => onOpenChange(false);

  const handleInstall = () => {
    window.open(installUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-2 ps-5 text-sm text-muted-foreground">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose}>
            {closeLabel}
          </Button>
          <Button type="button" onClick={handleInstall}>
            {installLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
