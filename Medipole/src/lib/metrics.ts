// Metrics types
export type MetricType = "counter" | "gauge" | "histogram" | "summary";

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
  description?: string;
}

export interface CounterMetric extends Metric {
  type: "counter";
}

export interface GaugeMetric extends Metric {
  type: "gauge";
}

export interface HistogramMetric extends Metric {
  type: "histogram";
  buckets: number[];
}

// Metrics collector class
export class MetricsCollector {
  private metrics: Map<string, Metric> = new Map();
  private defaultLabels: Record<string, string> = {};

  constructor(defaultLabels: Record<string, string> = {}) {
    this.defaultLabels = defaultLabels;
  }

  // Set default labels for all metrics
  setDefaultLabels(labels: Record<string, string>): void {
    this.defaultLabels = { ...this.defaultLabels, ...labels };
  }

  // Create a counter metric
  counter(
    name: string,
    description?: string,
    labels: Record<string, string> = {}
  ): CounterMetric {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    if (existing && existing.type === "counter") {
      return existing as CounterMetric;
    }

    const counter: CounterMetric = {
      name,
      type: "counter",
      value: 0,
      labels: { ...this.defaultLabels, ...labels },
      timestamp: Date.now(),
      description,
    };

    this.metrics.set(key, counter);
    return counter;
  }

  // Create a gauge metric
  gauge(
    name: string,
    description?: string,
    labels: Record<string, string> = {}
  ): GaugeMetric {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    if (existing && existing.type === "gauge") {
      return existing as GaugeMetric;
    }

    const gauge: GaugeMetric = {
      name,
      type: "gauge",
      value: 0,
      labels: { ...this.defaultLabels, ...labels },
      timestamp: Date.now(),
      description,
    };

    this.metrics.set(key, gauge);
    return gauge;
  }

  // Create a histogram metric
  histogram(
    name: string,
    buckets: number[],
    description?: string,
    labels: Record<string, string> = {}
  ): HistogramMetric {
    const key = this.getMetricKey(name, labels);
    const existing = this.metrics.get(key);

    if (existing && existing.type === "histogram") {
      return existing as HistogramMetric;
    }

    const histogram: HistogramMetric = {
      name,
      type: "histogram",
      value: 0,
      buckets: [...buckets].sort((a, b) => a - b),
      labels: { ...this.defaultLabels, ...labels },
      timestamp: Date.now(),
      description,
    };

    this.metrics.set(key, histogram);
    return histogram;
  }

  // Increment counter
  inc(
    name: string,
    value: number = 1,
    labels: Record<string, string> = {}
  ): void {
    const counter = this.counter(name, undefined, labels);
    counter.value += value;
    counter.timestamp = Date.now();
  }

  // Decrement counter
  dec(
    name: string,
    value: number = 1,
    labels: Record<string, string> = {}
  ): void {
    const counter = this.counter(name, undefined, labels);
    counter.value -= value;
    counter.timestamp = Date.now();
  }

  // Set gauge value
  set(name: string, value: number, labels: Record<string, string> = {}): void {
    const gauge = this.gauge(name, undefined, labels);
    gauge.value = value;
    gauge.timestamp = Date.now();
  }

  // Add to gauge value
  add(name: string, value: number, labels: Record<string, string> = {}): void {
    const gauge = this.gauge(name, undefined, labels);
    gauge.value += value;
    gauge.timestamp = Date.now();
  }

  // Observe histogram value
  observe(
    name: string,
    value: number,
    labels: Record<string, string> = {}
  ): void {
    const histogram = this.histogram(
      name,
      [0.1, 0.5, 1, 2, 5],
      undefined,
      labels
    );
    histogram.value = value;
    histogram.timestamp = Date.now();
  }

  // Record timing (convenience method for histograms)
  timing(
    name: string,
    duration: number,
    labels: Record<string, string> = {}
  ): void {
    this.observe(name, duration, labels);
  }

  // Get all metrics
  getMetrics(): Metric[] {
    return Array.from(this.metrics.values());
  }

  // Get metrics as JSON
  toJSON(): any {
    return {
      metrics: this.getMetrics(),
      timestamp: Date.now(),
    };
  }

  // Reset all metrics
  reset(): void {
    this.metrics.clear();
  }

  // Reset specific metric
  resetMetric(name: string, labels: Record<string, string> = {}): void {
    const key = this.getMetricKey(name, labels);
    this.metrics.delete(key);
  }

