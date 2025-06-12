// adapters/MongoDBAdapter.ts
import { Db, Collection, ObjectId, MongoClient } from "mongodb";
import {
  MongoQuery,
  QueryResult,
  MultiCollectionConfig,
  MultiCollectionResult,
  MultiCollectionResponse,
  BulkInsertResponse,
  BulkUpdateResponse,
  BulkDeleteResponse,
  SingleInsertResponse,
  SingleUpdateResponse,
  SingleDeleteResponse,
  BulkUpdateOperation,
  MongoConnectionOptions,
} from "./types";

export class MongoDBAdapter {
  private db: Db;
  private client: MongoClient;

  constructor(db: Db, client: MongoClient) {
    this.db = db;
    this.client = client;
  }

  /**
   * Tạo connection và khởi tạo adapter
   */
  static async create(
    connectionString: string,
    databaseName: string,
    options?: Partial<MongoConnectionOptions>
  ): Promise<MongoDBAdapter> {
    const defaultOptions: MongoConnectionOptions = {
      maxPoolSize: 50,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    const mongoOptions = { ...defaultOptions, ...options };

    try {
      const client = await MongoClient.connect(connectionString, mongoOptions);
      const db = client.db(databaseName);
      
      console.log(`Connected to MongoDB database: ${databaseName}`);
      return new MongoDBAdapter(db, client);
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  /**
   * Đóng connection
   */
  async close(): Promise<void> {
    await this.client.close();
  }

  /**
   * Lấy database instance
   */
  getDatabase(): Db {
    return this.db;
  }

  /**
   * Lấy collection instance
   */
  getCollection(name: string): Collection {
    return this.db.collection(name);
  }

  /**
   * Query single collection với pagination
   */
  async queryCollection(
    collectionName: string,
    mongoQuery: MongoQuery
  ): Promise<QueryResult> {
    const {
      filter,
      projection,
      sort,
      pipeline,
      limit = 10,
      skip = 0,
    } = mongoQuery;

    const currentPage = Math.floor(skip / limit) + 1;

    // Chạy song song: đếm tổng records và lấy data
    const [totalRecord, data] = await Promise.all([
      this.getCountParallel(collectionName, filter, pipeline),
      this.getDataParallel(
        collectionName,
        filter,
        projection,
        sort,
        pipeline,
        skip,
        limit
      ),
    ]);

    const totalPage = Math.ceil(totalRecord / limit);

    return {
      data,
      totalRecord,
      totalPage,
      limit,
      currentPage,
    };
  }

  /**
   * Query multiple collections với config riêng cho mỗi collection
   */
  async queryMultipleCollections(
    collectionsConfig: MultiCollectionConfig
  ): Promise<MultiCollectionResponse> {
    const start = process.hrtime.bigint();

    const queries = Object.entries(collectionsConfig).map(
      async ([collectionName, query]): Promise<MultiCollectionResult> => {
        const { filter = {}, projection, sort, limit = 10, skip = 0, pipeline }: any = query;

        const [count, data] = await Promise.all([
          this.getCountParallel(collectionName, filter, pipeline),
          this.getDataParallel(
            collectionName,
            filter,
            projection,
            sort,
            pipeline,
            skip,
            limit
          ),
        ]);

        return {
          collection: collectionName,
          count,
          data,
          query,
        };
      }
    );

    const results = await Promise.all(queries);
    
    const end = process.hrtime.bigint();
    const executionTime = `${Number(end - start) / 1_000_000}ms`;

    return {
      collections: results,
      totalCollections: results.length,
      executionTime,
    };
  }

  /**
   * Insert single document
   */
  async insertOne(
    collectionName: string,
    document: any
  ): Promise<SingleInsertResponse> {
    const result = await this.db.collection(collectionName).insertOne(document);
    return { insertedId: result.insertedId };
  }

  /**
   * Bulk insert với batching
   */
  async insertMany(
    collectionName: string,
    documents: any[],
    batchSize: number = 100
  ): Promise<BulkInsertResponse> {
    const batches: any[][] = [];

    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize));
    }

    // Chạy các batch song song
    const insertPromises = batches.map((batch) =>
      this.db.collection(collectionName).insertMany(batch)
    );

    const results = await Promise.all(insertPromises);

    const totalInserted = results.reduce(
      (sum, result) => sum + result.insertedCount,
      0
    );
    const insertedIds = results.flatMap((result) =>
      Object.values(result.insertedIds)
    );

    return {
      insertedCount: totalInserted,
      insertedIds,
    };
  }

