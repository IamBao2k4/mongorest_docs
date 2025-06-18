// src/adapters/mongodb/CachedMongoDBAdapter.ts

import { MongoDBAdapter, MongoDBConfig } from '../mongodb/mongodb';
import { RedisAdapter, RedisConfig, CacheOptions } from './redis';
import { 
  IDatabaseAdapter, 
  QueryOptions, 
  QueryResult,
  BulkInsertResult,
  BulkUpdateResult,
  BulkDeleteResult,
  SingleInsertResult,
  SingleUpdateResult,
  SingleDeleteResult
} from '../mongodb/types';

export interface CachedMongoDBConfig {
  mongodb: MongoDBConfig;
  redis?: RedisConfig;
  cacheOptions?: {
    enableReadCache?: boolean;
    enableWriteThrough?: boolean;
    defaultTTL?: number;
    cacheOnWrite?: boolean;
  };
}

export class CachedMongoDBAdapter implements IDatabaseAdapter {
  private mongoAdapter: MongoDBAdapter;
  private redisAdapter: RedisAdapter | null = null;
  private cacheEnabled: boolean = false;
  private config: CachedMongoDBConfig;

  constructor(config: CachedMongoDBConfig) {
    this.config = {
      cacheOptions: {
        enableReadCache: true,
        enableWriteThrough: true,
        defaultTTL: 300,
        cacheOnWrite: false,
        ...config.cacheOptions
      },
      ...config
    };

    this.mongoAdapter = new MongoDBAdapter(this.config.mongodb);
    
    if (this.config.redis) {
      this.redisAdapter = new RedisAdapter(this.config.redis);
      this.cacheEnabled = true;
    }
  }

  async connect(): Promise<void> {
    // Connect to MongoDB first
    await this.mongoAdapter.connect();
    
    // Try to connect to Redis if configured
    if (this.redisAdapter) {
      try {
        await this.redisAdapter.connect();
        console.log('Cache layer enabled');
      } catch (error) {
        console.warn('Redis connection failed, running without cache:', error);
        this.cacheEnabled = false;
      }
    }
  }

  async disconnect(): Promise<void> {
    await this.mongoAdapter.disconnect();
    
    if (this.redisAdapter) {
      await this.redisAdapter.disconnect();
    }
  }

  isConnected(): boolean {
    return this.mongoAdapter.isConnected();
  }

  private isCacheEnabled(): boolean | undefined {
    return this.cacheEnabled && 
           this.redisAdapter?.isConnected() && 
           this.config.cacheOptions?.enableReadCache;
  }

  private async invalidateCache(collection: string): Promise<void> {
    if (this.redisAdapter && this.config.cacheOptions?.enableWriteThrough) {
      await this.redisAdapter.invalidateCollection(collection);
    }
  }

  async find(collection: string, options: QueryOptions): Promise<QueryResult> {
    // Try cache first if enabled
    if (this.isCacheEnabled()) {
      const cacheKey = {
        collection,
        filter: options.filter,
        projection: options.projection,
        sort: options.sort,
        pipeline: options.pipeline,
        skip: options.skip,
        limit: options.limit
      };

      const cached = await this.redisAdapter!.get<QueryResult>(collection, cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Get from MongoDB
    const result = await this.mongoAdapter.find(collection, options);

    // Cache the result if enabled
    if (this.isCacheEnabled()) {
      const cacheKey = {
        collection,
        filter: options.filter,
        projection: options.projection,
        sort: options.sort,
        pipeline: options.pipeline,
        skip: options.skip,
        limit: options.limit
      };

      await this.redisAdapter!.set(collection, cacheKey, result, {
        ttl: this.config.cacheOptions?.defaultTTL
      });
    }

    return result;
  }

  async insertOne(collection: string, document: any): Promise<SingleInsertResult> {
    const result = await this.mongoAdapter.insertOne(collection, document);
    
    // Invalidate cache for this collection
    await this.invalidateCache(collection);
    
    return result;
  }

  async insertMany(collection: string, documents: any[]): Promise<BulkInsertResult> {
    const result = await this.mongoAdapter.insertMany(collection, documents);
    
    // Invalidate cache for this collection
    await this.invalidateCache(collection);
    
    return result;
  }

  async updateOne(collection: string, id: any, updateFields: any): Promise<SingleUpdateResult> {
    const result = await this.mongoAdapter.updateOne(collection, id, updateFields);
    
    // Invalidate cache for this collection
    await this.invalidateCache(collection);
    
    return result;
  }

  async updateMany(collection: string, updates: Array<{filter: any, update: any}>): Promise<BulkUpdateResult> {
    const result = await this.mongoAdapter.updateMany(collection, updates);
    
    // Invalidate cache for this collection
    await this.invalidateCache(collection);
    
    return result;
  }

  async deleteOne(collection: string, id: any): Promise<SingleDeleteResult> {
    const result = await this.mongoAdapter.deleteOne(collection, id);
    
    // Invalidate cache for this collection
    await this.invalidateCache(collection);
    
    return result;
  }

  async deleteMany(collection: string, filters: any[]): Promise<BulkDeleteResult> {
    const result = await this.mongoAdapter.deleteMany(collection, filters);
    
    // Invalidate cache for this collection
    await this.invalidateCache(collection);
    
    return result;
  }

  // Additional cache management methods
  async getCacheStats(): Promise<any> {
    if (this.redisAdapter) {
      return await this.redisAdapter.getStats();
    }
    return null;
  }

  async clearCache(collection?: string): Promise<void> {
    if (this.redisAdapter) {
      if (collection) {
        await this.redisAdapter.invalidateCollection(collection);
      } else {
        await this.redisAdapter.flush();
      }
    }
  }

  async warmupCache(collection: string, commonQueries: QueryOptions[], jwt: string): Promise<void> {
    if (!this.isCacheEnabled()) {
      return;
    }

    console.log(`Warming up cache for collection: ${collection}`);
    
    const warmupPromises = commonQueries.map(async (query) => {
      try {
        await this.find(collection, query);
        console.log(`Warmed up cache for query:`, query.filter);
      } catch (error) {
        console.error(`Failed to warm up cache for query:`, query.filter, error);
      }
    });

    await Promise.all(warmupPromises);
    console.log(`Cache warmup completed for collection: ${collection}`);
  }

  isCacheActive(): boolean {
    const is = this.isCacheEnabled()
    return is == undefined?false:is;
  }

  getCacheConfig(): any {
    return {
      enabled: this.cacheEnabled,
      connected: this.redisAdapter?.isConnected() || false,
      config: this.config.cacheOptions
    };
  }
}