---
sidebar_position: 3
---

# Relationship Queries

Hướng dẫn chi tiết cách query data với relationships trong MongoREST.

## Overview

Relationship queries cho phép:
- Embed related documents
- Filter by related fields
- Aggregate across relationships
- Select specific fields from relations

## Basic Relationship Queries

### BelongsTo (N-1)

```bash
# Get order with customer info
GET /orders/123?select=orderNumber,total,customer(name,email)

# Response
{
  "orderNumber": "ORD-2024-001",
  "total": 999.99,
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### HasMany (1-N)

```bash
# Get user with their orders
GET /users/123?select=name,orders(orderNumber,total,status)

# Response
{
  "name": "John Doe",
  "orders": [
    {
      "orderNumber": "ORD-2024-001",
      "total": 999.99,
      "status": "completed"
    },
    {
      "orderNumber": "ORD-2024-002",
      "total": 1499.99,
      "status": "processing"
    }
  ]
}
```

### ManyToMany (N-N)

```bash
# Get product with categories
GET /products/123?select=name,categories(name,slug)

# Response
{
  "name": "MacBook Pro",
  "categories": [
    {
      "name": "Laptops",
      "slug": "laptops"
    },
    {
      "name": "Electronics",
      "slug": "electronics"
    }
  ]
}
```

## Field Selection in Relationships

### Select All Fields

```bash
# Get all fields from relationship
GET /orders?select=orderNumber,customer(*)

# Response includes all customer fields
{
  "orderNumber": "ORD-2024-001",
  "customer": {
    "_id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {...},
    "createdAt": "2023-01-15T10:00:00Z"
  }
}
```

### Select Specific Fields

```bash
# Select only needed fields
GET /products?select=name,price,category(name,slug),supplier(name,country)

# Response
{
  "name": "iPhone 15",
  "price": 999,
  "category": {
    "name": "Smartphones",
    "slug": "smartphones"
  },
  "supplier": {
    "name": "Apple Inc",
    "country": "USA"
  }
}
```

### Nested Field Selection

```bash
# Select nested object fields
GET /orders?select=orderNumber,customer(name,profile.avatar,profile.bio)

# Response
{
  "orderNumber": "ORD-2024-001",
  "customer": {
    "name": "John Doe",
    "profile": {
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Tech enthusiast"
    }
  }
}
```

## Nested Relationships

### Two Levels Deep

```bash
# Order → Customer → Company
GET /orders?select=orderNumber,customer(name,company(name,industry))

# Response
{
  "orderNumber": "ORD-2024-001",
  "customer": {
    "name": "John Doe",
    "company": {
      "name": "Tech Corp",
      "industry": "Software"
    }
  }
}
```

### Three+ Levels Deep

```bash
# Product → Category → Parent → Root
GET /products?select=name,category(name,parent(name,parent(name)))

# Response
{
  "name": "iPhone 15 Pro",
  "category": {
    "name": "Smartphones",
    "parent": {
      "name": "Mobile Devices",
      "parent": {
        "name": "Electronics"
      }
    }
  }
}
```

### Multiple Nested Relationships

```bash
# Complex query with multiple paths
GET /orders?select=
  orderNumber,
  customer(name,company(name)),
  items(quantity,product(name,category(name))),
  shippingAddress(street,city,country)

