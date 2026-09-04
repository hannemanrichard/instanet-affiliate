"use client";

import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import { Building2, ClipboardPlus, Clock, Home, Truck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Combobox } from "@/shared/components/ui/combobox";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/utils/utils";
import {
  findAgencyLabel,
  findCommuneLabel,
  findWilaya,
  findWilayaLabel,
  getAgenciesByCommune,
  getCommunesByWilaya,
  getDeliveryFeeForWilaya,
  wilayasZr,
} from "@/shared/data/zrLocations";
import { useActiveProductPages, useAdminProducts } from "@/features/products";
import type { ProductPageEntity } from "@/features/products/domain";
import { useCreateOrder } from "../application";
import {
  CreateOrderItemsField,
  createInitialOrderLines,
  isOrderLineComplete,
  type OrderLineDraft,
} from "./CreateOrderItemsField";
import { OrderAmountBreakdown } from "./OrderAmountBreakdown";
import { computeOrderAmounts } from "./orderAmounts";
import {
  controlClass,
  fieldLabelClass,
  sectionClass,
  sectionTitleClass,
  segmentOptionClass,
} from "./createOrderFormStyles";

type DeliveryType = "home" | "stopdesk";

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the product page is preselected and hidden from the form. */
  lockedProductPage?: ProductPageEntity;
}

const handleOptionKeyDown = (
  event: KeyboardEvent<HTMLDivElement>,
  onSelect: () => void
) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
};

