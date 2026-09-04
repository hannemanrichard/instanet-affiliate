/**
 * Unified Error Handler Factory
 *
 * This module provides a consistent way to handle errors across the application.
 * It standardizes error creation, error codes, and async operation handling.
 */

export interface ErrorDetails {
  code: string;
  message: string;
  details?: {
    timestamp: string;
    service: string;
    [key: string]: unknown;
  };
}

export interface ErrorHandler<T extends string> {
  errorCodes: Record<T, string>;
  createError: (
    code: T,
    message?: string,
    service?: string,
    additionalDetails?: Record<string, unknown>
  ) => ErrorDetails;
  executeAsyncOperation: <R>(
    operation: () => Promise<R>,
    errorCode: T,
    service?: string,
    onSuccess?: (result: R) => void
  ) => Promise<R | undefined>;
}

export class ErrorHandlerFactory {
  /**
   * Creates a new error handler with predefined error codes
   */
  static createErrorHandler<T extends string>(
    errorCodes: Record<T, string>
  ): ErrorHandler<T> {
    return {
      errorCodes,
      createError: (
        code: T,
        message?: string,
        service?: string,
        additionalDetails?: Record<string, unknown>
      ): ErrorDetails => ({
        code,
        message: message || errorCodes[code],
        details: {
          timestamp: new Date().toISOString(),
          service: service || "UnknownService",
          ...additionalDetails,
        },
      }),
      executeAsyncOperation: async <R>(
        operation: () => Promise<R>,
        errorCode: T,
        service?: string,
        onSuccess?: (result: R) => void
      ): Promise<R | undefined> => {
        try {
          const result = await operation();
          onSuccess?.(result);
          return result;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : errorCodes[errorCode];
          throw {
            code: errorCode,
            message: errorMsg,
            details: {
              timestamp: new Date().toISOString(),
              service: service || "UnknownService",
              originalError: error,
            },
          };
        }
      },
    };
  }

  /**
   * Creates a standardized error object
   */
  static createError<T extends string>(
    errorCodes: Record<T, string>,
    code: T,
    message?: string,
    service?: string,
    additionalDetails?: Record<string, unknown>
  ): ErrorDetails {
    return {
      code,
      message: message || errorCodes[code],
      details: {
        timestamp: new Date().toISOString(),
        service: service || "UnknownService",
        ...additionalDetails,
      },
    };
  }

  /**
   * Executes an async operation with standardized error handling
   */
  static async executeAsyncOperation<T, E extends string>(
    errorCodes: Record<E, string>,
    operation: () => Promise<T>,
    errorCode: E,
    service?: string,
    onSuccess?: (result: T) => void
  ): Promise<T | undefined> {
    try {
      const result = await operation();
      onSuccess?.(result);
      return result;
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : errorCodes[errorCode];
      throw this.createError(errorCodes, errorCode, errorMsg, service, {
        originalError: error,
      });
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  static createLegacyErrorHandler(messages: Partial<Record<string, string>>) {
    const defaultMessages: Record<string, string> = {
      FETCH_ERROR: "Failed to fetch data",
      CREATE_ERROR: "Failed to create record",
      UPDATE_ERROR: "Failed to update record",
      DELETE_ERROR: "Failed to delete record",
      NOT_FOUND: "Record not found",
      VALIDATION_ERROR: "Validation failed",
      NETWORK_ERROR: "Network error occurred",
      UNKNOWN_ERROR: "An unknown error occurred",
    };

    const finalMessages = { ...defaultMessages, ...messages };

    return {
      handleError: (error: any, type: string = "UNKNOWN_ERROR") => {
        const message = finalMessages[type] || finalMessages.UNKNOWN_ERROR;
        // Error logging is handled by the logger utility in actual implementations
        return new Error(message);
      },
      handleAsyncError: async <T>(
        operation: () => Promise<T>,
        type: string = "UNKNOWN_ERROR"
      ): Promise<T> => {
        try {
          return await operation();
        } catch (error) {
          throw this.createLegacyErrorHandler(messages).handleError(
            error,
            type
          );
        }
      },
    };
  }
}

/**
 * Common error codes for different domains
 */
export const COMMON_ERROR_CODES = {
  FETCH_ERROR: "Failed to fetch data",
  CREATE_ERROR: "Failed to create resource",
  UPDATE_ERROR: "Failed to update resource",
  DELETE_ERROR: "Failed to delete resource",
  VALIDATION_ERROR: "Validation failed",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NETWORK_ERROR: "Network connection error",
  TIMEOUT_ERROR: "Operation timed out",
  UNKNOWN_ERROR: "An unknown error occurred",
} as const;

/**
 * Shopping-specific error codes
 */
export const SHOPPING_ERROR_CODES = {
  ...COMMON_ERROR_CODES,
  CART_EMPTY: "Cart is empty",
  INSUFFICIENT_STOCK: "Insufficient stock available",
  INVALID_COUPON: "Invalid coupon code",
  EXPIRED_COUPON: "Coupon has expired",
  COUPON_LIMIT_REACHED: "Coupon usage limit reached",
  PRODUCT_NOT_AVAILABLE: "Product is not available",
  INVALID_QUANTITY: "Invalid quantity specified",
} as const;

/**
 * Profile-specific error codes
 */
export const PROFILE_ERROR_CODES = {
  ...COMMON_ERROR_CODES,
  INVALID_EMAIL: "Invalid email format",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  INVALID_PHONE: "Invalid phone number format",
  INVALID_BIRTHDAY: "Invalid birthday date",
  PROFILE_INCOMPLETE: "Profile information is incomplete",
} as const;

/**
 * Marketing-specific error codes
 */
export const MARKETING_ERROR_CODES = {
  ...COMMON_ERROR_CODES,
  COUPON_ALREADY_USED: "Coupon has already been used",
  COUPON_NOT_ACTIVE: "Coupon is not active",
  DISCOUNT_EXPIRED: "Discount has expired",
  INVALID_DISCOUNT_TYPE: "Invalid discount type",
  DISCOUNT_LIMIT_EXCEEDED: "Discount limit exceeded",
} as const;

/**
 * Pre-configured error handlers for different domains
 */
export const errorHandlers = {
  common: ErrorHandlerFactory.createErrorHandler(COMMON_ERROR_CODES),
  shopping: ErrorHandlerFactory.createErrorHandler(SHOPPING_ERROR_CODES),
  profile: ErrorHandlerFactory.createErrorHandler(PROFILE_ERROR_CODES),
  marketing: ErrorHandlerFactory.createErrorHandler(MARKETING_ERROR_CODES),
} as const;

/**
 * Type helpers for error codes
 */
export type CommonErrorCode = keyof typeof COMMON_ERROR_CODES;
export type ShoppingErrorCode = keyof typeof SHOPPING_ERROR_CODES;
export type ProfileErrorCode = keyof typeof PROFILE_ERROR_CODES;
export type MarketingErrorCode = keyof typeof MARKETING_ERROR_CODES;
