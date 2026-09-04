import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { productApplicationService } from "@/features/products/application/services/productApplicationService";
import { getProductPageLibraryAssetsSafe } from "@/features/products/data/productPageAssetService";
import {
  collectProductPageAssetUrls,
  getAssetFileExtension,
} from "@/features/products/presentation/productPageMedia";
import { jsonError } from "@/shared/server/jsonError";

export async function GET(
  _req: NextRequest,
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

    const libraryAssets = await getProductPageLibraryAssetsSafe(page.page.id);
    const urls = collectProductPageAssetUrls({
      ...page,
      assets: libraryAssets,
    });

    if (urls.length === 0) {
      return NextResponse.json(
        { error: "No assets available for this product page" },
        { status: 404 }
      );
    }

    const zip = new JSZip();
    let addedCount = 0;

    await Promise.all(
      urls.map(async (url, index) => {
        try {
          const response = await fetch(url);
          if (!response.ok) return;

          const contentType = response.headers.get("content-type");
          const extension = getAssetFileExtension(url, contentType);
          const buffer = Buffer.from(await response.arrayBuffer());
          zip.file(
            `asset-${String(index + 1).padStart(2, "0")}.${extension}`,
            buffer
          );
          addedCount += 1;
        } catch {
          // Skip failed asset fetches; zip what we can.
        }
      })
    );

    if (addedCount === 0) {
      return NextResponse.json(
        { error: "Failed to download product assets" },
        { status: 502 }
      );
    }

    const content = await zip.generateAsync({ type: "nodebuffer" });
    const safeSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "-") || "product";

    return new NextResponse(new Uint8Array(content), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeSlug}-assets.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return jsonError(error);
  }
}
