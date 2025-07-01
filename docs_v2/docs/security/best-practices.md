# Security Best Practices

## Tổng quan

Tài liệu này tổng hợp các best practices về bảo mật khi sử dụng MongoREST, giúp đảm bảo ứng dụng của bạn an toàn trước các mối đe dọa phổ biến.

## 1. Authentication & Authorization

### Secure JWT Implementation

#### ✅ DO: Use Strong Secrets

```javascript
// Good: Strong, random secret
const JWT_SECRET = crypto.randomBytes(64).toString('hex');

// Better: Rotate secrets regularly
const JWT_SECRETS = {
  current: process.env.JWT_SECRET_CURRENT,
  previous: process.env.JWT_SECRET_PREVIOUS,
  rotation_date: process.env.JWT_SECRET_ROTATION_DATE
};
```

#### ❌ DON'T: Hardcode Secrets

```javascript
// Bad: Hardcoded secret
const JWT_SECRET = "my-super-secret-key-123";

// Bad: Predictable secret
const JWT_SECRET = "mongorest_" + companyName;
```

### Token Management

#### ✅ DO: Implement Proper Token Lifecycle

```javascript
// Good: Short-lived access tokens with refresh
const tokenConfig = {
  access: {
    expiresIn: '15m',  // 15 minutes
    audience: 'api'
  },
  refresh: {
    expiresIn: '7d',   // 7 days
    audience: 'refresh'
  }
};

// Implement token blacklisting for logout
const blacklistToken = async (token) => {
  const decoded = jwt.decode(token);
  await redis.setex(
    `blacklist:${token}`, 
    decoded.exp - Math.floor(Date.now() / 1000),
    '1'
  );
};
```

#### ❌ DON'T: Long-lived Access Tokens

```javascript
// Bad: Long-lived access token
const token = jwt.sign(payload, secret, { expiresIn: '30d' });

// Bad: No expiration
const token = jwt.sign(payload, secret);
```

## 2. Input Validation & Sanitization

### Schema Validation

#### ✅ DO: Validate All Input

```javascript
// Good: Comprehensive validation
const productSchema = {
  name: {
    type: 'string',
    minLength: 3,
    maxLength: 100,
    pattern: '^[a-zA-Z0-9\\s-]+$',
    transform: ['trim', 'escape']
  },
  price: {
    type: 'number',
    minimum: 0,
    maximum: 1000000,
    multipleOf: 0.01
  },
  description: {
    type: 'string',
    maxLength: 1000,
    sanitize: 'html'  // Remove HTML tags
  }
};
```

#### ❌ DON'T: Trust User Input

```javascript
// Bad: No validation
app.post('/products', async (req, res) => {
  const product = await db.collection('products').insertOne(req.body);
  res.json(product);
});

// Bad: Client-side validation only
if (validateOnClient(data)) {
  sendToServer(data);  // Server still needs validation!
}
```

### MongoDB Injection Prevention

#### ✅ DO: Sanitize Query Parameters

```javascript
// Good: Sanitize operators
function sanitizeQuery(query) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Remove MongoDB operators from user input
    if (key.startsWith('$')) {
      continue;
    }
    
    if (typeof value === 'object') {
      cleaned[key] = sanitizeQuery(value);
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

// Good: Use parameterized queries
const safeFind = async (userInput) => {
  return await collection.find({
    name: userInput.name,  // Direct assignment, no evaluation
    price: { $gte: parseFloat(userInput.minPrice) }
  }).toArray();
};
```

#### ❌ DON'T: Execute Raw User Input

```javascript
// Bad: Direct query execution
const results = await collection.find(JSON.parse(req.query.filter));

// Bad: String concatenation in queries
const query = `{ name: "${req.body.name}" }`;
const results = await collection.find(eval(query));
```

## 3. Data Protection

### Encryption at Rest

#### ✅ DO: Encrypt Sensitive Data

```javascript
// Good: Field-level encryption for PII
const encryptionConfig = {
  fields: {
    ssn: {
      algorithm: 'aes-256-gcm',
      keyId: 'pii-encryption-key-2024'
    },
    creditCard: {
      algorithm: 'aes-256-gcm',
      keyId: 'payment-encryption-key-2024'
    }
  }
};

// Implement encryption middleware
const encryptSensitiveFields = async (document, schema) => {
  for (const [field, config] of Object.entries(schema.encryption || {})) {
    if (document[field]) {
      document[field] = await encrypt(document[field], config);
    }
  }
  return document;
};
```

### Data Masking

