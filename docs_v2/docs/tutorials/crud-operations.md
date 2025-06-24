---
sidebar_position: 2
---

# CRUD Operations

Hướng dẫn thực hiện các thao tác CRUD cơ bản.

## Create (POST)

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

## Read (GET)

```bash
# Get all
curl http://localhost:3000/users

# Get by ID
curl http://localhost:3000/users/123

# With filters
curl http://localhost:3000/users?name=John
```

## Update (PATCH/PUT)

```bash
# PATCH (partial update)
curl -X PATCH http://localhost:3000/users/123 \
  -H "Content-Type: application/json" \
  -d '{"email": "newemail@example.com"}'

# PUT (full replace)
curl -X PUT http://localhost:3000/users/123 \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com", "age": 30}'
```

## Delete (DELETE)

```bash
curl -X DELETE http://localhost:3000/users/123
```
