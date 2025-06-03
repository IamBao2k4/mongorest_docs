import mongoose, { Collection } from 'mongoose';
import { PostgRESTToMongoConverter } from '../main/mongorest';

// Connect to MongoDB
mongoose.connect('mongodb://thaily:Th%40i2004@localhost:27017/mongorest?authSource=admin');

// Example schemas
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  status: String,
  verified: Boolean,
  tags: [String],
  created_at: Date,
  avatar: String,
  bio: String
});

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  available: Boolean,
  description: String,
  tags: [String]
});

const User = mongoose.model('user', UserSchema, 'users');
const Product = mongoose.model('product', ProductSchema, 'products');

const converter = new PostgRESTToMongoConverter();

// Generic query function
async function queryModel<T>(
  Model: mongoose.Model<T>, 
  queryParams: Record<string, string>
): Promise<T[]> {
  const mongoQuery = converter.convert(queryParams);
  
  let query = Model.find(mongoQuery.filter);
  
  if (mongoQuery.projection) {
    query = query.select(mongoQuery.projection);
  }
  
  if (mongoQuery.sort) {
    query = query.sort(mongoQuery.sort);
  }
  
  return await query.exec();
}

// Example usage functions
async function findUsers(queryParams: Record<string, string>) {
  return await queryModel(User, queryParams);
}

async function findProducts(queryParams: Record<string, string>) {
  return await queryModel(Product, queryParams);
}

// Demo usage
async function demo() {
  try {
    // Find active adult users
    const activeUsers = await findUsers({
      status: 'eq.active',
      select: 'name,email,age',
      order: 'createdAt.desc'
    });
    console.log('Active users:', activeUsers);

    // Find affordable electronics
    const affordableElectronics = await findProducts({
      category: 'eq.electronics',
      price: 'lte.500',
      available: 'eq.true',
      order: 'price.asc'
    });
    console.log('Affordable electronics:', affordableElectronics);

    // Find users with specific tags
    const techUsers = await findUsers({
      tags: 'cs.{javascript,typescript,nodejs}',
      status: 'neq.inactive'
    });
    console.log('Tech users:', techUsers);

    // Complex search with OR logic
    const specialUsers = await findUsers({
      or: '(age.lt.25,status.eq.premium)',
      verified: 'eq.true',
      bio: 'is.not_null'
    });
    console.log('Special users:', specialUsers);

  } catch (error) {
    console.error('Demo error:', error);
  }
}

// Run demo
demo();