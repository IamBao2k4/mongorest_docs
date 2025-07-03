---
sidebar_position: 4
---

# Relationship System

MongoREST cung cấp hệ thống relationship mạnh mẽ, cho phép query và embed dữ liệu từ các collections liên quan một cách tự động.

## Tổng Quan

Relationship system hỗ trợ 3 loại quan hệ chính:
- **BelongsTo (N-1)**: Order → Customer
- **HasMany (1-N)**: User → Orders
- **ManyToMany (N-N)**: Products ↔ Categories

## Định Nghĩa Relationships

### Schema Configuration

```json
{
  "collection": "orders",
  "relationships": {
    "customer": {
      "type": "belongsTo",
      "collection": "users",
      "localField": "customerId",
      "foreignField": "_id",
      "alias": "customer"
    },
    "items": {
      "type": "hasMany",
      "collection": "order_items",
      "localField": "_id",
      "foreignField": "orderId",
      "defaultSort": { "createdAt": -1 },
      "pagination": {
        "defaultLimit": 20,
        "maxLimit": 100
      }
    }
  }
}
```

## BelongsTo Relationships (N-1)

### Definition

```json
{
  "relationships": {
    "category": {
      "type": "belongsTo",
      "collection": "categories",
      "localField": "categoryId",
      "foreignField": "_id",
      "description": "Product category"
    }
  }
}
```

### Query Examples

```bash
# Get product with category info
GET /products/123?select=name,price,category(*)

# Get orders with customer details
GET /orders?select=orderNumber,total,customer(name,email,phone)

# Filter by related field
GET /products?category.featured=eq.true&select=name,category(name)
```

### Generated MongoDB Pipeline

```javascript
[
  {
    $lookup: {
      from: "categories",
      localField: "categoryId",
      foreignField: "_id",
      as: "category"
    }
  },
  {
    $addFields: {
      category: { $arrayElemAt: ["$category", 0] }
    }
  },
  {
    $project: {
      name: 1,
      price: 1,
      "category.name": 1,
      "category.slug": 1
    }
  }
]
```

## HasMany Relationships (1-N)

### Definition

```json
{
  "relationships": {
    "orders": {
      "type": "hasMany",
      "collection": "orders",
      "localField": "_id",
      "foreignField": "userId",
      "defaultSort": { "createdAt": -1 },
      "defaultFilters": { "status": { "$ne": "cancelled" } },
      "pagination": {
        "defaultLimit": 10,
        "maxLimit": 50
      }
    }
  }
}
```

### Query Examples

```bash
# Get user with recent orders
GET /users/123?select=name,orders(orderNumber,total,createdAt)!limit.5

# Get user with order count
GET /users/123?select=name,orderCount:orders!count

# Get user with total spent
GET /users/123?select=name,totalSpent:orders!sum(total)

# Filter orders within relationship
GET /users?select=name,orders(*)&orders.status=eq.completed
```

### Advanced HasMany Features

#### Pagination in Relationships

```bash
# Get first 10 orders
GET /users/123?select=name,orders(*)!limit.10

# Skip first 10, get next 10
GET /users/123?select=name,orders(*)!skip.10!limit.10

# Sort orders by total descending
GET /users/123?select=name,orders(*)!sort.total.desc!limit.5
```

#### Aggregations

```bash
# Count
GET /users?select=name,orderCount:orders!count

# Sum
GET /users?select=name,totalRevenue:orders!sum(total)

# Average
GET /users?select=name,avgOrderValue:orders!avg(total)

# Min/Max
GET /users?select=name,largestOrder:orders!max(total)
```

### Generated Pipeline for HasMany

```javascript
[
  {
    $lookup: {
      from: "orders",
      let: { userId: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ["$userId", "$$userId"] },
            status: { $ne: "cancelled" } // Default filter
          }
        },
        { $sort: { createdAt: -1 } }, // Default sort
        { $limit: 10 }, // Pagination
        {
          $project: {
            orderNumber: 1,
            total: 1,
            createdAt: 1
          }
        }
      ],
      as: "orders"
    }
  }
]
```

## ManyToMany Relationships (N-N)

### Definition

```json
{
  "relationships": {
    "categories": {
      "type": "manyToMany",
      "collection": "categories",
      "through": "product_categories",
      "localField": "_id",
      "throughLocalField": "productId",
      "throughForeignField": "categoryId",
      "foreignField": "_id"
    }
  }
}
```

### Junction Table Schema

```json
{
  "collection": "product_categories",
  "properties": {
    "productId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "categoryId": {
      "type": "string",
      "pattern": "^[0-9a-fA-F]{24}$"
    },
    "isPrimary": {
      "type": "boolean",
      "default": false
    }
  },
  "indexes": [
    { "fields": { "productId": 1, "categoryId": 1 }, "unique": true },
    { "fields": { "productId": 1 } },
    { "fields": { "categoryId": 1 } }
  ]
}
```

### Query Examples

```bash
# Get product with all categories
GET /products/123?select=name,categories(name,slug)

# Get products in specific category
GET /products?categories._id=eq.cat_123&select=name,price

# Get category with product count
GET /categories?select=name,productCount:products!count

# Filter by junction table field
GET /products?select=name,categories(name)&product_categories.isPrimary=eq.true
```

