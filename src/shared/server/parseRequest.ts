import { ZodError, type ZodTypeAny, type z } from "zod";

export type ValidationIssue = {
  path: string;
  message: string;
};

export class ValidationError extends Error {
  readonly code = "VALIDATION_ERROR";
  readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[] = []) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

export const formatZodIssues = (error: ZodError): ValidationIssue[] =>
  error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join(".") : "(root)",
    message: issue.message,
  }));

export const parseWithSchema = <TSchema extends ZodTypeAny>(
  schema: TSchema,
  data: unknown,
  message = "Invalid request"
): z.infer<TSchema> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(message, formatZodIssues(result.error));
  }
  return result.data;
};

export const parseJsonBody = async <TSchema extends ZodTypeAny>(
  req: Request,
  schema: TSchema,
  message = "Invalid request body"
): Promise<z.infer<TSchema>> => {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON", [
      { path: "(body)", message: "Invalid JSON" },
    ]);
  }
  return parseWithSchema(schema, raw, message);
};

export const parseSearchParams = <TSchema extends ZodTypeAny>(
  searchParams: URLSearchParams,
  schema: TSchema,
  message = "Invalid query parameters"
): z.infer<TSchema> => {
  const raw: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    raw[key] = value;
  });
  return parseWithSchema(schema, raw, message);
};

export const parsePositiveIntParam = (
  raw: string,
  fieldName = "id"
): number => {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new ValidationError(`Valid ${fieldName} is required`, [
      { path: fieldName, message: `Must be a positive integer` },
    ]);
  }
  return value;
};
