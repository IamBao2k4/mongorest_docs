# main.ts

## Overview
Main entry point for the HTTP server application with MongoDB and optional Redis caching support. Demonstrates configuration and initialization of the complete REST API server.

## Configuration

### Database Configuration
```typescript
const dbConfig = {
  mongodb: {
    connectionString: 'mongodb://...',
    databaseName: 'mongorest',
    options: {
      maxPoolSize: 50,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    }
  },
  redis: {
    host: 'localhost',
    port: 6379,
    database: 0,
    keyPrefix: 'mongorest:',
    ttl: 300 // 5 minutes default TTL
  },
  cacheOptions: {
    enableReadCache: true,
    enableWriteThrough: true,
    defaultTTL: 300,
    cacheOnWrite: false
  }
}
```

#### MongoDB Options
- **maxPoolSize**: Maximum number of connections in the pool (50)
- **minPoolSize**: Minimum number of connections to maintain (5)
- **maxIdleTimeMS**: Maximum time a connection can be idle (30 seconds)
- **serverSelectionTimeoutMS**: Timeout for server selection (5 seconds)
- **connectTimeoutMS**: Connection timeout (10 seconds)

#### Redis Options (Optional)
- **host**: Redis server hostname
- **port**: Redis server port (default: 6379)
- **password**: Optional authentication password
- **database**: Redis database index (0-15)
- **keyPrefix**: Prefix for all cache keys
- **ttl**: Default time-to-live in seconds

#### Cache Options
- **enableReadCache**: Enable query result caching
- **enableWriteThrough**: Enable write-through caching
- **defaultTTL**: Default cache expiration time
- **cacheOnWrite**: Cache documents after write operations

### HTTP Server Configuration
```typescript
const serverConfig = {
  port: 3000,
  host: 'localhost'
}
```

## Main Function Flow

1. **Initialize Database Adapter**
   - Creates `CachedMongoDBAdapter` with MongoDB and Redis configuration
   - Falls back to non-cached operation if Redis is unavailable

2. **Initialize HTTP Server**
   - Creates `HttpServer` instance with database adapter and server config

3. **Setup Graceful Shutdown**
   - Handles SIGINT (Ctrl+C) and SIGTERM signals
   - Catches uncaught exceptions and unhandled rejections
   - Ensures proper cleanup of connections

4. **Start Server**
   - Establishes database connection
   - Starts HTTP server on configured port
   - Logs cache status and configuration

5. **Optional Cache Warmup**
   - Pre-loads frequently accessed data into cache
   - Improves initial response times

## Graceful Shutdown Handling

The application handles various shutdown scenarios:

```typescript
process.on('SIGINT', gracefulShutdown);    // Ctrl+C
process.on('SIGTERM', gracefulShutdown);   // Termination signal
process.on('uncaughtException', ...);      // Unhandled errors
process.on('unhandledRejection', ...);     // Promise rejections
```

Shutdown sequence:
1. Stop accepting new HTTP requests
2. Close existing HTTP connections
3. Disconnect from MongoDB
4. Disconnect from Redis (if connected)
5. Exit process with appropriate code

## Cache Warmup Function

```typescript
async function warmupCommonQueries(dbAdapter: CachedMongoDBAdapter, jwt: string)
```

### Purpose
Pre-loads frequently accessed queries into cache to improve performance

### Example Warmup Queries

**Products Collection:**
- Active products (first 20)
- Electronics category (latest 10)
- Price range $100-$1000 (15 items)

**Users Collection:**
- Active users without passwords (first 50)

### Benefits
- Reduces initial request latency
- Prevents cache stampede on startup
- Ensures critical data is immediately available

## Error Handling

### Startup Errors
- Database connection failures
- Redis connection failures (gracefully degrades to non-cached mode)
- Port binding issues
- Configuration errors

### Runtime Errors
- Uncaught exceptions trigger graceful shutdown
- Unhandled promise rejections are logged and handled
- All errors are logged with context

## Logging

The application provides detailed logging for:
- Server startup status
- Cache configuration and status
- Connection establishment
- Graceful shutdown progress
- Error conditions with stack traces

## Running Without Cache

To run without Redis caching, simply remove the `redis` section from `dbConfig`:

```typescript
const dbConfig = {
  mongodb: {
    // MongoDB configuration only
  }
  // No redis or cacheOptions sections
}
```

The application will automatically detect the absence of Redis configuration and run in non-cached mode.

## Security Considerations

- MongoDB connection string should use environment variables in production
- Redis password should be configured if Redis requires authentication
- Consider using TLS/SSL for both MongoDB and Redis connections in production

## Performance Tuning

### Connection Pool Sizing
- Adjust `maxPoolSize` based on expected concurrent requests
- Monitor connection usage and adjust `minPoolSize` accordingly

### Cache TTL Configuration
- Balance between data freshness and cache hit rate
- Consider different TTLs for different collections
- Monitor cache hit/miss ratios

### Server Configuration
- Use appropriate host binding (avoid '0.0.0.0' in production)
- Consider using a reverse proxy for production deployments