import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type {
  CreateLeadInput,
  LeadEntity,
  LeadSummary,
  LeadWithItems,
  UpdateLeadInput,
} from "../domain";
import type { LeadItemEntity } from "../domain/entities";
import type { LeadRepository, UserOption } from "../domain/repositories";
import type {
  LeadFilters,
  LeadPaginationParams,
  PaginatedLeadsResult,
} from "../domain/valueObjects";

type Tables = Database["public"]["Tables"];
type LeadRow = Tables["leads"]["Row"];
type LeadInsert = Tables["leads"]["Insert"];
type LeadUpdate = Tables["leads"]["Update"];
type LeadItemRow = Tables["lead_item"]["Row"] & {
  items?: Tables["items"]["Row"] | null;
};
type UserRow = Tables["users"]["Row"];

export class SupabaseLeadService implements LeadRepository {
  private readonly tableName = "leads";

  /** Columns needed for list mapping — avoid select("*"). */
  private readonly listColumns = [
    "id",
    "first_name",
    "last_name",
    "phone",
    "address",
    "commune",
    "wilaya",
    "channel",
    "comment",
    "color",
    "size",
    "product",
    "status",
    "objective",
    "offer",
    "price",
    "agent_id",
    "partner_id",
    "created_at",
    "last_changed_status",
    "has_recourse",
    "is_abondoned",
    "is_moved",
    "is_wholesale",
  ].join(", ");

