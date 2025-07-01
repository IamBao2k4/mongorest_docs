---
slug: introducing-mongorest
title: Introducing MongoREST - The Missing API Layer for MongoDB
authors: [mongorest-team]
tags: [mongorest, mongodb, api, rest, announcement]
---

# Introducing MongoREST - The Missing API Layer for MongoDB

Chúng tôi vui mừng giới thiệu **MongoREST** - một hệ thống API layer tự động cho MongoDB, giúp developers tạo ra các RESTful APIs hoàn chỉnh chỉ bằng cách định nghĩa JSON Schema. Không còn phải viết boilerplate code, không còn phải lo lắng về validation hay security - MongoREST xử lý tất cả cho bạn.

<!--truncate-->

## Vấn đề chúng tôi giải quyết

Trong quá trình phát triển ứng dụng với MongoDB, developers thường gặp phải những vấn đề sau:

- **Lặp lại code CRUD**: Mỗi collection đều cần các endpoints GET, POST, PUT, DELETE tương tự
- **Inconsistent validation**: Validation logic được viết khác nhau ở mỗi endpoint
- **Manual relationship handling**: Phải viết code phức tạp để xử lý relationships
- **Security concerns**: Authentication và authorization phải implement từ đầu
- **Lack of standards**: Mỗi team có cách query và filter khác nhau

## MongoREST đến giải cứu!

MongoREST lấy cảm hứng từ PostgREST - công cụ tuyệt vời cho PostgreSQL - và mang những ý tưởng đó đến với MongoDB. Với MongoREST, bạn chỉ cần:

1. **Định nghĩa JSON Schema** cho collections
2. **Khởi động server**
3. **APIs đã sẵn sàng!**

```json
// schemas/collections/products.json
{
  "collection": "products",
  "properties": {
    "name": { "type": "string", "minLength": 3 },
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
  },
  "required": ["name", "price"]
}
```

Chỉ với schema trên, bạn đã có:
- ✅ Full CRUD endpoints
- ✅ Input validation
- ✅ Relationship queries
- ✅ Filtering & pagination
- ✅ Authentication ready

## Tính năng nổi bật

### 1. Schema-Driven Development

Mọi thứ bắt đầu từ JSON Schema. MongoREST tự động generate APIs, validation rules, và documentation từ schemas của bạn.

### 2. PostgREST-Style Relationships

Query relationships dễ dàng với syntax quen thuộc:

```bash
# Get products with category info
GET /products?select=name,price,category(name,slug)

# Filter by relationship
GET /products?category.featured=eq.true&price=gte.100
```

### 3. Built-in Security

JWT authentication và role-based access control được tích hợp sẵn:

```json
{
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

### 4. Advanced Query Capabilities

15+ operators cho mọi nhu cầu query:

```bash
# Complex filtering
GET /products?and=(status=eq.active,price=between.100.500)&tags=in.(electronics,gadgets)

# Aggregations
GET /users?select=name,orderCount:orders!count,totalSpent:orders!sum(totalAmount)
```

### 5. Plugin System

Tự động thêm timestamps, soft delete, audit trails với plugin system:

```json
{
  "mongorest": {
    "plugins": {
      "created_at": { "isTurnOn": true },
      "updated_at": { "isTurnOn": true },
      "deleted_at": { "isTurnOn": true }
    }
  }
}
```

## Real-world Performance

Trong testing với production workloads:

- **Schema loading**: < 100ms cho 50+ collections
- **Simple CRUD**: < 50ms average response time
- **Complex relationships**: < 200ms với 3+ nested levels
- **Concurrent capacity**: 1000+ requests/second

## So sánh với các giải pháp khác

| Feature | MongoREST | Custom Express APIs | Strapi/Directus |
|---------|-----------|-------------------|-----------------|
| Setup time | Minutes | Days/Weeks | Hours |
| MongoDB native | ✅ | ✅ | ⚠️ Adapter |
| PostgREST syntax | ✅ | ❌ | ❌ |
| Type safety | ✅ | Depends | ⚠️ |
| Performance | High | Variable | Medium |
| Customization | High | Highest | Limited |

## Getting Started

```bash
# 1. Install MongoREST
npm install @mongorest/core

# 2. Create schema
mkdir -p schemas/collections
echo '{
  "collection": "todos",
  "properties": {
    "title": { "type": "string" },
    "completed": { "type": "boolean", "default": false }
  }
}' > schemas/collections/todos.json

# 3. Start server
npx mongorest start

# 4. Your API is ready!
curl http://localhost:3000/todos
```

## What's Next?

MongoREST đã sẵn sàng cho production với đầy đủ tính năng cho hầu hết use cases. Chúng tôi đang làm việc trên:

### Phase 3 (Q1 2025)
- Real-time subscriptions với WebSocket
- Advanced caching strategies
- Visual monitoring dashboard
- Auto-index recommendations

### Phase 4 (Q2 2025)
- GraphQL endpoint generation
- Multi-tenancy support
- Plugin marketplace
- Serverless deployment

## Open Source & Community

MongoREST là open source và chúng tôi welcome contributions! Dù bạn muốn:
- Report bugs
- Suggest features
- Submit PRs
- Write documentation
- Share use cases

Mọi đóng góp đều được đánh giá cao!

## Kết luận

MongoREST sinh ra từ nhu cầu thực tế - chúng tôi đã quá mệt mỏi với việc viết đi viết lại cùng một boilerplate code cho mỗi dự án MongoDB. Giờ đây, với MongoREST, bạn có thể tập trung vào business logic thay vì infrastructure.

Hãy thử MongoREST và cho chúng tôi biết bạn nghĩ gì! 

🚀 **[Get Started with MongoREST](https://github.com/mongorest/mongorest)**

---

*MongoREST - Making MongoDB APIs as easy as they should be.*