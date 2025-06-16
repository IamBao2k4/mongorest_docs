# http.ts

## Overview
`HttpServer` class provides a complete HTTP server implementation for REST API operations with MongoDB, including optional Redis caching support and PostgREST-style query syntax.

## Class: HttpServer

### Constructor
```typescript
constructor(dbAdapter: IDatabaseAdapter, config: HttpServerConfig)
```
- `dbAdapter`: Database adapter instance (supports caching if `CachedMongoDBAdapter` is used)
- `config`: Server configuration with port and optional host

### Configuration
```typescript
interface HttpServerConfig {
  port: number;
  host?: string;
}
```

### Main Features

#### 1. REST API Endpoints
- **Base URL Pattern**: `/api/{collection}` or `/api/{collection}/{id}`
- **Bulk Operations**: `/api/{collection}/bulk`

#### 2. Supported HTTP Methods
- **GET**: Query collections with PostgREST syntax
- **POST**: Create single or bulk documents
- **PATCH**: Update single or bulk documents
- **DELETE**: Delete single or bulk documents
- **OPTIONS**: CORS preflight support

#### 3. PostgREST Query Support
Converts PostgREST-style query parameters to MongoDB queries using `PostgRESTToMongoConverter`

### API Operations

#### GET Operations
```
GET /api/{collection}?{postgrest_params}
```
- Supports PostgREST query syntax
- Automatic MongoDB query conversion
- JWT authentication support (default guest JWT provided)
- Cache status headers when caching is enabled

#### POST Operations
```
POST /api/{collection}         # Single document
POST /api/{collection}/bulk    # Multiple documents
```
- Creates new documents in the collection
- Returns created document(s) with 201 status

#### PATCH Operations
```
PATCH /api/{collection}/{id}   # Single document
PATCH /api/{collection}/bulk   # Multiple documents
```
- Updates existing documents
- Requires ID for single updates
- Bulk updates accept filter criteria in request body

#### DELETE Operations
```
DELETE /api/{collection}/{id}  # Single document
DELETE /api/{collection}/bulk  # Multiple documents
```
- Removes documents from collection
- Requires ID for single deletes
- Bulk deletes accept filter criteria in request body

### Response Headers

#### Standard Headers
- `Content-Type: application/json`
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

#### Performance Headers
- `X-Response-Time`: Request processing time in milliseconds

#### Cache Headers (when caching enabled)
- `X-Cache-Enabled`: "true" or "false"
- `X-Cache-Status`: Set by cache layer for hit/miss information

### Methods

#### `start(): Promise<void>`
Starts the HTTP server
- Ensures database connection
- Logs server status including cache configuration
- Lists available cache management endpoints if caching is enabled

#### `stop(): Promise<void>`
Stops the HTTP server gracefully

#### `gracefulShutdown(): Promise<void>`
Performs complete shutdown:
1. Stops HTTP server
2. Disconnects database
3. Exits process with appropriate code

### Error Handling

#### Response Format
```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

#### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (invalid parameters)
- 404: Not Found (collection not specified)
- 405: Method Not Allowed
- 500: Internal Server Error

### Cache Integration
- Automatically detects `CachedMongoDBAdapter`
- Initializes `CacheRoutes` for cache management endpoints
- Provides cache status in response headers
- Routes `/api/cache/*` requests to cache management handler

### Security Features
- CORS enabled with wildcard origin
- JWT token support for authentication
- Default guest JWT for unauthenticated requests:
  ```
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

### Performance Features
- Response time measurement for all requests
- Streaming JSON body parsing
- Efficient error handling and logging

### Helper Methods

#### `parseBody(req: http.IncomingMessage): Promise<any>`
Parses JSON request body with proper error handling

#### `parsePath(pathname: string)`
Extracts collection name, document ID, and bulk operation flag from URL

#### `convertPostgrestQuery(queryParams, collection)`
Converts PostgREST query parameters to MongoDB query format

#### `measureResponseTime(req, res)`
Adds response time measurement to all requests

### Logging
- Server start/stop messages
- Cache status information
- Error logging for debugging
- Query conversion logging