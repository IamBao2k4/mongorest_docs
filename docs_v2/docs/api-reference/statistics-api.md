---
sidebar_position: 4
---

# Statistics & Aggregation API

Hướng dẫn sử dụng các tính năng thống kê và aggregation trong MongoREST.

## Overview

Statistics API cho phép:
- Count documents với filters
- Aggregate data (sum, avg, min, max)
- Group by operations
- Complex analytics queries
- Time-based statistics

## Basic Count Operations

### Simple Count

```bash
# Count all active products
GET /products?count=true&status=eq.active

# Response
{
  "success": true,
  "data": [],
  "meta": {
    "count": 156,
    "total": 156
  }
}
```

### Count with Filters

```bash
# Count products in price range
GET /products?count=true&price=gte.100&price=lte.500

# Count orders this month
GET /orders?count=true&createdAt=gte.Date.now()-30*24*60*60*1000
```

### Count with Relationships

```bash
# Count users who have placed orders
GET /users?count=true&orders.status=exists.true

# Count products with reviews
GET /products?count=true&reviews!count=gt.0
```

## Aggregation Functions

### Count Aggregation

```bash
# Users with order count
GET /users?select=name,email,orderCount:orders!count

# Response
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "orderCount": 15
  }
]
```

### Sum Aggregation

```bash
# Total revenue per user
GET /users?select=name,totalRevenue:orders!sum(total)

# Category with total product value
GET /categories?select=name,totalValue:products!sum(price)

# Order with items total
GET /orders/123?select=orderNumber,itemsTotal:items!sum(subtotal)
```

### Average Aggregation

```bash
# Products with average rating
GET /products?select=name,avgRating:reviews!avg(rating)

# Users with average order value
GET /users?select=name,avgOrderValue:orders!avg(total)

# Categories with average product price
GET /categories?select=name,avgPrice:products!avg(price)
```

### Min/Max Aggregation

```bash
# Product price range in category
GET /categories/123?select=
  name,
  minPrice:products!min(price),
  maxPrice:products!max(price)

# User order history range
GET /users/123?select=
  name,
  firstOrderDate:orders!min(createdAt),
  lastOrderDate:orders!max(createdAt),
  smallestOrder:orders!min(total),
  largestOrder:orders!max(total)
```

## Complex Statistics

### Multiple Aggregations

```bash
# Product statistics
GET /products/123?select=
  name,
  reviewStats:reviews!{
    count:count,
    avgRating:avg(rating),
    minRating:min(rating),
    maxRating:max(rating)
  }

# User purchase summary
GET /users/123?select=
  name,
  purchaseStats:orders!{
    totalOrders:count,
    totalSpent:sum(total),
    avgOrderValue:avg(total),
    lastOrderDate:max(createdAt)
  }
```

### Conditional Aggregations

```bash
# Count orders by status
GET /users/123?select=
  name,
  completedOrders:orders[status=eq.completed]!count,
  pendingOrders:orders[status=eq.pending]!count,
  cancelledOrders:orders[status=eq.cancelled]!count

# Revenue by payment method
GET /orders?select=
  creditCardRevenue:items[payment.method=eq.credit_card]!sum(total),
  paypalRevenue:items[payment.method=eq.paypal]!sum(total),
  bankTransferRevenue:items[payment.method=eq.bank_transfer]!sum(total)
```

## Time-Based Statistics

### Daily Statistics

```bash
# Today's orders
GET /orders?
  count=true&
  createdAt=gte.Date.now()-24*60*60*1000&
  createdAt=lt.Date.now()

# This week's revenue
GET /orders?
  select=totalRevenue:*!sum(total)&
  status=eq.completed&
  createdAt=gte.Date.now()-7*24*60*60*1000
```

### Monthly Comparisons

```bash
# Compare this month vs last month
GET /orders?select=
  thisMonth:*[createdAt=gte.Date.now()-30*24*60*60*1000]!{
    count:count,
    revenue:sum(total)
  },
  lastMonth:*[
    createdAt=gte.Date.now()-60*24*60*60*1000,
    createdAt=lt.Date.now()-30*24*60*60*1000
  ]!{
    count:count,
    revenue:sum(total)
  }
```

### Year-over-Year

