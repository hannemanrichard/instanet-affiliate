import { NextRequest, NextResponse } from "next/server";
import {
  leadApplicationService,
  type CreateLeadPayload,
} from "@/features/leads/application/services/leadApplicationService";
import {
  createLeadBodySchema,
  listLeadsQuerySchema,
  type CreateLeadInput,
} from "@/features/leads/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parseSearchParams,
} from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      listLeadsQuerySchema
    );
    const partnerId =
      actor.role === "partner" ? actor.partner.id : undefined;

    const result = await leadApplicationService.getPaginatedLeads(
      {
        status: query.status,
        search: query.search,
        partnerId,
      },
      { page: query.page, limit: query.limit }
    );
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    const body = await parseJsonBody(req, createLeadBodySchema);

    const leadFields = { ...body.lead } as Partial<CreateLeadInput>;

    // Partners: partner_id always from session. Admins may set it explicitly.
    if (actor.role === "partner") {
      delete leadFields.partner_id;
      leadFields.partner_id = actor.partner.id;
    }

    const payload: CreateLeadPayload = {
      lead: leadFields as CreateLeadInput,
      items: body.items,
    };

    const result = await leadApplicationService.createLead(payload);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
