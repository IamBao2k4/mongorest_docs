import { ObjectId, Document } from 'mongodb';

export interface BaseDocument extends Document {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PostgRESTQuery {
  filter: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  sort?: Record<string, 1 | -1>;
  pipeline?: Record<string, any>[];
  hasEmbeds?: boolean;
  embeddedTables?: string[];
  limit?: number;
  offset?: number;
}

export interface QueryOptions {
  select?: string[] | Record<string, 1 | 0>;
  populate?: string | string[];
  sort?: Record<string, 1 | -1> | string;
  limit?: number;
  skip?: number;
  lean?: boolean;
}

export interface DatabaseConfig {
  connectionString: string;
  dbName?: string;
  options?: {
    maxPoolSize?: number;
    minPoolSize?: number;
    maxIdleTimeMS?: number;
  };
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDocs: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface RelationshipConfig {
  [collection: string]: {
    [field: string]: {
      ref: string;
      localField?: string;
      foreignField?: string;
      type: 'one' | 'many';
    };
  };
}
