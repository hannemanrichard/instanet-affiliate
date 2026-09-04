import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { soldUnitsQuerySchema } from "@/features/inventory/domain/validations";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    await requireDashboardActor();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      soldUnitsQuerySchema
    );

    const soldUnits =
      await inventoryApplicationService.getNumberOfUnitsSoldByDateRange({
        fromDate: query.fromDate,
        toDate: query.toDate,
      });

    return NextResponse.json({ soldUnits });
  } catch (error) {
    return jsonError(error);
  }
}
