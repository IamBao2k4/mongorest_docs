# Migration Guide

## Giới thiệu

Hướng dẫn này giúp bạn migrate từ REST API truyền thống sang MongoREST, bao gồm strategies, tools, và best practices để đảm bảo quá trình migration suôn sẻ.

## 1. Migration Overview

### Why Migrate to MongoREST?

| Traditional REST API | MongoREST |
|---------------------|-----------|
| Manual endpoint coding | Auto-generated from schemas |
| Inconsistent validation | Schema-driven validation |
| Custom auth implementation | Built-in JWT + RBAC |
| Manual relationship handling | PostgREST-style relationships |
| No standard query syntax | Powerful query language |
| Manual documentation | Auto-generated docs |

### Migration Strategies

1. **Big Bang Migration**: Migrate toàn bộ system cùng lúc
2. **Gradual Migration**: Migrate từng phần, run parallel
3. **Hybrid Approach**: Core features first, sau đó là các features khác

## 2. Pre-Migration Assessment

### System Audit Checklist

```javascript
// Audit script để analyze existing system
{
  "name": "systemAudit",
  "description": "Analyze existing system for migration",
  "steps": [
    {
      "id": "analyzeEndpoints",
      "description": "List all existing endpoints",
      "checklist": [
        "Document all endpoints",
        "Identify CRUD vs custom logic",
        "Map HTTP methods to operations",
        "Note authentication requirements"
      ]
    },
    {
      "id": "analyzeDataModels",
      "description": "Review data structures",
      "checklist": [
        "Export all collection schemas",
        "Identify relationships",
        "Document validation rules",
        "List required indexes"
      ]
    },
    {
      "id": "analyzeBusinessLogic",
      "description": "Identify custom logic",
      "checklist": [
        "List all custom functions",
        "Document workflows",
        "Identify triggers/hooks",
        "Note external integrations"
      ]
    }
  ]
}
```

### Data Structure Mapping

```javascript
// Example: Map Express model to MongoREST schema
// Express/Mongoose Model
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile: {
    avatar: String,
    bio: { type: String, maxLength: 500 }
  },
  createdAt: { type: Date, default: Date.now }
});

// MongoREST Schema
{
  "collection": "users",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1,
      "widget": "shortAnswer"
    },
    "email": {
      "type": "string",
      "format": "email",
      "unique": true,
      "widget": "email"
    },
    "password": {
      "type": "string",
      "widget": "password",
      "security": "sensitive"
    },
    "role": {
      "type": "string",
      "enum": ["user", "admin"],
      "default": "user",
      "widget": "select"
    },
    "profile": {
      "type": "object",
      "properties": {
        "avatar": {
          "type": "string",
          "format": "uri",
          "widget": "singleImage"
        },
        "bio": {
          "type": "string",
          "maxLength": 500,
          "widget": "textarea"
        }
      }
    }
  },
  "required": ["name", "email", "password"],
  "mongorest": {
    "plugins": {
      "created_at": { "isTurnOn": true },
      "updated_at": { "isTurnOn": true }
    }
  }
}
```

## 3. Migration Steps

### Step 1: Schema Migration

#### Automated Schema Converter

```javascript
// Tool to convert Mongoose schemas to MongoREST
const convertMongooseToMongoREST = (mongooseSchema) => {
  const mongorestSchema = {
    collection: mongooseSchema.collection.name,
    properties: {},
    required: [],
    indexes: [],
    mongorest: {
      plugins: {},
      permissions: {}
    }
  };

  // Convert properties
  for (const [key, value] of Object.entries(mongooseSchema.paths)) {
    if (key === '_id' || key === '__v') continue;
    
    const property = convertProperty(value);
    mongorestSchema.properties[key] = property;
    
    if (value.isRequired) {
      mongorestSchema.required.push(key);
    }
  }

  // Convert indexes
  mongooseSchema.indexes().forEach(index => {
    mongorestSchema.indexes.push({
      fields: index[0],
      options: index[1]
    });
  });

  return mongorestSchema;
};

function convertProperty(schemaType) {
  const property = {};
  
  // Map Mongoose types to JSON Schema
  switch (schemaType.instance) {
    case 'String':
      property.type = 'string';
      if (schemaType.enumValues?.length) {
        property.enum = schemaType.enumValues;
      }
      if (schemaType.options.maxlength) {
        property.maxLength = schemaType.options.maxlength;
      }
      break;
    case 'Number':
      property.type = 'number';
      if (schemaType.options.min !== undefined) {
        property.minimum = schemaType.options.min;
      }
      break;
    case 'Date':
      property.type = 'string';
      property.format = 'date-time';
      break;
    case 'Boolean':
      property.type = 'boolean';
      break;
    case 'ObjectId':
      property.type = 'string';
      property.pattern = '^[0-9a-fA-F]{24}$';
      break;
    case 'Array':
      property.type = 'array';
      property.items = convertProperty(schemaType.caster);
      break;
  }
  
  return property;
}
```

