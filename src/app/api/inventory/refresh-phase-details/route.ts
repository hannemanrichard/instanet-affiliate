import { NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function POST() {
  try {
    await requireAdminActor();
    await inventoryApplicationService.refreshPhaseDetailsView();
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
