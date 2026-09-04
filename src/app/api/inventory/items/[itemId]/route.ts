import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parsePositiveIntParam } from "@/shared/server/parseRequest";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ itemId: string }> }
) {
  try {
    await requireDashboardActor();
    const { itemId: itemIdParam } = await context.params;
    const itemId = parsePositiveIntParam(itemIdParam, "itemId");

    const inventory =
      await inventoryApplicationService.getInventoryByItem(itemId);
    return NextResponse.json({ inventory });
  } catch (error) {
    return jsonError(error);
  }
}
