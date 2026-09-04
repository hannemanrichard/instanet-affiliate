"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProductEditor } from "@/features/products/presentation/ProductEditor";
import { RoleGuard } from "@/shared/components/auth/RoleGuard";

const ProductEditPage = () => {
  const params = useParams<{ id?: string }>();
  const router = useRouter();

  const productId = useMemo(() => {
    const raw = Array.isArray(params?.id) ? params?.id[0] : params?.id;
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [params?.id]);

  const invalidId = !Number.isFinite(productId) || productId <= 0;

  useEffect(() => {
    if (invalidId) {
      router.replace("/dashboard/products");
    }
  }, [invalidId, router]);

  if (invalidId) {
    return null;
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <ProductEditor productId={productId} />
    </RoleGuard>
  );
};

export default ProductEditPage;
