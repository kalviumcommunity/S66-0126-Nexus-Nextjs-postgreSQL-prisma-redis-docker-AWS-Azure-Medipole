# Cloud Storage Integration Implementation

## Overview

This implementation provides secure cloud storage integration using AWS S3 with presigned URLs for direct client-side uploads. The solution follows security best practices by keeping credentials server-side and using temporary, restricted access URLs.

## Object Storage Basics

### AWS S3 Architecture

- **Bucket**: Container for objects (files)
- **Object**: Individual file with unique key
- **Access**: Public/Private URLs or presigned URLs
- **Security**: IAM roles, bucket policies, and access control

### Key Benefits

- **Scalability**: Automatically scales with your storage needs
- **Durability**: 99.999999999% durability for objects
- **Security**: Fine-grained access control and encryption
- **Performance**: Global CDN integration for fast content delivery

## Implementation Components

### 1. S3 Utility Library (`src/lib/s3.ts`)

Core functionality for AWS S3 operations:

#### Key Functions:

- `generatePresignedUploadUrl()`: Creates temporary upload URLs
- `generatePresignedDownloadUrl()`: Creates temporary download URLs
- `uploadFile()`: Direct server-side file upload
- `deleteFile()`: Remove files from storage
- `listFiles()`: List files in bucket
- `getFileMetadata()`: Get file information

#### Security Features:

- Temporary URL expiration (default: 60 seconds)
- Server-side credential management
- MIME type validation
- IAM role-based permissions

### 2. API Endpoint (`src/app/api/upload-url/route.ts`)

REST API for generating presigned URLs:

#### Endpoints:

- **GET `/api/upload-url`**: Generate presigned URLs
  - Parameters: `fileName`, `fileType`, `action` (upload/download), `expiresIn`
  - Returns: Temporary URL with expiration timestamp

#### Usage Examples:

```bash
# Generate upload URL
GET /api/upload-url?fileName=avatar.jpg&fileType=image/jpeg&action=upload

# Generate download URL
GET /api/upload-url?fileName=avatar.jpg&action=download
```

### 3. File Upload Component (`src/components/FileUpload.tsx`)

Reusable React component for file uploads:

#### Features:

- Drag-and-drop interface
- File type and size validation
- Progress tracking
- Toast notifications
- Customizable allowed types and size limits

#### Props:

```typescript
interface FileUploadProps {
  onUploadComplete?: (fileUrl: string, fileName: string) => void;
  allowedTypes?: string[]; // Default: ['image/png', 'image/jpeg', 'image/jpg']
  maxSize?: number; // Default: 5MB
  className?: string;
}
```

### 4. Test Interface (`src/app/cloud-storage-test/page.tsx`)

Interactive testing page for cloud storage functionality:

#### Features:

- File upload testing
- Uploaded file preview
- URL management (copy/view)
- Configuration documentation
- Security feature showcase

## AWS S3 Setup Guide

### 1. Create S3 Bucket

1. Go to AWS Management Console → S3
2. Click "Create bucket"
3. Configuration:
   - **Bucket name**: `kalvium-app-storage`
   - **Region**: `us-east-1` (or your preferred region)
   - **Block all public access**: Enabled (recommended)
   - **Bucket versioning**: Enabled (optional but recommended)

### 2. Configure IAM Permissions