```bash
# YoY comparison
GET /orders?select=
  thisYear:*[createdAt=gte.2024-01-01]!{
    orders:count,
    revenue:sum(total),
    avgOrder:avg(total)
  },
  lastYear:*[
    createdAt=gte.2023-01-01,
    createdAt=lt.2024-01-01
  ]!{
    orders:count,
    revenue:sum(total),
    avgOrder:avg(total)
  }
```

## Group By Operations

### Basic Grouping

```bash
# Products by category with count
GET /products?
  groupBy=categoryId&
  select=categoryId,count:*!count

# Orders by status
GET /orders?
  groupBy=status&
  select=status,count:*!count,totalValue:*!sum(total)
```

### Multiple Group By

```bash
# Sales by category and month
GET /orders?
  groupBy=items.product.categoryId,month(createdAt)&
  select=
    categoryId,
    month,
    orderCount:*!count,
    revenue:*!sum(total)
```

### Group By with Relationships

```bash
# Revenue by customer country
GET /orders?
  groupBy=customer.country&
  select=
    country:customer.country,
    orderCount:*!count,
    totalRevenue:*!sum(total),
    avgOrderValue:*!avg(total)
```

## Analytics Dashboards

### Sales Dashboard

```bash
# Complete sales analytics
GET /analytics/sales?select=
  summary:{
    totalOrders:orders!count,
    totalRevenue:orders!sum(total),
    avgOrderValue:orders!avg(total),
    uniqueCustomers:orders.customerId!distinct!count
  },
  byStatus:orders!groupBy(status)!{
    status,
    count:count,
    revenue:sum(total)
  },
  byCategory:orders.items.product!groupBy(categoryId)!{
    categoryId,
    quantity:sum(quantity),
    revenue:sum(subtotal)
  },
  recentOrders:orders!sort.createdAt.desc!limit.10
```

### Customer Analytics

```bash
# Customer insights
GET /users?select=
  totalCustomers:*!count,
  activeCustomers:*[lastLogin=gte.Date.now()-30*24*60*60*1000]!count,
  vipCustomers:*[role=eq.vip]!count,
  customersByCountry:*!groupBy(country)!{
    country,
    count:count,
    totalRevenue:orders!sum(total)
  },
  topCustomers:*!sort.orders!sum(total).desc!limit.10!{
    name,
    email,
    totalSpent:orders!sum(total),
    orderCount:orders!count
  }
```

### Inventory Analytics

```bash
# Inventory statistics
GET /products?select=
  totalProducts:*!count,
  activeProducts:*[status=eq.active]!count,
  lowStock:*[stock=lt.10]!count,
  outOfStock:*[stock=eq.0]!count,
  totalValue:*!sum(price*stock),
  byCategory:*!groupBy(categoryId)!{
    categoryId,
    count:count,
    totalStock:sum(stock),
    totalValue:sum(price*stock)
  }
```

## Performance Analytics

### Query Performance

```bash
# Slow queries analysis
GET /analytics/performance?select=
  slowQueries:queries[executionTime=gt.1000]!{
    count:count,
    avgTime:avg(executionTime),
    maxTime:max(executionTime)
  },
  queryByCollection:queries!groupBy(collection)!{
    collection,
    count:count,
    avgTime:avg(executionTime)
  }
```

### API Usage Statistics

```bash
# API usage by endpoint
GET /analytics/api-usage?select=
  totalRequests:*!count,
  byMethod:*!groupBy(method)!{
    method,
    count:count,
    avgResponseTime:avg(responseTime)
  },
  byUser:*!groupBy(userId)!limit.10!{
    userId,
    requests:count,
    avgResponseTime:avg(responseTime)
  },
  errorRate:*[status=gte.400]!count/*!count*100
```

## Real-Time Statistics

### Live Dashboard

```bash
# Real-time metrics (last 5 minutes)
GET /analytics/realtime?select=
  activeUsers:sessions[lastActivity=gte.Date.now()-5*60*1000]!count,
  currentOrders:orders[createdAt=gte.Date.now()-5*60*1000]!{
    count:count,
    revenue:sum(total)
  },
  pageViews:events[type=eq.pageview,timestamp=gte.Date.now()-5*60*1000]!count
```

### Trending Products

```bash
# Trending in last hour
GET /products?select=
  name,
  viewsLastHour:events[
    type=eq.product_view,
    timestamp=gte.Date.now()-60*60*1000
  ]!count,
  ordersLastHour:orders.items[
    createdAt=gte.Date.now()-60*60*1000
  ]!count
&sort=viewsLastHour&order=desc&limit=10
```

