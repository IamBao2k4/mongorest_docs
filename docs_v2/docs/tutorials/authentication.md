---
sidebar_position: 3
---

# Authentication

Hướng dẫn chi tiết về authentication và authorization trong MongoREST.

## Tổng quan

MongoREST hỗ trợ nhiều phương thức authentication:
- JWT (JSON Web Tokens) - Mặc định
- API Keys
- OAuth 2.0
- Custom authentication providers
- Session-based authentication

## JWT Authentication

### Cấu hình cơ bản

```javascript
// mongorest.config.js
module.exports = {
  auth: {
    enabled: true,
    type: 'jwt',
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '24h',
      algorithm: 'HS256',
      issuer: 'mongorest',
      audience: 'mongorest-api'
    }
  }
};
```

### Environment variables

```bash
# .env
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256
```

### User schema

MongoREST tự động tạo collection `users` với schema cơ bản:

```javascript
{
  username: {
    type: 'string',
    required: true,
    unique: true,
    widget: 'shortAnswer',
    title: 'Username',
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9_\\-\\.]{3,50}$',
    description: 'Unique username'
  },
  email: {
    type: 'string',
    format: 'email',
    required: true,
    unique: true,
    widget: 'shortAnswer',
    title: 'Email Address',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    description: 'User email address'
  },
  password: {
    type: 'string',
    required: true,
    hidden: true,
    widget: 'password',
    title: 'Password',
    minLength: 8,
    description: 'User password (hashed)'
  },
  role: {
    type: 'string',
    widget: 'select',
    title: 'Role',
    enum: ['user', 'admin', 'moderator'],
    default: 'user',
    choices: [
      { key: 'user', value: 'User' },
      { key: 'admin', value: 'Admin' },
      { key: 'moderator', value: 'Moderator' }
    ],
    description: 'User role for access control'
  },
  permissions: {
    type: 'array',
    items: { type: 'string' },
    widget: 'checkbox',
    title: 'Permissions',
    description: 'List of user permissions'
  },
  active: {
    type: 'boolean',
    default: true,
    widget: 'switch',
    title: 'Active',
    description: 'Is user active?'
  },
  createdAt: {
    type: 'string',
    widget: 'dateTime',
    title: 'Created At',
    format: 'date-time',
    pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$',
    disabled: true
  },
  lastLogin: {
    type: 'string',
    widget: 'dateTime',
    title: 'Last Login',
    format: 'date-time',
    pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$',
    disabled: true
  },
  refreshToken: {
    type: 'string',
    hidden: true,
    widget: 'hidden',
    description: 'Refresh token for JWT'
  }
}
```

## Sử dụng Token

### Authorization Header

