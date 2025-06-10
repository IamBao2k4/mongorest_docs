import { Collection } from 'mongodb';
import { PostgRESTToMongoConverter } from '../main/mongorest';
import { BaseDocument, PaginationResult, PostgRESTQuery, QueryOptions } from '../database/types';
import { CrudOperations } from '../database/crudOperations';
import { QueryExecutor } from '../database/queryExecutor';
import { PaginationHandler } from '../database/paginationHandler';

export class MongooseRestModel<T extends BaseDocument> {
  private crudOps: CrudOperations<T>;
  private queryExecutor: QueryExecutor<T>;
  private paginationHandler: PaginationHandler<T>;

  constructor(
    private collection: Collection<T>,
    private converter: PostgRESTToMongoConverter,
    private collectionName: string
  ) {
    this.crudOps = new CrudOperations(collection);
    this.queryExecutor = new QueryExecutor(collection);
    this.paginationHandler = new PaginationHandler(this.crudOps);
  }

  // ============ TRADITIONAL CRUD METHODS ============
  
  async create(data: Partial<T>): Promise<T> {
    return await this.crudOps.create(data);
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    return await this.crudOps.createMany(data);
  }

  async findById(id: string | any, options?: QueryOptions): Promise<T | null> {
    return await this.crudOps.findById(id, options);
  }

  async findOne(filter: any = {}, options?: QueryOptions): Promise<T | null> {
    return await this.crudOps.findOne(filter, options);
  }

  async find(filter: any = {}, options?: QueryOptions): Promise<T[]> {
    return await this.crudOps.find(filter, options);
  }

  async updateById(
    id: string | any,
    update: Partial<T>,
    options?: { upsert?: boolean; new?: boolean }
  ): Promise<T | null> {
    return await this.crudOps.updateById(id, update, options);
  }

  async updateOne(
    filter: any,
    update: Partial<T>,
    options?: { upsert?: boolean; new?: boolean }
  ): Promise<T | null> {
    return await this.crudOps.updateOne(filter, update, options);
  }

  async updateMany(filter: any, update: Partial<T>): Promise<number> {
    return await this.crudOps.updateMany(filter, update);
  }

  async deleteById(id: string | any): Promise<boolean> {
    return await this.crudOps.deleteById(id);
  }

  async deleteOne(filter: any): Promise<boolean> {
    return await this.crudOps.deleteOne(filter);
  }

  async deleteMany(filter: any): Promise<number> {
    return await this.crudOps.deleteMany(filter);
  }

  // ============ POSTGREST-STYLE METHODS ============

  async postgrest(queryParams: Record<string, string>): Promise<T[]> {
    const mongoQuery = this.converter.convert(queryParams, this.collectionName);
    return await this.executePostgRESTQuery(mongoQuery);
  }

  async executePostgRESTQuery(mongoQuery: PostgRESTQuery): Promise<T[]> {
    return await this.queryExecutor.executePostgRESTQuery(mongoQuery);
  }

  // ============ UTILITY METHODS ============

  async count(filter: any = {}): Promise<number> {
    return await this.crudOps.count(filter);
  }

  async exists(filter: any): Promise<boolean> {
    return await this.crudOps.exists(filter);
  }

  async distinct(field: string, filter: any = {}): Promise<any[]> {
    return await this.crudOps.distinct(field, filter);
  }

  // ============ PAGINATION ============

  async paginate(
    filter: any | Record<string, string> = {},
    options: {
      page?: number;
      limit?: number;
      usePostgREST?: boolean;
    } = {}
  ): Promise<PaginationResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    let data: T[];
    let totalDocs: number;

    if (options.usePostgREST && typeof filter === 'object' && !('_id' in filter)) {
      const queryParams = { 
        ...filter as Record<string, string>, 
        limit: limit.toString(), 
        offset: skip.toString() 
      };
      data = await this.postgrest(queryParams);
      
      const countParams = { ...filter as Record<string, string> };
      delete countParams.limit;
      delete countParams.offset;
      const countQuery = this.converter.convert(countParams, this.collectionName);
      totalDocs = await this.crudOps.count(countQuery.filter);
    } else {
      const result = await this.paginationHandler.paginate(filter, { page, limit });
      return result;
    }

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocs,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  // ============ AGGREGATION ============

  async aggregate(pipeline: Record<string, any>[]): Promise<any[]> {
    return await this.crudOps.aggregate(pipeline);
  }

  // ============ SEARCH ============

  async search(
    searchTerm: string,
    fields: string[],
    options?: QueryOptions
  ): Promise<T[]> {
    const searchFilter = {
      $or: fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }))
    };
    
    return await this.find(searchFilter, options);
  }

  // ============ GETTERS ============

  getCollection(): Collection<T> {
    return this.collection;
  }

  getConverter(): PostgRESTToMongoConverter {
    return this.converter;
  }

  getCollectionName(): string {
    return this.collectionName;
  }
}