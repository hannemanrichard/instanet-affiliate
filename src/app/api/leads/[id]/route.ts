import { NextRequest, NextResponse } from "next/server";
import {
  leadApplicationService,
  type UpdateLeadPayload,
} from "@/features/leads/application/services/leadApplicationService";
import {
  updateLeadBodySchema,
  type UpdateLeadInput,
} from "@/features/leads/domain";
import { requireLeadAccess } from "@/shared/server/requireLeadAccess";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const leadId = parsePositiveIntParam(idParam, "id");
    const { detail } = await requireLeadAccess(leadId);
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
    const { id: idParam } = await context.params;
    const leadId = parsePositiveIntParam(idParam, "id");
    await requireLeadAccess(leadId);
    const body = await parseJsonBody(req, updateLeadBodySchema);

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
    const { id: idParam } = await context.params;
    const leadId = parsePositiveIntParam(idParam, "id");
    await requireLeadAccess(leadId);
    await leadApplicationService.deleteLead(leadId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