1. Go to IAM → Users → Create user
2. User name: `storage-uploader`
3. Attach minimal policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::kalvium-app-storage",
        "arn:aws:s3:::kalvium-app-storage/*"
      ]
    }
  ]
}
```

4. Generate Access Key ID and Secret Access Key

### 3. Environment Configuration

Create `.env.local` file:

```env
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
AWS_REGION=us-east-1
AWS_BUCKET_NAME=kalvium-app-storage
```

## Security Implementation

### Presigned URL Flow

1. **Client Request**: Frontend requests upload URL from API
2. **Server Validation**: Backend validates file type/size
3. **URL Generation**: Server generates temporary presigned URL
4. **Direct Upload**: Client uploads directly to S3
5. **Confirmation**: Backend can optionally track successful uploads

### Security Measures

#### Credential Protection

- ✅ No client-side AWS credentials
- ✅ Server-side credential management
- ✅ Environment variable storage
- ✅ IAM role restrictions

#### Access Control

- ✅ Temporary URL expiration (60 seconds)
- ✅ File type validation
- ✅ Size limit enforcement
- ✅ Private bucket configuration

#### Data Protection

- ✅ HTTPS encryption in transit
- ✅ S3 server-side encryption at rest
- ✅ Content-Type validation
- ✅ Secure file naming

## Usage Examples

### Basic File Upload

```typescript
import FileUpload from "@/components/FileUpload";

function MyComponent() {
  const handleUploadComplete = (fileUrl: string, fileName: string) => {
    console.log("File uploaded:", fileUrl);
    // Save URL to database or state
  };

  return (
    <FileUpload
      onUploadComplete={handleUploadComplete}
      allowedTypes={["image/png", "image/jpeg"]}
      maxSize={5}
    />
  );
}
```

### Custom API Integration

```typescript
// Get presigned URL
const response = await fetch(
  `/api/upload-url?fileName=${fileName}&fileType=${fileType}`
);
const { url } = await response.json();

// Upload file
await fetch(url, {
  method: "PUT",
  headers: { "Content-Type": fileType },
  body: file,
});
```

## Testing and Verification

### Local Testing

1. Visit `/cloud-storage-test` to test the implementation
2. Upload various file types to verify validation
3. Check S3 bucket for uploaded files
4. Test download URLs and expiration

### AWS Console Verification

1. Navigate to S3 bucket in AWS Console
2. Verify uploaded files appear
3. Check file metadata and properties
4. Test bucket policies and permissions

## Best Practices Implemented

### 1. Security First

- Minimal privilege IAM policies
- Temporary credential expiration
- Server-side validation
- Private bucket access

### 2. Performance Optimization

- Direct client-to-S3 uploads
- CDN integration readiness
- Efficient file handling
- Progress tracking

### 3. Error Handling

- Comprehensive validation
- User-friendly error messages
- Graceful failure recovery
- Logging and monitoring

### 4. Scalability

- Automatic scaling with S3
- Regional deployment options
- Content delivery optimization
- Cost-effective storage tiers

## Cost Considerations

### AWS S3 Pricing

- **Storage**: ~$0.023/GB/month (Standard tier)
- **Requests**: ~$0.005/1000 requests
- **Data Transfer**: ~$0.09/GB outbound
- **Free Tier**: 5GB storage, 20,000 GET requests, 2,000 PUT requests

### Optimization Strategies

- Implement lifecycle policies for old files
- Use appropriate storage classes (Standard, IA, Glacier)
- Enable request compression
- Monitor and optimize usage patterns

## Future Enhancements

### Planned Features

1. **Azure Blob Storage** support
2. **Google Cloud Storage** integration
3. **File processing** pipeline (resize, optimize)
4. **Content delivery** network integration
5. **Advanced metadata** handling
6. **Batch operations** support

### Advanced Security

- Server-side encryption with customer keys
- Multi-factor authentication for sensitive operations
- Audit logging and monitoring
- Automated security scanning

## Troubleshooting

### Common Issues

1. **Credential errors**: Verify environment variables and IAM permissions
2. **Upload failures**: Check bucket policies and CORS configuration
3. **URL expiration**: Adjust expiration time for slow connections
4. **File type rejection**: Verify MIME type detection and allowed types

### Debugging Steps

1. Check browser console for client-side errors
2. Review server logs for API issues
3. Verify AWS S3 bucket permissions
4. Test with minimal configuration
5. Use AWS CLI for direct testing

## Conclusion

This cloud storage implementation provides a secure, scalable, and user-friendly solution for handling file uploads in your application. By leveraging AWS S3 with presigned URLs, it maintains strong security boundaries while enabling efficient direct uploads from the client.
