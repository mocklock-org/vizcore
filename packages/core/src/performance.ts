import { PerformanceMetrics } from './interfaces/types';
import { DEFAULT_MAX_METRICS, DEFAULT_PERFORMANCE_MONITORING_ENABLED, DEFAULT_SAMPLE_RATE } from './constants';

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics: number = DEFAULT_MAX_METRICS;
  private enabled: boolean;
  private sampleRate: number;

  constructor(enabled: boolean = DEFAULT_PERFORMANCE_MONITORING_ENABLED, sampleRate: number = DEFAULT_SAMPLE_RATE) {
    this.enabled = enabled;
    this.sampleRate = sampleRate;
  }

  startMeasurement(id: string): PerformanceMeasurement {
    if (!this.enabled || Math.random() > this.sampleRate) {
      return new NoOpMeasurement();
    }
    return new ActiveMeasurement(id, this);
  }

  recordMetric(metric: PerformanceMetrics): void {
    if (!this.enabled) return;

    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getAverageProcessingTime(): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((sum, m) => sum + m.processingTime, 0) / this.metrics.length;
  }

  getAverageMemoryUsage(): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / this.metrics.length;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export abstract class PerformanceMeasurement {
  abstract end(dataSize?: number, memoryUsage?: number): void;
}

class ActiveMeasurement extends PerformanceMeasurement {
  private startTime: number;
  private id: string;
  private monitor: PerformanceMonitor;

  constructor(id: string, monitor: PerformanceMonitor) {
    super();
    this.id = id;
    this.monitor = monitor;
    this.startTime = performance.now();
  }

  end(dataSize: number = 0, memoryUsage: number = 0): void {
    const processingTime = performance.now() - this.startTime;
    
    this.monitor.recordMetric({
      processingTime,
      memoryUsage,
      dataSize,
      timestamp: Date.now()
    });
  }
}

class NoOpMeasurement extends PerformanceMeasurement {
  end(): void {
  }
}
