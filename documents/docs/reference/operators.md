# Query Operators Reference

## Tổng quan

MongoREST hỗ trợ một bộ operators phong phú cho việc query data, tương thích với PostgREST syntax và mở rộng thêm các tính năng cho MongoDB.

## Basic Operators

### Comparison Operators

#### eq (Equal)
```bash
# Syntax: field=eq.value
GET /products?name=eq.iPhone 15
GET /users?status=eq.active
GET /orders?totalAmount=eq.1000
```

#### neq, ne (Not Equal)
```bash
# Syntax: field=neq.value hoặc field=ne.value
GET /products?status=neq.discontinued
GET /users?role=ne.guest
```

#### gt (Greater Than)
```bash
# Syntax: field=gt.value
GET /products?price=gt.100
GET /orders?createdAt=gt.2024-01-01
```

#### gte (Greater Than or Equal)
```bash
# Syntax: field=gte.value
GET /products?stock=gte.10
GET /users?age=gte.18
```

#### lt (Less Than)
```bash
# Syntax: field=lt.value
GET /products?price=lt.500
GET /events?timestamp=lt.2024-12-31T23:59:59Z
```

#### lte (Less Than or Equal)
```bash
# Syntax: field=lte.value
GET /products?rating=lte.3.5
GET /orders?totalAmount=lte.10000
```

### Array Operators

#### in (In Array)
```bash
# Syntax: field=in.(value1,value2,value3)
GET /products?status=in.(active,pending)
GET /users?role=in.(admin,moderator,editor)
GET /orders?paymentMethod=in.(card,paypal)
```

#### nin (Not In Array)
```bash
# Syntax: field=nin.(value1,value2,value3)
GET /products?category=nin.(electronics,clothing)
GET /users?status=nin.(banned,suspended)
```

### Pattern Matching Operators

#### like (Pattern Match - Case Insensitive)
```bash
# Syntax: field=like.pattern
# Use * as wildcard
GET /products?name=like.*phone*
GET /users?email=like.*@gmail.com
GET /posts?title=like.How to*
```

#### regex (Regular Expression)
```bash
# Syntax: field=regex.pattern
GET /products?sku=regex.^PROD-[0-9]{4}$
GET /users?username=regex.^[a-z]{3,}$
GET /posts?slug=regex.^[a-z0-9-]+$
```

### Existence Operators

#### exists
```bash
# Syntax: field=exists.true/false
GET /products?discount=exists.true
GET /users?deletedAt=exists.false
GET /posts?featuredImage=exists.true
```

#### null
```bash
# Syntax: field=null.true/false
GET /products?categoryId=null.true
GET /users?email=null.false
GET /orders?notes=null.true
```

#### empty
```bash
# Syntax: field=empty.true/false
# Check if string/array is empty
GET /products?tags=empty.false
GET /users?bio=empty.true
GET /posts?comments=empty.false
```

## Advanced Operators

### Range Operators

#### between (Custom Extension)
```bash
# Syntax: field=between.min.max
GET /products?price=between.100.500
GET /orders?createdAt=between.2024-01-01.2024-01-31
GET /users?age=between.25.35
```

### Date Operators

#### Date Comparisons
```bash
# Support for various date formats
GET /orders?createdAt=gte.2024-01-01
GET /orders?createdAt=gte.2024-01-01T10:00:00Z
GET /orders?createdAt=gte.Date.now()-7*24*60*60*1000  # 7 days ago
```

### Logical Operators

#### and
```bash
# Syntax: and=(condition1,condition2,...)
GET /products?and=(status=eq.active,price=gte.100,price=lte.500)
GET /users?and=(role=eq.user,verified=eq.true,createdAt=gte.2024-01-01)
```

#### or
```bash
# Syntax: or=(condition1,condition2,...)
GET /products?or=(featured=eq.true,rating=gte.4.5)
GET /users?or=(role=eq.admin,role=eq.moderator)
```

#### Combined and/or
```bash
# Complex logical combinations
GET /products?or=(and=(category=eq.electronics,price=lt.1000),and=(category=eq.books,price=lt.50))
```

## Relationship Operators

### Nested Field Access
```bash
# Syntax: relationship.field=operator.value
GET /orders?customer.status=eq.vip
GET /products?category.featured=eq.true
GET /posts?author.role=in.(admin,editor)
```

### Relationship Filtering
```bash
# Filter main collection based on relationship
GET /users?orders.totalAmount=gte.1000
GET /products?reviews.rating=gte.4
GET /categories?products.stock=gt.0
```

## Aggregation Operators

### Count
```bash
# Syntax: field!count
GET /users?select=name,orderCount:orders!count
GET /categories?select=name,productCount:products!count
```

### Sum
```bash
# Syntax: field!sum(property)
GET /users?select=name,totalSpent:orders!sum(totalAmount)
GET /products?select=name,totalSold:orderItems!sum(quantity)
```

### Average
```bash
# Syntax: field!avg(property)
GET /products?select=name,avgRating:reviews!avg(rating)
GET /categories?select=name,avgPrice:products!avg(price)
```

### Min/Max
```bash
# Syntax: field!min(property) or field!max(property)
GET /products?select=name,lowestPrice:variants!min(price)
GET /users?select=name,highestOrder:orders!max(totalAmount)
```

## Special Operators

### Text Search
```bash
# Full-text search across multiple fields
GET /products?search=wireless mouse&searchFields=name,description
GET /posts?search=mongodb&searchFields=title,content,tags
```

