import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/infrastructure/supabase/server";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

const TABLE_LOOKUP_COLUMNS: Record<string, string[]> = {
  commissions: ["id", "order_id"],
  inventory: ["id", "item_id", "product_id"],
  lead_hop: ["lead_id"],
  lead_item: ["lead_id"],
  order_item: ["order_id"],
  product_page_images: ["product_page_id"],
  product_page_items: ["product_page_id"],
  product_page_testimonials: ["product_page_id"],
};

const MULTI_RECORD_TABLES = new Set([
  "lead_hop",
  "lead_item",
  "order_item",
  "product_page_images",
  "product_page_items",
  "product_page_testimonials",
]);

const auditRecordQuerySchema = z
  .object({
    table: z.string().trim().min(1).max(100),
    recordId: z.coerce.number().int().optional(),
    recordUuid: z.string().trim().uuid().optional(),
  })
  .refine((value) => value.recordId != null || value.recordUuid != null, {
    message: "recordId or recordUuid is required",
    path: ["recordId"],
  });

export async function GET(req: NextRequest) {
  try {
    await requireAdminActor();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      auditRecordQuerySchema
    );

    const lookupColumns =
      TABLE_LOOKUP_COLUMNS[query.table] ?? ["id"];

    if (query.recordId != null) {
      for (const column of lookupColumns) {
        const isMulti = MULTI_RECORD_TABLES.has(query.table);
        const baseQuery = supabaseServer
          .from(query.table as any)
          .select("*")
          .eq(column, query.recordId);

        if (isMulti) {
          const { data, error } = await baseQuery;
          if (error) {
            throw error;
          }
          if ((data ?? []).length > 0) {
            return NextResponse.json({ record: data });
          }
          continue;
        }

        const { data, error } = await baseQuery.maybeSingle();
        if (error) {
          throw error;
        }
        if (data) {
          return NextResponse.json({ record: data });
        }
      }

      return NextResponse.json({ record: null });
    }

    const { data, error } = await supabaseServer
      .from(query.table as any)
      .select("*")
      .eq("id", query.recordUuid)
      .maybeSingle();
    if (error) {
      throw error;
    }

    return NextResponse.json({ record: data ?? null });
  } catch (error) {
    return jsonError(error);
  }
}
