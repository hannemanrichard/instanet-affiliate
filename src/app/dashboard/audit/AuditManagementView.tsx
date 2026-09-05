"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useLocale } from "next-intl";
import { Search, X } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { DataTable } from "@/shared/components/ui/data-table/data-table";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useStandardQuery } from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import { formatRelativeDate } from "@/shared/utils/formatRelativeDate";
import { cn } from "@/shared/utils/utils";

type AuditLogRow = {
  id: number;
  table_name: string;
  action: string;
  changed_by: number | null;
  changed_by_partner?: {
    id: number;
    fullname: string | null;
    username: string | null;
    avatar: string | null;
  } | null;
  record_id: number | null;
  record_uuid: string | null;
  created_at: string;
};

const getPartnerInitials = (log: AuditLogRow) => {
  const label =
    log.changed_by_partner?.fullname?.trim() ||
    log.changed_by_partner?.username?.trim() ||
    (log.changed_by != null ? String(log.changed_by) : "S");

  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const buildAuditUrl = (table: string) =>
  `/api/dashboard/audit${table ? `?table=${encodeURIComponent(table)}` : ""}`;

export const AuditManagementView = () => {
  const locale = useLocale();
  const [tableInput, setTableInput] = useState("");
  const [appliedTable, setAppliedTable] = useState("");

  const auditQuery = useStandardQuery(
    ["dashboard", "audit", appliedTable || "all"],
    () =>
      apiFetch<{ logs: AuditLogRow[] }>(buildAuditUrl(appliedTable)).then(
        (data) => data.logs
      ),
    {
      staleTime: 30 * 1000,
    }
  );

  const handleApplyFilter = () => {
    setAppliedTable(tableInput.trim());
  };

  const handleClearFilter = () => {
    setTableInput("");
    setAppliedTable("");
  };

  const handleFilterKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleApplyFilter();
  };

  const columns = useMemo(
    () => [
      {
        key: "created_at",
        label: "When",
        render: (log: AuditLogRow) => (
          <span className="text-muted-foreground">
            {formatRelativeDate(log.created_at, locale)}
          </span>
        ),
      },
      {
        key: "table_name",
        label: "Table",
        render: (log: AuditLogRow) => log.table_name,
      },
      {
        key: "action",
        label: "Action",
        render: (log: AuditLogRow) => (
          <Badge variant="outline" className="font-medium">
            {log.action}
          </Badge>
        ),
      },
      {
        key: "record",
        label: "Record",
        render: (log: AuditLogRow) =>
          log.record_id != null ? String(log.record_id) : log.record_uuid || "—",
      },
      {
        key: "changed_by",
        label: "Changed By",
        render: (log: AuditLogRow) => {
          if (log.changed_by == null) {
            return (
              <div className="min-w-0">
                <p className="font-medium">System</p>
                <p className="text-xs text-muted-foreground">Automated action</p>
              </div>
            );
          }

          return (
            <div className="flex min-w-0 items-center gap-3">
              {log.changed_by_partner?.avatar?.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={log.changed_by_partner.avatar}
                  alt=""
                  className="size-9 shrink-0 rounded-full object-cover ring-1 ring-border"
                />
              ) : (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground ring-1 ring-border">
                  {getPartnerInitials(log)}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {log.changed_by_partner?.fullname?.trim() ||
                    log.changed_by_partner?.username?.trim() ||
                    `Partner #${log.changed_by}`}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  ID: {log.changed_by}
                </p>
              </div>
            </div>
          );
        },
      },
    ],
    [locale]
  );

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-0 p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground sm:start-3"
                strokeWidth={1.75}
                aria-hidden
              />
              <Input
                value={tableInput}
                onChange={(event) => setTableInput(event.target.value)}
                onKeyDown={handleFilterKeyDown}
                placeholder="Filter by table..."
                className={cn(
                  "h-11 border-0 bg-transparent pe-11 ps-11 shadow-none",
                  "placeholder:text-muted-foreground/70",
                  "focus-visible:ring-0",
                  "sm:h-9 sm:border sm:border-input sm:bg-background sm:pe-9 sm:ps-9 sm:shadow-sm",
                  "sm:focus-visible:ring-1 sm:focus-visible:ring-ring"
                )}
                aria-label="Filter audit logs by table"
              />
              {tableInput ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-1.5 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:bg-transparent hover:text-foreground sm:end-1 sm:size-7"
                  onClick={handleClearFilter}
                  aria-label="Clear audit filter"
                >
                  <X className="size-3.5" strokeWidth={2} aria-hidden />
                </Button>
              ) : null}
            </div>
            <Button type="button" variant="outline" onClick={handleApplyFilter}>
              Apply
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {auditQuery.isLoading ? (
            <Skeleton className="h-72 w-full rounded-none" />
          ) : auditQuery.isError ? (
            <div className="border-t px-4 py-10 sm:px-6">
              <Alert>
                <AlertDescription>Unable to load audit logs.</AlertDescription>
              </Alert>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={auditQuery.data ?? []}
              emptyLabel="No audit logs found."
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
