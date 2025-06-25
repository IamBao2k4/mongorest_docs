---
sidebar_position: 2
---

# Basic Queries

Hướng dẫn chi tiết về cách sử dụng queries trong MongoREST.

## Tổng quan

MongoREST hỗ trợ đầy đủ các loại queries từ cơ bản đến nâng cao:
- Simple equality queries
- Comparison operators
- Logical operators
- Pattern matching
- Array queries
- Nested field queries
- Sorting và pagination
- Field selection

## SELECT - Lấy dữ liệu

### Lấy tất cả documents

```bash
GET /users
```

Response mặc định trả về 20 documents đầu tiên:
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "age": 30
  },
  // ... more documents
]
```

### Lấy document theo ID

```bash
GET /users/507f1f77bcf86cd799439011
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30,
  "createdAt": "2023-01-15T10:30:00Z"
}
```

### Response headers

MongoREST trả về các headers hữu ích:
- `X-Total-Count`: Tổng số documents match query
- `X-Page-Count`: Tổng số pages
- `X-Current-Page`: Page hiện tại
- `X-Per-Page`: Số documents mỗi page

## Filtering

### Exact match (mặc định)

```bash
# Single field
GET /users?name=like.John

# Multiple fields (AND condition)
GET /users?name=like.John&age=eq.30

# URL encoded values
GET /users?name=like.John%20Doe
```

### Comparison operators

MongoREST sử dụng format `field=operator.value`:

| Operator | Description | Example |
|----------|-------------|---------|
| eq | Equal (default) | `?age=eq.30` |
| neq | Not equal | `?status=neq.deleted` |
| gt | Greater than | `?age=gt.18` |
| gte | Greater than or equal | `?age=gte.18` |
| lt | Less than | `?price=lt.100` |
| lte | Less than or equal | `?price=lte.100` |

Ví dụ phức tạp:
```bash
# Users từ 18-65 tuổi
GET /users?age=gte.18&age=lte.65

# Products có giá từ 10-100
GET /products?price=gte.10&price=lte.100
```

### Logical operators

#### OR conditions

```bash
# Format: or=(condition1,condition2)
GET /users?or=(status=eq.active,role=eq.admin)

# Complex OR
GET /users?or=(age=lt.18,age=gt.65)&status=eq.active
```

Tương đương MongoDB:
```javascript
{
  $or: [
    { status: "active" },
    { role: "admin" }
  ]
}
```

#### AND conditions (mặc định)

```bash
# Implicit AND
GET /users?status=eq.active&role=eq.user

# Explicit AND
GET /users?and=(status=eq.active,role=eq.user)
```

#### Nested logical operators

```bash
# (status=active AND role=admin) OR (status=pending AND role=moderator)
GET /users?or=(and=(status=eq.active,role=eq.admin),and.(status=eq.pending,role=eq.moderator))
```

### Pattern matching

#### LIKE operator

```bash
# Contains 'john' (case sensitive)
GET /users?name=like.*john*

# Starts with 'john'
GET /users?name=like.john*

# Ends with 'smith'
GET /users?name=like.*smith

# Email domain
GET /users?email=like.*@gmail.com
```

#### ILIKE operator (case insensitive)

```bash
# Case insensitive search
GET /users?name=ilike.*JOHN*
```

#### Regular expressions

```bash
# Phone number pattern
GET /users?phone=regex.^\+84[0-9]{9}$

# Complex regex with flags
GET /users?email=regex./^[a-z]+@[a-z]+\.com$/i
```

### Array operators

#### IN operator

```bash
# Single value
GET /users?status=in.[active,pending,verified]

# Multiple fields
GET /posts?category=in.[tech,science]&status=eq.published
```

#### NOT IN operator

```bash
GET /users?status=nin.[deleted,banned,suspended]
```

#### Array contains

```bash
# Has specific tag
GET /posts?tags=cs.mongodb

# Has any of these tags
GET /posts?tags=in.[mongodb,nodejs,express]

# Has all tags (array match)
GET /posts?tags=all.[mongodb,nodejs]
```

### Nested field queries

MongoREST hỗ trợ dot notation cho nested objects:

```bash
# Nested object field
GET /users?address.city=eq.Hanoi
```
Lấy ra user có địa chỉ ở thành phố Hà Nội

```bash
# Deep nesting
GET /users?profile.settings.notifications.email=eq.true
```
Lấy ra user có cho phép thông báo qua email

```bash
# Nested với operators
GET /orders?items.product.price=gt.100
```
Lấy ra những order có giá bán của sản phẩm lớn hơn 100

Ví dụ document structure:
```json
{
  "name": "John",
  "address": {
    "street": "123 Main St",
    "city": "Hanoi",
    "country": "Vietnam"
  },
  "profile": {
    "settings": {
      "notifications": {
        "email": true,
        "sms": false
      }
    }
  }
}
```

### Date queries

```bash
# Exact date
GET /posts?createdAt=eq.2023-01-15

