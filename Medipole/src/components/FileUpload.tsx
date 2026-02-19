"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";

interface FileUploadProps {
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  allowedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
}

export default function FileUpload({
  onUploadComplete,
  allowedTypes = ["image/png", "image/jpeg", "image/jpg"],
  maxSize = 5,
  className = "",
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
      );
      return false;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`File too large. Maximum size: ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${timestamp}-${file.name.replace(
        /\s+/g,
        "-"
      )}.${fileExtension}`;

      // Get presigned URL
      const response = await fetch(
        `/api/upload-url?fileName=${encodeURIComponent(
          fileName
        )}&fileType=${encodeURIComponent(file.type)}&action=upload`
      );

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get upload URL");
      }

      // Upload file using presigned URL
      const uploadResponse = await fetch(data.url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      // Generate download URL for the uploaded file
      const downloadResponse = await fetch(
        `/api/upload-url?fileName=${encodeURIComponent(fileName)}&action=download`
      );

      const downloadData = await downloadResponse.json();

      if (downloadData.success) {
        toast.success("File uploaded successfully!");
        onUploadComplete?.(downloadData.url, fileName);
      } else {
        throw new Error("Failed to generate download URL");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowedTypes.join(",")}
        className="hidden"
      />

      <button
        onClick={triggerFileSelect}
        disabled={isUploading}
        className={`w-full px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 transition-colors ${
          isUploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <span className="text-blue-600 font-medium">Uploading...</span>
            {uploadProgress > 0 && (
              <span className="text-sm text-gray-500 mt-1">
                {uploadProgress}%
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-gray-600 font-medium">
              Click to upload file
            </span>
            <span className="text-sm text-gray-500 mt-1">
              {allowedTypes
                .map((type) => type.split("/")[1].toUpperCase())
                .join(", ")}{" "}
              up to {maxSize}MB
            </span>
          </div>
        )}
      </button>

      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
