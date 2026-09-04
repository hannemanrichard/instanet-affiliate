import { Skeleton } from "@/shared/components/ui/skeleton";

// Table loading skeleton
export const TableSkeleton = ({
  rows = 8,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) => (
  <div className="space-y-4">
    {/* Header skeleton */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>

    {/* Rows skeleton */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

// Form section loading skeleton
export const FormSectionSkeleton = () => (
  <div className="space-y-4 p-4 border rounded-lg">
    <Skeleton className="h-6 w-32" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  </div>
);

// Page loading skeleton
export const PageSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>

    {/* Filters skeleton */}
    <div className="flex space-x-4">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Table skeleton */}
    <TableSkeleton rows={8} columns={6} />
  </div>
);

// Dialog loading skeleton
export const DialogSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-6 w-48" />
    <div className="space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex justify-end space-x-2">
      <Skeleton className="h-10 w-20" />
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);