### Step 2: Relationship Migration

#### Identify and Map Relationships

```javascript
// Traditional Express population
router.get('/users/:id', async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('posts')
    .populate('followers');
  res.json(user);
});

// MongoREST relationship definition
{
  "collection": "users",
  "relationships": {
    "posts": {
      "type": "hasMany",
      "collection": "posts",
      "localField": "_id",
      "foreignField": "authorId",
      "defaultSort": { "createdAt": -1 }
    },
    "followers": {
      "type": "manyToMany",
      "collection": "users",
      "through": "user_follows",
      "localField": "_id",
      "throughLocalField": "followingId",
      "throughForeignField": "followerId",
      "foreignField": "_id"
    }
  }
}

// Usage in MongoREST
// GET /users/{{id}}?select=*,posts(title,createdAt),followers(name,avatar)
```

### Step 3: Authentication Migration

#### Convert Auth Middleware

```javascript
// Traditional Express auth
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Please authenticate' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// MongoREST auth configuration
{
  "auth": {
    "jwt": {
      "secret": "{{env.JWT_SECRET}}",
      "expiresIn": "24h"
    },
    "roles": {
      "admin": {
        "permissions": ["*"]
      },
      "user": {
        "permissions": ["read", "create:own", "update:own", "delete:own"]
      }
    }
  }
}
```

### Step 4: Business Logic Migration

#### Convert Controllers to Functions

```javascript
// Traditional Express controller
const createOrder = async (req, res) => {
  try {
    // Validate input
    const { items, shippingAddress } = req.body;
    
    // Check inventory
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
    }
    
    // Create order
    const order = new Order({
      userId: req.user.id,
      items,
      shippingAddress,
      totalAmount: calculateTotal(items),
      status: 'pending'
    });
    
    await order.save();
    
    // Update inventory
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MongoREST function
{
  "name": "createOrder",
  "description": "Create new order",
  "input": {
    "type": "object",
    "properties": {
      "items": {
        "type": "array",
        "minItems": 1,
        "items": {
          "type": "object",
          "properties": {
            "productId": { "type": "string" },
            "quantity": { "type": "integer", "minimum": 1 }
          }
        }
      },
      "shippingAddress": { "type": "object" }
    }
  },
  "steps": [
    {
      "id": "validateInventory",
      "type": "aggregate",
      "collection": "products",
      "pipeline": [
        {
          "$match": {
            "_id": { "$in": "{{params.items.map(i => i.productId)}}" }
          }
        },
        {
          "$project": {
            "hasStock": {
              "$gte": ["$stock", {
                "$arrayElemAt": [
                  "{{params.items.map(i => i.quantity)}}",
                  { "$indexOfArray": ["{{params.items.map(i => i.productId)}}", "$_id"] }
                ]
              }]
            }
          }
        }
      ]
    },
    {
      "id": "checkStock",
      "type": "validate",
      "condition": "{{steps.validateInventory.output.every(p => p.hasStock)}}",
      "errorMessage": "Insufficient stock"
    },
    {
      "id": "createOrder",
      "type": "insert",
      "collection": "orders",
      "document": {
        "userId": "{{user.id}}",
        "items": "{{params.items}}",
        "shippingAddress": "{{params.shippingAddress}}",
        "totalAmount": "{{calculateTotal(params.items)}}",
        "status": "pending"
      }
    },
    {
      "id": "updateInventory",
      "type": "bulkUpdate",
      "collection": "products",
      "operations": "{{params.items.map(item => ({
        updateOne: {
          filter: { _id: item.productId },
          update: { $inc: { stock: -item.quantity } }
        }
      }))}}"
    }
  ]
}
```

## 4. Data Migration

### Migration Script Template

