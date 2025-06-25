---
sidebar_position: 1
---

# API Reference

Chi tiết về các endpoints, parameters và ví dụ sử dụng.

## Collection Endpoints

### GET /api/:collection
Lấy danh sách documents từ collection.

**Parameters:**
- `limit` - Số lượng records (default: 20)
- `skip` - Số lượng records bỏ qua (default: 0)
- `order` - Sắp xếp: `field.asc` hoặc `field.desc`
- `select` - Trường cần lấy: `name,email,age`
- `dbType` - Loại database: `mongodb`, `postgresql`, `elasticsearch`, `mysql`
- `dryRun` - Nếu `true`, chỉ trả về query đã convert, không thực thi
- Các tham số filter khác: `field.operator.value` (xem Query Operators bên dưới)

**Headers:**
- `X-User-Roles`: Danh sách role, ví dụ: `admin,user`

**Ví dụ:**
```bash
GET /api/users?skip=0&limit=10&select=name,email&status=eq.active
```

### GET /api/:collection/:id
Lấy một document theo ID.

**Parameters:**
- `dbType` - Loại database (tùy chọn)

**Headers:**
- `X-User-Roles`: Danh sách role

**Ví dụ:**
```bash
GET /api/users/123
```

### POST /api/:collection
Tạo document mới.

**Body:** JSON object  
**Headers:** `X-User-Roles`

**Ví dụ:**
```bash
POST /api/users { "name": "John Doe", "email": "john@example.com" }
```

### PUT /api/:collection/:id
Cập nhật toàn bộ document theo ID.

**Body:** JSON object  
**Headers:** `X-User-Roles`

**Ví dụ:**
```bash
PUT /api/users/123 { "name": "Jane Doe", "email": "jane@example.com" }
```

### PATCH /api/:collection/:id
Cập nhật một phần document theo ID.

**Body:** JSON object  
**Headers:** `X-User-Roles`

**Ví dụ:**
```bash
PATCH /api/users/123 { "status": "active" }
```

### DELETE /api/:collection/:id
Xóa document theo ID.

**Headers:** `X-User-Roles`

**Ví dụ:**
```bash
DELETE /api/users/123
```

## Test & Utility Endpoints

### GET /api/test/intermediate/:collection
Chuyển query params sang intermediate JSON.

### GET /api/test/native/:collection
Chuyển query params sang native query của database.

### GET /health
Kiểm tra trạng thái server.

### GET /status
Lấy thông tin adapter và trạng thái hệ thống.

```

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