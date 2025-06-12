import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { PostgRESTToMongoConverter } from '../../main/mongorest'; 
import setupEcommerceRelationships from '../../config/relationships'; 

// ✅ TypeScript Interfaces
interface ParsedUrl {
  pathname: string;
  query: Record<string, any>;
  pathSegments: string[];
}

interface MongoQuery {
  filter: Record<string, any>;
  projection?: Record<string, 1 | 0>;
  sort?: Record<string, 1 | -1>;
  pipeline?: Record<string, any>[];
  skip?: number;
  limit?: number;
  count?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  totalRecord?: number;
  totalPage?: number;
  limit?: number;
  currentPage?: number;
  error?: string;
  details?: string;
}

interface BulkInsertResponse {
  insertedCount: number;
  insertedIds: any[];
}

interface BulkUpdateResponse {
  matchedCount: number;
  modifiedCount: number;
  operations: number;
}

interface BulkDeleteResponse {
  deletedCount: number;
  operations: number;
}

interface SingleInsertResponse {
  insertedId: any;
}

interface SingleUpdateResponse {
  matchedCount: number;
  modifiedCount: number;
}

interface SingleDeleteResponse {
  deletedCount: number;
}

interface MultiCollectionResult {
  collection: string;
  count: number;
  data: any[];
}

interface MultiCollectionResponse {
  collections: MultiCollectionResult[];
  totalCollections: number;
}

interface HealthCheckCollection {
  collection: string;
  status: 'ok' | 'error';
  count?: number;
  error?: string;
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  database: string;
  collections?: HealthCheckCollection[];
  timestamp: string;
  error?: string;
}

interface BulkUpdateOperation {
  filter: Record<string, any>;
  update: Record<string, any>;
}

interface MongoConnectionOptions {
  maxPoolSize: number;
  minPoolSize: number;
  maxIdleTimeMS: number;
  serverSelectionTimeoutMS: number;
  connectTimeoutMS: number;
}

// ✅ Extended Request Interface
interface ExtendedRequest extends IncomingMessage {
  mongoQuery?: MongoQuery;
  body?: any;
}

// ✅ Registry và Converter setup
const registry = setupEcommerceRelationships();
const converter = new PostgRESTToMongoConverter(registry);

