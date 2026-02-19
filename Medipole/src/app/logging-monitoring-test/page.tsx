"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function LoggingMonitoringTestPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logLevel, setLogLevel] = useState("info");
  const [testMessage, setTestMessage] = useState("Test log message");

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/metrics");
      const data = await response.json();
      setMetrics(data);
      toast.success("Metrics fetched successfully!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testLogging = async () => {
    try {
      // This would typically be done on the server side
      // For demo purposes, we'll simulate different log levels
      const logData = {
        level: logLevel,
        message: testMessage,
        timestamp: new Date().toISOString(),
        component: "frontend-test",
        userId: "test-user-123",
      };

      console.log(`[${logLevel.toUpperCase()}]`, logData);
      toast.success(`Logged message at ${logLevel} level`);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const resetMetrics = async () => {
    try {
      const response = await fetch("/api/metrics", { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        toast.success("Metrics reset successfully!");
        fetchMetrics(); // Refresh metrics
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const updateMetric = async (
    action: string,
    metric: string,
    value: number
  ) => {
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, metric, value }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Metric ${action} successful!`);
        fetchMetrics(); // Refresh metrics
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            📊 Logging & Monitoring Test
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test application logging, metrics collection, and monitoring
            capabilities
          </p>

          {/* Logging Test Section */}
          <div className="mb-12 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Application Logging Test
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Log Configuration
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Log Level
                    </label>
                    <select
                      value={logLevel}
                      onChange={(e) => setLogLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="debug">Debug</option>
                      <option value="info">Info</option>
                      <option value="warn">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Message
                    </label>
                    <input
                      type="text"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter test message"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Log Structure
                </h3>
                <div className="text-sm bg-white p-4 rounded border font-mono">
                  <div>{`{`}</div>
                  <div className="ml-4">
                    "timestamp": "2024-01-01T00:00:00.000Z",
                  </div>
                  <div className="ml-4">"level": "{logLevel}",</div>
                  <div className="ml-4">"message": "{testMessage}",</div>
                  <div className="ml-4">"requestId": "uuid-here",</div>
                  <div className="ml-4">"component": "api-handler"</div>
                  <div>{`}`}</div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={testLogging}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Test Logging
              </button>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Application Metrics
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchMetrics}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Loading..." : "Refresh Metrics"}
                </button>
                <button
                  onClick={resetMetrics}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Reset Metrics
                </button>
              </div>
            </div>

            {metrics && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Total Metrics
                    </h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {metrics.metrics?.length || 0}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-700 mb-2">Format</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {metrics.format?.toUpperCase()}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Last Updated
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(metrics.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-gray-700">Metric Details</h3>
                  <div className="max-h-96 overflow-y-auto">
                    {metrics.metrics?.map((metric: any, index: number) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded border mb-2"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-gray-800">
                                {metric.name}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {metric.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {metric.description || "No description"}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              {metric.value}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {metric.type === "counter" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateMetric("increment", metric.name, 1)
                                  }
                                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded hover:bg-green-200"
                                >
                                  +1
                                </button>
                                <button
                                  onClick={() =>
                                    updateMetric("decrement", metric.name, 1)
                                  }
                                  className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded hover:bg-red-200"
                                >
                                  -1
                                </button>
                              </>
                            )}
                            {metric.type === "gauge" && (
                              <button
                                onClick={() =>
                                  updateMetric(
                                    "set",
                                    metric.name,
                                    Math.floor(Math.random() * 100)
                                  )
                                }
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded hover:bg-blue-200"
                              >
                                Random
                              </button>
                            )}
                          </div>
                        </div>
                        {metric.labels && (
                          <div className="mt-2 text-xs text-gray-500">
                            Labels: {JSON.stringify(metric.labels)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Monitoring Configuration */}
          <div className="p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🛠️ Monitoring Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Cloud Platform Setup
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>AWS CloudWatch Logs + Metrics</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Azure Monitor + Application Insights</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                    <span>Prometheus + Grafana (Self-hosted)</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Key Metrics Tracked
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HTTP request count and duration</li>
                  <li>• Database query performance</li>
                  <li>• Error rates and types</li>
                  <li>• System resource utilization</li>
                  <li>• Business metrics (users, emails, etc.)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Alert Thresholds:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">High CPU:</span> &gt; 80%
                </div>
                <div>
                  <span className="font-medium">Error Rate:</span> &gt; 5%
                </div>
                <div>
                  <span className="font-medium">Response Time:</span> &gt; 2s
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
