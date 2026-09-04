import { NextRequest, NextResponse } from "next/server";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import { updateLeadHopBodySchema } from "@/features/leads/domain";
import { requireLeadAccess } from "@/shared/server/requireLeadAccess";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

const parseIds = async (context: {
  params: Promise<{ leadId: string; agentId: string }>;
}): Promise<{ leadId: number; agentId: number }> => {
  const { leadId: leadIdParam, agentId: agentIdParam } = await context.params;
  return {
    leadId: parsePositiveIntParam(leadIdParam, "leadId"),
    agentId: parsePositiveIntParam(agentIdParam, "agentId"),
  };
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ leadId: string; agentId: string }> }
) {
  try {
    const { leadId, agentId } = await parseIds(context);
    await requireLeadAccess(leadId);
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
    const { leadId, agentId } = await parseIds(context);
    await requireLeadAccess(leadId);
    const body = await parseJsonBody(req, updateLeadHopBodySchema);
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
    const { leadId, agentId } = await parseIds(context);
    await requireLeadAccess(leadId);
    await leadHopApplicationService.deleteLeadHop(leadId, agentId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
