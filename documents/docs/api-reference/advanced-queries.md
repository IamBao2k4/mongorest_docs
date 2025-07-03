---
sidebar_position: 2
---

# Advanced Queries với AND/OR

Hướng dẫn sử dụng các complex queries với logical operators AND/OR trong MongoREST.

## Logical Operators Overview

MongoREST hỗ trợ các logical operators:
- **AND**: Tất cả điều kiện phải đúng
- **OR**: Ít nhất một điều kiện đúng
- **Nested**: Kết hợp AND/OR phức tạp

## AND Operations

### Basic AND

```bash
# Products that are active AND price >= 100
GET /products?and=(status=eq.active,price=gte.100)

# Equivalent to MongoDB:
{ $and: [{ status: "active" }, { price: { $gte: 100 } }] }
```

### Multiple Conditions

```bash
# Active products with price 100-500 AND in stock
GET /products?and=(status=eq.active,price=gte.100,price=lte.500,stock=gt.0)

# With URL encoding
GET /products?and=%28status%3Deq.active%2Cprice%3Dgte.100%2Cprice%3Dlte.500%2Cstock%3Dgt.0%29
```

### AND with Different Fields

```bash
# Orders from VIP customers AND total > 1000 AND status completed
GET /orders?and=(customer.vipStatus=eq.true,totalAmount=gt.1000,status=eq.completed)
```

## OR Operations

### Basic OR

```bash
# Products in Electronics OR Computers category
GET /products?or=(category=eq.Electronics,category=eq.Computers)

# Equivalent to MongoDB:
{ $or: [{ category: "Electronics" }, { category: "Computers" }] }
```

### Multiple OR Conditions

```bash
# Products that are on sale OR featured OR new arrival
GET /products?or=(onSale=eq.true,featured=eq.true,isNew=eq.true)
```

### OR with Complex Values

```bash
# Orders with multiple possible statuses
GET /orders?or=(status=eq.pending,status=eq.processing,status=eq.shipped)

# Alternative using IN operator (more efficient)
GET /orders?status=in.(pending,processing,shipped)
```

## Nested AND/OR Combinations

### OR of ANDs

```bash
# (Active AND price > 100) OR (Featured AND on sale)
GET /products?or=(and=(status=eq.active,price=gt.100),and=(featured=eq.true,onSale=eq.true))

# MongoDB equivalent:
{
  $or: [
    { $and: [{ status: "active" }, { price: { $gt: 100 } }] },
    { $and: [{ featured: true }, { onSale: true }] }
  ]
}
```

### AND of ORs

```bash
# Active products AND (category Electronics OR Computers)
GET /products?and=(status=eq.active,or=(category=eq.Electronics,category=eq.Computers))

# MongoDB equivalent:
{
  $and: [
    { status: "active" },
    { $or: [{ category: "Electronics" }, { category: "Computers" }] }
  ]
}
```

### Deep Nesting

```bash
# Complex business rule
GET /products?or=(
  and=(status=eq.active,price=lt.100,stock=gt.50),
  and=(featured=eq.true,or=(category=eq.Electronics,category=eq.Accessories)),
  and=(clearance=eq.true,discount=gte.50)
)
```

## Real-World Examples

### E-commerce Scenarios

#### 1. Product Search with Filters

```bash
# Active products under $500 in Electronics or Computers, with stock
GET /products?and=(
  status=eq.active,
  price=lte.500,
  stock=gt.0,
  or=(category=eq.Electronics,category=eq.Computers)
)&select=name,price,category,stock&sort=price&order=asc
```

#### 2. Promotional Products

```bash
# Products on sale OR featured OR with discount > 20%
GET /products?or=(
  onSale=eq.true,
  featured=eq.true,
  discount=gt.20
)&select=name,price,discount,originalPrice
```

#### 3. Inventory Alert

```bash
# Low stock (< 10) OR expiring soon (< 30 days) AND active
GET /products?and=(
  status=eq.active,
  or=(
    stock=lt.10,
    expiryDate=lt.Date.now()+30*24*60*60*1000
  )
)&select=name,sku,stock,expiryDate
```

### User Management

#### 1. Active Premium Users

```bash
# VIP or Premium users who are active
GET /users?and=(
  status=eq.active,
  or=(role=eq.vip,role=eq.premium)
)&select=name,email,role,lastLogin
```

#### 2. Users Needing Attention

```bash
# Users who haven't logged in for 30 days OR have incomplete profiles
GET /users?or=(
  lastLogin=lt.Date.now()-30*24*60*60*1000,
  profileComplete=eq.false
)&select=name,email,lastLogin,profileComplete
```

### Order Management

#### 1. Priority Orders

```bash
# Rush orders OR VIP customer orders OR high value orders
GET /orders?or=(
  isRush=eq.true,
  customer.vipStatus=eq.true,
  totalAmount=gte.1000
)&select=orderNumber,customer(name),totalAmount,status&sort=createdAt&order=desc
```

#### 2. Problem Orders

```bash
# Delayed orders OR payment failed OR customer complaints
GET /orders?or=(
  and=(status=eq.shipped,shippedDate=lt.Date.now()-7*24*60*60*1000),
  payment.status=eq.failed,
  hasComplaint=eq.true
)&select=orderNumber,status,payment.status,customer(name,email)
```