#### ✅ DO: Mask Sensitive Data in Logs

```javascript
// Good: Mask sensitive data
const sanitizeForLogging = (data) => {
  const sensitive = ['password', 'ssn', 'creditCard', 'apiKey'];
  const sanitized = { ...data };
  
  sensitive.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '***REDACTED***';
    }
  });
  
  return sanitized;
};

logger.info('User registration', sanitizeForLogging(userData));
```

## 4. Rate Limiting & DDoS Protection

### Implement Rate Limiting

```javascript
// Good: Multiple rate limit layers
const rateLimits = {
  global: {
    windowMs: 60 * 1000,  // 1 minute
    max: 1000  // 1000 requests per minute globally
  },
  perUser: {
    windowMs: 60 * 1000,
    max: 100,  // 100 requests per minute per user
    keyGenerator: (req) => req.user?.id || req.ip
  },
  sensitive: {
    // Stricter limits for sensitive operations
    login: { windowMs: 15 * 60 * 1000, max: 5 },
    passwordReset: { windowMs: 60 * 60 * 1000, max: 3 },
    payment: { windowMs: 60 * 1000, max: 10 }
  }
};
```

### Query Complexity Limits

```javascript
// Good: Limit query complexity
const queryLimits = {
  maxDepth: 3,  // Max relationship nesting
  maxLimit: 1000,  // Max records per query
  maxFields: 50,  // Max fields to select
  timeout: 30000  // 30 second timeout
};

const validateQueryComplexity = (query) => {
  if (query.depth > queryLimits.maxDepth) {
    throw new Error('Query too complex: exceeds maximum depth');
  }
  
  if (query.limit > queryLimits.maxLimit) {
    query.limit = queryLimits.maxLimit;
  }
  
  return query;
};
```

## 5. Secure Communication

### HTTPS Configuration

```javascript
// Good: Enforce HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(`https://${req.header('host')}${req.url}`);
  }
  next();
});

// Good: Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### CORS Configuration

```javascript
// Good: Restrictive CORS
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://app.example.com',
      'https://admin.example.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400  // 24 hours
};
```

## 6. Audit & Monitoring

### Comprehensive Logging

```javascript
// Good: Structured security logging
const securityLogger = {
  logAuth: (event) => {
    logger.info({
      type: 'AUTH',
      action: event.action,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      success: event.success,
      reason: event.reason,
      timestamp: new Date().toISOString()
    });
  },
  
  logDataAccess: (event) => {
    logger.info({
      type: 'DATA_ACCESS',
      userId: event.userId,
      collection: event.collection,
      operation: event.operation,
      documentId: event.documentId,
      fields: event.fields,
      allowed: event.allowed,
      timestamp: new Date().toISOString()
    });
  },
  
  logSecurityIncident: (event) => {
    logger.error({
      type: 'SECURITY_INCIDENT',
      severity: event.severity,
      description: event.description,
      userId: event.userId,
      ip: event.ip,
      stackTrace: event.error?.stack,
      timestamp: new Date().toISOString()
    });
  }
};
```

### Real-time Monitoring

```javascript
// Good: Monitor suspicious activities
const securityMonitor = {
  async checkFailedLogins(userId, ip) {
    const key = `failed_login:${userId || ip}`;
    const attempts = await redis.incr(key);
    await redis.expire(key, 900);  // 15 minutes
    
    if (attempts > 5) {
      await this.triggerAlert({
        type: 'BRUTE_FORCE_ATTEMPT',
        userId,
        ip,
        attempts
      });
      
      // Temporary block
      await redis.setex(`blocked:${userId || ip}`, 3600, '1');
    }
  },
  
  async detectAnomalies(user, request) {
    // Check for unusual patterns
    const anomalies = [];
    
    // Geographical anomaly
    const lastLocation = await getLastKnownLocation(user.id);
    const currentLocation = await getLocationFromIP(request.ip);
    
    if (lastLocation && getDistance(lastLocation, currentLocation) > 1000) {
      anomalies.push({
        type: 'LOCATION_ANOMALY',
        description: 'Login from unusual location'
      });
    }
    
    // Time-based anomaly
    const lastActive = await getLastActiveTime(user.id);
    const hoursSinceActive = (Date.now() - lastActive) / 3600000;
    
    if (hoursSinceActive > 720) {  // 30 days
      anomalies.push({
        type: 'DORMANT_ACCOUNT',
        description: 'Account was dormant for extended period'
      });
    }
    
    return anomalies;
  }
};
```

