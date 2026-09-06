import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { createProductPageBodySchema } from "@/features/products/domain/validations";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireAuditActorPartnerId } from "@/shared/server/requireAuditActorPartnerId";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseJsonBody } from "@/shared/server/parseRequest";

export async function POST(req: NextRequest) {
  try {
    await requireAdminActor();
    const auditActorId = await requireAuditActorPartnerId();
    const payload = await parseJsonBody(req, createProductPageBodySchema);
    const page = await withAuditActor(auditActorId, () =>
      productApplicationService.createProductPage(payload)
    );
    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
