---
sidebar_position: 1
---

# Basic Query Examples

Hướng dẫn chi tiết các query cơ bản trong MongoREST với ví dụ thực tế.

## CRUD Operations

### 1. List Documents (GET)

#### Basic List

```bash
# Get all products
GET /products

# Response
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": 999,
      "status": "active"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50
  }
}
```

#### With Pagination

```bash
# Page 2, 20 items per page
GET /products?page=2&limit=20

# Or using skip/limit
GET /products?skip=20&limit=20
```

#### With Field Selection

```bash
# Only get specific fields
GET /products?select=name,price,status

# Exclude specific fields
GET /products?select=-cost,-supplier
```

### 2. Get Single Document (GET)

```bash
# Get product by ID
GET /products/507f1f77bcf86cd799439011

# Response
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "price": 999,
    "description": "Latest iPhone model",
    "status": "active",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-20T15:30:00Z"
  }
}
```

### 3. Create Document (POST)

```bash
# Create new product
POST /products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Samsung Galaxy S24",
  "price": 899,
  "description": "Latest Samsung flagship",
  "categoryId": "507f1f77bcf86cd799439012",
  "status": "active"
}

# Response
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Samsung Galaxy S24",
    "price": 899,
    "description": "Latest Samsung flagship",
    "categoryId": "507f1f77bcf86cd799439012",
    "status": "active",
    "createdAt": "2024-01-25T10:00:00Z",
    "updatedAt": "2024-01-25T10:00:00Z"
  }
}
```

### 4. Update Document (PUT/PATCH)

#### Full Update (PUT)

```bash
# Replace entire document
PUT /products/507f1f77bcf86cd799439013
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "name": "Samsung Galaxy S24 Ultra",
  "price": 1199,
  "description": "Premium Samsung flagship",
  "categoryId": "507f1f77bcf86cd799439012",
  "status": "active"
}
```

#### Partial Update (PATCH)

```bash
# Update specific fields only
PATCH /products/507f1f77bcf86cd799439013
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "price": 1099,
  "status": "sale"
}
```

### 5. Delete Document (DELETE)

```bash
# Delete product
DELETE /products/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_JWT_TOKEN

# Response
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Filtering

### Basic Filters

```bash
# Equal
GET /products?status=eq.active

# Not equal
GET /products?status=neq.deleted

# Greater than
GET /products?price=gt.500

# Greater than or equal
GET /products?price=gte.500

# Less than
GET /products?stock=lt.10

# Less than or equal
GET /products?stock=lte.10
```

### Array Filters

```bash
# In array
GET /products?status=in.(active,sale)

# Not in array
GET /products?status=nin.(deleted,archived)

# Array contains
GET /products?tags=contains.electronics
```

### String Filters

```bash
# Like (case insensitive)
GET /products?name=like.iPhone*

# Regular expression
GET /products?sku=regex.^PROD-[0-9]+$

# Starts with
GET /products?name=like.Samsung*

# Contains
GET /products?description=like.*smartphone*
```

### Boolean Filters

```bash
# Is null
GET /products?deletedAt=null.true

# Is not null
GET /products?deletedAt=null.false

# Field exists
GET /products?customField=exists.true

# Field doesn't exist
GET /products?customField=exists.false
```

## Sorting

### Single Field Sort

```bash
# Short syntax
GET /products?sort=-createdAt  # Descending
GET /products?sort=price      # Ascending
```

### Multiple Field Sort

```bash
# Sort by category, then price
GET /products?sort=category,price&order=asc,desc

# Using array syntax
GET /products?sort[0]=category&sort[1]=price&order[0]=asc&order[1]=desc
```

## Field Selection

### Basic Selection

```bash
# Select specific fields
GET /products?select=name,price,status

# Select all except specific fields
GET /products?select=-cost,-internalNotes
```

### Nested Object Selection

```bash
# Select nested fields
GET /products?select=name,price,specifications.color,specifications.size

# Using dot notation
GET /products?select=name,metadata.tags,metadata.keywords
```

## Text Search

### Basic Search

```bash
# Search in default fields
GET /products?search=laptop

