import { NextRequest, NextResponse } from "next/server";
import { marketplacePostApplicationService } from "@/features/marketplace-posts/application/services/marketplacePostApplicationService";
import { listMarketplacePostsQuerySchema } from "@/features/marketplace-posts/domain";
import { requireAdminActor } from "@/shared/server/requireDashboardActor";
import { jsonError } from "@/shared/server/jsonError";
import { parseSearchParams } from "@/shared/server/parseRequest";

export async function GET(req: NextRequest) {
  try {
    await requireAdminActor();
    const query = parseSearchParams(
      req.nextUrl.searchParams,
      listMarketplacePostsQuerySchema
    );

    const result = await marketplacePostApplicationService.listPosts(
      { status: query.status },
      { page: query.page, limit: query.limit }
    );

    return NextResponse.json(result);
  } catch (error) {
    return jsonError(error);
  }
}
