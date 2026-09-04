import { NextRequest, NextResponse } from "next/server";
import { dashboardApplicationService } from "@/features/dashboard/application/services/dashboardApplicationService";
import type { DashboardDateRangePreset } from "@/features/dashboard/domain";
import { dashboardOverviewQuerySchema } from "@/features/dashboard/domain/validations";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    const partner = await requireCurrentPartner();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      dashboardOverviewQuerySchema
    );

    const overview = await dashboardApplicationService.getOverview(partner.id, {
      preset: query.preset as DashboardDateRangePreset,
      fromDate: query.from,
      toDate: query.to,
    });

    return NextResponse.json(overview);
  } catch (error) {
    return jsonError(error);
  }
}
