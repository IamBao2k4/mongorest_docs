---
sidebar_position: 2
---

# Complex Queries Guide

## Tổng Quan

MongoREST hỗ trợ query syntax mạnh mẽ cho phép bạn thực hiện các truy vấn phức tạp với relationships, filtering, aggregations và nhiều tính năng khác.

## Basic Query Parameters

### Select Fields

Chọn fields cụ thể để trả về:

```
GET /products?select=name,price,stock
```

### Sorting

Sort theo một hoặc nhiều fields:

```
GET /products?sort=price&order=asc
GET /products?sort=category,price&order=asc,desc
```

### Pagination

```
GET /products?limit=20&page=2
// hoặc
GET /products?limit=20&skip=20
```

## Filter Operators

### Comparison Operators

```
// Equal
GET /products?status=eq.active

// Not equal
GET /products?status=neq.deleted

// Greater than
GET /products?price=gt.100

// Greater than or equal
GET /products?price=gte.100

// Less than
GET /products?stock=lt.10

// Less than or equal
GET /products?price=lte.500
```

### Array Operators

```
// In array
GET /products?status=in.(active,pending,draft)

// Not in array
GET /products?status=nin.(deleted,archived)
```

### String Operators

```
// Pattern matching (case-insensitive)
GET /products?name=like.*phone*

// Regular expression
GET /products?email=regex.^admin@

// Starts with
GET /products?sku=like.PROD-*

// Ends with
GET /products?email=like.*@company.com
```

### Existence Operators

```
// Field exists
GET /products?discount=exists.true

// Field doesn't exist
GET /products?deletedAt=exists.false

// Field is null
GET /products?parentId=null.true

// Field is not null
GET /products?parentId=null.false

// Array is empty
GET /products?tags=empty.true
```

## Complex Filter Combinations

### AND Operator

Kết hợp nhiều điều kiện với AND:

```
GET /products?and=(status=eq.active,price=gte.100,price=lte.500,stock=gt.0)
```

Tương đương với:
```javascript
{
  status: "active",
  price: { $gte: 100, $lte: 500 },
  stock: { $gt: 0 }
}
```

### OR Operator

Kết hợp điều kiện với OR:

```
GET /products?or=(category=eq.electronics,category=eq.computers)
```

### Nested AND/OR

Kết hợp phức tạp:

```
GET /users?or=(and=(role=eq.vip,lastPurchase=gte.Date.now()-30*24*60*60*1000),and=(role=eq.premium,totalPurchases=gte.5000))
```

Điều này tìm users là:
- VIP và có mua hàng trong 30 ngày, HOẶC
- Premium và có tổng mua hàng >= 5000

## Relationship Queries

### Basic Relationship Embedding

```
// Embed category info
GET /products?select=name,price,category(name,slug)

// Embed multiple relationships
GET /orders?select=orderNumber,customer(name,email),items(productId,quantity)
```

### Nested Relationships

```
// 3 levels deep
GET /orders?select=id,customer(name,company(name,address))

// Multiple nested
GET /posts?select=title,author(name,profile(avatar)),categories(name,parent(name))
```

### Relationship Filtering

Filter dựa trên relationship fields:

```
// Orders của VIP customers
GET /orders?customer.vipStatus=eq.true

// Products trong featured categories
GET /products?category.featured=eq.true&select=name,price,category(name)

// Posts của active authors
GET /posts?author.status=eq.active&author.role=in.(admin,editor)
```

### Aggregated Relationships

```
// Count relationships
GET /users?select=name,orderCount:orders!count

// Sum values
GET /users?select=name,totalSpent:orders!sum(totalAmount)

// Average values
GET /products?select=name,avgRating:reviews!avg(rating)

// Multiple aggregations
GET /products?select=name,reviewCount:reviews!count,avgRating:reviews!avg(rating),totalSold:orders!sum(items.quantity)
```

## Dynamic Date Queries

### Date Comparisons

```
// Documents created today
GET /posts?createdAt=gte.Date.now()-24*60*60*1000

// Expiring in next 7 days
GET /products?expiredAt=lt.Date.now()+7*24*60*60*1000&expiredAt=gt.Date.now()

// Last 30 days
GET /orders?orderDate=gte.Date.now()-30*24*60*60*1000
```

### Date Expressions

```
// Start of today
GET /events?date=gte.Date.today()

// End of this month
GET /subscriptions?expiresAt=lte.Date.endOfMonth()

// Specific date
GET /orders?orderDate=gte.2024-01-01&orderDate=lt.2024-02-01
```

## Advanced Query Features

### Text Search

Search across multiple fields:

```
GET /products?search=wireless&searchFields=name,description,tags
```

### Count Total

Get total count với results:

```
GET /products?status=eq.active&count=true
```