# Response
{
  "orderNumber": "ORD-2024-001",
  "customer": {
    "name": "John Doe",
    "company": {
      "name": "Tech Corp"
    }
  },
  "items": [
    {
      "quantity": 2,
      "product": {
        "name": "MacBook Pro",
        "category": {
          "name": "Laptops"
        }
      }
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "country": "USA"
  }
}
```

## Filtering by Relationship Fields

### Basic Relationship Filtering

```bash
# Orders from VIP customers
GET /orders?customer.vipStatus=eq.true

# Products in featured categories
GET /products?category.featured=eq.true

# Posts by verified authors
GET /posts?author.verified=eq.true&author.role=eq.editor
```

### Nested Relationship Filtering

```bash
# Orders containing products from specific supplier
GET /orders?items.product.supplier.name=eq.Apple

# Users with orders shipped to USA
GET /users?orders.shippingAddress.country=eq.USA

# Products in subcategories of Electronics
GET /products?category.parent.slug=eq.electronics
```

### Multiple Relationship Filters

```bash
# Complex filtering across relationships
GET /orders?
  customer.vipStatus=eq.true&
  items.product.category.slug=eq.electronics&
  shippingAddress.country=in.(USA,Canada)&
  payment.method=eq.credit_card
```

## Relationship Modifiers

### Limiting Related Data

```bash
# Get user with last 5 orders
GET /users/123?select=name,orders(*)!limit.5

# Get product with top 3 reviews
GET /products/123?select=name,reviews(*)!sort.rating.desc!limit.3
```

### Sorting Related Data

```bash
# Get user with orders sorted by date
GET /users/123?select=name,orders(*)!sort.createdAt.desc

# Get category with products sorted by price
GET /categories/123?select=name,products(name,price)!sort.price.asc
```

### Pagination in Relationships

```bash
# Get user with paginated orders
GET /users/123?select=name,orders(*)!skip.10!limit.10

# Second page of reviews
GET /products/123?select=name,reviews(*)!skip.20!limit.20
```

## Aggregations on Relationships

### Count

```bash
# Get users with order count
GET /users?select=name,orderCount:orders!count

# Response
{
  "name": "John Doe",
  "orderCount": 15
}
```

### Sum

```bash
# Get users with total spent
GET /users?select=name,totalSpent:orders!sum(total)

# Response
{
  "name": "John Doe",
  "totalSpent": 4567.89
}
```

### Average

```bash
# Get products with average rating
GET /products?select=name,avgRating:reviews!avg(rating),reviewCount:reviews!count

# Response
{
  "name": "iPhone 15",
  "avgRating": 4.5,
  "reviewCount": 234
}
```

### Min/Max

```bash
# Get user's order range
GET /users/123?select=
  name,
  firstOrder:orders!min(createdAt),
  lastOrder:orders!max(createdAt),
  largestOrder:orders!max(total)
```

## Advanced Relationship Patterns

### Self-Referencing Relationships

```bash
# Category with parent and children
GET /categories/123?select=name,parent(name),children(name,slug)

# Employee with manager and subordinates
GET /employees/123?select=name,manager(name,title),subordinates(name,title)
```

### Circular Reference Handling

```bash
# User → Posts → Author (same user)
GET /users/123?select=name,posts(title,content,author(name))
# MongoREST prevents infinite loops
```

### Conditional Relationships

```bash
# Only get published posts
GET /users/123?select=name,posts(title,content)&posts.status=eq.published

# Only active product categories
GET /products?select=name,categories(name)&categories.isActive=eq.true
```

## Real-World Examples

### E-commerce Dashboard

```bash
# Customer overview with recent activity
GET /users/123?select=
  name,
  email,
  memberSince,
  orderCount:orders!count,
  totalSpent:orders!sum(total),
  recentOrders:orders(orderNumber,total,status,createdAt)!sort.createdAt.desc!limit.5,
  favoriteCategory:orders.items.product.category(name)!mode
```

### Product Detail Page

```bash
# Complete product information
GET /products/123?select=
  name,
  description,
  price,
  images(*),
  category(name,slug,parent(name)),
  specifications(*),
  inStock,
  avgRating:reviews!avg(rating),
  reviewCount:reviews!count,
  reviews(rating,comment,user(name),createdAt)!sort.createdAt.desc!limit.10,
  relatedProducts:category.products(name,price,thumbnail)!limit.4
```

### Order Management

```bash
# Order with complete details
GET /orders/123?select=
  orderNumber,
  status,
  createdAt,
  customer(name,email,phone,vipStatus),
  items(
    quantity,
    price,
    subtotal,
    product(name,sku,thumbnail)
  ),
  shippingAddress(*),
  billingAddress(*),
  payment(method,status,transactionId),
  tracking(carrier,number,status),
  totalAmount,
  notes
```

### Blog Post with Engagement

```bash
# Blog post with author and engagement metrics
GET /posts/123?select=
  title,
  slug,
  content,
  publishedAt,
  author(name,bio,avatar),
  categories(name,slug),
  tags,
  viewCount,
  likeCount:likes!count,
  commentCount:comments!count,
  comments(
    content,
    author(name,avatar),
    createdAt,
    likes:commentLikes!count
  )!sort.createdAt.desc!limit.20
```

## Performance Optimization

### 1. Limit Relationship Expansion

```bash
# ✅ Good: Select only needed fields
GET /orders?select=orderNumber,customer(name,email)

# ❌ Bad: Select everything
GET /orders?select=*,customer(*),items(*,product(*))
```

### 2. Use Appropriate Limits

```bash
# ✅ Good: Limit related data
GET /users?select=name,recentOrders:orders(*)!limit.10

# ❌ Bad: No limit on large relationships
GET /users?select=name,orders(*)
```

### 3. Index Foreign Keys

```javascript
// Ensure indexes on relationship fields
{
  "indexes": [
    { "fields": { "customerId": 1 } },
    { "fields": { "productId": 1 } },
    { "fields": { "categoryId": 1 } }
  ]
}
```

### 4. Avoid Deep Nesting

```bash
# ✅ Good: Reasonable depth
GET /orders?select=customer(name,company(name))

# ❌ Bad: Too deep
GET /a?select=b(c(d(e(f(g(h(i(j))))))))
```

## Troubleshooting

### Common Issues

1. **Relationship Not Found**
```json
{
  "error": "Relationship 'customer' not defined in schema",
  "code": "INVALID_RELATIONSHIP"
}
```

2. **Circular Reference**
```json
{
  "error": "Circular reference detected: user → posts → author → posts",
  "code": "CIRCULAR_REFERENCE"
}
```

3. **Permission Denied**
```json
{
  "error": "No permission to access relationship 'orders'",
  "code": "FORBIDDEN"
}
```

### Debug Relationship Queries

```bash
# Use debug mode
GET /orders?select=customer(*)&debug=true

# Response includes aggregation pipeline
{
  "debug": {
    "pipeline": [
      {
        "$lookup": {
          "from": "users",
          "localField": "customerId",
          "foreignField": "_id",
          "as": "customer"
        }
      }
    ]
  }
}
```

## Best Practices

### 1. Design Clear Relationships

```json
// Clear relationship definition
{
  "relationships": {
    "author": {
      "type": "belongsTo",
      "collection": "users",
      "localField": "authorId",
      "foreignField": "_id",
      "description": "Post author"
    }
  }
}
```

### 2. Use Consistent Naming

```bash
# ✅ Good: Clear relationship names
GET /orders?select=customer(name),shippingAddress(*)

# ❌ Bad: Confusing names
GET /orders?select=user(name),addr(*)
```

### 3. Document Relationships

```javascript
// Add descriptions to relationships
{
  "relationships": {
    "orders": {
      "type": "hasMany",
      "description": "Customer orders",
      "collection": "orders",
      "localField": "_id",
      "foreignField": "customerId"
    }
  }
}
```

## Summary

Relationship queries trong MongoREST:

1. **Powerful**: Support all relationship types
2. **Flexible**: Unlimited nesting và filtering
3. **Performant**: Optimized aggregation pipelines
4. **Intuitive**: Natural query syntax
5. **Feature-rich**: Aggregations, sorting, pagination

Relationship queries trong MongoREST cung cấp một cách mạnh mẽ để truy vấn và hiển thị dữ liệu quan hệ phức tạp một cách dễ dàng và hiệu quả.
