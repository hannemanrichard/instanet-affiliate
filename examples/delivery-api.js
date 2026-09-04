const express = require("express");
const cors = require("cors");
const axios = require("axios");
const https = require("https");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://esgaekqgpyboghjhpwsk.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZ2Fla3FncHlib2doamhwd3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzI3NTEwNDAsImV4cCI6MTk4ODMyNzA0MH0.fVkl55mCYAz2ZfmOpyFxY0bZKfJqvLpcz6cn2F7vHDY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const port = process.env.PORT || 3080;
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

const zr_tokens = {
  secretKey: "JmEeMMPv9CM2MhNtlMadG70hzX4T6Kxp6NifBY14OsO8iR1nHfnQrsxiqAqgQdaf",
  tenantId: "fa0a3f1b-203b-4134-9139-6f3dced7a83c",
  createdAt: "2026-03-30T20:12:50.118Z",
  expireInDays: 365,
};
// zr_tokens = {
//   secretKey: "0ztgciSpEGXAHuTZ1ODDfnDWyovJlhJCBIkGHyPG4HsnF6ptrYTCDlWbOdPnIDwi",
//   tenantId: "ea45e463-e31c-4834-9cb8-ce93f8b4352c",
//   createdAt: "2026-03-05T15:16:05.874Z",
//   expireInDays: 365,
// };

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://ecomeast.vercel.app");
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  // res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS,CONNECT,TRACE",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Content-Type-Options, Accept, X-Requested-With, Origin, Access-Control-Request-Method, Access-Control-Request-Headers",
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Private-Network", true);
  //  Firefox caps this at 24 hours (86400 seconds). Chromium (starting in v76) caps at 2 hours (7200 seconds). The default value is 5 seconds.
  res.setHeader("Access-Control-Max-Age", 7200);

  next();
});

function objectToQueryString(obj) {
  return Object.keys(obj)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]))
    .join("&");
}

const ACCESS_ID =
  "9bwwR9RRZfUCcNtjnu4IrQyy3DULSohTiWg2ydQZMLGxh21DrapIueF3FCk5";

// app.get("/", (req, res) => {
//   res.status(200).json({ message: "Get is not supported" });
// });

/*
 * - Get parcels by tracking id -> /parcels/yal-123456 or /parcel/?tracking=yal1,yal2
 * - Retrieve specific parcels fields -> /parcel/?fields=field1, fiels2
 * - Retrieve
 * - The easiest solution is to pass a request tail parameter in the body of the request, then add it to the link.
 * - in this way, we don't have to recreate a completely new API.
 */

/*
 * ZR Express endpoints
 */
app.get("/zr/getparcels", async (req, res) => {
  try {
    const url = "https://api.zrexpress.app/api/v1.0/parcels/search";

    const resp = await axios.post(
      url,
      {
        pageNumber: 1,
        pageSize: 400,
      },
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    res.status(200).json({ data: resp.data });
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ error: err });
  }
});

