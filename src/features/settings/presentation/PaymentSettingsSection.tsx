"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { useCurrentPartner } from "@/features/partners/application";
import { useUpdatePaymentSettings } from "@/features/partners/application";

interface PaymentFormState {
  baridimob_rib: string;
  redotpay_account: string;
  usdt_address: string;
}

const INITIAL_STATE: PaymentFormState = {
  baridimob_rib: "",
  redotpay_account: "",
  usdt_address: "",
};

export const PaymentSettingsSection = () => {
  const t = useTranslations("affiliateDashboard.settings.payment");
  const tSettings = useTranslations("affiliateDashboard.settings");
  const { partner, isLoading: isPartnerLoading } = useCurrentPartner();
  const updatePayment = useUpdatePaymentSettings();
  const [form, setForm] = useState<PaymentFormState>(INITIAL_STATE);

  useEffect(() => {
    if (!partner) return;
    setForm({
      baridimob_rib: partner.baridimob_rib ?? "",
      redotpay_account: partner.redotpay_account ?? "",
      usdt_address: partner.usdt_address ?? "",
    });
  }, [partner]);

  const handleChange = (field: keyof PaymentFormState) => (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updatePayment.mutate({
      baridimob_rib: form.baridimob_rib.trim() || null,
      redotpay_account: form.redotpay_account.trim() || null,
      usdt_address: form.usdt_address.trim() || null,
    });
  };

  if (isPartnerLoading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baridimob_rib">{t("baridimobRib")}</Label>
            <Input
              id="baridimob_rib"
              type="text"
              inputMode="numeric"
              maxLength={20}
              placeholder={t("baridimobRibPlaceholder")}
              value={form.baridimob_rib}
              onChange={handleChange("baridimob_rib")}
              aria-label={t("baridimobRib")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="redotpay_account">{t("redotpayAccount")}</Label>
            <Input
              id="redotpay_account"
              type="text"
              placeholder={t("redotpayAccountPlaceholder")}
              value={form.redotpay_account}
              onChange={handleChange("redotpay_account")}
              aria-label={t("redotpayAccount")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="usdt_address">{t("usdtAddress")}</Label>
            <Input
              id="usdt_address"
              type="text"
              placeholder={t("usdtAddressPlaceholder")}
              value={form.usdt_address}
              onChange={handleChange("usdt_address")}
              aria-label={t("usdtAddress")}
            />
          </div>

          <Button
            type="submit"
            disabled={updatePayment.isPending}
            className="w-full sm:w-auto"
          >
            {updatePayment.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                {tSettings("saving")}
              </>
            ) : (
              tSettings("save")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
