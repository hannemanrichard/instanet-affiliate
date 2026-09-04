import type {
  CreateDeliveryParcelInput,
  CreatedDeliveryParcel,
} from "./entities";

export interface DeliveryParcelGateway {
  createParcel(input: CreateDeliveryParcelInput): Promise<CreatedDeliveryParcel>;
}
