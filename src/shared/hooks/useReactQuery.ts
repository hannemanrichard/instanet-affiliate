import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "./use-toast";

/**
 * Standardized React Query hook for data fetching
 * Provides consistent configuration across the application
 */
export const useStandardQuery = <T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
    retry?: number;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    placeholderData?: T | (() => T | undefined);
  }
) => {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes default
    gcTime: options?.gcTime ?? 30 * 60 * 1000, // 30 minutes default
    enabled: options?.enabled ?? true,
    retry: options?.retry ?? 3,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    refetchOnReconnect: options?.refetchOnReconnect ?? true,
    placeholderData: options?.placeholderData,
  });
};

/**
 * Standardized React Query hook for mutations
 * Provides consistent error handling and cache invalidation
 */
export const useStandardMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
  }
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Show success toast
      if (options?.showSuccessToast !== false) {
        toast({
          title: "Success",
          description:
            options?.successMessage ?? "Operation completed successfully",
          variant: "default",
        });
      }

      options?.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Show error toast
      if (options?.showErrorToast !== false) {
        toast({
          title: "Error",
          description:
            options?.errorMessage ?? error.message ?? "An error occurred",
          variant: "destructive",
        });
      }

      options?.onError?.(error, variables);
    },
  });
};

/**
 * Hook for paginated queries
 */
export const usePaginatedQuery = <T>(
  queryKey: string[],
  queryFn: (
    page: number,
    limit: number
  ) => Promise<{ data: T[]; total: number; page: number; limit: number }>,
  options?: {
    page?: number;
    limit?: number;
    staleTime?: number;
    gcTime?: number;
  }
) => {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;

  return useStandardQuery(
    [...queryKey, "page", page.toString(), "limit", limit.toString()],
    () => queryFn(page, limit),
    {
      staleTime: options?.staleTime,
      gcTime: options?.gcTime,
    }
  );
};

/**
 * Hook for infinite queries (for infinite scrolling)
 */
export const useInfiniteQueryHook = <T>(
  queryKey: string[],
  queryFn: (pageParam: number) => Promise<{ data: T[]; nextCursor?: number }>,
  options?: {
    staleTime?: number;
    gcTime?: number;
  }
) => {
  return useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam = 0 }) => queryFn(pageParam as number),
    getNextPageParam: (lastPage: { data: T[]; nextCursor?: number }) =>
      lastPage.nextCursor,
    initialPageParam: 0,
    staleTime: options?.staleTime ?? 5 * 60 * 1000,
    gcTime: options?.gcTime ?? 30 * 60 * 1000,
  });
};

/**
 * Hook for optimistic queries - shows cached data instantly while fetching fresh data
 */
export const useOptimisticQuery = <TData, TVariables>(
  queryKey: string[],
  queryFn: (variables: TVariables) => Promise<TData>,
  variables: TVariables,
  options?: {
    optimisticData?: (variables: TVariables) => TData;
    staleTime?: number;
    gcTime?: number;
    enabled?: boolean;
    retry?: number;
  }
) => {
  const queryClient = useQueryClient();

  // Set optimistic data immediately if available
  if (options?.optimisticData && variables) {
    const optimistic = options.optimisticData(variables);
    queryClient.setQueryData(queryKey, optimistic);
  }

  // Fetch real data
  return useStandardQuery(
    [...queryKey, JSON.stringify(variables)],
    () => queryFn(variables),
    {
      staleTime: options?.staleTime,
      gcTime: options?.gcTime,
      enabled: options?.enabled && !!variables,
      retry: options?.retry,
    }
  );
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    invalidateQueries?: string[][];
    optimisticUpdate?: (variables: TVariables) => any;
    rollbackOnError?: boolean;
    successMessage?: string;
    errorMessage?: string;
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
  }
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      if (options?.optimisticUpdate) {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries();

        // Snapshot the previous value
        const previousData = queryClient.getQueryData(
          options.invalidateQueries?.[0] ?? []
        );

        // Optimistically update to the new value
        queryClient.setQueryData(
          options.invalidateQueries?.[0] ?? [],
          options.optimisticUpdate(variables)
        );

        // Return a context object with the snapshotted value
        return { previousData };
      }
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (options?.rollbackOnError && context?.previousData) {
        queryClient.setQueryData(
          options.invalidateQueries?.[0] ?? [],
          context.previousData
        );
      }

      // Show error toast
      if (options?.showErrorToast !== false) {
        toast({
          title: "Error",
          description:
            options?.errorMessage ?? error.message ?? "An error occurred",
          variant: "destructive",
        });
      }

      options?.onError?.(error, variables);
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Show success toast
      if (options?.showSuccessToast !== false && options?.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        });
      }

      options?.onSuccess?.(data, variables);
    },
  });
};