# Date range
GET /posts?createdAt=gte.2023-01-01&createdAt=lt.2023-02-01

# Relative dates (requires server support)
GET /posts?createdAt=gte.today-7d
GET /posts?createdAt=gte.thisMonth
```

### Null và exists queries

```bash
# Field is null
GET /users?deletedAt=eq.null

# Field is not null
GET /users?deletedAt=neq.null

# Field exists
GET /users?phone=exists.true

# Field doesn't exist
GET /users?phone=exists.false
```

## Sorting

### Single field sort

```bash
# Ascending (mặc định)
GET /users?order=name

# Descending
GET /users?order=-createdAt
```

### Multiple field sort

```bash
# Sort by multiple fields
GET /users?order=status,-createdAt

# Complex sorting
GET /products?order=category,-price,name
```

### Sort với nested fields

```bash
GET /users?order=address.city
```

## Pagination

### Limit và Offset

```bash
# Get first 10 records
GET /users?limit=10

# Skip 20, get next 10
GET /users?limit=10&offset=20

# Page 3 with 25 per page
GET /users?limit=25&offset=50
```

### Skip pagination

```bash
GET /users?skip=3&limit=25
```
## Field Selection

### Include specific fields

```bash
# Only get name and email
GET /users?select=name,email

# Nested fields
GET /users?select=name,address.city,address.country
```

<!-- ## Count queries

### Count documents

```bash
# Count all users
GET /users/count

# Count with filter
GET /users/count?status=active

# Response
{
  "count": 150
}
``` -->

## Aggregation queries

### Group by

```bash
# Group users by city
POST /users/aggregate
Content-Type: application/json

[
  {
    "$group": {
      "_id": "$address.city",
      "count": { "$sum": 1 },
      "avgAge": { "$avg": "$age" }
    }
  }
]
```

### Complex aggregation

```bash
POST /orders/aggregate
Content-Type: application/json

[
  { "$match": { "status": "completed" } },
  { "$unwind": "$items" },
  { "$group": {
    "_id": "$items.productId",
    "totalQuantity": { "$sum": "$items.quantity" },
    "totalRevenue": { "$sum": { "$multiply": ["$items.price", "$items.quantity"] } }
  }},
  { "$sort": { "totalRevenue": -1 } },
  { "$limit": 10 }
]
```

## Full-text search

### Setup text index

Đầu tiên cần tạo text index trong schema:

```javascript
indexes: [
  { fields: { title: 'text', content: 'text', tags: 'text' } }
]
```

### Text search queries

```bash
# Simple text search
GET /posts?$text=mongodb

# Multi-word search (OR)
GET /posts?$text=mongodb nodejs

# Phrase search
GET /posts?$text="mongodb atlas"

# Exclude words
GET /posts?$text=mongodb -sql

# With score
GET /posts?$text=mongodb&select=title,content,$score
```

## Query optimization tips

### 1. Use indexes

```bash
# Indexed query (fast)
GET /users?email=eq.john@example.com

# Non-indexed query (slow)
GET /users?bio=eq.contains.developer
```

### 2. Limit fields

```bash
# Better - only needed fields
GET /users?select=name,email&limit=100

# Worse - all fields
GET /users?limit=100
```

### 3. Use proper operators

```bash
# Better - direct comparison
GET /users?age=gte.18

# Worse - regex for numbers
GET /users?age=regex.^(1[89]|[2-9][0-9])$
```

### 4. Pagination for large datasets

```bash
# Always paginate
GET /logs?limit=100&offset=0
```

## Error handling

### Invalid queries

```bash
GET /users?invalid=operator.value
```

Response:
```json
{
  "error": "Invalid operator: operator",
  "field": "invalid",
  "validOperators": ["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin", "like", "ilike"]
}
```

### Type mismatches

```bash
GET /users?age=notanumber
```

Response:
```json
{
  "error": "Type mismatch",
  "field": "age",
  "expectedType": "number",
  "receivedValue": "notanumber"
}
```

## Bước tiếp theo

- [Authentication](./authentication) - Bảo mật API
- [Complex Queries](../how-to-guides/complex-queries) - Queries nâng cao
- [API Reference](../references/api) - Chi tiết về endpoints