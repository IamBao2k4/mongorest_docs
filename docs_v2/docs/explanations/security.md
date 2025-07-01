---
sidebar_position: 3
---

# Security & Authorization

## Tổng Quan

MongoREST implement một hệ thống bảo mật nhiều lớp, đảm bảo an toàn cho dữ liệu và APIs ở mọi cấp độ.

## JWT Authentication

### Token Structure
```json
{
  "sub": "user_12345",
  "role": "admin",
  "permissions": ["read", "write"],
  "collections": ["users", "orders", "products"],
  "exp": 1640995200,
  "iat": 1640908800
}
```

### Authentication Flow
1. Client gửi credentials (username/password)
2. Server verify và generate JWT token
3. Client gửi token trong Authorization header
4. Server verify token cho mọi request

```javascript
// Token verification middleware
async function verifyToken(request, reply) {
  const token = request.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return reply.code(401).send({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
```

## Role-Based Access Control (RBAC)

### Cấu Hình RBAC

MongoREST cho phép cấu hình chi tiết quyền truy cập theo từng field:

```json
{
  "collection_name": "orders",
  "rbac_config": {
    "GET": [
      {
        "user_role": "guest",
        "patterns": [
          {"_id": {"type": "string"}},
          {"orderNumber": {"type": "string"}},
          {"status": {"type": "string"}}
        ]
      },
      {
        "user_role": "user",
        "patterns": [
          {"_id": {"type": "string"}},
          {"orderNumber": {"type": "string"}},
          {"customerId": {"type": "string"}},
          {"items": {"type": "object"}},
          {"shippingAddress": {"type": "object"}},
          {"payment.status": {"type": "string"}},
          {"totalAmount": {"type": "number"}},
          {"status": {"type": "string"}},
          {"orderDate": {"type": "string"}},
          {"customer": {"type": "relation", "relate_collection": "users"}}
        ]
      },
      {
        "user_role": "admin",
        "patterns": [
          // Full access to all fields
        ]
      }
    ],
    "POST": [
      {
        "user_role": "user",
        "patterns": [
          {"customerId": {"type": "string", "pattern": "^[a-zA-Z0-9]{24}$"}},
          {"items": {"type": "object", "minItems": 1}},
          {"shippingAddress": {
            "type": "object", 
            "required": ["street", "city", "postalCode", "country"]
          }},
          {"payment": {
            "type": "object",
            "required": ["method"],
            "properties": {
              "method": {"enum": ["credit_card", "paypal", "bank_transfer"]}
            }
          }}
        ]
      }
    ],
    "PATCH": [
      {
        "user_role": "user",
        "patterns": [
          {"shippingAddress": {"type": "object"}},
          {"notes": {"type": "string", "maxLength": 500}}
        ]
      },
      {
        "user_role": "admin",
        "patterns": [
          {"status": {"type": "string", "enum": ["pending", "processing", "shipped", "delivered", "cancelled"]}},
          {"shippingAddress": {"type": "object"}},
          {"payment.status": {"type": "string", "enum": ["pending", "completed", "failed", "refunded"]}},
          {"shippedDate": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$"}},
          {"deliveredDate": {"type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{3})?Z?$"}},
          {"notes": {"type": "string", "maxLength": 1000}}
        ]
      }
    ],
    "DELETE": [
      {
        "user_role": "admin"
      }
    ]
  }
}
```

### Field-Level Security

#### 1. Read Access Control
Mỗi role chỉ thấy được các fields được cho phép:

```javascript
// RBAC filtering implementation
function filterFieldsByRole(data, role, method, collection) {
  const rbacConfig = getRBACConfig(collection);
  const allowedFields = rbacConfig[method]
    .find(config => config.user_role === role)
    ?.patterns || [];
  
  return filterObjectFields(data, allowedFields);
}
```

#### 2. Write Access Control
Validate và filter input data trước khi write:

```javascript
function validateWriteAccess(data, role, method, collection) {
  const rbacConfig = getRBACConfig(collection);
  const allowedPatterns = rbacConfig[method]
    .find(config => config.user_role === role)
    ?.patterns || [];
  
  // Filter out non-allowed fields
  const filteredData = {};
  for (const pattern of allowedPatterns) {
    const fieldName = Object.keys(pattern)[0];
    if (data[fieldName] !== undefined) {
      // Validate field value
      if (validateFieldPattern(data[fieldName], pattern[fieldName])) {
        filteredData[fieldName] = data[fieldName];
      }
    }
  }
  
  return filteredData;
}
```

#### 3. Nested Field Access
Support cho nested field permissions:

```javascript
// Access nested fields like "payment.status"
function checkNestedFieldAccess(fieldPath, allowedPatterns) {
  const parts = fieldPath.split('.');
  let currentPattern = allowedPatterns;
  
  for (const part of parts) {
    const pattern = currentPattern.find(p => Object.keys(p)[0] === part);
    if (!pattern) return false;
    currentPattern = pattern[part].properties || [];
  }
  
  return true;
}
```

### Role-Based Deletion

MongoREST kiểm soát quyền xóa dựa trên role configuration:

