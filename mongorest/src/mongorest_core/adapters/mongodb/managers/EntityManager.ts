import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import { MongoClient, Db, Collection } from 'mongodb';
import { EntityConfig, EntitiesData } from '../types';

export class EntityManager {
  private ajv: Ajv;
  private entitiesCache: EntitiesData | null = null;
  private entitiesFilePath: string;
  private fileWatcher: fs.FSWatcher | null = null;
  private client?: MongoClient;
  private db?: Db;
  private dbName?: string;

  constructor(entitiesFilePath?: string) {
    this.ajv = new Ajv();
    this.entitiesFilePath = entitiesFilePath || path.join(process.cwd(), 'json/entities', '_entities.json');
    this.initializeEntityCache();
  }

  /**
   * Initialize with MongoDB connection
   */
  async initialize(client: MongoClient, dbName: string): Promise<void> {
    this.client = client;
    this.dbName = dbName;
    this.db = client.db(dbName);
    console.log(`[EntityManager] MongoDB connection initialized for database: ${dbName}`);
  }

  private initializeEntityCache(): void {
    this.loadEntitiesFromFile();
    this.initFileWatcher();
  }

  private initFileWatcher(): void {
    if (fs.existsSync(this.entitiesFilePath)) {
      this.fileWatcher = fs.watch(this.entitiesFilePath, (eventType) => {
        if (eventType === 'change') {
          console.log('[EntityManager] Entities file changed, reloading cache...');
          this.loadEntitiesFromFile();
        }
      });
      console.log(`[EntityManager] File watcher initialized for: ${this.entitiesFilePath}`);
    } else {
      console.warn(`[EntityManager] Entities file not found: ${this.entitiesFilePath}`);
    }
  }

