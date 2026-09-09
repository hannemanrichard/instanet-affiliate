import { NextRequest, NextResponse } from "next/server";
import { affiliateClaimApplicationService } from "@/features/claims/application/services/affiliateClaimApplicationService";
import { updateAffiliateClaimStatusBodySchema } from "@/features/claims/domain";
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
    const actor = await requireAdminActor();
    const auditActorId = await requireAuditActorPartnerId();
    const { id: idParam } = await context.params;
    const id = parsePositiveIntParam(idParam, "id");
    const body = await parseJsonBody(req, updateAffiliateClaimStatusBodySchema);

    const claim = await withAuditActor(auditActorId, () =>
      affiliateClaimApplicationService.updateClaimStatus(id, {
        status: body.status,
        admin_notes: body.admin_notes,
        resolved_by: actor.user.id,
      })
    );

    return NextResponse.json({ claim });
  } catch (error) {
    return jsonError(error);
  }
}
