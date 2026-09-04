import { NextRequest, NextResponse } from "next/server";
import { leadHopApplicationService } from "@/features/leads/application/services/leadHopApplicationService";
import {
  createLeadHopBodySchema,
  leadHopsQuerySchema,
} from "@/features/leads/domain";
import {
  requireAdminActor,
  requireDashboardActor,
} from "@/shared/server/requireDashboardActor";
import { requireLeadAccess } from "@/shared/server/requireLeadAccess";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parseSearchParams,
} from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      leadHopsQuerySchema
    );

    if (query.leadId != null && query.agentId != null) {
      await requireLeadAccess(query.leadId);
      const hop = await leadHopApplicationService.getLeadHop(
        query.leadId,
        query.agentId
      );
      return NextResponse.json(hop);
    }

    if (query.leadId != null) {
      await requireLeadAccess(query.leadId);
      const hops = await leadHopApplicationService.getLeadHopsByLeadId(
        query.leadId
      );
      return NextResponse.json(hops);
    }

    // Unscoped hop lists are admin-only (no partner_id on hops).
    await requireAdminActor();

    if (query.agentId != null) {
      const hops = await leadHopApplicationService.getLeadHopsByAgentId(
        query.agentId
      );
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
    const body = await parseJsonBody(req, createLeadHopBodySchema);
    await requireLeadAccess(body.lead_id);

    const hop = await leadHopApplicationService.createLeadHop({
      lead_id: body.lead_id,
      agent_id: body.agent_id,
    });
    return NextResponse.json(hop, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
