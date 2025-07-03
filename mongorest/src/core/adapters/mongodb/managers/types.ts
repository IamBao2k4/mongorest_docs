import { MongoClient, Db, Collection } from 'mongodb';
import { EntityConfig, EntitiesData } from '../types';
import { RelationshipDefinition } from '../../base/relationship/types';

/**
 * Interface for Entity Management operations
 * Provides a user-friendly API for managing MongoDB entities with schema validation,
 * relationship management, and automatic configuration loading.
 * 
 * @example
 * ```typescript
 * const entityManager: IEntityManager = new EntityManager();
 * await entityManager.initialize(mongoClient, 'myDatabase');
 * 
 * // Get a collection
 * const userCollection = await entityManager.getCollection('users');
 * 
 * // Get entity configuration
 * const userEntity = entityManager.getEntityByCollectionName('users');
 * ```
 */
export interface IEntityManager {
  /**
   * Initialize the entity manager with MongoDB connection
   * Must be called before using any database operations
   * 
   * @param client - MongoDB client instance
   * @param dbName - Name of the database to use
   * @returns Promise that resolves when initialization is complete
   * 
   * @example
   * ```typescript
   * await entityManager.initialize(mongoClient, 'myDatabase');
   * ```
   */
  initialize(client: MongoClient, dbName: string): Promise<void>;

  /**
   * Get a MongoDB collection by name with validation
   * Validates that the collection is registered in the entities configuration
   * Special handling for 'entity' collection which reads from local JSON file
   * 
   * @param collectionName - Name of the collection to retrieve
   * @returns Promise resolving to the MongoDB Collection
   * @throws Error if collection is not registered or database not initialized
   * 
   * @example
   * ```typescript
   * const collection = await entityManager.getCollection('users');
   * const user = await collection.findOne({ email: 'user@example.com' });
   * ```
   */
  getCollection(collectionName: string): Promise<Collection>;

  /**
   * Create a new collection with JSON schema validation
   * Ensures data integrity by enforcing schema rules at database level
   * 
   * @param collectionName - Name of the collection to create
   * @param schema - JSON schema for validation
   * @returns Promise that resolves when collection is created
   * @throws Error if collection already exists or database not initialized
   * 
   * @example
   * ```typescript
   * const userSchema = {
   *   bsonType: 'object',
   *   required: ['name', 'email'],
   *   properties: {
   *     name: { bsonType: 'string' },
   *     email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' }
   *   }
   * };
   * await entityManager.createCollectionWithSchema('users', userSchema);
   * ```
   */
  createCollectionWithSchema(collectionName: string, schema: any): Promise<void>;

  /**
   * Get list of all collections in the database
   * 
   * @returns Promise resolving to array of collection names
   * @throws Error if database not initialized
   * 
   * @example
   * ```typescript
   * const collections = await entityManager.listCollections();
   * console.log('Available collections:', collections);
   * ```
   */
  listCollections(): Promise<string[]>;

  /**
   * Get entity configuration by collection name
   * Returns undefined if entity not found
   * 
   * @param collectionName - Name of the collection
   * @returns Entity configuration object or undefined
   * 
   * @example
   * ```typescript
   * const userEntity = entityManager.getEntityByCollectionName('users');
   * if (userEntity) {
   *   console.log('User entity schema:', userEntity.json_schema);
   * }
   * ```
   */
  getEntityByCollectionName(collectionName: string): EntityConfig | undefined;

  /**
   * Get all loaded entities configuration
   * Returns null if entities not loaded
   * 
   * @returns All entities data or null
   * 
   * @example
   * ```typescript
   * const entities = entityManager.getEntities();
   * if (entities) {
   *   console.log(`Loaded ${entities.documents.length} entities`);
   * }
   * ```
   */
  getEntities(): EntitiesData | null;

  /**
   * Get all registered collection names from entities
   * 
   * @returns Array of collection names (may be empty if no entities loaded)
   * 
   * @example
   * ```typescript
   * const collectionNames = entityManager.getCollectionNames();
   * collectionNames.forEach(name => console.log(`Collection: ${name}`));
   * ```
   */
  getCollectionNames(): string[];

  /**
   * Check if a collection is allowed/registered
   * Used internally for validation before granting collection access
   * 
   * @param collectionName - Name of the collection to check
   * @returns true if collection is allowed, false otherwise
   * 
   * @example
   * ```typescript
   * if (entityManager.isCollectionAllowed('users')) {
   *   // Safe to access users collection
   * }
   * ```
   */
  isCollectionAllowed(collectionName: string): boolean;

  /**
   * Watch a collection for changes and sync to target collection
   * Useful for implementing data synchronization patterns
   * 
   * @param collectionName - Source collection to watch
   * @param targetCollectionName - Target collection to sync changes to
   * @param type - Type identifier for synced documents
   * @returns Promise that resolves when watcher is set up
   * @throws Error if database not initialized
   * 
   * @example
   * ```typescript
   * // Sync all user changes to audit_log collection
   * await entityManager.watchCollection('users', 'audit_log', 'user_change');
   * ```
   */
  watchCollection(
    collectionName: string, 
    targetCollectionName: string, 
    type: string
  ): Promise<void>;

  /**
   * Parse and register relationships from entities configuration
   * Automatically extracts relationship definitions from JSON schemas
   * and registers them with the RelationshipRegistry
   * 
   * @param entities - Entities data containing relationship definitions
   * @returns Promise that resolves when relationships are registered
   * 
   * @example
   * ```typescript
   * const entities = entityManager.getEntities();
   * if (entities) {
   *   await entityManager.parseAndRegisterRelationships(entities);
   * }
   * ```
   */
  parseAndRegisterRelationships(entities: EntitiesData): Promise<void>;

  /**
   * Clean up resources (file watchers, cache, etc.)
   * Should be called when entity manager is no longer needed
   * 
   * @returns Promise that resolves when cleanup is complete
   * 
   * @example
   * ```typescript
   * // On application shutdown
   * await entityManager.dispose();
   * ```
   */
  dispose(): Promise<void>;
}

/**
 * Configuration options for EntityManager constructor
 */
export interface IEntityManagerOptions {
  /**
   * Path to the entities JSON file
   * @default path.join(process.cwd(), 'json/entities', '_entities.json')
   */
  entitiesFilePath?: string;
  
  /**
   * Custom RelationshipRegistry instance
   * @default new RelationshipRegistry()
   */
  relationshipRegistry?: any;
}

/**
 * Collection watch event types
 */
export type WatchEventType = 'insert' | 'update' | 'replace' | 'delete';

/**
 * Entity collection proxy methods
 * Special methods available when accessing the 'entity' collection
 */
export interface IEntityCollectionProxy {
  /**
   * Find one entity by filter criteria
   * @param filter - Must include one of: mongodb_collection_name, collection_name, _id, or id
   * @param options - MongoDB find options
   */
  findOne(filter: { 
    mongodb_collection_name?: string;
    collection_name?: string;
    _id?: string;
    id?: string;
  }, options?: any): Promise<EntityConfig | null>;
  
  /**
   * Find all entities matching filter
   * @param filter - Filter criteria (empty object returns all)
   * @param options - MongoDB find options
   */
  find(filter?: any, options?: any): {
    toArray(): Promise<EntityConfig[]>;
  };
}