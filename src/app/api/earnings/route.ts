import { NextResponse } from "next/server";
import { earningsApplicationService } from "@/features/earnings/application/services/earningsApplicationService";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";

export async function GET() {
  try {
    const partner = await requireCurrentPartner();
    const summary = await earningsApplicationService.getEarningsSummary(
      partner.id
    );
    return NextResponse.json(summary);
  } catch (error) {
    return jsonError(error);
  }
}
