// types/mongodb.types.ts

export interface MongoQuery {
  filter: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  sort?: Record<string, 1 | -1>;
  pipeline?: Record<string, any>[];
  skip?: number;
  limit?: number;
  count?: boolean;
}

export interface QueryResult {
  data: any[];
  totalRecord: number;
  totalPage: number;
  limit: number;
  currentPage: number;
}

export interface MultiCollectionQuery {
  filter?: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  sort?: Record<string, 1 | -1>;
  pipeline?: Record<string, any>[];
  skip?: number;
  limit?: number;
}

export interface MultiCollectionConfig {
  [collectionName: string]: MultiCollectionQuery;
}

export interface MultiCollectionResult {
  collection: string;
  count: number;
  data: any[];
  query: MultiCollectionQuery;
}

export interface MultiCollectionResponse {
  collections: MultiCollectionResult[];
  totalCollections: number;
  executionTime: string;
}

export interface BulkInsertResponse {
  insertedCount: number;
  insertedIds: any[];
}

export interface BulkUpdateResponse {
  matchedCount: number;
  modifiedCount: number;
  operations: number;
}

export interface BulkDeleteResponse {
  deletedCount: number;
  operations: number;
}

export interface SingleInsertResponse {
  insertedId: any;
}

export interface SingleUpdateResponse {
  matchedCount: number;
  modifiedCount: number;
}

export interface SingleDeleteResponse {
  deletedCount: number;
}

export interface BulkUpdateOperation {
  filter: Record<string, any>;
  update: Record<string, any>;
}

export interface MongoConnectionOptions {
  maxPoolSize: number;
  minPoolSize: number;
  maxIdleTimeMS: number;
  serverSelectionTimeoutMS: number;
  connectTimeoutMS: number;
}

export interface HealthCheckCollection {
  collection: string;
  status: "ok" | "error";
  count?: number;
  error?: string;
}

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  database: string;
  collections?: HealthCheckCollection[];
  timestamp: string;
  error?: string;
}