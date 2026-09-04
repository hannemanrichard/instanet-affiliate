import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import type {
  ProductPageAssetEntity,
  ProductPageAssetMediaType,
} from "../domain";

type ProductPageAssetRow = Database["public"]["Tables"]["product_page_assets"]["Row"];

const mapAssetRow = (row: ProductPageAssetRow): ProductPageAssetEntity => ({
  id: row.id,
  product_page_id: row.product_page_id,
  url: row.url,
  media_type: (row.media_type === "video"
    ? "video"
    : "image") as ProductPageAssetMediaType,
  file_name: row.file_name,
});

/**
 * Loads library assets when the table exists.
 * Returns [] if the migration has not been applied yet (or on any query error).
 */
export const getProductPageLibraryAssetsSafe = async (
  pageId: number
): Promise<ProductPageAssetEntity[]> => {
  try {
    const { data, error } = await supabase
      .from("product_page_assets")
      .select("*")
      .eq("product_page_id", pageId)
      .order("id", { ascending: true });

    if (error || !data) return [];
    return data.map(mapAssetRow);
  } catch {
    return [];
  }
};
