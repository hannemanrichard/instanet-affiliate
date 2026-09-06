import { NextResponse } from "next/server";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireLeadAccess } from "@/shared/server/requireLeadAccess";
import { jsonError } from "@/shared/server/jsonError";
import { parsePositiveIntParam } from "@/shared/server/parseRequest";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const leadId = parsePositiveIntParam(idParam, "id");
    const { actor } = await requireLeadAccess(leadId);
    await withAuditActor(
      actor.role === "partner" ? actor.partner.id : undefined,
      () => leadHopApplicationService.deleteLeadHopsByLeadId(leadId)
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