```javascript
// migrate-data.js
const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function migrateData() {
  const sourceClient = new MongoClient(process.env.SOURCE_MONGODB_URI);
  const targetClient = new MongoClient(process.env.TARGET_MONGODB_URI);
  
  try {
    await sourceClient.connect();
    await targetClient.connect();
    
    const sourceDb = sourceClient.db('oldDb');
    const targetDb = targetClient.db('newDb');
    
    // Migrate collections
    const collections = ['users', 'products', 'orders'];
    
    for (const collectionName of collections) {
      console.log(`Migrating ${collectionName}...`);
      
      // Read schema
      const schema = JSON.parse(
        await fs.readFile(
          path.join(__dirname, `schemas/collections/${collectionName}.json`),
          'utf8'
        )
      );
      
      // Transform data
      const cursor = sourceDb.collection(collectionName).find();
      const batch = [];
      
      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        const transformed = transformDocument(doc, schema);
        batch.push(transformed);
        
        if (batch.length >= 1000) {
          await targetDb.collection(collectionName).insertMany(batch);
          batch.length = 0;
        }
      }
      
      if (batch.length > 0) {
        await targetDb.collection(collectionName).insertMany(batch);
      }
    }
    
    console.log('Migration completed!');
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

function transformDocument(doc, schema) {
  const transformed = {};
  
  // Apply schema transformations
  for (const [key, value] of Object.entries(doc)) {
    if (schema.properties[key]) {
      transformed[key] = transformField(value, schema.properties[key]);
    }
  }
  
  // Apply MongoREST plugins
  if (schema.mongorest?.plugins?.created_at?.isTurnOn && !transformed.created_at) {
    transformed.created_at = doc.createdAt || new Date();
  }
  
  return transformed;
}
```

### Incremental Sync

```javascript
// Sync changes during migration
{
  "name": "incrementalSync",
  "description": "Sync changes from old system",
  "schedule": "*/5 * * * *", // Every 5 minutes
  "steps": [
    {
      "id": "getLastSync",
      "type": "findOne",
      "collection": "sync_status",
      "query": { "type": "incremental" },
      "default": { "lastSync": "{{Date.now() - 3600000}}" }
    },
    {
      "id": "fetchChanges",
      "type": "http",
      "method": "GET",
      "url": "{{env.OLD_API_URL}}/changes",
      "params": {
        "since": "{{steps.getLastSync.output.lastSync}}"
      }
    },
    {
      "id": "applyChanges",
      "type": "forEach",
      "items": "{{steps.fetchChanges.output.changes}}",
      "action": {
        "type": "upsert",
        "collection": "{{item.collection}}",
        "filter": { "_id": "{{item._id}}" },
        "update": "{{item.data}}"
      }
    },
    {
      "id": "updateSyncStatus",
      "type": "upsert",
      "collection": "sync_status",
      "filter": { "type": "incremental" },
      "update": {
        "$set": {
          "lastSync": "{{Date.now()}}",
          "processed": "{{steps.fetchChanges.output.changes.length}}"
        }
      }
    }
  ]
}
```

## 5. Testing & Validation

### API Compatibility Testing

```javascript
// Test script to compare responses
const axios = require('axios');
const assert = require('assert');

async function compareAPIs() {
  const testCases = [
    {
      name: 'Get user with posts',
      oldAPI: {
        method: 'GET',
        url: '/api/users/123?include=posts'
      },
      newAPI: {
        method: 'GET',
        url: '/users/123?select=*,posts(*)'
      },
      compare: (oldRes, newRes) => {
        assert.equal(oldRes.data.id, newRes.data._id);
        assert.equal(oldRes.data.posts.length, newRes.data.posts.length);
      }
    }
  ];
  
  for (const test of testCases) {
    console.log(`Testing: ${test.name}`);
    
    const [oldResponse, newResponse] = await Promise.all([
      axios({
        ...test.oldAPI,
        baseURL: process.env.OLD_API_URL
      }),
      axios({
        ...test.newAPI,
        baseURL: process.env.NEW_API_URL
      })
    ]);
    
    test.compare(oldResponse, newResponse);
    console.log(`✓ ${test.name} passed`);
  }
}
```

### Load Testing

```bash
# Use k6 for load testing
# test-script.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function() {
  // Test old API
  let oldRes = http.get(`${__ENV.OLD_API}/products`);
  check(oldRes, {
    'old API status 200': (r) => r.status === 200,
  });
  
  // Test new API
  let newRes = http.get(`${__ENV.NEW_API}/products`);
  check(newRes, {
    'new API status 200': (r) => r.status === 200,
    'new API faster': (r) => r.timings.duration < oldRes.timings.duration
  });
}
```

## 6. Rollout Strategy

### Blue-Green Deployment

```nginx
# nginx.conf for gradual migration
upstream old_api {
    server old-api.example.com:3000;
}

upstream new_api {
    server new-api.example.com:3000;
}

server {
    listen 80;
    
    # Route specific endpoints to new API
    location ~ ^/(users|products|orders) {
        proxy_pass http://new_api;
    }
    
    # Keep other endpoints on old API
    location / {
        proxy_pass http://old_api;
    }
}
```

