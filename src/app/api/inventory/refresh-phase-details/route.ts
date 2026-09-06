import { NextResponse } from "next/server";
import { inventoryApplicationService } from "@/features/inventory/application/services/inventoryApplicationService";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireAuditActorPartnerId } from "@/shared/server/requireAuditActorPartnerId";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function POST() {
  try {
    await requireAdminActor();
    const auditActorId = await requireAuditActorPartnerId();
    await withAuditActor(auditActorId, () =>
      inventoryApplicationService.refreshPhaseDetailsView()
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
