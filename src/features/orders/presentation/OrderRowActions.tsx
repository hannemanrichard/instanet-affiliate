"use client";

import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { AppIcon } from "@/shared/components/layout/AppIcon";
import { uiIcons } from "@/shared/components/layout/navIcons";
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
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useDeleteOrder } from "../application";
import type { OrderEntity } from "../domain";
import { canDeleteOrder } from "../domain";
import { OrderDetailsDialog } from "./OrderDetailsDialog";

type OrderRowActionsProps = {
  order: OrderEntity;
};

export const OrderRowActions = ({ order }: OrderRowActionsProps) => {
  const t = useTranslations("affiliateDashboard.orders");
  const deleteOrder = useDeleteOrder();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const showDelete = canDeleteOrder(order.status);

  const handleOpenDetails = () => {
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = () => {
    if (!canDeleteOrder(order.status)) return;
    setIsDeleteOpen(true);
  };

  const handleActionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    onActivate: () => void
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  };

  const handleConfirmDelete = async (
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    if (!canDeleteOrder(order.status)) return;

    try {
      await deleteOrder.mutateAsync(order.id);
      setIsDeleteOpen(false);
    } catch {
      // Toast is handled by useDeleteOrder
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center justify-end gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={handleOpenDetails}
              onKeyDown={(event) =>
                handleActionKeyDown(event, handleOpenDetails)
              }
              aria-label={t("detailsAria")}
            >
              <AppIcon icon={uiIcons.view} size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="font-medium">
            {t("detailsAria")}
          </TooltipContent>
        </Tooltip>

        {showDelete ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={handleOpenDelete}
                onKeyDown={(event) =>
                  handleActionKeyDown(event, handleOpenDelete)
                }
                aria-label={t("deleteAria")}
                disabled={deleteOrder.isPending}
              >
                <AppIcon icon={uiIcons.delete} size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              {t("deleteAria")}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <OrderDetailsDialog
        orderId={order.id}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteOrder.isPending}>
              {t("delete.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteOrder.isPending}
            >
              {deleteOrder.isPending
                ? t("delete.deleting")
                : t("delete.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
};
