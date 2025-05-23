import { Filter, ObjectId } from 'mongodb';
import { HttpError } from '../../utils/http-error';
import { checkRelationFields } from '../../utils/check-relation-field';
import { checkRequiredFields } from '../../utils/check-required-field';
import { filterDataBySchema } from '../../utils/filter-payload';
import { appSettings } from '../../configs/app-settings';
import { generateAggregationPipeline, getRelationFields } from '../../utils/build-query.tool';
import { mongoDBService } from '../../common/bases/mongodb.base';

export interface PaginatedResult<T> {
    limit: number;
    skip: number;
    documents: T[];
    count: number;
}

export class CommonService {

  LIST_ENTITY_WITHOUT_TENANT = [
    'user',
    'entity',
    'role',
  ]

  constructor() { 
    console.log('CommonService Initialized');
  }

  protected async buildCollectionConnect(collection_name: string) {
    let entityCollection = await mongoDBService.getCollection('entity');
    let entity = await entityCollection.findOne({ mongodb_collection_name: collection_name });
    if (!entity) throw new HttpError('Collection not found', 404);
    return await mongoDBService.getCollection(collection_name);
  }

  async findAllQuery(
    collectionName: string,
    filterQuery: Filter<any> = {},
    sortQuery: Record<string, 1 | -1> = {},
    projection: Record<string, any> = {},
    limit: number = 0,
    skip: number = 0,
  ): Promise<PaginatedResult<any>> {
    const entityCollection = await mongoDBService.getCollection('entity');
    const entity = await entityCollection.findOne({ mongodb_collection_name: collectionName });
    if (!entity) throw new HttpError('Entity not found', 404);
    const collection = await mongoDBService.getCollection(collectionName);
    let populate = await getRelationFields(entity.json_schema);
    let pipeline = await generateAggregationPipeline(populate);
    pipeline.push({ $match: filterQuery });
    pipeline.push({ $sort: sortQuery });
    if (Object.keys(projection).length > 0) pipeline.push({ $project: projection });
    if (skip > 0) pipeline.push({ $skip: skip });
    if (limit > 0) pipeline.push({ $limit: limit });
    const [
      result,
      count
    ] = await Promise.all([
      collection.aggregate(pipeline).toArray(),
      collection.countDocuments(filterQuery),
    ]);
    return {
      limit,
      skip,
      count: count,
      documents: result,
    }

  }

  async findOne(collectionName: string, id: string): Promise<any> {
    const entityCollection = await mongoDBService.getCollection('entity');
    const entity = await entityCollection.findOne({ mongodb_collection_name: collectionName });
    if (!entity) throw new HttpError('Entity not found', 404);
    const collection = await mongoDBService.getCollection(collectionName);
    let filterQuery: any = {
      _id: new ObjectId(id),
    };
    let populate = await getRelationFields(entity.json_schema);
    let pipeline = await generateAggregationPipeline(populate);
    pipeline.unshift({ $match: filterQuery });
    const result = await collection.aggregate(pipeline).toArray();
    if (!result || result.length === 0) {
      throw new HttpError(`Entity with id ${id} not found in tenant`, 404);
    }
    return result[0];
  }

  async create(collectionName: string, createDto: any, session?: any): Promise<any> {
    if (!createDto) throw new HttpError('Data is required', 400);
    let collection = await this.buildCollectionConnect(collectionName);
    let result = await collection.insertOne(createDto, { session });
    if (!result) throw new HttpError('Document not found', 404);
    return result;
  }

  async update(collectionName: string, id: string, updateDto: any, updateDtoSpec: any, _session?: any): Promise<any> {
    if (!updateDto) throw new HttpError('Data is required', 400);
    const collection = await this.buildCollectionConnect(collectionName);
    let filterQuery: any = {
      _id: new ObjectId(id),
    };
    const result = await collection.findOneAndUpdate(
      filterQuery,
      { $set: updateDto, ...updateDtoSpec },
      { returnDocument: 'after', session: _session },
    );
    if (!result) throw new HttpError(`Entity with id ${id} not found`, 404);
    return result;
  }

  async hardDelete(collectionName: string, id: string): Promise<any> {
    const entity_collection = await mongoDBService.getCollection('entity');
    let collection_detail = await entity_collection.findOne({ mongodb_collection_name: collectionName });
    if (!collection_detail) throw new HttpError('Collection not found', 404);
    const collection = await mongoDBService.getCollection(collectionName);
    let filterQuery: any = { _id: new ObjectId(id)};
    const result = await collection.findOneAndDelete(filterQuery);
    if (!result) throw new HttpError(`Entity with id ${id} not found`, 404);
    return result;
  }

}
