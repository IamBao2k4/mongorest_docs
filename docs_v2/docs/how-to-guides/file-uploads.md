---
sidebar_position: 3
---

# File Uploads

Hướng dẫn chi tiết về xử lý upload files trong MongoREST.

## Overview

MongoREST hỗ trợ nhiều phương thức lưu trữ files:
- Local filesystem
- MongoDB GridFS
- Amazon S3
- Google Cloud Storage
- Azure Blob Storage

## Basic Configuration

### Local Storage

```javascript
// mongorest.config.js
module.exports = {
  uploads: {
    enabled: true,
    storage: 'local',
    
    local: {
      destination: './uploads',
      createPath: true,
      permissions: '0755',
      
      // Organize files
      organize: {
        byDate: true, // /uploads/2023/01/15/
        byType: true, // /uploads/images/
        byUser: true  // /uploads/user-123/
      }
    },
    
    // File restrictions
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
      files: 5,                    // Max files per request
      fields: 10,                  // Max fields
      fieldNameSize: 100,          // Max field name length
      fieldSize: 1024 * 1024       // Max field value size
    },
    
    // Allowed MIME types
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/zip',
      'text/plain',
      'text/csv'
    ],
    
    // Or use regex
    allowedTypesRegex: /^(image|video|audio|application\/pdf)/,
    
    // File naming
    filename: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      return `${file.fieldname}-${uniqueSuffix}${ext}`;
    }
  }
};
```

### GridFS Storage

```javascript
uploads: {
  storage: 'gridfs',
  
  gridfs: {
    bucketName: 'uploads',
    chunkSizeBytes: 255 * 1024, // 255KB
    
    // Metadata
    metadata: (req, file) => ({
      uploadedBy: req.user?._id,
      originalName: file.originalname,
      uploadedAt: new Date()
    }),
    
    // Generate file ID
    id: (req, file) => {
      return new ObjectId();
    }
  }
}
```

### S3 Storage

```javascript
uploads: {
  storage: 's3',
  
  s3: {
    // AWS credentials
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    
    // Bucket config
    bucket: process.env.S3_BUCKET,
    
    // S3 options
    acl: 'private', // private, public-read, etc.
    serverSideEncryption: 'AES256',
    storageClass: 'STANDARD', // STANDARD, STANDARD_IA, GLACIER
    
    // Custom endpoint (for S3-compatible services)
    endpoint: process.env.S3_ENDPOINT,
    s3ForcePathStyle: true,
    
    // Key generation
    key: (req, file, cb) => {
      const key = `uploads/${Date.now()}-${file.originalname}`;
      cb(null, key);
    },
    
    // Metadata
    metadata: (req, file, cb) => {
      cb(null, {
        fieldName: file.fieldname,
        uploadedBy: req.user?.id
      });
    },
    
    // Cache control
    cacheControl: 'max-age=31536000',
    
    // Content type
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    }
  }
}
```

## Upload Endpoints

### Single File Upload

```bash
POST /upload
Content-Type: multipart/form-data

file: [binary data]
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "file-1673786234567-987654321.jpg",
  "originalname": "photo.jpg",
  "mimetype": "image/jpeg",
  "size": 102400,
  "url": "/files/file-1673786234567-987654321.jpg",
  "uploadedAt": "2023-01-15T10:30:00Z"
}
```

### Multiple Files Upload

```bash
POST /upload/multiple
Content-Type: multipart/form-data

files: [file1]
files: [file2]
files: [file3]
```

Response:
```json
{
  "files": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "filename": "file1.jpg",
      "size": 102400,
      "url": "/files/file1.jpg"
    },
    // ... more files
  ],
  "count": 3,
  "totalSize": 307200
}
```

### Upload with Fields

```bash
POST /upload/with-data
Content-Type: multipart/form-data

file: [binary data]
title: "My Document"
description: "Important file"
category: "documents"
```

Response:
```json
{
  "file": {
    "_id": "507f1f77bcf86cd799439011",
    "filename": "document.pdf",
    "url": "/files/document.pdf"
  },
  "data": {
    "title": "My Document",
    "description": "Important file",
    "category": "documents"
  }
}
```

## File Processing

### Image Processing

