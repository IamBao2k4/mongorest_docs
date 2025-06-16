# MongoREST API Documentation

## Overview
MongoREST provides a REST API interface for MongoDB with PostgREST-compatible query syntax, JWT authentication, and optional Redis caching.

## Base URL
```
http://localhost:3000
```

## Authentication
All endpoints support JWT authentication via Bearer token:
```
Authorization: Bearer <jwt_token>
```

If no token is provided, a default guest token is used with limited permissions.

## REST API Endpoints

### 1. Query Collection (GET)
Retrieve documents from a collection with filtering, sorting, and pagination.

**Endpoint:** `GET /api/{collection}`

**Query Parameters:**
- PostgREST-compatible operators (see Query Syntax section)
- `order` - Sort order
- `limit` - Number of records (default: 10)
- `skip` - Number of records to skip
- `select` - Fields to include/exclude

**Response:**
```json
{
  "data": [...],
  "totalRecord": 100,
  "totalPage": 10,
  "limit": 10,
  "currentPage": 1
}
```

**Examples:**
```bash
# Get all active users
GET /api/users?status=eq.active

# Get products with price between 100-500, sorted by price
GET /api/products?price=gte.100&price=lte.500&order=price.desc

# Get first 20 orders with pagination
GET /api/orders?limit=20&skip=0

# Get users with specific fields only
GET /api/users?select=name,email,status
```

### 2. Get Single Document (GET)
Retrieve a single document by ID.

**Endpoint:** `GET /api/{collection}/{id}`

**Response:** Single document object

**Example:**
```bash
GET /api/users/507f1f77bcf86cd799439011
```

### 3. Create Document (POST)
Create a new document in the collection.

