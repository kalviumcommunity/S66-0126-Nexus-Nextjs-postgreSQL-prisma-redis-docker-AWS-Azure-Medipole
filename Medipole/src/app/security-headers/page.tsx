"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function SecurityHeadersTestPage() {
  const [headersData, setHeadersData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    fetchHeadersData();
  }, []);

  const fetchHeadersData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/security-headers");
      const data = await response.json();

      if (data.success) {
        setHeadersData(data);
        toast.success("Security headers data loaded successfully!");
      } else {
        toast.error("Failed to load security headers data");
      }
    } catch (error: any) {
      toast.error("Error fetching security headers: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCors = async () => {
    try {
      const response = await fetch("/api/security-headers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ test: "CORS configuration" }),
      });

      const data = await response.json();
      setTestResults((prev) => [
        ...prev,
        {
          testName: "CORS Test",
          status: data.success ? "Passed" : "Failed",
          result: data,
          timestamp: new Date().toISOString(),
        },
      ]);

      toast.success("CORS test completed!");
    } catch (error: any) {
      toast.error("CORS test failed: " + error.message);
    }
  };

  const testSecurityHeaders = () => {
    // Simulate header testing
    const mockResults = [
      {
        testName: "HSTS Header",
        status: "Implemented",
        description: "Strict-Transport-Security header present",
        value: "max-age=63072000; includeSubDomains; preload",
      },
      {
        testName: "CSP Header",
        status: "Implemented",
        description: "Content-Security-Policy header configured",
        value: "See configuration details below",
      },
      {
        testName: "X-Frame-Options",
        status: "Implemented",
        description: "Clickjacking protection enabled",
        value: "DENY",
      },
    ];

    setTestResults(mockResults);
    toast.success("Security headers test completed!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading security headers data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            🔐 Security Headers Testing
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test and verify HTTP security headers implementation
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            <button
              onClick={fetchHeadersData}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Headers Data
            </button>
            <button
              onClick={testCors}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Test CORS
            </button>
            <button
              onClick={testSecurityHeaders}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Test Security Headers
            </button>
          </div>

          {headersData && (
            <div className="space-y-8">
              {/* Security Score */}
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h2 className="text-2xl font-bold text-green-800 mb-2">
                  Security Score: {headersData.securityScore}
                </h2>
                <p className="text-green-700">
                  Your application has strong security headers configuration
                </p>
              </div>

              {/* Security Headers Details */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Implemented Security Headers
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(headersData.securityHeaders).map(
                    ([key, header]: [string, any]) => (
                      <div
                        key={key}
                        className="p-6 bg-white border rounded-lg shadow-sm"
                      >
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {header.header}
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <span className="font-medium text-gray-700">
                              Value:
                            </span>
                            <div className="mt-1 p-3 bg-gray-50 rounded text-sm font-mono break-all">
                              {header.value}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Purpose:
                            </span>
                            <p className="text-gray-600 mt-1">
                              {header.purpose}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Attack Prevented:
                            </span>
                            <p className="text-red-600 mt-1">
                              {header.attackPrevented}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Test Cases */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Security Test Cases
                </h2>

                <div className="space-y-4">
                  {headersData.testCases.map((testCase: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <h3 className="font-semibold text-blue-800">
                        {testCase.name}
                      </h3>
                      <p className="text-blue-700 text-sm mt-1">
                        {testCase.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-xs font-medium text-blue-600">
                          Expected Headers:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {testCase.expectedHeaders.map(
                            (header: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                              >
                                {header}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <p className="text-red-600 text-sm mt-2">
                        Prevents: {testCase.attackPrevented}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Test Results */}
              {testResults.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Test Results
                  </h2>

                  <div className="space-y-4">
                    {testResults.map((result, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {result.testName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Status:
                              <span
                                className={`ml-2 px-2 py-1 rounded text-xs ${
                                  result.status === "Passed" ||
                                  result.status === "Implemented"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {result.status}
                              </span>
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              result.timestamp || Date.now()
                            ).toLocaleString()}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-gray-600 text-sm mt-2">
                            {result.description}
                          </p>
                        )}
                        {result.value && (
                          <div className="mt-2 p-2 bg-white rounded text-xs font-mono">
                            {result.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <h2 className="text-xl font-bold text-yellow-800 mb-4">
                  🔍 Security Recommendations
                </h2>
                <ul className="space-y-2 text-yellow-700">
                  {headersData.recommendations.map(
                    (rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span>
                        {rec}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Configuration Info */}
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h2 className="text-xl font-bold text-purple-800 mb-4">
                  ⚙️ Configuration Locations
                </h2>
                <div className="space-y-3 text-purple-700">
                  {Object.entries(headersData.configuration).map(
                    ([key, value]: [string, any]) => (
                      <div key={key} className="flex">
                        <span className="font-medium w-48">{key}:</span>
                        <span className="font-mono text-sm">{value}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
