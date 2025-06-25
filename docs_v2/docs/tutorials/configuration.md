---
sidebar_position: 4
---

# Configuration

Hướng dẫn cấu hình chi tiết MongoREST cho các môi trường khác nhau.

## Configuration Methods

MongoREST hỗ trợ nhiều cách cấu hình:

1. **Configuration file** (khuyến nghị)
2. **Environment variables**
3. **Command line arguments**
4. **Programmatic configuration**

Thứ tự ưu tiên: CLI args > Environment vars > Config file > Defaults

## Configuration File

### Basic configuration

Tạo file `mongorest.config.js`:

```javascript
module.exports = {
  // Database configuration
  db: {
    uri: 'mongodb://localhost:27017/mydb',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Server configuration
  server: {
    port: 3000,
    host: '0.0.0.0',
    basePath: '/api/v1',
    compression: true,
    corsEnabled: true,
    helmet: true,
    trustProxy: true,
    bodyLimit: '10mb',
    parameterLimit: 10000
  },

  // Feature flags
  features: {
    authentication: true,
    websocket: true,
    fileUpload: true,
    caching: true,
    rateLimit: true,
    metrics: true,
    healthCheck: true,
    playground: process.env.NODE_ENV === 'development'
  }
};
```

### Environment-specific configs

```javascript
// mongorest.config.js
const configs = {
  development: {
    db: { uri: 'mongodb://localhost:27017/mydb_dev' },
    server: { port: 3000 },
    logging: { level: 'debug' },
    features: { playground: true }
  },
  
  test: {
    db: { uri: 'mongodb://localhost:27017/mydb_test' },
    server: { port: 3001 },
    logging: { level: 'warn' }
  },
  
  production: {
    db: { 
      uri: process.env.MONGODB_URI,
      options: { 
        replicaSet: 'rs0',
        ssl: true,
        authSource: 'admin'
      }
    },
    server: { 
      port: process.env.PORT || 80,
      trustProxy: true
    },
    logging: { level: 'error' },
    features: { playground: false }
  }
};

module.exports = configs[process.env.NODE_ENV || 'development'];
```

### Load configuration

```javascript
// Using config file
const MongoRest = require('mongorest');
const config = require('./mongorest.config.js');

const server = new MongoRest(config);

// Using specific config file
mongorest start --config ./config/production.js
```

## Database Configuration

### Connection options

```javascript
db: {
  // Connection string
  uri: 'mongodb://username:password@host:port/database',
  
  // Connection options
  options: {
    // Connection pool
    maxPoolSize: 100,
    minPoolSize: 10,
    maxIdleTimeMS: 10000,
    waitQueueTimeoutMS: 5000,
  }
}
```

### Multiple databases

```javascript
db: {
  // Default database
  uri: 'mongodb://localhost:27017/main',
  
  // Additional databases
  databases: {
    analytics: {
      uri: 'mongodb://localhost:27017/analytics',
      options: { readPreference: 'secondary' }
    },
    cache: {
      uri: 'mongodb://localhost:27017/cache',
      options: { writeConcern: { w: 1 } }
    }
  }
}
```

### Connection retry

```javascript
db: {
  retry: {
    enabled: true,
    attempts: 5,
    delay: 5000,
    maxDelay: 60000,
    backoff: 'exponential'
  }
}
```

## Server Configuration

### Basic server settings

```javascript
server: {
  // Network
  port: process.env.PORT || 3000,
  host: '0.0.0.0', // Listen on all interfaces
  
  // Paths
  basePath: '/api/v1',
  staticPath: './public',
  uploadsPath: './uploads',
}
```

### CORS configuration

```javascript
cors: {
  enabled: true,
  origin: [
    'http://localhost:3000',
    'https://app.example.com',
    /^https:\/\/.*\.example\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
}
```

## Authentication Configuration

### JWT settings

```javascript
auth: {
  jwt: {
    secret: process.env.JWT_SECRET,
    
    expiresIn: '24h',
    notBefore: '0s',
    audience: 'mongorest-api',
    issuer: 'mongorest',
    subject: 'auth',
    
    // Token locations
    locations: ['header', 'query', 'cookie'],
    headerName: 'Authorization',
    headerScheme: 'Bearer',
    queryParam: 'token',
    cookieName: 'jwt',
    
    // Refresh tokens
    refresh: {
      enabled: true,
      expiresIn: '7d',
      cookieName: 'refresh_token',
      rotateOnUse: true
    }
  }
}
```

## Schema Configuration

### Schema validation

```javascript
schemas: {
  // Default options
  defaults: {
    required: false,
    nullable: true,
    additionalProperties: false,
    coerceTypes: true,
    removeAdditional: true
  },
  
  // Collection schemas
  collections: {
    users: require('./schemas/users'),
    posts: require('./schemas/posts'),
    comments: require('./schemas/comments')
  },
  
  // Validation library
  validator: 'ajv',
  
  // Custom validators
  customFormats: {
    'phone': /^\+?[1-9]\d{1,14}$/,
    'slug': /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  }
}
```

## Caching Configuration

### Redis cache

```javascript
cache: {
  enabled: true,
  type: 'redis',
  
  redis: {
    host: 'localhost',
    port: 6379,
    password: process.env.REDIS_PASSWORD,
    db: 0,
    keyPrefix: 'mongorest:',
    
    // Connection options
    enableOfflineQueue: true,
    connectTimeout: 10000,
    maxRetriesPerRequest: 3,
    
    // Cluster mode
    cluster: [
      { host: 'redis1', port: 6379 },
      { host: 'redis2', port: 6379 },
      { host: 'redis3', port: 6379 }
    ]
  },
  
  // Cache settings
  ttl: 300, // 5 minutes default
  max: 1000, // Max items in cache
  
  // Cache strategies
  strategies: {
    users: { ttl: 60 },
    posts: { ttl: 300 },
    static: { ttl: 3600 }
  },
}
```

## Environment Variables

### Complete .env example

```bash
# Environment
NODE_ENV=production

# Database
MONGODB_URI=mongodb://user:pass@cluster.mongodb.net/db?retryWrites=true
MONGODB_MAX_POOL_SIZE=100
MONGODB_REPLICA_SET=rs0

# Server
PORT=3000
HOST=0.0.0.0
BASE_PATH=/api/v1

# Security
JWT_SECRET=your-256-bit-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis
REDIS_URL=redis://user:pass@redis.example.com:6379

# S3
S3_BUCKET=my-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY=AKIAIOSFODNN7EXAMPLE
S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY

# Monitoring
SENTRY_DSN=https://key@sentry.io/project
NEW_RELIC_LICENSE_KEY=your-license-key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASS=your-app-password

# Feature flags
ENABLE_WEBSOCKET=true
ENABLE_PLAYGROUND=false
ENABLE_METRICS=true
```

## Loading Configuration

### Configuration validation

```javascript
// mongorest.config.js
const Ajv = require('ajv');

// validate by ajv
const configSchema = {/** load your config here **/};

const ajv = new Ajv();
const validate = ajv.compile(configSchema);

// Your configuration object
const config = {
  // ... your config here
};

// Validate configuration
if (!validate(config)) {
  const errors = validate.errors
    .map(err => `${err.instancePath}: ${err.message}`)
    .join('\n');
  
  throw new Error(`Configuration validation failed:\n${errors}`);
}

console.log('Configuration validated successfully');

module.exports = config;
```

## Bước tiếp theo

- [API Reference](../references/api) - Chi tiết về API
- [Performance](../explanations/performance) - Tối ưu hiệu năng
- [Production Deployment](../how-to-guides/deployment) - Triển khai production