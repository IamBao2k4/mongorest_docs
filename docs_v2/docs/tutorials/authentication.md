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
  username: { type: 'string', required: true, unique: true },
  email: { type: 'string', format: 'email', unique: true },
  password: { type: 'string', required: true, hidden: true },
  role: { type: 'string', default: 'user' },
  permissions: { type: 'array', items: { type: 'string' } },
  active: { type: 'boolean', default: true },
  createdAt: { type: 'date', default: Date.now },
  lastLogin: { type: 'date' },
  refreshToken: { type: 'string', hidden: true }
}
```

## Authentication Endpoints

### Register

```bash
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "active": true,
    "createdAt": "2023-01-15T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePassword123!"
}
```

Hoặc login với email:

```bash
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

Response:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

### Refresh Token

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "24h"
}
```

### Logout

```bash
POST /auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Get Current User

```bash
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user",
  "permissions": ["read", "write"],
  "active": true,
  "lastLogin": "2023-01-15T10:30:00Z"
}
```

### Change Password

```bash
POST /auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePassword456!"
}
```

### Forgot Password

```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password

```bash
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword789!"
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

```javascript
auth: {
  roles: {
    // Super admin - full access
    admin: {
      collections: '*',
      operations: '*',
      fields: '*'
    },
    
    // Editor - CRUD on content
    editor: {
      collections: ['posts', 'comments', 'media'],
      operations: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      fields: '*'
    },
    
    // Author - own content only
    author: {
      collections: ['posts', 'comments'],
      operations: ['GET', 'POST', 'PUT', 'PATCH'],
      fields: '*',
      conditions: {
        'posts': { authorId: '$user._id' },
        'comments': { userId: '$user._id' }
      }
    },
    
    // Viewer - read only
    viewer: {
      collections: ['posts', 'comments'],
      operations: ['GET'],
      fields: {
        'posts': ['title', 'content', 'publishedAt'],
        'comments': ['text', 'createdAt']
      }
    },
    
    // Guest - limited access
    guest: {
      collections: ['posts'],
      operations: ['GET'],
      fields: ['title', 'summary'],
      conditions: {
        'posts': { status: 'published' }
      }
    }
  }
}
```

### Permission-based access

```javascript
auth: {
  permissions: {
    'users.create': ['admin', 'manager'],
    'users.read': ['admin', 'manager', 'user'],
    'users.update': ['admin', 'manager'],
    'users.delete': ['admin'],
    
    'posts.publish': ['admin', 'editor'],
    'posts.moderate': ['admin', 'moderator']
  }
}
```

### Dynamic permissions

```javascript
// Check permissions in hooks
hooks: {
  beforeInsert: async (collection, data, context) => {
    const { user } = context;
    
    if (!user.permissions.includes(`${collection}.create`)) {
      throw new Error('Permission denied');
    }
    
    // Add owner info
    data.createdBy = user._id;
    data.organizationId = user.organizationId;
    
    return data;
  }
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
  "permissions": ["users.read", "posts.read"],
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Mobile App",
  "key": "mk_live_51H3Bgj2eZvKYlo2CfE3K7...",
  "permissions": ["users.read", "posts.read"],
  "createdAt": "2023-01-15T10:30:00Z",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

### Use API Key

```bash
GET /users
X-API-Key: mk_live_51H3Bgj2eZvKYlo2CfE3K7...

# Or
GET /users?apikey=mk_live_51H3Bgj2eZvKYlo2CfE3K7...
```

## OAuth 2.0

### Google OAuth

```javascript
auth: {
  oauth: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      scope: ['profile', 'email']
    }
  }
}
```

### OAuth flow

1. Redirect to provider:
```bash
GET /auth/google
```

2. Handle callback:
```bash
GET /auth/google/callback?code=...
```

3. Response with JWT:
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@gmail.com",
    "name": "John Doe",
    "provider": "google",
    "providerId": "1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Multiple OAuth providers

```javascript
auth: {
  oauth: {
    google: { /* config */ },
    facebook: { /* config */ },
    github: { /* config */ },
    twitter: { /* config */ }
  }
}
```

## Custom Authentication

### Custom auth provider

```javascript
auth: {
  custom: {
    enabled: true,
    provider: async (credentials) => {
      // Your custom logic
      const user = await ldapAuth(credentials);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      return {
        _id: user.id,
        username: user.username,
        email: user.email,
        role: mapLdapRole(user.groups)
      };
    }
  }
}
```

### External JWT validation

```javascript
auth: {
  jwt: {
    validate: async (token) => {
      // Validate with external service
      const response = await fetch('https://auth.example.com/validate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Invalid token');
      }
      
      return response.json();
    }
  }
}
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

### 5. Two-factor authentication

```javascript
auth: {
  twoFactor: {
    enabled: true,
    issuer: 'MongoREST',
    
    // TOTP
    totp: {
      window: 1,
      step: 30
    },
    
    // SMS
    sms: {
      provider: 'twilio',
      from: '+1234567890'
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