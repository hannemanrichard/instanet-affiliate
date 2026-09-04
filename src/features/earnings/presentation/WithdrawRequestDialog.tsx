"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useRequestWithdraw } from "../application";

interface WithdrawRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableAmount: number;
}

export const WithdrawRequestDialog = ({
  open,
  onOpenChange,
  availableAmount,
}: WithdrawRequestDialogProps) => {
  const t = useTranslations("affiliateDashboard.earnings.withdraw");
  const tDash = useTranslations("affiliateDashboard");
  const requestWithdraw = useRequestWithdraw();
  const [amount, setAmount] = useState("");

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setAmount("");
    }
    onOpenChange(nextOpen);
  };

  const parsedAmount = Number(amount);
  const canSubmit =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= availableAmount &&
    !requestWithdraw.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    await requestWithdraw.mutateAsync(parsedAmount);
    handleOpenChange(false);
  };

  const formattedAvailable = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(availableAmount);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm text-muted-foreground">
            {t("available", {
              amount: formattedAvailable,
              currency: tDash("currencySymbol"),
            })}
          </p>
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">{t("amount")}</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min={1}
              max={availableAmount}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-label={t("amountAria")}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {requestWithdraw.isPending ? t("submitting") : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