### Geo Operators (MongoDB Specific)
```bash
# Near point
GET /stores?location=near.lat:10.7769.lng:106.6959.maxDistance:5000

# Within polygon/bounds
GET /stores?location=within.bounds:[[106.6,10.7],[106.7,10.8]]
```

## Modifiers

### Sorting
```bash
# Single field sort
GET /products?sort=price&order=asc
GET /posts?sort=publishedAt&order=desc

# Multiple field sort
GET /products?sort=category,price&order=asc,desc
```

### Pagination
```bash
# Limit and offset
GET /products?limit=20&offset=40

# Page-based pagination
GET /products?page=3&limit=20
```

### Field Selection
```bash
# Select specific fields
GET /products?select=name,price,stock

# Select with relationships
GET /orders?select=orderNumber,totalAmount,customer(name,email)

# Exclude fields (use -)
GET /users?select=-password,-internalNotes
```

## Type Coercion

MongoREST automatically detects and converts data types:

### Numbers
```javascript
price=eq.100        // → { price: 100 }
price=eq.99.99      // → { price: 99.99 }
quantity=eq.0       // → { quantity: 0 }
```

### Booleans
```javascript
active=eq.true      // → { active: true }
featured=eq.false   // → { featured: false }
```

### Dates
```javascript
createdAt=gte.2024-01-01                    // → ISO date
createdAt=gte.2024-01-01T10:00:00Z         // → ISO datetime
createdAt=gte.Date.now()                    // → Current timestamp
createdAt=gte.Date.now()-86400000           // → 24 hours ago
```

### ObjectIds
```javascript
_id=eq.507f1f77bcf86cd799439011            // → ObjectId
userId=eq.507f1f77bcf86cd799439011         // → ObjectId
```

### Null Values
```javascript
parentId=eq.null    // → { parentId: null }
deletedAt=eq.null   // → { deletedAt: null }
```

## Query Examples

### Complex Product Query
```bash
GET /products?
  and=(
    status=eq.active,
    price=between.50.500,
    stock=gt.0
  )&
  category.featured=eq.true&
  or=(
    tags=in.(bestseller,new),
    rating=gte.4.5
  )&
  select=name,price,category(name),avgRating:reviews!avg(rating)&
  sort=price&
  order=asc&
  limit=20
```

### User Analytics Query
```bash
GET /users?
  and=(
    createdAt=gte.2024-01-01,
    orders.totalAmount=gte.100
  )&
  select=
    name,
    email,
    orderCount:orders!count,
    totalSpent:orders!sum(totalAmount),
    avgOrderValue:orders!avg(totalAmount),
    lastOrder:orders(orderNumber,createdAt)!sort.createdAt.desc!limit.1&
  sort=totalSpent&
  order=desc&
  limit=50
```

### Advanced Filtering with Relationships
```bash
GET /posts?
  and=(
    status=eq.published,
    publishedAt=gte.Date.now()-30*24*60*60*1000
  )&
  author.role=in.(admin,editor)&
  categories.slug=in.(technology,programming)&
  comments.status=eq.approved&
  select=
    title,
    slug,
    author(name,avatar),
    categories(name,slug),
    commentCount:comments!count,
    avgRating:comments!avg(rating)&
  sort=commentCount&
  order=desc
```

## Performance Tips

### 1. Use Indexes
Ensure fields used in filters have indexes:
```javascript
// Good candidates for indexes
- status
- createdAt
- price
- Foreign keys (userId, categoryId, etc.)
```

### 2. Limit Relationship Depth
```bash
# Avoid deep nesting
# Bad: 4+ levels deep
GET /users?select=orders(items(product(category(parent(*)))))

# Good: Limit to 2-3 levels
GET /users?select=orders(items(product(name,price)))
```

### 3. Use Field Selection
```bash
# Bad: Select everything
GET /products?select=*,reviews(*),category(*)

# Good: Select only needed fields
GET /products?select=name,price,reviews(rating,comment),category(name)
```

### 4. Paginate Large Results
```bash
# Always use pagination for large collections
GET /orders?limit=50&page=1

# Use cursor-based pagination for real-time data
GET /events?after=507f1f77bcf86cd799439011&limit=100
```

## Error Handling

### Invalid Operator
```json
{
  "error": "Invalid operator",
  "message": "Unknown operator 'foo' for field 'price'",
  "validOperators": ["eq", "neq", "gt", "gte", "lt", "lte", "in", "nin"]
}
```

### Type Mismatch
```json
{
  "error": "Type error",
  "message": "Invalid value 'abc' for numeric field 'price'",
  "field": "price",
  "expectedType": "number"
}
```

### Invalid Syntax
```json
{
  "error": "Syntax error",
  "message": "Invalid array syntax for 'in' operator. Use: field=in.(value1,value2)",
  "field": "status",
  "operator": "in"
}
```

## Custom Operators

MongoREST allows extending operators through plugins:

```javascript
// Register custom operator
mongorest.registerOperator('nearby', (value, field) => {
  const [lat, lng, radius] = value.split(',').map(Number);
  return {
    [field]: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radius
      }
    }
  };
});

// Usage
// GET /stores?location=nearby.10.7769,106.6959,5000
```

## Next Steps

- Xem [API Reference](../api-reference/basic-queries.md) để biết thêm ví dụ
- Đọc [Query API](../features/query-api.md) để hiểu query processing
- Tham khảo [Performance Guide](../architecture/data-flow.md) cho optimization tips