/**
 * Hook for prefetching data
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  return {
    prefetch: <T>(
      queryKey: string[],
      queryFn: () => Promise<T>,
      options?: {
        staleTime?: number;
        gcTime?: number;
      }
    ) => {
      return queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
        gcTime: options?.gcTime ?? 30 * 60 * 1000,
      });
    },
    prefetchInfinite: <T>(
      queryKey: string[],
      queryFn: (
        pageParam: number
      ) => Promise<{ data: T[]; nextCursor?: number }>,
      options?: {
        staleTime?: number;
        gcTime?: number;
      }
    ) => {
      return queryClient.prefetchInfiniteQuery({
        queryKey,
        queryFn: ({ pageParam = 0 }) => queryFn(pageParam as number),
        getNextPageParam: (lastPage: { data: T[]; nextCursor?: number }) =>
          lastPage.nextCursor,
        initialPageParam: 0,
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
        gcTime: options?.gcTime ?? 30 * 60 * 1000,
      });
    },
  };
};

/**
 * Comprehensive optimistic operations hook - combines optimistic queries and mutations
 */
export const useOptimisticOperations = <
  TData,
  TVariables,
  TMutationData,
  TMutationVariables,
>({
  queryKey,
  queryFn,
  optimisticQueryData,
  mutationFn,
  optimisticMutationData,
  enabled = true,
  staleTime,
  gcTime,
  retry = 3,
  successMessage,
  errorMessage,
  invalidateQueries = [],
}: {
  queryKey: string[];
  queryFn: (variables: TVariables) => Promise<TData>;
  optimisticQueryData?: (variables: TVariables) => TData;
  mutationFn: (variables: TMutationVariables) => Promise<TMutationData>;
  optimisticMutationData?: (variables: TMutationVariables) => TMutationData;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  retry?: number;
  successMessage?: string;
  errorMessage?: string;
  invalidateQueries?: string[][];
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Optimistic query operations
  const setOptimisticQueryData = (variables: TVariables) => {
    if (!optimisticQueryData) return;
    const optimistic = optimisticQueryData(variables);
    queryClient.setQueryData(queryKey, optimistic);
  };

  const refetchQuery = (variables: TVariables) => {
    return queryClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn(variables),
      staleTime,
      gcTime,
      retry,
    });
  };

  // Standard query
  const query = useStandardQuery(queryKey, () => queryFn({} as TVariables), {
    staleTime,
    gcTime,
    enabled,
    retry,
  });

  // Optimistic mutation
  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables: TMutationVariables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      if (optimisticMutationData) {
        const optimistic = optimisticMutationData(variables);
        queryClient.setQueryData(queryKey, optimistic);
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      // Show error message
      if (errorMessage) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      // Show success message
      if (successMessage) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }

      // Invalidate related queries
      invalidateQueries.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    // Query operations
    query,
    setOptimisticQueryData,
    refetchQuery,

    // Mutation operations
    mutation,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,

    // Combined state
    isLoading: query.isLoading || mutation.isPending,
    error: query.error || mutation.error,
  };
};

/**
 * Hook for cache management
 */
export const useCacheManager = () => {
  const queryClient = useQueryClient();

  return {
    invalidate: (queryKey: string[]) => {
      return queryClient.invalidateQueries({ queryKey });
    },
    invalidateAll: () => {
      return queryClient.invalidateQueries();
    },
    remove: (queryKey: string[]) => {
      return queryClient.removeQueries({ queryKey });
    },
    clear: () => {
      return queryClient.clear();
    },
    getQueryData: <T>(queryKey: string[]) => {
      return queryClient.getQueryData<T>(queryKey);
    },
    setQueryData: <T>(queryKey: string[], data: T) => {
      return queryClient.setQueryData(queryKey, data);
    },
  };
};
