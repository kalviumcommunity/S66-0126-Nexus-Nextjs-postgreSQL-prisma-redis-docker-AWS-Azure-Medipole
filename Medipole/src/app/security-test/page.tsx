"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

interface SecurityTestResult {
  originalInput: string;
  sanitizedInput: string;
  xssDetected: boolean;
  sanitizationResult: string;
  displaySafe: string;
  securityStatus: string;
  sanitizedBody?: {
    name?: string;
    email?: string;
    comment?: string;
  };
}

export default function SecurityTestPage() {
  const [testInput, setTestInput] = useState("");
  const [results, setResults] = useState<SecurityTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Example malicious inputs for testing
  const testCases = [
    '<script>alert("XSS Attack!")</script>',
    "' OR 1=1 --",
    '<img src="x" onerror="alert(1)">',
    "Normal text <b>with HTML</b>",
    '<a href="javascript:alert(1)">Click me</a>',
  ];

  const runSecurityTests = async () => {
    setIsTesting(true);

    try {
      const response = await fetch("/api/security-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testData: testInput || testCases[0],
          name: "Test User <script>alert('xss')</script>",
          email: "test@example.com' OR '1'='1",
          comment: "<p>Hello <script>dangerous()</script> World!</p>",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data);
        toast.success("Security tests completed successfully!");
      } else {
        toast.error("Security test failed: " + data.message);
      }
    } catch (error: any) {
      toast.error("Error running security tests: " + error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const loadTestCase = (testCase: string) => {
    setTestInput(testCase);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            OWASP Security Testing
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test XSS and SQL Injection Prevention
          </p>

          {/* Test Input Section */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Test Input Sanitization
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter test input (try malicious code):
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Try entering: <script>alert('XSS')</script>"
              />
            </div>

            {/* Predefined test cases */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or try these examples:
              </label>
              <div className="flex flex-wrap gap-2">
                {testCases.map((testCase, index) => (
                  <button
                    key={index}
                    onClick={() => loadTestCase(testCase)}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                  >
                    Test {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={runSecurityTests}
              disabled={isTesting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors"
            >
              {isTesting ? "Testing..." : "Run Security Tests"}
            </button>
          </div>

          {/* Results Section */}
          {results && (
            <div className="space-y-6">
              <div className="p-6 bg-green-50 rounded-lg">
                <h2 className="text-xl font-semibold text-green-800 mb-4">
                  🛡️ Security Test Results
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Original Input:
                    </h3>
                    <div className="p-3 bg-white border rounded">
                      <code className="text-sm break-all">
                        {results.originalInput}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Sanitized Output:
                    </h3>
                    <div className="p-3 bg-white border rounded">
                      <code className="text-sm break-all">
                        {results.sanitizedInput}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-medium text-gray-700 mb-2">
                    Safe for Display:
                  </h3>
                  <div className="p-3 bg-white border rounded">
                    <div
                      dangerouslySetInnerHTML={{ __html: results.displaySafe }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-medium text-yellow-800 mb-2">
                    Security Status:
                  </h3>
                  <p
                    className={`font-semibold ${results.securityStatus.includes("Protected") ? "text-green-600" : "text-red-600"}`}
                  >
                    {results.securityStatus}
                  </p>
                </div>
              </div>

              {/* API Input Sanitization Results */}
              <div className="p-6 bg-purple-50 rounded-lg">
                <h2 className="text-xl font-semibold text-purple-800 mb-4">
                  📝 API Input Sanitization
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Name:</span>
                    <span className="ml-2 text-sm bg-white px-2 py-1 rounded">
                      {results.sanitizedBody?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <span className="ml-2 text-sm bg-white px-2 py-1 rounded">
                      {results.sanitizedBody?.email || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Comment:</span>
                    <div className="mt-1 text-sm bg-white p-2 rounded border">
                      {results.sanitizedBody?.comment || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Information */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔒 Security Measures Implemented
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  XSS Prevention
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• HTML tag removal and escaping</li>
                  <li>• Attribute sanitization</li>
                  <li>• Event handler removal</li>
                  <li>• Safe HTML display filtering</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  SQL Injection Prevention
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Input sanitization</li>
                  <li>• Parameterized queries</li>
                  <li>• Quote escaping</li>
                  <li>• Security logging</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Best Practices</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Never trust user input</li>
                <li>• Always sanitize before storing</li>
                <li>• Encode before rendering</li>
                <li>• Use parameterized queries</li>
                <li>• Implement security logging</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
