import { setupBasicRelationships } from "../config/relationships";
import { DatabaseConnection } from "../database/connect";
import { BaseDocument, DatabaseConfig, PostgRESTQuery } from "../database/types";
import { RelationshipRegistry } from "../relationship/RelationshipRegistry";
import { MongooseRestModel } from "./mongooseRest";
import { PostgRESTToMongoConverter } from "./mongorest";

export class MongooseRestDatabase {
  private connection: DatabaseConnection;
  private models: Map<string, MongooseRestModel<any>> = new Map();
  private converter: PostgRESTToMongoConverter;

  constructor(config: DatabaseConfig, customRelationships?: RelationshipRegistry) {
    this.connection = new DatabaseConnection(config);
    
    // Setup converter with relationships
    const registry: RelationshipRegistry = customRelationships || setupBasicRelationships();
    this.converter = new PostgRESTToMongoConverter(registry);
  }

  // ============ CONNECTION MANAGEMENT ============
  
  async connect(): Promise<void> {
    await this.connection.connect();
  }

  async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }

  async ping(): Promise<boolean> {
    return await this.connection.ping();
  }

  // ============ MODEL MANAGEMENT ============

  model<T extends BaseDocument = BaseDocument>(collectionName: string): MongooseRestModel<T> {
    if (this.models.has(collectionName)) {
      return this.models.get(collectionName) as MongooseRestModel<T>;
    }

    const collection = this.connection.getDb().collection<T>(collectionName);
    const model = new MongooseRestModel<T>(collection, this.converter, collectionName);
    
    this.models.set(collectionName, model);
    return model;
  }

  // ============ POSTGREST CONVERTER METHODS ============
  
  convertQuery(queryParams: Record<string, string>, collectionName: string): PostgRESTQuery {
    return this.converter.convert(queryParams, collectionName);
  }

  async executePostgRESTQuery(
    collectionName: string, 
    queryParams: Record<string, string>
  ): Promise<any[]> {
    const model = this.model(collectionName);
    return await model.postgrest(queryParams);
  }

  // ============ DATABASE UTILITY METHODS ============
  
  async createIndexes(
    collectionName: string,
    indexes: { [field: string]: 1 | -1 | 'text' }[]
  ): Promise<void> {
    await this.connection.createIndexes(collectionName, indexes);
  }

  async listCollections(): Promise<string[]> {
    return await this.connection.listCollections();
  }

  async dropCollection(collectionName: string): Promise<void> {
    await this.connection.dropCollection(collectionName);
    this.models.delete(collectionName);
  }

  // ============ RAW ACCESS ============
  
  getDb() {
    return this.connection.getDb();
  }

  getCollection(name: string) {
    return this.connection.getDb().collection(name);
  }

  getConverter(): PostgRESTToMongoConverter {
    return this.converter;
  }

  getConnection(): DatabaseConnection {
    return this.connection;
  }

  // ============ BULK OPERATIONS ============
  
  async executeRawQuery(collectionName: string, operation: string, ...args: any[]): Promise<any> {
    const collection = this.getCollection(collectionName);
    
    if (typeof (collection as any)[operation] === 'function') {
      return await (collection as any)[operation](...args);
    }
    
    throw new Error(`Operation '${operation}' not found on collection`);
  }

  async executeRawAggregation(collectionName: string, pipeline: Record<string, any>[]): Promise<any[]> {
    const collection = this.getCollection(collectionName);
    return await collection.aggregate(pipeline).toArray();
  }

  // ============ ANALYTICS AND REPORTING ============
  
  async getCollectionStats(collectionName: string): Promise<{
    collection: string;
    totalDocuments: number;
    sampleDocument: any;
    fields: string[];
    hasTimestamps: boolean;
  }> {
    const model = this.model(collectionName);
    
    const [totalCount, sampleDoc] = await Promise.all([
      model.count(),
      model.findOne()
    ]);
    
    const fields = sampleDoc ? Object.keys(sampleDoc) : [];
    
    return {
      collection: collectionName,
      totalDocuments: totalCount,
      sampleDocument: sampleDoc,
      fields,
      hasTimestamps: fields.includes('createdAt') && fields.includes('updatedAt')
    };
  }

  async executeAnalytics(
    collectionName: string,
    type: 'field_stats' | 'group_by' | 'time_series',
    options: Record<string, any> = {}
  ): Promise<any[]> {
    const model = this.model(collectionName);
    
    switch (type) {
      case 'field_stats':
        const { field } = options;
        if (!field) {
          throw new Error('Field parameter required for field_stats');
        }
        
        return await model.aggregate([
          { $group: {
              _id: null,
              count: { $sum: 1 },
              distinct: { $addToSet: `$${field}` },
              avg: { $avg: `$${field}` },
              min: { $min: `$${field}` },
              max: { $max: `$${field}` }
            }
          },
          { $addFields: {
              distinctCount: { $size: '$distinct' }
            }
          }
        ]);
        
      case 'group_by':
        const { groupField } = options;
        if (!groupField) {
          throw new Error('groupField parameter required for group_by');
        }
        
        return await model.aggregate([
          { $group: {
              _id: `$${groupField}`,
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]);
        
      case 'time_series':
        const { dateField = 'createdAt', interval = 'day' } = options;
        
        let dateFormat;
        switch (interval) {
          case 'hour':
            dateFormat = '%Y-%m-%d-%H';
            break;
          case 'day':
            dateFormat = '%Y-%m-%d';
            break;
          case 'month':
            dateFormat = '%Y-%m';
            break;
          default:
            dateFormat = '%Y-%m-%d';
        }
        
        return await model.aggregate([
          { $group: {
              _id: { $dateToString: { format: dateFormat, date: `$${dateField}` } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        
      default:
        throw new Error('Invalid analytics type');
    }
  }

  // ============ HEALTH CHECK ============
  
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    database: {
      connected: boolean;
      collections: number;
      availableCollections: string[];
    };
    converter: {
      available: boolean;
      type: string;
    };
    timestamp: string;
  }> {
    try {
      const isConnected = await this.ping();
      const collections = await this.listCollections();
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        database: {
          connected: isConnected,
          collections: collections.length,
          availableCollections: collections
        },
        converter: {
          available: !!this.converter,
          type: 'PostgRESTToMongoConverter'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        database: {
          connected: false,
          collections: 0,
          availableCollections: []
        },
        converter: {
          available: false,
          type: 'PostgRESTToMongoConverter'
        },
        timestamp: new Date().toISOString()
      };
    }
  }
}