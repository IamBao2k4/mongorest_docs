import express from 'express';
import { createCoreSystem } from '../core/bootstrap';
import { NewCore } from '../core/main/newCore';
import { DatabaseType } from '../core/adapters/base/databaseAdapter';

const app = express();
const port = 3003;

let core: NewCore;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Initialize core system
async function initializeCore() {
  try {
    console.log('🚀 Initializing core system...');
    
    // Create core with sample database configurations and custom relationships
    core = await createCoreSystem({
      relationships: {
        // Your specific relationships for the complex query
        users: [
          {
            name: 'product_reviews',
            targetTable: 'product_reviews',
            localField: '_id',
            foreignField: 'userId',
            type: 'one-to-many'
          },
          {
            name: 'reviews',
            targetTable: 'product_reviews',
            localField: '_id',
            foreignField: 'userId',
            type: 'one-to-many'
          }
        ],
        product_reviews: [
          {
            name: 'products',
            targetTable: 'products',
            localField: 'productId',
            foreignField: '_id',
            type: 'many-to-one'
          },
          {
            name: 'user',
            targetTable: 'users',
            localField: 'userId',
            foreignField: '_id',
            type: 'many-to-one'
          }
        ],
        products: [
          {
            name: 'categories',
            targetTable: 'categories',
            localField: '_id',
            foreignField: '_id',
            type: 'many-to-many',
            junction: {
              table: 'product_categories',
              localKey: 'productId',
              foreignKey: 'categoryId'
            }
          },
          {
            name: 'reviews',
            targetTable: 'product_reviews',
            localField: '_id',
            foreignField: 'productId',
            type: 'one-to-many'
          }
        ],
        categories: [
          {
            name: 'children',
            targetTable: 'categories',
            localField: '_id',
            foreignField: 'parentId',
            type: 'one-to-many'
          },
          {
            name: 'parent',
            targetTable: 'categories',
            localField: 'parentId',
            foreignField: '_id',
            type: 'many-to-one'
          },
          {
            name: 'products',
            targetTable: 'products',
            localField: '_id',
            foreignField: '_id',
            type: 'many-to-many',
            junction: {
              table: 'product_categories',
              localKey: 'categoryId',
              foreignKey: 'productId'
            }
          }
        ]
      },
      core: {
        adapters: {
          mongodb: {
            connection: {
              connectionString: process.env.MONGODB_URL || 'mongodb://thaily:Th%40i2004@192.168.1.109:27017/mongorest?authSource=admin'
            }
          },
          postgresql: {
            connection: {
              host: process.env.POSTGRES_HOST || '192.168.1.109',
              port: parseInt(process.env.POSTGRES_PORT || '5432'),
              database: process.env.POSTGRES_DB || 'testdb',
              username: process.env.POSTGRES_USER || 'user',
              password: process.env.POSTGRES_PASSWORD || 'password'
            }
          },
          elasticsearch: {
            connection: {
              host: process.env.ELASTICSEARCH_HOST || '192.168.1.109',
              port: parseInt(process.env.ELASTICSEARCH_PORT || '9200')
            }
          },
          mysql: {
            connection: {
              host: process.env.MYSQL_HOST || '192.168.1.109',
              port: parseInt(process.env.MYSQL_PORT || '3306'),
              database: process.env.MYSQL_DB || 'testdb',
              username: process.env.MYSQL_USER || 'user',
              password: process.env.MYSQL_PASSWORD || 'password'
            }
          }
        }
      }
    });

    console.log('✅ Core system initialized successfully');
    console.log('📊 System status:', core.getAdapterInfo());
  } catch (error) {
    console.error('❌ Failed to initialize core system:', error);
    // Continue without database connections for demo purposes
    core = await createCoreSystem();
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mongorest-new-architecture'
  });
});

// System status endpoint
app.get('/status', async (req, res) => {
  try {
    const status = core.getAdapterInfo();
    const supportedTypes = core.getSupportedDatabaseTypes();
    
    res.json({
      status: 'initialized',
      supportedDatabaseTypes: supportedTypes,
      adapters: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get system status',
      message: (error as Error).message
    });
  }
});

// Test intermediate JSON conversion
app.get('/api/test/intermediate/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['user'];
    
    // Convert query params to intermediate JSON
    const intermediateQuery = core.convertToIntermediate(req.query as any, collection, roles);
    
    res.json({
      collection,
      roles,
      originalParams: req.query,
      intermediateQuery,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to convert to intermediate format',
      message: (error as Error).message,
      collection: req.params.collection,
      params: req.query
    });
  }
});