# Search in specific fields
GET /products?search=gaming&searchFields=name,description

# Search with other filters
GET /products?search=laptop&status=eq.active&price=lte.2000
```

### Advanced Search

```bash
# Fuzzy search
GET /products?search=~iphon  # Matches "iphone"

# Phrase search
GET /products?search="macbook pro"

# Boolean search
GET /products?search=laptop+AND+gaming
GET /products?search=phone+OR+tablet
```

## Response Control

### Pagination Info

```bash
# Get with full pagination metadata
GET /products?page=2&limit=10&includeMeta=true

# Response includes
{
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrevious": true
  }
}
```

### Count Only

```bash
# Get only count, no data
GET /products?count=true&status=eq.active

# Response
{
  "success": true,
  "data": [],
  "meta": {
    "count": 87,
    "total": 87
  }
}
```

### Response Format

```bash
# Minimal response
GET /products?format=minimal

# Full response with metadata
GET /products?format=full

# CSV export (if supported)
GET /products?format=csv
```

## Combined Examples

### E-commerce Product Search

```bash
# Active products in Electronics, price $100-$1000, sorted by popularity
GET /products?status=eq.active&category=eq.Electronics&price=gte.100&price=lte.1000&sort=views&order=desc&limit=20
```

### Inventory Management

```bash
# Low stock products that need reorder
GET /products?stock=lt.10&status=eq.active&select=name,sku,stock,supplier&sort=stock&order=asc
```

### Customer Orders

```bash
# Recent orders with pagination
GET /orders?createdAt=gte.2024-01-01&sort=createdAt&order=desc&page=1&limit=50
```

## Error Responses

### Validation Error

```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Input validation failed",
  "details": {
    "price": "Price must be a positive number",
    "name": "Name is required"
  },
  "code": "VALIDATION_ERROR"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Document not found",
  "code": "NOT_FOUND"
}
```

### Permission Error

```json
{
  "success": false,
  "error": "ForbiddenError",
  "message": "You do not have permission to perform this action",
  "code": "FORBIDDEN"
}
```

## Tips & Best Practices

### 1. Use Field Selection

```bash
# ✅ Good: Only request needed fields
GET /products?select=name,price,thumbnail

# ❌ Bad: Get everything when you need 3 fields
GET /products
```

### 2. Paginate Large Results

```bash
# ✅ Good: Use reasonable limits
GET /orders?limit=50

# ❌ Bad: No pagination
GET /orders?limit=10000
```

### 3. Filter Early

```bash
# ✅ Good: Filter at database level
GET /products?status=eq.active&category=eq.Electronics

# ❌ Bad: Get all then filter in application
GET /products  # Then filter in code
```

### 4. Use Indexes

```bash
# Fields used in filters should have indexes
GET /products?sku=eq.PROD-12345  # sku field should be indexed
```

### 5. Combine Operations

```bash
# ✅ Good: One request with all operations
GET /products?status=eq.active&sort=price&limit=10&select=name,price

# ❌ Bad: Multiple requests
GET /products
# Then filter, sort, limit in application
```

## Common Patterns

### 1. Autocomplete

```bash
GET /products?name=like.iph*&select=name,slug&limit=10
```

### 2. Faceted Search

```bash
# Get products with category counts
GET /products?status=eq.active&groupBy=category&count=true
```

### 3. Date Range Queries

```bash
# This month's data
GET /orders?createdAt=gte.2024-01-01&createdAt=lt.2024-02-01
```

### 4. Null Handling

```bash
# Find products without category
GET /products?categoryId=null.true

# Find products with category
GET /products?categoryId=null.false
```

## Summary

Basic queries trong MongoREST:

1. **RESTful**: Standard HTTP methods
2. **Powerful**: Rich filtering và operators
3. **Flexible**: Sorting, pagination, field selection
4. **Intuitive**: Natural query syntax
5. **Performant**: Database-level operations

Next: [Advanced Queries →](./advanced-queries)