```bash
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Query Parameter

```bash
GET /users?token=eyJhbGciOiJIUzI1NiIs...
```

### Cookie

```javascript
// Cấu hình cookie
auth: {
  jwt: {
    cookie: {
      name: 'mongorest-token',
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: 'strict',
      maxAge: 86400000 // 24 hours
    }
  }
}
```

## Roles và Permissions

### Cấu hình roles

```json
{
  "collection_name": "users",
  "rbac_config": {
    "read": [
      {
        "user_role": "default",
        "patterns": [
          { "_id": { "type": "string" } },
          { "name": { "type": "string" } },
          { "profile.avatar": { "type": "string" } },
          { "product_reviews": { "type": "relation", "relate_collection": "product_reviews" } }
        ]
      },
      {
        "user_role": "user",
        "patterns": [
          { "_id": { "type": "string" } },
          { "email": { "type": "string" } },
          { "name": { "type": "string" } },
          { "profile": { "type": "object" } },
          { "status": { "type": "string" } }
        ]
      }
      {
        "user_role": "admin",
        "patterns": [
          { "_id": { "type": "string" } },
          { "email": { "type": "string" } },
          { "name": { "type": "string" } },
          { "profile": { "type": "object" } },
          { "status": { "type": "string" } },
          { "lastLogin": { "type": "string" } },
          { "createdAt": { "type": "string" } },
          { "updatedAt": { "type": "string" } }
        ]
      }
    ],
    "write": [
      {
        "user_role": "default",
        "patterns": [
          { "name": { "type": "string" } },
          { "profile.avatar": { "type": "string" } },
          { "profile.age": { "type": "integer" } }
        ]
      },
      {
        "user_role": "user",
        "patterns": [
          { "name": { "type": "string", "pattern": "^.{2,100}$" } },
          { "profile.age": { "type": "integer", "minimum": 13, "maximum": 120 } },
          { "profile.interests": { "type": "array", "maxItems": 10 } },
          { "profile.avatar": { "type": "string", "pattern": "^(https?://|/).*\\.(jpg|jpeg|png|gif|webp|svg)$" } },
          { "email": { "type": "string", "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" } },
          { "profile.country": { "type": "string", "enum": ["Vietnam", "Thailand", "Malaysia", "Singapore", "Indonesia", "Philippines"] } },
          { "status": { "type": "string", "enum": ["active", "inactive", "suspended"] } }
        ]
      },
      {
        "user_role": "admin",
        "patterns": [
          { "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } },
          { "email": { "type": "string", "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" } },
          { "name": { "type": "string", "pattern": "^.{2,100}$" } },
          { "profile": { "type": "object" } },
          { "status": { "type": "string", "enum": ["active", "inactive", "suspended"] } },
          { "lastLogin": { "type": "string" } },
          { "createdAt": { "type": "string" } },
          { "updatedAt": { "type": "string" } }
        ]
      }
    ],
    "delete": [
      { "user_role": "admin" },
      { "user_role": "dev" }
    ]
  }
}
```

### Dynamic permissions

```typescript
public hasAccess(collection: string, action: string, userRoles: string[]): boolean {
    const rbacCollection: RbacCollection | undefined = this.rbacJson.collections.find((col: RbacCollection) => col.collection_name === collection);

    if (!rbacCollection) {
        return false; // Collection not found
    }

    const collectionAction: RbacRolePattern[] = action === 'read' ? rbacCollection.rbac_config.read : action === 'write' ? rbacCollection.rbac_config.write : rbacCollection.rbac_config.delete;

    return userRoles.some(role =>
        this.hasUserRole(collectionAction, role)
    );
}
```

## API Keys

### Enable API Keys

```javascript
auth: {
  apiKey: {
    enabled: true,
    header: 'X-API-Key',
    queryParam: 'apikey'
  }
}
```

### Generate API Key

```bash
POST /auth/api-keys
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "name": "Mobile App",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Mobile App",
  "key": "mk_live_51H3Bgj2eZvKYlo2CfE3K7...",
  "createdAt": "2023-01-15T10:30:00Z",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Use API Key

```bash
GET /users
X-API-Key: mk_live_51H3Bgj2eZvKYlo2CfE3K7...
```

## Security Best Practices

### 1. Strong JWT secrets

```javascript
// Generate strong secret
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
console.log('JWT_SECRET=' + secret);
```

### 2. Token expiration

```javascript
auth: {
  jwt: {
    expiresIn: '15m',        // Short-lived access token
    refreshExpiresIn: '7d',  // Longer refresh token
    
    // Sliding sessions
    slidingRefresh: true,
    slidingWindow: '1h'
  }
}
```

### 3. Rate limiting

```javascript
auth: {
  rateLimit: {
    login: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts
      message: 'Too many login attempts'
    },
    register: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3 // 3 registrations per hour
    }
  }
}
```

### 4. Password requirements

```javascript
auth: {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    preventCommon: true,
    
    // Custom validator
    validate: (password) => {
      if (commonPasswords.includes(password)) {
        throw new Error('Password too common');
      }
      return true;
    }
  }
}
```

## Middleware Integration

### Express middleware

```javascript
const { authenticate } = require('mongorest/middleware');

// Protect all routes
app.use(authenticate());

// Protect specific routes
app.get('/admin/*', authenticate({ role: 'admin' }));

// Optional auth
app.get('/posts', authenticate({ required: false }));
```

### Custom middleware

```javascript
const customAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Bước tiếp theo

- [Configuration](./configuration) - Cấu hình chi tiết
- [Security Model](../explanations/security) - Hiểu về bảo mật
- [API Reference](../references/api) - Chi tiết API endpoints