  // Get metric by name and labels
  getMetric(
    name: string,
    labels: Record<string, string> = {}
  ): Metric | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key);
  }

  // Private helper methods
  private getMetricKey(name: string, labels: Record<string, string>): string {
    const labelString = Object.entries({ ...this.defaultLabels, ...labels })
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join(",");
    return `${name}{${labelString}}`;
  }
}

// Predefined metrics for common use cases
export class ApplicationMetrics {
  public collector: MetricsCollector;

  constructor() {
    this.collector = new MetricsCollector({
      service: "medipole-app",
      version: process.env.APP_VERSION || "1.0.0",
    });

    // Initialize common metrics
    this.initializeCommonMetrics();
  }

  private initializeCommonMetrics(): void {
    // HTTP metrics
    this.collector.counter("http_requests_total", "Total HTTP requests");
    this.collector.histogram(
      "http_request_duration_seconds",
      [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      "HTTP request duration in seconds"
    );
    this.collector.gauge("http_requests_active", "Active HTTP requests");

    // Database metrics
    this.collector.counter("db_queries_total", "Total database queries");
    this.collector.histogram(
      "db_query_duration_seconds",
      [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      "Database query duration in seconds"
    );
    this.collector.gauge(
      "db_connections_active",
      "Active database connections"
    );

    // Error metrics
    this.collector.counter("errors_total", "Total application errors");
    this.collector.counter("http_errors_total", "Total HTTP errors");

    // Business metrics
    this.collector.counter(
      "users_registered_total",
      "Total user registrations"
    );
    this.collector.counter("emails_sent_total", "Total emails sent");
    this.collector.gauge("active_users", "Currently active users");
    this.collector.gauge("pending_requests", "Pending requests count");

    // System metrics
    this.collector.gauge("memory_usage_bytes", "Current memory usage in bytes");
    this.collector.gauge("cpu_usage_percent", "Current CPU usage percentage");
  }

  // HTTP request tracking
  trackHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number
  ): void {
    const labels = {
      method,
      path,
      status_code: statusCode.toString(),
    };

    this.collector.inc("http_requests_total", 1, labels);
    this.collector.timing(
      "http_request_duration_seconds",
      duration / 1000,
      labels
    );

    if (statusCode >= 400) {
      this.collector.inc("http_errors_total", 1, labels);
    }
  }

  // Database query tracking
  trackDatabaseQuery(operation: string, table: string, duration: number): void {
    const labels = { operation, table };
    this.collector.inc("db_queries_total", 1, labels);
    this.collector.timing("db_query_duration_seconds", duration / 1000, labels);
  }

  // Error tracking
  trackError(errorType: string, component: string): void {
    const labels = { error_type: errorType, component };
    this.collector.inc("errors_total", 1, labels);
  }

  // Business metrics
  trackUserRegistration(): void {
    this.collector.inc("users_registered_total");
  }

  trackEmailSent(): void {
    this.collector.inc("emails_sent_total");
  }

  setActiveUsers(count: number): void {
    this.collector.set("active_users", count);
  }

  setPendingRequests(count: number): void {
    this.collector.set("pending_requests", count);
  }

  // System metrics
  updateSystemMetrics(): void {
    const memoryUsage = process.memoryUsage();
    this.collector.set("memory_usage_bytes", memoryUsage.heapUsed);

    // CPU usage would require additional libraries like pidusage
    // For now, we'll set a placeholder
    this.collector.set("cpu_usage_percent", 0);
  }

  // Get all metrics
  getMetrics(): Metric[] {
    this.updateSystemMetrics();
    return this.collector.getMetrics();
  }

  // Get metrics in Prometheus format
  toPrometheus(): string {
    const metrics = this.getMetrics();
    const lines: string[] = [];

    metrics.forEach((metric) => {
      const labels = metric.labels
        ? `{${Object.entries(metric.labels)
            .map(([key, value]) => `${key}="${value}"`)
            .join(",")}}`
        : "";

      if (metric.description) {
        lines.push(`# HELP ${metric.name} ${metric.description}`);
      }

      lines.push(`# TYPE ${metric.name} ${metric.type}`);
      lines.push(`${metric.name}${labels} ${metric.value}`);
      lines.push("");
    });

    return lines.join("\n");
  }

  // Reset all metrics
  reset(): void {
    this.collector.reset();
    this.initializeCommonMetrics();
  }
}

// Create global metrics instance
export const metrics = new ApplicationMetrics();
