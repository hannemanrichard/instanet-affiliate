import * as z from "zod";

// Type for translation function
export type TranslationFunction = (key: string) => string;

// Create i18n-aware validation schemas
export const createI18nSchemas = (t: TranslationFunction) => ({
  // Common field validations
  required: (field: string) =>
    z.string().min(1, t(`forms.validation.${field}Required`)),
  requiredNumber: (field: string) =>
    z.coerce.number().min(0, t(`forms.validation.${field}Required`)),
  requiredPositiveNumber: (field: string) =>
    z.coerce.number().min(0, t(`forms.validation.${field}Required`)),

  // String validations
  minLength: (min: number) =>
    z
      .string()
      .min(
        min,
        t("forms.validation.minLength").replace("{min}", min.toString())
      ),
  maxLength: (max: number) =>
    z
      .string()
      .max(
        max,
        t("forms.validation.maxLength").replace("{max}", max.toString())
      ),

  // Email validation
  email: () => z.string().email(t("forms.validation.invalidEmail")),

  // URL validation
  url: () => z.string().url(t("forms.validation.invalidUrl")),

  // Phone validation
  phone: () => z.string().min(1, t("forms.validation.phoneRequired")),

  // Number validations
  positiveNumber: (field: string) =>
    z.coerce.number().min(0, t(`forms.validation.${field}Positive`)),
  minNumber: (min: number, field: string) =>
    z.coerce
      .number()
      .min(
        min,
        t(`forms.validation.${field}Min`).replace("{min}", min.toString())
      ),

  // Date validation
  date: (field: string) =>
    z.date({
      required_error: t(`forms.validation.${field}Required`),
      invalid_type_error: t("forms.validation.invalidDate"),
    }),

  // Enum validation
  enum: <T extends [string, ...string[]]>(values: T, field: string) =>
    z.enum(values, {
      required_error: t(`forms.validation.${field}Required`),
    }),

  // Array validation
  array: (field: string) =>
    z.array(z.any()).min(1, t(`forms.validation.${field}Required`)),

  // Optional string
  optionalString: () => z.string().optional(),

  // Optional number
  optionalNumber: () => z.coerce.number().optional(),

  // Boolean with default
  booleanDefault: (defaultValue: boolean = false) =>
    z.boolean().default(defaultValue),
});

// Helper function to create form schemas with translations
export const createFormSchema = <T extends z.ZodRawShape>(
  schemaShape: (schemas: ReturnType<typeof createI18nSchemas>) => T,
  t: TranslationFunction
) => {
  const schemas = createI18nSchemas(t);
  return z.object(schemaShape(schemas));
};
