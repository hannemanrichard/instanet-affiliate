import { NextRequest, NextResponse } from "next/server";
import { dashboardApplicationService } from "@/features/dashboard/application/services/dashboardApplicationService";
import type { DashboardDateRangePreset } from "@/features/dashboard/domain";
import { dashboardOverviewQuerySchema } from "@/features/dashboard/domain/validations";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      dashboardOverviewQuerySchema
    );

    const overview = await dashboardApplicationService.getOverview(
      actor.role === "partner" ? actor.partner.id : undefined,
      {
        preset: query.preset as DashboardDateRangePreset,
        fromDate: query.from,
        toDate: query.to,
      }
    );

    return NextResponse.json(overview);
  } catch (error) {
    return jsonError(error);
  }
}
