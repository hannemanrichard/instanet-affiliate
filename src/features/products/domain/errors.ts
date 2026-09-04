export class ProductError extends Error {
  constructor(message: string, public readonly code: string = "PRODUCT_ERROR") {
    super(message);
    this.name = "ProductError";
  }
}

export class ProductItemError extends Error {
  constructor(message: string, public readonly code: string = "PRODUCT_ITEM_ERROR") {
    super(message);
    this.name = "ProductItemError";
  }
}

export class ProductPageError extends Error {
  constructor(message: string, public readonly code: string = "PRODUCT_PAGE_ERROR") {
    super(message);
    this.name = "ProductPageError";
  }
}

