"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Banknote,
  CircleDollarSign,
  Clock3,
  Wallet,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Skeleton } from "@/shared/components/ui/skeleton";
import StatsCard from "@/shared/components/ui/StatsCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { useCurrentPartner } from "@/features/partners";
import { useEarningsSummary } from "../application";
import type { EarningLine, WithdrawEntity } from "../domain";
import { WithdrawRequestDialog } from "./WithdrawRequestDialog";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount);

const formatDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB");
};

const EarningsLinesTable = ({
  lines,
  emptyLabel,
  columns,
  currency,
}: {
  lines: EarningLine[];
  emptyLabel: string;
  currency: string;
  columns: {
    order: string;
    product: string;
    qty: string;
    rate: string;
    commission: string;
    date: string;
  };
}) => {
  if (lines.length === 0) {
    return (
      <Alert>
        <AlertDescription>{emptyLabel}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{columns.order}</TableHead>
              <TableHead>{columns.product}</TableHead>
              <TableHead>{columns.qty}</TableHead>
              <TableHead>{columns.rate}</TableHead>
              <TableHead>{columns.commission}</TableHead>
              <TableHead>{columns.date}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={`${line.bucket}-${line.commissionId}`}>
                <TableCell>#{line.orderId}</TableCell>
                <TableCell>{line.productName || "—"}</TableCell>
                <TableCell>{line.quantity}</TableCell>
                <TableCell>
                  {formatAmount(line.commissionRate)} {currency}
                </TableCell>
                <TableCell className="font-medium">
                  {formatAmount(line.commissionAmount)} {currency}
                </TableCell>
                <TableCell>{formatDate(line.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const WithdrawsTable = ({
  withdraws,
  emptyLabel,
  columns,
  statusLabels,
  currency,
}: {
  withdraws: WithdrawEntity[];
  emptyLabel: string;
  currency: string;
  columns: {
    id: string;
    amount: string;
    status: string;
    date: string;
  };
  statusLabels: {
    paid: string;
    pending: string;
  };
}) => {
  if (withdraws.length === 0) {
    return (
      <Alert>
        <AlertDescription>{emptyLabel}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{columns.id}</TableHead>
              <TableHead>{columns.amount}</TableHead>
              <TableHead>{columns.status}</TableHead>
              <TableHead>{columns.date}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdraws.map((withdraw) => (
              <TableRow key={withdraw.id}>
                <TableCell>#{withdraw.id}</TableCell>
                <TableCell className="font-medium">
                  {formatAmount(withdraw.amount)} {currency}
                </TableCell>
                <TableCell>
                  <Badge variant={withdraw.is_paid ? "secondary" : "outline"}>
                    {withdraw.is_paid ? statusLabels.paid : statusLabels.pending}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(withdraw.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  const lineColumns = {
    order: t("columns.order"),
    product: t("columns.product"),
    qty: t("columns.qty"),
    rate: t("columns.rate"),
    commission: t("columns.commission"),
    date: t("columns.date"),
  };

  const withdrawColumns = {
    id: t("columns.id"),
    amount: t("columns.amount"),
    status: t("columns.status"),
    date: t("columns.date"),
  };

  const statusLabels = {
    paid: t("status.paid"),
    pending: t("status.pending"),
  };

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

  return (
    <div className="space-y-8">
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
          lines={summary?.readyLines ?? []}
          emptyLabel={t("empty.ready")}
          columns={lineColumns}
          currency={currency}
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
          lines={summary?.notReadyLines ?? []}
          emptyLabel={t("empty.notReady")}
          columns={lineColumns}
          currency={currency}
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
          columns={withdrawColumns}
          statusLabels={statusLabels}
          currency={currency}
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
