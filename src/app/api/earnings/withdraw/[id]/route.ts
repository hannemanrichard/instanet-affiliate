import { NextRequest, NextResponse } from "next/server";
import { earningsApplicationService } from "@/features/earnings/application/services/earningsApplicationService";
import { updateWithdrawStatusBodySchema } from "@/features/earnings/domain/validations";
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
    const withdrawId = parsePositiveIntParam(idParam, "id");
    const body = await parseJsonBody(req, updateWithdrawStatusBodySchema);

    const withdraw = await withAuditActor(auditActorId, () =>
      earningsApplicationService.updateWithdrawStatus({
        id: withdrawId,
        status: body.status,
      })
    );

    return NextResponse.json(withdraw);
  } catch (error) {
    return jsonError(error);
  }
}
