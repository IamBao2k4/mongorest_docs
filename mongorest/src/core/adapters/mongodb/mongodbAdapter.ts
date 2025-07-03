import {
  DatabaseType,
  AdapterCapabilities,
  ExecutionOptions,
  AdapterConfig,
  ValidationResult
} from '../base/types';
import { 
  IntermediateQuery, 
  IntermediateQueryResult
} from '../../types/intermediateQuery';
import { RelationshipRegistry } from '../base/relationship/RelationshipRegistry';
import { EntityManager } from './managers/EntityManager';
import { QueryConverter } from './converters/QueryConverter';
import { MongoDBQuery } from './types';
import { Collection, Db, MongoClient } from 'mongodb';
import { BaseDatabaseAdapter } from '../base/databaseAdapter';

/**
 * MongoDB adapter for converting intermediate queries to MongoDB aggregation pipelines
 */
export class MongoDBAdapter extends BaseDatabaseAdapter {
  readonly name = 'mongodb';
  readonly type: DatabaseType = 'mongodb';
  readonly version = '1.0.0';

  private relationshipRegistry?: RelationshipRegistry;
  private db?: Db; // MongoDB database instance
  
  private queryConverter: QueryConverter;

  // Temporary storage for current query context
  private currentQuery?: IntermediateQuery;
  private currentCollection?: string;

  public entityManager: EntityManager;

  constructor(relationshipRegistry?: RelationshipRegistry, entitiesFilePath?: string) {
    super();
    this.relationshipRegistry = relationshipRegistry || new RelationshipRegistry();
    this.entityManager = new EntityManager(entitiesFilePath, this.relationshipRegistry);
    this.queryConverter = new QueryConverter(this.relationshipRegistry);
  }

  /**
   * Validate query before conversion
   */
  validateQuery(query: IntermediateQuery): ValidationResult {
    // Call parent validation first
    const result = super.validateQuery(query);
    
    // Add custom validation for entity existence
    if (!this.entityManager.isCollectionAllowed(query.collection)) {
      result.valid = false;
      result.errors.push({
        code: 'COLLECTION_NOT_REGISTERED',
        message: `Collection '${query.collection}' is not registered in entities. Please add it to _entities.json first.`,
        path: 'collection'
      });
    }
    
    return result;
  }

  /**
   * Convert intermediate query to MongoDB query
   */
  convertQuery(query: IntermediateQuery): MongoDBQuery {
    // Store current context for validation
    this.setCurrentContext(query);
    
    // Validate collection exists in entities before any operation
    const collectionName = query.collection;
    if (!this.entityManager.isCollectionAllowed(collectionName)) {
      throw new Error(`Collection '${collectionName}' is not registered in entities. Please add it to _entities.json first.`);
    }
    
    // Use QueryConverter to handle the conversion
    return this.queryConverter.convertQuery(query);
  }

  /**
   * Execute MongoDB query
   */
  async executeQuery<T = any>(
    nativeQuery: MongoDBQuery, 
    options?: ExecutionOptions
  ): Promise<IntermediateQueryResult<T>> {
    this.ensureInitialized();
    if (!this.db) {
      throw new Error('MongoDB database connection is not available');
    }
    
    // Validate collection exists in entities
    const collectionName = this.getCurrentCollection();
    if (!this.entityManager.isCollectionAllowed(collectionName)) {
      throw new Error(`Collection '${collectionName}' is not registered in entities. Please add it to _entities.json first.`);
    }
    const startTime = Date.now();

    try {
      const collection: Collection = this.db.collection(this.getCurrentCollection());
      let result: any;
      let data: T[] = [];

      // Handle different operation types
      if (Array.isArray(nativeQuery)) {
        const cursor = collection.aggregate(nativeQuery);
        data = await cursor.toArray() as T[];
      } else if (nativeQuery.operation) {
        // CRUD operations
        switch (nativeQuery.operation) {
          case 'insertOne':
            result = await collection.insertOne(nativeQuery.document);
            data = [{ ...nativeQuery.document, _id: result.insertedId }] as T[];
            break;

          case 'updateOne':
            result = await collection.updateOne(nativeQuery.filter, nativeQuery.update);
            if (result.modifiedCount > 0) {
              const updated = await collection.findOne(nativeQuery.filter);
              data = updated ? [updated as unknown as T] : [];
            }
            break;

          case 'replaceOne':
            result = await collection.replaceOne(nativeQuery.filter, nativeQuery.update);
            if (result.modifiedCount > 0) {
              const replaced = await collection.findOne(nativeQuery.filter);
              data = replaced ? [replaced as unknown as T] : [];
            }
            break;

          case 'deleteOne':
            result = await collection.deleteOne(nativeQuery.filter);
            data = [];
            break;

          default:
            throw new Error(`Unsupported operation: ${nativeQuery.operation}`);
        }
      }

      const executionTime = Date.now() - startTime;
      const queryResult = this.createResult(data, this.getCurrentQuery(), nativeQuery, executionTime);

      // Add operation metadata for CRUD operations
      if (result) {
        queryResult.metadata = {
          ...queryResult.metadata,
          insertedCount: result.insertedCount || 0,
          modifiedCount: result.modifiedCount || 0,
          deletedCount: result.deletedCount || 0,
          matchedCount: result.matchedCount || 0
        };
      }

      return queryResult;
    } catch (error) {
      throw new Error(`MongoDB query execution failed: ${(error as Error).message}`);
    }
  }

