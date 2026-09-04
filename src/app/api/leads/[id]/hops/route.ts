import { NextResponse } from "next/server";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import { LeadError } from "@/features/leads/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const { id: idParam } = await context.params;
    const leadId = Number(idParam);
    if (!leadId || Number.isNaN(leadId)) {
      throw new LeadError("Valid lead id is required", "LEAD_INVALID_ID");
    }

    await leadHopApplicationService.deleteLeadHopsByLeadId(leadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
