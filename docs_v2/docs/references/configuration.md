---
sidebar_position: 2
---

# Configuration Options

Chi tiết tất cả options cấu hình.

## Database Options

```javascript
{
  // MongoDB connection string
  db: 'mongodb://localhost:27017/mydb',
  
  // Connection options
  dbOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10,
    serverSelectionTimeoutMS: 5000
  }
}
```

## Server Options

```javascript
{
  // Port
  port: 3000,
  
  // Host
  host: '0.0.0.0',
  
  // Base path
  basePath: '/api/v1',
  
  // Body parser limits
  bodyLimit: '10mb',
  
  // Request timeout
  timeout: 30000
}
```

## Security Options

```javascript
{
  // CORS
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests'
  },
}
```

## Schema Options

```javascript
{
  schemas: {
    strict: true, // Enforce schemas
    
    // Per-collection schemas
    users: {
      // Field definitions
    }
  },
  
  // Validation
  validation: {
    abortEarly: false,
    stripUnknown: true
  }
}
```