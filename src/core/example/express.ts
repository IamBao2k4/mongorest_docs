import express, { Request, Response, NextFunction } from 'express';
import { MongoClient } from 'mongodb';
import { PostgRESTToMongoConverter } from '../main/mongorest'; 
import setupEcommerceRelationships from '../config/relationships';
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());// ✅ Setup converter with relationships
const registry = setupEcommerceRelationships();
const converter = new PostgRESTToMongoConverter(registry);

// MongoDB connection
let db: any;
MongoClient.connect('mongodb://thaily:Th%40i2004@localhost:27017/mongorest?authSource=admin')
  .then(client => {
    db = client.db('mongorest');
    console.log('Connected to MongoDB');
  });

// Middleware to convert PostgREST params to MongoDB query
const postgrestToMongo = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const {collection} = req.params
    const mongoQuery = converter.convert(req.query as Record<string, string>, collection);
    console.log(JSON.stringify(mongoQuery))
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

    // ✅ Tính tổng record dùng aggregation nếu có pipeline
    let totalRecord = 0;

    if (pipeline && pipeline.length > 0) {
      const countPipeline = [...pipeline];

      if (filter && Object.keys(filter).length > 0) {
        countPipeline.push({ $match: filter });
      }

      countPipeline.push({ $count: 'count' });

      const countResult = await db.collection(collection).aggregate(countPipeline).toArray();
      totalRecord = countResult[0]?.count || 0;
    } else {
      totalRecord = await db.collection(collection).countDocuments(filter || {});
    }

    // ✅ Truy vấn dữ liệu chính
    let results;

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

    if (aggPipeline.length > 0) {
      results = await db.collection(collection).aggregate(aggPipeline).toArray();
    } else {
      results = await db.collection(collection)
        .find(filter || {}, { projection })
        .sort(sort || {})
        .skip(skip)
        .limit(limit)
        .toArray();
    }

    const totalPage = Math.ceil(totalRecord / limit);

    res.json({
      data: results,
      totalRecord,
      totalPage,
      limit,
      currentPage
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

// ✅ INSERT document (POST)
app.post('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const body = req.body;

    const result = await db.collection(collection).insertOne(body);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (error: any) {
    res.status(500).json({ error: 'Insert error', details: error.message });
  }
});

app.patch('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const updateFields = req.body;

    const result = await db.collection(collection).updateOne(
      { _id: id }, // new (require('mongodb').ObjectId)(id)
      { $set: updateFields }
    );

    res.json({ matchedCount: result.matchedCount, modifiedCount: result.modifiedCount });
  } catch (error: any) {
    res.status(500).json({ error: 'Update error', details: error.message });
  }
});

app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;

    const result = await db.collection(collection).deleteOne({
      _id: id // new (require('mongodb').ObjectId)(id)
    });

    res.json({ deletedCount: result.deletedCount });
  } catch (error: any) {
    res.status(500).json({ error: 'Delete error', details: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log('Try these example URLs:');
  console.log('- http://localhost:3000/users?age=gte.18&status=eq.active&select=id,name,email');
  console.log('- http://localhost:3000/products?price=lte.100&category=in.(electronics,books)');
  console.log('- http://localhost:3000/posts?title=like.*JavaScript*&published=eq.true&order=created_at.desc');
});
