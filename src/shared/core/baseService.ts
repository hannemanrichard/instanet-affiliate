import { supabase } from "@/infrastructure/supabase/client";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";

export abstract class BaseSupabaseService {
  protected abstract tableName: string;
  protected abstract entityName: string;

  protected async executeQuery<R>(
    operation: () => Promise<{ data: R | null; error: any }>,
    options: {
      operation: string;
      metadata?: Record<string, any>;
    }
  ): Promise<R> {
    return DatabaseWrapper.executeQuery(operation, {
      table: this.tableName,
      ...options,
    });
  }

  protected async executeMutation<R>(
    operation: () => Promise<{ data: R | null; error: any }>,
    options: {
      operation: string;
      metadata?: Record<string, any>;
      auditLog: {
        action: "INSERT" | "UPDATE" | "DELETE";
        recordId?: number;
        oldValues?: Record<string, any>;
        newValues?: Record<string, any>;
        changedBy?: number;
      };
    }
  ): Promise<R> {
    return DatabaseWrapper.executeMutation(operation, {
      table: this.tableName,
      ...options,
    });
  }

  protected getTable() {
    return supabase.from(this.tableName as any);
  }

  // Helper method to convert Supabase types to domain types
  protected convertToDomainType<TDomain, TSupabase>(
    supabaseData: TSupabase | null
  ): TDomain | null {
    if (!supabaseData) return null;
    return supabaseData as unknown as TDomain;
  }

  // Helper method to convert domain types to Supabase types
  protected convertToSupabaseType<TSupabase, TDomain>(
    domainData: TDomain
  ): TSupabase {
    return domainData as unknown as TSupabase;
  }
}
