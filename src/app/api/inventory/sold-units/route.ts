import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { InventoryError } from "@/features/inventory/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(req: NextRequest) {
  try {
    await requireDashboardActor();
    const fromDate = req.nextUrl.searchParams.get("fromDate")?.trim() ?? "";
    const toDate = req.nextUrl.searchParams.get("toDate")?.trim() ?? "";

    if (!fromDate || !toDate) {
      throw new InventoryError(
        "fromDate and toDate are required",
        "INVENTORY_DATE_RANGE_REQUIRED"
      );
    }

    const soldUnits =
      await inventoryApplicationService.getNumberOfUnitsSoldByDateRange({
        fromDate,
        toDate,
      });

    return NextResponse.json({ soldUnits });
  } catch (error) {
    return jsonError(error);
  }
}
