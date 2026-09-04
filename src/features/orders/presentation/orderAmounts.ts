export interface OrderAmountLineInput {
  qty: number;
  /** Product retail price for the line, null/undefined when product unresolved */
  unitPrice?: number | null;
  /** Product retail commission for the line, null/undefined when unresolved */
  unitCommission?: number | null;
}

export interface OrderAmounts {
  totalQty: number;
  /** Sum of line unitPrice × qty for priced lines (before discount) */
  subtotal: number;
  /** Total discount applied across all items */
  totalDiscount: number;
  /** Sum of line unitCommission × qty — full base commission */
  baseCommission: number;
  /** Effective commission after discount: baseCommission − totalDiscount */
  commission: number;
  /** Customer-facing total after discount: subtotal − totalDiscount */
  discountedSubtotal: number;
  /** Maximum per-unit discount the affiliate can apply (min commission across priced lines, 0 when no priced lines) */
  maxDiscount: number;
  /** True when at least one line resolved to a product price */
  hasPricedLines: boolean;
}

const toSafeQty = (qty: number): number =>
  Number.isFinite(qty) && qty > 0 ? qty : 0;

export const computeOrderAmounts = (
  lines: OrderAmountLineInput[],
  /** Per-unit discount (same unit as unitCommission) */
  discount = 0
): OrderAmounts => {
  let subtotal = 0;
  let baseCommission = 0;
  let totalQty = 0;
  let hasPricedLines = false;
  let minCommission = Infinity;

  for (const line of lines) {
    const qty = toSafeQty(line.qty);
    totalQty += qty;

    if (line.unitPrice != null && Number.isFinite(line.unitPrice)) {
      subtotal += line.unitPrice * qty;
      hasPricedLines = true;
    }

    if (line.unitCommission != null && Number.isFinite(line.unitCommission)) {
      baseCommission += line.unitCommission * qty;
      if (line.unitCommission < minCommission) {
        minCommission = line.unitCommission;
      }
    }
  }

  const maxDiscount = hasPricedLines && Number.isFinite(minCommission)
    ? minCommission
    : 0;

  const safeDiscount =
    Number.isFinite(discount) && discount > 0
      ? Math.min(discount, maxDiscount)
      : 0;

  const totalDiscount = safeDiscount * totalQty;
  const commission = baseCommission - totalDiscount;
  const discountedSubtotal = subtotal - totalDiscount;

  return {
    totalQty,
    subtotal,
    totalDiscount,
    baseCommission,
    commission,
    discountedSubtotal,
    maxDiscount,
    hasPricedLines,
  };
};
