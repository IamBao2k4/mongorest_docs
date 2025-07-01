# Configuration Reference

## Tổng quan

MongoREST sử dụng hệ thống configuration linh hoạt với environment variables, JSON files, và runtime options. Tài liệu này mô tả chi tiết tất cả configuration options.

## Configuration Sources

### Priority Order
1. Runtime parameters (highest)
2. Environment variables
3. Configuration files
4. Default values (lowest)

```javascript
// Example: JWT_SECRET resolution
const jwtSecret = 
  options.jwt?.secret ||                    // Runtime parameter
  process.env.JWT_SECRET ||                 // Environment variable
  config.auth?.jwt?.secret ||               // Config file
  'default-development-secret';             // Default value
```

## Environment Variables

### Core Settings

```bash
# Application
NODE_ENV=production                # Environment: development, production, test
PORT=3000                          # Server port
HOST=0.0.0.0                      # Server host

# Database
MONGODB_URI=mongodb://localhost:27017/myapp
MONGODB_DATABASE=myapp             # Database name
MONGODB_MAX_POOL_SIZE=50          # Connection pool size
MONGODB_MIN_POOL_SIZE=5           # Minimum connections
MONGODB_CONNECTION_TIMEOUT=10000   # Connection timeout (ms)
MONGODB_SOCKET_TIMEOUT=45000      # Socket timeout (ms)

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h                # Token expiration
JWT_REFRESH_EXPIRES_IN=7d         # Refresh token expiration
JWT_ALGORITHM=HS256               # JWT algorithm
JWT_ISSUER=mongorest              # Token issuer
JWT_AUDIENCE=mongorest-api        # Token audience

# Security
BCRYPT_ROUNDS=10                  # Password hashing rounds
CORS_ORIGIN=https://app.example.com,https://admin.example.com
CORS_CREDENTIALS=true             # Allow credentials
SESSION_SECRET=session-secret-key # Session encryption

# Performance
CACHE_ENABLED=true                # Enable caching
CACHE_TTL=300                     # Default cache TTL (seconds)
CACHE_REDIS_URL=redis://localhost:6379
QUERY_TIMEOUT=30000               # Query timeout (ms)
MAX_QUERY_COMPLEXITY=100          # Max query complexity score

# Monitoring
LOG_LEVEL=info                    # Log level: debug, info, warn, error
LOG_FORMAT=json                   # Log format: json, pretty
METRICS_ENABLED=true              # Enable metrics collection
SENTRY_DSN=https://xxx@sentry.io/xxx  # Error tracking

# Features
ENABLE_PLAYGROUND=false           # API playground (dev only)
ENABLE_INTROSPECTION=true         # Schema introspection
ENABLE_WEBHOOKS=true              # Webhook support
ENABLE_REAL_TIME=false            # Real-time subscriptions
```

## Configuration Files

### config/server.json
```json
{
  "server": {
    "port": 3000,
    "host": "0.0.0.0",
    "bodyLimit": "10mb",
    "corsOrigins": ["http://localhost:3000"],
    "trustProxy": true,
    "requestIdHeader": "X-Request-ID",
    "compression": {
      "enabled": true,
      "threshold": 1024
    },
    "helmet": {
      "contentSecurityPolicy": {
        "directives": {
          "defaultSrc": ["'self'"],
          "styleSrc": ["'self'", "'unsafe-inline'"],
          "scriptSrc": ["'self'"],
          "imgSrc": ["'self'", "data:", "https:"]
        }
      }
    }
  }
}
```

### config/database.json
```json
{
  "mongodb": {
    "uri": "mongodb://localhost:27017",
    "database": "mongorest",
    "options": {
      "maxPoolSize": 50,
      "minPoolSize": 5,
      "maxIdleTimeMS": 30000,
      "serverSelectionTimeoutMS": 5000,
      "socketTimeoutMS": 45000,
      "family": 4,
      "authSource": "admin",
      "replicaSet": "rs0",
      "readPreference": "primaryPreferred",
      "readConcern": { "level": "majority" },
      "writeConcern": { 
        "w": "majority",
        "j": true,
        "wtimeout": 5000
      }
    },
    "migrations": {
      "enabled": true,
      "collection": "_migrations",
      "directory": "./migrations"
    }
  }
}
```

