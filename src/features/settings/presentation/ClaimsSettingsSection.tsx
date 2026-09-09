"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Paperclip } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Loader } from "@/shared/components/ui/loader";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { useAffiliateClaims } from "@/features/claims/application/useClaims";
import type { AffiliateClaimEntity } from "@/features/claims/domain";
import { cn } from "@/shared/utils/utils";

const getClaimStatusBadgeClassName = (status: AffiliateClaimEntity["status"]) => {
  if (status === "resolved") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "rejected") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (status === "in_progress") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const ClaimDetailsDialog = ({ claim }: { claim: AffiliateClaimEntity }) => {
  const t = useTranslations("affiliateDashboard.settings.claims");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={t("viewClaimAria", { title: claim.title })}
        >
          {t("view")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{claim.title}</DialogTitle>
          <DialogDescription>
            {[claim.order_product, claim.order_status]
              .filter(Boolean)
              .join(" · ") || t("orderDetailsUnavailable")}{" "}
            · {formatRelativeDate(claim.created_at, locale)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getClaimStatusBadgeClassName(claim.status)}>
              {t(`statuses.${claim.status}`)}
            </Badge>
            <Badge variant="outline">{t(`categories.${claim.category}`)}</Badge>
          </div>

          {(claim.order_customer_name ||
            claim.order_product ||
            claim.order_status ||
            claim.order_phone ||
            claim.order_wilaya ||
            claim.order_tracking_id) && (
            <div className="rounded-xl border bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">{t("order")}</p>
              <dl className="space-y-2">
                {claim.order_customer_name ? (
                  <div className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-xs text-muted-foreground">{t("orderCustomer")}</dt>
                    <dd className="font-medium">{claim.order_customer_name}</dd>
                  </div>
                ) : null}
                {claim.order_phone ? (
                  <div className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-xs text-muted-foreground">{t("orderPhone")}</dt>
                    <dd className="font-medium">{claim.order_phone}</dd>
                  </div>
                ) : null}
                {claim.order_product ? (
                  <div className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-xs text-muted-foreground">{t("orderProduct")}</dt>
                    <dd className="font-medium">{claim.order_product}</dd>
                  </div>
                ) : null}
                {claim.order_status ? (
                  <div className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-xs text-muted-foreground">{t("orderStatus")}</dt>
                    <dd className="font-medium">{claim.order_status}</dd>
                  </div>
                ) : null}
                {claim.order_wilaya || claim.order_commune ? (
                  <div className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-xs text-muted-foreground">{t("orderLocation")}</dt>
                    <dd className="font-medium">
                      {[claim.order_wilaya, claim.order_commune]
                        .filter(Boolean)
                        .join(", ")}
                    </dd>
                  </div>
                ) : null}
                {claim.order_tracking_id ? (
                  <div className="grid grid-cols-[7rem_1fr] gap-3">
                    <dt className="text-xs text-muted-foreground">{t("orderTracking")}</dt>
                    <dd className="font-medium">{claim.order_tracking_id}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          )}

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t("descriptionField")}</p>
            <p className="whitespace-pre-wrap text-foreground">{claim.description}</p>
          </div>

          {claim.admin_notes?.trim() ? (
            <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">{t("adminNotes")}</p>
              <p className="whitespace-pre-wrap">{claim.admin_notes}</p>
            </div>
          ) : null}

          {claim.attachments.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{t("attachments")}</p>
              <ul className="space-y-1.5">
                {claim.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary underline-offset-4 hover:underline"
                    >
                      <Paperclip className="size-3.5" />
                      {attachment.file_name || t("attachmentFallback")}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ClaimsSettingsSection = () => {
  const t = useTranslations("affiliateDashboard.settings.claims");
  const locale = useLocale();
  const claimsQuery = useAffiliateClaims({ limit: 50 });

  const claims = useMemo(() => claimsQuery.data?.claims ?? [], [claimsQuery.data]);

  return (
    <Card>
      <CardHeader className="space-y-1.5">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        {claimsQuery.isLoading ? (
          <div className="flex min-h-28 items-center justify-center">
            <Loader className="text-muted-foreground" label={t("loading")} />
          </div>
        ) : claimsQuery.isError ? (
          <Alert>
            <AlertDescription>{t("loadError")}</AlertDescription>
          </Alert>
        ) : claims.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {claims.map((claim) => (
              <li
                key={claim.id}
                className={cn(
                  "flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                )}
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{claim.title}</p>
                    <Badge
                      variant="outline"
                      className={getClaimStatusBadgeClassName(claim.status)}
                    >
                      {t(`statuses.${claim.status}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(`categories.${claim.category}`)}
                    {claim.order_product ? ` · ${claim.order_product}` : ""}
                    {claim.order_status ? ` · ${claim.order_status}` : ""} ·{" "}
                    {formatRelativeDate(claim.created_at, locale)}
                  </p>
                </div>
                <ClaimDetailsDialog claim={claim} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
