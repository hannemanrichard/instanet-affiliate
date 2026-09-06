import { NextRequest, NextResponse } from "next/server";
import { earningsApplicationService } from "@/features/earnings/application/services/earningsApplicationService";
import { withdrawBodySchema } from "@/features/earnings/domain/validations";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseJsonBody } from "@/shared/server/parseRequest";

export async function POST(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    if (actor.role !== "partner") {
      return NextResponse.json(
        { error: "Admins cannot request affiliate withdrawals" },
        { status: 403 }
      );
    }
    const body = await parseJsonBody(req, withdrawBodySchema);

    const withdraw = await withAuditActor(actor.partner.id, () =>
      earningsApplicationService.requestWithdraw({
        partner_id: actor.partner.id,
        amount: body.amount,
      })
    );

    return NextResponse.json(withdraw, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