**Endpoint:** `POST /api/{collection}`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "status": "active"
}
```

**Response:**
```json
{
  "insertedId": "507f1f77bcf86cd799439011"
}
```

### 4. Bulk Create (POST)
Create multiple documents at once.

**Endpoint:** `POST /api/{collection}/bulk`

**Request Body:**
```json
[
  {"name": "User 1", "email": "user1@example.com"},
  {"name": "User 2", "email": "user2@example.com"}
]
```

**Response:**
```json
{
  "insertedCount": 2,
  "insertedIds": ["id1", "id2"]
}
```

### 5. Update Document (PATCH)
Update a single document by ID.

**Endpoint:** `PATCH /api/{collection}/{id}`

**Request Body:**
```json
{
  "status": "inactive",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

**Response:**
```json
{
  "matchedCount": 1,
  "modifiedCount": 1
}
```

### 6. Bulk Update (PATCH)
Update multiple documents with different criteria.

**Endpoint:** `PATCH /api/{collection}/bulk`

**Request Body:**
```json
[
  {
    "filter": {"status": "pending"},
    "update": {"status": "active"}
  },
  {
    "filter": {"expired": true},
    "update": {"status": "inactive"}
  }
]
```

**Response:**
```json
{
  "matchedCount": 15,
  "modifiedCount": 12,
  "operations": 2
}
```

### 7. Delete Document (DELETE)
Delete a single document by ID.

**Endpoint:** `DELETE /api/{collection}/{id}`

**Response:**
```json
{
  "deletedCount": 1
}
```

### 8. Bulk Delete (DELETE)
Delete multiple documents based on filters.

**Endpoint:** `DELETE /api/{collection}/bulk`

**Request Body:**
```json
[
  {"status": "inactive"},
  {"createdAt": {"$lt": "2023-01-01"}}
]
```

**Response:**
```json
{
  "deletedCount": 25,
  "operations": 2
}
```

## PostgREST Query Syntax

### Comparison Operators
- `eq` - Equals: `?status=eq.active`
- `neq` - Not equals: `?status=neq.inactive`
- `gt` - Greater than: `?price=gt.100`
- `gte` - Greater than or equal: `?price=gte.100`
- `lt` - Less than: `?age=lt.30`
- `lte` - Less than or equal: `?age=lte.30`

### Text Search Operators
- `like` - Pattern match (case-sensitive): `?name=like.*john*`
- `ilike` - Pattern match (case-insensitive): `?email=ilike.*@gmail.com`
- `match` - Regex match: `?description=match.product.*2024`
- `imatch` - Regex match (case-insensitive): `?title=imatch.^important`

### Array Operators
- `in` - In array: `?status=in.(active,pending,processing)`
- `cs` - Contains (array contains value): `?tags=cs.{javascript,nodejs}`
- `cd` - Contained by: `?permissions=cd.{read,write,delete}`
- `ov` - Overlaps: `?categories=ov.{electronics,computers}`

### Null Operators
- `is` - Is null/true/false: `?deleted=is.null`
- `isdistinct` - Is distinct from: `?status=isdistinct.active`

### Logical Operations
- `not` - Negation: `?age=not.gt.65`
- `or` - OR condition: `?or=(status.eq.active,status.eq.pending)`
- `and` - AND condition: `?and=(price.gte.100,price.lte.500)`

### Complex Query Examples
```bash
# Get active users or admin users
GET /api/users?or=(status.eq.active,role.eq.admin)

# Get products with price 100-500 AND in stock
GET /api/products?and=(price.gte.100,price.lte.500,stock.gt.0)

# Get orders not in cancelled or refunded status
GET /api/orders?status=not.in.(cancelled,refunded)

# Text search for products with "laptop" in name
GET /api/products?name=ilike.*laptop*

# Get users with specific tags
GET /api/users?tags=cs.{premium,verified}
```

### Sorting
Use the `order` parameter with field name and direction:
```bash
# Sort by single field
GET /api/products?order=price.desc
GET /api/users?order=createdAt.asc

# Sort by multiple fields
GET /api/products?order=category.asc,price.desc
```

### Pagination
Use `limit` and `skip` parameters:
```bash
# Get page 2 with 20 items per page
GET /api/products?limit=20&skip=20

# Get first 5 items
GET /api/products?limit=5&skip=0
```

### Field Selection
Use the `select` parameter to include/exclude fields:
```bash
# Include only specific fields
GET /api/users?select=name,email,status

# Exclude specific fields (prefix with -)
GET /api/users?select=-password,-secretKey
```

## Cache Management API

### Get Cache Statistics
**Endpoint:** `GET /api/cache/stats`

**Response:**
```json
{
  "stats": {
    "connected": true,
    "keyCount": 150,
    "memoryInfo": "..."
  },
  "config": {
    "enabled": true,
    "connected": true,
    "config": {
      "enableReadCache": true,
      "enableWriteThrough": true,
      "defaultTTL": 300,
      "cacheOnWrite": false
    }
  },
  "active": true
}
```

### Get Cache Status
**Endpoint:** `GET /api/cache/status`

**Response:**
```json
{
  "active": true,
  "config": {
    "enabled": true,
    "connected": true,
    "config": {...}
  }
}
```

### Clear All Cache
**Endpoint:** `DELETE /api/cache/clear`

**Response:**
```json
{
  "message": "All cache cleared"
}
```

### Clear Collection Cache
**Endpoint:** `DELETE /api/cache/clear/{collection}`

**Example:** `DELETE /api/cache/clear/users`

**Response:**
```json
{
  "message": "Cache cleared for collection: users"
}
```

### Invalidate Collection Cache
**Endpoint:** `DELETE /api/cache/invalidate/{collection}`

**Example:** `DELETE /api/cache/invalidate/products`

**Response:**
```json
{
  "message": "Cache invalidated for collection: products"
}
```

### Warmup Cache
Pre-populate cache with common queries.

**Endpoint:** `POST /api/cache/warmup/{collection}`

**Request Body:**
```json
{
  "queries": [
    {
      "filter": {"status": "active"},
      "limit": 20,
      "skip": 0
    },
    {
      "filter": {"category": "electronics"},
      "sort": {"price": -1},
      "limit": 10
    }
  ]
}
```

**Response:**
```json
{
  "message": "Cache warmed up for collection: products",
  "queryCount": 2
}
```

## Response Headers

All responses include these headers:
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *`
- `X-Response-Time: 25.50ms` - Request processing time

When caching is enabled:
- `X-Cache-Enabled: true/false` - Cache status
- `X-Cache-Status: HIT/MISS` - Cache hit/miss indicator

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message",
  "details": "Detailed error information (optional)"
}
```

### Common Error Codes
- `400` - Bad Request (invalid parameters, missing required fields)
- `404` - Not Found (collection not specified)
- `405` - Method Not Allowed
- `500` - Internal Server Error

### Error Examples
```json
// 400 - Invalid query parameters
{
  "error": "Invalid query parameters",
  "details": "Unknown operator: invalidop"
}

// 404 - Collection not found
{
  "error": "Collection not specified"
}

// 500 - Database error
{
  "error": "Database error",
  "details": "Connection timeout"
}
```

## CORS Support

The API supports CORS with the following configuration:
- **Allowed Origins:** * (all origins)
- **Allowed Methods:** GET, POST, PATCH, DELETE, OPTIONS
- **Allowed Headers:** Content-Type, Authorization

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting in production.

## Best Practices

1. **Use Pagination**: Always use `limit` and `skip` for large datasets
2. **Select Only Needed Fields**: Use `select` parameter to reduce payload size
3. **Cache Warmup**: Pre-warm cache for frequently accessed data
4. **JWT Tokens**: Always use proper JWT tokens in production
5. **Error Handling**: Implement proper error handling for all API responses

## Example Client Implementation

### JavaScript/Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

// Get active users
const getActiveUsers = async () => {
  const response = await api.get('/users', {
    params: {
      status: 'eq.active',
      limit: 20,
      order: 'createdAt.desc'
    }
  });
  return response.data;
};

// Create new user
const createUser = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Update user
const updateUser = async (userId, updates) => {
  const response = await api.patch(`/users/${userId}`, updates);
  return response.data;
};
```

### cURL Examples
```bash
# Get products with complex filters
curl -X GET "http://localhost:3000/api/products?and=(price.gte.100,price.lte.500)&category=eq.electronics&order=price.asc&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Create new order
curl -X POST "http://localhost:3000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"userId": "123", "products": ["abc", "def"], "total": 299.99}'

# Clear cache for products
curl -X DELETE "http://localhost:3000/api/cache/clear/products" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```