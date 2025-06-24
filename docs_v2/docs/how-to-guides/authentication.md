---
sidebar_position: 1
---

# Authentication Setup

Hướng dẫn chi tiết thiết lập authentication từ A-Z cho MongoREST.

## Overview

Hướng dẫn này sẽ giúp bạn:
- Thiết lập authentication cơ bản với JWT
- Cấu hình roles và permissions
- Tích hợp OAuth providers
- Implement two-factor authentication
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
      
      // For RS256
      privateKey: fs.readFileSync('./private.key'),
      publicKey: fs.readFileSync('./public.key'),
      algorithm: 'RS256',
      
      // Token settings
      expiresIn: '15m',
      refreshExpiresIn: '7d',
      issuer: 'api.example.com',
      audience: 'example.com'
    },
    
    // Password hashing
    bcrypt: {
      rounds: 12 // Increase for more security
    }
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
      hidden: true, // Don't return in API responses
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
    
    // 2FA
    twoFactorSecret: { type: 'string', hidden: true },
    twoFactorEnabled: { type: 'boolean', default: false },
    
    // Timestamps
    createdAt: { type: 'date', default: Date.now },
    updatedAt: { type: 'date', default: Date.now }
  },
  
  indexes: [
    { fields: { email: 1 }, unique: true },
    { fields: { username: 1 }, unique: true },
    { fields: { resetPasswordToken: 1 }, sparse: true },
    { fields: { verificationToken: 1 }, sparse: true }
  ],
  
  hooks: {
    beforeInsert: async (data) => {
      // Hash password
      const bcrypt = require('bcrypt');
      data.password = await bcrypt.hash(data.password, 12);
      
      // Generate verification token
      data.verificationToken = require('crypto').randomBytes(32).toString('hex');
      
      return data;
    },
    
    beforeUpdate: async (id, data) => {
      // Update timestamp
      data.updatedAt = new Date();
      
      // Hash new password if changed
      if (data.password) {
        const bcrypt = require('bcrypt');
        data.password = await bcrypt.hash(data.password, 12);
      }
      
      return data;
    }
  }
};
```

## Registration Flow

### Step 1: Registration Endpoint

```javascript
// Custom registration with email verification
auth: {
  registration: {
    enabled: true,
    requireEmailVerification: true,
    
    // Auto-login after registration
    autoLogin: false,
    
    // Welcome email
    sendWelcomeEmail: true,
    
    // Default role and permissions
    defaultRole: 'user',
    defaultPermissions: ['read:own', 'write:own'],
    
    // Custom validation
    validate: async (data) => {
      // Check blacklisted emails
      const domain = data.email.split('@')[1];
      if (blacklistedDomains.includes(domain)) {
        throw new Error('Email domain not allowed');
      }
      
      // Check username availability
      const exists = await db.users.findOne({ 
        $or: [
          { username: data.username },
          { email: data.email }
        ]
      });
      
      if (exists) {
        throw new Error('Username or email already exists');
      }
      
      return true;
    }
  }
}
```

### Step 2: Email Verification

```javascript
// Email configuration
email: {
  enabled: true,
  
  // SMTP settings
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  
  // Email templates
  templates: {
    verification: {
      subject: 'Verify your email',
      html: `
        <h1>Welcome to {{appName}}!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="{{verificationUrl}}">Verify Email</a>
        <p>Or use this code: {{verificationCode}}</p>
      `
    },
    
    welcome: {
      subject: 'Welcome to {{appName}}',
      html: `
        <h1>Welcome {{username}}!</h1>
        <p>Your account has been created successfully.</p>
      `
    },
    
    passwordReset: {
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="{{resetUrl}}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    }
  }
}
```

### Step 3: Verification Handler

```javascript
// Handle email verification
POST /auth/verify-email
{
  "token": "verification-token-from-email"
}

// Or with code
POST /auth/verify-email
{
  "email": "user@example.com",
  "code": "123456"
}

// Custom verification logic
auth: {
  verification: {
    // Token expiry
    tokenExpiry: '24h',
    
    // Code length
    codeLength: 6,
    codeType: 'numeric', // numeric, alphanumeric
    
    // After verification
    afterVerification: async (user) => {
      // Grant verified permissions
      user.permissions.push('create:posts', 'upload:files');
      
      // Send welcome email
      await sendEmail(user.email, 'welcome', {
        username: user.username
      });
      
      return user;
    }
  }
}
```

## Role-Based Access Control (RBAC)

### Step 1: Define Roles

```javascript
auth: {
  roles: {
    // Super admin
    admin: {
      description: 'Full system access',
      permissions: ['*'],
      inherits: []
    },
    
    // Moderator
    moderator: {
      description: 'Content moderation',
      permissions: [
        'read:*',
        'update:posts',
        'delete:posts',
        'update:comments',
        'delete:comments',
        'ban:users'
      ],
      inherits: ['user']
    },
    
    // Regular user
    user: {
      description: 'Standard user',
      permissions: [
        'read:public',
        'create:posts',
        'update:own:posts',
        'delete:own:posts',
        'create:comments',
        'update:own:comments',
        'delete:own:comments',
        'update:own:profile'
      ],
      inherits: ['guest']
    },
    
    // Guest
    guest: {
      description: 'Anonymous user',
      permissions: [
        'read:public:posts',
        'read:public:comments'
      ],
      inherits: []
    }
  }
}
```

### Step 2: Permission Format

```javascript
// Permission format: action:scope:resource
// Examples:
'*'                      // All permissions
'read:*'                 // Read everything
'read:posts'             // Read all posts
'read:own:posts'         // Read own posts only
'read:public:posts'      // Read public posts
'update:own:profile'     // Update own profile
'delete:comments:123'    // Delete specific comment

// Custom permission checks
auth: {
  checkPermission: async (user, permission, context) => {
    // Parse permission
    const [action, scope, resource] = permission.split(':');
    
    // Check user permissions
    if (user.permissions.includes('*')) return true;
    if (user.permissions.includes(permission)) return true;
    
    // Check role permissions
    const role = roles[user.role];
    if (role.permissions.includes(permission)) return true;
    
    // Check inherited permissions
    for (const inheritedRole of role.inherits) {
      if (roles[inheritedRole].permissions.includes(permission)) {
        return true;
      }
    }
    
    // Custom logic
    if (scope === 'own' && context.ownerId === user._id) {
      return true;
    }
    
    return false;
  }
}
```

### Step 3: Middleware Protection

```javascript
// Protect routes with permissions
hooks: {
  beforeRequest: async (req, res, next) => {
    const { method, path, user } = req;
    
    // Map HTTP methods to actions
    const actionMap = {
      'GET': 'read',
      'POST': 'create',
      'PUT': 'update',
      'PATCH': 'update',
      'DELETE': 'delete'
    };
    
    const action = actionMap[method];
    const resource = path.split('/')[1]; // e.g., 'posts'
    
    // Build permission
    const permission = `${action}:${resource}`;
    
    // Check permission
    const hasPermission = await checkPermission(user, permission);
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Permission denied',
        required: permission
      });
    }
    
    next();
  }
}
```

## OAuth Integration

### Step 1: Google OAuth

```javascript
auth: {
  oauth: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://api.example.com/auth/google/callback',
      
      // Scopes
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ],
      
      // Options
      accessType: 'offline',
      prompt: 'consent',
      hostedDomain: 'example.com', // Restrict to domain
      
      // User mapping
      mapProfile: (profile) => ({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: profile.emails[0].value.split('@')[0],
        profile: {
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos[0].value
        },
        verified: true
      })
    }
  }
}
```

### Step 2: Multiple OAuth Providers

```javascript
// Facebook
facebook: {
  enabled: true,
  clientId: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
  scope: ['email', 'public_profile'],
  profileFields: ['id', 'emails', 'name', 'picture.width(200)']
},

