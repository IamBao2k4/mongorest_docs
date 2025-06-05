import { MongoClient } from 'mongodb';
import { appSettings } from '../../configs/app-settings';
import Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
class MongoDBService {

  private client: MongoClient;
  private dbName: string;
  private ajv: Ajv = new Ajv();
  private entitiesCache: any = [];
  private entitiesFilePath: string = '';
  private fileWatcher: fs.FSWatcher | null = null;

  constructor() {
    const uri = `${appSettings.mongo.url}/${appSettings.mongo.dbName}${appSettings.mongo.options}`;
    this.client = new MongoClient(uri);
    this.dbName = appSettings.mongo.dbName || 'test';
    this.ajv = new Ajv();
    this.entitiesFilePath = path.join(process.cwd(), 'json/entities', '_entities.json');
    console.log(`MongoDBService initialized: ${this.dbName}`);
    this.initFileWatcher();
  }

  private initFileWatcher() {
    // Load initial data into cache
    this.loadEntitiesFromFile();

    // Watch for file changes
    if (fs.existsSync(this.entitiesFilePath)) {
      this.fileWatcher = fs.watch(this.entitiesFilePath, (eventType, filename) => {
        if (eventType === 'change') {
          console.log('Entities file changed, reloading cache...');
          this.loadEntitiesFromFile();
        }
      });
      console.log(`File watcher initialized for: ${this.entitiesFilePath}`);
    } else {
      console.warn(`Entities file not found: ${this.entitiesFilePath}`);
    }
  }

  private loadEntitiesFromFile(): any {
    try {
      if (!fs.existsSync(this.entitiesFilePath)) {
        console.warn(`File ${this.entitiesFilePath} not found`);
        this.entitiesCache = null;
        return null;
      }

      const data = fs.readFileSync(this.entitiesFilePath, 'utf8');
      const entities = JSON.parse(data);

      // Validate JSON structure with AJV - flexible schema
      const schema = {
        type: 'object',
        additionalProperties: true // Allow any structure
      };

      const validate = this.ajv.compile(schema);
      const valid = validate(entities);

      if (!valid) {
        console.error('Invalid entities JSON structure:', validate.errors);
        throw new Error(`Invalid entities JSON structure: ${JSON.stringify(validate.errors)}`);
      }

      // Cache the validated data
      this.entitiesCache = entities;
      console.log('Entities data loaded and cached successfully');
      return entities;
    } catch (error) {
      console.error('Error loading entities file:', error);
      this.entitiesCache = null;
      return null;
    }
  }

  async getDatabase() {
    return this.client.db(this.dbName);
  }

  async onModuleInit() {
    await this.client.connect();
  }

  async getDb(dbName: string = this.dbName) {
    return this.client.db(dbName);
  }

  async startSession() {
    return this.client.startSession();
  }

  async closeSession(session: any) {
    return session.endSession();
  }

