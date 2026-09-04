export class InventoryError extends Error {
  constructor(message: string, public readonly code: string = "INVENTORY_ERROR") {
    super(message);
    this.name = "InventoryError";
  }
}