// ✅ MongoDB connection với connection pooling
let db: Db;
const mongoOptions: MongoConnectionOptions = {
  maxPoolSize: 50,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

MongoClient.connect('mongodb://thaily:Th%40i2004@localhost:27017/mongorest?authSource=admin', mongoOptions)
  .then(client => {
    db = client.db('mongorest');
    console.log('Connected to MongoDB with optimized connection pool');
  })
  .catch((error: Error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// ✅ Helper function để parse request body
function parseRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// ✅ Helper function để gửi JSON response
function sendJsonResponse<T>(res: ServerResponse, statusCode: number, data: T): void {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  
  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(data));
}

// ✅ Helper function để gửi error response
function sendErrorResponse(res: ServerResponse, statusCode: number, error: string, details?: string): void {
  const errorResponse: ApiResponse = { error, details };
  sendJsonResponse(res, statusCode, errorResponse);
}

// ✅ Helper function để parse URL và query parameters
function parseUrlHelper(req: IncomingMessage): ParsedUrl {
  const parsedUrl = parseUrl(req.url || '', true);
  const pathSegments = (parsedUrl.pathname || '').split('/').filter(segment => segment);
  return {
    pathname: parsedUrl.pathname || '',
    query: parsedUrl.query || {},
    pathSegments
  };
}

// ✅ Hàm helper để đếm records song song
async function getCountParallel(
  collection: string, 
  filter: Record<string, any>, 
  pipeline?: Record<string, any>[]
): Promise<number> {
  if (pipeline && pipeline.length > 0) {
    const countPipeline: Record<string, any>[] = [];
    
    if (filter && Object.keys(filter).length > 0) {
      countPipeline.push({ $match: filter });
    }
    
    countPipeline.push({ $count: 'count' });
    
    const countResult = await db.collection(collection).aggregate(countPipeline).toArray();
    return countResult[0]?.count || 0;
  } else {
    return await db.collection(collection).countDocuments(filter || {});
  }
}

// ✅ Hàm helper để lấy data song song
async function getDataParallel(
  collection: string,
  filter: Record<string, any>,
  projection?: Record<string, 1 | 0>,
  sort?: Record<string, 1 | -1>,
  pipeline?: Record<string, any>[],
  skip: number = 0,
  limit: number = 10
): Promise<any[]> {
  const aggPipeline: Record<string, any>[] = [];

  if (filter && Object.keys(filter).length > 0) {
    aggPipeline.push({ $match: filter });
  }
  aggPipeline.push({ $skip: skip });
  aggPipeline.push({ $limit: limit });

  if (pipeline && pipeline.length > 0) {
    aggPipeline.push(...pipeline);
  }

  

  if (projection && Object.keys(projection).length > 0) {
    aggPipeline.push({ $project: projection });
  }

  if (sort && Object.keys(sort).length > 0) {
    aggPipeline.push({ $sort: sort });
  }

  

  console.log("aggPipeline", JSON.stringify(aggPipeline))
  if (aggPipeline.length > 0) {
    return await db.collection(collection).aggregate(aggPipeline).toArray();
  } else {
    return await db.collection(collection)
      .find(filter || {}, { projection })
      .sort(sort || {})
      .skip(skip)
      .limit(limit)
      .toArray();
  }
}

// ✅ Route handler cho GET /api/:collection
async function handleGetCollection(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[], 
  query: Record<string, any>
): Promise<void> {
  try {
    const collection = pathSegments[1]; // api/collection    // 
    console.log("query", query)
    // Convert PostgREST params to MongoDB query
    const mongoQuery: MongoQuery = converter.convert(query, collection);    
    const {
      filter,
      projection,
      sort,
      pipeline,
      limit = 10,
      skip = 0,
      count
    } = mongoQuery;

    const currentPage = Math.floor(skip / limit) + 1;

    // ✅ CHẠY SONG SONG: Đếm tổng records và lấy data cùng lúc
    const [totalRecord, results] = await Promise.all([
      getCountParallel(collection, filter, pipeline),
      getDataParallel(collection, filter, projection, sort, pipeline, skip, limit)
    ]);

    const totalPage = Math.ceil(totalRecord / limit);

    const response: ApiResponse = {
      data: results,
      totalRecord,
      totalPage,
      limit,
      currentPage
    };

    sendJsonResponse(res, 200, response);
  } catch (error: any) {
    console.error('Database error:', error);
    sendErrorResponse(res, 500, 'Database error', error.message);
  }
}

// ✅ Route handler cho POST /api/:collection/bulk
async function handleBulkInsert(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[]
): Promise<void> {
  try {
    const collection = pathSegments[1];
    const documents: any[] = await parseRequestBody(req);

    if (!Array.isArray(documents)) {
      return sendErrorResponse(res, 400, 'Expected array of documents');
    }

    // Chia nhỏ thành batches để xử lý song song
    const batchSize = 100;
    const batches: any[][] = [];
    
    for (let i = 0; i < documents.length; i += batchSize) {
      batches.push(documents.slice(i, i + batchSize));
    }

    // Chạy các batch song song
    const insertPromises = batches.map(batch => 
      db.collection(collection).insertMany(batch)
    );

    const results = await Promise.all(insertPromises);
    
    const totalInserted = results.reduce((sum, result) => sum + result.insertedCount, 0);
    const insertedIds = results.flatMap(result => Object.values(result.insertedIds));

    const response: BulkInsertResponse = { 
      insertedCount: totalInserted,
      insertedIds: insertedIds
    };

    sendJsonResponse(res, 201, response);
  } catch (error: any) {
    console.error('Bulk insert error:', error);
    sendErrorResponse(res, 500, 'Bulk insert error', error.message);
  }
}

// ✅ Route handler cho POST /api/:collection
async function handleSingleInsert(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[]
): Promise<void> {
  try {
    const collection = pathSegments[1];
    const body: any = await parseRequestBody(req);

    const result = await db.collection(collection).insertOne(body);
    const response: SingleInsertResponse = { insertedId: result.insertedId };
    
    sendJsonResponse(res, 201, response);
  } catch (error: any) {
    console.error('Insert error:', error);
    sendErrorResponse(res, 500, 'Insert error', error.message);
  }
}

// ✅ Route handler cho PATCH /api/:collection/bulk
async function handleBulkUpdate(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[]
): Promise<void> {
  try {
    const collection = pathSegments[1];
    const updates: BulkUpdateOperation[] = await parseRequestBody(req);

    if (!Array.isArray(updates)) {
      return sendErrorResponse(res, 400, 'Expected array of update operations');
    }

    // Chạy các update operations song song
    const updatePromises = updates.map(({ filter, update }) =>
      db.collection(collection).updateMany(filter, { $set: update })
    );

    const results = await Promise.all(updatePromises);
    
    const totalMatched = results.reduce((sum, result) => sum + result.matchedCount, 0);
    const totalModified = results.reduce((sum, result) => sum + result.modifiedCount, 0);

    const response: BulkUpdateResponse = { 
      matchedCount: totalMatched, 
      modifiedCount: totalModified,
      operations: results.length
    };

    sendJsonResponse(res, 200, response);
  } catch (error: any) {
    console.error('Bulk update error:', error);
    sendErrorResponse(res, 500, 'Bulk update error', error.message);
  }
}

// ✅ Route handler cho PATCH /api/:collection/:id
async function handleSingleUpdate(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[]
): Promise<void> {
  try {
    const collection = pathSegments[1];
    const id = pathSegments[2];
    const updateFields: any = await parseRequestBody(req);

    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    const response: SingleUpdateResponse = { 
      matchedCount: result.matchedCount, 
      modifiedCount: result.modifiedCount 
    };

    sendJsonResponse(res, 200, response);
  } catch (error: any) {
    console.error('Update error:', error);
    sendErrorResponse(res, 500, 'Update error', error.message);
  }
}

// ✅ Route handler cho DELETE /api/:collection/bulk
async function handleBulkDelete(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[]
): Promise<void> {
  try {
    const collection = pathSegments[1];
    const filters: Record<string, any>[] = await parseRequestBody(req);

    if (!Array.isArray(filters)) {
      return sendErrorResponse(res, 400, 'Expected array of filter objects');
    }

    // Chạy các delete operations song song
    const deletePromises = filters.map(filter =>
      db.collection(collection).deleteMany(filter)
    );

    const results = await Promise.all(deletePromises);
    
    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);

    const response: BulkDeleteResponse = { 
      deletedCount: totalDeleted,
      operations: results.length
    };

    sendJsonResponse(res, 200, response);
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    sendErrorResponse(res, 500, 'Bulk delete error', error.message);
  }
}

// ✅ Route handler cho DELETE /api/:collection/:id
async function handleSingleDelete(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[]
): Promise<void> {
  try {
    const collection = pathSegments[1];
    const id = pathSegments[2];

    const result = await db.collection(collection).deleteOne({
      _id: new ObjectId(id)
    });

    const response: SingleDeleteResponse = { deletedCount: result.deletedCount };
    sendJsonResponse(res, 200, response);
  } catch (error: any) {
    console.error('Delete error:', error);
    sendErrorResponse(res, 500, 'Delete error', error.message);
  }
}

// ✅ Route handler cho GET /api/multi/:collections
async function handleMultiCollections(
  req: ExtendedRequest, 
  res: ServerResponse, 
  pathSegments: string[], 
  query: Record<string, any>
): Promise<void> {
  try {
    const collections = pathSegments[2]; // api/multi/collections
    const collectionList = collections.split(',');
    // Chạy query trên nhiều collections song song
    const queries = collectionList.map(async (collection: string): Promise<MultiCollectionResult> => {
      const mongoQuery: MongoQuery = converter.convert(query, collection);
      const { filter, projection, sort, limit = 10, skip = 0 } = mongoQuery;
      const [count, data] = await Promise.all([
        db.collection(collection).countDocuments(filter || {}),
        db.collection(collection)
          .find(filter || {}, { projection })
          .sort(sort || {})
          .skip(skip)
          .limit(limit)
          .toArray()
      ]);
      
      return {
        collection,
        count,
        data
      };
    });

    const results = await Promise.all(queries);
    
    const response: MultiCollectionResponse = {
      collections: results,
      totalCollections: results.length
    };

    sendJsonResponse(res, 200, response);
  } catch (error: any) {
    console.error('Multi-collection query error:', error);
    sendErrorResponse(res, 500, 'Multi-collection query error', error.message);
  }
}

// ✅ Route handler cho GET /health
async function handleHealthCheck(req: ExtendedRequest, res: ServerResponse): Promise<void> {
  try {
    // Kiểm tra kết nối database song song với multiple collections
    const healthChecks = ['users', 'products', 'orders'].map(async (collection: string): Promise<HealthCheckCollection> => {
      try {
        const count = await db.collection(collection).countDocuments({});
        return { collection, status: 'ok', count };
      } catch (error: any) {
        return { collection, status: 'error', error: error.message };
      }
    });

    const results = await Promise.all(healthChecks);
    
    const response: HealthCheckResponse = {
      status: 'healthy',
      database: 'connected',
      collections: results,
      timestamp: new Date().toISOString()
    };

    sendJsonResponse(res, 200, response);
  } catch (error: any) {
    const response: HealthCheckResponse = {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };

    sendJsonResponse(res, 500, response);
  }
}

// ✅ Main request handler với response time tracking
const server = createServer(async (req: ExtendedRequest, res: ServerResponse) => {
  const start = process.hrtime.bigint();
  
  // Override writeHead để add response time header TRƯỚC KHI gửi
  const originalWriteHead = res.writeHead;
  res.writeHead = function(statusCode: number, headers?: any) {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    
    // Merge response time header với existing headers
    const finalHeaders = {
      ...headers,
      'X-Response-Time': `${durationMs.toFixed(2)}ms`
    };
    
    return originalWriteHead.call(this, statusCode, finalHeaders);
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const { pathname, query, pathSegments }: ParsedUrl = parseUrlHelper(req);
  
  try {
    // Route matching
    if (pathname === '/health') {
      await handleHealthCheck(req, res);
    }
    else if (pathSegments[0] === 'api' && pathSegments[1] && pathSegments[2] === 'bulk') {
      // Bulk operations: /api/:collection/bulk
      if (req.method === 'POST') {
        await handleBulkInsert(req, res, pathSegments);
      } else if (req.method === 'PATCH') {
        await handleBulkUpdate(req, res, pathSegments);
      } else if (req.method === 'DELETE') {
        await handleBulkDelete(req, res, pathSegments);
      } else {
        sendErrorResponse(res, 405, 'Method not allowed');
      }
    }
    else if (pathSegments[0] === 'api' && pathSegments[1] === 'multi' && pathSegments[2]) {
      // Multi collections: /api/multi/:collections
      if (req.method === 'GET') {
        console.log("2", query)
        await handleMultiCollections(req, res, pathSegments, query);
      } else {
        sendErrorResponse(res, 405, 'Method not allowed');
      }
    }
    else if (pathSegments[0] === 'api' && pathSegments[1] && pathSegments[2]) {
      // Single operations with ID: /api/:collection/:id
      if (req.method === 'PATCH') {
        await handleSingleUpdate(req, res, pathSegments);
      } else if (req.method === 'DELETE') {
        await handleSingleDelete(req, res, pathSegments);
      } else {
        sendErrorResponse(res, 405, 'Method not allowed');
      }
    }
    else if (pathSegments[0] === 'api' && pathSegments[1]) {
      // Collection operations: /api/:collection
      if (req.method === 'GET') {
        await handleGetCollection(req, res, pathSegments, query);
      } else if (req.method === 'POST') {
        await handleSingleInsert(req, res, pathSegments);
      } else {
        sendErrorResponse(res, 405, 'Method not allowed');
      }
    }
    else {
      sendErrorResponse(res, 404, 'Not found');
    }
  } catch (error: any) {
    console.error('Server error:', error);
    sendErrorResponse(res, 500, 'Internal server error', error.message);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (db) {
    await (db as any).client.close();
  }
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

const PORT: number = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with parallel processing optimization`);
  console.log('Available endpoints:');
  console.log('- GET /api/:collection - Optimized with parallel count + data fetch');
  console.log('- POST /api/:collection/bulk - Bulk insert with batching');
  console.log('- PATCH /api/:collection/bulk - Bulk update with parallel processing');
  console.log('- DELETE /api/:collection/bulk - Bulk delete with parallel processing');
  console.log('- GET /api/multi/:collections - Query multiple collections in parallel');
  console.log('- GET /health - Health check with parallel collection status');
  console.log('');
  console.log('Example URLs:');
  console.log('- http://localhost:3000/api/users?age=gte.18&status=eq.active&select=id,name,email');
  console.log('- http://localhost:3000/api/multi/users,products,orders?limit=5');
  console.log('- http://localhost:3000/health');
});