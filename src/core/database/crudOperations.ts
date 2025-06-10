import { Collection, ObjectId, Filter, OptionalUnlessRequiredId, WithId, UpdateFilter } from 'mongodb';
import { BaseDocument, QueryOptions } from './types';
import { QueryExecutor } from './queryExecutor';
import { TimestampMiddleware } from './timestampMiddleware';
import { QueryHelper } from './queryHelper';


export class CrudOperations<T extends BaseDocument> {
  private queryExecutor: QueryExecutor<T>;

  constructor(private collection: Collection<T>) {
    this.queryExecutor = new QueryExecutor(collection);
  }

  // CREATE operations
  async create(data: Partial<T>): Promise<T> {
    const processedData = TimestampMiddleware.beforeCreate(data) as OptionalUnlessRequiredId<T>;
    const result = await this.collection.insertOne(processedData);
    
    const created = await this.findById(result.insertedId as ObjectId);
    if (!created) {
      throw new Error('Failed to create document');
    }
    return created;
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    const processedData = data.map(item => 
      TimestampMiddleware.beforeCreate(item) as OptionalUnlessRequiredId<T>
    );
    const result = await this.collection.insertMany(processedData);
    const ids = Object.values(result.insertedIds);
    return await this.find({ _id: { $in: ids } } as Filter<T>);
  }

  // READ operations
  async findById(id: string | ObjectId, options?: QueryOptions): Promise<T | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.findOne({ _id: objectId } as Filter<T>, options);
  }

  async findOne(filter: Filter<T> = {} as Filter<T>, options?: QueryOptions): Promise<T | null> {
    const results = await this.queryExecutor.executeQuery(filter, { ...options, limit: 1 });
    return results.length > 0 ? results[0] : null;
  }

  async find(filter: Filter<T> = {} as Filter<T>, options?: QueryOptions): Promise<T[]> {
    return await this.queryExecutor.executeQuery(filter, options);
  }

  // UPDATE operations
  async updateById(
    id: string | ObjectId,
    update: Partial<T>,
    options?: { upsert?: boolean; new?: boolean }
  ): Promise<T | null> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.updateOne({ _id: objectId } as Filter<T>, update, options);
  }

  async updateOne(
    filter: Filter<T>,
    update: Partial<T>,
    options?: { upsert?: boolean; new?: boolean }
  ): Promise<T | null> {
    const normalizedFilter = QueryHelper.normalizeIds(filter);
    const processedUpdate = TimestampMiddleware.cleanUpdateData(update);

    const result = await this.collection.findOneAndUpdate(
      normalizedFilter,
      { $set: processedUpdate } as UpdateFilter<T>,
      {
        returnDocument: 'after',
        upsert: options?.upsert || false
      }
    );

    return result as T | null;
  }

  async updateMany(filter: Filter<T>, update: Partial<T>): Promise<number> {
    const normalizedFilter = QueryHelper.normalizeIds(filter);
    const processedUpdate = TimestampMiddleware.cleanUpdateData(update);

    const result = await this.collection.updateMany(
      normalizedFilter,
      { $set: processedUpdate } as UpdateFilter<T>
    );

    return result.modifiedCount;
  }

  // DELETE operations
  async deleteById(id: string | ObjectId): Promise<boolean> {
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await this.deleteOne({ _id: objectId } as Filter<T>);
  }

  async deleteOne(filter: Filter<T>): Promise<boolean> {
    const normalizedFilter = QueryHelper.normalizeIds(filter);
    const result = await this.collection.deleteOne(normalizedFilter);
    return result.deletedCount > 0;
  }

  async deleteMany(filter: Filter<T>): Promise<number> {
    const normalizedFilter = QueryHelper.normalizeIds(filter);
    const result = await this.collection.deleteMany(normalizedFilter);
    return result.deletedCount;
  }

  // UTILITY operations
  async count(filter: Filter<T> = {} as Filter<T>): Promise<number> {
    const normalizedFilter = QueryHelper.normalizeIds(filter);
    return await this.collection.countDocuments(normalizedFilter);
  }

  async exists(filter: Filter<T>): Promise<boolean> {
    const count = await this.count(filter);
    return count > 0;
  }

  async distinct(field: string, filter: Filter<T> = {} as Filter<T>): Promise<any[]> {
    const normalizedFilter = QueryHelper.normalizeIds(filter);
    return await this.collection.distinct(field, normalizedFilter);
  }

  // Raw aggregation
  async aggregate(pipeline: Record<string, any>[]): Promise<any[]> {
    return await this.collection.aggregate(pipeline).toArray();
  }
}
