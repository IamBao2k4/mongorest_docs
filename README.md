# MongoREST

<div align="center">
  <h1>🚀 MongoREST</h1>
  <p><strong>A modern, type-safe REST API library for multiple databases</strong></p>
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![npm version](https://img.shields.io/npm/v/mongorest.svg)](https://www.npmjs.com/package/mongorest)
  [![Documentation](https://img.shields.io/badge/docs-available-green.svg)](https://mongorest.dev)
</div>

---

## ✨ Features

- 🔥 **Simple & Intuitive API** - Fluent interface for building queries
- 🎯 **Type-Safe** - Full TypeScript support with intelligent type inference
- 🔌 **Multi-Database** - Support for MongoDB, PostgreSQL, MySQL, Elasticsearch, SQLite
- 🔐 **Built-in RBAC** - Role-based access control out of the box
- 🚀 **High Performance** - Query optimization and caching
- 🔧 **Extensible** - Plugin system for custom functionality
- 📝 **Auto-Documentation** - Generate API docs from your schemas
- 🌐 **Real-time Support** - WebSocket integration for live updates

## 📦 Installation

```bash
npm install mongorest
# or
yarn add mongorest
# or
pnpm add mongorest
```

## 🚀 Quick Start

```typescript
import { MongoREST } from 'mongorest';

// Initialize
const api = new MongoREST({
  database: 'mongodb',
  connection: 'mongodb://localhost:27017/myapp'
});

// Connect
await api.connect();

// Simple query
const users = await api.collection('users').find();

// Advanced query with relationships
const posts = await api
  .collection('posts')
  .where('status', '=', 'published')
  .include('author', 'comments')
  .orderBy('createdAt', 'desc')
  .paginate(1, 20)
  .find();
```

## 📖 Core Concepts

### Collections

Collections are the main entry point for database operations:

```typescript
const users = api.collection<User>('users');

// CRUD operations
const user = await users.create({ name: 'John', email: 'john@example.com' });
const found = await users.findOne(user.id);
await users.update(user.id, { name: 'Jane' });
await users.delete(user.id);
```

### Query Builder

Build complex queries with a fluent interface:

```typescript
const results = await api
  .collection('products')
  .where('price', '>', 100)
  .where('category', 'in', ['electronics', 'computers'])
  .orWhere('featured', '=', true)
  .include('reviews', 'category')
  .select('id', 'name', 'price')
  .orderBy('price', 'asc')
  .limit(20)
  .find();
```

### Relationships

Define and query relationships between collections:

```typescript
// Define relationships
api.defineRelationships('users', [
  {
    name: 'posts',
    type: 'one-to-many',
    target: 'posts',
    localField: 'id',
    foreignField: 'userId'
  }
]);

// Query with relationships
const usersWithPosts = await api
  .collection('users')
  .include('posts')
  .find();

// Nested relationships
const users = await api
  .collection('users')
  .include({
    relation: 'posts',
    includes: ['comments']
  })
  .find();
```

### Schema Validation

Define schemas for automatic validation:

```typescript
api.defineSchema('users', {
  fields: {
    id: { type: 'uuid', required: true },
    email: { type: 'email', required: true, unique: true },
    name: { type: 'string', required: true },
    age: { type: 'number', validate: [{ type: 'min', value: 0 }] },
    status: { type: 'string', default: 'active' }
  },
  timestamps: true
});
```

### RBAC (Role-Based Access Control)

Configure fine-grained permissions:

```typescript
api.configureRBAC({
  enabled: true,
  roles: {
    admin: {
      name: 'admin',
      permissions: [
        { resource: '*', actions: ['read', 'create', 'update', 'delete'] }
      ]
    },
    user: {
      name: 'user',
      permissions: [
        { 
          resource: 'users', 
          actions: ['read', 'update'],
          conditions: [{ field: 'id', operator: '=', value: '$userId' }]
        }
      ]
    }
  }
});

// Use with context
const userContext = { userId: 'user-123', roles: ['user'] };
api.setContext(userContext);
```

## 🔌 Plugins

Extend functionality with plugins:

```typescript
import { CachePlugin } from 'mongorest-cache';
import { AuditPlugin } from 'mongorest-audit';

api.use(new CachePlugin({
  driver: 'redis',
  ttl: 3600
}));

api.use(new AuditPlugin({
  collections: ['users', 'orders'],
  events: ['create', 'update', 'delete']
}));
```

### Creating Custom Plugins

```typescript
import { createPlugin } from 'mongorest';

const myPlugin = createPlugin({
  name: 'my-plugin',
  version: '1.0.0',
  initialize(core) {
    console.log('Plugin initialized');
  },
  hooks: {
    beforeQuery(query) {
      console.log('Before query:', query);
      return query;
    },
    afterCreate(result, collection) {
      console.log(`Created in ${collection}:`, result);
      return result;
    }
  }
});

api.use(myPlugin);
```

## 🛠️ Advanced Features

### Transactions

```typescript
await api.transaction(async (trx) => {
  const user = await trx.collection('users').create({ name: 'John' });
  const order = await trx.collection('orders').create({ 
    userId: user.id,
    total: 100 
  });
  return { user, order };
});
```

### Aggregations

```typescript
const stats = await api
  .collection('orders')
  .aggregate([
    { $match: { status: 'completed' } },
    { $group: { 
      _id: '$userId', 
      totalSpent: { $sum: '$total' },
      orderCount: { $sum: 1 }
    }},
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ]);
```

### Real-time Subscriptions

```typescript
const subscription = await api
  .collection('messages')
  .where('roomId', '=', 'room-123')
  .subscribe((message) => {
    console.log('New message:', message);
  });

// Later...
subscription.unsubscribe();
```

### Raw Queries

```typescript
// When you need full control
const results = await api.raw({
  collection: 'users',
  operation: 'find',
  query: { age: { $gte: 18 } },
  options: { sort: { createdAt: -1 } }
});
```

## 🔧 Configuration

### Database Adapters

```typescript
// MongoDB
const api = new MongoREST({
  database: 'mongodb',
  connection: 'mongodb://localhost:27017/myapp'
});

// PostgreSQL
const api = new MongoREST({
  database: 'postgresql',
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    username: 'user',
    password: 'password'
  }
});

// MySQL
const api = new MongoREST({
  database: 'mysql',
  connection: {
    host: 'localhost',
    port: 3306,
    database: 'myapp',
    username: 'user',
    password: 'password'
  }
});
```

### Options

```typescript
const api = new MongoREST({
  database: 'mongodb',
  connection: 'mongodb://localhost:27017/myapp',
  options: {
    debug: true,
    logger: customLogger,
    cache: {
      enabled: true,
      driver: 'redis',
      ttl: 3600
    },
    validation: {
      strict: true,
      coerceTypes: true
    },
    hooks: {
      onError(error) {
        console.error('Global error:', error);
      }
    }
  }
});
```

## 📚 Examples

### Blog API

```typescript
// Define schemas
api.defineSchema('posts', {
  fields: {
    id: { type: 'uuid', required: true },
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    authorId: { type: 'uuid', required: true },
    status: { type: 'string', default: 'draft' },
    tags: { type: 'array' }
  },
  timestamps: true
});

// Define relationships
api.defineRelationships('posts', [
  { name: 'author', type: 'many-to-one', target: 'users', localField: 'authorId', foreignField: 'id' },
  { name: 'comments', type: 'one-to-many', target: 'comments', localField: 'id', foreignField: 'postId' }
]);

// Query posts with author and comments
const posts = await api
  .collection('posts')
  .where('status', '=', 'published')
  .include('author', 'comments')
  .orderBy('createdAt', 'desc')
  .paginate(1, 10)
  .find();
```

### E-commerce API

```typescript
// Product search with filters
const products = await api
  .collection('products')
  .where('price', 'between', [10, 100])
  .where('category', 'in', ['electronics', 'accessories'])
  .where('inStock', '=', true)
  .include('reviews', 'category')
  .orderBy('rating', 'desc')
  .limit(20)
  .find();

// Order with user and items
const order = await api
  .collection('orders')
  .include({
    relation: 'user',
    select: ['id', 'name', 'email']
  })
  .include({
    relation: 'items',
    includes: ['product']
  })
  .findOne(orderId);
```

## 🧪 Testing

```typescript
import { MongoREST, createMockAdapter } from 'mongorest';

// Use mock adapter for testing
const api = new MongoREST({
  database: 'mock',
  adapter: createMockAdapter({
    users: [
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' }
    ]
  })
});

// Test your queries
const users = await api.collection('users').find();
expect(users).toHaveLength(2);
```

## 📊 Performance

- **Query Optimization**: Automatic query optimization for better performance
- **Connection Pooling**: Built-in connection pooling
- **Caching**: Multiple caching strategies (memory, Redis)
- **Lazy Loading**: Load relationships only when needed
- **Batch Operations**: Optimize multiple operations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MongoREST is [MIT licensed](LICENSE).

## 🙏 Acknowledgments

Built with ❤️ by the MongoREST team and contributors.

---

<div align="center">
  <p>⭐ Star us on GitHub if you find this project useful!</p>
  <p>📖 <a href="https://mongorest.dev/docs">Full Documentation</a> | 💬 <a href="https://discord.gg/mongorest">Discord Community</a> | 🐦 <a href="https://twitter.com/mongorest">Twitter</a></p>
</div>