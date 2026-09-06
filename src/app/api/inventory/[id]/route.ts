import { NextRequest, NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { updateInventoryQuantityBodySchema } from "@/features/inventory/domain/validations";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireAuditActorPartnerId } from "@/shared/server/requireAuditActorPartnerId";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const auditActorId = await requireAuditActorPartnerId();
    const { id: idParam } = await context.params;
    const inventoryId = parsePositiveIntParam(idParam, "id");
    const body = await parseJsonBody(req, updateInventoryQuantityBodySchema);

    const inventory = await withAuditActor(
      auditActorId,
      () =>
        inventoryApplicationService.updateInventoryQuantity(
          inventoryId,
          body.quantity
        )
    );

    return NextResponse.json({ inventory });
  } catch (error) {
    return jsonError(error);
  }
}