  async getAll(filters?: LeadFilters): Promise<LeadEntity[]> {
    return withPerformanceTracking("LeadService", "getAll", async () => {
      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          let query = supabase
            .from(this.tableName)
            .select(this.listColumns)
            .order("created_at", { ascending: false });

          if (filters?.partnerId != null) {
            query = query.eq("partner_id", filters.partnerId);
          }
          if (filters?.status) {
            query = query.eq("status", filters.status);
          }
          if (filters?.agentId != null) {
            query = query.eq("agent_id", filters.agentId);
          }

          const { data, error } = await query;
          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getAll",
          table: this.tableName,
          metadata: { filters },
        }
      );

      return (rows as LeadRow[]).map(this.mapRowToEntity);
    });
  }

  async getPaginated(
    filters: LeadFilters,
    pagination: LeadPaginationParams
  ): Promise<PaginatedLeadsResult> {
    return withPerformanceTracking("LeadService", "getPaginated", async () => {
      const page = Math.max(1, pagination.page);
      const limit = Math.max(1, Math.min(100, pagination.limit));
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const result = await DatabaseWrapper.executeQuery(
        async () => {
          let query = supabase
            .from(this.tableName)
            .select(this.listColumns, { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

          if (filters.partnerId != null) {
            query = query.eq("partner_id", filters.partnerId);
          }
          if (filters.status) {
            query = query.eq("status", filters.status);
          }
          if (filters.agentId != null) {
            query = query.eq("agent_id", filters.agentId);
          }
          if (filters.search?.trim()) {
            const normalized = filters.search.trim();
            query = query.or(
              [
                `first_name.ilike.%${normalized}%`,
                `last_name.ilike.%${normalized}%`,
                `phone.ilike.%${normalized}%`,
              ].join(",")
            );
          }

          const { data, error, count } = await query;
          if (error) throw error;
          return {
            data: {
              rows: (data ?? []) as LeadRow[],
              total: count ?? 0,
            },
            error,
          };
        },
        {
          operation: "getPaginated",
          table: this.tableName,
          metadata: { filters, pagination: { page, limit } },
        }
      );

      return {
        data: result.rows.map(this.mapRowToEntity),
        total: result.total,
        page,
        limit,
      };
    });
  }

  async getById(id: number): Promise<LeadEntity | null> {
    return withPerformanceTracking("LeadService", "getById", async () => {
      const row = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select(this.listColumns)
            .eq("id", id)
            .maybeSingle();

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getById",
          table: this.tableName,
          metadata: { id },
        }
      );

      if (!row) return null;
      return this.mapRowToEntity(row);
    });
  }

  async getByStatus(status: string, partnerId?: number): Promise<LeadEntity[]> {
    return withPerformanceTracking("LeadService", "getByStatus", async () => {
      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          let query = supabase
            .from(this.tableName)
            .select(this.listColumns)
            .eq("status", status)
            .order("created_at", { ascending: false });

          if (partnerId != null) {
            query = query.eq("partner_id", partnerId);
          }

          const { data, error } = await query;
          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getByStatus",
          table: this.tableName,
          metadata: { status, partnerId },
        }
      );

      return (rows as LeadRow[]).map(this.mapRowToEntity);
    });
  }

  async search(term: string, partnerId?: number): Promise<LeadEntity[]> {
    if (!term.trim()) return [];

    const normalized = term.trim();
    return withPerformanceTracking("LeadService", "search", async () => {
      const rows = await DatabaseWrapper.executeQuery(
        async () => {
          let query = supabase
            .from(this.tableName)
            .select(this.listColumns)
            .or(
              [
                `first_name.ilike.%${normalized}%`,
                `last_name.ilike.%${normalized}%`,
                `phone.ilike.%${normalized}%`,
              ].join(",")
            )
            .order("created_at", { ascending: false });

          if (partnerId != null) {
            query = query.eq("partner_id", partnerId);
          }

          const { data, error } = await query;
          if (error) throw error;
          return { data, error };
        },
        {
          operation: "search",
          table: this.tableName,
          metadata: { term: normalized, partnerId },
        }
      );

      return (rows as LeadRow[]).map(this.mapRowToEntity);
    });
  }

  async create(data: CreateLeadInput): Promise<LeadEntity> {
    return withPerformanceTracking("LeadService", "create", async () => {
      const payload: LeadInsert = this.mapCreateInputToInsert(data);

      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: created, error } = await supabase
            .from(this.tableName)
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          return { data: created, error };
        },
        {
          operation: "create",
          table: this.tableName,
          metadata: { first_name: data.first_name },
          auditLog: {
            enabled: true,
            action: "INSERT",
            newValues: payload,
          },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  async update(id: number, data: UpdateLeadInput): Promise<LeadEntity> {
    return withPerformanceTracking("LeadService", "update", async () => {
      const payload: LeadUpdate = this.mapUpdateInputToUpdate(data);

      const row = await DatabaseWrapper.executeMutation(
        async () => {
          const { data: updated, error } = await supabase
            .from(this.tableName)
            .update(payload)
            .eq("id", id)
            .select()
            .single();

          if (error) throw error;
          return { data: updated, error };
        },
        {
          operation: "update",
          table: this.tableName,
          metadata: { id },
          auditLog: {
            enabled: true,
            action: "UPDATE",
            recordId: id,
            newValues: payload,
          },
        }
      );

      return this.mapRowToEntity(row);
    });
  }

  async delete(id: number): Promise<void> {
    return withPerformanceTracking("LeadService", "delete", async () => {
      await DatabaseWrapper.executeMutation(
        async () => {
          const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq("id", id);

          if (error) throw error;
          return { data: { id }, error };
        },
        {
          operation: "delete",
          table: this.tableName,
          metadata: { id },
          auditLog: {
            enabled: true,
            action: "DELETE",
            recordId: id,
          },
        }
      );
    });
  }

  async getWithItems(id: number): Promise<LeadWithItems | null> {
    return withPerformanceTracking("LeadService", "getWithItems", async () => {
      const row = await DatabaseWrapper.executeQuery(
        async () => {
          const { data, error } = await supabase
            .from(this.tableName)
            .select(
              `
                *,
                lead_item (
                  item_id,
                  lead_id,
                  qty,
                  items (*)
                )
              `
            )
            .eq("id", id)
            .maybeSingle<LeadRow & { lead_item?: LeadItemRow[] | null }>();

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getWithItems",
          table: this.tableName,
          metadata: { id },
        }
      );

      if (!row) return null;

      const lead = this.mapRowToEntity(row);
      const items = (row.lead_item ?? []).map(this.mapLeadItemRowToEntity);
      return { lead, items };
    });
  }

  async getSummary(partnerId?: number): Promise<LeadSummary> {
    return withPerformanceTracking("LeadService", "getSummary", async () => {
      const rows = await DatabaseWrapper.executeQuery<
        Array<{
          total_leads: number | null;
          total_pending: number | null;
          total_confirmed: number | null;
          total_wholesale: number | null;
        }>
      >(
        async () => {
          const { data, error } = await supabase.rpc("get_lead_summary", {
            p_partner_id: partnerId ?? null,
          });

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getSummary",
          table: this.tableName,
          metadata: { partnerId },
        }
      );

      const row = rows[0];
      return {
        total_leads: Number(row?.total_leads ?? 0),
        total_pending: Number(row?.total_pending ?? 0),
        total_confirmed: Number(row?.total_confirmed ?? 0),
        total_wholesale: Number(row?.total_wholesale ?? 0),
      };
    });
  }

  async getAgents(): Promise<UserOption[]> {
    return withPerformanceTracking("LeadService", "getAgents", async () => {
      const rows = await DatabaseWrapper.executeQuery<
        Pick<UserRow, "id" | "name" | "email">[]
      >(
        async () => {
          const { data, error } = await supabase
            .from("users")
            .select("id, name, email")
            .in("role", ["agent", "community-manager"])
            .eq("is_active", true)
            .order("name", { ascending: true });

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getAgents",
          table: "users",
        }
      );

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
      }));
    });
  }

  async getTrackers(): Promise<UserOption[]> {
    return withPerformanceTracking("LeadService", "getTrackers", async () => {
      const rows = await DatabaseWrapper.executeQuery<
        Pick<UserRow, "id" | "name" | "email">[]
      >(
        async () => {
          const { data, error } = await supabase
            .from("users")
            .select("id, name, email")
            .eq("role", "tracker")
            .eq("is_active", true)
            .order("name", { ascending: true });

          if (error) throw error;
          return { data, error };
        },
        {
          operation: "getTrackers",
          table: "users",
        }
      );

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
      }));
    });
  }

  private mapRowToEntity = (row: LeadRow): LeadEntity => ({
    id: row.id,
    first_name: row.first_name ?? undefined,
    last_name: row.last_name ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    commune: row.commune ?? undefined,
    wilaya: row.wilaya ?? undefined,
    channel: row.channel ?? undefined,
    comment: row.comment ?? undefined,
    color: row.color ?? undefined,
    size: row.size ?? undefined,
    product: row.product ?? undefined,
    status: row.status ?? undefined,
    objective: row.objective ?? undefined,
    offer: row.offer ?? undefined,
    price: row.price ?? undefined,
    agent_id: row.agent_id ?? undefined,
    partner_id: row.partner_id ?? undefined,
    created_at: row.created_at ?? undefined,
    last_changed_status: row.last_changed_status ?? undefined,
    has_recourse: row.has_recourse ?? undefined,
    is_abondoned: row.is_abondoned ?? undefined,
    is_moved: row.is_moved ?? undefined,
    is_wholesale: row.is_wholesale ?? undefined,
  });

  private mapLeadItemRowToEntity = (row: LeadItemRow): LeadItemEntity => ({
    lead_id: row.lead_id,
    item_id: row.item_id,
    qty: row.qty,
  });

  private mapCreateInputToInsert = (data: CreateLeadInput): LeadInsert => ({
    address: data.address ?? null,
    agent_id: data.agent_id ?? null,
    channel: data.channel ?? null,
    color: data.color ?? null,
    comment: data.comment ?? null,
    commune: data.commune ?? null,
    first_name: data.first_name ?? null,
    has_recourse: data.has_recourse ?? null,
    is_abondoned: data.is_abondoned ?? null,
    is_moved: data.is_moved ?? null,
    is_wholesale: data.is_wholesale ?? null,
    last_name: data.last_name ?? null,
    objective: data.objective ?? null,
    offer: data.offer ?? null,
    partner_id: data.partner_id ?? null,
    phone: data.phone ?? null,
    price: data.price ?? null,
    product: data.product ?? null,
    size: data.size ?? null,
    status: data.status ?? null,
    wilaya: data.wilaya ?? null,
  });

  private mapUpdateInputToUpdate = (data: UpdateLeadInput): LeadUpdate => ({
    address: data.address ?? undefined,
    agent_id: data.agent_id ?? undefined,
    channel: data.channel ?? undefined,
    color: data.color ?? undefined,
    comment: data.comment ?? undefined,
    commune: data.commune ?? undefined,
    created_at: data.created_at ?? undefined,
    first_name: data.first_name ?? undefined,
    has_recourse: data.has_recourse ?? undefined,
    is_abondoned: data.is_abondoned ?? undefined,
    is_moved: data.is_moved ?? undefined,
    is_wholesale: data.is_wholesale ?? undefined,
    last_changed_status: data.last_changed_status ?? undefined,
    last_name: data.last_name ?? undefined,
    objective: data.objective ?? undefined,
    offer: data.offer ?? undefined,
    partner_id: data.partner_id ?? undefined,
    phone: data.phone ?? undefined,
    price: data.price ?? undefined,
    product: data.product ?? undefined,
    size: data.size ?? undefined,
    status: data.status ?? undefined,
    wilaya: data.wilaya ?? undefined,
  });
}
