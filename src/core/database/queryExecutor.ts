import { Collection, Filter, FindOptions } from 'mongodb';
import { QueryHelper } from './queryHelper'; 
import { BaseDocument, PostgRESTQuery, QueryOptions } from './types';

export class QueryExecutor<T extends BaseDocument = BaseDocument> {
  constructor(private collection: Collection<T>) {}

  // Execute PostgREST-style query
  async executePostgRESTQuery(mongoQuery: PostgRESTQuery): Promise<T[]> {
    const { filter, projection, sort, pipeline, hasEmbeds, limit, offset } = mongoQuery;

    console.log(`\n=== Executing PostgREST Query for ${this.collection.collectionName} ===`);
    console.log('Filter:', JSON.stringify(filter, null, 2));
    console.log('Has embeds:', hasEmbeds);
    console.log('Pipeline stages:', pipeline?.length || 0);

    // If has embeds/joins, use aggregation pipeline
    if (hasEmbeds && pipeline && Array.isArray(pipeline) && pipeline.length > 0) {
      const aggPipeline: any[] = [];

      // 1. Add $match stage
      if (filter && Object.keys(filter).length > 0) {
        aggPipeline.push({ $match: filter });
      }

      // 2. Add lookup/population stages
      aggPipeline.push(...pipeline);

      // 3. Add projection if exists
      if (projection && Object.keys(projection).length > 0) {
        // Ensure embedded fields are not excluded
        const safeProjection = { ...projection };
        if (mongoQuery.embeddedTables) {
          mongoQuery.embeddedTables.forEach(table => {
            safeProjection[table] = 1;
          });
        }
        aggPipeline.push({ $project: safeProjection });
      }

      // 4. Add sorting
      if (sort && Object.keys(sort).length > 0) {
        aggPipeline.push({ $sort: sort });
      }

      // 5. Add pagination
      if (offset && offset > 0) {
        aggPipeline.push({ $skip: offset });
      }
      if (limit && limit > 0) {
        aggPipeline.push({ $limit: limit });
      }

      console.log('Aggregation pipeline:', JSON.stringify(aggPipeline, null, 2));
      return (await this.collection.aggregate(aggPipeline).toArray()) as T[];

    } else {
      // Simple find query
      console.log('Using simple find query');
      let query = this.collection.find(filter || {});

      if (projection && Object.keys(projection).length > 0) {
        query = query.project(projection);
      }

      if (sort && Object.keys(sort).length > 0) {
        query = query.sort(sort);
      }

      if (offset && offset > 0) {
        query = query.skip(offset);
      }
      if (limit && limit > 0) {
        query = query.limit(limit);
      }

      return (await query.toArray()) as T[];
    }
  }

  // Execute traditional MongoDB query
  async executeQuery(filter: Filter<T>, options?: QueryOptions): Promise<T[]> {
    const normalizedFilter = QueryHelper.normalizeIds(filter);
    
    if (options?.populate) {
      return await this.executeQueryWithPopulation(normalizedFilter, options);
    }

    const findOptions = this.buildFindOptions(options);
    return (await this.collection.find(normalizedFilter, findOptions).toArray()) as T[];
  }

  // Execute query with population (using aggregation)
  private async executeQueryWithPopulation(filter: Filter<T>, options: QueryOptions): Promise<T[]> {
    const pipeline: any[] = [];

    // Add match stage
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Add lookup stages for population
    if (options.populate) {
      const populateFields = Array.isArray(options.populate) ? options.populate : [options.populate];
      
      for (const field of populateFields) {
        // Basic lookup - should be enhanced with relationship config
        pipeline.push({
          $lookup: {
            from: field,
            localField: `${field}Id`,
            foreignField: '_id',
            as: field
          }
        });
      }
    }

    // Add other stages
    if (options.select) {
      const projection = Array.isArray(options.select)
        ? options.select.reduce((acc, field) => ({ ...acc, [field]: 1 }), {})
        : options.select;
      pipeline.push({ $project: projection });
    }

    if (options.sort) {
      const sort = typeof options.sort === 'string' ? QueryHelper.parseSort(options.sort) : options.sort;
      pipeline.push({ $sort: sort });
    }

    if (options.skip) pipeline.push({ $skip: options.skip });
    if (options.limit) pipeline.push({ $limit: options.limit });

    return (await this.collection.aggregate(pipeline).toArray()) as T[];
  }

  private buildFindOptions(options?: QueryOptions): FindOptions {
    const findOptions: FindOptions = {};

    if (options?.select) {
      findOptions.projection = Array.isArray(options.select)
        ? options.select.reduce((acc, field) => ({ ...acc, [field]: 1 }), {})
        : options.select;
    }

    if (options?.sort) {
      findOptions.sort = typeof options.sort === 'string'
        ? QueryHelper.parseSort(options.sort)
        : options.sort;
    }

    if (options?.limit) findOptions.limit = options.limit;
    if (options?.skip) findOptions.skip = options.skip;

    return findOptions;
  }
}