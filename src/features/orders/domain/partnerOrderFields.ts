import type { CreateOrderInput, UpdateOrderInput } from "./repositories";

/**
 * Fields partners may send when creating an order.
 * System-owned / earnings-affecting fields are intentionally excluded.
 */
const PARTNER_CREATE_KEYS = [
  "first_name",
  "last_name",
  "phone",
  "phone2",
  "address",
  "commune",
  "wilaya",
  "channel",
  "comment",
  "objective",
  "product",
  "product_color",
  "product_size",
  "product_price",
  "product_qty",
  "shipping_price",
  "delivery_fees",
  "delivery_notes",
  "is_free_shipping",
  "is_stopdesk",
  "stopdesk",
  "is_exchange_required",
  "is_exchange",
  "has_exchange",
  "has_defect",
  "is_wholesale",
] as const satisfies readonly (keyof CreateOrderInput)[];

/**
 * Fields partners may update after create.
 * Excludes status, delivery-company statuses, tracking, and product_price
 * (price/commission are locked at create time).
 */
const PARTNER_UPDATE_KEYS = [
  "first_name",
  "last_name",
  "phone",
  "phone2",
  "address",
  "commune",
  "wilaya",
  "channel",
  "comment",
  "objective",
  "product",
  "product_color",
  "product_size",
  "product_qty",
  "shipping_price",
  "delivery_fees",
  "delivery_notes",
  "is_free_shipping",
  "is_stopdesk",
  "stopdesk",
  "is_exchange_required",
  "is_exchange",
  "has_exchange",
  "has_defect",
  "is_wholesale",
] as const satisfies readonly (keyof UpdateOrderInput)[];

/** Earnings / fulfillment fields partners must never set via the affiliate API. */
export const PARTNER_FORBIDDEN_ORDER_KEYS = [
  "status",
  "dc_recent_status",
  "yalidine_status",
  "partner_id",
  "agent_id",
  "tracker_id",
  "tracking_id",
  "parcel_id",
  "delivery_company",
  "is_auto_delivered",
  "return_processed",
  "product_price",
  "created_at",
  "modified_at",
] as const;

type PartnerCreateKey = (typeof PARTNER_CREATE_KEYS)[number];
type PartnerUpdateKey = (typeof PARTNER_UPDATE_KEYS)[number];

const pickDefined = <T extends Record<string, unknown>, K extends keyof T>(
  source: T,
  keys: readonly K[]
): Partial<Pick<T, K>> => {
  const result: Partial<Pick<T, K>> = {};
  for (const key of keys) {
    if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }
  return result;
};

/**
 * Keeps only partner-writable create fields.
 * Callers must still set partner_id and server defaults.
 */
export const sanitizePartnerOrderCreate = (
  input: Partial<CreateOrderInput>
): Partial<CreateOrderInput> =>
  pickDefined(
    input as Record<string, unknown>,
    PARTNER_CREATE_KEYS as unknown as PartnerCreateKey[]
  ) as Partial<CreateOrderInput>;

/**
 * Keeps only partner-writable update fields.
 * Strips status, dc_recent_status, and other privileged columns.
 */
export const sanitizePartnerOrderUpdate = (
  input: UpdateOrderInput
): UpdateOrderInput =>
  pickDefined(
    input as Record<string, unknown>,
    PARTNER_UPDATE_KEYS as unknown as PartnerUpdateKey[]
  ) as UpdateOrderInput;

export const partnerOrderUpdateHasWritableFields = (
  input: UpdateOrderInput
): boolean => Object.keys(sanitizePartnerOrderUpdate(input)).length > 0;
