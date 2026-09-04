import logger from "@/shared/utils/logger";

/**
 * Performance Monitoring System
 *
 * Tracks performance metrics for all service operations including:
 * - Response times
 * - Error rates
 * - Success rates
 * - Database query performance
 * - User mapping performance
 */

export interface PerformanceMetrics {
  operation: string;
  service: string;
  duration: number;
  success: boolean;
  error?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ServiceMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  errorRate: number;
  lastCall?: string;
}

export interface PerformanceReport {
  service: string;
  metrics: ServiceMetrics;
  recentErrors: Array<{
    operation: string;
    error: string;
    timestamp: string;
  }>;
  slowestOperations: Array<{
    operation: string;
    averageTime: number;
    callCount: number;
  }>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep last 1000 metrics
  private readonly slowOperationThreshold = 1000; // 1 second

  /**
   * Track a service operation
   */
  trackOperation<T>(
    service: string,
    operation: string,
    operationFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    return operationFn()
      .then((result) => {
        const duration = Date.now() - startTime;
        this.recordMetric({
          operation,
          service,
          duration,
          success: true,
          timestamp,
          metadata,
        });

        // Log slow operations
        if (duration > this.slowOperationThreshold) {
          logger.warn(
            `🐌 Slow operation detected: ${service}.${operation} took ${duration}ms`
          );
        }

        return result;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        this.recordMetric({
          operation,
          service,
          duration,
          success: false,
          error: error.message,
          timestamp,
          metadata,
        });

        // Log errors
        logger.error(
          `❌ Operation failed: ${service}.${operation}`,
          error instanceof Error ? error : new Error(String(error))
        );
        throw error;
      });
  }

  /**
   * Record a performance metric (for backward compatibility)
   */
  recordOperation(operation: string, duration: number): void {
    this.recordMetric({
      operation,
      service: "unknown",
      duration,
      success: true,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only the last maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get metrics for a specific service
   */
  getServiceMetrics(service: string): ServiceMetrics {
    const serviceMetrics = this.metrics.filter((m) => m.service === service);

    if (serviceMetrics.length === 0) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        averageResponseTime: 0,
        errorRate: 0,
      };
    }

    const totalCalls = serviceMetrics.length;
    const successfulCalls = serviceMetrics.filter((m) => m.success).length;
    const failedCalls = totalCalls - successfulCalls;
    const totalDuration = serviceMetrics.reduce(
      (sum, m) => sum + m.duration,
      0
    );
    const averageResponseTime = totalDuration / totalCalls;
    const errorRate = (failedCalls / totalCalls) * 100;

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      averageResponseTime,
      errorRate,
      lastCall: serviceMetrics[serviceMetrics.length - 1]?.timestamp,
    };
  }

  /**
   * Get a comprehensive performance report
   */
  getPerformanceReport(
    service?: string
  ): PerformanceReport | PerformanceReport[] {
    if (service) {
      return this.getSingleServiceReport(service);
    }

    // Get all unique services
    const services = Array.from(new Set(this.metrics.map((m) => m.service)));
    return services.map((s) => this.getSingleServiceReport(s));
  }

  /**
   * Get report for a single service
   */
  private getSingleServiceReport(service: string): PerformanceReport {
    const serviceMetrics = this.metrics.filter((m) => m.service === service);
    const metrics = this.getServiceMetrics(service);

    // Get recent errors (last 10)
    const recentErrors = serviceMetrics
      .filter((m) => !m.success)
      .slice(-10)
      .map((m) => ({
        operation: m.operation,
        error: m.error || "Unknown error",
        timestamp: m.timestamp,
      }));

    // Get slowest operations
    const operationStats = new Map<
      string,
      { totalTime: number; count: number }
    >();

    serviceMetrics.forEach((m) => {
      const existing = operationStats.get(m.operation) || {
        totalTime: 0,
        count: 0,
      };
      operationStats.set(m.operation, {
        totalTime: existing.totalTime + m.duration,
        count: existing.count + 1,
      });
    });

    const slowestOperations = Array.from(operationStats.entries())
      .map(([operation, stats]) => ({
        operation,
        averageTime: stats.totalTime / stats.count,
        callCount: stats.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);

    return {
      service,
      metrics,
      recentErrors,
      slowestOperations,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get metrics summary for all services
   */
  getSummary(): {
    totalOperations: number;
    totalErrors: number;
    overallErrorRate: number;
    averageResponseTime: number;
    services: string[];
  } {
    if (this.metrics.length === 0) {
      return {
        totalOperations: 0,
        totalErrors: 0,
        overallErrorRate: 0,
        averageResponseTime: 0,
        services: [],
      };
    }

    const totalOperations = this.metrics.length;
    const totalErrors = this.metrics.filter((m) => !m.success).length;
    const overallErrorRate = (totalErrors / totalOperations) * 100;
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalDuration / totalOperations;
    const services = Array.from(new Set(this.metrics.map((m) => m.service)));

    return {
      totalOperations,
      totalErrors,
      overallErrorRate,
      averageResponseTime,
      services,
    };
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get average time for an operation (for backward compatibility)
   */
  getAverageTime(operation: string): number {
    const operationMetrics = this.metrics.filter(
      (m) => m.operation === operation
    );
    if (operationMetrics.length === 0) return 0;

    const totalTime = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalTime / operationMetrics.length;
  }

  /**
   * Get all metrics (for backward compatibility)
   */
  getMetrics(): Record<string, number[]> {
    const result: Record<string, number[]> = {};

    this.metrics.forEach((metric) => {
      if (!result[metric.operation]) {
        result[metric.operation] = [];
      }
      result[metric.operation].push(metric.duration);
    });

    return result;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for service methods
 */
export function trackPerformance(service: string, operation: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.trackOperation(
        service,
        operation,
        () => originalMethod.apply(this, args),
        { method: propertyKey, args: args.length }
      );
    };

    return descriptor;
  };
}

/**
 * Performance wrapper for async functions
 */
export function withPerformanceTracking<T>(
  service: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  return performanceMonitor.trackOperation(service, operation, fn, metadata);
}

/**
 * Utility to log performance summary
 */
export function logPerformanceSummary(): void {
  const summary = performanceMonitor.getSummary();

  logger.info("📊 Performance Summary:", {
    totalOperations: summary.totalOperations,
    totalErrors: summary.totalErrors,
    errorRate: `${summary.overallErrorRate.toFixed(2)}%`,
    averageResponseTime: `${summary.averageResponseTime.toFixed(2)}ms`,
    services: summary.services.join(", "),
  });

  if (summary.services.length > 0) {
    logger.info("📈 Service Details:");
    summary.services.forEach((service) => {
      const metrics = performanceMonitor.getServiceMetrics(service);
      logger.info(
        `${service}: ${metrics.totalCalls} calls, ${metrics.errorRate.toFixed(
          2
        )}% error rate, ${metrics.averageResponseTime.toFixed(2)}ms avg`
      );
    });
  }
}
