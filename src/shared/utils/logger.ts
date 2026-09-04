/**
 * Environment-aware logger utility
 * In production, only errors are logged to console
 * In development, all logs are shown
 */
const isDevelopment = process.env.NODE_ENV === "development";

const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
    // In production, you might want to send to a logging service
    // For now, we only log errors in production
  },
  error: (message: string, error?: Error) => {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, error);
    // TODO: Send to error tracking service (Sentry, etc.)
  },
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};

export default logger;
