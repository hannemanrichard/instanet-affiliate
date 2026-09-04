import {
  sanitizePartnerOrderCreate,
  sanitizePartnerOrderUpdate,
} from "../../domain/partnerOrderFields";

describe("partnerOrderFields", () => {
  it("strips status and dc_recent_status from partner creates", () => {
    const sanitized = sanitizePartnerOrderCreate({
      first_name: "Amine",
      phone: "0550123467",
      product_qty: 1,
      product_price: 4000,
      status: "delivered",
      dc_recent_status: "encaisse",
      partner_id: 999,
      tracking_id: "HACK",
      parcel_id: "hack-uuid",
      is_auto_delivered: true,
      return_processed: true,
    });

    expect(sanitized).toEqual({
      first_name: "Amine",
      phone: "0550123467",
      product_qty: 1,
      product_price: 4000,
    });
    expect(sanitized).not.toHaveProperty("status");
    expect(sanitized).not.toHaveProperty("dc_recent_status");
    expect(sanitized).not.toHaveProperty("partner_id");
  });

  it("strips earnings and fulfillment fields from partner updates", () => {
    const sanitized = sanitizePartnerOrderUpdate({
      comment: "Call after 18h",
      phone: "0661234567",
      status: "delivered",
      dc_recent_status: "encaisse",
      yalidine_status: "Livré",
      product_price: 1,
      tracking_id: "TESTSEED-O42-01",
      partner_id: 1,
    });

    expect(sanitized).toEqual({
      comment: "Call after 18h",
      phone: "0661234567",
    });
  });

  it("returns an empty object when only forbidden fields are present", () => {
    expect(
      sanitizePartnerOrderUpdate({
        status: "delivered",
        dc_recent_status: "encaisse",
      })
    ).toEqual({});
  });
});
