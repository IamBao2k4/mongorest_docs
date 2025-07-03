---
sidebar_position: 3
---

# Nguyên Lý Thiết Kế

MongoREST được xây dựng dựa trên những nguyên tắc và triết lý thiết kế rõ ràng, nhằm tạo ra một framework vừa mạnh mẽ vừa dễ sử dụng.

## 3 Nguyên Tắc Cốt Lõi

### 1. Schema-Driven Development

**"Mọi thứ bắt đầu từ Schema"**

MongoREST tin rằng việc định nghĩa rõ ràng cấu trúc dữ liệu từ đầu sẽ mang lại nhiều lợi ích:

```json
{
  "collection": "products",
  "properties": {
    "name": { "type": "string" },
    "price": { "type": "number" }
  }
}
```

**Lợi ích:**
- ✅ **Type Safety**: Đảm bảo tính nhất quán của dữ liệu
- ✅ **Auto Documentation**: Tự động tạo tài liệu API
- ✅ **Validation**: Validate input/output tự động
- ✅ **IDE Support**: Auto-completion và type hints

### 2. Convention over Configuration

**"Mặc định thông minh, tùy chỉnh khi cần"**

MongoREST cung cấp các convention hợp lý:

```javascript
// Convention: Collection name = lowercase plural
"users" → /users (endpoints)

// Convention: Timestamps plugin
"timestamps": true → createdAt, updatedAt tự động

// Convention: Soft delete
"softDelete": true → deletedAt thay vì xóa thật
```

**Nguyên tắc:**
- 🎯 80% use cases không cần config
- 🔧 20% còn lại có thể tùy chỉnh hoàn toàn
- 📦 Zero-config để bắt đầu

### 3. Developer Experience

**"Simple things should be simple, complex things should be possible"**

MongoREST ưu tiên trải nghiệm developer:

```bash
# Simple: Basic CRUD
GET /products
POST /products
PATCH /products/123
DELETE /products/123

# Complex: Relationships & aggregations
GET /products?select=name,category(name),reviews!avg(rating)&category.featured=true
```

**DX Features:**
- 🎨 **Intuitive API**: RESTful conventions
- 🛠️ **Great Errors**: Descriptive error messages
- 🔍 **Debug Mode**: Query analysis tools

## Design Decisions

### 1. Why JSON Schema?

JSON Schema được chọn vì:
- **Standard**: RFC specification
- **Tooling**: Nhiều tools support
- **Extensible**: Custom keywords dễ dàng

### 2. Why MongoDB?

MongoDB phù hợp với:
- **Flexibility**: Schema evolution dễ dàng
- **Relationships**: Aggregation framework mạnh
- **Performance**: Scale horizontal tốt
- **Developer friendly**: JSON-like documents

### 3. Why RESTful?

REST được chọn vì:
- **Familiarity**: Developers đã quen
- **Tooling**: Postman, curl, browsers
- **Caching**: HTTP caching strategies
- **Simplicity**: Không cần special clients

### 4. Why Field-level RBAC?

Field-level permissions vì:
- **Granular**: Control chính xác
- **Flexible**: Different views cho roles
- **Secure**: Không leak sensitive data
- **Efficient**: Một API, nhiều responses

## Best Practices từ Nguyên Lý

### 1. Schema Design

```json
// ✅ GOOD: Clear, explicit schema
"title": {
  "title": "title",
  "type": "string",
  "widget": "shortAnswer"
},

// ❌ BAD: Vague, no validation
{
  "data": { "type": "object" }
}
```

### 2. Relationship Design

```json
// ✅ GOOD: Clear relationships
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

// ❌ BAD: Embedded subdocuments for relationships
{
  "properties": {
    "author": { 
      "type": "object",
      "properties": { "name": {}, "email": {} }
    }
  }
}
```

### 3. Query Design

```bash
# ✅ GOOD: Specific fields, clear intent
GET /posts?select=title,excerpt,author(name)&status=published

# ❌ BAD: Over-fetching
GET /posts?select=*&include=everything
```

## Evolution Philosophy

### Community-Driven

MongoREST phát triển dựa trên:
- 👥 User feedback
- 🎯 Real-world use cases
- 🤝 Open source contributions
- 📊 Usage analytics (opt-in)

## Summary

MongoREST không chỉ là một tool - nó là một philosophy về cách xây dựng APIs:

1. **Define clearly** (Schema-driven)
2. **Secure by default** (Security first)
3. **Simple for simple** (Great DX)
4. **Smart defaults** (Convention over config)

Những nguyên tắc này guide mọi decision trong MongoREST, từ API design đến implementation details.

---

**Next**: [Kiến trúc hệ thống →](/docs/architecture/overview)
