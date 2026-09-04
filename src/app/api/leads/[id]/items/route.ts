import { NextRequest, NextResponse } from "next/server";
import { leadApplicationService } from "@/features/leads/application/services/leadApplicationService";
import { replaceLeadItemsBodySchema } from "@/features/leads/domain";
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
    await requireLeadAccess(leadId);
    const items = await leadApplicationService.getLeadItems(leadId);
    return NextResponse.json(items);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await context.params;
    const leadId = parsePositiveIntParam(idParam, "id");
    await requireLeadAccess(leadId);
    const body = await parseJsonBody(req, replaceLeadItemsBodySchema);

    const items = await leadApplicationService.replaceLeadItems(
      leadId,
      body.items
    );
    return NextResponse.json(items);
  } catch (error) {
    return jsonError(error);
  }
}
