"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function DNSSSLTestPage() {
  const [sslInfo, setSslInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState("medipole.com");

  const fetchSSLInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ssl-verification?domain=${domain}`);
      const data = await response.json();
      setSslInfo(data);
      toast.success("SSL information retrieved successfully!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testRedirects = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/ssl-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, action: "test-redirect" }),
      });

      const data = await response.json();
      setTestResults(data);
      toast.success("SSL redirect test completed!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const checkCertificateStatus = () => {
    if (!sslInfo?.sslInfo?.certificate) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-2">
            ❌ No SSL Certificate
          </h3>
          <p className="text-red-600 text-sm">
            SSL certificate is not active. Configure SSL certificate through AWS
            ACM or Azure App Service.
          </p>
        </div>
      );
    }

    const cert = sslInfo.sslInfo.certificate;
    const isValid = new Date(cert.validTo) > new Date();

    return (
      <div
        className={`p-4 border rounded-lg ${isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
      >
        <h3
          className={`font-medium mb-2 ${isValid ? "text-green-800" : "text-red-800"}`}
        >
          {isValid ? "✅ SSL Certificate Active" : "❌ SSL Certificate Expired"}
        </h3>
        <div className="text-sm space-y-1">
          <div>
            <span className="font-medium">Issuer:</span> {cert.issuer}
          </div>
          <div>
            <span className="font-medium">Subject:</span> {cert.subject}
          </div>
          <div>
            <span className="font-medium">Valid From:</span>{" "}
            {new Date(cert.validFrom).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Valid To:</span>{" "}
            {new Date(cert.validTo).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Serial Number:</span>{" "}
            {cert.serialNumber}
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    fetchSSLInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            🔐 DNS & SSL Configuration Test
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test domain configuration, SSL certificate status, and HTTPS
            enforcement
          </p>

          {/* Domain Configuration */}
          <div className="mb-12 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Domain Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Current Domain
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter domain name"
                  />
                  <button
                    onClick={fetchSSLInfo}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? "Checking..." : "Check"}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Platform Options
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>AWS Route 53 + ACM</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span>Azure DNS + App Service Certificate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SSL Status Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                SSL Certificate Status
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchSSLInfo}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Refresh SSL Info
                </button>
              </div>
            </div>

            {sslInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-medium text-gray-700 mb-4">
                    Connection Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Protocol:</span>
                      <span
                        className={`font-medium ${sslInfo.sslInfo.protocol === "https" ? "text-green-600" : "text-red-600"}`}
                      >
                        {sslInfo.sslInfo.protocol.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Host:</span>
                      <span className="font-medium text-gray-600">
                        {sslInfo.sslInfo.host}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span
                        className={`font-medium ${sslInfo.sslInfo.status === "active" ? "text-green-600" : "text-red-600"}`}
                      >
                        {sslInfo.sslInfo.status === "active"
                          ? "✅ Active"
                          : "❌ Inactive"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redirect:</span>
                      <span className="font-medium text-gray-600">
                        {sslInfo.sslInfo.redirectStatus}
                      </span>
                    </div>
                  </div>
                </div>

                <div>{checkCertificateStatus()}</div>
              </div>
            )}
          </div>

          {/* Redirect Testing */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                HTTPS Redirect Testing
              </h2>
              <button
                onClick={testRedirects}
                disabled={isLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Testing..." : "Run Tests"}
              </button>
            </div>

            {testResults && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-700 mb-4">Test Results</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span>HTTP to HTTPS Redirect</span>
                    <span
                      className={
                        testResults.testResults.httpToHttps.status === "success"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {testResults.testResults.httpToHttps.status === "success"
                        ? "✅ Success"
                        : "❌ Failed"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded border">
                    <span>HSTS Header</span>
                    <span
                      className={
                        testResults.testResults.hsts.status === "configured"
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {testResults.testResults.hsts.status === "configured"
                        ? "✅ Configured"
                        : "❌ Missing"}
                    </span>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span>Security Headers</span>
                      <span
                        className={
                          testResults.testResults.securityHeaders.status ===
                          "active"
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {testResults.testResults.securityHeaders.status ===
                        "active"
                          ? "✅ Active"
                          : "❌ Inactive"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {testResults.testResults.securityHeaders.headers.map(
                        (header: string, index: number) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {header}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Guide */}
          <div className="p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📋 Configuration Guide
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  AWS Route 53 + ACM Setup
                </h3>
                <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                  <li>Register domain in Route 53</li>
                  <li>Create Hosted Zone for your domain</li>
                  <li>Request SSL certificate in ACM</li>
                  <li>Validate certificate via DNS</li>
                  <li>Attach certificate to Load Balancer</li>
                  <li>Configure A/CNAME records</li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Azure DNS + App Service Setup
                </h3>
                <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                  <li>Register domain or use existing</li>
                  <li>Create DNS Zone in Azure DNS</li>
                  <li>Create App Service Managed Certificate</li>
                  <li>Add custom domain to App Service</li>
                  <li>Bind SSL certificate</li>
                  <li>Enable HTTPS Only setting</li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Required DNS Records:
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div>
                  <strong>A Record:</strong> Points to Load Balancer IP or App
                  Service
                </div>
                <div>
                  <strong>CNAME Record:</strong> www subdomain pointing to root
                  domain
                </div>
                <div>
                  <strong>ACM Validation:</strong> CNAME records for SSL
                  certificate validation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
