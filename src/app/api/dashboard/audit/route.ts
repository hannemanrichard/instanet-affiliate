import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/infrastructure/supabase/server";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

const auditQuerySchema = z.object({
  table: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().positive().max(200).optional().default(50),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdminActor();
    const query = parseSearchParams(req.nextUrl.searchParams, auditQuerySchema);

    let auditQuery = supabaseServer
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(query.limit);

    if (query.table) {
      auditQuery = auditQuery.eq("table_name", query.table);
    }

    const { data, error } = await auditQuery;
    if (error) {
      throw error;
    }

    const logs = data ?? [];
    const changedByIds = Array.from(
      new Set(
        logs
          .map((log) => log.changed_by)
          .filter((value): value is number => value != null)
      )
    );

    let partnersById = new Map<
      number,
      { id: number; fullname: string | null; username: string | null; avatar: string | null }
    >();

    if (changedByIds.length > 0) {
      const { data: partners, error: partnersError } = await supabaseServer
        .from("partners")
        .select("id, fullname, username, avatar")
        .in("id", changedByIds);

      if (partnersError) {
        throw partnersError;
      }

      partnersById = new Map(
        (partners ?? []).map((partner) => [
          partner.id,
          {
            id: partner.id,
            fullname: partner.fullname,
            username: partner.username,
            avatar: partner.avatar,
          },
        ])
      );
    }

    return NextResponse.json({
      logs: logs.map((log) => ({
        ...log,
        changed_by_partner:
          log.changed_by != null ? partnersById.get(log.changed_by) ?? null : null,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