  /**
   * Update single document by ID
   */
  async updateOne(
    collectionName: string,
    id: string,
    updateFields: any
  ): Promise<SingleUpdateResponse> {
    const result = await this.db
      .collection(collectionName)
      .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Bulk update với parallel processing
   */
  async updateMany(
    collectionName: string,
    updates: BulkUpdateOperation[]
  ): Promise<BulkUpdateResponse> {
    const updatePromises = updates.map(({ filter, update }) =>
      this.db.collection(collectionName).updateMany(filter, { $set: update })
    );

    const results = await Promise.all(updatePromises);

    const totalMatched = results.reduce(
      (sum, result) => sum + result.matchedCount,
      0
    );
    const totalModified = results.reduce(
      (sum, result) => sum + result.modifiedCount,
      0
    );

    return {
      matchedCount: totalMatched,
      modifiedCount: totalModified,
      operations: results.length,
    };
  }

  /**
   * Delete single document by ID
   */
  async deleteOne(
    collectionName: string,
    id: string
  ): Promise<SingleDeleteResponse> {
    const result = await this.db.collection(collectionName).deleteOne({
      _id: new ObjectId(id),
    });

    return { deletedCount: result.deletedCount };
  }

  /**
   * Bulk delete với parallel processing
   */
  async deleteMany(
    collectionName: string,
    filters: Record<string, any>[]
  ): Promise<BulkDeleteResponse> {
    const deletePromises = filters.map((filter) =>
      this.db.collection(collectionName).deleteMany(filter)
    );

    const results = await Promise.all(deletePromises);

    const totalDeleted = results.reduce(
      (sum, result) => sum + result.deletedCount,
      0
    );

    return {
      deletedCount: totalDeleted,
      operations: results.length,
    };
  }

  /**
   * Health check cho multiple collections
   */
  async healthCheck(collections: string[] = ["users", "products", "orders"]) {
    const healthChecks = collections.map(async (collection: string) => {
      try {
        const count = await this.db.collection(collection).countDocuments({});
        return { collection, status: "ok" as const, count };
      } catch (error: any) {
        return { collection, status: "error" as const, error: error.message };
      }
    });

    return await Promise.all(healthChecks);
  }

  // Private helper methods
  private async getCountParallel(
    collection: string,
    filter: Record<string, any>,
    pipeline?: Record<string, any>[]
  ): Promise<number> {
    if (pipeline && pipeline.length > 0) {
      const countPipeline: Record<string, any>[] = [];

      if (filter && Object.keys(filter).length > 0) {
        countPipeline.push({ $match: filter });
      }

      countPipeline.push({ $count: "count" });

      const countResult = await this.db
        .collection(collection)
        .aggregate(countPipeline)
        .toArray();
      return countResult[0]?.count || 0;
    } else {
      return await this.db.collection(collection).countDocuments(filter || {});
    }
  }

  private async getDataParallel(
    collection: string,
    filter: Record<string, any>,
    projection?: Record<string, 1 | 0>,
    sort?: Record<string, 1 | -1>,
    pipeline?: Record<string, any>[],
    skip: number = 0,
    limit: number = 10
  ): Promise<any[]> {
    const aggPipeline: Record<string, any>[] = [];

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

    if (aggPipeline.length > 0) {
      return await this.db.collection(collection).aggregate(aggPipeline).toArray();
    } else {
      return await this.db
        .collection(collection)
        .find(filter || {}, { projection })
        .sort(sort || {})
        .skip(skip)
        .limit(limit)
        .toArray();
    }
  }
}