  async getEntityLocal() {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'json/entities', '_entities.json');
    if (!fs.existsSync(filePath)) {
      throw new Error(`File ${filePath} not found`);
    }
    const data = fs.readFileSync(filePath, 'utf8');
    let entities = JSON.parse(data);
    return entities;
  }

  private async handleEntityCollectionLocalSrc() {
    const db = await this.getDb();
    const collection = db.collection('entity');
    return new Proxy(collection, {
      get(target, prop) {
        if (prop === 'findOne') {
          return async (filter: any, options: any = {}) => {
            // check filter has mongodb_collection_name field
            if (
              !filter.mongodb_collection_name &&
              !filter._id &&
              !filter.id
            ) {
              throw new Error('mongodb_collection_name or _id || id field is required to get JSON data');
            }
            // find mongodb_collection_name.json file in /json/entities/_entities.json folder
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(process.cwd(), 'json/entities', '_entities.json');
            if (!fs.existsSync(filePath)) {
              throw new Error(`File ${filePath} not found`);
            }
            const data = fs.readFileSync(filePath, 'utf8');
            let entities = JSON.parse(data);
            // find entity by mongodb_collection_name or _id || id
            let document = entities.documents.find((item: any) => {
              if (filter.collection_name) {
                return item.collection_name == filter.collection_name;
              } else if (filter._id) {
                return item._id == filter?._id.toString();
              } else if (filter.id) {
                return item.id == filter?.id.toString();
              }
            });
            return document;
          };
        }
        return Reflect.get(target, prop);
      }
    });
  }

  async getCollection(collectionName: string) {
    try {
      if (collectionName.toLocaleLowerCase() == 'entity') {
        return this.handleEntityCollectionLocalSrc();
      } else {
        const db = await this.getDb();
        return db.collection(collectionName);
      }
    } catch (error) {
      console.error(`Failed to get collection ${collectionName}:`, error);
      throw new Error(`Failed to get collection ${collectionName}`);
    }
  }

  async getListCollections() {
    const db = await this.getDb();
    const collections = await db.listCollections().toArray();
    return collections.map(col => col.name);
  }

  async createCollection(collectionName: string) {
    const db = await this.getDb();
    try {
      await db.createCollection(collectionName);
      let timestamp = new Date(appSettings.timeZoneMongoDB.getCurrentTime())
      console.warn(`[${MongoDBService.name}] social_threads - ${timestamp} Collection "${collectionName}" has been successfully created.`);
    } catch (error: any) {
      console.error(`Error creating collection: ${error.message}`);
      throw error;
    }
  }

  async dropCollection(collectionName: string) {
    const db = await this.getDb();
    try {
      await db.dropCollection(collectionName);
      console.log(`Collection ${collectionName} has been deleted.`);
    } catch (error: any) {
      console.error(`Error deleting collection: ${error.message}`);
      throw error;
    }
  }


  async watchCollection(collectionName: string, collectionMergeName: string, type: string) {
    const db = this.client.db(this.dbName);
    const collection = db.collection(collectionName);
    const changeStream = collection.watch();
    changeStream.on("change", async (change) => {
      if (
        change.operationType === "insert"
        || change.operationType === "update"
        || change.operationType === "replace"
      ) {
        const data = await collection.findOne({ _id: change.documentKey._id });
        if (data) {
          console.log(`🔄 ${change.operationType} ${collectionName}: ${data._id} to ${collectionMergeName} with type ${type}`);
          await db.collection(collectionMergeName).updateOne(
            { _id: data._id },
            { $set: { ...data, type } },
            { upsert: true }
          );
        }
      } else if (change.operationType === "delete") {
        await db.collection(collectionMergeName).deleteOne({ _id: change.documentKey._id });
      }
    });
    console.log(`🔄 Watching ${collectionName}`);
  }

  /**
   * Create new collection with schema validation
   * @param collectionName name of collection to create
   * @param schema validator schema according to $jsonSchema standard
   */
  async createCollectionWithSchema(collectionName: string, schema: any) {
    const db = await this.getDb();
    try {
      // Check if collection already exists
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        throw new Error(`Collection ${collectionName} already exists`);
      }

      // Create collection with validator
      await db.createCollection(collectionName, {
        validator: {
          $jsonSchema: schema
        },
        validationLevel: "strict",
        validationAction: "error",
      });

      console.log(`Collection ${collectionName} has been created successfully.`);
    } catch (error: any) {
      console.error(`Error creating collection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update schema validator for an existing collection
   * @param collectionName name of collection to update
   * @param schema new validator schema
   */
  async updateCollectionSchema(collectionName: string, schema: any) {
    const db = await this.getDb();
    try {
      await db.command({
        collMod: collectionName,
        validator: {
          $jsonSchema: schema
        },
        validationLevel: "strict",
        validationAction: "error",
      });
      console.log(`Schema of collection ${collectionName} has been updated.`);
    } catch (error: any) {
      console.error(`Error updating schema: ${error.message}`);
      throw error;
    }
  }

  /**
  * Get list of collections in the database
  * @returns List of collection names
  */
  async listCollectionNames(): Promise<string[]> {
    const db = await this.getDb();
    try {
      const collections = await db.listCollections().toArray();
      return collections.map(col => col.name);
    } catch (error: any) {
      console.error(`Error getting collection list: ${error.message}`);
      throw error;
    }
  }

}

export const mongoDBService = new MongoDBService();