### Generated Pipeline for ManyToMany

```javascript
[
  // First lookup: Get junction records
  {
    $lookup: {
      from: "product_categories",
      localField: "_id",
      foreignField: "productId",
      as: "_junction"
    }
  },
  // Second lookup: Get related categories
  {
    $lookup: {
      from: "categories",
      localField: "_junction.categoryId",
      foreignField: "_id",
      as: "categories"
    }
  },
  // Clean up junction data
  {
    $project: {
      _junction: 0
    }
  }
]
```

## Nested Relationships

### Multi-Level Nesting

```bash
# 3 levels deep
GET /orders?select=orderNumber,customer(name,company(name,address))

# Product → Category → Parent Category
GET /products?select=name,category(name,parent(name,slug))

# Complex nesting with filters
GET /users?select=name,orders(orderNumber,items(product(name,category(name))))&orders.status=eq.completed
```

### Performance Considerations

```javascript
// Limit nesting depth
{
  "mongorest": {
    "relationships": {
      "maxDepth": 5, // Maximum nesting levels
      "maxExpansions": 10 // Maximum relationships per query
    }
  }
}
```

## Relationship Filtering

### Basic Filtering

```bash
# Orders from VIP customers
GET /orders?customer.vipStatus=eq.true

# Products in active categories
GET /products?category.isActive=eq.true

# Users with completed orders
GET /users?orders.status=eq.completed
```

### Advanced Filtering

```bash
# Multiple conditions on relationships
GET /orders?and=(customer.country=eq.USA,customer.vipStatus=eq.true)

# Nested relationship filtering
GET /orders?items.product.category.featured=eq.true

# Aggregate filtering
GET /users?orders!count=gte.10
```

## Relationship Query Syntax

### Select Syntax

```
select=field1,field2,relationship(field1,field2)
```

Examples:
```bash
# Basic
select=name,category(name)

# All fields
select=name,category(*)

# Multiple relationships
select=name,category(name),reviews(rating,comment)

# Nested
select=name,category(name,parent(name))
```

### Modifiers

```
relationship!modifier.value
```

Available modifiers:
- `!limit.N` - Limit results
- `!skip.N` - Skip results
- `!sort.field.asc/desc` - Sort results
- `!count` - Count aggregation
- `!sum(field)` - Sum aggregation
- `!avg(field)` - Average aggregation
- `!min(field)` - Minimum value
- `!max(field)` - Maximum value

### Aliases

```bash
# Rename in response
select=name,cats:categories(name)

# Aggregation with alias
select=name,totalOrders:orders!count
```

## Performance Optimization

### Index Recommendations

```json
{
  "indexes": [
    // For belongsTo relationships
    { "fields": { "categoryId": 1 } },
    { "fields": { "userId": 1 } },
    
    // For hasMany relationships (on target collection)
    { "fields": { "orderId": 1 } },
    { "fields": { "productId": 1 } },
    
    // For manyToMany (on junction table)
    { "fields": { "productId": 1, "categoryId": 1 }, "unique": true },
    { "fields": { "productId": 1 } },
    { "fields": { "categoryId": 1 } }
  ]
}
```

### Query Optimization Tips

1. **Limit Expansions**
```bash
# ✅ Good: Specific fields
GET /orders?select=id,customer(name,email)

# ❌ Bad: Everything
GET /orders?select=*,customer(*),items(*)
```

2. **Use Projections**
```bash
# ✅ Good: Project early
GET /products?select=name,price&category.featured=eq.true

# ❌ Bad: Fetch all then filter
GET /products?select=*
```

3. **Paginate HasMany**
```bash
# ✅ Good: Limit related data
GET /users?select=name,orders(*)!limit.10

# ❌ Bad: Unlimited
GET /users?select=name,orders(*)
```

## Common Patterns

### 1. Dashboard Queries

```bash
# User dashboard with stats
GET /users/me?select=name,email,orderCount:orders!count,totalSpent:orders!sum(total),recentOrders:orders(orderNumber,total,createdAt)!sort.createdAt.desc!limit.5
```

### 2. Category Navigation

```bash
# Category tree with counts
GET /categories?select=name,slug,children(name,slug,productCount:products!count),productCount:products!count&parentId=null
```

### 3. Order Details

```bash
# Complete order information
GET /orders/123?select=*,customer(name,email,phone),items(quantity,price,product(name,sku)),shippingAddress(*),payment(method,status)
```

### 4. Search Results

```bash
# Products with related info for search
GET /products?search=laptop&select=name,price,thumbnail,category(name),avgRating:reviews!avg(rating),reviewCount:reviews!count&limit=20
```

## Summary

Relationship system trong MongoREST:

1. **Powerful**: Support all common relationship types
2. **Flexible**: Query syntax như SQL nhưng cho MongoDB
3. **Performant**: Optimized aggregation pipelines
4. **Intuitive**: Natural query syntax
5. **Extensible**: Custom modifiers và aggregations