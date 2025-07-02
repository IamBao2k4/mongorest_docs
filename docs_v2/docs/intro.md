---
sidebar_position: 1
---

# Giới thiệu MongoREST

MongoREST là một hệ thống API layer tự động được phát triển cho MongoDB, giúp developers tạo ra các RESTful APIs hoàn chỉnh chỉ bằng cách định nghĩa JSON Schema. 

## Vấn đề MongoREST giải quyết

Trong phát triển ứng dụng hiện đại với MongoDB, developers thường phải:

- 🔄 Viết lại code CRUD cho mỗi collection
- ✅ Implement validation logic cho từng endpoint  
- 🔗 Xử lý relationships giữa các collections một cách thủ công
- 📊 Tạo các query phức tạp với aggregation pipelines
- 🔐 Implement authentication và authorization cho từng route
- 📝 Viết documentation cho APIs

MongoREST ra đời để **tự động hóa toàn bộ quy trình này**, cho phép developers tập trung vào business logic thay vì boilerplate code.

## Tính năng nổi bật

### 🚀 Schema-Driven Development
Chỉ cần định nghĩa JSON Schema, hệ thống tự động generate:
- RESTful CRUD endpoints
- Input validation
- API documentation
- Relationship handling

### 🔒 Security First
- JWT Authentication tích hợp sẵn
- Role-Based Access Control (RBAC) ở field level
- Input sanitization và validation
- Query injection prevention

### ⚡ High Performance
- In-memory schema caching
- Optimized MongoDB aggregation pipelines
- Connection pooling
- Query result caching

### 🛠️ Developer Experience
- Syntax quen thuộc cho queries
- Auto-generated documentation
- Detailed error messages
- Debug mode với dry run

## So sánh với giải pháp khác

| Feature | MongoREST | Custom APIs | Other Solutions |
|---------|-----------|-------------|-----------------|
| Setup time | ⚡ Minutes | 🐢 Weeks | 🏃 Hours |
| MongoDB native | ✅ Yes | ✅ Yes | ⚠️ Partial |
| Learning curve | 📉 Low | 📈 High | 📊 Medium |
| Maintenance | 🎯 Low | 😰 High | 🤔 Medium |
| Flexibility | 🎨 High | 🎯 Highest | 📐 Medium |

## Quick Example

### 1. Định nghĩa Schema

```json
{
  "collection": "products",
  "properties": {
    "name": { "type": "string", "maxLength": 200 },
    "price": { "type": "number", "minimum": 0 },
    "categoryId": { "type": "string" }
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

### 2. APIs được tự động tạo

```bash
# Get products with category info
GET /products?select=name,price,category(name)&status=eq.active

# Create new product  
POST /products
{
  "name": "iPhone 15",
  "price": 999,
  "categoryId": "cat_123"
}

# Update product
PATCH /products/prod_456
{
  "price": 899
}
```

### 3. Response với RBAC

**User role "guest":**
```json
{
  "name": "iPhone 15",
  "price": 999
}
```

**User role "admin":**
```json
{
  "_id": "prod_456",
  "name": "iPhone 15", 
  "price": 999,
  "cost": 600,
  "supplier": "Apple Inc",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

## Bắt đầu ngay

MongoREST phù hợp với:
- 🏢 Enterprise applications cần APIs chuẩn hóa
- 🚀 Startups muốn launch nhanh
- 👥 Teams muốn focus vào business logic
- 🔧 Projects có nhiều collections và relationships

[Xem Quick Start Guide →](/docs/getting-started/quick-start)
