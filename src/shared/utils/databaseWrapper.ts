import logger from "@/shared/utils/logger";
import { AuditLogger } from "./auditLogger";

export interface QueryOptions {
  operation: string;
  table: string;
  userId?: string;
  metadata?: Record<string, any>;
  auditLog?: {
    enabled: boolean;
    action: "INSERT" | "UPDATE" | "DELETE";
    recordId?: number | string;
    changedBy?: number; // affiliate_id or employee_id
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
  };
}

export interface QueryResult<T> {
  data: T | null;
  error: any;
}

export class DatabaseWrapper {
  static async executeQuery<T>(
    operation: () => Promise<QueryResult<T>>,
    options: QueryOptions
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Log the operation start
      logger.info(`[DB] Starting ${options.operation} on ${options.table}`, {
        userId: options.userId,
        metadata: options.metadata,
        timestamp: new Date().toISOString(),
      });

      const result = await operation();
      const duration = Date.now() - startTime;

      if (result.error) {
        const errorMessage = `[DB] Error in ${options.operation} on ${options.table}`;
        logger.error(
          errorMessage,
          result.error instanceof Error
            ? result.error
            : new Error(String(result.error))
        );
        logger.info("Error details:", {
          error: result.error,
          table: options.table,
          userId: options.userId,
          duration,
          timestamp: new Date().toISOString(),
        });
        throw new Error(`Database operation failed: ${result.error.message}`);
      }

      // Log successful operation
      logger.info(`[DB] Completed ${options.operation}`, {
        table: options.table,
        userId: options.userId,
        duration,
        timestamp: new Date().toISOString(),
      });

      return result.data as T;
    } catch (error) {
      const duration = Date.now() - startTime;

      const errorMessage = `[DB] Exception in ${options.operation} on ${options.table}`;
      logger.error(
        errorMessage,
        error instanceof Error ? error : new Error(String(error))
      );
      logger.info("Exception details:", {
        error: error instanceof Error ? error.message : error,
        table: options.table,
        userId: options.userId,
        duration,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  static async executeMutation<T>(
    operation: () => Promise<QueryResult<T>>,
    options: QueryOptions
  ): Promise<T> {
    const startTime = Date.now();

    try {
      logger.info(
        `[DB] Starting mutation ${options.operation} on ${options.table}`,
        {
          userId: options.userId,
          metadata: options.metadata,
          timestamp: new Date().toISOString(),
        }
      );

      // Execute the mutation
      const result = await operation();
      const duration = Date.now() - startTime;

      if (result.error) {
        const errorMessage = `[DB] Error in mutation ${options.operation} on ${options.table}`;
        logger.error(
          errorMessage,
          result.error instanceof Error
            ? result.error
            : new Error(String(result.error))
        );
        logger.info("Error details:", {
          error: result.error,
          table: options.table,
          userId: options.userId,
          duration,
          timestamp: new Date().toISOString(),
        });
        throw new Error(`Database operation failed: ${result.error.message}`);
      }

      // Log successful operation
      logger.info(`[DB] Completed mutation ${options.operation}`, {
        table: options.table,
        userId: options.userId,
        duration,
        timestamp: new Date().toISOString(),
      });

      // Handle audit logging if enabled
      if (options.auditLog?.enabled && result.data) {
        await this.logAuditEntry(result.data, options).catch((error) => {
          // Don't fail the operation if audit logging fails
          logger.error(
            "Failed to log audit entry",
            error instanceof Error ? error : new Error(String(error))
          );
        });
      }

      return result.data as T;
    } catch (error) {
      const duration = Date.now() - startTime;

      const errorMessage = `[DB] Exception in mutation ${options.operation} on ${options.table}`;
      logger.error(
        errorMessage,
        error instanceof Error ? error : new Error(String(error))
      );
      logger.info("Exception details:", {
        error: error instanceof Error ? error.message : error,
        table: options.table,
        userId: options.userId,
        duration,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }

  /**
   * Helper method to log audit entries
   */
  private static async logAuditEntry<T>(
    data: T,
    options: QueryOptions
  ): Promise<void> {
    if (!options.auditLog) return;

    const auditLog = options.auditLog;

    // Extract record ID from data if not provided
    let recordId = auditLog.recordId;
    if (!recordId && data && typeof data === "object") {
      const dataObj = data as Record<string, any>;
      recordId = dataObj.id || dataObj.record_id || dataObj.recordId;
    }

    if (!recordId) {
      logger.warn(
        `Cannot log audit entry for ${options.table}: record ID not found`
      );
      return;
    }

    await AuditLogger.logAuditEntry({
      table_name: options.table,
      recordId,
      action: auditLog.action,
      old_values: auditLog.oldValues,
      new_values: auditLog.newValues || (data as Record<string, any>),
      changed_by: auditLog.changedBy,
    });
  }

  static async executeTransaction<T>(
    operations: Array<() => Promise<QueryResult<any>>>,
    options: QueryOptions
  ): Promise<T[]> {
    const startTime = Date.now();

    try {
      logger.info(
        `[DB] Starting transaction with ${operations.length} operations`,
        {
          table: options.table,
          userId: options.userId,
          timestamp: new Date().toISOString(),
        }
      );

      const results: T[] = [];

      for (const operation of operations) {
        const result = await this.executeQuery(operation, {
          ...options,
          operation: `TRANSACTION_${options.operation}`,
        });
        results.push(result);
      }

      const duration = Date.now() - startTime;
      logger.info(`[DB] Transaction completed successfully`, {
        table: options.table,
        userId: options.userId,
        duration,
        timestamp: new Date().toISOString(),
      });

      return results;
    } catch (error) {
      const duration = Date.now() - startTime;

      const errorMessage = `[DB] Transaction failed on ${options.table}`;
      logger.error(
        errorMessage,
        error instanceof Error ? error : new Error(String(error))
      );
      logger.info("Transaction failure details:", {
        error: error instanceof Error ? error.message : error,
        table: options.table,
        userId: options.userId,
        duration,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }
}
