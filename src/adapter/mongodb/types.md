# types.ts

## Overview
Type definitions and interfaces for the database adapter layer, providing a standardized contract for database operations.

## Core Interfaces

### `QueryOptions`
Defines options for database queries.

```typescript
interface QueryOptions {
  filter: Record<string, any>;         // Required: MongoDB-style filter
  projection?: Record<string, 1 | 0>;  // Optional: Field inclusion/exclusion
  sort?: Record<string, 1 | -1>;       // Optional: Sort order (1=asc, -1=desc)
  pipeline?: Record<string, any>[];    // Optional: Aggregation pipeline
  skip?: number;                       // Optional: Records to skip (pagination)
  limit?: number;                      // Optional: Maximum records to return
  count?: boolean;                     // Optional: Return count only
}
```

**Usage:**
- `filter`: MongoDB query filter syntax
- `projection`: Specify fields to include (1) or exclude (0)
- `sort`: Field sorting, supports multiple fields
- `pipeline`: MongoDB aggregation pipeline stages
- `skip/limit`: Pagination support
- `count`: Flag for count-only queries

### `QueryResult<T = any>`
Standard response format for query operations.

```typescript
interface QueryResult<T = any> {
  data: T[];              // Array of result documents
  totalRecord: number;    // Total matching records in database
  totalPage: number;      // Total pages based on limit
  limit: number;          // Records per page
  currentPage: number;    // Current page number (1-based)
}
```

**Generic Type:**
- `T`: Type of documents in the data array (defaults to `any`)

## Operation Result Interfaces

### Insert Results

#### `SingleInsertResult`
```typescript
interface SingleInsertResult {
  insertedId: any;  // ID of the inserted document
}
```

#### `BulkInsertResult`
```typescript
interface BulkInsertResult {
  insertedCount: number;  // Number of documents inserted
  insertedIds: any[];     // Array of inserted document IDs
}
```

### Update Results

#### `SingleUpdateResult`
```typescript
interface SingleUpdateResult {
  matchedCount: number;   // Documents matched by filter
  modifiedCount: number;  // Documents actually modified
}
```

#### `BulkUpdateResult`
```typescript
interface BulkUpdateResult {
  matchedCount: number;   // Total documents matched
  modifiedCount: number;  // Total documents modified
  operations: number;     // Number of update operations performed
}
```

### Delete Results

#### `SingleDeleteResult`
```typescript
interface SingleDeleteResult {
  deletedCount: number;  // Number of documents deleted (0 or 1)
}
```

#### `BulkDeleteResult`
```typescript
interface BulkDeleteResult {
  deletedCount: number;  // Total documents deleted
  operations: number;    // Number of delete operations performed
}
```

## Main Interface

### `IDatabaseAdapter`
Core interface that all database adapters must implement.

```typescript
interface IDatabaseAdapter {
  // Connection methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Query methods 
  find(collection: string, options: QueryOptions, jwt: string): Promise<QueryResult>;
  
  // Insert methods
  insertOne(collection: string, document: any): Promise<SingleInsertResult>;
  insertMany(collection: string, documents: any[]): Promise<BulkInsertResult>;
  
  // Update methods
  updateOne(collection: string, id: any, updateFields: any): Promise<SingleUpdateResult>;
  updateMany(collection: string, updates: Array<{filter: any, update: any}>): Promise<BulkUpdateResult>;
  
  // Delete methods
  deleteOne(collection: string, id: any): Promise<SingleDeleteResult>;
  deleteMany(collection: string, filters: any[]): Promise<BulkDeleteResult>;
}
```

### Method Categories

#### Connection Management
- `connect()`: Establish database connection
- `disconnect()`: Close database connection
- `isConnected()`: Check connection status

#### Query Operations
- `find()`: Query documents with filtering, sorting, pagination, and JWT-based authorization

#### Insert Operations
- `insertOne()`: Insert single document
- `insertMany()`: Bulk insert with performance optimization

#### Update Operations
- `updateOne()`: Update single document by ID
- `updateMany()`: Bulk update with filter/update pairs

#### Delete Operations
- `deleteOne()`: Delete single document by ID
- `deleteMany()`: Bulk delete with multiple filters

## Design Patterns

### 1. **Generic Types**
- `QueryResult<T>` allows type-safe results
- Flexible document types with `any` default

### 2. **Consistent Result Format**
- All operations return standardized result objects
- Clear success metrics (counts, IDs)

### 3. **Bulk Operation Support**
- Separate interfaces for single vs. bulk operations
- Operation count tracking for bulk operations

### 4. **JWT Integration**
- `find()` method includes JWT parameter for RBAC
- Enables row-level security

### 5. **Pagination Built-in**
- Query options include skip/limit
- Result includes pagination metadata

## Usage Examples

### Query with Pagination
```typescript
const options: QueryOptions = {
  filter: { status: 'active' },
  projection: { password: 0 },
  sort: { createdAt: -1 },
  skip: 20,
  limit: 10
};

const result: QueryResult<User> = await adapter.find('users', options, jwt);
```

### Bulk Update
```typescript
const updates = [
  { filter: { status: 'pending' }, update: { status: 'active' } },
  { filter: { expired: true }, update: { status: 'inactive' } }
];

const result: BulkUpdateResult = await adapter.updateMany('users', updates);
```

### Aggregation Pipeline
```typescript
const options: QueryOptions = {
  filter: {},
  pipeline: [
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ],
  limit: 10
};
```

## Implementation Notes

1. **ID Types**: Uses `any` for IDs to support different ID formats (ObjectId, string, number)
2. **Filter Format**: Follows MongoDB query syntax for consistency
3. **JWT Parameter**: Required for `find()` to enforce security
4. **Error Handling**: Implementations should throw errors for failures
5. **Async/Promise**: All operations are asynchronous