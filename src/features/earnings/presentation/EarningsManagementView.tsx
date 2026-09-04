"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Banknote,
  CircleDollarSign,
  Clock3,
  Wallet,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import StatsCard from "@/shared/components/ui/StatsCard";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { useCurrentPartner } from "@/features/partners";
import { useEarningsSummary } from "../application";
import type { EarningLine, WithdrawEntity } from "../domain";
import { WithdrawRequestDialog } from "./WithdrawRequestDialog";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);

const formatAbsoluteDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB");
};

const EarningsLinesTable = ({
  lines,
  emptyLabel,
  currency,
  productLabel,
  qtyLabel,
  rateLabel,
  commissionLabel,
  statusLabel,
  dateLabel,
  productFallback,
  discountAppliedLabel,
  readyStatusLabel,
  notReadyStatusLabel,
  showFulfillmentStatus,
}: {
  lines: EarningLine[];
  emptyLabel: string;
  currency: string;
  productLabel: string;
  qtyLabel: string;
  rateLabel: string;
  commissionLabel: string;
  statusLabel: string;
  dateLabel: string;
  productFallback: string;
  discountAppliedLabel: (amount: string) => string;
  readyStatusLabel: string;
  notReadyStatusLabel: string;
  showFulfillmentStatus: boolean;
}) => {
  const locale = useLocale();

  const columns = useMemo(
    () => [
      {
        key: "product",
        label: productLabel,
        render: (line: EarningLine) => (
          <div className="min-w-0 max-w-[16rem]">
            <p className="truncate font-medium text-foreground">
              {line.productName?.trim() || productFallback}
            </p>
            {line.unitDiscount > 0 ? (
              <p className="truncate text-xs text-muted-foreground">
                {discountAppliedLabel(formatAmount(line.unitDiscount))}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "quantity",
        label: qtyLabel,
        render: (line: EarningLine) => (
          <span className="tabular-nums text-muted-foreground">
            {line.quantity}
          </span>
        ),
      },
      {
        key: "rate",
        label: rateLabel,
        render: (line: EarningLine) => (
          <span className="tabular-nums text-muted-foreground">
            {formatAmount(line.commissionRate)} {currency}
          </span>
        ),
      },
      {
        key: "commission",
        label: commissionLabel,
        render: (line: EarningLine) => (
          <span className="font-medium tabular-nums">
            {formatAmount(line.commissionAmount)} {currency}
          </span>
        ),
      },
      ...(showFulfillmentStatus
        ? [
            {
              key: "status",
              label: statusLabel,
              render: (line: EarningLine) => {
                const isReady = line.bucket === "ready";
                return (
                  <Badge variant={isReady ? "secondary" : "outline"}>
                    {isReady ? readyStatusLabel : notReadyStatusLabel}
                  </Badge>
                );
              },
            },
          ]
        : []),
      {
        key: "date",
        label: dateLabel,
        render: (line: EarningLine) => (
          <span
            className="text-muted-foreground"
            title={formatAbsoluteDate(line.createdAt)}
          >
            {line.createdAt
              ? formatRelativeDate(line.createdAt, locale)
              : "—"}
          </span>
        ),
      },
    ],
    [
      commissionLabel,
      currency,
      dateLabel,
      discountAppliedLabel,
      locale,
      notReadyStatusLabel,
      productFallback,
      productLabel,
      qtyLabel,
      rateLabel,
      readyStatusLabel,
      showFulfillmentStatus,
      statusLabel,
    ]
  );

  if (lines.length === 0) {
    return (
      <Alert>
        <AlertDescription>{emptyLabel}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={lines as Array<EarningLine & Record<string, unknown>>}
          emptyLabel={emptyLabel}
          showToolbar={false}
          embedded
        />
      </CardContent>
    </Card>
  );
};

const WithdrawsTable = ({
  withdraws,
  emptyLabel,
  currency,
  amountLabel,
  statusLabel,
  dateLabel,
  paidLabel,
  pendingLabel,
}: {
  withdraws: WithdrawEntity[];
  emptyLabel: string;
  currency: string;
  amountLabel: string;
  statusLabel: string;
  dateLabel: string;
  paidLabel: string;
  pendingLabel: string;
}) => {
  const locale = useLocale();

  const columns = useMemo(
    () => [
      {
        key: "date",
        label: dateLabel,
        render: (withdraw: WithdrawEntity) => (
          <span
            className="text-muted-foreground"
            title={formatAbsoluteDate(withdraw.created_at)}
          >
            {withdraw.created_at
              ? formatRelativeDate(withdraw.created_at, locale)
              : "—"}
          </span>
        ),
      },
      {
        key: "amount",
        label: amountLabel,
        render: (withdraw: WithdrawEntity) => (
          <span className="font-medium tabular-nums">
            {formatAmount(withdraw.amount)} {currency}
          </span>
        ),
      },
      {
        key: "status",
        label: statusLabel,
        render: (withdraw: WithdrawEntity) => (
          <Badge variant={withdraw.is_paid ? "secondary" : "outline"}>
            {withdraw.is_paid ? paidLabel : pendingLabel}
          </Badge>
        ),
      },
    ],
    [
      amountLabel,
      currency,
      dateLabel,
      locale,
      paidLabel,
      pendingLabel,
      statusLabel,
    ]
  );

  if (withdraws.length === 0) {
    return (
      <Alert>
        <AlertDescription>{emptyLabel}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={withdraws as Array<WithdrawEntity & Record<string, unknown>>}
          emptyLabel={emptyLabel}
          showToolbar={false}
          embedded
        />
      </CardContent>
    </Card>
  );
};

export const EarningsManagementView = () => {
  const t = useTranslations("affiliateDashboard.earnings");
  const tDash = useTranslations("affiliateDashboard");
  const currency = tDash("currencySymbol");
  const { partnerId, isLoading: partnerLoading } = useCurrentPartner();
  const earningsEnabled = !partnerLoading && partnerId != null;
  const earningsQuery = useEarningsSummary(earningsEnabled);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

  if (partnerLoading || earningsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (partnerId == null) {
    return (
      <Alert>
        <AlertDescription>{t("partnerUnresolved")}</AlertDescription>
      </Alert>
    );
  }

  const summary = earningsQuery.data;

  const sharedLineProps = {
    currency,
    productLabel: t("columns.product"),
    qtyLabel: t("columns.qty"),
    rateLabel: t("columns.rate"),
    commissionLabel: t("columns.commission"),
    statusLabel: t("columns.status"),
    dateLabel: t("columns.date"),
    productFallback: t("productFallback"),
    discountAppliedLabel: (amount: string) =>
      t("discountApplied", { amount, currency }),
    readyStatusLabel: t("lineStatus.ready"),
    notReadyStatusLabel: t("lineStatus.notReady"),
  };

  return (
    <div className="min-w-0 space-y-8">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <StatsCard
          title={t("stats.ready")}
          displayValue={`${formatAmount(summary?.readyTotal ?? 0)} ${currency}`}
          icon={CircleDollarSign}
        />
        <StatsCard
          title={t("stats.notReady")}
          displayValue={`${formatAmount(summary?.notReadyTotal ?? 0)} ${currency}`}
          icon={Clock3}
          tone="muted"
        />
        <StatsCard
          title={t("stats.withdrawn")}
          displayValue={`${formatAmount(summary?.withdrawnTotal ?? 0)} ${currency}`}
          icon={Banknote}
          tone="muted"
        />
        <StatsCard
          title={t("stats.available")}
          displayValue={`${formatAmount(summary?.availableToWithdraw ?? 0)} ${currency}`}
          icon={Wallet}
          action={
            <Button
              type="button"
              size="sm"
              disabled={(summary?.availableToWithdraw ?? 0) <= 0}
              onClick={() => setIsWithdrawOpen(true)}
              aria-label={t("requestWithdrawAria")}
            >
              {t("requestWithdraw")}
            </Button>
          }
        />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("sections.readyTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("sections.readyDescription")}
          </p>
        </div>
        <EarningsLinesTable
          {...sharedLineProps}
          lines={summary?.readyLines ?? []}
          emptyLabel={t("empty.ready")}
          showFulfillmentStatus={false}
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("sections.notReadyTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("sections.notReadyDescription")}
          </p>
        </div>
        <EarningsLinesTable
          {...sharedLineProps}
          lines={summary?.notReadyLines ?? []}
          emptyLabel={t("empty.notReady")}
          showFulfillmentStatus
        />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("sections.withdrawalsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("sections.withdrawalsDescription")}
          </p>
        </div>
        <WithdrawsTable
          withdraws={summary?.withdraws ?? []}
          emptyLabel={t("empty.withdraws")}
          currency={currency}
          amountLabel={t("columns.amount")}
          statusLabel={t("columns.status")}
          dateLabel={t("columns.date")}
          paidLabel={t("status.paid")}
          pendingLabel={t("status.pending")}
        />
      </section>

      <WithdrawRequestDialog
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        availableAmount={summary?.availableToWithdraw ?? 0}
      />
    </div>
  );
};