## 7. Secure Development Practices

### Environment Configuration

```javascript
// Good: Validate environment on startup
const validateEnvironment = () => {
  const required = [
    'NODE_ENV',
    'JWT_SECRET',
    'MONGODB_URI',
    'ENCRYPTION_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate values
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
  }
};
```

### Dependency Security

```javascript
// Good: Regular security audits
{
  "scripts": {
    "security:check": "npm audit",
    "security:fix": "npm audit fix",
    "deps:check": "npm-check-updates",
    "deps:validate": "lockfile-lint --path package-lock.json --allowed-hosts npm yarn"
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm run security:check"
    }
  }
}
```

## 8. Incident Response

### Security Incident Handling

```javascript
class SecurityIncidentHandler {
  async handleIncident(incident) {
    // 1. Log the incident
    await this.logIncident(incident);
    
    // 2. Immediate mitigation
    switch (incident.type) {
      case 'BRUTE_FORCE':
        await this.blockIP(incident.ip);
        await this.lockAccount(incident.userId);
        break;
        
      case 'DATA_BREACH':
        await this.revokeAllTokens();
        await this.notifyAffectedUsers(incident.affectedUsers);
        break;
        
      case 'INJECTION_ATTEMPT':
        await this.blockRequest(incident.requestId);
        await this.alertSecurityTeam(incident);
        break;
    }
    
    // 3. Alert relevant parties
    await this.sendAlerts(incident);
    
    // 4. Create incident report
    return this.createReport(incident);
  }
  
  async createReport(incident) {
    return {
      id: generateId(),
      timestamp: new Date(),
      type: incident.type,
      severity: incident.severity,
      description: incident.description,
      affectedSystems: incident.systems,
      mitigationSteps: incident.mitigation,
      status: 'INVESTIGATING'
    };
  }
}
```

## 9. Security Checklist

### Pre-deployment

- [ ] All environment variables are properly set
- [ ] JWT secrets are strong and unique
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Input validation is comprehensive
- [ ] Sensitive data encryption is enabled
- [ ] Security headers are configured
- [ ] CORS is properly restricted
- [ ] Audit logging is enabled
- [ ] Error messages don't leak sensitive info

### Regular Maintenance

- [ ] Weekly: Review security logs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review access patterns
- [ ] Quarterly: Security audit
- [ ] Quarterly: Penetration testing
- [ ] Annually: Full security review

### Incident Response

- [ ] Incident response plan documented
- [ ] Contact list updated
- [ ] Backup and recovery tested
- [ ] Communication plan ready
- [ ] Legal compliance verified

## 10. Compliance & Privacy

### GDPR Compliance

```javascript
// Good: Implement data privacy controls
const privacyControls = {
  // Right to be forgotten
  async deleteUserData(userId) {
    // Delete from all collections
    const collections = ['users', 'orders', 'activities', 'logs'];
    
    for (const collection of collections) {
      await db.collection(collection).deleteMany({ userId });
    }
    
    // Archive for legal requirements
    await archiveUserData(userId);
    
    return { deleted: true, timestamp: new Date() };
  },
  
  // Data portability
  async exportUserData(userId) {
    const userData = {};
    
    // Collect from all relevant collections
    userData.profile = await db.collection('users').findOne({ _id: userId });
    userData.orders = await db.collection('orders').find({ userId }).toArray();
    userData.activities = await db.collection('activities').find({ userId }).toArray();
    
    return {
      format: 'json',
      data: userData,
      generated: new Date()
    };
  }
};
```

### Data Retention

```javascript
// Good: Implement retention policies
const retentionPolicies = {
  logs: {
    security: 365,  // 1 year
    access: 90,     // 90 days
    error: 30       // 30 days
  },
  
  async enforceRetention() {
    const now = new Date();
    
    // Delete old logs
    await db.collection('security_logs').deleteMany({
      timestamp: { $lt: new Date(now - this.logs.security * 86400000) }
    });
    
    await db.collection('access_logs').deleteMany({
      timestamp: { $lt: new Date(now - this.logs.access * 86400000) }
    });
  }
};
```

## Conclusion

Bảo mật là một quá trình liên tục, không phải là một tính năng một lần. Thường xuyên review và update các security practices của bạn để đảm bảo MongoREST application luôn an toàn.

### Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### Next Steps

- Implement [RBAC Configuration](./rbac-configuration.md)
- Setup [Field-level Security](./field-level-security.md)
- Read the [API Reference](../api-reference/basic-queries.md) for secure query patterns