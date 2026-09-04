import { NextRequest, NextResponse } from "next/server";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import type { CreateLeadHopInput } from "@/features/leads/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(req: NextRequest) {
  try {
    await requireDashboardActor();
    const { searchParams } = req.nextUrl;
    const leadIdParam = searchParams.get("leadId");
    const agentIdParam = searchParams.get("agentId");

    if (leadIdParam && agentIdParam) {
      const leadId = Number(leadIdParam);
      const agentId = Number(agentIdParam);
      const hop = await leadHopApplicationService.getLeadHop(leadId, agentId);
      return NextResponse.json(hop);
    }

    if (leadIdParam) {
      const leadId = Number(leadIdParam);
      const hops = await leadHopApplicationService.getLeadHopsByLeadId(leadId);
      return NextResponse.json(hops);
    }

    if (agentIdParam) {
      const agentId = Number(agentIdParam);
      const hops =
        await leadHopApplicationService.getLeadHopsByAgentId(agentId);
      return NextResponse.json(hops);
    }

    const hops = await leadHopApplicationService.getAllLeadHops();
    return NextResponse.json(hops);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireDashboardActor();
    const body = (await req.json()) as CreateLeadHopInput;

    if (!body.lead_id || !body.agent_id) {
      return NextResponse.json(
        {
          error: "lead_id and agent_id are required",
          code: "LEAD_HOP_REQUIRED",
        },
        { status: 400 }
      );
    }

    const hop = await leadHopApplicationService.createLeadHop({
      lead_id: Number(body.lead_id),
      agent_id: Number(body.agent_id),
    });
    return NextResponse.json(hop, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
