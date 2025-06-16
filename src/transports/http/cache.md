# cache.ts

## Overview
`CacheRoutes` class handles HTTP cache management endpoints for the MongoDB adapter with Redis caching capabilities.

## Class: CacheRoutes

### Constructor
```typescript
constructor(dbAdapter: CachedMongoDBAdapter)
```
- Initializes with a `CachedMongoDBAdapter` instance for cache operations

### Methods

#### `handleCacheRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean>`
Main entry point for cache-related HTTP requests. Routes requests to appropriate handlers based on HTTP method and path.

**Endpoint Pattern**: `/api/cache/{action}` or `/api/cache/{action}/{collection}`

**Returns**: `boolean` - true if request was handled as a cache request

#### `sendResponse(res: http.ServerResponse, statusCode: number, data: any): void`
Sends JSON response with CORS headers enabled

#### `sendError(res: http.ServerResponse, statusCode: number, message: string): void`
Sends error response in JSON format

### Supported Cache Operations

#### GET Operations

**`GET /api/cache/stats`**
- Returns comprehensive cache statistics and configuration
- Response includes:
  - Cache statistics
  - Cache configuration
  - Active status

**`GET /api/cache/status`**
- Returns cache status and configuration
- Response includes:
  - Active status
  - Cache configuration

#### DELETE Operations

**`DELETE /api/cache/clear`**
- Clears all cache entries

**`DELETE /api/cache/clear/{collection}`**
- Clears cache for specific collection

**`DELETE /api/cache/invalidate/{collection}`**
- Invalidates cache for specific collection (requires collection name)

#### POST Operations

**`POST /api/cache/warmup/{collection}`**
- Warms up cache for specific collection
- Request body format:
  ```json
  {
    "queries": [
      // Array of queries to cache
    ]
  }
  ```
- Uses JWT from Bearer Token header if available
- Default JWT provided for guest users

### Error Handling
- Returns 400 for invalid endpoints or missing required parameters
- Returns 405 for unsupported HTTP methods
- Returns 500 for internal server errors
- All errors are logged to console

### Security Features
- CORS enabled with wildcard origin (`*`)
- JWT token support for authenticated cache warmup operations
- Default guest JWT provided when no Bearer token is present

### Helper Methods

#### `parseBody(req: http.IncomingMessage): Promise<any>`
Parses JSON request body from incoming HTTP request

### Response Format
All responses are JSON with appropriate HTTP status codes:
- Success: `{ data... }`
- Error: `{ error: "message" }`