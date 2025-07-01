---
sidebar_position: 1
---

# Getting Started

## Giới Thiệu

Hướng dẫn này sẽ giúp bạn bắt đầu với MongoREST trong 15 phút. Chúng ta sẽ:
1. Cài đặt và cấu hình MongoREST
2. Tạo schema đầu tiên
3. Thực hiện các CRUD operations
4. Sử dụng relationships và queries nâng cao

## Prerequisites

- Node.js 16+ installed
- MongoDB 4.4+ running
- Basic knowledge của REST APIs và MongoDB

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-org/mongorest.git
cd mongorest
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy file `.env.example` thành `.env`:

```bash
cp .env.example .env
```

Edit `.env` với MongoDB connection của bạn:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/mongorest
MONGODB_DATABASE=mongorest

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=24h

# API Configuration
API_PREFIX=/api
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

## Tạo Schema Đầu Tiên

### 1. Product Schema

Tạo file `schemas/collections/products.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Products",
  "collection": "products",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 200,
      "description": "Product name"
    },
    "price": {
      "type": "number",
      "minimum": 0,
      "description": "Product price"
    },
    "stock": {
      "type": "integer",
      "minimum": 0,
      "default": 0
    },
    "status": {
      "type": "string",
      "enum": ["active", "inactive"],
      "default": "active"
    }
  },
  "required": ["name", "price"],
  "indexes": [
    { "fields": { "name": 1 } },
    { "fields": { "status": 1, "price": -1 } }
  ],
  "mongorest": {
    "permissions": {
      "read": ["guest", "user", "admin"],
      "create": ["user", "admin"],
      "update": ["admin"],
      "delete": ["admin"]
    }
  }
}
```

### 2. Category Schema

Tạo file `schemas/collections/categories.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Categories",
  "collection": "categories",
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "maxLength": 100
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "unique": true
    },
    "description": {
      "type": "string",
      "maxLength": 500
    }
  },
  "required": ["name", "slug"]
}
```

### 3. Update Product Schema với Relationship

Update `products.json` để add relationship:

```json
{
  // ... existing properties ...
  "properties": {
    // ... existing fields ...
    "categoryId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$",
      "description": "Category reference"
    }
  },
  "relationships": {
    "category": {
      "type": "belongsTo",
      "collection": "categories",
      "localField": "categoryId",
      "foreignField": "_id"
    }
  }
}
```

## Start Server

```bash
npm run dev
```

Server sẽ start tại `http://localhost:3000`

## First API Calls

### 1. Get API Info

```bash
curl http://localhost:3000/api
```

Response:
```json
{
  "name": "MongoREST API",
  "version": "1.0.0",
  "collections": ["products", "categories"]
}
```

### 2. Create a Category

```bash
curl -X POST http://localhost:3000/api/crud/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic products"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Electronics",
    "slug": "electronics",
    "description": "Electronic products"
  }
}
```

### 3. Create a Product

```bash
curl -X POST http://localhost:3000/api/crud/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "price": 999,
    "stock": 50,
    "categoryId": "507f1f77bcf86cd799439011"
  }'
```

### 4. List Products với Category

```bash
curl "http://localhost:3000/api/crud/products?select=name,price,category(name,slug)"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "iPhone 15",
      "price": 999,
      "category": {
        "name": "Electronics",
        "slug": "electronics"
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

## Authentication Setup

### 1. Create User Schema

`schemas/collections/users.json`:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Users",
  "collection": "users",
  "type": "object",
  "properties": {
    "email": {
      "type": "string",
      "format": "email",
      "unique": true
    },
    "password": {
      "type": "string",
      "minLength": 8
    },
    "name": {
      "type": "string"
    },
    "role": {
      "type": "string",
      "enum": ["user", "admin"],
      "default": "user"
    }
  },
  "required": ["email", "password", "name"],
  "mongorest": {
    "permissions": {
      "read": ["admin"],
      "create": ["guest"],
      "update": ["admin"],
      "delete": ["admin"]
    }
  }
}
```

