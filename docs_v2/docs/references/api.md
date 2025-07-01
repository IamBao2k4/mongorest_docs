---
sidebar_position: 1
---

# API Reference

## Base URL

```
https://your-domain.com/api
```

## Authentication

Tất cả requests cần JWT token trong header:

```
Authorization: Bearer <your-jwt-token>
```

## CRUD Endpoints

### List Documents

```http
GET /crud/{collection}
```

#### Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `collection` | string | Tên collection | `products` |
| `select` | string | Fields cần lấy | `name,price,category(name)` |
| `sort` | string | Field để sort | `createdAt` |
| `order` | string | Thứ tự sort | `asc` hoặc `desc` |
| `limit` | number | Số documents tối đa | `20` |
| `page` | number | Số trang (1-based) | `1` |
| `count` | boolean | Trả về tổng số | `true` |

#### Query Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `status=eq.active` |
| `neq` | Not equals | `status=neq.deleted` |
| `gt` | Greater than | `price=gt.100` |
| `gte` | Greater than or equal | `price=gte.100` |
| `lt` | Less than | `price=lt.500` |
| `lte` | Less than or equal | `price=lte.500` |
| `in` | In array | `status=in.(active,pending)` |
| `nin` | Not in array | `status=nin.(deleted,archived)` |
| `like` | Pattern match | `name=like.*phone*` |
| `regex` | Regular expression | `email=regex.^admin` |
| `exists` | Field exists | `deletedAt=exists.false` |
| `null` | Is null | `parentId=null.true` |
| `empty` | Is empty | `tags=empty.false` |

#### Complex Queries

##### AND Operator
```
GET /products?and=(status=eq.active,price=gte.100,price=lte.500)
```

##### OR Operator
```
GET /products?or=(category=eq.electronics,category=eq.computers)
```

##### Nested Conditions
```
GET /users?or=(and=(role=eq.vip,active=eq.true),and=(role=eq.premium,orders=gt.10))
```

#### Relationship Queries

##### Basic Relationship
```
GET /orders?select=orderNumber,customer(name,email)
```

##### Nested Relationships
```
GET /orders?select=id,customer(name,company(name,address))
```

##### Relationship Filtering
```
GET /users?select=name,orders(*)&orders.status=eq.completed
```

##### Aggregated Relationships
```
GET /products?select=name,reviewCount:reviews!count,avgRating:reviews!avg(rating)
```

#### Response Format

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "price": 99.99
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### Get Single Document

```http
GET /crud/{collection}/{id}
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `collection` | string | Tên collection |
| `id` | string | Document ID |
| `select` | string | Fields cần lấy |

#### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Product Name",
    "price": 99.99
  }
}
```

### Create Document

```http
POST /crud/{collection}
```

#### Request Body

```json
{
  "name": "New Product",
  "price": 99.99,
  "categoryId": "507f1f77bcf86cd799439012"
}
```

#### Plugin Fields

Các fields sau sẽ tự động được thêm nếu enabled:

```json
{
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "created_by": {
    "isTurnOn": true,
    "value": "{{user.id}}"
  }
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "New Product",
    "price": 99.99,
    "created_at": "2024-01-25T10:00:00Z",
    "created_by": "user_123"
  }
}
```

### Update Document (Full Replace)

```http
PUT /crud/{collection}/{id}
```

#### Request Body

```json
{
  "name": "Updated Product",
  "price": 149.99,
  "categoryId": "507f1f77bcf86cd799439012",
  "status": "active"
}
```

### Update Document (Partial)

```http
PATCH /crud/{collection}/{id}
```

#### Request Body

```json
{
  "price": 149.99,
  "status": "active"
}
```

### Delete Document

```http
DELETE /crud/{collection}/{id}
```

#### Response

