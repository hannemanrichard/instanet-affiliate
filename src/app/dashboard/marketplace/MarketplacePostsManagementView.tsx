"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { useMarketplacePosts } from "@/features/marketplace-posts/application/useMarketplacePosts";
import {
  MARKETPLACE_POST_STATUSES,
  type MarketplacePostEntity,
  type MarketplacePostStatus,
} from "@/features/marketplace-posts/domain";

const STATUS_LABELS: Record<MarketplacePostStatus, string> = {
  draft_opened: "Draft opened",
  published: "Published",
  failed: "Failed",
};

const getStatusBadgeClassName = (status: MarketplacePostStatus) => {
  if (status === "published") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "failed") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  return "border-amber-200 bg-amber-50 text-amber-700";
};

const formatAmount = (amount: number, currency: string) =>
  `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
    numberingSystem: "latn",
  }).format(amount)} ${currency}`;

const getAffiliateInitials = (post: MarketplacePostEntity) => {
  const source = (post.partner_name || post.partner_email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

export const MarketplacePostsManagementView = () => {
  const locale = useLocale();
  const [statusFilter, setStatusFilter] = useState<MarketplacePostStatus | "all">(
    "all"
  );
  const postsQuery = useMarketplacePosts({
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  });

  const columns = useMemo(
    () => [
      {
        key: "affiliate",
        label: "Affiliate",
        render: (post: MarketplacePostEntity) => (
          <div className="flex min-w-0 items-center gap-3">
            {post.partner_avatar?.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.partner_avatar}
                alt=""
                className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
              />
            ) : (
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border"
                aria-hidden
              >
                {getAffiliateInitials(post)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium">
                {post.partner_name || post.partner_email}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {post.partner_email}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "product",
        label: "Product",
        render: (post: MarketplacePostEntity) => (
          <div className="min-w-0">
            <p className="truncate font-medium">{post.product_title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatAmount(post.product_price, post.currency)}
              {post.location ? ` · ${post.location}` : ""}
            </p>
          </div>
        ),
      },
      {
        key: "status",
        label: "Status",
        render: (post: MarketplacePostEntity) => (
          <Badge
            variant="outline"
            className={getStatusBadgeClassName(post.status)}
          >
            {STATUS_LABELS[post.status]}
          </Badge>
        ),
      },
      {
        key: "when",
        label: "When",
        render: (post: MarketplacePostEntity) => (
          <span className="text-muted-foreground">
            {formatRelativeDate(post.published_at || post.created_at, locale)}
          </span>
        ),
      },
    ],
    [locale]
  );

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as MarketplacePostStatus | "all")
            }
          >
            <SelectTrigger className="w-full sm:w-56" aria-label="Filter by status">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {MARKETPLACE_POST_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-0">
          {postsQuery.isLoading ? (
            <Skeleton className="h-72 w-full rounded-none" />
          ) : postsQuery.isError ? (
            <div className="border-t px-4 py-10 sm:px-6">
              <Alert>
                <AlertDescription>
                  Unable to load posting activity.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={postsQuery.data?.posts ?? []}
              emptyLabel="No posting activity yet."
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
