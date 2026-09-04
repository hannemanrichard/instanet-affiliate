/**
 * Utility functions for handling record IDs
 * Used by AuditLogger to determine the correct field name based on ID type
 */

/**
 * Determines the correct audit log field name based on the record ID type
 * @param recordId - The record ID (number or string)
 * @returns The field name to use in audit_logs table ('record_id' for numbers, 'record_uuid' for strings)
 */
export function getAuditLogField(
  recordId: number | string
): "record_id" | "record_uuid" {
  return typeof recordId === "number" ? "record_id" : "record_uuid";
}