```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Advanced Query Features

### Dry Run Mode

Test query without execution:

```
GET /products?dryRun=true&and=(price=gt.100)&debug=true
```

Response includes query plan:

```json
{
  "success": true,
  "dryRun": true,
  "debug": {
    "parsedQuery": {
      "filter": {"price": {"$gt": 100}}
    },
    "aggregationPipeline": [...],
    "estimatedDocuments": 150,
    "indexesUsed": ["price_1"]
  }
}
```

### Dynamic Date Values

Support for dynamic date calculations:

```
GET /products?expiredAt=lt.Date.now()+7*24*60*60*1000
```

Supported expressions:
- `Date.now()` - Current timestamp
- `Date.now() + N` - Add milliseconds
- `Date.now() - N` - Subtract milliseconds

### Special Operators

#### Between Operator
```
GET /products?price=between.100.500
```

#### Text Search
```
GET /products?search=wireless&searchFields=name,description
```

## Batch Operations

### Batch Update

```http
POST /batch/{collection}?transaction=true
```

#### Request Body

```json
{
  "operations": [
    {
      "type": "update",
      "filter": {"sku": "PROD-001"},
      "data": {"stock": 100}
    },
    {
      "type": "update",
      "filter": {"sku": "PROD-002"},
      "data": {"stock": 50}
    }
  ],
  "options": {
    "validateBeforeExecute": true,
    "rollbackOnError": true
  }
}
```

## Custom Functions

### Execute Function

```http
POST /functions/{functionName}
```

#### Request Body

```json
{
  "param1": "value1",
  "param2": "value2"
}
```

## Error Responses

### Validation Error

```json
{
  "success": false,
  "error": "Validation Error",
  "message": "Input validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

### Authentication Error

```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "code": "AUTH_ERROR"
}
```

### Permission Error

```json
{
  "success": false,
  "error": "Forbidden",
  "message": "You don't have permission to perform this action",
  "code": "PERMISSION_ERROR"
}
```

### Not Found Error

```json
{
  "success": false,
  "error": "Not Found",
  "message": "Document not found",
  "code": "NOT_FOUND"
}
```

## Rate Limiting

Rate limits per role:

| Role | Requests/Hour | Burst |
|------|---------------|-------|
| admin | 10,000 | 100 |
| user | 1,000 | 20 |
| guest | 100 | 5 |

Rate limit headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

### Cursor-based Pagination

```
GET /products?limit=20&after=507f1f77bcf86cd799439011
```

### Page-based Pagination

```
GET /products?limit=20&page=2
```

## Webhooks

### Webhook Events

- `document.created`
- `document.updated`
- `document.deleted`
- `batch.completed`
- `function.executed`

### Webhook Payload

```json
{
  "event": "document.created",
  "timestamp": "2024-01-25T10:00:00Z",
  "collection": "products",
  "documentId": "507f1f77bcf86cd799439011",
  "data": {
    // Document data
  },
  "user": {
    "id": "user_123",
    "role": "admin"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```javascript
import MongoREST from '@mongorest/client';

const client = new MongoREST({
  baseURL: 'https://api.example.com',
  token: 'your-jwt-token'
});

// List products
const products = await client.collection('products')
  .select('name', 'price', 'category(name)')
  .where('status', 'eq', 'active')
  .where('price', 'gte', 100)
  .limit(20)
  .get();

// Create product
const newProduct = await client.collection('products')
  .create({
    name: 'New Product',
    price: 99.99
  });

// Update product
await client.collection('products')
  .id('507f1f77bcf86cd799439011')
  .update({ price: 149.99 });

// Delete product
await client.collection('products')
  .id('507f1f77bcf86cd799439011')
  .delete();
```

### cURL Examples

```bash
# List products
curl -X GET "https://api.example.com/crud/products?select=name,price&status=eq.active" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create product
curl -X POST "https://api.example.com/crud/products" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"New Product","price":99.99}'

# Update product
curl -X PATCH "https://api.example.com/crud/products/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price":149.99}'

# Delete product
curl -X DELETE "https://api.example.com/crud/products/507f1f77bcf86cd799439011" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Best Practices

1. **Use Field Selection**: Only request fields you need
2. **Add Indexes**: For frequently queried fields
3. **Use Pagination**: For large datasets
4. **Cache Responses**: When data doesn't change frequently
5. **Handle Errors**: Check success field and handle errors
6. **Use Batch Operations**: For multiple updates
7. **Monitor Rate Limits**: Check rate limit headers
8. **Use Relationships**: Instead of multiple requests
9. **Enable Compression**: For large responses
10. **Use HTTPS**: Always use secure connections
