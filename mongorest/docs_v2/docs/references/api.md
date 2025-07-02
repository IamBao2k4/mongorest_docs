---
sidebar_position: 1
---

# API Reference

Chi tiết về các endpoints và parameters.

## Base Endpoints

### GET /
Liệt kê tất cả collections có sẵn.

Response:
```json
{
  "collections": ["users", "posts", "comments"],
  "version": "1.0.0"
}
```

## Collection Endpoints

### GET /:collection
Lấy documents từ collection.

**Parameters:**
- `limit` - Số lượng records (default: 20)
- `offset` - Skip records (default: 0)
- `order` - Sort order: `field.asc` hoặc `field.desc`
- `select` - Fields cần lấy: `name,email,age`

### GET /:collection/:id
Lấy một document theo ID.

### POST /:collection
Tạo document mới.

**Body:** JSON object

### PUT /:collection/:id
Update toàn bộ document.

### PATCH /:collection/:id
Update một phần document.

### DELETE /:collection/:id
Xóa document.

## Query Operators

### Comparison
- `eq` - Equal (default)
- `neq` - Not equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `lt` - Less than
- `lte` - Less than or equal

Example: `?age=gte.18&age=lt.65`

### Logical
- `or` - OR condition
- `and` - AND condition (default)

Example: `?or=(age.gte.18,status.eq.active)`

### Pattern Matching
- `like` - Pattern match với wildcards
- `ilike` - Case-insensitive pattern

Example: `?name=like.*john*`

### Array Operators
- `in` - Value in array
- `nin` - Value not in array

Example: `?status=in.(active,pending)`