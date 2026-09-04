export type DeliveryType = "home" | "pickup-point";

export type CreateDeliveryParcelProductInput = {
  name: string;
  unitPrice: number;
  quantity: number;
  sku?: string;
};

export type CreateDeliveryParcelInput = {
  /** Local order id used as ZR externalId */
  orderId: number;
  customerName: string;
  phone: string;
  phone2?: string;
  address?: string;
  /** ZR wilaya territory UUID */
  cityTerritoryId: string;
  /** ZR commune territory UUID */
  districtTerritoryId: string;
  /** ZR hub UUID — required for pickup-point */
  hubId?: string;
  deliveryType: DeliveryType;
  products: CreateDeliveryParcelProductInput[];
  /** COD amount including delivery fees */
  amount: number;
  description: string;
};

export type CreatedDeliveryParcel = {
  parcelId: string;
  trackingNumber?: string;
  provider: "zr";
};
