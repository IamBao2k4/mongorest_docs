---
sidebar_position: 3
---

# Query Operators

Danh sách operators hỗ trợ trong queries.

## Comparison Operators

| Operator | Mô tả | Ví dụ |
|----------|-------|-------|
| `eq` | Bằng | `?age[eq]=25` |
| `ne` | Không bằng | `?status[ne]=deleted` |
| `gt` | Lớn hơn | `?age[gt]=18` |
| `gte` | Lớn hơn hoặc bằng | `?age[gte]=18` |
| `lt` | Nhỏ hơn | `?age[lt]=65` |
| `lte` | Nhỏ hơn hoặc bằng | `?age[lte]=65` |
| `in` | Trong danh sách | `?status[in]=active,pending` |
| `nin` | Không trong danh sách | `?status[nin]=deleted,banned` |

## Logical Operators

```bash
# OR condition
GET /users?or[0][name]=John&or[0][email]=john@example.com

# AND condition (mặc định)
GET /users?name=John&age=25
```

## Text Search

```bash
# Contains
GET /users?name[contains]=john

# Starts with
GET /users?email[startsWith]=john

# Ends with
GET /users?email[endsWith]=@example.com

# Regex
GET /users?name[regex]=/^john/i
```

## Array Operators

```bash
# Array contains
GET /posts?tags[contains]=javascript

# Array size
GET /posts?tags[size]=3
```

## Date Operators

```bash
# Date range
GET /posts?createdAt[gte]=2024-01-01&createdAt[lt]=2024-02-01
```