### 2. Register User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439012",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### 4. Use Token

```bash
curl http://localhost:3000/api/crud/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## Advanced Queries

### 1. Filtering

```bash
# Products với price >= 500
curl "http://localhost:3000/api/crud/products?price=gte.500"

# Active products trong category
curl "http://localhost:3000/api/crud/products?status=eq.active&category.slug=eq.electronics"
```

### 2. Complex Queries

```bash
# Products với multiple conditions
curl "http://localhost:3000/api/crud/products?and=(price=gte.100,price=lte.1000,stock=gt.0)"
```

### 3. Sorting và Pagination

```bash
# Sort by price descending, limit 10
curl "http://localhost:3000/api/crud/products?sort=price&order=desc&limit=10"
```

## Using Plugins

### Auto Timestamps

```bash
curl -X POST http://localhost:3000/api/crud/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "New Product",
    "price": 299,
    "created_at": {
      "isTurnOn": true,
      "value": "Date.now()"
    },
    "created_by": {
      "isTurnOn": true,
      "value": ""
    }
  }'
```

## Configure RBAC

### 1. RBAC Config File

Tạo `schemas/rbac/products.json`:

```json
{
  "collection_name": "products",
  "rbac_config": {
    "GET": [
      {
        "user_role": "guest",
        "patterns": [
          {"name": {"type": "string"}},
          {"price": {"type": "number"}}
        ]
      },
      {
        "user_role": "user",
        "patterns": [
          {"name": {"type": "string"}},
          {"price": {"type": "number"}},
          {"stock": {"type": "integer"}},
          {"category": {"type": "relation"}}
        ]
      }
    ]
  }
}
```

### 2. Test RBAC

```bash
# As guest (no token) - only sees name and price
curl "http://localhost:3000/api/crud/products"

# As user (with token) - sees more fields
curl "http://localhost:3000/api/crud/products" \
  -H "Authorization: Bearer USER_TOKEN"
```

## Project Structure

Sau khi setup, project structure sẽ như sau:

```
mongorest/
├── schemas/
│   ├── collections/
│   │   ├── products.json
│   │   ├── categories.json
│   │   └── users.json
│   ├── functions/
│   └── rbac/
│       └── products.json
├── src/
│   ├── core/
│   ├── middleware/
│   ├── routes/
│   └── utils/
├── .env
├── .env.example
├── package.json
└── server.js
```

## Next Steps

1. **Explore Documentation**:
   - [API Reference](/docs/references/api) - Chi tiết về endpoints
   - [Schema Reference](/docs/references/schema) - Schema configuration
   - [Complex Queries](/docs/how-to-guides/complex-queries) - Advanced querying

2. **Add More Features**:
   - Configure more plugins
   - Add custom functions
   - Set up webhooks
   - Implement caching

3. **Production Setup**:
   - Configure production MongoDB
   - Set up monitoring
   - Enable rate limiting
   - Configure backup

## Common Issues

### MongoDB Connection Error
```
Error: MongoServerError: Authentication failed
```
Solution: Check MongoDB URI trong `.env`

### Schema Not Loading
```
Error: Schema file not found
```
Solution: Ensure schema files trong `schemas/collections/`

### Permission Denied
```
Error: You don't have permission to perform this action
```
Solution: Check user role và RBAC configuration

## Getting Help

- **Documentation**: [https://mongorest.dev/docs](https://mongorest.dev/docs)
- **GitHub Issues**: [https://github.com/your-org/mongorest/issues](https://github.com/your-org/mongorest/issues)
- **Community Forum**: [https://forum.mongorest.dev](https://forum.mongorest.dev)

## Summary

Congratulations! Bạn đã:
- ✅ Cài đặt MongoREST
- ✅ Tạo schemas với relationships
- ✅ Thực hiện CRUD operations
- ✅ Sử dụng authentication
- ✅ Configure RBAC
- ✅ Thực hiện complex queries

MongoREST giúp bạn tạo APIs nhanh chóng và an toàn. Explore thêm features và build amazing applications!
