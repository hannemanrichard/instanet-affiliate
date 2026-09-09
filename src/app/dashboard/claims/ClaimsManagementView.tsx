"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import {
  useAffiliateClaims,
  useUpdateAffiliateClaimStatus,
} from "@/features/claims/application/useClaims";
import {
  AFFILIATE_CLAIM_STATUSES,
  type AffiliateClaimEntity,
  type AffiliateClaimStatus,
} from "@/features/claims/domain";

const CATEGORY_LABELS: Record<AffiliateClaimEntity["category"], string> = {
  delivery_delay: "Delivery delay",
  lost_parcel: "Lost parcel",
  damaged: "Damaged",
  wrong_item: "Wrong item",
  exchange_request: "Exchange request",
  contact_delivery_company: "Contact delivery company",
  other: "Other",
};

const STATUS_LABELS: Record<AffiliateClaimStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
  rejected: "Rejected",
};

const getClaimStatusBadgeClassName = (status: AffiliateClaimStatus) => {
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

const formatOrderLocation = (claim: AffiliateClaimEntity) => {
  const parts = [claim.order_wilaya, claim.order_commune].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
};

const formatOrderSummary = (claim: AffiliateClaimEntity) => {
  const parts = [
    claim.order_customer_name,
    claim.order_product,
    claim.order_status,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "Order details unavailable";
};

const OrderDetailsBlock = ({ claim }: { claim: AffiliateClaimEntity }) => {
  const location = formatOrderLocation(claim);
  const rows = [
    { label: "Customer", value: claim.order_customer_name },
    { label: "Phone", value: claim.order_phone },
    { label: "Product", value: claim.order_product },
    { label: "Status", value: claim.order_status },
    { label: "Location", value: location },
    { label: "Tracking", value: claim.order_tracking_id },
  ].filter((row) => Boolean(row.value?.trim()));

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border bg-muted/20 p-3">
        <p className="text-xs font-medium text-muted-foreground">Order</p>
        <p className="text-muted-foreground">Order details unavailable</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Order</p>
      <dl className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[7rem_1fr] gap-3 sm:grid-cols-[8rem_1fr]"
          >
            <dt className="text-xs text-muted-foreground">{row.label}</dt>
            <dd className="min-w-0 break-words font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const TreatClaimDialog = ({ claim }: { claim: AffiliateClaimEntity }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AffiliateClaimStatus>(claim.status);
  const [adminNotes, setAdminNotes] = useState(claim.admin_notes ?? "");
  const updateClaim = useUpdateAffiliateClaimStatus();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setStatus(claim.status);
      setAdminNotes(claim.admin_notes ?? "");
    }
  };

  const handleSave = () => {
    updateClaim.mutate(
      {
        id: claim.id,
        status,
        admin_notes: adminNotes.trim() || null,
      },
      {
        onSuccess: () => setOpen(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Treat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{claim.title}</DialogTitle>
          <DialogDescription>{CATEGORY_LABELS[claim.category]}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="text-xs font-medium text-muted-foreground">Affiliate</p>
            <p className="font-medium">
              {claim.partner_name || claim.partner_email || "Affiliate"}
            </p>
            {claim.partner_email ? (
              <p className="text-xs text-muted-foreground">{claim.partner_email}</p>
            ) : null}
          </div>

          <OrderDetailsBlock claim={claim} />

          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Description</p>
            <p className="whitespace-pre-wrap">{claim.description}</p>
          </div>

          {claim.attachments.length > 0 ? (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Attachments</p>
              <ul className="space-y-1">
                {claim.attachments.map((attachment) => (
                  <li key={attachment.id}>
                    <a
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      {attachment.file_name || attachment.file_url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor={`claim-status-${claim.id}`}>Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AffiliateClaimStatus)}
            >
              <SelectTrigger id={`claim-status-${claim.id}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AFFILIATE_CLAIM_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`claim-notes-${claim.id}`}>Admin notes</Label>
            <Textarea
              id={`claim-notes-${claim.id}`}
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              rows={4}
              maxLength={4000}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={updateClaim.isPending}
            onClick={handleSave}
          >
            {updateClaim.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ClaimsManagementView = () => {
  const locale = useLocale();
  const [statusFilter, setStatusFilter] = useState<AffiliateClaimStatus | "all">(
    "all"
  );
  const claimsQuery = useAffiliateClaims({
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const columns = useMemo(
    () => [
      {
        key: "affiliate",
        label: "Affiliate",
        render: (claim: AffiliateClaimEntity) => (
          <div className="min-w-0">
            <p className="truncate font-medium">
              {claim.partner_name || claim.partner_email || "Affiliate"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {claim.partner_email || "—"}
            </p>
          </div>
        ),
      },
      {
        key: "claim",
        label: "Claim",
        render: (claim: AffiliateClaimEntity) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{claim.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {CATEGORY_LABELS[claim.category]} · {formatOrderSummary(claim)}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (claim: AffiliateClaimEntity) => (
          <Badge
            variant="outline"
            className={getClaimStatusBadgeClassName(claim.status)}
          >
            {STATUS_LABELS[claim.status]}
          </Badge>
        ),
      },
      {
        key: "created_at",
        label: "When",
        render: (claim: AffiliateClaimEntity) => (
          <span className="text-muted-foreground">
            {formatRelativeDate(claim.created_at, locale)}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        render: (claim: AffiliateClaimEntity) => <TreatClaimDialog claim={claim} />,
      },
    ],
    [locale]
  );

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as AffiliateClaimStatus | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-56" aria-label="Filter by status">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {AFFILIATE_CLAIM_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {claimsQuery.isLoading ? (
            <Skeleton className="h-72 w-full rounded-none" />
          ) : claimsQuery.isError ? (
            <div className="border-t px-4 py-10 sm:px-6">
              <Alert>
                <AlertDescription>Unable to load claims.</AlertDescription>
              </Alert>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={claimsQuery.data?.claims ?? []}
              emptyLabel="No claims found."
              showToolbar={false}
              showColumnToggle={false}
              embedded
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
