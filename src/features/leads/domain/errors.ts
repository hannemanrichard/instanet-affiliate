export class LeadError extends Error {
  constructor(message: string, public readonly code: string = "LEAD_ERROR") {
    super(message);
    this.name = "LeadError";
  }
}

export class LeadItemError extends Error {
  constructor(message: string, public readonly code: string = "LEAD_ITEM_ERROR") {
    super(message);
    this.name = "LeadItemError";
  }
}

export class LeadHopError extends Error {
  constructor(message: string, public readonly code: string = "LEAD_HOP_ERROR") {
    super(message);
    this.name = "LeadHopError";
  }
}

