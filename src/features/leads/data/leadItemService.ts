import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  CreateLeadItemInput,
  LeadItemEntity,
  UpdateLeadItemInput,
} from "../domain";
import type { LeadItemRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type LeadItemRow = Tables["lead_item"]["Row"];

export class SupabaseLeadItemService implements LeadItemRepository {
  private readonly tableName = "lead_item";

  async getByLeadId(leadId: number): Promise<LeadItemEntity[]> {
    return withPerformanceTracking(
      "LeadItemService",
      "getByLeadId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("lead_id", leadId);

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByLeadId",
            table: this.tableName,
            metadata: { leadId },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async createMany(
    leadId: number,
    items: CreateLeadItemInput[]
  ): Promise<LeadItemEntity[]> {
    if (!items.length) return [];

    return withPerformanceTracking(
      "LeadItemService",
      "createMany",
      async () => {
        const rows = await DatabaseWrapper.executeMutation(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .insert(
                items.map((item) => ({
                  lead_id: leadId,
                  item_id: item.item_id,
                  qty: item.qty,
                }))
              )
              .select("*");

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "createMany",
            table: this.tableName,
            metadata: { leadId, count: items.length },
            auditLog: {
              enabled: true,
              action: "INSERT",
              recordId: leadId,
              newValues: { items },
            },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async updateMany(
    leadId: number,
    items: UpdateLeadItemInput[]
  ): Promise<LeadItemEntity[]> {
    return withPerformanceTracking(
      "LeadItemService",
      "updateMany",
      async () => {
        await this.deleteByLeadId(leadId);
        return this.createMany(
          leadId,
          items.map((item) => ({
            item_id: item.item_id,
            qty: item.qty,
          }))
        );
      }
    );
  }

  async deleteByLeadId(leadId: number): Promise<void> {
    return withPerformanceTracking(
      "LeadItemService",
      "deleteByLeadId",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { error } = await supabase
              .from(this.tableName)
              .delete()
              .eq("lead_id", leadId);

            if (error) throw error;
            return { data: { leadId }, error };
          },
          {
            operation: "deleteByLeadId",
            table: this.tableName,
            metadata: { leadId },
            auditLog: {
              enabled: true,
              action: "DELETE",
              recordId: leadId,
            },
          }
        );
      }
    );
  }

  private mapRowToEntity = (row: LeadItemRow): LeadItemEntity => ({
    lead_id: row.lead_id,
    item_id: row.item_id,
    qty: row.qty,
  });
}

