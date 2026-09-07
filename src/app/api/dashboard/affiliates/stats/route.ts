import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { partnerApplicationService } from "@/features/partners/application/services/partnerApplicationService";
import { earningsApplicationService } from "@/features/earnings/application/services/earningsApplicationService";
import { supabaseServer } from "@/infrastructure/supabase/server";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

const CONFIRMED_ORDER_STATUSES = ["processing", "delivered", "returned"] as const;

const affiliateStatsQuerySchema = z.object({
  partnerId: z.coerce.number().int().positive(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdminActor();

    const query = parseSearchParams(req.nextUrl.searchParams, affiliateStatsQuerySchema);
    const partner = await partnerApplicationService.getById(query.partnerId);

    if (!partner) {
      return NextResponse.json(
        { message: "Affiliate not found" },
        { status: 404 }
      );
    }

    const [
      totalOrdersResult,
      confirmedOrdersResult,
      deliveredOrdersResult,
      earningsSummary,
      recentCommissionsResult,
    ] = await Promise.all([
      supabaseServer
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", query.partnerId),
      supabaseServer
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", query.partnerId)
        .in("status", [...CONFIRMED_ORDER_STATUSES]),
      supabaseServer
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("partner_id", query.partnerId)
        .eq("status", "delivered"),
      earningsApplicationService.getEarningsSummary(query.partnerId),
      supabaseServer
        .from("commissions")
        .select(
          `
            id,
            product_name,
            quantity,
            amount,
            created_at,
            orders (
              status
            )
          `
        )
        .eq("partner_id", query.partnerId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    if (totalOrdersResult.error) throw totalOrdersResult.error;
    if (confirmedOrdersResult.error) throw confirmedOrdersResult.error;
    if (deliveredOrdersResult.error) throw deliveredOrdersResult.error;
    if (recentCommissionsResult.error) throw recentCommissionsResult.error;

    const totalOrders = totalOrdersResult.count ?? 0;
    const confirmedOrders = confirmedOrdersResult.count ?? 0;
    const deliveredOrders = deliveredOrdersResult.count ?? 0;
    const confirmationRate =
      totalOrders > 0 ? Math.round((confirmedOrders / totalOrders) * 100) : 0;
    const deliveryRate =
      confirmedOrders > 0 ? Math.round((deliveredOrders / confirmedOrders) * 100) : 0;

    const recentCommissions = (recentCommissionsResult.data ?? []).map((row) => ({
      id: row.id,
      productName: row.product_name ?? undefined,
      quantity: row.quantity ?? 0,
      commissionAmount: Number(row.amount ?? 0),
      status:
        row.orders && !Array.isArray(row.orders)
          ? row.orders.status ?? undefined
          : undefined,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      partner,
      totalOrders,
      confirmedOrders,
      deliveredOrders,
      confirmationRate,
      deliveryRate,
      totalCommissions: earningsSummary.readyTotal + earningsSummary.notReadyTotal,
      readyCommissions: earningsSummary.readyTotal,
      pendingCommissions: earningsSummary.notReadyTotal,
      recentCommissions,
    });
  } catch (error) {
    return jsonError(error);
  }
}