```javascript
uploads: {
  processing: {
    images: {
      // Auto-generate thumbnails
      thumbnails: [
        {
          name: 'thumb',
          width: 150,
          height: 150,
          fit: 'cover' // cover, contain, fill, inside, outside
        },
        {
          name: 'medium',
          width: 800,
          height: 600,
          fit: 'inside',
          withoutEnlargement: true
        },
        {
          name: 'large',
          width: 1920,
          height: 1080,
          fit: 'inside',
          withoutEnlargement: true
        }
      ],
      
      // Image optimization
      optimize: {
        quality: 85,
        progressive: true,
        mozjpeg: true,
        webp: {
          quality: 80,
          alphaQuality: 100,
          lossless: false
        }
      },
      
      // Auto-rotate based on EXIF
      autoOrient: true,
      
      // Strip metadata
      stripMetadata: true,
      
      // Watermark
      watermark: {
        enabled: true,
        image: './assets/watermark.png',
        position: 'southeast', // northwest, northeast, southwest, southeast, center
        opacity: 0.5
      }
    }
  }
}
```

### Video Processing

```javascript
uploads: {
  processing: {
    videos: {
      // Generate thumbnails
      thumbnails: {
        count: 3,
        folder: './uploads/video-thumbs',
        size: '320x240',
        filename: '%b-thumbnail-%i.png'
      },
      
      // Transcode settings
      transcode: {
        formats: [
          {
            name: '720p',
            codec: 'libx264',
            size: '1280x720',
            videoBitrate: '1000k',
            audioBitrate: '128k'
          },
          {
            name: '480p',
            codec: 'libx264',
            size: '854x480',
            videoBitrate: '500k',
            audioBitrate: '96k'
          }
        ]
      },
      
      // Extract metadata
      extractMetadata: true
    }
  }
}
```

### Document Processing

```javascript
uploads: {
  processing: {
    documents: {
      // Extract text from PDFs
      extractText: true,
      
      // Generate preview images
      preview: {
        enabled: true,
        pages: [1], // Which pages to convert
        format: 'png',
        density: 150 // DPI
      },
      
      // OCR for scanned documents
      ocr: {
        enabled: true,
        language: 'eng+vie',
        psm: 3 // Page segmentation mode
      },
      
      // Compress PDFs
      compress: {
        enabled: true,
        quality: 'ebook' // screen, ebook, printer, prepress
      }
    }
  }
}
```

## Advanced Upload Features

### Chunked Upload

```javascript
// Configuration
uploads: {
  chunking: {
    enabled: true,
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
    
    // Temporary storage
    tempDir: './uploads/chunks',
    
    // Cleanup incomplete uploads
    cleanupInterval: 3600000, // 1 hour
    maxAge: 86400000 // 24 hours
  }
}

// Client-side chunked upload
const uploadChunked = async (file) => {
  const chunkSize = 5 * 1024 * 1024;
  const chunks = Math.ceil(file.size / chunkSize);
  const uploadId = generateId();
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', i);
    formData.append('totalChunks', chunks);
    formData.append('filename', file.name);
    
    await fetch('/upload/chunk', {
      method: 'POST',
      body: formData
    });
  }
  
  // Finalize upload
  const response = await fetch('/upload/finalize', {
    method: 'POST',
    body: JSON.stringify({ uploadId })
  });
  
  return response.json();
};
```

### Resumable Upload

```javascript
// Using tus protocol
uploads: {
  resumable: {
    enabled: true,
    
    tus: {
      path: '/files',
      datastore: {
        type: 'file', // file, s3, gcs
        directory: './uploads/tus'
      },
      
      // Max file size
      maxSize: 1024 * 1024 * 1024, // 1GB
      
      // Events
      onUploadCreate: async (req, res, upload) => {
        // Validate upload
        console.log('Upload started:', upload.id);
      },
      
      onUploadFinish: async (req, res, upload) => {
        // Process completed upload
        console.log('Upload completed:', upload.id);
      }
    }
  }
}
```

### Direct S3 Upload

```javascript
// Generate presigned URL for direct upload
POST /upload/presigned
{
  "filename": "large-video.mp4",
  "contentType": "video/mp4",
  "size": 524288000
}

Response:
{
  "uploadUrl": "https://s3.amazonaws.com/bucket/...",
  "fields": {
    "key": "uploads/large-video.mp4",
    "AWSAccessKeyId": "...",
    "policy": "...",
    "signature": "..."
  },
  "fileId": "507f1f77bcf86cd799439011"
}

// After upload, confirm completion
POST /upload/complete
{
  "fileId": "507f1f77bcf86cd799439011",
  "key": "uploads/large-video.mp4"
}
```

## File Management

### List Files

```bash
GET /files
GET /files?type=image/jpeg
GET /files?uploadedBy=userId
GET /files?size=gte.1048576
GET /files?uploadedAt=gte.2023-01-01
```

### Get File Details

