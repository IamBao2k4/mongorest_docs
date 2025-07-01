---
sidebar_position: 2
---

# Quick Start Guide

Hướng dẫn nhanh để bắt đầu sử dụng MongoREST trong 5 phút.

## 1. Setup nhanh

### Tạo project mới

```bash
# Tạo thư mục project
mkdir my-api && cd my-api

# Clone MongoREST
git clone https://github.com/your-org/mongorest.git .

# Install dependencies
npm install

# Copy environment config
cp .env.example .env
```

### Cấu hình cơ bản

Chỉnh sửa `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=my-secret-key-123
PORT=3000
```

## 2. Tạo Schema đầu tiên

### Định nghĩa User Schema

```json title="schemas/collections/users.json"
{
 "title": "user",
  "mongodb_collection_name": "user",
  "json_schema": {
    "type": "object",
    "properties": {
      "username": {
        "title": "username1",
        "type": "string",
        "widget": "shortAnswer",
        "filter": true
      },
      "email": {
        "title": "email",
        "type": "string",
        "widget": "shortAnswer",
        "filter": true
      },
      "first_name": {
        "title": "first_name",
        "type": "string",
        "widget": "shortAnswer",
        "filter": true
      },
      "last_name": {
        "title": "last_name",
        "type": "string",
        "widget": "shortAnswer",
        "filter": true
      },
      "phone": {
        "title": "phone",
        "type": "string",
        "widget": "numberInput"
      },
      "password": {
        "title": "password",
        "type": "string",
        "widget": "shortAnswer"
      },
      "birthday": {
        "title": "birthday",
        "type": "string",
        "widget": "date",
        "displayFormat": "YYYY/MM/DD",
        "formatDate": "date"
      },
      "role_system": {
        "title": "role_system",
        "type": "string",
        "widget": "select",
        "choices": [
          {
            "key": "user",
            "value": "user"
          }
        ],
        "default": "user"
      },
      "is_active": {
        "title": "is_active",
        "type": "string",
        "default": false,
        "widget": "boolean"
      }
    },
    "required": [
      "username",
      "email",
      "first_name",
      "last_name",
      "role_system",
      "is_active"
    ]
  },
  "ui_schema": {
    "username": {
      "ui:widget": "shortAnswer"
    },
    "email": {
      "ui:widget": "shortAnswer"
    },
    "first_name": {
      "ui:widget": "shortAnswer"
    },
    "last_name": {
      "ui:widget": "shortAnswer"
    },
    "phone": {
      "ui:widget": "numberInput"
    },
    "password": {
      "ui:widget": "shortAnswer"
    },
    "birthday": {
      "ui:widget": "date"
    },
    "role_system": {
      "ui:widget": "select"
    },
    "is_active": {
      "ui:widget": "boolean"
    },
    "ui:order": [
      "username",
      "email",
      "first_name",
      "last_name",
      "full_name",
      "featured_image",
      "cover",
      "phone",
      "password",
      "birthday",
      "role_system",
      "is_active"
    ]
  },
  "use_seo_path": false,
  "use_parent_delete_childs": false
}
```

### Định nghĩa Product Schema với Relationships

```json title="schemas/collections/products.json"
{
  "title": "Role",
  "mongodb_collection_name": "role",
  "json_schema": {
    "title": "",
    "description": "",
    "type": "object",
    "properties": {
      "title": {
        "title": "title",
        "type": "string",
        "widget": "shortAnswer"
      },
      "is_active": {
        "title": "is_active",
        "type": "string",
        "default": true,
        "widget": "boolean",
        "appearance": "checkbox"
      },
      "tenant_id": {
        "title": "tenant_id",
        "type": "string",
        "widget": "relation",
        "typeRelation": {
          "title": "tenant",
          "_id": "tenant",
          "type": "n-1",
          "filter": {
            "combinator": "and",
            "rules": [],
            "id": "32822eaa-c4e8-4705-9482-1518e06d2d56"
          }
        }
      },
      "created_by": {
        "title": "created_by",
        "type": "string",
        "widget": "relation",
        "typeRelation": {
          "title": "entity",
          "entity": "entity",
          "type": "n-1",
          "filter": {
            "combinator": "and",
            "rules": [],
            "id": "671af541-3919-4106-ae75-7d25b81e3447"
          }
        }
      },
      "updated_by": {
        "title": "updated_by",
        "type": "string",
        "widget": "relation",
        "typeRelation": {
          "title": "entity",
          "entity": "entity",
          "type": "n-1",
          "filter": {
            "combinator": "and",
            "rules": [],
            "id": "4e140c23-1e1d-4e6d-be1c-5d13e514e171"
          }
        }
      },
      "created_at": {
        "title": "created_at",
        "type": "string",
        "widget": "dateTime",
        "displayFormat": "yyyy/MM/dd HH:mm:ss",
        "formatDate": "date-time",
        "disabled": false,
        "field": "single",
        "mode": "dateTime"
      },
      "updated_at": {
        "title": "updated_at",
        "type": "string",
        "widget": "dateTime",
        "displayFormat": "yyyy/MM/dd HH:mm:ss",
        "formatDate": "date-time",
        "disabled": false,
        "field": "single",
        "mode": "dateTime"
      }
    },
    "required": [],
    "dependencies": {},
    "ui": {
      "title": {
        "ui:widget": "shortAnswer"
      },
      "is_active": {
        "ui:widget": "boolean"
      },
      "tenant_id": {
        "ui:widget": "relation"
      },
      "created_by": {
        "ui:widget": "relation"
      },
      "updated_by": {
        "ui:widget": "relation"
      },
      "created_at": {
        "ui:widget": "dateTime"
      },
      "updated_at": {
        "ui:widget": "dateTime"
      },
      "ui:order": [
        "title",
        "is_active",
        "tenant_id",
        "created_by",
        "updated_by",
        "created_at",
        "updated_at"
      ]
    }
  }
}
```