Response includes:
```json
{
  "data": [...],
  "meta": {
    "total": 150,
    "count": 20
  }
}
```

### Dry Run Mode

Test query without executing:

```
GET /products?dryRun=true&and=(price=gt.100)&debug=true
```

Response:
```json
{
  "dryRun": true,
  "debug": {
    "parsedQuery": {...},
    "aggregationPipeline": [...],
    "estimatedDocuments": 150,
    "indexesUsed": ["price_1"]
  }
}
```

### Field Aliases

Rename fields trong response:

```
GET /products?select=productName:name,cost:price,inStock:stock
```

## Real-World Examples

### 1. E-commerce Product Search

Tìm products trong category Electronics, giá từ $100-500, còn hàng, sort theo popularity:

```
GET /products?and=(category.slug=eq.electronics,price=gte.100,price=lte.500,stock=gt.0)&select=name,price,stock,category(name),reviewCount:reviews!count,avgRating:reviews!avg(rating)&sort=reviewCount,avgRating&order=desc,desc&limit=20
```

### 2. Order Management Dashboard

Lấy orders đang xử lý của VIP customers với tổng > $1000:

```
GET /orders?and=(status=in.(processing,shipped),totalAmount=gte.1000)&customer.vipStatus=eq.true&select=orderNumber,totalAmount,status,customer(name,email,vipStatus),items(productId,quantity,price)&sort=orderDate&order=desc&limit=50
```

### 3. Content Management

Tìm published posts của active authors trong 30 ngày qua:

```
GET /posts?and=(status=eq.published,publishedAt=gte.Date.now()-30*24*60*60*1000)&author.status=eq.active&select=title,slug,excerpt,publishedAt,author(name,avatar),categories(name),viewCount,commentCount:comments!count&sort=viewCount&order=desc
```

### 4. User Analytics

Tìm high-value users (VIP hoặc Premium với high spending):

```
GET /users?or=(and=(role=eq.vip,lastPurchase=gte.Date.now()-30*24*60*60*1000),and=(role=eq.premium,totalPurchases=gte.5000))&select=name,email,role,profile(phone,country),orderCount:orders!count,totalSpent:orders!sum(totalAmount),lastOrder:orders(orderDate)!sort.orderDate.desc!limit.1
```

### 5. Inventory Alert

Products sắp hết hàng hoặc hết hạn:

```
GET /products?or=(stock=lte.10,and=(expiredAt=lt.Date.now()+7*24*60*60*1000,expiredAt=gt.Date.now()))&select=name,sku,stock,expiredAt,supplier(name,contact)&sort=stock,expiredAt&order=asc,asc
```

## Query với RBAC

Queries tự động được filter theo user permissions:

### User Role: Guest
```
GET /products?select=name,price,description
// Chỉ thấy public fields
```

### User Role: User
```
GET /products?select=name,price,stock,reviews(*)
// Thấy thêm stock và reviews
```

### User Role: Admin
```
GET /products?select=*,supplier(*),cost,profit
// Full access to all fields
```

## Performance Tips

### 1. Use Indexes

Ensure có indexes cho filtered fields:

```javascript
// Nếu thường query theo status và price
{
  "indexes": [
    { "fields": { "status": 1, "price": 1 } }
  ]
}
```

### 2. Limit Nested Data

Thay vì:
```
GET /users?select=*,orders(*)
```

Tốt hơn:
```
GET /users?select=name,email,recentOrders:orders(orderNumber,total)!limit.5
```

### 3. Use Projections

Chỉ select fields cần thiết:
```
GET /products?select=name,price,stock
```

### 4. Paginate Large Results

Always use pagination cho large datasets:
```
GET /orders?limit=50&page=1
```

## Troubleshooting

### Query Not Working

1. **Check operator syntax**: `=eq.` not `=`
2. **Verify field names**: Case-sensitive
3. **Check data types**: Numbers vs strings
4. **Test incrementally**: Build complex queries step by step

### Debug Mode

```
GET /products?debug=true&yourQuery
```

Shows:
- Parsed query
- MongoDB pipeline
- Execution plan
- Performance metrics

### Common Errors

```json
// Invalid operator
{
  "error": "Invalid operator 'eqq' for field 'status'"
}

// Field not found
{
  "error": "Field 'invalidField' does not exist in schema"
}

// Permission denied
{
  "error": "You don't have permission to access field 'cost'"
}
```

## Best Practices

1. **Start Simple**: Test basic queries first
2. **Use Aliases**: Make response cleaner with aliases
3. **Optimize Relationships**: Only fetch needed relationship data
4. **Cache Complex Queries**: Use caching for expensive queries
5. **Monitor Performance**: Use debug mode to check execution
6. **Document Queries**: Save important queries for reuse
7. **Use Variables**: In code, build queries programmatically
8. **Test with Data**: Ensure queries work with real data volumes
