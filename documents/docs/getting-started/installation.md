---
sidebar_position: 1
---

# Cài đặt MongoREST

Hướng dẫn cài đặt và cấu hình MongoREST cho dự án của bạn.

## Yêu cầu hệ thống

### Prerequisites
- **Node.js**: v16.0.0 hoặc cao hơn
- **MongoDB**: v4.4 hoặc cao hơn
- **npm** hoặc **yarn**: Package manager

### Optional
- **Redis**: Cho caching (recommended cho production)
- **Docker**: Cho containerized deployment

## Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/your-org/mongorest.git
cd mongorest
```

### 2. Install dependencies

```bash
npm install
# hoặc
yarn install
```

### 3. Cấu hình environment

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Chỉnh sửa các giá trị trong `.env`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/your-database
MONGODB_MAX_POOL_SIZE=50

# Authentication
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Features
ENABLE_CACHING=true
ENABLE_QUERY_LOGGING=true
MAX_QUERY_SIZE=1000000
QUERY_TIMEOUT=30000
```

### 4. Tạo schemas

Tạo thư mục schemas và định nghĩa collections:

```bash
mkdir -p schemas/collections
```

Ví dụ schema cho products:

```json title="schemas/collections/products.json"
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "collection": "products",
  "title": "Products Collection",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 200
    },
    "price": {
      "type": "number",
      "minimum": 0
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive"]
    }
  },
  "required": ["name", "price"],
}
```

### 5. Khởi động server

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

Server sẽ chạy tại `http://localhost:3000`

## Next Steps

- [Quick Start Guide →](./quick-start)
- [Triết lý thiết kế →](./philosophy)
- [Định nghĩa Schema →](/docs/schema/schema-structure)
