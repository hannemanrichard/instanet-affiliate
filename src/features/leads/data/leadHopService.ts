import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  CreateLeadHopInput,
  LeadHopEntity,
  UpdateLeadHopInput,
} from "../domain";
import type { LeadHopRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type LeadHopRow = Tables["lead_hop"]["Row"];

export class SupabaseLeadHopService implements LeadHopRepository {
  private readonly tableName = "lead_hop";

  async getAll(): Promise<LeadHopEntity[]> {
    return withPerformanceTracking(
      "LeadHopService",
      "getAll",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .order("lead_id", { ascending: false });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getAll",
            table: this.tableName,
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async getByLeadId(leadId: number): Promise<LeadHopEntity[]> {
    return withPerformanceTracking(
      "LeadHopService",
      "getByLeadId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("lead_id", leadId)
              .order("agent_id", { ascending: true });

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

  async getByAgentId(agentId: number): Promise<LeadHopEntity[]> {
    return withPerformanceTracking(
      "LeadHopService",
      "getByAgentId",
      async () => {
        const rows = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("agent_id", agentId)
              .order("lead_id", { ascending: false });

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getByAgentId",
            table: this.tableName,
            metadata: { agentId },
          }
        );

        return rows.map(this.mapRowToEntity);
      }
    );
  }

  async getById(
    leadId: number,
    agentId: number
  ): Promise<LeadHopEntity | null> {
    return withPerformanceTracking(
      "LeadHopService",
      "getById",
      async () => {
        const row = await DatabaseWrapper.executeQuery(
          async () => {
            const { data, error } = await supabase
              .from(this.tableName)
              .select("*")
              .eq("lead_id", leadId)
              .eq("agent_id", agentId)
              .maybeSingle();

            if (error) throw error;
            return { data, error };
          },
          {
            operation: "getById",
            table: this.tableName,
            metadata: { leadId, agentId },
          }
        );

        if (!row) return null;
        return this.mapRowToEntity(row);
      }
    );
  }

  async create(data: CreateLeadHopInput): Promise<LeadHopEntity> {
    return withPerformanceTracking(
      "LeadHopService",
      "create",
      async () => {
        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data: created, error } = await supabase
              .from(this.tableName)
              .insert({
                lead_id: data.lead_id,
                agent_id: data.agent_id,
              })
              .select()
              .single();

            if (error) throw error;
            return { data: created, error };
          },
          {
            operation: "create",
            table: this.tableName,
            metadata: { leadId: data.lead_id, agentId: data.agent_id },
            auditLog: {
              enabled: true,
              action: "INSERT",
              recordId: data.lead_id,
              newValues: {
                lead_id: data.lead_id,
                agent_id: data.agent_id,
              },
            },
          }
        );

        return this.mapRowToEntity(row);
      }
    );
  }

  async update(
    leadId: number,
    agentId: number,
    data: UpdateLeadHopInput
  ): Promise<LeadHopEntity> {
    return withPerformanceTracking(
      "LeadHopService",
      "update",
      async () => {
        const updatePayload: Partial<LeadHopRow> = {};
        if (data.lead_id !== undefined) {
          updatePayload.lead_id = data.lead_id;
        }
        if (data.agent_id !== undefined) {
          updatePayload.agent_id = data.agent_id;
        }

        const row = await DatabaseWrapper.executeMutation(
          async () => {
            const { data: updated, error } = await supabase
              .from(this.tableName)
              .update(updatePayload)
              .eq("lead_id", leadId)
              .eq("agent_id", agentId)
              .select()
              .single();

            if (error) throw error;
            return { data: updated, error };
          },
          {
            operation: "update",
            table: this.tableName,
            metadata: { leadId, agentId },
            auditLog: {
              enabled: true,
              action: "UPDATE",
              recordId: leadId,
              newValues: updatePayload,
            },
          }
        );

        return this.mapRowToEntity(row);
      }
    );
  }

  async delete(leadId: number, agentId: number): Promise<void> {
    return withPerformanceTracking(
      "LeadHopService",
      "delete",
      async () => {
        await DatabaseWrapper.executeMutation(
          async () => {
            const { error } = await supabase
              .from(this.tableName)
              .delete()
              .eq("lead_id", leadId)
              .eq("agent_id", agentId);

            if (error) throw error;
            return { data: { leadId, agentId }, error };
          },
          {
            operation: "delete",
            table: this.tableName,
            metadata: { leadId, agentId },
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

  async deleteByLeadId(leadId: number): Promise<void> {
    return withPerformanceTracking(
      "LeadHopService",
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

  private mapRowToEntity = (row: LeadHopRow): LeadHopEntity => ({
    lead_id: row.lead_id,
    agent_id: row.agent_id,
  });
}

