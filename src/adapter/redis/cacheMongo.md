# cacheMongo.ts

## Overview
`CachedMongoDBAdapter` class provides a caching layer on top of MongoDB operations using Redis, with automatic cache invalidation and optional fallback to non-cached operation.

## Class: CachedMongoDBAdapter

### Implementation
Implements `IDatabaseAdapter` interface, wrapping `MongoDBAdapter` with Redis caching capabilities.

### Configuration

```typescript
interface CachedMongoDBConfig {
  mongodb: MongoDBConfig;      // MongoDB connection settings
  redis?: RedisConfig;         // Optional Redis settings
  cacheOptions?: {
    enableReadCache?: boolean;      // Default: true
    enableWriteThrough?: boolean;   // Default: true
    defaultTTL?: number;           // Default: 300 seconds
    cacheOnWrite?: boolean;        // Default: false
  };
}
```

#### Cache Options
- **enableReadCache**: Enable caching for read operations
- **enableWriteThrough**: Invalidate cache on write operations
- **defaultTTL**: Time-to-live for cached entries (seconds)
- **cacheOnWrite**: Cache results after write operations (not implemented)

### Core Features

#### 1. Graceful Degradation
- Operates without cache if Redis is unavailable
- Falls back to direct MongoDB operations
- Logs warnings but continues functioning

#### 2. Automatic Cache Management
- Caches query results automatically
- Invalidates cache on write operations
- Collection-level cache invalidation

#### 3. Cache Key Generation
Cache keys are generated from:
- Collection name
- Filter conditions
- Projection fields
- Sort order
- Aggregation pipeline
- Skip/limit pagination

### Connection Management

#### `connect(): Promise<void>`
Establishes connections in sequence:
1. Connects to MongoDB (required)
2. Attempts Redis connection (optional)
3. Disables cache if Redis fails

#### `disconnect(): Promise<void>`
Gracefully disconnects from both MongoDB and Redis

#### `isConnected(): boolean`
Returns MongoDB connection status (primary database)

### Read Operations

#### `find(collection: string, options: QueryOptions, jwt: string): Promise<QueryResult>`

**Cache Flow:**
1. Check if cache is enabled
2. Generate cache key from query parameters
3. Try to get from cache
4. If miss, query MongoDB
5. Store result in cache with TTL
6. Return result

**Features:**
- Transparent caching
- Preserves all query options
- RBAC filtering through MongoDB adapter

### Write Operations

All write operations follow the same pattern:
1. Execute operation on MongoDB
2. Invalidate entire collection cache
3. Return operation result

#### Supported Write Operations
- `insertOne()`: Single document insert
- `insertMany()`: Bulk insert
- `updateOne()`: Single document update
- `updateMany()`: Bulk update
- `deleteOne()`: Single document delete
- `deleteMany()`: Bulk delete

### Cache Management Methods

#### `getCacheStats(): Promise<any>`
Returns Redis cache statistics:
- Hit/miss ratios
- Memory usage
- Key counts
- Performance metrics

#### `clearCache(collection?: string): Promise<void>`
Clears cache entries:
- With collection: Clears specific collection
- Without collection: Flushes entire cache

#### `warmupCache(collection: string, commonQueries: QueryOptions[], jwt: string): Promise<void>`
Pre-loads frequently used queries:
- Executes queries in parallel
- Populates cache proactively
- Logs success/failure for each query
- Improves initial response times

### Status Methods

#### `isCacheActive(): boolean`
Returns true if:
- Cache is enabled in config
- Redis is connected
- Read cache is enabled

#### `getCacheConfig(): any`
Returns current cache configuration:
```typescript
{
  enabled: boolean,        // Cache enabled in config
  connected: boolean,      // Redis connection status
  config: CacheOptions     // Current cache options
}
```

### Cache Invalidation Strategy

**Collection-Level Invalidation:**
- Any write operation invalidates entire collection
- Simple and effective for most use cases
- Prevents stale data
- Trade-off between simplicity and cache efficiency

### Performance Characteristics

#### Benefits
1. **Reduced Database Load**: Cached queries skip MongoDB
2. **Lower Latency**: Redis typically faster than MongoDB queries
3. **Parallel Warmup**: Pre-load multiple queries simultaneously
4. **Automatic Management**: No manual cache handling needed

#### Considerations
1. **Memory Usage**: Redis stores full query results
2. **Cache Misses**: Initial queries still hit MongoDB
3. **Invalidation Scope**: Entire collection cleared on writes
4. **TTL Management**: Balance freshness vs. hit rate

### Error Handling

1. **Redis Connection Failures**: 
   - Logs warning
   - Continues without cache
   - No impact on functionality

2. **Cache Operations**:
   - Failures don't affect main operations
   - Errors logged but not propagated
   - Database operations continue normally

### Usage Example

```typescript
const config: CachedMongoDBConfig = {
  mongodb: {
    connectionString: 'mongodb://localhost:27017',
    databaseName: 'myapp'
  },
  redis: {
    host: 'localhost',
    port: 6379,
    keyPrefix: 'myapp:'
  },
  cacheOptions: {
    enableReadCache: true,
    enableWriteThrough: true,
    defaultTTL: 600  // 10 minutes
  }
};

const adapter = new CachedMongoDBAdapter(config);
await adapter.connect();

// First query hits MongoDB and caches result
const result1 = await adapter.find('users', { 
  filter: { status: 'active' } 
}, jwt);

// Second identical query served from cache
const result2 = await adapter.find('users', { 
  filter: { status: 'active' } 
}, jwt);

// Write operation invalidates cache
await adapter.updateOne('users', userId, { status: 'inactive' });

// Next query hits MongoDB again
const result3 = await adapter.find('users', { 
  filter: { status: 'active' } 
}, jwt);
```

### Best Practices

1. **TTL Configuration**:
   - Shorter TTL for frequently changing data
   - Longer TTL for reference data
   - Monitor hit rates and adjust

2. **Cache Warmup**:
   - Identify common queries through monitoring
   - Warm up cache after deployment
   - Schedule periodic warmups if needed

3. **Monitoring**:
   - Track cache hit/miss ratios
   - Monitor Redis memory usage
   - Alert on connection failures

4. **Collection Design**:
   - Consider invalidation impact
   - Group related data in same collection
   - Balance between cache efficiency and data consistency