## Advanced Filtering Patterns

### Date Range with Status

```bash
# Orders from last month that are completed or shipped
GET /orders?and=(
  createdAt=gte.Date.now()-30*24*60*60*1000,
  createdAt=lt.Date.now(),
  or=(status=eq.completed,status=eq.shipped)
)
```

### Multi-field Search

```bash
# Search for "laptop" in name OR description OR tags
GET /products?or=(
  name=like.*laptop*,
  description=like.*laptop*,
  tags=contains.laptop
)
```

### Price Range with Categories

```bash
# Electronics OR Computers between $500-$2000
GET /products?and=(
  or=(category=eq.Electronics,category=eq.Computers),
  price=gte.500,
  price=lte.2000
)
```

## Complex Business Rules

### 1. Discount Eligibility

```bash
# Products eligible for additional discount
# (Clearance AND stock > 100) OR (Seasonal AND 30 days old) OR (Overstocked)
GET /products?or=(
  and=(clearance=eq.true,stock=gt.100),
  and=(seasonal=eq.true,createdAt=lt.Date.now()-30*24*60*60*1000),
  stock=gt.500
)
```

### 2. Customer Segmentation

```bash
# High-value customers: (VIP) OR (Total purchases > $5000 AND 10+ orders)
GET /users?or=(
  role=eq.vip,
  and=(totalPurchases=gt.5000,orderCount=gte.10)
)&select=name,email,role,totalPurchases,orderCount
```

### 3. Content Moderation

```bash
# Posts needing review: (Reported 3+ times) OR (New user AND contains links) OR (Flagged keywords)
GET /posts?or=(
  reportCount=gte.3,
  and=(author.isNew=eq.true,content=regex.https?://),
  hasRestrictedKeywords=eq.true
)
```

## Performance Optimization

### 1. Use Indexes

```bash
# Ensure indexes on filtered fields
// Index: { status: 1, price: 1 }
GET /products?and=(status=eq.active,price=gte.100)
```

### 2. Order Conditions by Selectivity

```bash
# ✅ Good: Most selective condition first
GET /products?and=(sku=eq.PROD-12345,status=eq.active)

# ❌ Less optimal: Generic condition first
GET /products?and=(status=eq.active,sku=eq.PROD-12345)
```

### 3. Prefer IN over OR for Same Field

```bash
# ✅ Good: Using IN operator
GET /products?category=in.(Electronics,Computers,Phones)

# ❌ Less optimal: Multiple OR conditions
GET /products?or=(category=eq.Electronics,category=eq.Computers,category=eq.Phones)
```

## Debugging Complex Queries

### Use Debug Mode

```bash
# Add debug=true to see parsed query
GET /products?and=(status=eq.active,price=gte.100)&debug=true

# Response includes:
{
  "debug": {
    "parsedFilter": {
      "$and": [
        { "status": "active" },
        { "price": { "$gte": 100 } }
      ]
    },
    "executionPlan": "...",
    "indexesUsed": ["status_1_price_1"]
  }
}
```

### Test with Dry Run

```bash
# Test without executing
GET /products?and=(complex=query)&dryRun=true
```

## Common Mistakes

### 1. Incorrect Parentheses

```bash
# ❌ Wrong: Missing closing parenthesis
GET /products?and=(status=eq.active,price=gte.100

# ✅ Correct: Balanced parentheses
GET /products?and=(status=eq.active,price=gte.100)
```

### 2. Wrong Operator Placement

```bash
# ❌ Wrong: Operator outside conditions
GET /products?status=eq.active&and=(price=gte.100)

# ✅ Correct: All conditions inside AND
GET /products?and=(status=eq.active,price=gte.100)
```

### 3. Mixing Syntax

```bash
# ❌ Wrong: Mixing query styles
GET /products?status=eq.active&or=(featured=eq.true)

# ✅ Correct: Consistent style
GET /products?and=(status=eq.active,or=(featured=eq.true,onSale=eq.true))
```

## Best Practices

### 1. Keep It Readable

```bash
# Format complex queries for readability
GET /products?
  and=(
    status=eq.active,
    or=(
      category=eq.Electronics,
      category=eq.Computers
    ),
    price=lte.1000
  )&
  select=name,price,category&
  sort=price&
  order=asc
```

### 2. Use URL Encoding

```javascript
// Encode complex queries
const query = encodeURIComponent('and=(status=eq.active,price=gte.100)');
const url = `/products?${query}`;
```

### 3. Build Programmatically

```javascript
// Use a query builder
const query = new QueryBuilder()
  .and([
    { field: 'status', op: 'eq', value: 'active' },
    { field: 'price', op: 'gte', value: 100 }
  ])
  .or([
    { field: 'featured', op: 'eq', value: true },
    { field: 'onSale', op: 'eq', value: true }
  ])
  .build();
```

## Summary

Advanced queries với AND/OR trong MongoREST:

1. **Powerful**: Support complex business logic
2. **Flexible**: Unlimited nesting levels
3. **Intuitive**: Natural syntax
4. **Performant**: Translates to efficient MongoDB queries
5. **Debuggable**: Debug mode và dry run

Next: [Relationship Queries →](./relationship-queries)
