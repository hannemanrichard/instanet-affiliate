"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";

type MarketplaceExtensionInstallDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  steps: string[];
  closeLabel: string;
};

export const MarketplaceExtensionInstallDialog = ({
  open,
  onOpenChange,
  title,
  description,
  steps,
  closeLabel,
}: MarketplaceExtensionInstallDialogProps) => {
  const handleClose = () => onOpenChange(false);

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
        <div className="flex justify-end pt-2">
          <Button type="button" onClick={handleClose}>
            {closeLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