// GitHub
github: {
  enabled: true,
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
  scope: ['user:email', 'read:user']
},

// LinkedIn
linkedin: {
  enabled: true,
  clientId: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: '/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile']
}
```

### Step 3: Link OAuth Accounts

```javascript
// Allow linking multiple OAuth accounts
auth: {
  oauth: {
    allowLinking: true,
    
    // Link accounts with same email
    autoLink: true,
    
    // Custom linking logic
    linkAccount: async (user, provider, profile) => {
      // Check if already linked
      if (user.oauth && user.oauth[provider]) {
        throw new Error('Account already linked');
      }
      
      // Initialize oauth object
      if (!user.oauth) user.oauth = {};
      
      // Link account
      user.oauth[provider] = {
        id: profile.id,
        email: profile.email,
        linkedAt: new Date()
      };
      
      // Update user
      await db.users.updateOne(
        { _id: user._id },
        { $set: { oauth: user.oauth } }
      );
      
      return user;
    }
  }
}
```

## Two-Factor Authentication (2FA)

### Step 1: Enable 2FA

```javascript
auth: {
  twoFactor: {
    enabled: true,
    
    // Methods
    methods: ['totp', 'sms', 'email'],
    
    // TOTP settings
    totp: {
      issuer: 'MyApp',
      algorithm: 'SHA256',
      digits: 6,
      period: 30,
      window: 1
    },
    
    // SMS settings
    sms: {
      provider: 'twilio',
      from: process.env.TWILIO_PHONE,
      template: 'Your verification code is: {{code}}'
    },
    
    // Backup codes
    backupCodes: {
      count: 10,
      length: 8
    }
  }
}
```

### Step 2: Setup 2FA

```javascript
// Generate TOTP secret
POST /auth/2fa/setup
Authorization: Bearer token

