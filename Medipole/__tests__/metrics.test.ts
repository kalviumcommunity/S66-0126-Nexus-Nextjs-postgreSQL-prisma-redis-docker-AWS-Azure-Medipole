import { metrics, MetricsCollector, ApplicationMetrics } from "@/lib/metrics";

describe("Metrics Utility", () => {
  beforeEach(() => {
    // Reset metrics before each test
    metrics.reset();
  });

  it("should create and track counter metrics", () => {
    const counter = metrics.collector.counter("test_counter");
    expect(counter.value).toBe(0);

    metrics.collector.inc("test_counter");
    expect(counter.value).toBe(1);

    metrics.collector.inc("test_counter", 5);
    expect(counter.value).toBe(6);

    metrics.collector.dec("test_counter", 2);
    expect(counter.value).toBe(4);
  });

  it("should create and track gauge metrics", () => {
    const gauge = metrics.collector.gauge("test_gauge");
    expect(gauge.value).toBe(0);

    metrics.collector.set("test_gauge", 42);
    expect(gauge.value).toBe(42);

    metrics.collector.add("test_gauge", 8);
    expect(gauge.value).toBe(50);
  });

  it("should create and track histogram metrics", () => {
    const histogram = metrics.collector.histogram(
      "test_histogram",
      [0.1, 0.5, 1]
    );
    expect(histogram.value).toBe(0);

    metrics.collector.observe("test_histogram", 0.75);
    expect(histogram.value).toBe(0.75);
  });

  it("should track HTTP request metrics", () => {
    const initialCount = metrics.getMetrics().length;

    metrics.trackHttpRequest("GET", "/api/test", 200, 150);

    const metricsList = metrics.getMetrics();
    expect(metricsList.length).toBeGreaterThan(initialCount);

    // Check if an HTTP request metric was created
    const httpRequestMetric = metricsList.find((m) => m.name.includes("http"));
    expect(httpRequestMetric).toBeDefined();
  });

  it("should track database query metrics", () => {
    metrics.trackDatabaseQuery("SELECT", "users", 120);

    const metricsList = metrics.getMetrics();
    const dbMetric = metricsList.some((m) => m.name.includes("db"));
    expect(dbMetric).toBeTruthy();
  });

  it("should track error metrics", () => {
    metrics.trackError("validation_error", "api_handler");

    const metricsList = metrics.getMetrics();
    const errorMetric = metricsList.some((m) => m.name.includes("error"));
    expect(errorMetric).toBeTruthy();
  });

  it("should track business metrics", () => {
    metrics.trackUserRegistration();
    metrics.trackEmailSent();

    const metricsList = metrics.getMetrics();
    const userRegMetric = metricsList.some((m) =>
      m.name.includes("users_registered")
    );
    const emailMetric = metricsList.some((m) => m.name.includes("emails_sent"));

    expect(userRegMetric).toBeTruthy();
    expect(emailMetric).toBeTruthy();
  });

  it("should update system metrics", () => {
    metrics.updateSystemMetrics();

    const metricsList = metrics.getMetrics();
    const memoryMetric = metricsList.some((m) =>
      m.name.includes("memory_usage")
    );
    const cpuMetric = metricsList.some((m) => m.name.includes("cpu_usage"));

    // Memory metric should exist, CPU might not depending on system
    expect(memoryMetric).toBeTruthy();
  });

  it("should get metrics in JSON format", () => {
    metrics.collector.inc("test_counter");

    const metricsData = metrics.getMetrics();
    expect(Array.isArray(metricsData)).toBe(true);
    expect(metricsData.length).toBeGreaterThan(0);

    const counterMetric = metricsData.find((m) => m.name === "test_counter");
    expect(counterMetric).toBeDefined();
    expect(counterMetric!.value).toBe(1);
  });

  it("should get metrics in Prometheus format", () => {
    metrics.collector.inc("test_counter");

    const prometheusData = metrics.toPrometheus();
    expect(typeof prometheusData).toBe("string");
    expect(prometheusData).toContain("test_counter");
    expect(prometheusData).toContain("# TYPE test_counter counter");
  });

  it("should reset all metrics", () => {
    metrics.collector.inc("test_counter", 5);
    expect(metrics.collector.getMetric("test_counter")?.value).toBe(5);

    metrics.reset();
    expect(metrics.collector.getMetric("test_counter")).toBeUndefined();
  });

  it("should reset specific metric", () => {
    metrics.collector.inc("test_counter", 5);
    expect(metrics.collector.getMetric("test_counter")?.value).toBe(5);

    metrics.collector.resetMetric("test_counter");
    expect(metrics.collector.getMetric("test_counter")).toBeUndefined();
  });

  it("should work with custom labels", () => {
    metrics.collector.inc("test_counter", 1, {
      env: "test",
      region: "us-east-1",
    });

    const metric = metrics.collector.getMetric("test_counter", {
      env: "test",
      region: "us-east-1",
    });
    expect(metric).toBeDefined();
    expect(metric?.value).toBe(1);
    expect(metric?.labels).toEqual({
      env: "test",
      region: "us-east-1",
      service: "medipole-app",
      version: "1.0.0",
    });
  });

  it("should create custom MetricsCollector instance", () => {
    const collector = new MetricsCollector({ custom_label: "test" });

    collector.inc("custom_counter");
    const metric = collector.getMetric("custom_counter");

    expect(metric).toBeDefined();
    expect(metric?.value).toBe(1);
    expect(metric?.labels?.custom_label).toBe("test");
  });

  it("should create ApplicationMetrics instance", () => {
    const appMetrics = new ApplicationMetrics();

    appMetrics.trackHttpRequest("POST", "/api/data", 201, 200);

    const metricsList = appMetrics.getMetrics();
    const httpMetric = metricsList.some((m) =>
      m.name.includes("http_requests_total")
    );

    expect(httpMetric).toBeTruthy();
  });

  it("should handle setActiveUsers and setPendingRequests", () => {
    metrics.setActiveUsers(42);
    metrics.setPendingRequests(5);

    const metricsList = metrics.getMetrics();
    const activeUsersMetric = metricsList.find(
      (m) => m.name === "active_users"
    );
    const pendingRequestsMetric = metricsList.find(
      (m) => m.name === "pending_requests"
    );

    expect(activeUsersMetric?.value).toBe(42);
    expect(pendingRequestsMetric?.value).toBe(5);
  });
});
