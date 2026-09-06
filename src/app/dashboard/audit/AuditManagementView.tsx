"use client";

import { useMemo, useState, type KeyboardEvent } from "react";
import { useLocale } from "next-intl";
import { Eye, Search, X } from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Loader } from "@/shared/components/ui/loader";
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
    email: string | null;
    avatar: string | null;
  } | null;
  record_id: number | null;
  record_uuid: string | null;
  created_at: string;
};

type AuditRecordData = Record<string, unknown> | Array<Record<string, unknown>> | null;

type DateRangeInputProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
};

const DateRangeInput = ({
  from,
  to,
  onFromChange,
  onToChange,
}: DateRangeInputProps) => (
  <div className="flex w-full flex-col gap-2 rounded-lg border bg-background p-2 sm:w-auto sm:flex-row sm:items-center">
    <Input
      type="datetime-local"
      value={from}
      onChange={(event) => onFromChange(event.target.value)}
      className="border-0 shadow-none focus-visible:ring-0 sm:w-[13rem]"
      aria-label="Filter audit logs from date and time"
    />
    <span className="px-1 text-center text-sm text-muted-foreground">to</span>
    <Input
      type="datetime-local"
      value={to}
      onChange={(event) => onToChange(event.target.value)}
      className="border-0 shadow-none focus-visible:ring-0 sm:w-[13rem]"
      aria-label="Filter audit logs to date and time"
    />
  </div>
);

const formatRecordValue = (value: unknown): string => {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return JSON.stringify(value);
};

const RecordDetailsTable = ({ record }: { record: Record<string, unknown> }) => {
  const entries = Object.entries(record).filter(([label]) => label !== "id");

  if (entries.length === 0) {
    return (
      <Alert>
        <AlertDescription>No record details available.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background">
      <div className="divide-y">
        {entries.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-2 px-4 py-3 sm:grid-cols-[minmax(10rem,14rem)_1fr] sm:items-start"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {label}
            </p>
            <p className="break-all text-sm text-foreground">
              {formatRecordValue(value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecordDetailsContent = ({ record }: { record: AuditRecordData }) => {
  if (!record) {
    return (
      <Alert>
        <AlertDescription>
          Record not found. It may have been deleted after this audit event.
        </AlertDescription>
      </Alert>
    );
  }

  if (Array.isArray(record)) {
    if (record.length === 0) {
      return (
        <Alert>
          <AlertDescription>No related records found.</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {record.map((item, index) => (
          <div key={index} className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Row {index + 1}
            </p>
            <RecordDetailsTable record={item} />
          </div>
        ))}
      </div>
    );
  }

  return <RecordDetailsTable record={record} />;
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

const buildAuditUrl = (params: {
  table: string;
  from: string;
  to: string;
}) => {
  const searchParams = new URLSearchParams();
  const fromValue = params.from ? new Date(params.from).toISOString() : "";
  const toValue = params.to ? new Date(params.to).toISOString() : "";

  if (params.table) {
    searchParams.set("table", params.table);
  }
  if (fromValue) {
    searchParams.set("from", fromValue);
  }
  if (toValue) {
    searchParams.set("to", toValue);
  }

  const query = searchParams.toString();
  return `/api/dashboard/audit${query ? `?${query}` : ""}`;
};

const buildAuditRecordUrl = (log: AuditLogRow) => {
  const params = new URLSearchParams({ table: log.table_name });

  if (log.record_id != null) {
    params.set("recordId", String(log.record_id));
  } else if (log.record_uuid) {
    params.set("recordUuid", log.record_uuid);
  }

  return `/api/dashboard/audit/record?${params.toString()}`;
};

const RecordDetailsDialog = ({ log }: { log: AuditLogRow }) => {
  const [open, setOpen] = useState(false);
  const recordQuery = useStandardQuery(
    [
      "dashboard",
      "audit-record",
      log.table_name,
      log.record_id != null ? String(log.record_id) : log.record_uuid || "missing",
    ],
    () =>
      apiFetch<{ record: AuditRecordData }>(buildAuditRecordUrl(log)).then(
        (data) => data.record
      ),
    {
      enabled: open && (log.record_id != null || Boolean(log.record_uuid)),
      staleTime: 30 * 1000,
    }
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={`View ${log.table_name} record details`}
        >
          <Eye className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Record details</DialogTitle>
          <DialogDescription>
            {log.table_name}
            {log.record_id != null
              ? ` #${log.record_id}`
              : log.record_uuid
                ? ` ${log.record_uuid}`
                : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto rounded-xl border bg-muted/20 p-4">
          {recordQuery.isLoading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader className="text-muted-foreground" label="Loading record details" />
            </div>
          ) : recordQuery.isError ? (
            <Alert>
              <AlertDescription>Unable to load record details.</AlertDescription>
            </Alert>
          ) : (
            <RecordDetailsContent record={recordQuery.data ?? null} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const AuditManagementView = () => {
  const locale = useLocale();
  const [tableInput, setTableInput] = useState("");
  const [appliedTable, setAppliedTable] = useState("");
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");
  const [appliedFromDate, setAppliedFromDate] = useState("");
  const [appliedToDate, setAppliedToDate] = useState("");

  const auditQuery = useStandardQuery(
    [
      "dashboard",
      "audit",
      appliedTable || "all",
      appliedFromDate || "nofrom",
      appliedToDate || "noto",
    ],
    () =>
      apiFetch<{ logs: AuditLogRow[] }>(
        buildAuditUrl({
          table: appliedTable,
          from: appliedFromDate,
          to: appliedToDate,
        })
      ).then(
        (data) => data.logs
      ),
    {
      staleTime: 30 * 1000,
    }
  );

  const handleApplyFilter = () => {
    setAppliedTable(tableInput.trim());
    setAppliedFromDate(fromDateInput);
    setAppliedToDate(toDateInput);
  };

  const handleClearFilter = () => {
    setTableInput("");
    setAppliedTable("");
    setFromDateInput("");
    setToDateInput("");
    setAppliedFromDate("");
    setAppliedToDate("");
  };

  const handleFilterKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    handleApplyFilter();
  };

  const columns = useMemo(
    () => [
      {
        key: "changed_by",
        label: "Actor",
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
                  {log.changed_by_partner?.email?.trim() ||
                    log.changed_by_partner?.fullname?.trim() ||
                    log.changed_by_partner?.username?.trim() ||
                    "Unknown partner"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {log.changed_by_partner?.fullname?.trim() ||
                    log.changed_by_partner?.username?.trim() ||
                    "Partner account"}
                </p>
              </div>
            </div>
          );
        },
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
        key: "table_name",
        label: "Entity",
        render: (log: AuditLogRow) => log.table_name,
      },
      {
        key: "record",
        label: "Record",
        render: (log: AuditLogRow) =>
          log.record_id != null || log.record_uuid ? (
            <RecordDetailsDialog log={log} />
          ) : (
            "—"
          ),
      },
      {
        key: "created_at",
        label: "When",
        render: (log: AuditLogRow) => (
          <span className="text-muted-foreground">
            {formatRelativeDate(log.created_at, locale)}
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
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <DateRangeInput
                from={fromDateInput}
                to={toDateInput}
                onFromChange={setFromDateInput}
                onToChange={setToDateInput}
              />
              <Button type="button" variant="outline" onClick={handleApplyFilter}>
                Apply
              </Button>
            </div>
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
