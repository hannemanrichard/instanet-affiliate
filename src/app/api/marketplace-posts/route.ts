import { NextRequest, NextResponse } from "next/server";
import { marketplacePostApplicationService } from "@/features/marketplace-posts/application/services/marketplacePostApplicationService";
import { createMarketplacePostBodySchema } from "@/features/marketplace-posts/domain";
import { createMarketplaceAttemptToken } from "@/features/marketplace-posts/server/attemptToken";
import { withAuditActor } from "@/shared/server/auditActorContext";
import { jsonError } from "@/shared/server/jsonError";
import { parseJsonBody } from "@/shared/server/parseRequest";
import { requireDashboardActor } from "@/shared/server/requireDashboardActor";
import { UnauthorizedError } from "@/shared/server/requireCurrentPartner";

const getAppBaseUrl = (req: NextRequest) => {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return req.nextUrl.origin;
};

export async function POST(req: NextRequest) {
  try {
    const actor = await requireDashboardActor();
    if (actor.role !== "partner") {
      throw new UnauthorizedError("Only affiliates can track marketplace posts");
    }

    const body = await parseJsonBody(req, createMarketplacePostBodySchema);
    const partnerEmail =
      actor.partner.email?.trim() ||
      actor.user.primaryEmailAddress?.emailAddress ||
      actor.user.emailAddresses[0]?.emailAddress;

    if (!partnerEmail) {
      throw new UnauthorizedError("Affiliate email is required");
    }

    const post = await withAuditActor(actor.partner.id, () =>
      marketplacePostApplicationService.createDraftOpened({
        partner_id: actor.partner.id,
        partner_email: partnerEmail,
        product_page_id: body.product_page_id,
        product_title: body.product_title,
        product_price: body.product_price,
        currency: body.currency,
        metadata: body.slug ? { slug: body.slug } : {},
      })
    );

    const attemptToken = createMarketplaceAttemptToken({
      postId: post.id,
      partnerId: actor.partner.id,
    });

    return NextResponse.json(
      {
        post,
        attempt_id: post.id,
        attempt_token: attemptToken,
        api_base_url: getAppBaseUrl(req),
      },
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}
