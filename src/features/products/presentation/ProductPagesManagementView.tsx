'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { getPublicProductPageUrl } from "@/shared/config/productPageUrl";
import { ProductPageList } from "./ProductPageList";

export const ProductPagesManagementView = () => {
  const [search, setSearch] = useState("");
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button onClick={() => router.push("/dashboard/product-pages/new")}>
          New page
        </Button>
      </div>
      <ProductPageList
        searchTerm={search}
        onSearchChange={setSearch}
        onPreview={(page) =>
          window.open(getPublicProductPageUrl(page.slug), "_blank")
        }
        onEdit={(page) =>
          router.push(`/dashboard/product-pages/edit/${page.slug}`)
        }
      />
    </div>
  );
};

