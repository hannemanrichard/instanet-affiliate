import { NextResponse } from "next/server";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { getProductPageLibraryAssetsSafe } from "@/features/products/data/productPageAssetService";
import { jsonError } from "@/shared/server/jsonError";

/** JSON list of product_page_assets (library only) for Marketplace publish. */
export async function GET(
  _req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const page = await productApplicationService.getProductPageBySlug(slug);

    if (!page) {
      return NextResponse.json(
        { error: "Product page not found" },
        { status: 404 }
      );
    }

    const assets = await getProductPageLibraryAssetsSafe(page.page.id);
    const images = assets.filter((asset) => asset.media_type === "image");

    return NextResponse.json({
      product_page_id: page.page.id,
      slug: page.page.slug,
      assets: images.map((asset) => ({
        id: asset.id,
        url: asset.url,
        media_type: asset.media_type,
        file_name: asset.file_name ?? null,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
