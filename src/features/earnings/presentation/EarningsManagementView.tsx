"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Banknote,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Eye,
  Wallet,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import StatsCard from "@/shared/components/ui/StatsCard";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { useCurrentPartner } from "@/features/partners";
import { useAuth } from "@/shared/hooks/use-auth";
import {
  useEarningsSummary,
  useRequestWithdraw,
  useUpdateWithdrawStatus,
} from "../application";
import type { EarningLine, WithdrawEntity } from "../domain";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);

const formatAbsoluteDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB");
};

const getPartnerInitials = (withdraw: WithdrawEntity) => {
  const label =
    withdraw.partner_name?.trim() ||
    withdraw.partner_username?.trim() ||
    String(withdraw.partner_id);

  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const PaymentDetailsDialog = ({ withdraw }: { withdraw: WithdrawEntity }) => {
  const partnerLabel =
    withdraw.partner_name?.trim() ||
    withdraw.partner_username?.trim() ||
    `Affiliate #${withdraw.partner_id}`;
  const paymentMethods = [
    {
      label: "BaridiMob RIB",
      value: withdraw.partner_baridimob_rib?.trim(),
    },
    {
      label: "RedotPay account",
      value: withdraw.partner_redotpay_account?.trim(),
    },
    {
      label: "USDT address",
      value: withdraw.partner_usdt_address?.trim(),
    },
  ].filter((method) => Boolean(method.value));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`View payment details for ${partnerLabel}`}
        >
          <Eye className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Payment details</DialogTitle>
          <DialogDescription>
            Review payout information for {partnerLabel}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
            {withdraw.partner_avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={withdraw.partner_avatar}
                alt=""
                className="size-12 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground ring-1 ring-border">
                {getPartnerInitials(withdraw)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {partnerLabel}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {withdraw.partner_email?.trim() || "No email available"}
              </p>
            </div>
          </div>

          {paymentMethods.length > 0 ? (
            <div className="grid gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.label}
                  className="rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                    <CreditCard className="size-4 text-primary" />
                    <span>{method.label}</span>
                  </div>
                  <p className="break-all rounded-lg bg-muted/50 px-3 py-2 font-mono text-sm text-foreground">
                    {method.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
              No payment details have been added for this affiliate yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
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
  deniedLabel,
  isAdmin,
  onApprove,
  onDeny,
  isUpdating,
}: {
  withdraws: WithdrawEntity[];
  emptyLabel: string;
  currency: string;
  amountLabel: string;
  statusLabel: string;
  dateLabel: string;
  paidLabel: string;
  pendingLabel: string;
  deniedLabel: string;
  isAdmin: boolean;
  onApprove: (withdrawId: number) => void;
  onDeny: (withdrawId: number) => void;
  isUpdating: boolean;
}) => {
  const locale = useLocale();

  const columns = useMemo(
    () => [
      ...(isAdmin
        ? [
            {
              key: "partner",
              label: "Affiliate",
              render: (withdraw: WithdrawEntity) => (
                <div className="flex min-w-0 items-center gap-3">
                  {withdraw.partner_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={withdraw.partner_avatar}
                      alt=""
                      className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
                      {getPartnerInitials(withdraw)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {withdraw.partner_name?.trim() ||
                        withdraw.partner_username?.trim() ||
                        `#${withdraw.partner_id}`}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {withdraw.partner_email?.trim() || "—"}
                    </p>
                  </div>
                </div>
              ),
            },
          ]
        : []),
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
          <Badge
            variant={
              withdraw.status === "approved"
                ? "secondary"
                : withdraw.status === "denied"
                  ? "destructive"
                  : "outline"
            }
          >
            {withdraw.status === "approved"
              ? paidLabel
              : withdraw.status === "denied"
                ? deniedLabel
                : pendingLabel}
          </Badge>
        ),
      },
      ...(isAdmin
        ? [
            {
              key: "paymentDetails",
              label: "Payment details",
              render: (withdraw: WithdrawEntity) => (
                <PaymentDetailsDialog withdraw={withdraw} />
              ),
            },
            {
              key: "actions",
              label: "Actions",
              render: (withdraw: WithdrawEntity) =>
                withdraw.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onApprove(withdraw.id)}
                      disabled={isUpdating}
                    >
                      Approve
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onDeny(withdraw.id)}
                      disabled={isUpdating}
                    >
                      Deny
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                ),
            },
          ]
        : []),
    ],
    [
      amountLabel,
      currency,
      dateLabel,
      deniedLabel,
      isAdmin,
      isUpdating,
      locale,
      onApprove,
      onDeny,
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

export const EarningsManagementView = ({
  showEarningTables = true,
}: {
  showEarningTables?: boolean;
}) => {
  const t = useTranslations("affiliateDashboard.earnings");
  const tDash = useTranslations("affiliateDashboard");
  const currency = tDash("currencySymbol");
  const { isAdmin, isLoaded } = useAuth();
  const { partnerId, isLoading: partnerLoading } = useCurrentPartner();
  const earningsEnabled =
    isLoaded && (isAdmin || (!partnerLoading && partnerId != null));
  const earningsQuery = useEarningsSummary(earningsEnabled);
  const requestWithdraw = useRequestWithdraw();
  const updateWithdrawStatus = useUpdateWithdrawStatus();

  if (!isLoaded || (!isAdmin && partnerLoading) || earningsQuery.isLoading) {
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

  if (!isAdmin && partnerId == null) {
    return (
      <Alert>
        <AlertDescription>{t("partnerUnresolved")}</AlertDescription>
      </Alert>
    );
  }

  const summary = earningsQuery.data;
  const handleApproveWithdraw = (withdrawId: number) => {
    updateWithdrawStatus.mutate({ withdrawId, status: "approved" });
  };
  const handleDenyWithdraw = (withdrawId: number) => {
    updateWithdrawStatus.mutate({ withdrawId, status: "denied" });
  };
  const handleRequestWithdraw = () => {
    const amount = summary?.availableToWithdraw ?? 0;
    if (amount <= 0 || requestWithdraw.isPending) return;

    requestWithdraw.mutate(amount);
  };

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
            !isAdmin ? (
              <Button
                type="button"
                size="sm"
                disabled={
                  (summary?.availableToWithdraw ?? 0) <= 0 ||
                  requestWithdraw.isPending
                }
                onClick={handleRequestWithdraw}
                aria-label={t("requestWithdrawAria")}
              >
                {requestWithdraw.isPending ? t("withdraw.submitting") : t("requestWithdraw")}
              </Button>
            ) : undefined
          }
        />
      </div>

      {showEarningTables ? (
        <>
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
        </>
      ) : null}

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
          deniedLabel={t("status.denied")}
          isAdmin={isAdmin}
          onApprove={handleApproveWithdraw}
          onDeny={handleDenyWithdraw}
          isUpdating={updateWithdrawStatus.isPending}
        />
      </section>
    </div>
  );
};