  /**
   * Get MongoDB adapter capabilities
   */
  getCapabilities(): AdapterCapabilities {
    return {
      filterOperators: [
        'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
        'in', 'nin', 'exists', 'null', 'notnull',
        'regex', 'like', 'ilike', 'contains',
        'startswith', 'endswith'
      ],
      joinTypes: [
        'lookup', 'left', 'inner', 'one-to-one',
        'one-to-many', 'many-to-one', 'many-to-many'
      ],
      aggregations: [
        'count', 'sum', 'avg', 'min', 'max',
        'group', 'distinct'
      ],
      fullTextSearch: true,
      transactions: true,
      nestedQueries: true,
      maxComplexity: 100,
      maxResultSize: 1000000
    };
  }

  /**
   * Initialize MongoDB adapter
   */
  async initialize(config: AdapterConfig): Promise<void> {
    await super.initialize(config);
    
    let client: MongoClient;
    let dbName: string;
    if (config.custom?.db) {
      this.db = config.custom.db;
      // Try to get client and dbName from custom config
      client = config.custom.client;
      dbName = config.custom.dbName || 'mongorest';
    } else if (config.connection) {
      // Initialize MongoDB connection if not provided
      
      const connectionString = config.connection.connectionString ||
        this.buildConnectionString(config.connection);
      
      client = new MongoClient(connectionString);
      await client.connect();

      // Extract database name from connection string or use provided database
      dbName = config.connection.database || '';
      
      // If no database name provided, try to extract from connection string
      if (!dbName && config.connection.connectionString) {
        const match = config.connection.connectionString.match(/\/([^/?]+)(\?|$)/);
        if (match) {
          dbName = match[1];
        }
      }
      this.db = client.db(dbName);
    } else {
      throw new Error('MongoDB connection configuration is required');
    }
    
    // Initialize EntityManager with MongoDB connection
    if (client && dbName) {
      await this.entityManager.initialize(client, dbName);
    }
  }

  /**
   * Test MongoDB connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      await this.db.admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cleanup adapter resources including file watcher
   */
  async dispose(): Promise<void> {
    // Clean up entity manager
    await this.entityManager.dispose();

    // Call parent dispose
    await super.dispose();
  }

  private buildConnectionString(config: any): string {
    const { host = 'localhost', port = 27017, username, password, database } = config;

    let connectionString = 'mongodb://';

    if (username && password) {
      connectionString += `${username}:${password}@`;
    }

    connectionString += `${host}:${port}`;

    if (database) {
      connectionString += `/${database}`;
    }

    return connectionString;
  }

  private getCurrentQuery(): IntermediateQuery {
    return this.currentQuery || {} as IntermediateQuery;
  }

  private getCurrentCollection(): string {
    return this.currentCollection || 'default';
  }

  // Method to set current context (to be called before execution)
  setCurrentContext(query: IntermediateQuery): void {
    this.currentQuery = query;
    this.currentCollection = query.collection;
  }
}