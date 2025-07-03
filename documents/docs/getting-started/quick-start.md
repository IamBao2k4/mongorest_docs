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

Các schema dưới đây được tạo dựa trên chuẩn của React Json Schema Form, chi tiết về từng field trong schema được giải thích ở [Schema Fields](/docs/features/schema-field). Bạn cũng có thể tạo schema nhanh bằng cách sử dụng giao diện của [MangoAds](https://admin-reactjs.mangoads.com.vn/)

### Định nghĩa User Schema

```json title="schemas/collections/users.json"
{
  "title": "user",
  "mongodb_collection_name": "user",
  "json_schema": {
    "type": "object",
    "properties": {
      "username": {
        "title": "username",
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
      "password": {
        "title": "password",
        "type": "string",
        "widget": "shortAnswer"
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
    },
    "required": [
      "username",
      "email",
      "role_system"
    ]
  },
  "ui_schema": {
    "username": {
      "ui:widget": "shortAnswer"
    },
    "email": {
      "ui:widget": "shortAnswer"
    },
    "password": {
      "ui:widget": "shortAnswer"
    },
    "role_system": {
      "ui:widget": "select"
    },
    "ui:order": [
      "username",
      "email",
      "password",
      "role_system",
    ]
  },
  "use_seo_path": false,
  "use_parent_delete_childs": false
}
```

### Định nghĩa Product Schema với Relationships

```json title="schemas/collections/products.json"
{
  "title": "Product",
  "mongodb_collection_name": "product",
  "json_schema": {
    "title": "",
    "description": "",
    "type": "object",
    "properties": {
        "name": {
        "title": "Name",
        "type": "string",
        "widget": "shortAnswer",
        "filter": true,
        "description": "Product name"
      },
      "slug": {
        "title": "Slug",
        "type": "string",
        "widget": "UriKeyGen",
        "depend_field": "root_title",
        "filter": true,
        "description": "Nhập slug cho title"
      },
      "price": {
        "widget": "numberInput",
        "title": "Price",
        "type": "string"
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
    },
    "required": [],
    "dependencies": {},
    "ui": {
      "name": {
        "ui:widget": "shortAnswer"
      },
      "slug": {
        "ui:widget": "shortAnswer"
      },
      "price": {
        "ui:widget": "numbetInput"
      },
      "created_by": {
        "ui:widget": "relation"
      },
      "created_at": {
        "ui:widget": "dateTime"
      },
      "ui:order": [
        "name",
        "slug",
        "price",
        "created_by",
        "created_at",
      ]
    }
  }
}
```

## 3. Khởi động Server

```bash
npm run start
```

## 4. Test API Calls

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
Lấy danh sách users có role="user", tuổi từ 25 trở lên, chỉ hiển thị tên, email và tuổi.

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

## Next Steps

Bạn đã hoàn thành Quick Start! Tiếp theo:

- 📖 [Triết lý thiết kế](./philosophy) - Hiểu sâu hơn về MongoREST
- 🏗️ [Kiến trúc hệ thống](/docs/architecture/overview) - Cách MongoREST hoạt động
- 📚 [API Reference](/docs/api-reference/basic-queries) - Tất cả API examples
