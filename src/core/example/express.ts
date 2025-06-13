import express, { Request, Response, NextFunction } from 'express';
import { MongoClient } from 'mongodb';
import { PostgRESTToMongoConverter } from '../main/mongorest'; 
import setupEcommerceRelationships from '../config/relationships';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Response time middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();

  const defaultWriteHead = res.writeHead;
  res.writeHead = function (...args: any[]) {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
    return defaultWriteHead.apply(this, args as any);
  };

  next();
});

const registry = setupEcommerceRelationships();
const converter = new PostgRESTToMongoConverter(registry);

// MongoDB connection với connection pooling
let db: any;
const mongoOptions = {
  maxPoolSize: 50, // Tăng pool size để hỗ trợ đa luồng
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
  .catch(error => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
 
// Middleware to convert PostgREST params to MongoDB query
const postgrestToMongo = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {collection} = req.params;
    const mongoQuery = converter.convert(req.query as Record<string, string>, collection);
    console.log(JSON.stringify(mongoQuery));
    req.mongoQuery = mongoQuery;
    next();
  } catch (error: any) {
    res.status(400).json({ error: 'Invalid query parameters', details: error.message });
  }
};
 
// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      mongoQuery?: {
        filter: Record<string, any>;
        projection?: Record<string, 1 | 0>;
        sort?: Record<string, 1 | -1>;
        pipeline?: Record<string, any>[];
        skip?: number;
        limit?: number;
        count?: boolean;
      };
    }
  }
}

// ✅ Hàm helper để đếm records song song
async function getCountParallel(
  collection: string, 
  filter: Record<string, any>, 
  pipeline?: Record<string, any>[]
): Promise<number> {
  if (pipeline && pipeline.length > 0) {
    const countPipeline = [];
    
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
  const aggPipeline = [];

  if (pipeline && pipeline.length > 0) {
    aggPipeline.push(...pipeline);
  }

  if (filter && Object.keys(filter).length > 0) {
    aggPipeline.push({ $match: filter });
  }

  if (projection && Object.keys(projection).length > 0) {
    aggPipeline.push({ $project: projection });
  }

  if (sort && Object.keys(sort).length > 0) {
    aggPipeline.push({ $sort: sort });
  }

  aggPipeline.push({ $skip: skip });
  aggPipeline.push({ $limit: limit });

  console.log("aggPipeline", JSON.stringify(aggPipeline));

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

// GET endpoint với params = câu lệnh query đã được mã hóa md5
app.get('/api/:collection/query', () => {
  
})


// ✅ GET endpoint với parallel processing
app.get('/api/:collection', postgrestToMongo, async (req: any, res: any) => {
  try {
    const { collection } = req.params;
    const {
      filter,
      projection,
      sort,
      pipeline,
      limit = 10,
      skip = 0,
      count
    } = req.mongoQuery!;

    const currentPage = Math.floor(skip / limit) + 1;

    // ✅ CHẠY SONG SONG: Đếm tổng records và lấy data cùng lúc
    const [totalRecord, results] = await Promise.all([
      getCountParallel(collection, filter, pipeline),
      getDataParallel(collection, filter, projection, sort, pipeline, skip, limit)
    ]);
    // const totalRecord = 0;
    const totalPage = Math.ceil(totalRecord / limit);

    res.json({
      data: results,
      totalRecord,
      totalPage,
      limit,
      currentPage
    });
  } catch (error: any) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ✅ Bulk INSERT với parallel processing (cho multiple documents)
app.post('/api/:collection/bulk', async (req: any, res: any) => {
  try {
    const { collection } = req.params;
    const documents = req.body; // Expect array of documents

    if (!Array.isArray(documents)) {
      return res.status(400).json({ error: 'Expected array of documents' });
    }

    // Chia nhỏ thành batches để xử lý song song
    const batchSize = 100;
    const batches = [];
    
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

    res.status(201).json({ 
      insertedCount: totalInserted,
      insertedIds: insertedIds
    });
  } catch (error: any) {
    console.error('Bulk insert error:', error);
    res.status(500).json({ error: 'Bulk insert error', details: error.message });
  }
});

// ✅ Single INSERT
app.post('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const body = req.body;

    const result = await db.collection(collection).insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error: any) {
    console.error('Insert error:', error);
    res.status(500).json({ error: 'Insert error', details: error.message });
  }
});

// ✅ Bulk UPDATE với parallel processing
app.patch('/api/:collection/bulk', async (req: any, res: any) => {
  try {
    const { collection } = req.params;
    const updates = req.body; // Expect array of {filter, update} objects

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Expected array of update operations' });
    }

    // Chạy các update operations song song
    const updatePromises = updates.map(({ filter, update }) =>
      db.collection(collection).updateMany(filter, { $set: update })
    );

    const results = await Promise.all(updatePromises);
    
    const totalMatched = results.reduce((sum, result) => sum + result.matchedCount, 0);
    const totalModified = results.reduce((sum, result) => sum + result.modifiedCount, 0);

    res.json({ 
      matchedCount: totalMatched, 
      modifiedCount: totalModified,
      operations: results.length
    });
  } catch (error: any) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Bulk update error', details: error.message });
  }
});

// ✅ Single UPDATE
app.patch('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const updateFields = req.body;

    const result = await db.collection(collection).updateOne(
      { _id: id },
      { $set: updateFields }
    );

    res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error: any) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Update error', details: error.message });
  }
});

// ✅ Bulk DELETE với parallel processing
app.delete('/api/:collection/bulk', async (req: any, res: any) => {
  try {
    const { collection } = req.params;
    const filters = req.body; // Expect array of filter objects

    if (!Array.isArray(filters)) {
      return res.status(400).json({ error: 'Expected array of filter objects' });
    }

    // Chạy các delete operations song song
    const deletePromises = filters.map(filter =>
      db.collection(collection).deleteMany(filter)
    );

    const results = await Promise.all(deletePromises);
    
    const totalDeleted = results.reduce((sum, result) => sum + result.deletedCount, 0);

    res.json({ 
      deletedCount: totalDeleted,
      operations: results.length
    });
  } catch (error: any) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Bulk delete error', details: error.message });
  }
});

// ✅ Single DELETE
app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;

    const result = await db.collection(collection).deleteOne({
      _id: id
    });

    res.json({ deletedCount: result.deletedCount });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Delete error', details: error.message });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  if (db) {
    await db.client.close();
  }
  process.exit(0);
});

app.listen(3000, () => {
  console.log('Server running on port 3000 with parallel processing optimization');
});