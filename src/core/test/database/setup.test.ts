import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseRestDatabase } from '../../main/mongooseRestDatabase'; 

let mongod: MongoMemoryServer;
let testDb: MongooseRestDatabase;

// Global test setup
beforeAll(async () => {
  console.log('Setting up MongoDB Memory Server...');
  
  mongod = await MongoMemoryServer.create({
    binary: {
      version: '6.0.0',
    },
  });

  const uri = mongod.getUri();
  
  testDb = new MongooseRestDatabase({
    connectionString: uri,
    dbName: 'test-mongooserest'
  });
  
  await testDb.connect();
  
  // Make db available globally
  (global as any).testDb = testDb;
  console.log('MongoDB Memory Server ready!');
});

// Global test teardown
afterAll(async () => {
  console.log('Cleaning up MongoDB Memory Server...');
  
  if (testDb) {
    await testDb.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
  
  console.log('Cleanup completed!');
});

// Helper functions
export const createTestUser = () => ({
  name: 'Test User',
  email: 'test@example.com',
  age: 25,
  status: 'active'
});

export const createTestOrder = (userId: any) => ({
  customerId: userId,
  product: 'Test Product',
  amount: 100,
  status: 'pending'
});

export const cleanCollections = async (collections: string[]) => {
  const db = (global as any).testDb as MongooseRestDatabase;
  for (const collection of collections) {
    const model = db.model(collection);
    await model.deleteMany({});
  }
};

// Mock relationships for testing
export const mockRelationships = {
  users: {
    orders: {
      ref: 'orders',
      localField: '_id',
      foreignField: 'customerId',
      type: 'many' as const
    }
  },
  orders: {
    customer: {
      ref: 'users',
      localField: 'customerId',
      foreignField: '_id',
      type: 'one' as const
    }
  }
};