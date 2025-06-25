---
sidebar_position: 1
---

# Authentication Setup

Hướng dẫn chi tiết thiết lập authentication cho MongoREST.

## Overview

Hướng dẫn này sẽ giúp bạn:
- Thiết lập authentication cơ bản với JWT
- Cấu hình roles và permissions
- Xử lý các tình huống authentication phức tạp

## Basic JWT Setup

### Step 1: Generate Secret Keys

```bash
# Generate JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate refresh token secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For RS256 algorithm
openssl genrsa -out private.key 2048
openssl rsa -in private.key -pubout -out public.key
```

### Step 2: Configure Authentication

```javascript
// mongorest.config.js
module.exports = {
  auth: {
    enabled: true,
    
    jwt: {
      // For HS256
      secret: process.env.JWT_SECRET,

      // Token settings
      expiresIn: '15m',
      refreshExpiresIn: '7d',
      issuer: 'api.example.com',
      audience: 'example.com'
    },
  }
};
```

### Step 3: Create User Model

```javascript
// schemas/users.js
module.exports = {
  schema: {
    // Basic fields
    username: { 
      type: 'string', 
      required: true, 
      unique: true,
      minLength: 3,
      maxLength: 30,
      pattern: '^[a-zA-Z0-9_-]+$'
    },
    
    email: { 
      type: 'string', 
      required: true, 
      unique: true,
      format: 'email',
      transform: ['toLowerCase', 'trim']
    },
    
    password: { 
      type: 'string', 
      required: true,
      hidden: true,
      minLength: 8
    },
    
    // Profile
    profile: {
      type: 'object',
      properties: {
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        avatar: { type: 'string', format: 'url' },
        bio: { type: 'string', maxLength: 500 },
        phone: { type: 'string', pattern: '^\\+?[1-9]\\d{1,14}$' }
      }
    },
    
    // Security
    role: { 
      type: 'string',
      enum: ['admin', 'moderator', 'user', 'guest'],
      default: 'user'
    },
    
    permissions: {
      type: 'array',
      items: { type: 'string' },
      default: []
    },
    
    active: { type: 'boolean', default: true },
    verified: { type: 'boolean', default: false },
    
    // Authentication
    lastLogin: { type: 'date' },
    lastLoginIP: { type: 'string' },
    loginAttempts: { type: 'number', default: 0 },
    lockUntil: { type: 'date' },
    
    // Tokens
    refreshToken: { type: 'string', hidden: true },
    resetPasswordToken: { type: 'string', hidden: true },
    resetPasswordExpires: { type: 'date' },
    verificationToken: { type: 'string', hidden: true },
    
    // Timestamps
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now }
  },
};
```
## Role-Based Access Control (RBAC)

### Step 1: Define Roles

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

### Step 2: Permission Format

```json
{
  "collection": "collection_name",
  "rbac_config": {
    "read":[
      {
        "user_role": "user",
        "patterns":[
          {"name": {"type": "string"} },
          { "profile.avatar": { "type": "string" } }
        ]
      }
    ],
    "write": [
      {
        "user_role": "default",
        "patterns": [
          { "name": { "type": "string", "pattern": "^.{2,100}$" } },
          { "profile.avatar": { "type": "string", "pattern": "^(https?://|/).*\\.(jpg|jpeg|png|gif|webp|svg)$" } },
          { "profile.age": { "type": "integer", "minimum": 13, "maximum": 120 } }
        ]
      },
    ]
  }
  
}
```

### Step 3: Middleware Protection

```javascript
// Protect routes with permissions
hooks: {
  beforeRequest: async (req, res, next) => {
    
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
    
    // Check permission
    const isAccess = await hasAccess(collection, action, userRoles);
    
    if (!isAccess) {
      return res.status(403).json({
        error: 'Permission denied',
        required: permission
      });
    }
    
    next();
  }
}
```
## Troubleshooting

### Common Issues

**Token not valid**
   - Check token expiry
   - Verify secret key matches
   - Check algorithm consistency

## Next Steps

- [Complex Queries](./complex-queries) - Advanced query techniques
- [Security Model](../explanations/security) - Deep dive into security
- [API Reference](../references/api) - Complete API documentation