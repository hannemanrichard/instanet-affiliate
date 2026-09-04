'use client';

import { useMemo, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useProductPageSearch, useDeleteProductPage } from "../application";
import type { ProductPageEntity } from "../domain";

interface ProductPageListProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onPreview?: (page: ProductPageEntity) => void;
  onEdit?: (page: ProductPageEntity) => void;
  onDelete?: (page: ProductPageEntity) => void;
}

const extractHeroImage = (heroMedia: ProductPageEntity["hero_media"]) => {
  if (!heroMedia || heroMedia.length === 0) return undefined;
  const [first] = heroMedia;
  if (typeof first === "string") return first;
  if (first && typeof first === "object" && "url" in first) return (first as { url: string }).url;
  return undefined;
};

export const ProductPageList = ({
  searchTerm,
  onSearchChange,
  onPreview,
  onEdit,
  onDelete,
}: ProductPageListProps) => {
  const [internalSearch, setInternalSearch] = useState(searchTerm ?? "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<ProductPageEntity | null>(null);
  const value = searchTerm ?? internalSearch;
  const deleteProductPageMutation = useDeleteProductPage();

  const handleChange = (next: string) => {
    if (onSearchChange) onSearchChange(next);
    else setInternalSearch(next);
  };

  const handleDeleteClick = (page: ProductPageEntity) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!pageToDelete) return;

    deleteProductPageMutation.mutate(pageToDelete.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onDelete?.(pageToDelete);
        setPageToDelete(null);
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPageToDelete(null);
  };

  const pagesQuery = useProductPageSearch(value);
  const isLoading = pagesQuery.isLoading;
  const pages = useMemo(() => pagesQuery.data ?? [], [pagesQuery.data]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search product pages..."
          value={value}
          onChange={(event) => handleChange(event.target.value)}
          className="md:w-80"
        />
        <Badge variant="outline">
          {pages.length} page{pages.length === 1 ? "" : "s"}
        </Badge>
      </div>
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-3">
          {pages.map((page) => {
            const hero = extractHeroImage(page.hero_media);
            return (
              <AccordionItem key={page.id} value={page.slug}>
                <AccordionTrigger>
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-left">
                      {hero ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-md">
                          <Image
                            src={hero}
                            alt={page.headline}
                            fill
                            className="object-cover"
                            sizes="40px"
                            unoptimized
                          />
                        </div>
                      ) : null}
                      <div>
                        <p className="text-sm font-medium">{page.headline}</p>
                        <p className="text-xs text-muted-foreground">{page.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {page.is_affiliate_friendly ? (
                        <Badge variant="secondary">Affiliate</Badge>
                      ) : null}
                      {page.is_freeshipping ? (
                        <Badge variant="secondary">Free shipping</Badge>
                      ) : null}
                      <Badge variant={page.is_active ? "secondary" : "outline"}>
                        {page.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{page.headline}</CardTitle>
                      {page.subheadline ? (
                        <p className="text-sm text-muted-foreground">{page.subheadline}</p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Product ID: <span className="font-mono">{page.product_id}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">Slug: {page.slug}</Badge>
                        <Badge variant="outline">
                          Created: {page.created_at ? new Date(page.created_at).toLocaleDateString() : "—"}
                        </Badge>
                        {page.updated_at ? (
                          <Badge variant="outline">
                            Updated: {new Date(page.updated_at).toLocaleDateString()}
                          </Badge>
                        ) : null}
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => onPreview?.(page)}>
                        Preview
                      </Button>
                      <Button onClick={() => onEdit?.(page)}>Edit</Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteClick(page)}
                        aria-label={`Delete ${page.headline}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
      {!isLoading && pages.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No product pages found for "{value}".
          </CardContent>
        </Card>
      ) : null}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{pageToDelete?.headline}"? This
              action cannot be undone and will permanently delete the product
              page, all its items, and associated images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteProductPageMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProductPageMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