## Custom Metrics

### Conversion Rates

```bash
# E-commerce conversion funnel
GET /analytics/conversion?select=
  visitors:events[type=eq.visit]!count,
  productViews:events[type=eq.product_view]!count,
  addedToCart:events[type=eq.add_to_cart]!count,
  checkouts:events[type=eq.checkout]!count,
  purchases:orders[status=eq.completed]!count,
  conversionRate:orders[status=eq.completed]!count/events[type=eq.visit]!count*100
```

### Customer Lifetime Value

```bash
# CLV calculation
GET /users?select=
  name,
  email,
  lifetimeValue:orders[status=eq.completed]!sum(total),
  orderCount:orders[status=eq.completed]!count,
  avgOrderValue:orders[status=eq.completed]!avg(total),
  daysSinceFirstOrder:Date.now()-orders!min(createdAt),
  daysSinceLastOrder:Date.now()-orders!max(createdAt)
```

## Export Statistics

### CSV Export

```bash
# Export statistics as CSV
GET /users?
  select=name,email,orderCount:orders!count,totalSpent:orders!sum(total)&
  format=csv

# Response headers
Content-Type: text/csv
Content-Disposition: attachment; filename="user-statistics.csv"
```

### JSON Export

```bash
# Detailed JSON export
GET /analytics/export?
  format=json&
  pretty=true&
  select=
    users:users!count,
    orders:orders!{
      total:count,
      revenue:sum(total),
      byStatus:groupBy(status)
    },
    products:products!{
      total:count,
      byCategory:groupBy(categoryId)
    }
```

## Performance Tips

### 1. Use Indexes for Aggregations

```javascript
// Ensure indexes on aggregated fields
{
  "indexes": [
    { "fields": { "status": 1, "createdAt": -1 } },
    { "fields": { "customerId": 1, "total": 1 } }
  ]
}
```

### 2. Limit Aggregation Scope

```bash
# ✅ Good: Filter before aggregation
GET /orders?status=eq.completed&select=revenue:*!sum(total)

# ❌ Bad: Aggregate everything
GET /orders?select=revenue:*!sum(total)
```

### 3. Cache Common Statistics

```bash
# Add cache headers for statistics
GET /analytics/daily-summary
Cache-Control: public, max-age=3600
```

### 4. Use Materialized Views

```javascript
// Pre-calculate common statistics
{
  "collection": "daily_stats",
  "properties": {
    "date": { "type": "string" },
    "orderCount": { "type": "number" },
    "revenue": { "type": "number" },
    "uniqueCustomers": { "type": "number" }
  }
}
```

## Error Handling

### Common Errors

```json
// Invalid aggregation function
{
  "error": "Unknown aggregation function 'median'",
  "code": "INVALID_AGGREGATION"
}

// Field not found
{
  "error": "Cannot aggregate on non-existent field 'price'",
  "code": "FIELD_NOT_FOUND"
}

// Timeout on large aggregation
{
  "error": "Aggregation timeout after 30000ms",
  "code": "AGGREGATION_TIMEOUT"
}
```

## Best Practices

### 1. Use Appropriate Time Ranges

```bash
# ✅ Good: Specific time range
GET /orders?count=true&createdAt=gte.2024-01-01&createdAt=lt.2024-02-01

# ❌ Bad: No time constraint
GET /orders?count=true
```

### 2. Combine Multiple Statistics

```bash
# ✅ Good: Single request for multiple stats
GET /dashboard?select=
  orders:orders!count,
  revenue:orders!sum(total),
  customers:users!count

# ❌ Bad: Multiple requests
GET /orders?count=true
GET /orders?select=revenue:*!sum(total)
GET /users?count=true
```

### 3. Use Pagination for Large Results

```bash
# ✅ Good: Paginate grouped results
GET /products?groupBy=categoryId&limit=20&page=1

# ❌ Bad: Unlimited groups
GET /products?groupBy=categoryId
```

## Summary

Statistics API trong MongoREST cung cấp:

1. **Comprehensive**: Count, sum, avg, min, max functions
2. **Flexible**: Complex aggregations và grouping
3. **Performant**: Optimized MongoDB aggregations
4. **Real-time**: Support for live statistics
5. **Exportable**: Multiple output formats

Next: [Batch Operations →](./batch-operations)
