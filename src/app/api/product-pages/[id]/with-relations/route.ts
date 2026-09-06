import { NextRequest, NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { updateProductPageWithRelationsBodySchema } from "@/features/products/domain/validations";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { requireAuditActorPartnerId } from "@/shared/server/requireAuditActorPartnerId";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import {
  parseJsonBody,
  parsePositiveIntParam,
} from "@/shared/server/parseRequest";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminActor();
    const auditActorId = await requireAuditActorPartnerId();
    const { id } = await context.params;
    const pageId = parsePositiveIntParam(id, "id");
    const payload = await parseJsonBody(
      req,
      updateProductPageWithRelationsBodySchema
    );
    const page = await withAuditActor(
      auditActorId,
      () =>
        productApplicationService.updateProductPageWithRelations(
          pageId,
          payload
        )
    );
    return NextResponse.json(page);
  } catch (error) {
    return jsonError(error);
  }
}