## 3. Khởi động Server

```bash
npm run dev
```

Output:
```
🚀 MongoREST server started
📍 API: http://localhost:3000
📚 Docs: http://localhost:3000/docs
✅ Database connected
📋 Loaded 2 schemas: users, products
```

## 4. Tạo JWT Token

### Tạo admin user (một lần)

```bash
# Sử dụng MongoDB shell
mongosh

use myapp
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  password: "$2b$10$..." # Hashed password
})
```

### Generate JWT token

```javascript
// Hoặc sử dụng script helper
node scripts/generate-token.js --role=admin --userId=123
```

Token example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 5. Test API Calls

### Create User (Admin only)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "65b1234567890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "age": 30,
    "createdAt": "2024-01-25T10:00:00Z",
    "updatedAt": "2024-01-25T10:00:00Z"
  }
}
```

### List Users với Filtering

```bash
curl "http://localhost:3000/users?role=eq.user&age=gte.25&select=name,email,age" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "age": 30
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 50
  }
}
```

### Create Product với Owner Relationship

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "iPhone 15",
    "price": 999,
    "owner": "65b1234567890abcdef12345"
  }'
```

### Query Product với Owner Info

```bash
curl "http://localhost:3000/products?select=name,price,owner(name,email)" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "name": "iPhone 15",
      "price": 999,
      "owner": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

## 6. Advanced Queries

### Complex Filtering với AND/OR

```bash
# Products với giá từ 100-1000 VÀ của user cụ thể
curl "http://localhost:3000/products?\
and=(price=gte.100,price=lte.1000,userId=eq.65b123)&\
select=name,price,owner(name)" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Debug Mode

```bash
# Xem query được generate
curl "http://localhost:3000/products?\
dryRun=true&debug=true&\
price=gte.100&\
select=name,price" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 7. RBAC trong Action

### User Role = "user"

```bash
# User chỉ xem được limited fields
curl "http://localhost:3000/products" \
  -H "Authorization: Bearer USER_TOKEN"
```

Response chỉ có basic fields:
```json
{
  "data": [{
    "name": "iPhone 15",
    "price": 999
  }]
}
```

### User Role = "admin"

```bash
# Admin xem được full fields
curl "http://localhost:3000/products" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Response có đầy đủ fields:
```json
{
  "data": [{
    "_id": "65b234...",
    "name": "iPhone 15",
    "price": 999,
    "cost": 600,
    "userId": "65b123...",
    "createdAt": "2024-01-25T10:00:00Z",
    "updatedAt": "2024-01-25T10:00:00Z"
  }]
}
```

## 8. Plugin System

### Auto Timestamps

```json title="Schema with plugins"
{
  "mongorest": {
    "plugins": {
      "timestamps": true,
      "softDelete": true
    }
  }
}
```

Tự động thêm:
- `createdAt`: Timestamp khi tạo
- `updatedAt`: Timestamp khi update
- `deletedAt`: Timestamp khi soft delete

### Custom Plugin Fields

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Product",
    "price": 100,
    "created_by": {
      "isTurnOn": true,
      "value": ""
    }
  }'
```

## Tips & Tricks

### 1. Use Postman Collection

Import Postman collection để test nhanh:
```
https://api.postman.com/collections/mongorest-quick-start
```

### 2. Enable Debug Logging

```env
LOG_LEVEL=debug
ENABLE_QUERY_LOGGING=true
```

### 3. Common Patterns

```bash
# Pagination
?page=2&limit=20

# Sorting
?order=-createdAt

# Field selection
?select=name,email,profile(bio,avatar)

# Text search
?search=john&searchFields=name,email
```

## Next Steps

Bạn đã hoàn thành Quick Start! Tiếp theo:

- 📖 [Triết lý thiết kế](./philosophy) - Hiểu sâu hơn về MongoREST
- 🏗️ [Kiến trúc hệ thống](/docs/architecture/overview) - Cách MongoREST hoạt động
- 📚 [API Reference](/docs/api-reference/basic-queries) - Tất cả API examples
