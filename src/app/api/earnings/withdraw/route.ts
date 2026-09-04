import { NextRequest, NextResponse } from "next/server";
import { earningsApplicationService } from "@/features/earnings/application/services/earningsApplicationService";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";

export async function POST(req: NextRequest) {
  try {
    const partner = await requireCurrentPartner();
    const body = (await req.json()) as { amount?: number };
    const amount = Number(body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const withdraw = await earningsApplicationService.requestWithdraw({
      partner_id: partner.id,
      amount,
    });

    return NextResponse.json(withdraw, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
