import { NextRequest, NextResponse } from "next/server";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import type { UpdateLeadHopInput } from "@/features/leads/domain";
import { LeadHopError } from "@/features/leads/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

const parseIds = async (context: {
  params: Promise<{ leadId: string; agentId: string }>;
}): Promise<{ leadId: number; agentId: number }> => {
  const { leadId: leadIdParam, agentId: agentIdParam } = await context.params;
  const leadId = Number(leadIdParam);
  const agentId = Number(agentIdParam);
  if (
    !leadId ||
    Number.isNaN(leadId) ||
    !agentId ||
    Number.isNaN(agentId)
  ) {
    throw new LeadHopError(
      "Valid leadId and agentId are required",
      "LEAD_HOP_INVALID_ID"
    );
  }
  return { leadId, agentId };
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ leadId: string; agentId: string }> }
) {
  try {
    await requireDashboardActor();
    const { leadId, agentId } = await parseIds(context);
    const hop = await leadHopApplicationService.getLeadHop(leadId, agentId);
    return NextResponse.json(hop);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ leadId: string; agentId: string }> }
) {
  try {
    await requireDashboardActor();
    const { leadId, agentId } = await parseIds(context);
    const body = (await req.json()) as UpdateLeadHopInput;
    const hop = await leadHopApplicationService.updateLeadHop(
      leadId,
      agentId,
      body
    );
    return NextResponse.json(hop);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ leadId: string; agentId: string }> }
) {
  try {
    await requireDashboardActor();
    const { leadId, agentId } = await parseIds(context);
    await leadHopApplicationService.deleteLeadHop(leadId, agentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
