import "server-only";

import { randomUUID } from "crypto";
import { zrFetch, ZrHttpError } from "@/infrastructure/zr";
import type {
  CreateDeliveryParcelInput,
  CreatedDeliveryParcel,
} from "../domain/entities";
import { DeliveryError } from "../domain/errors";
import type { DeliveryParcelGateway } from "../domain/repositories";

type ZrCreateParcelResponse = { id?: string };
type ZrGetParcelResponse = {
  id?: string;
  trackingNumber?: string;
};

/**
 * Normalize Algerian phone numbers to E.164 (+213...) expected by ZR.
 */
export const toZrPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    throw new DeliveryError("Phone number is required", "DELIVERY_PHONE_REQUIRED");
  }
  if (digits.startsWith("213") && digits.length >= 12) {
    return `+${digits}`;
  }
  if (digits.startsWith("0") && digits.length >= 9) {
    return `+213${digits.slice(1)}`;
  }
  if (digits.length === 9) {
    return `+213${digits}`;
  }
  return digits.startsWith("+") ? phone.trim() : `+${digits}`;
};

const buildDescription = (description: string): string => {
  const trimmed = description.trim();
  if (trimmed.length >= 2) return trimmed.slice(0, 250);
  return "Parcel description";
};

/** Matches examples/delivery-api.js generateTrack() */
export const buildExternalId = (orderId: number): string => {
  const timestamp = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 6);
  return `${timestamp}order_${orderId}_${rand}`;
};

export class ZrDeliveryParcelGateway implements DeliveryParcelGateway {
  async createParcel(
    input: CreateDeliveryParcelInput
  ): Promise<CreatedDeliveryParcel> {
    if (!input.cityTerritoryId || !input.districtTerritoryId) {
      throw new DeliveryError(
        "Wilaya and commune territory ids are required for ZR",
        "DELIVERY_TERRITORY_REQUIRED"
      );
    }

    if (input.deliveryType === "pickup-point" && !input.hubId) {
      throw new DeliveryError(
        "Hub id is required for stopdesk delivery",
        "DELIVERY_HUB_REQUIRED"
      );
    }

    if (!input.products.length) {
      throw new DeliveryError(
        "At least one product is required",
        "DELIVERY_PRODUCTS_REQUIRED"
      );
    }

    const payload: Record<string, unknown> = {
      customer: {
        customerId: randomUUID(),
        name: input.customerName.trim().slice(0, 100),
        phone: {
          number1: toZrPhoneNumber(input.phone),
          ...(input.phone2
            ? { number2: toZrPhoneNumber(input.phone2) }
            : {}),
        },
      },
      deliveryAddress: {
        cityTerritoryId: input.cityTerritoryId,
        districtTerritoryId: input.districtTerritoryId,
        ...(input.address?.trim()
          ? { Street: input.address.trim() }
          : {}),
      },
      orderedProducts: input.products.map((product) => ({
        productName: product.name.slice(0, 200),
        unitPrice: product.unitPrice,
        quantity: product.quantity,
        stockType: "none",
        ...(product.sku ? { productSku: product.sku } : {}),
      })),
      deliveryType: input.deliveryType,
      description: buildDescription(input.description),
      amount: input.amount,
      // Match examples/delivery-api.js /zr/create externalId shape
      externalId: buildExternalId(input.orderId),
      weight: {
        weight: 1,
      },
    };

    if (input.hubId) {
      payload.hubId = input.hubId;
    }

    try {
      // Create uses /api/v1/parcels (see examples/delivery-api.js)
      const created = await zrFetch<ZrCreateParcelResponse>("/parcels", {
        method: "POST",
        body: payload,
      });

      const parcelId = created?.id;
      if (!parcelId) {
        throw new DeliveryError(
          "ZR Express did not return a parcel id",
          "DELIVERY_PARCEL_ID_MISSING"
        );
      }

      let trackingNumber: string | undefined;
      try {
        // Hydrate uses /api/v1.0/parcels/{id} in the working example
        const details = await zrFetch<ZrGetParcelResponse>(
          `/parcels/${parcelId}`,
          { method: "GET", apiVersion: "1.0" }
        );
        trackingNumber = details.trackingNumber ?? undefined;
      } catch {
        // Parcel was created; tracking can be synced later via webhook/poll
        trackingNumber = undefined;
      }

      return {
        parcelId,
        trackingNumber,
        provider: "zr",
      };
    } catch (error) {
      if (error instanceof DeliveryError) throw error;
      if (error instanceof ZrHttpError) {
        console.error("[ZR] parcel create failed", {
          status: error.status,
          body: error.body,
        });
        throw new DeliveryError(error.message, "DELIVERY_ZR_HTTP_ERROR", error);
      }

      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to create ZR parcel";

      console.error("[ZR] parcel create failed", error);
      throw new DeliveryError(message, "DELIVERY_CREATE_FAILED", error);
    }
  }
}

export const zrDeliveryParcelGateway = new ZrDeliveryParcelGateway();
