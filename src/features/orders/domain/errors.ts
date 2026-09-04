export class OrderError extends Error {
  constructor(message: string, public readonly code: string = "ORDER_ERROR") {
    super(message);
    this.name = "OrderError";
  }
}

export class OrderItemError extends Error {
  constructor(
    message: string,
    public readonly code: string = "ORDER_ITEM_ERROR"
  ) {
    super(message);
    this.name = "OrderItemError";
  }
}