### config/auth.json
```json
{
  "auth": {
    "jwt": {
      "secret": "${JWT_SECRET}",
      "expiresIn": "24h",
      "refreshExpiresIn": "7d",
      "algorithm": "HS256",
      "issuer": "mongorest",
      "audience": "mongorest-api"
    },
    "bcrypt": {
      "saltRounds": 10
    },
    "session": {
      "name": "mongorest.sid",
      "secret": "${SESSION_SECRET}",
      "resave": false,
      "saveUninitialized": false,
      "cookie": {
        "secure": true,
        "httpOnly": true,
        "maxAge": 86400000,
        "sameSite": "strict"
      }
    },
    "oauth": {
      "google": {
        "clientId": "${GOOGLE_CLIENT_ID}",
        "clientSecret": "${GOOGLE_CLIENT_SECRET}",
        "callbackURL": "/auth/google/callback"
      },
      "github": {
        "clientId": "${GITHUB_CLIENT_ID}",
        "clientSecret": "${GITHUB_CLIENT_SECRET}",
        "callbackURL": "/auth/github/callback"
      }
    }
  }
}
```

### config/roles.json
```json
{
  "roles": {
    "admin": {
      "description": "Full system access",
      "permissions": ["*"],
      "rateLimit": {
        "requests": 10000,
        "window": "1h"
      }
    },
    "developer": {
      "description": "Development access",
      "permissions": [
        "read:*",
        "write:*",
        "delete:test_*",
        "execute:dev_*"
      ],
      "rateLimit": {
        "requests": 5000,
        "window": "1h"
      }
    },
    "user": {
      "description": "Standard user",
      "permissions": [
        "read:public",
        "read:own",
        "write:own",
        "delete:own"
      ],
      "rateLimit": {
        "requests": 1000,
        "window": "1h"
      }
    },
    "analyst": {
      "description": "Analytics access",
      "permissions": [
        "read:*",
        "execute:analytics_*",
        "export:reports"
      ],
      "rateLimit": {
        "requests": 2000,
        "window": "1h"
      }
    }
  },
  "defaultRole": "user"
}
```

### config/cache.json
```json
{
  "cache": {
    "enabled": true,
    "provider": "redis",
    "redis": {
      "url": "${CACHE_REDIS_URL}",
      "options": {
        "maxRetriesPerRequest": 3,
        "enableReadyCheck": true,
        "lazyConnect": true
      }
    },
    "strategies": {
      "schemas": {
        "ttl": 3600,
        "refresh": true
      },
      "queries": {
        "ttl": 300,
        "keyGenerator": "query-hash",
        "invalidateOn": ["create", "update", "delete"]
      },
      "aggregations": {
        "ttl": 600,
        "keyGenerator": "pipeline-hash"
      },
      "functions": {
        "ttl": 60,
        "varyBy": ["params", "user.role"]
      }
    }
  }
}
```

### config/plugins.json
```json
{
  "plugins": {
    "timestamps": {
      "enabled": true,
      "createdAt": "created_at",
      "updatedAt": "updated_at"
    },
    "softDelete": {
      "enabled": true,
      "field": "deleted_at",
      "indexFields": true
    },
    "audit": {
      "enabled": true,
      "fields": {
        "createdBy": "created_by",
        "updatedBy": "updated_by"
      },
      "collection": "_audit_logs"
    },
    "versioning": {
      "enabled": false,
      "field": "_version",
      "collection": "_versions"
    },
    "tenancy": {
      "enabled": false,
      "field": "tenant_id",
      "strategy": "filter"
    }
  }
}
```

## Schema Configuration