  private loadEntitiesFromFile(): void {
    try {
      if (!fs.existsSync(this.entitiesFilePath)) {
        console.warn(`[EntityManager] File ${this.entitiesFilePath} not found`);
        this.entitiesCache = null;
        return;
      }

      const data = fs.readFileSync(this.entitiesFilePath, 'utf8');
      const entities = JSON.parse(data) as EntitiesData;

      const schema = {
        type: 'object',
        properties: {
          documents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                title: { type: 'string' },
                collection_name: { type: 'string' },
                mongodb_collection_name: { type: 'string' },
                unique_key: { type: 'string' },
                use_parent: { type: 'boolean' },
                use_parent_delete_childs: { type: 'boolean' },
                json_schema: { type: 'object' },
                ui_schema: { type: 'object' }
              },
              required: ['title'],
              anyOf: [
                { required: ['collection_name'] },
                { required: ['mongodb_collection_name'] }
              ]
            }
          }
        },
        required: ['documents']
      };

      const validate = this.ajv.compile(schema);
      const valid = validate(entities);

      if (!valid) {
        console.error('[EntityManager] Invalid entities JSON structure:', validate.errors);
        throw new Error(`Invalid entities JSON structure: ${JSON.stringify(validate.errors)}`);
      }

      this.entitiesCache = entities;
      console.log('[EntityManager] Entities loaded and cached successfully');
    } catch (error) {
      console.error('[EntityManager] Error loading entities file:', error);
      this.entitiesCache = null;
    }
  }

  /**
   * Get collection with proxy handler for entity collection
   */
  async getCollection(collectionName: string): Promise<Collection> {
    if (!this.db) {
      throw new Error('[EntityManager] Database connection not initialized');
    }

    // Special handling for entity collection
    if (collectionName.toLowerCase() === 'entity' || collectionName === '_entities') {
      return this.createEntityCollectionProxy();
    }

    // Validate collection is allowed
    if (!this.isCollectionAllowed(collectionName)) {
      throw new Error(`Collection '${collectionName}' is not registered in entities`);
    }

    return this.db.collection(collectionName);
  }

  /**
   * Create proxy for entity collection that reads from local file
   */
  private createEntityCollectionProxy(): Collection {
    const db = this.db!;
    const collection = db.collection('entity');
    
    return new Proxy(collection, {
      get: (target, prop) => {
        if (prop === 'findOne') {
          return async (filter: any, options: any = {}) => {
            // Validate filter
            if (!filter.mongodb_collection_name && !filter.collection_name && !filter._id && !filter.id) {
              throw new Error('mongodb_collection_name, collection_name, _id or id field is required');
            }

            if (!this.entitiesCache) {
              return null;
            }

            // Find entity by filter
            const document = this.entitiesCache.documents.find((item: any) => {
              if (filter.mongodb_collection_name) {
                return item.mongodb_collection_name === filter.mongodb_collection_name;
              } else if (filter.collection_name) {
                return item.collection_name === filter.collection_name || 
                       item.mongodb_collection_name === filter.collection_name;
              } else if (filter._id) {
                return item._id === filter._id.toString();
              } else if (filter.id) {
                return item.id === filter.id.toString() || item._id === filter.id.toString();
              }
              return false;
            });

            return document || null;
          };
        }

        if (prop === 'find') {
          return (filter: any = {}, options: any = {}) => {
            const documents = this.entitiesCache?.documents || [];
            
            // Simple cursor-like object
            return {
              toArray: async () => {
                if (Object.keys(filter).length === 0) {
                  return documents;
                }
                
                // Apply filter
                return documents.filter((item: any) => {
                  return Object.entries(filter).every(([key, value]) => {
                    return item[key] === value;
                  });
                });
              }
            };
          };
        }

        // Default behavior for other methods
        return Reflect.get(target, prop);
      }
    });
  }

  /**
   * Create collection with schema validation
   */
  async createCollectionWithSchema(collectionName: string, schema: any): Promise<void> {
    if (!this.db) {
      throw new Error('[EntityManager] Database connection not initialized');
    }

    try {
      // Check if collection exists
      const collections = await this.db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        throw new Error(`Collection ${collectionName} already exists`);
      }

      // Create collection with validator
      await this.db.createCollection(collectionName, {
        validator: {
          $jsonSchema: schema
        },
        validationLevel: "strict",
        validationAction: "error",
      });

      console.log(`[EntityManager] Collection ${collectionName} created with schema validation`);
    } catch (error) {
      console.error(`[EntityManager] Error creating collection:`, error);
      throw error;
    }
  }

  /**
   * Update schema validator for existing collection
   */
  async updateCollectionSchema(collectionName: string, schema: any): Promise<void> {
    if (!this.db) {
      throw new Error('[EntityManager] Database connection not initialized');
    }

    try {
      await this.db.command({
        collMod: collectionName,
        validator: {
          $jsonSchema: schema
        },
        validationLevel: "strict",
        validationAction: "error",
      });
      
      console.log(`[EntityManager] Schema updated for collection ${collectionName}`);
    } catch (error) {
      console.error(`[EntityManager] Error updating schema:`, error);
      throw error;
    }
  }

  /**
   * Get list of all collections in database
   */
  async listCollections(): Promise<string[]> {
    if (!this.db) {
      throw new Error('[EntityManager] Database connection not initialized');
    }

    const collections = await this.db.listCollections().toArray();
    return collections.map(col => col.name);
  }

  /**
   * Create collection if not exists
   */
  async createCollection(collectionName: string): Promise<void> {
    if (!this.db) {
      throw new Error('[EntityManager] Database connection not initialized');
    }

    try {
      await this.db.createCollection(collectionName);
      console.log(`[EntityManager] Collection "${collectionName}" created successfully`);
    } catch (error: any) {
      if (error.code === 48) { // Collection already exists
        console.log(`[EntityManager] Collection "${collectionName}" already exists`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Drop collection
   */
  async dropCollection(collectionName: string): Promise<void> {
    if (!this.db) {
      throw new Error('[EntityManager] Database connection not initialized');
    }

    try {
      await this.db.dropCollection(collectionName);
      console.log(`[EntityManager] Collection "${collectionName}" dropped successfully`);
    } catch (error) {
      console.error(`[EntityManager] Error dropping collection:`, error);
      throw error;
    }
  }

  /**
   * Get entity by collection name
   */
  getEntityByCollectionName(collectionName: string): EntityConfig | undefined {
    if (!this.entitiesCache) {
      return undefined;
    }
    
    return this.entitiesCache.documents.find(
      entity => (entity.mongodb_collection_name || entity.collection_name) === collectionName
    );
  }

  /**
   * Get all entities
   */
  getEntities(): EntitiesData | null {
    return this.entitiesCache;
  }

  /**
   * Get entity from local file (without cache)
   */
  async getEntityLocal(): Promise<EntitiesData> {
    if (!fs.existsSync(this.entitiesFilePath)) {
      throw new Error(`File ${this.entitiesFilePath} not found`);
    }
    
    const data = fs.readFileSync(this.entitiesFilePath, 'utf8');
    return JSON.parse(data);
  }

  /**
   * Get all collection names from entities
   */
  getCollectionNames(): string[] {
    if (!this.entitiesCache) {
      return [];
    }
    
    return this.entitiesCache.documents.map(
      entity => entity.mongodb_collection_name || entity.collection_name || ''
    ).filter(name => name);
  }

  /**
   * Check if collection is allowed
   */
  isCollectionAllowed(collectionName: string): boolean {
    // Special cases
    if (collectionName === 'entity' || collectionName === '_entities') {
      return true;
    }
    
    if (!this.entitiesCache || !this.entitiesCache.documents) {
      console.warn('[EntityManager] No entities loaded, rejecting collection access');
      return false;
    }

    return this.entitiesCache.documents.some(
      entity => (entity.mongodb_collection_name || entity.collection_name) == collectionName
    );
  }

  /**
   * Reload entities from file
   */
  reloadEntities(): void {
    this.loadEntitiesFromFile();
  }

  /**
   * Watch collection for changes
   */
  async watchCollection(
    collectionName: string, 
    targetCollectionName: string, 
    type: string
  ): Promise<void> {
    if (!this.db) {
      throw new Error('[EntityManager] Database connection not initialized');
    }

    const collection = this.db.collection(collectionName);
    const targetCollection = this.db.collection(targetCollectionName);
    const changeStream = collection.watch();

    changeStream.on("change", async (change) => {
      if (change.operationType === "insert" || 
          change.operationType === "update" || 
          change.operationType === "replace") {
        
        const data = await collection.findOne({ _id: change.documentKey._id });
        if (data) {
          console.log(`[EntityManager] 🔄 ${change.operationType} ${collectionName}: ${data._id} to ${targetCollectionName} with type ${type}`);
          await targetCollection.updateOne(
            { _id: data._id },
            { $set: { ...data, type } },
            { upsert: true }
          );
        }
      } else if (change.operationType === "delete") {
        await targetCollection.deleteOne({ _id: change.documentKey._id });
      }
    });

    console.log(`[EntityManager] 🔄 Watching ${collectionName}`);
  }

  /**
   * Cleanup resources
   */
  async dispose(): Promise<void> {
    // Close file watcher
    if (this.fileWatcher) {
      this.fileWatcher.close();
      this.fileWatcher = null;
      console.log('[EntityManager] File watcher disposed');
    }

    // Clear cache
    this.entitiesCache = null;
    
    // Clear references
    this.db = undefined;
    this.client = undefined;
  }
}