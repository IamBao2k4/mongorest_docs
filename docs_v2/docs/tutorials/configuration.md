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
    
    // Server selection
    serverSelectionTimeoutMS: 30000,
    heartbeatFrequencyMS: 10000,
    
    // Socket options
    socketTimeoutMS: 360000,
    family: 4, // IPv4
    
    // Authentication
    authSource: 'admin',
    authMechanism: 'SCRAM-SHA-256',
    
    // SSL/TLS
    ssl: true,
    sslValidate: true,
    sslCA: fs.readFileSync('./ca.pem'),
    sslCert: fs.readFileSync('./cert.pem'),
    sslKey: fs.readFileSync('./key.pem'),
    
    // Replica set
    replicaSet: 'rs0',
    readPreference: 'secondaryPreferred',
    readConcern: { level: 'majority' },
    writeConcern: { w: 'majority', j: true },
    
    // Compression
    compressors: ['zlib', 'snappy']
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
  
  // Performance
  compression: {
    enabled: true,
    threshold: 1024, // bytes
    level: 6 // 0-9
  },
  
  // Request handling
  bodyLimit: '10mb',
  parameterLimit: 10000,
  timeout: 30000, // 30 seconds
  keepAliveTimeout: 65000,
  
  // Behind proxy
  trustProxy: true,
  proxyOptions: {
    index: 0,
    trust: ['loopback', 'linklocal', 'uniquelocal']
  }
}
```

### HTTPS configuration

```javascript
server: {
  https: {
    enabled: true,
    port: 443,
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.cert'),
    ca: fs.readFileSync('./ca.cert'),
    
    // HTTP/2
    allowHTTP1: true,
    
    // Security
    honorCipherOrder: true,
    secureOptions: constants.SSL_OP_NO_TLSv1,
    ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:!RC4:!MD5'
  },
  
  // Redirect HTTP to HTTPS
  httpRedirect: true
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
    publicKey: fs.readFileSync('./public.key'),
    privateKey: fs.readFileSync('./private.key'),
    algorithm: 'RS256', // HS256, RS256, ES256
    
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

### OAuth providers

```javascript
auth: {
  oauth: {
    // Google
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email'],
      hostedDomain: 'example.com',
      prompt: 'select_account'
    },
    
    // GitHub
    github: {
      enabled: true,
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/auth/github/callback',
      scope: ['user:email', 'read:org']
    },
    
    // Custom OAuth2
    custom: {
      enabled: true,
      authorizationURL: 'https://provider.com/oauth/authorize',
      tokenURL: 'https://provider.com/oauth/token',
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      callbackURL: '/auth/custom/callback',
      scope: ['read', 'write']
    }
  }
}
```

## Schema Configuration

### Schema validation

```javascript
schemas: {
  // Validation mode
  mode: 'strict', // strict, loose, none
  
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
  validator: 'ajv', // ajv, joi, yup
  
  // Custom validators
  customFormats: {
    'phone': /^\+?[1-9]\d{1,14}$/,
    'slug': /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  }
}
```

### Index configuration

```javascript
indexes: {
  // Auto-create indexes
  autoCreate: true,
  
  // Index options
  options: {
    background: true,
    unique: false,
    sparse: false,
    expireAfterSeconds: null
  },
  
  // Collection indexes
  collections: {
    users: [
      { fields: { email: 1 }, unique: true },
      { fields: { username: 1 }, unique: true, sparse: true },
      { fields: { createdAt: -1 } },
      { fields: { 'location.coordinates': '2dsphere' } }
    ],
    posts: [
      { fields: { title: 'text', content: 'text' } },
      { fields: { authorId: 1, createdAt: -1 } },
      { fields: { tags: 1 } },
      { fields: { deletedAt: 1 }, partialFilterExpression: { deletedAt: { $exists: true } } }
    ]
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
  
  // Cache invalidation
  invalidation: {
    onWrite: true,
    onUpdate: true,
    onDelete: true,
    patterns: ['related:*', 'list:*']
  }
}
```

### Memory cache

```javascript
cache: {
  enabled: true,
  type: 'memory',
  
  memory: {
    max: 500,
    ttl: 300,
    updateAgeOnGet: true,
    stale: true,
    
    // Size calculation
    sizeCalculation: (value, key) => {
      return JSON.stringify(value).length;
    },
    maxSize: 50 * 1024 * 1024 // 50MB
  }
}
```

## Logging Configuration

### Logging setup

```javascript
logging: {
  // Log level
  level: process.env.LOG_LEVEL || 'info',
  
  // Formatters
  format: 'json', // json, simple, detailed
  
  // Transports
  transports: {
    console: {
      enabled: true,
      level: 'info',
      colorize: true,
      timestamp: true
    },
    
    file: {
      enabled: true,
      level: 'error',
      filename: 'logs/error.log',
      maxSize: '10m',
      maxFiles: 5,
      compress: true
    },
    
    daily: {
      enabled: true,
      level: 'info',
      dirname: 'logs',
      filename: 'app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    },
    
    syslog: {
      enabled: false,
      host: 'localhost',
      port: 514,
      protocol: 'udp4',
      facility: 'local0'
    }
  },
  
  // Request logging
  requests: {
    enabled: true,
    excludePaths: ['/health', '/metrics'],
    includeBody: false,
    includeQuery: true,
    includeHeaders: ['user-agent', 'referer']
  },
  
  // Error logging
  errors: {
    includeStack: process.env.NODE_ENV !== 'production',
    includeRequest: true,
    includeUser: true
  }
}
```

## Security Configuration

### Security headers

```javascript
security: {
  helmet: {
    enabled: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    
    // Different limits per endpoint
    endpoints: {
      '/auth/login': { max: 5, windowMs: 15 * 60 * 1000 },
      '/auth/register': { max: 3, windowMs: 60 * 60 * 1000 },
      '/api/*': { max: 1000, windowMs: 15 * 60 * 1000 }
    }
  }
}
```

## File Upload Configuration

```javascript
uploads: {
  enabled: true,
  
  // Storage
  storage: 'local', // local, s3, gridfs
  
  local: {
    destination: './uploads',
    createPath: true,
    permissions: '0755'
  },
  
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT, // For S3-compatible services
    signatureVersion: 'v4',
    acl: 'private'
  },
  
  // Limits
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
    fields: 10,
    fieldSize: 1 * 1024 * 1024 // 1MB
  },
  
  // Allowed types
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ],
  
  // File naming
  filename: (req, file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    return file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
  }
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

### Priority order

```javascript
// 1. Command line arguments (highest priority)
mongorest start --port 4000

// 2. Environment variables
PORT=4000 mongorest start

// 3. Configuration file
module.exports = { server: { port: 4000 } };

// 4. Default values (lowest priority)
```

### Configuration validation

```javascript
// mongorest.config.js
const Joi = require('joi');

const schema = Joi.object({
  db: Joi.object({
    uri: Joi.string().required(),
    options: Joi.object()
  }).required(),
  
  server: Joi.object({
    port: Joi.number().port().default(3000),
    host: Joi.string().hostname().default('0.0.0.0')
  })
});

const config = { /* your config */ };

const { error, value } = schema.validate(config);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = value;
```

## Bước tiếp theo

- [API Reference](../references/api) - Chi tiết về API
- [Performance](../explanations/performance) - Tối ưu hiệu năng
- [Production Deployment](../how-to-guides/deployment) - Triển khai production