import { MongoClient } from 'mongodb';
import { appSettings } from '../../configs/app-settings';

class MongoDBService {

  private client: MongoClient;
  private dbName: string;

  constructor() {
    const uri = `${appSettings.mongo.url}/${appSettings.mongo.dbName}${appSettings.mongo.options}`;
    this.client = new MongoClient(uri);
    this.dbName = appSettings.mongo.dbName || 'test';
    console.log(`MongoDBService initialized: ${this.dbName}`);
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
      console.error(`Lỗi khi tạo collection: ${error.message}`);
      throw error;
    }
  }

  async dropCollection(collectionName: string) {
    const db = await this.getDb();
    try {
      await db.dropCollection(collectionName);
      console.log(`Collection ${collectionName} đã được xóa.`);
    } catch (error: any) {
      console.error(`Lỗi khi xóa collection: ${error.message}`);
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
   * Tạo collection mới với schema validation
   * @param collectionName tên collection cần tạo
   * @param schema schema validator theo chuẩn $jsonSchema
   */
  async createCollectionWithSchema(collectionName: string, schema: any) {
    const db = await this.getDb();
    try {
      // Kiểm tra xem collection có tồn tại chưa
      const collections = await db.listCollections({ name: collectionName }).toArray();
      if (collections.length > 0) {
        throw new Error(`Collection ${collectionName} đã tồn tại`);
      }

      // Tạo collection với validator
      await db.createCollection(collectionName, {
        validator: {
          $jsonSchema: schema
        },
        validationLevel: "strict",
        validationAction: "error",
      });

      console.log(`Collection ${collectionName} đã được tạo thành công.`);
    } catch (error: any) {
      console.error(`Lỗi khi tạo collection: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cập nhật schema validator cho một collection đã tồn tại
   * @param collectionName tên collection cần cập nhật
   * @param schema schema validator mới
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
      console.log(`Schema của collection ${collectionName} đã được cập nhật.`);
    } catch (error: any) {
      console.error(`Lỗi khi cập nhật schema: ${error.message}`);
      throw error;
    }
  }

  /**
  * Lấy danh sách các collection trong cơ sở dữ liệu
  * @returns Danh sách tên các collection
  */
  async listCollectionNames(): Promise<string[]> {
    const db = await this.getDb();
    try {
      const collections = await db.listCollections().toArray();
      return collections.map(col => col.name);
    } catch (error: any) {
      console.error(`Lỗi khi lấy danh sách collection: ${error.message}`);
      throw error;
    }
  }

}

export const mongoDBService = new MongoDBService();