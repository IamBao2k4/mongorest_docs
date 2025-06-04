import express, { Request, Response, NextFunction } from 'express';
import { MongoClient } from 'mongodb';
import { PostgRESTToMongoConverter } from '../main/mongorest';
import { setupBasicRelationships } from '../config/relationships';
import cors from 'cors';
 
const app = express();
app.use(cors()); // Enable CORS for all routes
// ✅ Setup converter with relationships
const registry = setupBasicRelationships();
const converter = new PostgRESTToMongoConverter(registry);
 
// MongoDB connection
let db: any;
MongoClient.connect('mongodb://localhost:27017/')
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
      };
    }
  }
}
 
app.get('/api/:collection', postgrestToMongo, async (req, res) => {
  try {
    const { collection } = req.params;
    const { filter, projection, sort, pipeline } = req.mongoQuery!;
 
    // Xây dựng pipeline aggregation
    const aggPipeline = [];
 
    // 1. Thêm $match nếu có filter
    if (filter && Object.keys(filter).length > 0) {
      aggPipeline.push({ $match: filter });
    }
 
    // 2. Thêm pipeline $lookup, $graphLookup, ... nếu có (ví dụ trong req.mongoQuery.pipeline)
    if (pipeline && Array.isArray(pipeline) && pipeline.length > 0) {
      aggPipeline.push(...pipeline);
    }
 
    // 3. Thêm $project nếu có
    if (projection && Object.keys(projection).length > 0) {
      aggPipeline.push({ $project: projection });
    }
 
    // 4. Thêm $sort nếu có
    if (sort && Object.keys(sort).length > 0) {
      aggPipeline.push({ $sort: sort });
    }
 
    // Nếu không có stage nào thì đừng aggregate, dùng find bình thường
    let query;
    if (aggPipeline.length > 0) {
      query = db.collection(collection).aggregate(aggPipeline);
    } else {
      query = db.collection(collection).find({});
    }
 
    const results = await query.toArray();
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});
 
 
// Specific endpoints with examples
app.get('/users', postgrestToMongo, async (req, res) => {
  // GET /users?age=gte.18&status=eq.active&select=id,name,email&order=created_at.desc
  const { filter, projection, sort } = req.mongoQuery!;
  const users = await db.collection('users').find(filter).project(projection).sort(sort).toArray();
  res.json(users);
});
 
app.get('/products', postgrestToMongo, async (req, res) => {
  // GET /products?price=gte.10&category=in.(electronics,clothing)&available=eq.true
  const { filter, projection, sort } = req.mongoQuery!;
  const products = await db.collection('products').find(filter).project(projection).sort(sort).toArray();
  res.json(products);
});
 
app.get('/posts', postgrestToMongo, async (req, res) => {
  // GET /posts?or=(published.eq.true,draft.eq.false)&tags=cs.{tech,javascript}
  const { filter, projection, sort } = req.mongoQuery!;
  const posts = await db.collection('posts').find(filter).project(projection).sort(sort).toArray();
  res.json(posts);
});
 
app.listen(3030, () => {
  console.log('Server running on port 3000');
  console.log('Try these example URLs:');
  console.log('- http://localhost:3000/users?age=gte.18&status=eq.active&select=id,name,email');
  console.log('- http://localhost:3000/products?price=lte.100&category=in.(electronics,books)');
  console.log('- http://localhost:3000/posts?title=like.*JavaScript*&published=eq.true&order=created_at.desc');
});
 