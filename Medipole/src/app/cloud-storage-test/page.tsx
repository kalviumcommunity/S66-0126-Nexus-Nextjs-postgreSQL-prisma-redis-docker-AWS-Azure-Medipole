"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import FileUpload from "@/components/FileUpload";

export default function CloudStorageTestPage() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { url: string; name: string; timestamp: string }[]
  >([]);

  const handleUploadComplete = (fileUrl: string, fileName: string) => {
    const newFile = {
      url: fileUrl,
      name: fileName,
      timestamp: new Date().toISOString(),
    };

    setUploadedFiles((prev) => [...prev, newFile]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            ☁️ Cloud Storage Integration Test
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Test AWS S3 file upload with presigned URLs
          </p>

          {/* Upload Section */}
          <div className="mb-12 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              File Upload Test
            </h2>
            <p className="text-gray-600 mb-6">
              Upload images to test the cloud storage integration. Files are
              uploaded directly to AWS S3 using presigned URLs.
            </p>

            <FileUpload
              onUploadComplete={handleUploadComplete}
              allowedTypes={[
                "image/png",
                "image/jpeg",
                "image/jpg",
                "image/gif",
              ]}
              maxSize={10}
              className="mb-6"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Features:</h3>
                <ul className="space-y-1">
                  <li>• Presigned URL generation</li>
                  <li>• Direct S3 upload</li>
                  <li>• File type validation</li>
                  <li>• Size limit enforcement</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Security:</h3>
                <ul className="space-y-1">
                  <li>• Temporary upload URLs</li>
                  <li>• Server-side validation</li>
                  <li>• IAM role restrictions</li>
                  <li>• Private bucket access</li>
                  <li>• Secure credential handling</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Uploaded Files Section */}
          {uploadedFiles.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                📁 Uploaded Files ({uploadedFiles.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(file.timestamp).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="mb-3">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cpath d='M12 18v-6'%3E%3C/path%3E%3Cpath d='M9 15h6'%3E%3C/path%3E%3C/svg%3E";
                          }}
                        />
                      </div>

                      <div className="flex space-x-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 text-center text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View File
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(file.url);
                            toast.success("URL copied to clipboard!");
                          }}
                          className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuration Info */}
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ⚙️ Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">AWS S3 Setup</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create S3 bucket with private access</li>
                  <li>• Configure IAM user with minimal permissions</li>
                  <li>• Set up environment variables</li>
                  <li>• Enable bucket versioning (optional)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Security Features
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Presigned URLs expire after 60 seconds</li>
                  <li>• File type and size validation</li>
                  <li>• No direct client access to credentials</li>
                  <li>• Server-side request validation</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">
                Environment Variables Required:
              </h3>
              <div className="text-sm text-yellow-700 font-mono bg-white p-3 rounded">
                AWS_ACCESS_KEY_ID=
                <br />
                AWS_SECRET_ACCESS_KEY=
                <br />
                AWS_REGION=us-east-1
                <br />
                AWS_BUCKET_NAME=kalvium-app-storage
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