### Collection Schema Options
```json
{
  "collection": "products",
  "mongorest": {
    "permissions": {
      "read": ["guest", "user", "admin"],
      "create": ["user", "admin"],
      "update": ["admin"],
      "delete": ["admin"]
    },
    "plugins": {
      "timestamps": true,
      "softDelete": true,
      "audit": true
    },
    "cache": {
      "enabled": true,
      "ttl": 300,
      "tags": ["products"]
    },
    "indexes": {
      "autoCreate": true,
      "recommendations": true
    },
    "hooks": {
      "beforeCreate": ["validateInventory", "calculatePrice"],
      "afterCreate": ["updateSearchIndex", "sendNotification"],
      "beforeUpdate": ["checkPermissions", "validateChanges"],
      "afterUpdate": ["invalidateCache", "logChanges"]
    },
    "rateLimits": {
      "read": {
        "anonymous": { "requests": 100, "window": "1h" },
        "user": { "requests": 1000, "window": "1h" }
      },
      "write": {
        "user": { "requests": 100, "window": "1h" },
        "admin": { "requests": 1000, "window": "1h" }
      }
    },
    "validation": {
      "strict": true,
      "coerceTypes": true,
      "removeAdditional": true
    }
  }
}
```

### Relationship Configuration
```json
{
  "relationships": {
    "author": {
      "type": "belongsTo",
      "collection": "users",
      "localField": "authorId",
      "foreignField": "_id",
      "cache": {
        "enabled": true,
        "ttl": 600
      },
      "permissions": {
        "embed": ["user", "admin"],
        "filter": ["user", "admin"]
      }
    },
    "comments": {
      "type": "hasMany",
      "collection": "comments",
      "localField": "_id",
      "foreignField": "postId",
      "defaultFilters": {
        "status": "approved"
      },
      "defaultSort": {
        "createdAt": -1
      },
      "pagination": {
        "defaultLimit": 20,
        "maxLimit": 100
      }
    }
  }
}
```

## Runtime Configuration

### Programmatic Configuration
```javascript
const mongorest = new MongoREST({
  // Server config
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0'
  },
  
  // Database config
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 50
    }
  },
  
  // Auth config
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '24h'
    }
  },
  
  // Cache config
  cache: {
    enabled: true,
    redis: {
      url: process.env.REDIS_URL
    }
  },
  
  // Custom middleware
  middleware: {
    before: [customAuthMiddleware],
    after: [customLoggerMiddleware]
  },
  
  // Event handlers
  events: {
    onReady: () => console.log('MongoREST ready'),
    onError: (error) => console.error('Error:', error)
  }
});
```

### Dynamic Configuration
```javascript
// Update configuration at runtime
mongorest.updateConfig({
  cache: {
    enabled: false  // Disable cache temporarily
  }
});

// Get current configuration
const config = mongorest.getConfig();
console.log(config.cache.enabled); // false
```

## Feature Flags

```json
{
  "features": {
    "newQueryEngine": {
      "enabled": true,
      "rollout": {
        "percentage": 50,
        "whitelist": ["beta-users"],
        "blacklist": []
      }
    },
    "realtimeSync": {
      "enabled": false,
      "enabledFor": ["enterprise"]
    },
    "advancedAnalytics": {
      "enabled": true,
      "requiresRole": ["analyst", "admin"]
    }
  }
}
```

## Performance Tuning

### Query Optimization
```json
{
  "performance": {
    "query": {
      "timeout": 30000,
      "maxComplexity": 100,
      "maxDepth": 5,
      "maxLimit": 1000,
      "defaultLimit": 50,
      "allowDiskUse": true,
      "explainThreshold": 1000
    },
    "aggregation": {
      "maxStages": 20,
      "maxDocuments": 100000,
      "allowDiskUse": true,
      "timeout": 60000
    },
    "indexing": {
      "autoCreate": true,
      "backgroundIndexing": true,
      "recommendationsEnabled": true,
      "analysisInterval": "24h"
    }
  }
}
```

### Resource Limits
```json
{
  "limits": {
    "request": {
      "bodySize": "10mb",
      "urlLength": 2048,
      "headerSize": "100kb",
      "fileUpload": "50mb"
    },
    "response": {
      "maxSize": "100mb",
      "timeout": 60000
    },
    "concurrent": {
      "connectionsPerIP": 100,
      "requestsPerUser": 50
    }
  }
}
```