// Create a percel
app.post("/zr/create", async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const address = req.body.address;
    const phone = req.body.phone;
    const wilaya = req.body.wilaya;
    const commune = req.body.commune;
    const product = req.body.product;
    const isStopDesk = req.body.isStopDesk;
    const price = req.body.price;
    const quantity = req.body.quantity;
    const agency = req.body.agency;
    const description = req.body.description;
    const externalId = req.body.externalId;

    function generateTrack(trackerId) {
      const timestamp = Date.now().toString(36); // compact
      const rand = Math.random().toString(36).substring(2, 6);
      return `${timestamp}order_${trackerId}_${rand}`;
    }

    const dataIn = {
      customer: {
        customerId: "5cf8106a-6d7c-46aa-854c-828806db9704",
        name: `${firstName} ${lastName}`,
        phone: {
          number1: phone,
        },
      },
      deliveryAddress: {
        cityTerritoryId: wilaya,
        districtTerritoryId: commune,
        Street: address,
      },
      orderedProducts: [
        {
          productName: product,
          unitPrice: +(price / quantity).toFixed(0),
          quantity: quantity,
          stockType: "none",
        },
      ],
      hubId: agency ? agency : undefined,
      deliveryType: isStopDesk ? "pickup-point" : "home",
      description: description || "Parcel description",
      amount: price,
      externalId: generateTrack(externalId),
      weight: {
        weight: 1,
      },
    };
    console.log("dataIn", dataIn);
    const url = "https://api.zrexpress.app/api/v1/parcels";

    const resp = await axios.post(url, dataIn, {
      headers: {
        "X-Tenant": zr_tokens.tenantId,
        "X-Api-Key": zr_tokens.secretKey,
      },
    });
    console.log("resp", resp.data.id);

    const response = await axios.get(
      `https://api.zrexpress.app/api/v1.0/parcels/${resp.data.id}`,
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );

    res.status(200).json({ data: response.data });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/update-parcel-price", async (req, res) => {
  try {
    const parcelId = req.body.parcelId;
    const newPrice = req.body.newPrice;
    const getUrl = `https://api.zrexpress.app/api/v1/parcels/${parcelId}/amount`;
    const getResp = await axios.patch(
      getUrl,
      {
        parcelId,
        newPrice,
      },
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    const parcel = getResp.data;

    res.status(200).json({ parcel });
  } catch (err) {
    console.error(err.response);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/get-claim", async (req, res) => {
  try {
    const claimId = req.body.claimId;
    const getUrl = `https://api.zrexpress.app/api/v1/claims/${claimId}`;
    const getResp = await axios.post(
      getUrl,
      {
        claimId,
        includeComments: true,
      },
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    const parcel = getResp.data;

    res.status(200).json({ parcel });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/validate-parcel", async (req, res) => {
  try {
    const parcelId = req.body.parcelId;
    const getUrl = `https://api.zrexpress.app/api/v1.0/parcels/${parcelId}/state`;
    const getResp = await axios.patch(
      getUrl,
      {
        parcelId,
        newStateId: "8a948c66-1ab7-4433-aeb0-94219125d134",
      },
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    const parcel = getResp.data;

    res.status(200).json({ parcel });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/delete-claim", async (req, res) => {
  try {
    console.log("deleting");
    const claimId = req.body.claimId;
    const getUrl = `https://api.zrexpress.app/api/v1/claims/${claimId}`;
    const getResp = await axios.delete(getUrl, {
      headers: {
        "X-Tenant": zr_tokens.tenantId,
        "X-Api-Key": zr_tokens.secretKey,
      },
    });
    const claim = getResp.data;

    res.status(200).json({ claim });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});
app.post("/zr/get-claim-categories", async (req, res) => {
  try {
    console.log("called");
    const getUrl = `https://api.zrexpress.app/api/v1/claim-categories/search`;
    const getResp = await axios.post(
      getUrl,
      {
        pageNumber: 1,
        pageSize: 100,
        includeSubCategories: true,
      },
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    const categories = getResp.data;
    console.log(categories);
    res.status(200).json({ categories });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/get-communes", async (req, res) => {
  try {
    console.log("called");
    const getUrl = `https://api.zrexpress.app/api/v1.0/territories/search`;
    const getResp = await axios.post(
      getUrl,
      {
        pageNumber: 2,
        pageSize: 1000,
        includeSubCategories: true,
      },
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    const categories = getResp.data;
    console.log(categories);
    res.status(200).json({ categories });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/create-claim", async (req, res) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const categoryId = req.body.categoryId;
    const parcelId = req.body.parcelId;

    const getUrl = `https://api.zrexpress.app/api/v1/claims`;
    const dataIn = {
      title: title,
      description: description,
      categoryId: categoryId,
      parcelId: parcelId,
    };
    const getResp = await axios.post(getUrl, dataIn, {
      headers: {
        "X-Tenant": zr_tokens.tenantId,
        "X-Api-Key": zr_tokens.secretKey,
      },
    });
    const claim = getResp.data;
    console.log("claim created", claim);

    res.status(200).json({ claim });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/get-customer-id", async (req, res) => {
  try {
    const originalParcelId = req.body.originalParcelId;
    const getUrl = `https://api.zrexpress.app/api/v1.0/parcels/${originalParcelId}`;
    const getResp = await axios.get(getUrl, {
      headers: {
        "X-Tenant": zr_tokens.tenantId,
        "X-Api-Key": zr_tokens.secretKey,
      },
    });
    const originalParcel = getResp.data || {};
    const originalCustomer = originalParcel.customer || {};
    const originalDeliveryAddress = originalParcel.deliveryAddress || {};
    const originalOrderedProduct = originalParcel.orderedProducts?.[0] || {};
    const customerId = originalCustomer.customerId;
    console.log(getResp.data);
    res.status(200).json({ success: true, customerId: customerId });
  } catch (err) {
    console.error(err.response.data);
    res.status(401).json({ error: err });
  }
});

app.post("/zr/create-exchange", async (req, res) => {
  try {
    const originalParcelId = req.body.originalParcelId;
    const address = req.body.address;
    const wilaya = req.body.wilaya;
    const commune = req.body.commune;
    const product = req.body.product;
    const isStopDesk = req.body.isStopDesk;
    const price = req.body.price;
    const quantity = req.body.quantity;
    const agency = req.body.agency;
    const description = req.body.description;
    const externalId = req.body.externalId;

    console.log("originalParcelId", originalParcelId);

    console.log(
      `invoking https://api.zrexpress.app/api/v1.0/parcels/${originalParcelId}`,
    );
    const getUrl = `https://api.zrexpress.app/api/v1.0/parcels/${originalParcelId}`;
    const getResp = await axios.get(getUrl, {
      headers: {
        "X-Tenant": zr_tokens.tenantId,
        "X-Api-Key": zr_tokens.secretKey,
      },
    });

    const originalParcel = getResp.data || {};
    const originalCustomer = originalParcel.customer || {};
    const originalDeliveryAddress = originalParcel.deliveryAddress || {};
    const originalOrderedProduct = originalParcel.orderedProducts?.[0] || {};
    const customerId = originalCustomer.customerId;

    function generateTrack(trackerId) {
      const timestamp = Date.now().toString(36); // compact
      const rand = Math.random().toString(36).substring(2, 6);
      return `${timestamp}order_${trackerId}_${rand}`;
    }

    const normalizedStockType =
      req.body.stockType === "warehouse" ? "warehouse" : "local";
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const cityTerritoryId = uuidRegex.test(wilaya)
      ? wilaya
      : originalDeliveryAddress.cityTerritoryId;
    const districtTerritoryId = uuidRegex.test(commune)
      ? commune
      : originalDeliveryAddress.districtTerritoryId;
    const resolvedProductId = originalOrderedProduct.productId;
    const resolvedProductSku =
      originalOrderedProduct.productSku ||
      originalOrderedProduct.sku ||
      originalOrderedProduct.id;
    const resolvedProductName = product || originalOrderedProduct.productName;
    const resolvedCustomerName = originalCustomer.name;
    const resolvedPrice = Number.isFinite(Number(price)) ? Number(price) : 0;
    const resolvedQuantity =
      Number.isFinite(Number(quantity)) && Number(quantity) > 0
        ? Number(quantity)
        : 1;
    const resolvedUnitPrice = Math.round(resolvedPrice / resolvedQuantity);

    const missingFields = [];
    if (!originalParcelId) missingFields.push("originalParcelId");
    if (!customerId) missingFields.push("customer.customerId");
    if (!resolvedCustomerName) missingFields.push("customer.name");
    if (!resolvedProductId) missingFields.push("orderedProducts[0].productId");
    if (!resolvedProductName)
      missingFields.push("orderedProducts[0].productName");
    if (!resolvedProductSku)
      missingFields.push("orderedProducts[0].productSku");
    if (!cityTerritoryId) missingFields.push("deliveryAddress.cityTerritoryId");
    if (!districtTerritoryId)
      missingFields.push("deliveryAddress.districtTerritoryId");

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        provider: "zrexpress",
        message: "Missing required fields for create-exchange.",
        missingFields,
      });
    }

    const dataIn = {
      customer: {
        customerId: customerId,
        name: resolvedCustomerName,
      },
      orderedProducts: [
        {
          productId: resolvedProductId,
          // productSku: resolvedProductSku,
          productName: resolvedProductName,
          unitPrice: resolvedUnitPrice,
          quantity: resolvedQuantity,
          stockType: "none",
        },
      ],
      deliveryType: isStopDesk ? "pickup-point" : "home",
      description: description || "Parcel description",
      amount: resolvedPrice,
      isReturned:
        typeof req.body.isReturned === "boolean" ? req.body.isReturned : true,
      originalParcelId: originalParcelId,
      externalId: generateTrack(externalId),
    };
    if (cityTerritoryId && districtTerritoryId) {
      dataIn.deliveryAddress = {
        cityTerritoryId: cityTerritoryId,
        districtTerritoryId: districtTerritoryId,
        Street: address,
      };
    }
    if (agency && uuidRegex.test(agency)) {
      dataIn.hubId = agency;
    }
    if (req.body.weight && Number.isFinite(Number(req.body.weight))) {
      dataIn.weight = { weight: Number(req.body.weight) };
    }

    console.log(`invoking https://api.zrexpress.app/api/v1.0/parcels/exchange`);
    const url = "https://api.zrexpress.app/api/v1.0/parcels/exchange";
    // console.log("dataIn", dataIn);
    const resp = await axios.post(url, dataIn, {
      headers: {
        "X-Tenant": zr_tokens.tenantId,
        "X-Api-Key": zr_tokens.secretKey,
      },
    });

    console.log(
      `invoking https://api.zrexpress.app/api/v1.0/parcels/${resp.data.id}`,
    );
    const response = await axios.get(
      `https://api.zrexpress.app/api/v1.0/parcels/${resp.data.id}`,
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    console.log("complete");
    res.status(200).json({ data: response.data });
  } catch (err) {
    const status = err.response?.status || 500;
    const providerError = err.response?.data || { message: err.message };
    console.error("error exchange zr: ", providerError);
    res.status(status).json({
      success: false,
      provider: "zrexpress",
      message:
        err.response?.data?.message || err.message || "Unexpected error.",
      error: providerError,
    });
  }
});

app.post("/zr/update-histories", async (req, res) => {
  try {
    const parcelId = req.body.parcelId;
    const trackingId = req.body.trackingId;
    const type = req.body.type;
    const trackerId = req.body.trackerId;

    const histories = [];

    const url = `https://api.zrexpress.app/api/v1.0/parcels/${parcelId}/state-history`;

    const resp = await axios.get(url, {
      headers: {
        "X-Tenant": zr_tokens.tenantId,
        "X-Api-Key": zr_tokens.secretKey,
      },
    });
    console.log("resp", resp.data);
    for (const history of resp.data) {
      histories.push({
        tracking: trackingId,
        created_at: history.createdAt,
        status: history.newState?.description || "",
        note: history.comment || "",
        station: history.location?.hubName || "",
        delivery_man: history.modifiedBy?.fullName || "",
        type,
        tracker_id: trackerId,
      });
      if (history.situations?.length > 0) {
        for (const situation of history.situations) {
          histories.push({
            tracking: trackingId,
            created_at: situation.createdAt,
            status: situation.situationName,
            note:
              situation.metadata?.comment ||
              situation.situationDescription ||
              "",
            station: history.location?.hubName || "",
            delivery_man: history.modifiedBy?.fullName || "",
            type,
            tracker_id: trackerId,
          });
        }
      }
    }
    console.log("histories", histories);
    const { data: dataHistories, error: errorHistories } = await supabase
      .from("parcel-updates")
      .upsert(histories)
      .select();

    if (dataHistories) {
      console.log("histories upserted");
    }

    if (errorHistories) {
      console.log(errorHistories);
    }

    res.status(200).json({ data: histories });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err });
  }
});
// delete a parcel by tracking id
app.post("/zr/delete", async (req, res) => {
  try {
    const id = req.body.id;
    // console.log(`https://api.zrexpress.app/api/v1/parcels/${id}`);
    const resp = await axios.delete(
      `https://api.zrexpress.app/api/v1/parcels/${id}`,
      {
        headers: {
          "X-Tenant": zr_tokens.tenantId,
          "X-Api-Key": zr_tokens.secretKey,
        },
      },
    );
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err);
    res.status(401).json({ error: err });
  }
});
// get a percel history
app.post("/zr/histories", async (req, res) => {
  try {
    const extension = req.body.tracking;

    console.log(extension);
    const resp = await axios.get(
      `https://api.zrexpress.app/api/v1.0/parcels/${tracking}/state-history`,
      {
        headers: {
          "X-Tenant": "92129974643421801058",
          "X-Api-Key":
            "R6fQ0uioaFWUDHJL2It1kvejKcgCNxSpPdsEX4AywrM8OGmTz5lVB7b3hYqn9Z",
        },
      },
    );
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err);
    res.status(401).json({ error: err });
  }
});
// get parcels with filter
// create a parcel
app.post("/histories", async (req, res) => {
  try {
    const extension = req.body.extension;
    console.log(extension);
    const resp = await axios.get(
      `https://api.yalidine.app/v1/histories/${extension}`,
      {
        headers: {
          "X-API-ID": "92129974643421801058",
          "X-API-TOKEN":
            "R6fQ0uioaFWUDHJL2It1kvejKcgCNxSpPdsEX4AywrM8OGmTz5lVB7b3hYqn9Z",
        },
      },
    );
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err);
    res.status(401).json({ error: err });
  }
});
app.post("/delete", async (req, res) => {
  try {
    const tracking = req.body.tracking;
    console.log(tracking);
    const resp = await axios.delete(
      `https://api.yalidine.app/v1/parcels/${tracking}`,
      {
        headers: {
          // "X-API-ID": "73837800271119345844",
          // "X-API-TOKEN":
          //   "W1CdymI0FqqBVDfGN1YfvWlK75v4oilX63ahP9TxFHh3rYTxGK8AAckdnnQHrBjb",
          "X-API-ID": "92129974643421801058",
          "X-API-TOKEN":
            "R6fQ0uioaFWUDHJL2It1kvejKcgCNxSpPdsEX4AywrM8OGmTz5lVB7b3hYqn9Z",
        },
      },
    );
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err);
    res.status(401).json({ error: err });
  }
});
app.post("/", async (req, res) => {
  try {
    const extension = req.body.extension;
    console.log(extension);
    const resp = await axios.get(
      `https://api.yalidine.app/v1/parcels/${extension}`,
      {
        headers: {
          "X-API-ID": "92129974643421801058",
          "X-API-TOKEN":
            "R6fQ0uioaFWUDHJL2It1kvejKcgCNxSpPdsEX4AywrM8OGmTz5lVB7b3hYqn9Z",
          // "X-API-ID": "92129974643421801058",
          // "X-API-TOKEN":
          //   "JyWPYR7SpCZlWMSO4rQKcqrPAzNwmftAMdv49z07EVtwlTU3aBVNaFF2GLes2uoH",
        },
      },
    );
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err);
    res.status(401).json({ error: err });
  }
});

app.post("/create", async (req, res) => {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const address = req.body.address;
    const phone = req.body.phone;
    const wilaya = req.body.wilaya;
    const commune = req.body.commune;
    const product = req.body.product;
    const isStopDesk = req.body.isStopDesk;
    const isFreeShipping = req.body.isFreeShipping;
    const stopdesk = +req.body.stopdesk;
    const price = req.body.price;
    const orderId = req.body.orderId;
    const hasExchange = req.body.hasExchange ? req.body.hasExchange : false;
    const productToCollect = req.body.productToCollect
      ? req.body.productToCollect
      : null;

    const isWholesale = !!req.body.isWholesale;

    const url = "https://api.yalidine.app/v1/parcels/";
    console.log({
      order_id: `order_${orderId}`,
      firstname: firstName,
      familyname: lastName,
      contact_phone: phone,
      address: address,
      to_commune_name: commune,
      to_wilaya_name: wilaya,
      product_list: product,
      price: price,
      freeshipping: true,
      is_stopdesk: isStopDesk,
      stopdesk_id: stopdesk,
      has_exchange: hasExchange,
      product_to_collect: productToCollect,
    });

    let declared_value;

    if (isWholesale) {
      declared_value = price;
    } else {
      declared_value = price > 5000 ? 5000 : price;
    }

    const weight = isWholesale ? req.body.weight : null;

    const data = [
      {
        order_id: `order_${orderId}`,
        firstname: firstName,
        familyname: lastName,
        contact_phone: phone,
        address: address,
        to_commune_name: commune,
        to_wilaya_name: wilaya,
        product_list: product,
        price: price,
        freeshipping: !isWholesale,
        is_stopdesk: isStopDesk,
        stopdesk_id: stopdesk,
        do_insurance: isWholesale,
        declared_value: declared_value,
        has_exchange: hasExchange,
        weight: weight,
        product_to_collect: productToCollect,
      },
    ];

    const response = await axios.post(url, data, {
      headers: {
        "X-API-ID": "92129974643421801058",
        "X-API-TOKEN":
          "R6fQ0uioaFWUDHJL2It1kvejKcgCNxSpPdsEX4AywrM8OGmTz5lVB7b3hYqn9Z",
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data.error);
    res.status(500).send(error.message);
  }
});

app.get("/centers", async (req, res) => {
  try {
    // const firstName = req.body.firstName;
    // const lastName = req.body.lastName;
    // const address = req.body.address;
    // const phone = req.body.phone;
    // const wilaya = req.body.wilaya;
    // const commune = req.body.commune;
    // const product = req.body.product;
    // const isStopDesk = req.body.isStopDesk;
    // const isFreeShipping = req.body.isFreeShipping;
    // const stopdesk = +req.body.stopdesk;
    // const price = req.body.price;
    // const orderId = req.body.orderId;
    const url = "https://api.yalidine.app/v1/centers/?page_size=200";
    const data = [
      {
        order_id: "order_13",
        firstname: "مصباح",
        familyname: "الواهم",
        contact_phone: "0540842804",
        address: "",
        to_commune_name: "Skikda",
        to_wilaya_name: "Skikda",
        from_wilaya_name: "Constantine",
        do_insurance: false,
        declared_value: 0,
        product_list: "chaussure_3_gris-souris_41x1",
        price: 4900,
        freeshipping: true,
        is_stopdesk: true,
        stopdesk_id: 213501,
        has_exchange: 0,
        product_to_collect: null,
      },
    ];

    const response = await axios.get(url, {
      headers: {
        "X-API-ID": "92129974643421801058",
        "X-API-TOKEN":
          "R6fQ0uioaFWUDHJL2It1kvejKcgCNxSpPdsEX4AywrM8OGmTz5lVB7b3hYqn9Z",
        "Content-Type": "application/json",
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
});

app.post("/ups/", async (req, res) => {
  try {
    const extension = req.body.extension;
    const filter = req.body.filter;

    const url = `https://app.conexlog-dz.com/api/v1/get/orders${
      filter ? "/status" : ""
    }?api_token=${ACCESS_ID}&${extension}`;

    const resp = await axios.get(url);
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err.response.data.message);
    res.status(401).json({ error: err.response.data.message });
  }
});

app.post("/ups/create", async (req, res) => {
  try {
    console.log("called");
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const address = req.body.address;
    const phone = req.body.phone;
    const phone2 = req.body.phone2;
    const wilaya = req.body.wilaya;
    const commune = req.body.commune;
    const product = req.body.product_list;
    const isStopDesk = req.body.isStopDesk;
    const note = req.body.note;
    const price = req.body.price;
    const reference = req.body.reference;
    const hasExchange = req.body.hasExchange ? req.body.hasExchange : false;
    const productToCollect = req.body.productToCollect
      ? req.body.productToCollect
      : null;

    const baseUrl = `https://app.conexlog-dz.com/api/v1/create/order?api_token=${ACCESS_ID}`;

    const data = {
      reference: `order_${reference}`,
      nom_client: `${firstName} ${lastName}`,
      telephone: phone,
      telephone_2: phone2,
      adresse: address,
      commune: commune,
      code_wilaya: wilaya,
      montant: price,
      remarque: note,
      produit: product,
      produit_a_recupere: productToCollect,
      boutique: "ecomeast",
      type: hasExchange ? 2 : 1,
      stop_desk: isStopDesk ? 1 : 0,
    };

    const queryString = objectToQueryString(data);

    const url = `${baseUrl}&${queryString}`;
    console.log(url);
    const response = await axios.post(url, data);
    console.log(response.data);
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error.response.data);
    res.status(500).send(error.response);
  }
});

app.post("/ups/delete", async (req, res) => {
  try {
    const tracking = req.body.tracking;

    const url = `https://app.conexlog-dz.com/api/v1/delete/order?api_token=${ACCESS_ID}&tracking=${tracking}`;

    const resp = await axios.delete(url);
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err.response.data.error);
    res.status(401).json({ error: err.response.data.error });
  }
});

app.post("/ups/updates", async (req, res) => {
  try {
    const extension = req.body.tracking;

    const url = `https://app.conexlog-dz.com/api/v1/get/maj?api_token=${ACCESS_ID}&tracking=${extension}`;

    const resp = await axios.get(url);
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err.response.data.message);
    res.status(401).json({ error: err.response.data.message });
  }
});

app.post("/ups/histories", async (req, res) => {
  try {
    const extension = req.body.tracking;

    const url = `https://app.conexlog-dz.com/api/v1/get/tracking/info?api_token=${ACCESS_ID}&tracking=${extension}`;

    const resp = await axios.get(url);
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err.response.data.message);
    res.status(401).json({ error: err.response.data.message });
  }
});

app.post("/ups/send-note", async (req, res) => {
  try {
    const tracking = req.body.tracking;
    const content = req.body.note;

    const url = `https://app.conexlog-dz.com/api/v1/add/maj?api_token=${ACCESS_ID}&tracking=${tracking}&content=${content}`;

    const resp = await axios.post(url);
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err.response.data.message);
    res.status(401).json({ error: err.response.data.message });
  }
});

app.post("/ups/request-return", async (req, res) => {
  try {
    const tracking = req.body.tracking;

    const url = `https://app.conexlog-dz.com/api/v1/ask/for/order/return?api_token=${ACCESS_ID}&tracking=${tracking}`;

    const resp = await axios.post(url);
    res.status(200).json({ data: resp.data });
  } catch (err) {
    // Handle Error Here
    console.error(err.response.data.message);
    res.status(401).json({ error: err.response.data.message });
  }
});

app.listen(port, () => {
  console.log(`connected sucessfully on port ${port}`);
});
