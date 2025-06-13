// src/adapters/mongodb/MongoDBAdapter.ts

import { MongoClient, Db } from 'mongodb';
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
} from './types';

export interface MongoDBConfig {
  connectionString: string;
  databaseName: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
    serverSelectionTimeoutMS?: number;
    connectTimeoutMS?: number;
  };
}

export class MongoDBAdapter implements IDatabaseAdapter {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: MongoDBConfig;

  constructor(config: MongoDBConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      const defaultOptions = {
        maxPoolSize: 50,
        minPoolSize: 5,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
      };

      const options = { ...defaultOptions, ...this.config.options };
      
      this.client = new MongoClient(this.config.connectionString, options);
      await this.client.connect();
      this.db = this.client.db(this.config.databaseName);
      
      console.log('Connected to MongoDB with optimized connection pool');
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('Disconnected from MongoDB');
    }
  }

  isConnected(): boolean {
    return this.client !== null && this.db !== null;
  }

  private ensureConnection(): void {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
  }

  // Helper method for counting records in parallel
  private async getCountParallel(
    collection: string, 
    filter: Record<string, any>, 
    pipeline?: Record<string, any>[]
  ): Promise<number> {
    this.ensureConnection();

    if (pipeline && pipeline.length > 0) {
      const countPipeline = [];
      
      if (filter && Object.keys(filter).length > 0) {
        countPipeline.push({ $match: filter });
      }
      
      countPipeline.push({ $count: 'count' });
      
      const countResult = await this.db!.collection(collection).aggregate(countPipeline).toArray();
      return countResult[0]?.count || 0;
    } else {
      return await this.db!.collection(collection).countDocuments(filter || {});
    }
  }

  // Helper method for getting data in parallel
  private async getDataParallel(
    collection: string,
    filter: Record<string, any>,
    projection?: Record<string, 1 | 0>,
    sort?: Record<string, 1 | -1>,
    pipeline?: Record<string, any>[],
    skip: number = 0,
    limit: number = 10
  ): Promise<any[]> {
    this.ensureConnection();

    const aggPipeline = [];

    if (pipeline && pipeline.length > 0) {
      aggPipeline.push(...pipeline);
    }

    if (filter && Object.keys(filter).length > 0) {
      aggPipeline.push({ $match: filter });
    }

    if (projection && Object.keys(projection).length > 0) {
      aggPipeline.push({ $project: projection });
    }

    if (sort && Object.keys(sort).length > 0) {
      aggPipeline.push({ $sort: sort });
    }

    aggPipeline.push({ $skip: skip });
    aggPipeline.push({ $limit: limit });

    console.log("aggPipeline", JSON.stringify(aggPipeline));

    if (aggPipeline.length > 0) {
      return await this.db!.collection(collection).aggregate(aggPipeline).toArray();
    } else {
      return await this.db!.collection(collection)
        .find(filter || {}, { projection })
        .sort(sort || {})
        .skip(skip)
        .limit(limit)
        .toArray();
    }
  }

  async find(collection: string, options: QueryOptions): Promise<QueryResult> {
    this.ensureConnection();

    const {
      filter,
      projection,
      sort,
      pipeline,
      limit = 10,
      skip = 0
    } = options;

    const currentPage = Math.floor(skip / limit) + 1;

    // Run count and data retrieval in parallel
    const [totalRecord, results] = await Promise.all([
      this.getCountParallel(collection, filter, pipeline),
      this.getDataParallel(collection, filter, projection, sort, pipeline, skip, limit)
    ]);

    const totalPage = Math.ceil(totalRecord / limit);

    return {
      data: results,
      totalRecord,
      totalPage,
      limit,
      currentPage
    };
  }

  async insertOne(collection: string, document: any): Promise<SingleInsertResult> {
    this.ensureConnection();
    
    const result = await this.db!.collection(collection).insertOne(document);
    return { insertedId: result.insertedId };
  }

  async insertMany(collection: string, documents: any[]): Promise<BulkInsertResult> {
    this.ensureConnection();

    if (!Array.isArray(documents)) {
      throw new Error('Expected array of documents');
    }

    // Split into batches for parallel processing
    const batchSize = 100;
    const batches = [];
    
    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize));
    }

    // Run batches in parallel
    const insertPromises = batches.map(batch => 
      this.db!.collection(collection).insertMany(batch)
    );

    const results = await Promise.all(insertPromises);
    
    const totalInserted = results.reduce((sum, result) => sum + result.insertedCount, 0);
    const insertedIds = results.flatMap(result => Object.values(result.insertedIds));

    return {
      insertedCount: totalInserted,
      insertedIds: insertedIds
    };
  }

  async updateOne(collection: string, id: any, updateFields: any): Promise<SingleUpdateResult> {
    this.ensureConnection();

    const result = await this.db!.collection(collection).updateOne(
      { _id: id },
      { $set: updateFields }
    );

    return { 
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount 
    };
  }

  async updateMany(collection: string, updates: Array<{filter: any, update: any}>): Promise<BulkUpdateResult> {
    this.ensureConnection();

    if (!Array.isArray(updates)) {
      throw new Error('Expected array of update operations');
    }

    // Run update operations in parallel
    const updatePromises = updates.map(({ filter, update }) =>
      this.db!.collection(collection).updateMany(filter, { $set: update })
    );

    const results = await Promise.all(updatePromises);
    
    const totalMatched = results.reduce((sum, result) => sum + result.matchedCount, 0);
    const totalModified = results.reduce((sum, result) => sum + result.modifiedCount, 0);

    return {
      matchedCount: totalMatched,
      modifiedCount: totalModified,
      operations: results.length
    };
  }

  async deleteOne(collection: string, id: any): Promise<SingleDeleteResult> {
    this.ensureConnection();

    const result = await this.db!.collection(collection).deleteOne({
      _id: id
    });

    return { deletedCount: result.deletedCount };
  }

  async deleteMany(collection: string, filters: any[]): Promise<BulkDeleteResult> {
    this.ensureConnection();

    if (!Array.isArray(filters)) {
      throw new Error('Expected array of filter objects');
    }

    // Run delete operations in parallel
    const deletePromises = filters.map(filter =>
      this.db!.collection(collection).deleteMany(filter)
    );

    const results = await Promise.all(deletePromises);
    
    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);

    return {
      deletedCount: totalDeleted,
      operations: results.length
    };
  }
}