## Monitoring Configuration

```json
{
  "monitoring": {
    "metrics": {
      "enabled": true,
      "interval": "10s",
      "retention": "7d",
      "exporters": [
        {
          "type": "prometheus",
          "endpoint": "/metrics",
          "auth": true
        },
        {
          "type": "statsd",
          "host": "localhost",
          "port": 8125
        }
      ]
    },
    "logging": {
      "level": "info",
      "format": "json",
      "transports": [
        {
          "type": "console",
          "level": "debug"
        },
        {
          "type": "file",
          "filename": "logs/app.log",
          "maxsize": "100m",
          "maxFiles": 10
        },
        {
          "type": "syslog",
          "host": "localhost",
          "port": 514
        }
      ]
    },
    "healthCheck": {
      "enabled": true,
      "endpoint": "/health",
      "interval": "30s",
      "checks": [
        "database",
        "cache",
        "disk",
        "memory"
      ]
    }
  }
}
```

## Security Configuration

```json
{
  "security": {
    "helmet": {
      "contentSecurityPolicy": {
        "directives": {
          "defaultSrc": ["'self'"],
          "styleSrc": ["'self'", "'unsafe-inline'"],
          "scriptSrc": ["'self'"],
          "imgSrc": ["'self'", "data:", "https:"],
          "connectSrc": ["'self'"],
          "fontSrc": ["'self'"],
          "objectSrc": ["'none'"],
          "mediaSrc": ["'self'"],
          "frameSrc": ["'none'"]
        }
      },
      "hsts": {
        "maxAge": 31536000,
        "includeSubDomains": true,
        "preload": true
      }
    },
    "cors": {
      "origin": ["https://app.example.com"],
      "credentials": true,
      "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
      "allowedHeaders": ["Content-Type", "Authorization"],
      "exposedHeaders": ["X-Total-Count"],
      "maxAge": 86400
    },
    "rateLimit": {
      "global": {
        "windowMs": 60000,
        "max": 1000,
        "message": "Too many requests"
      },
      "perEndpoint": {
        "/auth/login": {
          "windowMs": 900000,
          "max": 5
        },
        "/auth/register": {
          "windowMs": 3600000,
          "max": 10
        }
      }
    }
  }
}
```

## Environment-Specific Config

### Development
```javascript
// config/development.js
module.exports = {
  server: {
    port: 3000
  },
  database: {
    uri: 'mongodb://localhost:27017/mongorest_dev'
  },
  logging: {
    level: 'debug',
    format: 'pretty'
  },
  features: {
    playground: true,
    introspection: true
  }
};
```

### Production
```javascript
// config/production.js
module.exports = {
  server: {
    port: process.env.PORT,
    trustProxy: true
  },
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      ssl: true,
      sslValidate: true
    }
  },
  logging: {
    level: 'warn',
    format: 'json'
  },
  security: {
    forceHttps: true
  }
};
```

## Configuration Validation

```javascript
// Validate configuration on startup
const configSchema = {
  type: 'object',
  required: ['database', 'auth'],
  properties: {
    database: {
      type: 'object',
      required: ['uri'],
      properties: {
        uri: {
          type: 'string',
          pattern: '^mongodb(\\+srv)?://'
        }
      }
    },
    auth: {
      type: 'object',
      required: ['jwt'],
      properties: {
        jwt: {
          type: 'object',
          required: ['secret'],
          properties: {
            secret: {
              type: 'string',
              minLength: 32
            }
          }
        }
      }
    }
  }
};

// Validate on startup
mongorest.validateConfig(configSchema);
```

## Best Practices

1. **Use environment variables** for sensitive data
2. **Validate configuration** on startup
3. **Use different configs** for different environments
4. **Document all options** in your project
5. **Set sensible defaults** for all options
6. **Monitor configuration changes** in production
7. **Use feature flags** for gradual rollouts

## Next Steps

- Xem [Getting Started](../getting-started/installation.md) để setup ban đầu
- Đọc [Security Best Practices](../security/best-practices.md) cho security config
- Tham khảo [Performance Guide](../architecture/data-flow.md) cho optimization settings