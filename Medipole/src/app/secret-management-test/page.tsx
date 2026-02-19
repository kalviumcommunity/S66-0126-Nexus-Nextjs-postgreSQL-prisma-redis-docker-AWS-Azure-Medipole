"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

export default function SecretManagementTestPage() {
  const [secretsInfo, setSecretsInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testKeys, setTestKeys] = useState([
    "DATABASE_URL",
    "JWT_SECRET",
    "AWS_ACCESS_KEY_ID",
    "SENDGRID_API_KEY",
  ]);

  const fetchSecretsInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/secrets");
      const data = await response.json();
      setSecretsInfo(data);
      toast.success("Secrets info retrieved successfully!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSecretRetrieval = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/secrets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testKeys }),
      });

      const data = await response.json();
      setTestResults(data);
      toast.success("Secret retrieval test completed!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const addTestKey = () => {
    const newKey = prompt("Enter secret key to test:");
    if (newKey && !testKeys.includes(newKey)) {
      setTestKeys([...testKeys, newKey]);
    }
  };

  const removeTestKey = (keyToRemove: string) => {
    setTestKeys(testKeys.filter((key) => key !== keyToRemove));
  };

  useEffect(() => {
    fetchSecretsInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            🔐 Secret Management Test
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test secure secret retrieval from AWS Secrets Manager or Azure Key
            Vault
          </p>

          {/* Current Configuration */}
          <div className="mb-12 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Current Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Environment Detection
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>AWS Secrets Manager:</span>
                    <span
                      className={
                        process.env.SECRET_ARN
                          ? "text-green-600 font-medium"
                          : "text-red-600"
                      }
                    >
                      {process.env.SECRET_ARN ? "Configured" : "Not configured"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Azure Key Vault:</span>
                    <span
                      className={
                        process.env.KEYVAULT_NAME
                          ? "text-green-600 font-medium"
                          : "text-red-600"
                      }
                    >
                      {process.env.KEYVAULT_NAME
                        ? "Configured"
                        : "Not configured"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fallback:</span>
                    <span className="text-yellow-600 font-medium">
                      Environment Variables
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Required Environment Variables
                </h3>
                <div className="text-sm space-y-1 font-mono bg-white p-3 rounded border">
                  <div>SECRET_ARN=arn:aws:secretsmanager:...</div>
                  <div>KEYVAULT_NAME=kv-nextjs-app</div>
                  <div>AWS_REGION=us-east-1</div>
                </div>
              </div>
            </div>
          </div>

          {/* Secrets Info Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Secrets Information
              </h2>
              <button
                onClick={fetchSecretsInfo}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Loading..." : "Refresh Info"}
              </button>
            </div>

            {secretsInfo && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Provider</h3>
                    <p className="text-lg font-semibold text-blue-600">
                      {secretsInfo.provider}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Secret Count
                    </h3>
                    <p className="text-lg font-semibold text-green-600">
                      {secretsInfo.count} secrets
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Available Keys
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {secretsInfo.secretKeys?.map(
                        (key: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {key}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-700 mb-2">
                      Retrieved At
                    </h3>
                    <p className="text-gray-600">
                      {new Date(secretsInfo.retrievedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Test Keys Section */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Test Secret Retrieval
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={addTestKey}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Add Key
                </button>
                <button
                  onClick={testSecretRetrieval}
                  disabled={isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Testing..." : "Run Test"}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium text-gray-700 mb-3">Test Keys:</h3>
              <div className="flex flex-wrap gap-2">
                {testKeys.map((key, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <span className="text-sm mr-2">{key}</span>
                    <button
                      onClick={() => removeTestKey(key)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {testResults && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-medium text-gray-700 mb-4">Test Results</h3>
                <div className="space-y-4">
                  {Object.entries(testResults.results || {}).map(
                    ([key, result]: [string, any]) => (
                      <div key={key} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-800">
                            {key}
                          </span>
                          <span
                            className={
                              result.found ? "text-green-600" : "text-red-600"
                            }
                          >
                            {result.found ? "✅ Found" : "❌ Not Found"}
                          </span>
                        </div>
                        {result.found && (
                          <div className="text-sm text-gray-600">
                            <div>Length: {result.length} characters</div>
                            <div>Sample: {result.sample}</div>
                          </div>
                        )}
                        {result.error && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Security Best Practices */}
          <div className="p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🔒 Security Best Practices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  IAM Configuration
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use least-privilege roles</li>
                  <li>• Enable automatic key rotation</li>
                  <li>• Implement audit logging</li>
                  <li>• Regular access review</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Application Security
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Never log secret values</li>
                  <li>• Use environment-specific secrets</li>
                  <li>• Implement proper error handling</li>
                  <li>• Regular security testing</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Recommended Setup:
              </h3>
              <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                <li>Create secret in AWS Secrets Manager or Azure Key Vault</li>
                <li>Configure IAM permissions with minimal access</li>
                <li>Set environment variables (SECRET_ARN or KEYVAULT_NAME)</li>
                <li>Test secret retrieval in this interface</li>
                <li>Verify fallback to environment variables works</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
