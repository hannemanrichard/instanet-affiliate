import { NextRequest, NextResponse } from "next/server";
import {
  leadApplicationService,
  type UpdateLeadPayload,
} from "@/features/leads/application/services/leadApplicationService";
import { LeadError } from "@/features/leads/domain";
import type { UpdateLeadInput } from "@/features/leads/domain";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";

const parseLeadId = async (
  context: { params: Promise<{ id: string }> }
): Promise<number> => {
  const { id: idParam } = await context.params;
  const leadId = Number(idParam);
  if (!leadId || Number.isNaN(leadId)) {
    throw new LeadError("Valid lead id is required", "LEAD_INVALID_ID");
  }
  return leadId;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const leadId = await parseLeadId(context);
    const detail = await leadApplicationService.getLeadDetail(leadId);
    return NextResponse.json(detail);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const leadId = await parseLeadId(context);
    const body = (await req.json()) as UpdateLeadPayload;

    if (!body.lead && !body.items) {
      throw new LeadError(
        "Lead update payload is required",
        "LEAD_UPDATE_REQUIRED"
      );
    }

    const leadFields = body.lead
      ? ({ ...body.lead } as Partial<UpdateLeadInput>)
      : undefined;
    if (leadFields) {
      delete leadFields.partner_id;
    }

    const payload: UpdateLeadPayload = {
      lead: leadFields as UpdateLeadInput | undefined,
      items: body.items,
    };

    const result = await leadApplicationService.updateLead(leadId, payload);
    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireDashboardActor();
    const leadId = await parseLeadId(context);
    await leadApplicationService.deleteLead(leadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
