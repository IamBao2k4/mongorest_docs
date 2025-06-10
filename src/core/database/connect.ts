import { MongoClient, Db } from 'mongodb';
import { DatabaseConfig } from './types'; 

export class DatabaseConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.client = new MongoClient(this.config.connectionString, this.config.options);
      await this.client.connect();
      
      // Extract database name from connection string if not provided
      const dbName = this.config.dbName || this.extractDbNameFromConnectionString();
      this.db = this.client.db(dbName);
      
      console.log(`✅ Connected to MongoDB: ${dbName}`);
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('✅ Disconnected from MongoDB');
    }
  }

  async ping(): Promise<boolean> {
    try {
      if (!this.db) return false;
      await this.db.admin().ping();
      return true;
    } catch {
      return false;
    }
  }

  getDb(): Db {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db;
  }

  getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.client;
  }

  async listCollections(): Promise<string[]> {
    const collections = await this.getDb().listCollections().toArray();
    return collections.map(col => col.name);
  }

  async createIndexes(
    collectionName: string,
    indexes: { [field: string]: 1 | -1 | 'text' }[]
  ): Promise<void> {
    const collection = this.getDb().collection(collectionName);
    
    for (const index of indexes) {
      await collection.createIndex(index);
    }
    
    console.log(`✅ Created indexes for ${collectionName}`);
  }

  async dropCollection(collectionName: string): Promise<void> {
    await this.getDb().collection(collectionName).drop();
    console.log(`✅ Dropped collection: ${collectionName}`);
  }

  private extractDbNameFromConnectionString(): string {
    const match = this.config.connectionString.match(/\/([^?]+)/);
    return match ? match[1] : 'mongorest';
  }
}