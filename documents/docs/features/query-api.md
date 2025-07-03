---
sidebar_position: 2
---

# Advanced Query & Statistics API

MongoREST cung cấp Query API mạnh mẽ cho phép thực hiện các truy vấn phức tạp và thống kê dữ liệu một cách linh hoạt.

## Query Syntax Overview

### Basic Syntax

```
GET /<collection>?<filters>&<options>
```

### Parameters Structure

```
?and=(field1=op.value,field2=op.value)
&or=(field3=op.value,field4=op.value)
&select=field1,field2,relation(field)
&sort=field&order=asc|desc
&limit=20&page=2
&count=true
&dryRun=true
&debug=true
```

## Filtering Operations

### Basic Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal | `status=eq.active` |
| `neq` | Not equal | `status=neq.deleted` |
| `gt` | Greater than | `price=gt.100` |
| `gte` | Greater than or equal | `price=gte.100` |
| `lt` | Less than | `stock=lt.10` |
| `lte` | Less than or equal | `stock=lte.10` |
| `in` | In array | `status=in.(active,pending)` |
| `nin` | Not in array | `status=nin.(deleted,archived)` |
| `like` | Pattern match | `name=like.iPhone*` |
| `regex` | Regular expression | `email=regex.^test@` |
| `exists` | Field exists | `deletedAt=exists.false` |
| `null` | Is null | `parentId=null.true` |
| `empty` | Is empty | `tags=empty.false` |
| `between` | Between values | `price=between.100.500` |

### Complex Filtering

#### AND Operations

```bash
# Products that are active AND price >= 100 AND stock > 0
GET /products?and=(status=eq.active,price=gte.100,stock=gt.0)
```

#### OR Operations

```bash
# Products in Electronics OR Accessories category
GET /products?or=(category=eq.Electronics,category=eq.Accessories)
```

#### Nested AND/OR

```bash
# Complex condition: (active AND price >= 100) OR (featured AND onSale)
GET /products?or=(and=(status=eq.active,price=gte.100),and=(featured=eq.true,onSale=eq.true))
```

## Date and Time Queries

### Dynamic Date Values

```bash
# Documents created today
GET /orders?createdAt=gte.Date.now()-24*60*60*1000

# Documents expiring in next 7 days
GET /products?and=(expiredAt=lt.Date.now()+7*24*60*60*1000,expiredAt=gt.Date.now())

# Orders from last month
GET /orders?createdAt=gte.Date.now()-30*24*60*60*1000
```

### Date Operators

```javascript
// Supported date expressions
Date.now()                    // Current timestamp
Date.now() + 86400000         // Tomorrow
Date.now() - 86400000         // Yesterday
Date.now() + 7*24*60*60*1000  // Next week
```

## Relationship Queries

### Basic Relationship Filtering

```bash
# Orders where customer is VIP
GET /orders?customer.vipStatus=eq.true

# Products in featured categories
GET /products?category.featured=eq.true

# Posts by active authors
GET /posts?author.status=eq.active
```

### Nested Relationship Filtering

```bash
# Orders with products from specific supplier
GET /orders?items.product.supplier.name=eq.Apple

# Users with completed orders over $1000
GET /users?orders.status=eq.completed&orders.total=gte.1000
```

## Advanced Query Features

### Field Selection

```bash
# Select specific fields
GET /products?select=name,price,description

# Select with relationships
GET /products?select=name,price,category(name,slug),reviews(rating,comment)
```

### Sorting Options

```bash
# Simple sort
GET /products?order=price

# Sort by multiple fields
GET /products?order=acategorysc,-price

# Sort on relationship field
GET /products?order=ategory.name
```

### Pagination

```bash
# Page-based pagination
GET /products?page=2&limit=20

# Offset-based pagination
GET /products?skip=20&limit=20
```

## Special Query Modes

### Dry Run Mode

Test queries without execution:

```bash
GET /products?dryRun=true&and=(price=gte.100,stock=gt.0)

# Response:
{
  "success": true,
  "dryRun": true,
  "data": null,
  "debug": {
    "parsedQuery": {
      "filter": { "price": { "$gte": 100 }, "stock": { "$gt": 0 } }
    },
    "estimatedDocuments": 45
  }
}
```

### Debug Mode

Get detailed query information:

```bash
GET /products?debug=true&category=eq.Electronics

# Response includes:
{
  "debug": {
    "parsedQuery": {...},
    "aggregationPipeline": [...],
    "executionTime": "23ms",
    "indexesUsed": ["category_1"],
    "documentsExamined": 150
  }
}
```

### Execute Custom Query

For complex queries beyond URL parameters:

```javascript
// Using executeQuery API
const result = await core.getAdapter('mongodb', 'main').executeQuery({
  collection: 'orders',
  pipeline: [
    { $match: { status: 'completed' } },
    { $group: {
      _id: '$customerId',
      totalSpent: { $sum: '$total' },
      orderCount: { $sum: 1 }
    }},
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]
})
```

## Query Examples by Use Case

### E-commerce Queries

```bash
# Best selling products
GET /products?select=name&order=-soldCount&limit=10

# Low stock alert
GET /products?stock=lte.10&status=eq.active&select=name,sku,stock
```

### Content Management

```bash
# Published posts this month
GET /posts?and=(status=eq.published,publishedAt=gte.Date.now()-30*24*60*60*1000)
```

### Analytics Queries

```bash
# Conversion funnel
GET /events?and=(type=eq.pageview,page=in.(home,product,checkout,success))&select=page&group=page

# Revenue by category
GET /orders?status=eq.completed&select=items.product.category.name&group=items.product.category.name
```

## Summary

MongoREST Query API cung cấp:

1. **Powerful Filtering**: 15+ operators với AND/OR logic
2. **Relationship Queries**: Filter và select qua relationships
3. **Statistics**: Count, sum, avg operations
4. **Flexibility**: Dry run, debug modes
5. **Performance**: Optimized cho MongoDB

Next: [RBAC System →](./rbac)
