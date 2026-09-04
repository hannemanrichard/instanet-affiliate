import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import type { InventoryPhase } from "@/features/inventory/domain";
import { InventoryError } from "@/features/inventory/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

const VALID_PHASES = new Set<InventoryPhase>([
  "ordered",
  "in_delivery",
  "delivered",
  "other",
]);

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    await requireDashboardActor();
    const { productId: productIdParam } = await context.params;
    const productId = Number(productIdParam);

    if (!productId || Number.isNaN(productId)) {
      throw new InventoryError(
        "Valid productId is required",
        "INVENTORY_INVALID_PRODUCT"
      );
    }

    const phasesParam = req.nextUrl.searchParams.get("phases") ?? "";
    const phases = phasesParam
      .split(",")
      .map((phase) => phase.trim())
      .filter((phase): phase is InventoryPhase =>
        VALID_PHASES.has(phase as InventoryPhase)
      );

    if (!phases.length) {
      throw new InventoryError(
        "At least one valid phase is required",
        "INVENTORY_INVALID_PHASES"
      );
    }

    const productName =
      req.nextUrl.searchParams.get("productName")?.trim() || undefined;

    const details = await inventoryApplicationService.getInventoryPhaseDetails(
      productId,
      { phases, productName }
    );

    return NextResponse.json({ details });
  } catch (error) {
    return jsonError(error);
  }
}
