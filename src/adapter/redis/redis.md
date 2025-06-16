# redis.ts

## Overview
`RedisAdapter` class provides Redis caching functionality with advanced query hashing, connection management, and cache operations for MongoDB query results.

## Class: RedisAdapter

### Configuration

```typescript
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;      // Redis database index (0-15)
  keyPrefix?: string;     // Default: "mongorest:"
  ttl?: number;          // Default: 300 seconds (5 minutes)
}

interface CacheOptions {
  ttl?: number;          // Override default TTL
  skipCache?: boolean;   // Skip caching for specific operations
}
```

### Connection Management

#### `connect(): Promise<void>`
Establishes Redis connection with error handling:
- Creates Redis client with configuration
- Sets up event listeners (error, connect, disconnect)
- Graceful failure - continues without throwing errors
- Updates connection status automatically

#### `disconnect(): Promise<void>`
Cleanly disconnects from Redis:
- Quits client connection
- Cleans up references
- Updates connection status

#### `isConnected(): boolean`
Returns true if actively connected to Redis

### Cache Key Management

#### `generateKey(collection: string, queryHash: string): string`
Creates cache keys with format: `{keyPrefix}{collection}:{queryHash}`
- Example: `mongorest:users:abc123`

#### Query Hashing Methods

The adapter provides multiple hashing algorithms for different use cases:

##### 1. **Default Hash (DJB2)**
```typescript
hashQuery(query: any): string
```
- Fast, simple hash algorithm
- Good distribution for most queries
- Returns base36 string for compact keys

##### 2. **Crypto Hash (SHA256)**
```typescript
hashQueryWithCrypto(query: any): string
```
- Cryptographically secure
- No collisions
- Higher CPU cost
- Returns first 16 hex characters

##### 3. **FNV-1a Hash**
```typescript
hashQueryFNV1a(query: any): string
```
- Very fast alternative
- Good distribution
- Low collision rate

##### 4. **xxHash-like Algorithm**
```typescript
hashQueryXX(query: any): string
```
- Extremely fast
- Optimized for performance
- Good for high-throughput scenarios

### Query Normalization

#### `normalizeQuery(query: any): any`
Ensures consistent hashing by:
- Sorting object keys alphabetically
- Sorting arrays for consistency
- Handling nested objects recursively
- Preserving data types

#### `stringifyQuery(query: any): string`
Converts normalized queries to strings:
- Handles special types (Date, RegExp, Function)
- Manages undefined values
- Provides fallback for edge cases

### Cache Operations

#### `get<T>(collection: string, query: any): Promise<T | null>`
Retrieves cached data:
- Returns null if not connected or cache miss
- Logs cache hit/miss status
- Handles errors gracefully
- Type-safe with generic support

#### `set(collection: string, query: any, data: any, options?: CacheOptions): Promise<void>`
Stores data in cache:
- Respects `skipCache` option
- Uses configurable TTL
- Logs caching operations
- Silent failure on errors

#### `del(collection: string, query?: any): Promise<void>`
Deletes cache entries:
- With query: Deletes specific cached query
- Without query: Deletes all entries for collection
- Uses pattern matching for bulk deletion

### Collection Management

#### `invalidateCollection(collection: string): Promise<void>`
Clears all cache entries for a collection
- Wrapper for `del()` without query parameter

#### `flush(): Promise<void>`
Removes all cache entries with the configured prefix:
- Uses pattern matching
- Logs number of flushed entries
- Safe operation with error handling

### Monitoring & Statistics

#### `getStats(): Promise<any>`
Returns Redis statistics:
```typescript
{
  connected: boolean,
  keyCount: number,
  memoryInfo: string  // Redis memory info
}
```

### Error Handling

All operations include comprehensive error handling:
- Connection failures don't crash the application
- Cache operations fail silently with logging
- Null returns on errors for read operations
- Void returns for write operations

### Performance Optimizations

1. **Query Normalization**
   - Consistent key generation
   - Prevents duplicate cache entries
   - Handles complex nested queries

2. **Multiple Hash Algorithms**
   - Choose based on performance needs
   - Balance between speed and collision resistance

3. **Batch Operations**
   - Pattern-based deletion for collections
   - Efficient key scanning

4. **Connection State Tracking**
   - Avoids Redis calls when disconnected
   - Quick connection checks

### Usage Example

```typescript
const redisAdapter = new RedisAdapter({
  host: 'localhost',
  port: 6379,
  keyPrefix: 'myapp:',
  ttl: 600  // 10 minutes
});

await redisAdapter.connect();

// Cache a query result
const query = { 
  filter: { status: 'active' }, 
  sort: { createdAt: -1 } 
};
await redisAdapter.set('users', query, userData);

// Retrieve from cache
const cached = await redisAdapter.get('users', query);

// Invalidate collection on updates
await redisAdapter.invalidateCollection('users');

// Get statistics
const stats = await redisAdapter.getStats();
console.log(`Cache has ${stats.keyCount} keys`);
```

### Best Practices

1. **Key Prefix Strategy**
   - Use unique prefixes per application
   - Include environment (dev, staging, prod)
   - Consider versioning for schema changes

2. **TTL Configuration**
   - Balance data freshness vs cache efficiency
   - Use shorter TTLs for frequently changing data
   - Consider different TTLs per collection

3. **Hash Algorithm Selection**
   - Default DJB2 for most cases
   - Crypto hash for security-sensitive scenarios
   - xxHash-like for high-performance needs

4. **Connection Management**
   - Handle connection failures gracefully
   - Monitor connection status
   - Implement reconnection logic if needed

5. **Memory Management**
   - Monitor Redis memory usage
   - Set appropriate max memory policies
   - Consider eviction strategies

### Logging

The adapter provides detailed logging for:
- Connection events
- Cache hits/misses
- Key operations (set, delete, flush)
- Error conditions
- Performance metrics

This helps with debugging and monitoring cache effectiveness.