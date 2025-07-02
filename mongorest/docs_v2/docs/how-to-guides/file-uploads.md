---
sidebar_position: 3
---

# File Uploads

Hướng dẫn xử lý upload files.

## Cấu hình

```javascript
uploads: {
  enabled: true,
  destination: './uploads',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
}
```

## Upload endpoint

### Single file
```bash
POST /upload
Content-Type: multipart/form-data

file: [binary data]
```

Response:
```json
{
  "filename": "image-123456.jpg",
  "size": 102400,
  "mimetype": "image/jpeg",
  "url": "/files/image-123456.jpg"
}
```

### Multiple files
```bash
POST /upload/multiple
Content-Type: multipart/form-data

files: [file1]
files: [file2]
```

## GridFS Integration

Cho files lớn:

```javascript
gridfs: {
  enabled: true,
  bucket: 'uploads',
  chunkSize: 255 * 1024
}
```

### Upload to GridFS
```bash
POST /gridfs/upload
```

### Stream file
```bash
GET /gridfs/files/:id
```

## Image Processing

```javascript
uploads: {
  imageProcessing: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 800, height: 600 },
    quality: 80
  }
}
```

## S3 Integration

```javascript
uploads: {
  storage: 's3',
  s3: {
    bucket: 'my-bucket',
    region: 'us-east-1',
    accessKeyId: 'xxx',
    secretAccessKey: 'yyy'
  }
}