// Test native query conversion
app.get('/api/test/native/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const dbType = (req.query.dbType as DatabaseType) || 'mongodb';
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['user'];
    
    // Remove dbType from query params
    const queryParams = { ...req.query };
    delete queryParams.dbType;
    
    // Convert to intermediate format
    const intermediateQuery = core.convertToIntermediate(queryParams as any, collection, roles);
    
    // Convert to native query
    const nativeQuery = core.convertToNative(intermediateQuery, dbType);
    
    res.json({
      collection,
      databaseType: dbType,
      roles,
      originalParams: queryParams,
      intermediateQuery,
      nativeQuery,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: 'Failed to convert to native format',
      message: (error as Error).message,
      collection: req.params.collection,
      databaseType: req.query.dbType || 'mongodb'
    });
  }
});

// Get single resource by ID (GET) - must be before the general GET route
app.get('/api/:collection/:id', async (req: any, res: any) => {
  try {
    const { collection, id } = req.params;
    const dbType = (req.query.dbType as DatabaseType) || 'mongodb';
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['user'];
    
    // Execute find by ID operation
    const result = await core.findById(collection, id, roles, dbType);
    
    if (!result) {
      return res.status(404).json({
        error: 'Resource not found',
        collection,
        id,
        databaseType: dbType,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: result,
      collection,
      id,
      databaseType: dbType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: 'Get operation failed',
      message: (error as Error).message,
      collection: req.params.collection,
      id: req.params.id,
      databaseType: req.query.dbType || 'mongodb',
      timestamp: new Date().toISOString()
    });
  }
});

// Main API endpoint with multiple database support
app.get('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const dbType = (req.query.dbType as DatabaseType) || 'mongodb';
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['nice'];
    const dryRun = req.query.dryRun === 'true';
    
    // Remove internal params
    const queryParams = { ...req.query };
    delete queryParams.dbType;
    delete queryParams.dryRun;
    


    if (dryRun) {
      // Just return the converted queries without execution
      const intermediateQuery = core.convertToIntermediate(queryParams as any, collection, roles);
      const nativeQuery = core.convertToNative(intermediateQuery, dbType);

      
      
      res.json({
        dryRun: true,
        collection,
        databaseType: dbType,
        originalParams: queryParams,
        intermediateQuery,
        nativeQuery,
        timestamp: new Date().toISOString()
      });
    } else {
      // Execute the actual query
      const result = await core.processQuery(queryParams as any, collection, roles, dbType);
      res.json({
        success: true,
        ...result,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(400).json({
      error: 'Query processing failed',
      message: (error as Error).message,
      collection: req.params.collection,
      databaseType: req.query.dbType || 'mongodb',
      timestamp: new Date().toISOString()
    });
  }
});

// Create new resource (POST)
app.post('/api/:collection', async (req, res) => {
  try {
    const { collection } = req.params;
    const dbType = (req.body.dbType as DatabaseType) || 'mongodb';
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['user'];
    
    // Remove internal params from body
    const data = { ...req.body };
    delete data.dbType;
    
    // Execute create operation
    const result = await core.create(collection, data, roles, dbType);
    
    res.status(201).json({
      success: true,
      data: result,
      collection,
      databaseType: dbType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: 'Create operation failed',
      message: (error as Error).message,
      collection: req.params.collection,
      databaseType: req.body.dbType || 'mongodb',
      timestamp: new Date().toISOString()
    });
  }
});

// Update resource (PUT)
app.put('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const dbType = (req.body.dbType as DatabaseType) || 'mongodb';
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['user'];
    
    // Remove internal params from body
    const data = { ...req.body };
    delete data.dbType;
    
    // Execute update operation
    const result = await core.update(collection, id, data, roles, dbType);
    
    res.json({
      success: true,
      data: result,
      collection,
      id,
      databaseType: dbType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: 'Update operation failed',
      message: (error as Error).message,
      collection: req.params.collection,
      id: req.params.id,
      databaseType: req.body.dbType || 'mongodb',
      timestamp: new Date().toISOString()
    });
  }
});

// Partial update resource (PATCH)
app.patch('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const dbType = (req.body.dbType as DatabaseType) || 'mongodb';
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['user'];
    
    // Remove internal params from body
    const data = { ...req.body };
    delete data.dbType;
    
    // Execute partial update operation
    const result = await core.partialUpdate(collection, id, data, roles, dbType);
    
    res.json({
      success: true,
      data: result,
      collection,
      id,
      databaseType: dbType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: 'Partial update operation failed',
      message: (error as Error).message,
      collection: req.params.collection,
      id: req.params.id,
      databaseType: req.body.dbType || 'mongodb',
      timestamp: new Date().toISOString()
    });
  }
});

