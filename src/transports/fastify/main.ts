// src/transports/fastify/main.ts

import { QueryOptions } from '../../adapter/mongodb/types';
import { CachedMongoDBAdapter } from '../../adapter/redis/cacheMongo'; 
import { FastifyServer } from './fastify'; 

async function main() {
  // Database configuration with Redis cache
  const dbConfig = {
    mongodb: {
      connectionString: 'mongodb://thaily:Th%40i2004@192.168.1.109:27017/mongorest?authSource=admin',
      databaseName: 'mongorest',
      options: {
        maxPoolSize: 50,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      }
    },
    // Redis configuration (optional - remove this section to run without cache)
    redis: {
      host: '192.168.1.109',
      port: 6379,
      // password: 'your-redis-password', // if Redis has password
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
  };

  // Fastify Server configuration
  const serverConfig = {
    port: 3002,
    host: 'localhost'
  };

  try {
    // Initialize database adapter with cache
    const dbAdapter = new CachedMongoDBAdapter(dbConfig);
    
    // Initialize Fastify server
    const server = new FastifyServer(dbAdapter, serverConfig);

    // Setup graceful shutdown handlers
    const gracefulShutdown = () => server.gracefulShutdown();
    
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown();
    });
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown();
    });

    // Start the server
    await server.start();
    
    // Log cache status
    if (dbAdapter.isCacheActive()) {
      console.log('Fastify application started successfully with Redis cache enabled');
      console.log('Cache config:', dbAdapter.getCacheConfig());
    } else {
      console.log('Fastify application started successfully without cache');
    }

    // Optional: Warm up cache with common queries
    // await warmupCommonQueries(dbAdapter);

  } catch (error) {
    console.error('Failed to start Fastify application:', error);
    process.exit(1);
  }
}

// Optional: Function to warm up cache with common queries
async function warmupCommonQueries(dbAdapter: CachedMongoDBAdapter, jwt: string) {
  try {
    // Example: warm up cache for products collection
    const commonProductQueries: QueryOptions[] = [
      {
        filter: { status: 'active' },
        limit: 20,
        skip: 0
      },
      {
        filter: { category: 'electronics' },
        sort: { created_at: -1 },
        limit: 10,
        skip: 0
      },
      {
        filter: { price: { $gte: 100, $lte: 1000 } },
        limit: 15,
        skip: 0
      }
    ];

    await dbAdapter.warmupCache('products', commonProductQueries, jwt);

    // Example: warm up cache for users collection
    const commonUserQueries: QueryOptions[] = [
      {
        filter: { status: 'active' },
        projection: { password: 0 },
        limit: 50,
        skip: 0
      }
    ];

    await dbAdapter.warmupCache('users', commonUserQueries, jwt);

    console.log('Cache warmup completed');
  } catch (error) {
    console.error('Cache warmup failed:', error);
  }
}

// Run the application
main().catch((error) => {
  console.error('Fastify application startup error:', error);
  process.exit(1);
});