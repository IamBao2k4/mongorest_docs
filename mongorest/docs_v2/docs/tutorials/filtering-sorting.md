---
sidebar_position: 3
---

# Filtering & Sorting

Hướng dẫn sử dụng filters và sorting.

## Basic Filtering

```bash
# Exact match
GET /users?name=John

# Multiple conditions
GET /users?name=John&age=25
```

## Operators

```bash
# Greater than
GET /users?age[gt]=25

# Less than
GET /users?age[lt]=50

# In array
GET /users?status[in]=active,pending

# Not equal
GET /users?status[ne]=deleted
```

## Sorting

```bash
# Ascending
GET /users?sort=name

# Descending
GET /users?sort=-createdAt

# Multiple fields
GET /users?sort=name,-age
```

## Pagination

```bash
# Limit & Offset
GET /users?limit=10&offset=20

# Page-based
GET /users?page=2&perPage=10
```

## Select Fields

```bash
# Only specific fields
GET /users?select=name,email

# Exclude fields
GET /users?select=-password,-__v
```