```javascript
// Deletion permission check
async function checkDeletePermission(collection, userRole) {
  const rbacConfig = getRBACConfig(collection);
  const deleteConfig = rbacConfig.DELETE || [];
  
  // Check if user role exists in DELETE config
  const hasPermission = deleteConfig.some(
    config => config.user_role === userRole
  );
  
  if (!hasPermission) {
    throw new ForbiddenError(
      `Role '${userRole}' does not have permission to delete from '${collection}'`
    );
  }
}
```

## Input Validation & Sanitization

### Schema-Based Validation
Mọi input đều được validate với JSON Schema:

```javascript
function validateInput(data, schema) {
  const validator = ajv.compile(schema);
  const valid = validator(data);
  
  if (!valid) {
    throw new ValidationError(validator.errors);
  }
  
  return data;
}
```

### Query Parameter Sanitization
Prevent injection attacks:

```javascript
function sanitizeQueryParams(params) {
  // Remove dangerous MongoDB operators
  const dangerous = ['$where', '$eval', '$function', '$accumulator'];
  
  return Object.entries(params).reduce((safe, [key, value]) => {
    if (!dangerous.includes(key)) {
      safe[key] = sanitizeValue(value);
    }
    return safe;
  }, {});
}
```

### Type Coercion Safety
```javascript
function safeTypeCoercion(value, expectedType) {
  switch (expectedType) {
    case 'number':
      const num = Number(value);
      if (isNaN(num)) throw new TypeError('Invalid number');
      return num;
      
    case 'boolean':
      return value === 'true' || value === true;
      
    case 'date':
      const date = new Date(value);
      if (isNaN(date.getTime())) throw new TypeError('Invalid date');
      return date;
      
    default:
      return String(value);
  }
}
```

## Rate Limiting

### Per-Role Configuration
```javascript
const rateLimits = {
  admin: { requests: 10000, window: '1h' },
  user: { requests: 1000, window: '1h' },
  guest: { requests: 100, window: '1h' }
};

// Rate limiting middleware
const createRateLimiter = (role) => {
  return rateLimit({
    windowMs: parseWindow(rateLimits[role].window),
    max: rateLimits[role].requests,
    message: 'Too many requests from this IP'
  });
};
```

## Plugin Security

### Auto-Field Plugin Validation
```javascript
function validatePluginField(field, pluginConfig) {
  // Check if field is in allowed plugins
  if (!allowedPlugins.includes(field)) {
    return false;
  }
  
  // Validate plugin configuration
  if (pluginConfig.isTurnOn !== true) {
    return false;
  }
  
  // Validate plugin value
  if (pluginConfig.value) {
    return validatePluginValue(pluginConfig.value);
  }
  
  return true;
}
```

### Dynamic Value Execution Safety
```javascript
function executePluginValue(value, context) {
  // Whitelist allowed expressions
  const allowedExpressions = [
    /^Date\.now\(\)$/,
    /^Date\.now\(\)\s*[+\-]\s*\d+(\s*\*\s*\d+)*$/
  ];
  
  const isAllowed = allowedExpressions.some(
    regex => regex.test(value)
  );
  
  if (!isAllowed) {
    throw new SecurityError('Invalid plugin expression');
  }
  
  // Safe evaluation in sandboxed context
  return safeEval(value, context);
}
```

## Best Practices

### 1. Token Management
- Use short-lived access tokens (15-30 minutes)
- Implement refresh token mechanism
- Store tokens securely (httpOnly cookies)
- Rotate secrets regularly

### 2. Permission Design
- Follow principle of least privilege
- Define granular permissions per collection
- Regular audit of permission configurations
- Document permission requirements

### 3. Input Handling
- Always validate against schema
- Sanitize all user inputs
- Use parameterized queries
- Limit query complexity

### 4. Monitoring & Auditing
- Log all authentication attempts
- Track permission denials
- Monitor rate limit violations
- Regular security audits

### 5. Error Handling
- Don't expose internal errors
- Use generic error messages
- Log detailed errors internally
- Implement proper error codes

## Security Headers

Recommended security headers:

```javascript
app.addHook('onRequest', (request, reply, done) => {
  reply.headers({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'",
    'Referrer-Policy': 'no-referrer-when-downgrade'
  });
  done();
});
```

## Compliance Considerations

### GDPR Compliance
- Right to access: GET endpoints với user filter
- Right to rectification: PATCH endpoints
- Right to erasure: DELETE endpoints
- Data portability: Export endpoints

### Audit Trail
```javascript
// Audit log structure
{
  timestamp: Date,
  userId: String,
  action: String,
  collection: String,
  documentId: String,
  changes: Object,
  ipAddress: String,
  userAgent: String
}
```

## Security Checklist

- [ ] JWT secret configuration
- [ ] HTTPS/TLS enabled
- [ ] Rate limiting configured
- [ ] RBAC rules defined
- [ ] Input validation active
- [ ] Security headers set
- [ ] Audit logging enabled
- [ ] Error handling secure
- [ ] Dependencies updated
- [ ] Security testing done
