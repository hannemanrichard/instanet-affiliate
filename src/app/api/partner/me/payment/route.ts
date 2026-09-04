import { NextRequest, NextResponse } from "next/server";
import { requireCurrentPartner } from "@/shared/server/requireCurrentPartner";
import { jsonError } from "@/shared/server/jsonError";
import { partnerApplicationService } from "@/features/partners/application/services/partnerApplicationService";
import { updatePartnerPaymentBodySchema } from "@/features/partners/domain/validations";
import { parseJsonBody } from "@/shared/server/parseRequest";

export async function PATCH(request: NextRequest) {
  try {
    const partner = await requireCurrentPartner();
    const body = await parseJsonBody(request, updatePartnerPaymentBodySchema);

    const updated = await partnerApplicationService.updatePayment(partner.id, {
      baridimob_rib: body.baridimob_rib,
      redotpay_account: body.redotpay_account,
      usdt_address: body.usdt_address,
    });

    return NextResponse.json({ partner: updated });
  } catch (error) {
    return jsonError(error);
  }
}