// Delete resource (DELETE)
app.delete('/api/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;
    const dbType = (req.query.dbType as DatabaseType) || 'mongodb';
    const roles = req.headers['x-user-roles']?.toString().split(',') || ['user'];
    
    // Execute delete operation
    const result = await core.delete(collection, id, roles, dbType);
    
    res.json({
      success: true,
      message: 'Resource deleted successfully',
      collection,
      id,
      databaseType: dbType,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({
      error: 'Delete operation failed',
      message: (error as Error).message,
      collection: req.params.collection,
      id: req.params.id,
      databaseType: req.query.dbType || 'mongodb',
      timestamp: new Date().toISOString()
    });
  }
});

// Example queries endpoint
app.get('/examples', (req, res) => {
  res.json({
    title: 'MongoREST New Architecture - API Examples',
    baseUrl: `http://192.168.1.109:${port}`,
    examples: {
      'Health Check': '/health',
      'System Status': '/status',
      'Test Intermediate Conversion': '/api/test/intermediate/users?skip=0&limit=10&select=name,email&status=eq.active',
      'Test MongoDB Native': '/api/test/native/users?dbType=mongodb&skip=0&limit=10&select=name,email&status=eq.active',
      'Test PostgreSQL Native': '/api/test/native/users?dbType=postgresql&skip=0&limit=10&select=name,email&status=eq.active',
      'Test Elasticsearch Native': '/api/test/native/users?dbType=elasticsearch&skip=0&limit=10&select=name,email&status=eq.active',
      'Test MySQL Native': '/api/test/native/users?dbType=mysql&skip=0&limit=10&select=name,email&status=eq.active',
      'Dry Run Query (MongoDB)': '/api/users?dryRun=true&skip=0&limit=100&select=*,look_product_reviews(or=(reviews.verified=neq.true,reviews.status=eq.approved))&and=(status=eq.active)',
      'Dry Run Query (PostgreSQL)': '/api/users?dbType=postgresql&dryRun=true&skip=0&limit=10&select=name,email&status=eq.active',
      'Complex Query Example': '/api/users?skip=0&limit=100&select=*,look_product_reviews(or=(reviews.verified=neq.true,reviews.status=eq.approved),look_products(categories(children())))&and=(status=eq.active)',
      'CRUD Operations': {
        'Get All': 'GET /api/users',
        'Get By ID': 'GET /api/users/123',
        'Create': 'POST /api/users (with JSON body)',
        'Update': 'PUT /api/users/123 (with JSON body)',
        'Partial Update': 'PATCH /api/users/123 (with JSON body)',
        'Delete': 'DELETE /api/users/123'
      }
    },
    headers: {
      'Set User Roles': 'X-User-Rules: admin,user'
    },
    queryParameters: {
      'dbType': 'Database type: mongodb, postgresql, elasticsearch, mysql',
      'dryRun': 'Set to true to see query conversion without execution',
      'skip': 'Number of records to skip (pagination)',
      'limit': 'Maximum number of records to return',
      'select': 'Fields to select (* for all, comma-separated for specific)',
      'and': 'AND logical conditions',
      'or': 'OR logical conditions',
      'field.operator.value': 'Field filters (eq, neq, gt, gte, lt, lte, in, nin, like, etc.)'
    }
  });
});

// Start server
async function startServer() {
  await initializeCore();
  
  app.listen(port, () => {
    console.log(`
🚀 MongoREST New Architecture Demo Server
📍 Server running at: http://192.168.1.109:${port}
📖 Examples: http://192.168.1.109:${port}/examples
🩺 Health: http://192.168.1.109:${port}/health
📊 Status: http://192.168.1.109:${port}/status

🎯 Test URLs:
• Intermediate JSON: http://192.168.1.109:${port}/api/test/intermediate/users?skip=0&limit=10&select=name,email&status=eq.active
• MongoDB Query: http://192.168.1.109:${port}/api/test/native/users?dbType=mongodb&skip=0&limit=10&select=name,email&status=eq.active
• PostgreSQL Query: http://192.168.1.109:${port}/api/test/native/users?dbType=postgresql&skip=0&limit=10&select=name,email&status=eq.active
• Your Complex Example: http://192.168.1.109:${port}/api/users?dryRun=true&skip=0&limit=100&select=*,look_product_reviews(or=(reviews.verified=neq.true,reviews.status=eq.approved))&and=(status=eq.active)
    `);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (core) {
    await core.dispose();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server...');
  if (core) {
    await core.dispose();
  }
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

export default app;