// src/adapters/interfaces/IDatabaseAdapter.ts

export interface QueryOptions {
  filter: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  sort?: Record<string, 1 | -1>;
  pipeline?: Record<string, any>[];
  skip?: number;
  limit?: number;
  count?: boolean;
}

export interface QueryResult<T = any> {
  data: T[];
  totalRecord: number;
  totalPage: number;
  limit: number;
  currentPage: number;
}

export interface BulkInsertResult {
  insertedCount: number;
  insertedIds: any[];
}

export interface BulkUpdateResult {
  matchedCount: number;
  modifiedCount: number;
  operations: number;
}

export interface BulkDeleteResult {
  deletedCount: number;
  operations: number;
}

export interface SingleInsertResult {
  insertedId: any;
}

export interface SingleUpdateResult {
  matchedCount: number;
  modifiedCount: number;
}

export interface SingleDeleteResult {
  deletedCount: number;
}

export interface IDatabaseAdapter {
  // Connection methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Query methods 
  find(collection: string, options: QueryOptions, jwt: string): Promise<QueryResult>;
  
  // Insert methods
  insertOne(collection: string, document: any): Promise<SingleInsertResult>;
  insertMany(collection: string, documents: any[]): Promise<BulkInsertResult>;
  
  // Update methods
  updateOne(collection: string, id: any, updateFields: any): Promise<SingleUpdateResult>;
  updateMany(collection: string, updates: Array<{filter: any, update: any}>): Promise<BulkUpdateResult>;
  
  // Delete methods
  deleteOne(collection: string, id: any): Promise<SingleDeleteResult>;
  deleteMany(collection: string, filters: any[]): Promise<BulkDeleteResult>;
}