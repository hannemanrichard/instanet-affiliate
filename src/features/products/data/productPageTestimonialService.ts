import { supabaseServer as supabase } from "@/infrastructure/supabase/server";
import type { Database } from "@/infrastructure/supabase/types";
import { DatabaseWrapper } from "@/shared/utils/databaseWrapper";
import { withPerformanceTracking } from "@/shared/utils/performanceMonitor";
import type { ProductPageTestimonialEntity } from "../domain";
import type { ProductPageTestimonialRepository } from "../domain/repositories";

type Tables = Database["public"]["Tables"];
type ProductPageTestimonialRow = Tables["product_page_testimonials"]["Row"];
type ProductPageTestimonialInsert = Tables["product_page_testimonials"]["Insert"];

export class SupabaseProductPageTestimonialService
    implements ProductPageTestimonialRepository {
    private readonly tableName = "product_page_testimonials";

    async getByPageId(pageId: number): Promise<ProductPageTestimonialEntity[]> {
        return withPerformanceTracking(
            "ProductPageTestimonialService",
            "getByPageId",
            async () => {
                const rows = await DatabaseWrapper.executeQuery(
                    async () => {
                        const { data, error } = await supabase
                            .from(this.tableName)
                            .select("*")
                            .eq("product_page_id", pageId)
                            .order("id", { ascending: true });

                        if (error) throw error;
                        return { data, error };
                    },
                    {
                        operation: "getByPageId",
                        table: this.tableName,
                        metadata: { pageId },
                    }
                );

                return rows.map(this.mapRowToEntity);
            }
        );
    }

    async replaceForPage(
        pageId: number,
        urls: string[]
    ): Promise<ProductPageTestimonialEntity[]> {
        return withPerformanceTracking(
            "ProductPageTestimonialService",
            "replaceForPage",
            async () => {
                await DatabaseWrapper.executeMutation(
                    async () => {
                        const { error } = await supabase
                            .from(this.tableName)
                            .delete()
                            .eq("product_page_id", pageId);

                        if (error) throw error;
                        return { data: { pageId }, error };
                    },
                    {
                        operation: "deleteExistingTestimonials",
                        table: this.tableName,
                        metadata: { pageId },
                        auditLog: {
                            enabled: true,
                            action: "DELETE",
                            recordId: pageId,
                        },
                    }
                );

                if (!urls.length) {
                    return [];
                }

                const payload: ProductPageTestimonialInsert[] = urls.map((url) => ({
                    product_page_id: pageId,
                    url,
                }));

                const rows = await DatabaseWrapper.executeMutation(
                    async () => {
                        const { data, error } = await supabase
                            .from(this.tableName)
                            .insert(payload)
                            .select();

                        if (error) throw error;
                        return { data, error };
                    },
                    {
                        operation: "insertTestimonials",
                        table: this.tableName,
                        metadata: { pageId, count: urls.length },
                        auditLog: {
                            enabled: true,
                            action: "INSERT",
                            recordId: pageId,
                            newValues: { urls },
                        },
                    }
                );

                return rows.map(this.mapRowToEntity);
            }
        );
    }

    async deleteByPageId(pageId: number): Promise<void> {
        return withPerformanceTracking(
            "ProductPageTestimonialService",
            "deleteByPageId",
            async () => {
                await DatabaseWrapper.executeMutation(
                    async () => {
                        const { error } = await supabase
                            .from(this.tableName)
                            .delete()
                            .eq("product_page_id", pageId);

                        if (error) throw error;
                        return { data: { pageId }, error };
                    },
                    {
                        operation: "deleteByPageId",
                        table: this.tableName,
                        metadata: { pageId },
                        auditLog: {
                            enabled: true,
                            action: "DELETE",
                            recordId: pageId,
                        },
                    }
                );
            }
        );
    }

    private mapRowToEntity = (
        row: ProductPageTestimonialRow
    ): ProductPageTestimonialEntity => ({
        id: row.id,
        product_page_id: row.product_page_id,
        url: row.url,
    });
}

