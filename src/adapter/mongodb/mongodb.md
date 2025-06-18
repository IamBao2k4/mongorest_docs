# mongodb.ts

## Overview
`MongoDBAdapter` class provides a complete MongoDB database adapter implementation with connection pooling, parallel operations, and RBAC (Role-Based Access Control) support.

## Class: MongoDBAdapter

### Inheritance
- Extends `DataBase` class for RBAC functionality
- Implements `IDatabaseAdapter` interface

### Configuration

```typescript
interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
  options?: {
    maxPoolSize?: number;         // Default: 50
    minPoolSize?: number;         // Default: 5
    maxIdleTimeMS?: number;       // Default: 30000 (30 seconds)
    serverSelectionTimeoutMS?: number; // Default: 5000 (5 seconds)
    connectTimeoutMS?: number;    // Default: 10000 (10 seconds)
  };
}
```

### Connection Management

#### `connect(): Promise<void>`
Establishes connection to MongoDB with optimized connection pooling
- Applies default options if not specified
- Creates MongoClient with connection pooling
- Connects to specified database

#### `disconnect(): Promise<void>`
Gracefully closes MongoDB connection
- Closes client connection
- Cleans up internal references
- Logs disconnection status

#### `isConnected(): boolean`
Returns connection status

### Query Operations

#### `find(collection: string, options: QueryOptions, jwt: string): Promise<QueryResult>`

Performs advanced queries with parallel execution and RBAC filtering.

**Features:**
- Parallel execution of count and data queries
- Support for aggregation pipelines
- Automatic pagination calculations
- RBAC filtering on results

**QueryOptions:**
```typescript
{
  filter?: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  sort?: Record<string, 1 | -1>;
  pipeline?: Record<string, any>[];
  limit?: number;  // Default: 10
  skip?: number;   // Default: 0
}
```

**Returns:**
```typescript
{
  data: any[];        // RBAC-filtered results
  totalRecord: number;
  totalPage: number;
  limit: number;
  currentPage: number;
}
```

### Insert Operations

#### `insertOne(collection: string, document: any): Promise<SingleInsertResult>`
Inserts a single document
- Returns: `{ insertedId: ObjectId }`

#### `insertMany(collection: string, documents: any[]): Promise<BulkInsertResult>`
Inserts multiple documents with parallel batch processing
- Batch size: 100 documents
- Parallel execution for performance
- Returns: `{ insertedCount: number, insertedIds: ObjectId[] }`

### Update Operations

#### `updateOne(collection: string, id: any, updateFields: any): Promise<SingleUpdateResult>`
Updates a single document by ID
- Uses `$set` operator for updates
- Returns: `{ matchedCount: number, modifiedCount: number }`

#### `updateMany(collection: string, updates: Array<{filter: any, update: any}>): Promise<BulkUpdateResult>`
Updates multiple documents with parallel execution
- Each update operation runs in parallel
- Returns: `{ matchedCount: number, modifiedCount: number, operations: number }`

### Delete Operations

#### `deleteOne(collection: string, id: any): Promise<SingleDeleteResult>`
Deletes a single document by ID
- Returns: `{ deletedCount: number }`

#### `deleteMany(collection: string, filters: any[]): Promise<BulkDeleteResult>`
Deletes multiple documents with parallel execution
- Each delete operation runs in parallel
- Returns: `{ deletedCount: number, operations: number }`

### Helper Methods

#### `getCountParallel(collection: string, filter: Record<string, any>, pipeline?: Record<string, any>[]): Promise<number>`
Efficiently counts documents:
- Supports aggregation pipeline counting
- Uses `countDocuments` for simple queries
- Optimized for parallel execution

#### `getDataParallel(...): Promise<any[]>`
Retrieves data with flexible query options:
- Builds aggregation pipeline dynamically
- Supports filtering, projection, sorting
- Applies skip and limit for pagination
- Logs pipeline for debugging

### Performance Optimizations

1. **Connection Pooling**
   - Configurable pool size (default: 50 max, 5 min)
   - Automatic connection management
   - Idle connection timeout

2. **Parallel Operations**
   - Count and data queries run simultaneously
   - Bulk operations processed in batches
   - Multiple operations executed in parallel

3. **Batch Processing**
   - Insert operations batched (100 documents/batch)
   - Reduces network overhead
   - Improves throughput

### Security Features

1. **RBAC Integration**
   - All read operations filtered through RBAC
   - JWT-based authorization
   - Collection-level permissions

2. **Connection Security**
   - Supports authentication in connection string
   - Configurable timeout settings
   - Error handling for connection failures

### Error Handling

- Connection validation before operations
- Detailed error messages
- Proper error propagation
- Input validation for bulk operations

### Logging

- Connection status logging
- Pipeline debugging output
- RBAC filtering results
- Error logging with context

### Usage Example

```typescript
const config: MongoDBConfig = {
  connectionString: 'mongodb://localhost:27017',
  databaseName: 'myapp',
  options: {
    maxPoolSize: 100,
    minPoolSize: 10
  }
};

const adapter = new MongoDBAdapter(config);
await adapter.connect();

// Perform queries with RBAC
const results = await adapter.find('users', {
  filter: { status: 'active' },
  sort: { createdAt: -1 },
  limit: 20
}, jwtToken);
```

### Best Practices

1. Always call `connect()` before operations
2. Use `disconnect()` for graceful shutdown
3. Configure pool size based on load
4. Monitor connection pool usage
5. Use batch operations for bulk data
6. Leverage parallel execution capabilities