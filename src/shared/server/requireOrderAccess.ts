import { orderApplicationService } from "@/features/orders/application/services/orderApplicationService";
import type { OrderWithItems } from "@/features/orders/domain";
import { OrderError } from "@/features/orders/domain";
import {
  requireDashboardActor,
  type DashboardActor,
} from "@/shared/server/requireDashboardActor";

/**
 * Ensures the caller may access the order.
 * Partners only see their own; admins see all.
 */
export const requireOrderAccess = async (
  orderId: number
): Promise<{ actor: DashboardActor; detail: OrderWithItems }> => {
  const actor = await requireDashboardActor();
  const detail = await orderApplicationService.getOrderDetail(orderId);

  if (
    actor.role === "partner" &&
    detail.order.partner_id !== actor.partner.id
  ) {
    throw new OrderError("Order not found", "ORDER_NOT_FOUND");
  }

  return { actor, detail };
};
