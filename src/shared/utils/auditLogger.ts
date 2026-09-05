import "server-only";
import { supabaseServer } from "@/infrastructure/supabase/server";
import { AUDIT_LOG_SOURCE } from "@/shared/server/auditSource";
import { errorHandlers } from "@/shared/utils/errorHandler";
import logger from "@/shared/utils/logger";
import { getAuditLogField } from "./idUtils";

export interface AuditEntry {
  table_name: string;
  recordId: number | string;
  source?: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_by?: number;
}

export class AuditLogger {
  /**
   * Log an audit entry to the database
   */
  static async logAuditEntry(entry: AuditEntry): Promise<void> {
    try {
      const insertData: any = {
        source: entry.source ?? AUDIT_LOG_SOURCE,
        table_name: entry.table_name,
        action: entry.action,
        old_values: entry.old_values ? JSON.stringify(entry.old_values) : null,
        new_values: entry.new_values ? JSON.stringify(entry.new_values) : null,
        changed_by: entry.changed_by,
      };

      // Use record_id for numbers, record_uuid for strings
      const fieldName = getAuditLogField(entry.recordId);
      insertData[fieldName] = entry.recordId;

      const { error } = await supabaseServer
        .from("audit_logs")
        .insert(insertData);

      if (error) {
        throw errorHandlers.common.createError(
          "CREATE_ERROR",
          "Failed to log audit entry",
          error.message || "Unknown error"
        );
      }
    } catch (error) {
      // Don't throw error for audit logging failures to avoid breaking main operations
      logger.error(
        "Audit logging failed",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Get audit logs for a specific table and record
   */
  static async getAuditLogs(
    tableName: string,
    recordId: number | string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      let query = supabaseServer
        .from("audit_logs")
        .select("*")
        .eq("table_name", tableName);

      // Use record_id for numbers, record_uuid for strings
      const fieldName = getAuditLogField(recordId);
      query = query.eq(fieldName, recordId);

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw errorHandlers.common.createError(
          "FETCH_ERROR",
          "Failed to fetch audit logs",
          error.message || "Unknown error"
        );
      }

      return data || [];
    } catch (err) {
      throw errorHandlers.common.createError(
        "FETCH_ERROR",
        "Failed to fetch audit logs",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  }

  /**
   * Get audit logs for a specific table
   */
  static async getTableAuditLogs(
    tableName: string,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const { data, error } = await supabaseServer
        .from("audit_logs")
        .select("*")
        .eq("table_name", tableName)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw errorHandlers.common.createError(
          "FETCH_ERROR",
          "Failed to fetch table audit logs",
          error.message || "Unknown error"
        );
      }

      return data || [];
    } catch (error) {
      throw errorHandlers.common.createError(
        "FETCH_ERROR",
        "Failed to fetch table audit logs",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }

  /**
   * Get audit logs for a specific user
   */
  static async getUserAuditLogs(
    changedBy: number,
    limit: number = 100
  ): Promise<any[]> {
    try {
      const { data, error } = await supabaseServer
        .from("audit_logs")
        .select("*")
        .eq("changed_by", changedBy)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw errorHandlers.common.createError(
          "FETCH_ERROR",
          "Failed to fetch user audit logs",
          error.message || "Unknown error"
        );
      }

      return data || [];
    } catch (error) {
      throw errorHandlers.common.createError(
        "FETCH_ERROR",
        "Failed to fetch user audit logs",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
}