```bash
GET /files/507f1f77bcf86cd799439011
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "filename": "document.pdf",
  "originalname": "Annual Report 2023.pdf",
  "mimetype": "application/pdf",
  "size": 2097152,
  "url": "/files/document.pdf",
  "metadata": {
    "uploadedBy": "user123",
    "description": "Annual financial report",
    "tags": ["finance", "2023", "report"]
  },
  "processing": {
    "textExtracted": true,
    "preview": "/files/document-preview.png",
    "pages": 45
  },
  "uploadedAt": "2023-01-15T10:30:00Z"
}
```

### Download File

```bash
# Direct download
GET /files/507f1f77bcf86cd799439011/download

# With specific name
GET /files/507f1f77bcf86cd799439011/download?name=report.pdf

# Inline display
GET /files/507f1f77bcf86cd799439011?inline=true

# Specific version/size
GET /files/507f1f77bcf86cd799439011?version=thumbnail
```

### Update File Metadata

```bash
PATCH /files/507f1f77bcf86cd799439011
{
  "metadata": {
    "description": "Updated description",
    "tags": ["finance", "2023", "report", "q4"]
  }
}
```

### Delete File

```bash
DELETE /files/507f1f77bcf86cd799439011

# Soft delete
DELETE /files/507f1f77bcf86cd799439011?soft=true
```

## Security

### Access Control

```javascript
uploads: {
  security: {
    // Authentication required
    requireAuth: true,
    
    // File-level permissions
    permissions: {
      upload: ['user', 'admin'],
      download: ['user', 'admin'],
      delete: ['admin', 'owner'],
      update: ['admin', 'owner']
    },
    
    // Check permissions
    checkAccess: async (req, file, action) => {
      const user = req.user;
      
      // Owner always has access
      if (file.uploadedBy === user._id) {
        return true;
      }
      
      // Check role permissions
      const allowed = permissions[action];
      return allowed.includes(user.role);
    }
  }
}
```

### Virus Scanning

```javascript
uploads: {
  security: {
    virusScan: {
      enabled: true,
      
      // ClamAV settings
      clamav: {
        host: 'localhost',
        port: 3310,
        timeout: 60000
      },
      
      // Actions on detection
      onDetection: 'reject', // reject, quarantine, log
      
      // Scan options
      scanOnUpload: true,
      scanInBackground: false,
      maxFileSize: 100 * 1024 * 1024 // 100MB
    }
  }
}
```

### Content Validation

```javascript
uploads: {
  validation: {
    // Validate file content matches MIME type
    validateMimeType: true,
    
    // Custom validators
    validators: {
      'image/*': async (file, buffer) => {
        // Check if valid image
        const type = await fileType.fromBuffer(buffer);
        if (!type || !type.mime.startsWith('image/')) {
          throw new Error('Invalid image file');
        }
        
        // Check image dimensions
        const metadata = await sharp(buffer).metadata();
        if (metadata.width > 4000 || metadata.height > 4000) {
          throw new Error('Image dimensions too large');
        }
        
        return true;
      },
      
      'application/pdf': async (file, buffer) => {
        // Validate PDF structure
        const header = buffer.toString('utf8', 0, 5);
        if (header !== '%PDF-') {
          throw new Error('Invalid PDF file');
        }
        return true;
      }
    }
  }
}
```

## File Serving

### Static File Serving

```javascript
uploads: {
  serving: {
    // Enable static file serving
    static: true,
    
    // URL path
    path: '/files',
    
    // Cache headers
    cache: {
      maxAge: 86400, // 1 day
      immutable: true,
      etag: true,
      lastModified: true
    },
    
    // Security headers
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  }
}
```

### CDN Integration

```javascript
uploads: {
  cdn: {
    enabled: true,
    
    // CloudFront
    cloudfront: {
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION,
      domain: 'https://cdn.example.com',
      
      // Signed URLs
      signedUrls: {
        enabled: true,
        keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID,
        privateKey: fs.readFileSync('./cloudfront-private.pem'),
        expiry: 3600 // 1 hour
      }
    },
    
    // Cloudflare
    cloudflare: {
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      
      // Purge cache on update
      purgeOnUpdate: true
    }
  }
}
```

### Image Transformation API

```bash
# Resize image
GET /files/image.jpg?w=300&h=200

# Crop image
GET /files/image.jpg?w=300&h=200&fit=cover

# Format conversion
GET /files/image.jpg?format=webp

# Quality adjustment
GET /files/image.jpg?q=80

# Multiple operations
GET /files/image.jpg?w=800&h=600&fit=inside&format=webp&q=85

# Blur effect
GET /files/image.jpg?blur=10

# Grayscale
GET /files/image.jpg?grayscale=true

# Rotate
GET /files/image.jpg?rotate=90
```

## Integration Examples

### React Upload Component

