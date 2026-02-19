'use client';

import { useEffect, useState } from 'react';

export default function DocsPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then(res => res.json())
      .then(data => setSpec(data))
      .catch(err => console.error('Failed to load API docs:', err));
  }, []);

  if (!spec) {
    return <div className="p-8">Loading API documentation...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Medipole API Documentation</h1>
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">API Information</h2>
        <p><strong>Version:</strong> {spec.info.version}</p>
        <p><strong>Title:</strong> {spec.info.title}</p>
        <p><strong>Description:</strong> {spec.info.description}</p>
        <p><strong>Base URL:</strong> {spec.servers?.[0]?.url || 'Not specified'}</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Authentication</h2>
        <p>This API uses JWT Bearer token authentication. Include the token in the Authorization header:</p>
        <code className="bg-gray-200 p-2 rounded block mt-2">
          Authorization: Bearer {'<your-jwt-token>'}
        </code>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Endpoints</h2>
        {Object.entries(spec.paths || {}).map(([path, methods]) => (
          <div key={path} className="border rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">{path}</h3>
            {Object.entries(methods).map(([method, details]: [string, any]) => (
              <div key={method} className="mb-3">
                <span className={`inline-block px-2 py-1 rounded text-sm font-bold mr-2 ${
                  method === 'get' ? 'bg-green-100 text-green-800' :
                  method === 'post' ? 'bg-blue-100 text-blue-800' :
                  method === 'put' ? 'bg-yellow-100 text-yellow-800' :
                  method === 'delete' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {method.toUpperCase()}
                </span>
                <span className="font-semibold">{details.summary}</span>
                {details.description && (
                  <p className="text-gray-600 mt-1">{details.description}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Raw OpenAPI Specification</h2>
        <details>
          <summary className="cursor-pointer">Click to view JSON specification</summary>
          <pre className="mt-4 p-4 bg-white rounded overflow-auto max-h-96 text-sm">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}