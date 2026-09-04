import { NextRequest, NextResponse } from "next/server";
import {
  leadApplicationService,
  type CreateLeadPayload,
} from "@/features/leads/application/services/leadApplicationService";
import type { CreateLeadInput } from "@/features/leads/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(req: NextRequest) {
  try {
    await requireDashboardActor();
    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status")?.trim() || undefined;
    const search = searchParams.get("search")?.trim() || undefined;

    const leads = await leadApplicationService.getLeads({ status, search });
    return NextResponse.json(leads);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    const body = (await req.json()) as CreateLeadPayload;

    if (!body.lead) {
      return NextResponse.json(
        { error: "Lead payload is required", code: "LEAD_REQUIRED" },
        { status: 400 }
      );
    }

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
