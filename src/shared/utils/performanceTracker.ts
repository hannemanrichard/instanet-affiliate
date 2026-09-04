import logger from "@/shared/utils/logger";

/**
 * Simple Performance Tracker
 *
 * This utility helps track performance metrics and improvements
 * made to the application.
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled: boolean = process.env.NODE_ENV === "development";

  /**
   * Start tracking a performance metric
   */
  start(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata,
    });
  }

  /**
   * End tracking a performance metric
   */
  end(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      logger.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Log the performance metric
    logger.info(
      `🚀 Performance: ${name} took ${duration.toFixed(2)}ms`,
      metric.metadata
    );

    return duration;
  }

  /**
   * Track a function's execution time
   */
  async track<T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.start(name, metadata);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get performance summary
   */
  getSummary(): {
    totalMetrics: number;
    averageDuration: number;
    slowestMetric: PerformanceMetric | null;
    fastestMetric: PerformanceMetric | null;
  } {
    const metrics = this.getMetrics().filter((m) => m.duration !== undefined);

    if (metrics.length === 0) {
      return {
        totalMetrics: 0,
        averageDuration: 0,
        slowestMetric: null,
        fastestMetric: null,
      };
    }

    const totalDuration = metrics.reduce(
      (sum, m) => sum + (m.duration || 0),
      0
    );
    const averageDuration = totalDuration / metrics.length;

    const slowestMetric = metrics.reduce((slowest, current) =>
      (current.duration || 0) > (slowest.duration || 0) ? current : slowest
    );

    const fastestMetric = metrics.reduce((fastest, current) =>
      (current.duration || 0) < (fastest.duration || 0) ? current : fastest
    );

    return {
      totalMetrics: metrics.length,
      averageDuration,
      slowestMetric,
      fastestMetric,
    };
  }
}

// Create a singleton instance
export const performanceTracker = new PerformanceTracker();

/**
 * React Hook for performance tracking
 */
export function usePerformanceTracking() {
  const track = (name: string, metadata?: Record<string, any>) => {
    performanceTracker.start(name, metadata);
    return () => performanceTracker.end(name);
  };

  const trackAsync = async <T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return performanceTracker.track(name, fn, metadata);
  };

  const getSummary = () => performanceTracker.getSummary();

  return {
    track,
    trackAsync,
    getSummary,
    clear: () => performanceTracker.clear(),
  };
}

/**
 * Higher-order function to track performance
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  name: string,
  metadata?: Record<string, any>
): T {
  return ((...args: any[]) => {
    performanceTracker.start(name, metadata);
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.finally(() => performanceTracker.end(name));
      }
      performanceTracker.end(name);
      return result;
    } catch (error) {
      performanceTracker.end(name);
      throw error;
    }
  }) as T;
}
