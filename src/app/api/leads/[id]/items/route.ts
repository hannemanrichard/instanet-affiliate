import { NextRequest, NextResponse } from "next/server";
import { leadApplicationService } from "@/features/leads/application/services/leadApplicationService";
import type { UpdateLeadItemInput } from "@/features/leads/domain";
import { LeadError } from "@/features/leads/domain";
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
    await requireDashboardActor();
    const leadId = await parseLeadId(context);
    const body = (await req.json()) as { items?: UpdateLeadItemInput[] };

    if (!Array.isArray(body.items)) {
      throw new LeadError(
        "Lead items array is required",
        "LEAD_ITEMS_REQUIRED"
      );
    }

    const items = await leadApplicationService.replaceLeadItems(
      leadId,
      body.items
    );
    return NextResponse.json(items);
  } catch (error) {
    return jsonError(error);
  }
}
