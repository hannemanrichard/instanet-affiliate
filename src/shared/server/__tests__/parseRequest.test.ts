import { z } from "zod";
import {
  parsePositiveIntParam,
  parseSearchParams,
  parseWithSchema,
  ValidationError,
} from "@/shared/server/parseRequest";
import { createOrderBodySchema } from "@/features/orders/domain/validations";
import { publicLeadBodySchema } from "@/features/leads/domain/validations";
import { withdrawBodySchema } from "@/features/earnings/domain/validations";

describe("parseRequest helpers", () => {
  it("parses valid data with schema", () => {
    const schema = z.object({ amount: z.number().positive() });
    expect(parseWithSchema(schema, { amount: 10 })).toEqual({ amount: 10 });
  });

  it("throws ValidationError with issues on invalid data", () => {
    const schema = z.object({ amount: z.number().positive() });
    expect(() => parseWithSchema(schema, { amount: -1 })).toThrow(
      ValidationError
    );
    try {
      parseWithSchema(schema, { amount: -1 });
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      const validationError = error as ValidationError;
      expect(validationError.code).toBe("VALIDATION_ERROR");
      expect(validationError.issues.length).toBeGreaterThan(0);
      expect(validationError.issues[0]?.path).toContain("amount");
    }
  });

  it("parses positive int params", () => {
    expect(parsePositiveIntParam("42", "id")).toBe(42);
    expect(() => parsePositiveIntParam("0", "id")).toThrow(ValidationError);
    expect(() => parsePositiveIntParam("abc", "id")).toThrow(ValidationError);
  });

  it("parses search params with coercion", () => {
    const schema = z.object({
      page: z.coerce.number().int().positive(),
      search: z.string().optional(),
    });
    const params = new URLSearchParams("page=2&search=john");
    expect(parseSearchParams(params, schema)).toEqual({
      page: 2,
      search: "john",
    });
  });
});

describe("API body schemas", () => {
  it("accepts a valid create order body", () => {
    const result = createOrderBodySchema.safeParse({
      order: {
        first_name: "Ada",
        phone: "0555000000",
        product_qty: 2,
      },
      productId: 1,
      discount: 100,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid withdraw amounts", () => {
    expect(withdrawBodySchema.safeParse({ amount: 0 }).success).toBe(false);
    expect(withdrawBodySchema.safeParse({ amount: -5 }).success).toBe(false);
    expect(withdrawBodySchema.safeParse({ amount: 50 }).success).toBe(true);
  });

  it("requires phone or first_name on public leads", () => {
    expect(
      publicLeadBodySchema.safeParse({
        lead: { last_name: "Only" },
      }).success
    ).toBe(false);

    expect(
      publicLeadBodySchema.safeParse({
        lead: { phone: "0555111222" },
      }).success
    ).toBe(true);
  });

  it("strips privileged public lead fields like status", () => {
    const result = publicLeadBodySchema.safeParse({
      lead: {
        phone: "0555111222",
        status: "qualified",
      },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect("status" in result.data.lead).toBe(false);
  });
});