```javascript
import React, { useState } from 'react';

function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);

  const handleUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    setUploading(true);

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          }
        });

        const data = await response.json();
        setFiles(prev => [...prev, data]);
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    setUploading(false);
    setProgress(0);
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && (
        <div>
          <progress value={progress} max="100" />
          <span>{progress}%</span>
        </div>
      )}
      
      <div>
        {files.map(file => (
          <div key={file._id}>
            <img src={file.url} alt={file.originalname} />
            <span>{file.originalname}</span>
            <span>{formatBytes(file.size)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Vue.js Upload with Drag & Drop

```vue
<template>
  <div
    class="upload-area"
    @drop="handleDrop"
    @dragover.prevent
    @dragenter.prevent
    :class="{ 'drag-over': isDragging }"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      @change="handleFiles"
      style="display: none"
    />
    
    <div v-if="!uploading" @click="$refs.fileInput.click()">
      <p>Drag files here or click to upload</p>
    </div>
    
    <div v-else>
      <div v-for="file in uploadQueue" :key="file.id">
        <span>{{ file.name }}</span>
        <progress :value="file.progress" max="100"></progress>
      </div>
    </div>
    
    <div class="uploaded-files">
      <div v-for="file in uploadedFiles" :key="file._id">
        <img v-if="isImage(file)" :src="file.url" />
        <span>{{ file.originalname }}</span>
        <button @click="deleteFile(file._id)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isDragging: false,
      uploading: false,
      uploadQueue: [],
      uploadedFiles: []
    };
  },
  
  methods: {
    handleDrop(e) {
      e.preventDefault();
      this.isDragging = false;
      this.handleFiles({ target: { files: e.dataTransfer.files } });
    },
    
    async handleFiles(e) {
      const files = Array.from(e.target.files);
      this.uploading = true;
      
      for (const file of files) {
        const queueItem = {
          id: Math.random(),
          name: file.name,
          progress: 0
        };
        
        this.uploadQueue.push(queueItem);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
          const response = await this.$http.post('/api/upload', formData, {
            onUploadProgress: (e) => {
              queueItem.progress = Math.round((e.loaded * 100) / e.total);
            }
          });
          
          this.uploadedFiles.push(response.data);
          this.uploadQueue = this.uploadQueue.filter(f => f.id !== queueItem.id);
        } catch (error) {
          console.error('Upload failed:', error);
        }
      }
      
      this.uploading = false;
    },
    
    isImage(file) {
      return file.mimetype.startsWith('image/');
    },
    
    async deleteFile(id) {
      await this.$http.delete(`/api/files/${id}`);
      this.uploadedFiles = this.uploadedFiles.filter(f => f._id !== id);
    }
  }
};
</script>
```

## Performance Optimization

### Upload Optimization

```javascript
uploads: {
  performance: {
    // Parallel uploads
    concurrent: 3,
    
    // Request pooling
    pooling: {
      maxSockets: 10,
      maxFreeSockets: 5,
      timeout: 60000
    },
    
    // Memory optimization
    highWaterMark: 16 * 1024, // 16KB chunks
    
    // Temporary file handling
    tempFileThreshold: 10 * 1024 * 1024, // 10MB
    
    // Background processing
    backgroundProcessing: {
      enabled: true,
      workers: 4,
      queue: 'redis' // redis, memory, database
    }
  }
}
```

### Caching Strategy

```javascript
uploads: {
  cache: {
    // Browser caching
    clientCache: {
      maxAge: 31536000, // 1 year
      immutable: true
    },
    
    // Server caching
    serverCache: {
      type: 'redis',
      ttl: 3600, // 1 hour
      
      // Cache processed images
      processedImages: true,
      
      // Cache file metadata
      metadata: true
    },
    
    // CDN caching
    cdn: {
      headers: {
        'Cache-Control': 'public, max-age=31536000',
        'Surrogate-Control': 'max-age=86400'
      }
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **File too large**
   ```javascript
   // Increase limits
   uploads: {
     limits: {
       fileSize: 50 * 1024 * 1024 // 50MB
     }
   }
   ```

2. **CORS errors**
   ```javascript
   cors: {
     origin: ['http://localhost:3000'],
     credentials: true
   }
   ```

3. **Permission denied**
   ```bash
   # Fix directory permissions
   chmod 755 uploads
   chown www-data:www-data uploads
   ```

4. **Memory issues with large files**
   ```javascript
   // Use streaming
   uploads: {
     streaming: true,
     tempFileThreshold: 1024 * 1024 // 1MB
   }
   ```

## Next Steps

- [WebSocket Support](./websocket) - Real-time file upload progress
- [Security Model](../explanations/security) - File security best practices
- [API Reference](../references/api) - Complete upload API docs