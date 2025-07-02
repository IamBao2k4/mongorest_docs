---
sidebar_position: 2
---

# Basic Queries

Hướng dẫn sử dụng các queries cơ bản trong MongoREST.

## SELECT - Lấy dữ liệu

### Lấy tất cả documents
```bash
GET /users
```

### Lấy document theo ID
```bash
GET /users/507f1f77bcf86cd799439011
```

### Filtering
```bash
# Exact match
GET /users?name=John

# Operators
GET /users?age=gte.18
GET /users?age=lt.65
GET /users?name=like.*john*
```

### Sorting
```bash
GET /users?order=name.asc,age.desc
```

### Pagination
```bash
GET /users?limit=10&offset=20
```

## INSERT - Thêm dữ liệu

```bash
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

## UPDATE - Cập nhật

### Update toàn bộ
```bash
PUT /users/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.new@example.com",
  "age": 31
}
```

### Update một phần
```bash
PATCH /users/507f1f77bcf86cd799439011
Content-Type: application/json

{
  "age": 32
}
```

## DELETE - Xóa dữ liệu

```bash
DELETE /users/507f1f77bcf86cd799439011
```