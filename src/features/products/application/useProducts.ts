import {
  useStandardMutation,
  useStandardQuery,
} from "@/shared/hooks/useReactQuery";
import { apiFetch } from "@/shared/utils/apiFetch";
import { useQueryClient } from "@tanstack/react-query";
import type {
  CreateProductPagePayload,
  UpdateProductPagePayload,
  UpdateProductPayload,
} from "./productPayloads";
import type {
  ProductCatalogEntry,
  ProductEntity,
  ProductInventoryAdjustment,
  ProductInventorySnapshot,
  ProductItemEntity,
  ProductPageEntity,
  ProductPageWithRelations,
} from "../domain";

export type {
  CreateProductPagePayload,
  UpdateProductPagePayload,
  UpdateProductPayload,
} from "./productPayloads";

const catalogKey = ["products", "catalog"];
const adminProductsKey = ["products", "admin"];
const productItemsKey = (productId: number) => [
  "products",
  productId.toString(),
  "items",
];
const productInventoryKey = (productId: number) => [
  "products",
  productId.toString(),
  "inventory",
];
const productPageKey = (slug: string) => ["product-pages", slug];
const productPagesSearchKey = (term: string) => [
  "product-pages",
  "search",
  term,
];
const productPagesRootKey = ["product-pages"];

const buildCatalogQuery = (searchTerm?: string) => {
  const trimmed = searchTerm?.trim() ?? "";
  if (!trimmed) return "/api/products/catalog";
  return `/api/products/catalog?q=${encodeURIComponent(trimmed)}`;
};

const buildProductPageSearchQuery = (term: string) => {
  const trimmed = term.trim();
  if (!trimmed) return "/api/product-pages/search";
  return `/api/product-pages/search?q=${encodeURIComponent(trimmed)}`;
};

export const useProductCatalog = (searchTerm?: string) => {
  const trimmed = searchTerm?.trim() ?? "";
  const enabled = !searchTerm || trimmed.length === 0 || trimmed.length > 1;

  return useStandardQuery(
    searchTerm ? [...catalogKey, "search", trimmed] : catalogKey,
    () => apiFetch<ProductCatalogEntry[]>(buildCatalogQuery(trimmed)),
    {
      enabled,
      staleTime: 2 * 60 * 1000,
    }
  );
};

export const useProductPage = (slug: string) => {
  return useStandardQuery(
    productPageKey(slug),
    () =>
      apiFetch<ProductPageWithRelations | null>(
        `/api/product-pages/by-slug/${encodeURIComponent(slug)}`
      ),
    {
      enabled: Boolean(slug),
      staleTime: 60 * 1000,
    }
  );
};

export const useProduct = (productId: number) => {
  return useStandardQuery(
    ["products", productId.toString()],
    () => apiFetch<ProductEntity | null>(`/api/products/${productId}`),
    {
      enabled: productId > 0,
      staleTime: 60 * 1000,
    }
  );
};

export const useActiveProductPages = () => {
  return useStandardQuery(
    [...productPagesRootKey, "active"],
    () => apiFetch<ProductPageEntity[]>("/api/product-pages/active"),
    {
      staleTime: 2 * 60 * 1000,
    }
  );
};

export const useProductPageSearch = (term: string) => {
  const trimmed = term.trim();
  return useStandardQuery(
    productPagesSearchKey(trimmed),
    () =>
      apiFetch<ProductPageEntity[]>(buildProductPageSearchQuery(trimmed)),
    {
      enabled: trimmed.length === 0 || trimmed.length > 1,
      staleTime: 2 * 60 * 1000,
    }
  );
};

export const useAdminProducts = () => {
  return useStandardQuery(
    adminProductsKey,
    () => apiFetch<ProductEntity[]>("/api/products/admin"),
    {
      staleTime: 60 * 1000,
    }
  );
};

export const useProductItems = (productId: number) => {
  return useStandardQuery(
    productItemsKey(productId),
    () => apiFetch<ProductItemEntity[]>(`/api/products/${productId}/items`),
    {
      enabled: productId > 0,
      staleTime: 60 * 1000,
    }
  );
};

export const useProductInventory = (productId: number) => {
  return useStandardQuery(
    productInventoryKey(productId),
    () =>
      apiFetch<ProductInventorySnapshot>(
        `/api/products/${productId}/inventory`
      ),
    {
      enabled: productId > 0,
      staleTime: 30 * 1000,
    }
  );
};

export const useCreateProductPage = () => {
  const queryClient = useQueryClient();

  return useStandardMutation(
    (payload: CreateProductPagePayload) =>
      apiFetch<ProductPageWithRelations>("/api/product-pages", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    {
      successMessage: "Product page created successfully",
      errorMessage: "Failed to create product page",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: productPagesRootKey });
      },
    }
  );
};

export const useUpdateProductPage = () => {
  const queryClient = useQueryClient();

  return useStandardMutation(
    ({
      pageId,
      payload,
    }: {
      pageId: number;
      payload: Partial<ProductPageEntity>;
    }) =>
      apiFetch<ProductPageEntity>(`/api/product-pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    {
      successMessage: "Product page updated successfully",
      errorMessage: "Failed to update product page",
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: productPagesRootKey });
        queryClient.invalidateQueries({ queryKey: productPageKey(data.slug) });
      },
    }
  );
};

export const useUpdateProductPageWithRelations = () => {
  const queryClient = useQueryClient();

  return useStandardMutation(
    ({
      pageId,
      payload,
    }: {
      pageId: number;
      payload: UpdateProductPagePayload;
    }) =>
      apiFetch<ProductPageWithRelations>(
        `/api/product-pages/${pageId}/with-relations`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      ),
    {
      successMessage: "Product page updated successfully",
      errorMessage: "Failed to update product page",
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: productPagesRootKey });
        queryClient.invalidateQueries({
          queryKey: productPageKey(data.page.slug),
        });
      },
    }
  );
};

export const useDeleteProductPage = () => {
  const queryClient = useQueryClient();

  return useStandardMutation(
    (pageId: number) =>
      apiFetch<{ success: boolean }>(`/api/product-pages/${pageId}`, {
        method: "DELETE",
      }),
    {
      successMessage: "Product page deleted successfully",
      errorMessage: "Failed to delete product page",
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: productPagesRootKey });
      },
    }
  );
};

export const useUpdateProduct = () => {
  return useStandardMutation(
    ({
      productId,
      payload,
    }: {
      productId: number;
      payload: UpdateProductPayload;
    }) =>
      apiFetch<{ success: boolean }>(`/api/products/${productId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    {
      invalidateQueries: [catalogKey, adminProductsKey],
      successMessage: "Product updated successfully",
      errorMessage: "Failed to update product",
    }
  );
};

export const useBulkInventoryUpdate = () => {
  return useStandardMutation(
    ({
      productId,
      adjustments,
    }: {
      productId: number;
      adjustments: ProductInventoryAdjustment[];
    }) =>
      apiFetch<ProductInventorySnapshot>(
        `/api/products/${productId}/inventory/bulk`,
        {
          method: "POST",
          body: JSON.stringify({ adjustments }),
        }
      ),
    {
      invalidateQueries: [catalogKey],
      successMessage: "Inventory updated successfully",
      errorMessage: "Failed to update inventory",
    }
  );
};