Response:
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCode": "data:image/png;base64,...",
  "backupCodes": [
    "ABCD1234",
    "EFGH5678",
    // ...
  ]
}

// Verify and enable 2FA
POST /auth/2fa/verify
{
  "code": "123456"
}

// Disable 2FA
POST /auth/2fa/disable
{
  "password": "current-password"
}
```

### Step 3: Login with 2FA

```javascript
// Modified login flow
POST /auth/login
{
  "username": "user",
  "password": "pass"
}

Response (if 2FA enabled):
{
  "requiresTwoFactor": true,
  "tempToken": "temp-token",
  "methods": ["totp", "sms"]
}

// Submit 2FA code
POST /auth/2fa/verify-login
{
  "tempToken": "temp-token",
  "code": "123456",
  "method": "totp"
}

Response:
{
  "token": "jwt-token",
  "refreshToken": "refresh-token"
}
```

## Security Best Practices

### Account Security

```javascript
auth: {
  security: {
    // Password policy
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      preventReuse: 5, // Last 5 passwords
      maxAge: 90, // Days
      
      // Common password check
      checkCommon: true,
      commonPasswordsFile: './common-passwords.txt'
    },
    
    // Account lockout
    lockout: {
      enabled: true,
      maxAttempts: 5,
      duration: 15 * 60 * 1000, // 15 minutes
      
      // Progressive delays
      delays: [0, 2000, 5000, 10000, 30000]
    },
    
    // Session management
    sessions: {
      // Single session per user
      singleSession: false,
      
      // Max concurrent sessions
      maxSessions: 5,
      
      // Session timeout
      timeout: 30 * 60 * 1000, // 30 minutes
      
      // Remember me
      rememberMe: {
        enabled: true,
        duration: 30 * 24 * 60 * 60 * 1000 // 30 days
      }
    }
  }
}
```

### Rate Limiting

```javascript
auth: {
  rateLimit: {
    // Login attempts
    login: {
      points: 5,
      duration: 900, // 15 minutes
      blockDuration: 900,
      
      // Progressive blocking
      progressive: {
        1: 60,    // 1 minute
        2: 300,   // 5 minutes
        3: 900,   // 15 minutes
        4: 3600,  // 1 hour
        5: 86400  // 24 hours
      }
    },
    
    // Registration
    register: {
      points: 3,
      duration: 3600, // 1 hour
      blockDuration: 86400 // 24 hours
    },
    
    // Password reset
    passwordReset: {
      points: 3,
      duration: 3600,
      blockDuration: 3600
    }
  }
}
```

## Advanced Scenarios

### Single Sign-On (SSO)

```javascript
auth: {
  sso: {
    enabled: true,
    
    // SAML
    saml: {
      entryPoint: 'https://idp.example.com/saml/sso',
      issuer: 'https://api.example.com',
      cert: fs.readFileSync('./saml-cert.pem'),
      
      // Attribute mapping
      attributeMapping: {
        email: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'
      }
    },
    
    // JWT SSO
    jwt: {
      enabled: true,
      publicKey: fs.readFileSync('./sso-public.key'),
      issuer: 'sso.example.com',
      audience: 'api.example.com'
    }
  }
}
```

### Multi-tenant Authentication

```javascript
auth: {
  multiTenant: {
    enabled: true,
    
    // Tenant identification
    identifyBy: 'subdomain', // subdomain, header, path
    
    // Tenant isolation
    isolation: 'database', // database, collection, field
    
    // Per-tenant settings
    tenantConfig: async (tenantId) => {
      const tenant = await db.tenants.findOne({ _id: tenantId });
      
      return {
        jwt: {
          secret: tenant.jwtSecret,
          expiresIn: tenant.tokenExpiry || '24h'
        },
        
        oauth: {
          google: {
            clientId: tenant.googleClientId,
            clientSecret: tenant.googleClientSecret
          }
        },
        
        branding: {
          name: tenant.name,
          logo: tenant.logo,
          colors: tenant.colors
        }
      };
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Token not valid**
   - Check token expiry
   - Verify secret key matches
   - Check algorithm consistency

2. **OAuth callback errors**
   - Verify callback URL in provider settings
   - Check redirect URI matches exactly
   - Ensure HTTPS in production

3. **2FA not working**
   - Sync device time
   - Check TOTP window settings
   - Verify secret encoding

4. **Account lockouts**
   - Check lockout settings
   - Review failed attempt logs
   - Implement unlock mechanism

## Next Steps

- [Complex Queries](./complex-queries) - Advanced query techniques
- [Security Model](../explanations/security) - Deep dive into security
- [API Reference](../references/api) - Complete API documentation