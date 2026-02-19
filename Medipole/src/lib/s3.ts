import AWS from "aws-sdk";

// Configure AWS SDK
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

/**
 * Generate presigned URL for file upload
 * @param fileName - Name of the file to upload
 * @param fileType - MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 60)
 * @returns Presigned URL for upload
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  fileType: string,
  expiresIn: number = 60
): Promise<string> {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Expires: expiresIn,
    ContentType: fileType,
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl("putObject", params, (err, url) => {
      if (err) {
        reject(new Error(`Failed to generate presigned URL: ${err.message}`));
      } else {
        resolve(url);
      }
    });
  });
}

/**
 * Generate presigned URL for file download
 * @param fileName - Name of the file to download
 * @param expiresIn - URL expiration time in seconds (default: 3600)
 * @returns Presigned URL for download
 */
export async function generatePresignedDownloadUrl(
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Expires: expiresIn,
  };

  return new Promise((resolve, reject) => {
    s3.getSignedUrl("getObject", params, (err, url) => {
      if (err) {
        reject(new Error(`Failed to generate download URL: ${err.message}`));
      } else {
        resolve(url);
      }
    });
  });
}

/**
 * Upload file directly from server (alternative method)
 * @param fileName - Name of the file
 * @param fileBuffer - File buffer
 * @param fileType - MIME type
 * @returns Upload result
 */
export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  fileType: string
): Promise<AWS.S3.ManagedUpload.SendData> {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    Body: fileBuffer,
    ContentType: fileType,
  };

  return s3.upload(params).promise();
}

/**
 * Delete file from S3
 * @param fileName - Name of the file to delete
 * @returns Deletion result
 */
export async function deleteFile(fileName: string): Promise<any> {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
  };

  return s3.deleteObject(params).promise();
}

/**
 * List files in bucket
 * @param prefix - Optional prefix to filter files
 * @returns List of files
 */
export async function listFiles(prefix?: string): Promise<AWS.S3.Object[]> {
  const params: AWS.S3.ListObjectsV2Request = {
    Bucket: process.env.AWS_BUCKET_NAME!,
  };

  if (prefix) {
    params.Prefix = prefix;
  }

  const result = await s3.listObjectsV2(params).promise();
  return result.Contents || [];
}

/**
 * Get file metadata
 * @param fileName - Name of the file
 * @returns File metadata
 */
export async function getFileMetadata(
  fileName: string
): Promise<AWS.S3.HeadObjectOutput> {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
  };

  return s3.headObject(params).promise();
}

// Export all utilities
export default {
  generatePresignedUploadUrl,
  generatePresignedDownloadUrl,
  uploadFile,
  deleteFile,
  listFiles,
  getFileMetadata,
};
