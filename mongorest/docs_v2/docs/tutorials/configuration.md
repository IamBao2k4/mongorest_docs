---
sidebar_position: 4
---

# Configuration

Hướng dẫn cấu hình MongoREST chi tiết.

## File cấu hình

Tạo file `mongorest.config.js`:

```javascript
module.exports = {
  // Database
  db: 'mongodb://localhost:27017/mydb',
  
  // Server
  port: 3000,
  host: '0.0.0.0',
  
  // CORS
  cors: {
    origin: '*',
    credentials: true
  },
  
  // Rate limiting
  rateLimit: {
    window: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests
  },
  
  // Logging
  logging: {
    level: 'info',
    format: 'json'
  }
};
```

## Sử dụng config file

```bash
mongorest start --config ./mongorest.config.js
```

## Environment variables

```bash
MONGOREST_DB=mongodb://localhost:27017/mydb
MONGOREST_PORT=3000
MONGOREST_AUTH_SECRET=secret-key
```

## Schema validation

```javascript
schemas: {
  users: {
    name: { type: 'string', required: true },
    email: { type: 'string', format: 'email' },
    age: { type: 'number', min: 0, max: 150 }
  }
}
```

## Hooks

```javascript
hooks: {
  beforeInsert: async (collection, data) => {
    // Modify data before insert
    return data;
  },
  afterQuery: async (collection, results) => {
    // Process results
    return results;
  }
}