export const CreateOrderDialog = ({
  open,
  onOpenChange,
  lockedProductPage,
}: CreateOrderDialogProps) => {
  const t = useTranslations("affiliateDashboard.orders.create");
  const tDash = useTranslations("affiliateDashboard");
  const createOrder = useCreateOrder();
  const productsQuery = useAdminProducts();
  const productPagesQuery = useActiveProductPages();
  const products = productsQuery.data ?? [];
  const lockedProductPageId = lockedProductPage?.id;
  const isProductPageLocked =
    lockedProductPageId != null &&
    Number.isFinite(lockedProductPageId) &&
    lockedProductPageId > 0;
  const productPages = useMemo(() => {
    const pages = productPagesQuery.data ?? [];
    if (!lockedProductPage) return pages;
    if (pages.some((page) => page.id === lockedProductPage.id)) return pages;
    return [lockedProductPage, ...pages];
  }, [productPagesQuery.data, lockedProductPage]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("home");
  const [wilayaId, setWilayaId] = useState("");
  const [communeId, setCommuneId] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [discount, setDiscount] = useState(0);
  const [lines, setLines] = useState<OrderLineDraft[]>(() =>
    createInitialOrderLines(
      isProductPageLocked ? lockedProductPageId : undefined,
      isProductPageLocked ? lockedProductPage?.product_id : undefined
    )
  );

  const isStopdesk = deliveryType === "stopdesk";

  const communeOptions = useMemo(
    () =>
      getCommunesByWilaya(wilayaId, {
        requireAgency: isStopdesk,
      }),
    [wilayaId, isStopdesk]
  );

  const agencyOptions = useMemo(
    () => getAgenciesByCommune(communeId),
    [communeId]
  );

  const selectedWilaya = useMemo(() => findWilaya(wilayaId), [wilayaId]);
  const deliveryFee = useMemo(
    () => getDeliveryFeeForWilaya(wilayaId, isStopdesk),
    [wilayaId, isStopdesk]
  );

  const formatFee = (fee: number) => {
    const formatted = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
      numberingSystem: "latn",
    }).format(fee);
    return `${formatted} ${tDash("currencySymbol")}`;
  };

  const handleReset = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setAddress("");
    setDeliveryType("home");
    setWilayaId("");
    setCommuneId("");
    setAgencyId("");
    setDiscount(0);
    setLines(
      createInitialOrderLines(
        isProductPageLocked ? lockedProductPageId : undefined,
        isProductPageLocked ? lockedProductPage?.product_id : undefined
      )
    );
  };

  useEffect(() => {
    if (!open) return;
    setLines(
      createInitialOrderLines(
        isProductPageLocked ? lockedProductPageId : undefined,
        isProductPageLocked ? lockedProductPage?.product_id : undefined
      )
    );
  }, [open, isProductPageLocked, lockedProductPageId, lockedProductPage?.product_id]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      handleReset();
    }
    onOpenChange(nextOpen);
  };

  const handleDeliveryTypeChange = (value: DeliveryType) => {
    setDeliveryType(value);
    setCommuneId("");
    setAgencyId("");
  };

  const handleWilayaChange = (value: string) => {
    setWilayaId(value);
    setCommuneId("");
    setAgencyId("");
  };

  const handleCommuneChange = (value: string) => {
    setCommuneId(value);
    setAgencyId("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!wilayaId || !communeId) return;
    if (isStopdesk && !agencyId) return;
    if (!lines.every(isOrderLineComplete)) return;

    const firstLine = lines[0];
    const firstPage = productPages.find(
      (page) => page.id === firstLine.productPageId
    );
    const firstProduct = products.find(
      (product) => product.id === firstPage?.product_id
    );
    if (!firstPage || !firstProduct || firstLine.itemId == null) return;

    const totalQty = lines.reduce((sum, line) => sum + line.qty, 0);
    const colors = lines.map((line) => line.color).filter(Boolean);
    const sizes = lines.map((line) => line.size).filter(Boolean);

    const wilayaLabel = findWilayaLabel(wilayaId);
    const communeLabel = findCommuneLabel(communeId);
    const agencyLabel = agencyId ? findAgencyLabel(agencyId) : undefined;

    const itemQtyMap = new Map<
      number,
      { item_id: number; qty: number; product_page_id?: number }
    >();
    for (const line of lines) {
      if (line.itemId == null) continue;
      const existing = itemQtyMap.get(line.itemId);
      if (existing) {
        existing.qty += line.qty;
        continue;
      }
      itemQtyMap.set(line.itemId, {
        item_id: line.itemId,
        qty: line.qty,
        product_page_id: line.productPageId ?? undefined,
      });
    }

    const wilayaFee = getDeliveryFeeForWilaya(wilayaId, isStopdesk);

    await createOrder.mutateAsync({
      order: {
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        wilaya: wilayaLabel,
        commune: communeLabel,
        is_stopdesk: isStopdesk,
        stopdesk: isStopdesk ? agencyLabel : undefined,
        product: firstPage.headline,
        product_color: colors.join(", ") || undefined,
        product_size: sizes.join(", ") || undefined,
        product_price: firstProduct.retail_price,
        product_qty: totalQty,
        delivery_fees: wilayaFee,
        shipping_price: wilayaFee,
        is_free_shipping: true,
        is_wholesale: false,
        is_exchange_required: false,
        is_exchange: false,
        has_exchange: false,
        has_defect: false,
        channel: "affiliate",
      },
      items: Array.from(itemQtyMap.values()),
      productId: firstProduct.id,
      discount: discount > 0 ? discount : undefined,
      deliveryLocation: {
        wilayaId,
        communeId,
        agencyId: isStopdesk ? agencyId : undefined,
      },
    });

    handleOpenChange(false);
  };

  const selectedPage = productPages.find(
    (page) => page.id === lines[0]?.productPageId
  );
  const selectedProduct = products.find(
    (product) => product.id === selectedPage?.product_id
  );

  const orderAmounts = useMemo(
    () =>
      computeOrderAmounts(
        lines.map((line) => {
          const page = productPages.find(
            (productPage) => productPage.id === line.productPageId
          );
          const productId = line.productId ?? page?.product_id;
          const product = products.find((entry) => entry.id === productId);
          return {
            qty: line.qty,
            unitPrice: product?.retail_price,
            unitCommission: product?.retail_commission,
          };
        }),
        discount
      ),
    [lines, productPages, products, discount]
  );

  const canSubmit =
    Boolean(firstName.trim()) &&
    Boolean(phone.trim()) &&
    Boolean(wilayaId) &&
    Boolean(communeId) &&
    (!isStopdesk || Boolean(agencyId)) &&
    Boolean(selectedPage) &&
    Boolean(selectedProduct) &&
    lines.length > 0 &&
    lines.every(isOrderLineComplete) &&
    !createOrder.isPending;

  const deliveryOptions: Array<{
    value: DeliveryType;
    label: string;
    icon: typeof Home;
  }> = [
    { value: "home", label: t("deliveryHome"), icon: Home },
    { value: "stopdesk", label: t("deliveryStopdesk"), icon: Building2 },
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader className="-mx-6 -mt-6 space-y-0 border-b border-[#e8e8e8] bg-primary/[0.04] px-6 py-5 sm:rounded-t-lg">
          <div className="flex items-start gap-3 pr-6">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15"
              aria-hidden
            >
              <ClipboardPlus className="h-5 w-5" />
            </span>
            <div className="min-w-0 space-y-1.5">
              <DialogTitle className="text-xl font-semibold tracking-tight text-[#222]">
                {t("title")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                {isProductPageLocked ? t("descriptionLocked") : t("description")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className={sectionClass} aria-labelledby="order-customer-heading">
            <h3 id="order-customer-heading" className={sectionTitleClass}>
              {t("sectionCustomer")}
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="order-first-name"
                  className={fieldLabelClass}
                >
                  {t("firstName")}
                </Label>
                <Input
                  id="order-first-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  aria-label={t("firstNameAria")}
                  className={controlClass}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order-last-name" className={fieldLabelClass}>
                  {t("lastName")}
                </Label>
                <Input
                  id="order-last-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  aria-label={t("lastNameAria")}
                  className={controlClass}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-phone" className={fieldLabelClass}>
                {t("phone")}
              </Label>
              <Input
                id="order-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                required
                aria-label={t("phoneAria")}
                className={controlClass}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order-address" className={fieldLabelClass}>
                {t("address")}
              </Label>
              <Input
                id="order-address"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                aria-label={t("addressAria")}
                className={controlClass}
              />
            </div>
          </section>

          <section className={sectionClass} aria-labelledby="order-delivery-heading">
            <h3 id="order-delivery-heading" className={sectionTitleClass}>
              {t("sectionDelivery")}
            </h3>

            <div className="space-y-1.5">
              <Label className={fieldLabelClass}>{t("deliveryType")}</Label>
              <div
                role="radiogroup"
                aria-label={t("deliveryTypeAria")}
                className="flex gap-2"
              >
                {deliveryOptions.map((option) => {
                  const isSelected = deliveryType === option.value;
                  const Icon = option.icon;
                  return (
                    <div
                      key={option.value}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      aria-label={option.label}
                      onClick={() => handleDeliveryTypeChange(option.value)}
                      onKeyDown={(event) =>
                        handleOptionKeyDown(event, () =>
                          handleDeliveryTypeChange(option.value)
                        )
                      }
                      className={segmentOptionClass(isSelected)}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span>{option.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={fieldLabelClass}>{t("wilaya")}</Label>
                <Combobox
                  options={wilayasZr}
                  value={wilayaId}
                  onValueChange={handleWilayaChange}
                  placeholder={t("selectWilaya")}
                  emptyText={t("noWilayas")}
                  aria-label={t("wilayaAria")}
                  className={cn(controlClass, "font-normal")}
                />
              </div>
              <div className="space-y-1.5">
                <Label className={fieldLabelClass}>{t("commune")}</Label>
                <Combobox
                  options={communeOptions}
                  value={communeId}
                  onValueChange={handleCommuneChange}
                  placeholder={t("selectCommune")}
                  emptyText={t("noCommunes")}
                  disabled={!wilayaId}
                  aria-label={t("communeAria")}
                  className={cn(controlClass, "font-normal")}
                />
              </div>
            </div>

            {isStopdesk ? (
              <div className="space-y-1.5">
                <Label className={fieldLabelClass}>{t("agency")}</Label>
                <Combobox
                  options={agencyOptions}
                  value={agencyId}
                  onValueChange={setAgencyId}
                  placeholder={t("selectAgency")}
                  emptyText={t("noAgencies")}
                  disabled={!communeId}
                  aria-label={t("agencyAria")}
                  className={cn(controlClass, "font-normal")}
                />
              </div>
            ) : null}

            {selectedWilaya && deliveryFee != null ? (
              <div
                className="grid grid-cols-1 gap-2 rounded-xl border border-primary/15 bg-primary/[0.04] p-3 sm:grid-cols-2"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden
                  >
                    <Truck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("deliveryFee")}
                    </p>
                    <p className="text-sm font-semibold text-[#222]">
                      {formatFee(deliveryFee)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                    aria-hidden
                  >
                    <Clock className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("estimatedDelivery")}
                    </p>
                    <p className="text-sm font-semibold text-[#222]">
                      {selectedWilaya.estimatedDeliveryTime}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className={sectionClass} aria-labelledby="order-items-heading">
            <h3 id="order-items-heading" className={sectionTitleClass}>
              {t("sectionItems")}
            </h3>
            <CreateOrderItemsField
              productPages={productPages}
              lines={lines}
              onChange={setLines}
              hideSectionLabel
              lockedProductPageId={
                isProductPageLocked ? lockedProductPageId : undefined
              }
              lockedProductId={
                isProductPageLocked ? lockedProductPage?.product_id : undefined
              }
            />
          </section>

          {orderAmounts.hasPricedLines ? (
            <OrderAmountBreakdown
              subtotal={orderAmounts.subtotal}
              totalQty={orderAmounts.totalQty}
              deliveryFee={deliveryFee}
              baseCommission={orderAmounts.baseCommission}
              commission={orderAmounts.commission}
              totalDiscount={orderAmounts.totalDiscount}
              discountedSubtotal={orderAmounts.discountedSubtotal}
              maxDiscount={orderAmounts.maxDiscount}
              discount={discount}
              onDiscountChange={setDiscount}
              currency={tDash("currencySymbol")}
            />
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {createOrder.isPending ? t("submitting") : t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