### Feature Flags

```javascript
// Feature flag configuration
{
  "features": {
    "useNewAPI": {
      "enabled": true,
      "percentage": 10, // Start with 10% of traffic
      "whitelist": ["beta-users"],
      "blacklist": []
    }
  }
}

// Client-side usage
const apiClient = {
  async get(endpoint, params) {
    const useNew = await checkFeatureFlag('useNewAPI');
    
    if (useNew) {
      return mongorestClient.get(endpoint, params);
    } else {
      return legacyClient.get(endpoint, params);
    }
  }
};
```

## 7. Post-Migration

### Monitoring Dashboard

```javascript
// Monitor both systems during transition
{
  "name": "migrationMonitor",
  "description": "Monitor migration metrics",
  "schedule": "*/1 * * * *", // Every minute
  "steps": [
    {
      "id": "collectMetrics",
      "type": "parallel",
      "tasks": [
        {
          "name": "oldAPIMetrics",
          "type": "http",
          "url": "{{env.OLD_API}}/metrics"
        },
        {
          "name": "newAPIMetrics", 
          "type": "http",
          "url": "{{env.NEW_API}}/metrics"
        }
      ]
    },
    {
      "id": "compareMetrics",
      "type": "transform",
      "data": "{{steps.collectMetrics.output}}",
      "operations": [
        {
          "calculate": "errorRateDiff",
          "formula": "new.errorRate - old.errorRate"
        },
        {
          "calculate": "performanceGain",
          "formula": "(old.avgResponseTime - new.avgResponseTime) / old.avgResponseTime * 100"
        }
      ]
    },
    {
      "id": "alert",
      "type": "condition",
      "if": "{{steps.compareMetrics.output.errorRateDiff > 0.01}}",
      "then": {
        "type": "notification",
        "channel": "slack",
        "message": "New API error rate increased!"
      }
    }
  ]
}
```

### Cleanup Checklist

- [ ] Remove old API code
- [ ] Archive old database
- [ ] Update documentation
- [ ] Update client SDKs
- [ ] Remove feature flags
- [ ] Update monitoring alerts
- [ ] Celebrate! 🎉

## 8. Common Pitfalls & Solutions

### Issue 1: Query Parameter Differences

```javascript
// Old API: Custom query params
GET /api/products?category=electronics&minPrice=100&maxPrice=500

// New API: Standard operators
GET /products?category.slug=eq.electronics&price=gte.100&price=lte.500

// Solution: Query parameter adapter
const adaptQueryParams = (oldParams) => {
  const newParams = {};
  
  if (oldParams.category) {
    newParams['category.slug'] = `eq.${oldParams.category}`;
  }
  
  if (oldParams.minPrice) {
    newParams['price'] = `gte.${oldParams.minPrice}`;
  }
  
  if (oldParams.maxPrice) {
    newParams['price'] = `lte.${oldParams.maxPrice}`;
  }
  
  return newParams;
};
```

### Issue 2: Response Format Differences

```javascript
// Response transformer middleware
const responseTransformer = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    if (req.headers['x-api-version'] === 'v1') {
      // Transform to old format
      const transformed = {
        status: 'success',
        data: Array.isArray(data.data) ? data.data : data.data,
        meta: {
          total: data.meta?.total,
          page: data.meta?.page
        }
      };
      
      originalJson.call(this, transformed);
    } else {
      originalJson.call(this, data);
    }
  };
  
  next();
};
```

### Issue 3: Authentication Token Format

```javascript
// Support both old and new token formats
const authAdapter = {
  async verify(token) {
    try {
      // Try new format first
      return await mongorestAuth.verify(token);
    } catch (error) {
      // Fallback to old format
      const oldPayload = await legacyAuth.verify(token);
      
      // Transform to new format
      return {
        sub: oldPayload.userId,
        role: oldPayload.userRole,
        permissions: mapOldPermissions(oldPayload.permissions)
      };
    }
  }
};
```

## Conclusion

Migration sang MongoREST có thể thực hiện gradually với minimal disruption. Key success factors:

1. **Thorough planning**: Audit existing system carefully
2. **Automated tools**: Use scripts for schema conversion
3. **Parallel running**: Run both systems during transition
4. **Comprehensive testing**: Test all endpoints and edge cases
5. **Monitoring**: Track metrics during and after migration

Với proper planning và execution, MongoREST sẽ mang lại significant improvements về development speed, maintainability, và performance.

### Resources

- [Schema Documentation](../schema/schema-structure.md)
- [API Reference](../api-reference/basic-queries.md)
- [Example Projects](./e-commerce-example.md)