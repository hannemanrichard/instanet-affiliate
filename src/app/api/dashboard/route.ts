import { NextRequest, NextResponse } from "next/server";
import { dashboardApplicationService } from "@/features/dashboard/application/services/dashboardApplicationService";
import {
  DASHBOARD_DATE_RANGE_PRESETS,
  type DashboardDateRangePreset,
} from "@/features/dashboard/domain";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";

const isPreset = (value: string): value is DashboardDateRangePreset =>
  (DASHBOARD_DATE_RANGE_PRESETS as string[]).includes(value);

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function GET(req: NextRequest) {
  try {
    const partner = await requireCurrentPartner();
    const { searchParams } = req.nextUrl;

    const fromDate = searchParams.get("from")?.trim() ?? "";
    const toDate = searchParams.get("to")?.trim() ?? "";
    const presetParam = searchParams.get("preset")?.trim() ?? "last_30_days";

    if (!isIsoDate(fromDate) || !isIsoDate(toDate)) {
      return NextResponse.json(
        { error: "Query params from and to must be yyyy-MM-dd dates" },
        { status: 400 }
      );
    }

    if (!isPreset(presetParam)) {
      return NextResponse.json(
        { error: "Invalid dashboard date-range preset" },
        { status: 400 }
      );
    }

    const overview = await dashboardApplicationService.getOverview(partner.id, {
      preset: presetParam,
      fromDate,
      toDate,
    });

    return NextResponse.json(overview);
  } catch (error) {
    return jsonError(error);
  }
}
