# Field-level Security

## Tổng quan

Field-level Security trong MongoREST cho phép kiểm soát truy cập đến từng field cụ thể trong documents, cung cấp bảo mật chi tiết và linh hoạt cho dữ liệu nhạy cảm.

## Khái niệm cơ bản

### 1. Field Security Levels

MongoREST định nghĩa 4 mức độ bảo mật cho fields:

```javascript
const SECURITY_LEVELS = {
  PUBLIC: 'public',       // Accessible by everyone
  PROTECTED: 'protected', // Requires authentication
  PRIVATE: 'private',     // Requires specific permissions
  SENSITIVE: 'sensitive'  // Requires elevated permissions
};
```

### 2. Field Access Matrix

| Security Level | Guest | User | Developer | Admin |
|---------------|-------|------|-----------|-------|
| PUBLIC        | ✅ Read | ✅ Read/Write | ✅ Read/Write | ✅ Read/Write |
| PROTECTED     | ❌ | ✅ Read | ✅ Read/Write | ✅ Read/Write |
| PRIVATE       | ❌ | ✅ Own only | ✅ Read | ✅ Read/Write |
| SENSITIVE     | ❌ | ❌ | ❌ | ✅ Read/Write |

## Configuration

### 1. Schema-level Field Security

```json
{
  "collection": "users",
  "fields": {
    "username": {
      "type": "string",
      "security": "public",
      "permissions": {
        "read": ["*"],
        "write": ["self", "admin"]
      }
    },
    "email": {
      "type": "string",
      "security": "protected",
      "permissions": {
        "read": ["self", "admin"],
        "write": ["self", "admin"]
      },
      "validation": {
        "format": "email",
        "unique": true
      }
    },
    "password": {
      "type": "string",
      "security": "sensitive",
      "permissions": {
        "read": [],  // Never readable
        "write": ["self"]
      },
      "transform": "hash"  // Auto-hash on write
    },
    "creditCard": {
      "type": "object",
      "security": "sensitive",
      "permissions": {
        "read": {
          "roles": ["admin"],
          "fields": ["last4", "brand"]  // Partial read
        },
        "write": ["payment_processor"]
      },
      "encryption": true
    }
  }
}
```

### 2. Nested Field Security

```json
{
  "profile": {
    "type": "object",
    "properties": {
      "public": {
        "type": "object",
        "security": "public",
        "properties": {
          "displayName": {
            "type": "string",
            "permissions": {
              "read": ["*"],
              "write": ["self", "admin"]
            }
          },
          "bio": {
            "type": "string",
            "maxLength": 500,
            "permissions": {
              "read": ["*"],
              "write": ["self", "admin"]
            }
          }
        }
      },
      "private": {
        "type": "object",
        "security": "private",
        "properties": {
          "dateOfBirth": {
            "type": "string",
            "format": "date",
            "permissions": {
              "read": ["self", "admin", "hr"],
              "write": ["self", "admin"]
            }
          },
          "phoneNumber": {
            "type": "string",
            "permissions": {
              "read": ["self", "admin", "support"],
              "write": ["self", "admin"]
            },
            "mask": {
              "enabled": true,
              "pattern": "***-***-**##"  // Show only last 2 digits
            }
          }
        }
      }
    }
  }
}
```

## Advanced Security Features

### 1. Field Masking

```javascript
// Field masking configuration
{
  "ssn": {
    "type": "string",
    "security": "sensitive",
    "mask": {
      "enabled": true,
      "rules": [
        {
          "role": "support",
          "pattern": "***-**-####"  // Show last 4
        },
        {
          "role": "admin",
          "pattern": "###-##-####"  // Show full
        }
      ],
      "default": "***-**-****"  // Fully masked
    }
  }
}

// Implementation
function maskField(value, pattern) {
  let masked = '';
  let valueIndex = 0;
  
  for (let char of pattern) {
    if (char === '#' && valueIndex < value.length) {
      masked += value[valueIndex];
      valueIndex++;
    } else if (char === '*') {
      masked += '*';
      valueIndex++;
    } else {
      masked += char;
    }
  }
  
  return masked;
}
```

### 2. Field Encryption

```javascript
// Encryption configuration
{
  "medicalRecord": {
    "type": "object",
    "security": "sensitive",
    "encryption": {
      "enabled": true,
      "algorithm": "aes-256-gcm",
      "keyId": "medical-records-key-2024"
    },
    "permissions": {
      "read": ["doctor", "admin"],
      "write": ["doctor", "admin"],
      "decrypt": ["doctor", "admin", "patient"]
    }
  }
}

// Encryption middleware
const encryptField = async (value, config) => {
  const key = await getEncryptionKey(config.keyId);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(config.algorithm, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(value), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex')
  };
};
```

### 3. Dynamic Field Permissions

```javascript
// Dynamic permission rules
const dynamicPermissions = {
  "salary": {
    read: async (user, document) => {
      // User can read their own salary
      if (user.id === document._id) return true;
      
      // Manager can read subordinates' salaries
      if (user.role === 'manager') {
        const subordinates = await getSubordinates(user.id);
        return subordinates.includes(document._id);
      }
      
      // HR can read all salaries
      return user.role === 'hr' || user.role === 'admin';
    },
    write: async (user, document) => {
      // Only HR and admin can modify salaries
      return ['hr', 'admin'].includes(user.role);
    }
  }
};
```

### 4. Audit Trail for Sensitive Fields

```javascript
// Audit configuration
{
  "salary": {
    "type": "number",
    "security": "sensitive",
    "audit": {
      "enabled": true,
      "events": ["read", "write", "update"],
      "details": ["old_value", "new_value", "user", "timestamp", "ip"]
    }
  }
}

// Audit implementation
const auditFieldAccess = async (event) => {
  await db.collection('field_audit_logs').insertOne({
    collection: event.collection,
    documentId: event.documentId,
    field: event.field,
    action: event.action,
    user: {
      id: event.user.id,
      role: event.user.role,
      ip: event.ip
    },
    oldValue: event.oldValue,  // Encrypted
    newValue: event.newValue,  // Encrypted
    timestamp: new Date(),
    reason: event.reason
  });
};
```

## Conditional Field Access

### 1. Time-based Access

```javascript
{
  "promotionCode": {
    "type": "string",
    "security": "protected",
    "permissions": {
      "read": {
        "condition": "time_based",
        "start": "2024-01-01T00:00:00Z",
        "end": "2024-12-31T23:59:59Z",
        "timezone": "UTC"
      }
    }
  }
}
```

### 2. Location-based Access

```javascript
{
  "regionalData": {
    "type": "object",
    "security": "private",
    "permissions": {
      "read": {
        "condition": "location_based",
        "allowedRegions": ["US", "CA", "UK"],
        "checkMethod": "ip_geolocation"
      }
    }
  }
}
```

### 3. Relationship-based Access

```javascript
{
  "teamNotes": {
    "type": "string",
    "security": "private",
    "permissions": {
      "read": {
        "condition": "relationship",
        "relation": "team_members",
        "check": "user_in_team"
      }
    }
  }
}
```

## Field Transformation

### 1. Output Transformations

```javascript
// Transform sensitive data before output
const fieldTransformations = {
  email: {
    transform: (value, user) => {
      if (user.role === 'guest') {
        // Partial email: j***@example.com
        const [name, domain] = value.split('@');
        return `${name[0]}***@${domain}`;
      }
      return value;
    }
  },
  
  phoneNumber: {
    transform: (value, user) => {
      if (!['admin', 'support'].includes(user.role)) {
        // Format: +1 (***) ***-1234
        return value.replace(/(\d{3})(\d{3})(\d{4})/, '+1 (***) ***-$3');
      }
      return value;
    }
  }
};
```

### 2. Input Sanitization

```javascript
// Sanitize input based on field security
const inputSanitizers = {
  bio: {
    sanitize: (value) => {
      // Remove HTML tags, limit length
      return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] })
        .substring(0, 500);
    }
  },
  
  website: {
    sanitize: (value) => {
      // Validate URL format
      try {
        const url = new URL(value);
        return ['http:', 'https:'].includes(url.protocol) ? value : null;
      } catch {
        return null;
      }
    }
  }
};
```

## Performance Optimization

### 1. Field Security Caching

```javascript
class FieldSecurityCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }
  
  getCacheKey(userId, collection, operation) {
    return `${userId}:${collection}:${operation}`;
  }
  
  async getAllowedFields(user, collection, operation) {
    const key = this.getCacheKey(user.id, collection, operation);
    const cached = this.cache.get(key);
    
    if (cached && cached.expiry > Date.now()) {
      return cached.fields;
    }
    
    // Calculate allowed fields
    const fields = await calculateAllowedFields(user, collection, operation);
    
    this.cache.set(key, {
      fields,
      expiry: Date.now() + this.ttl
    });
    
    return fields;
  }
}
```

### 2. Batch Field Processing

```javascript
// Process multiple documents efficiently
async function batchProcessFieldSecurity(documents, user, operation) {
  // Get allowed fields once
  const allowedFields = await getAllowedFields(user, collection, operation);
  
  // Apply to all documents in parallel
  return Promise.all(
    documents.map(doc => 
      filterDocumentFields(doc, allowedFields)
    )
  );
}
```

## Monitoring & Compliance

### 1. Field Access Metrics

```javascript
// Track field access patterns
const fieldMetrics = {
  track: async (event) => {
    await metricsDB.collection('field_access_metrics').updateOne(
      {
        date: new Date().toISOString().split('T')[0],
        collection: event.collection,
        field: event.field
      },
      {
        $inc: {
          [`operations.${event.operation}`]: 1,
          [`roles.${event.user.role}`]: 1,
          total: 1
        }
      },
      { upsert: true }
    );
  },
  
  report: async (startDate, endDate) => {
    return await metricsDB.collection('field_access_metrics').aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { collection: '$collection', field: '$field' },
          totalAccess: { $sum: '$total' },
          byOperation: { $push: '$operations' },
          byRole: { $push: '$roles' }
        }
      }
    ]).toArray();
  }
};
```

### 2. Compliance Reporting

```javascript
// Generate compliance reports for sensitive fields
async function generateComplianceReport(period) {
  const sensitiveFields = await getSensitiveFieldsList();
  const report = {
    period,
    generated: new Date(),
    sensitiveFieldAccess: []
  };
  
  for (const field of sensitiveFields) {
    const access = await db.collection('field_audit_logs').find({
      field: field.name,
      timestamp: { $gte: period.start, $lte: period.end }
    }).toArray();
    
    report.sensitiveFieldAccess.push({
      field: field.name,
      collection: field.collection,
      totalAccess: access.length,
      byRole: groupBy(access, 'user.role'),
      anomalies: detectAnomalies(access)
    });
  }
  
  return report;
}
```

## Best Practices

### 1. Principle of Least Privilege

```javascript
// Good: Specific field permissions
{
  "email": {
    "permissions": {
      "read": ["self", "admin", "support"],
      "write": ["self", "admin"]
    }
  }
}

// Bad: Overly permissive
{
  "email": {
    "permissions": {
      "read": ["*"],
      "write": ["*"]
    }
  }
}
```

### 2. Defense in Depth

```javascript
// Multiple layers of security
{
  "creditCard": {
    "security": "sensitive",
    "encryption": true,
    "mask": true,
    "audit": true,
    "permissions": {
      "read": ["payment_processor"],
      "write": ["payment_processor"],
      "decrypt": ["payment_admin"]
    },
    "validation": {
      "luhn": true,
      "format": "^[0-9]{13,19}$"
    }
  }
}
```

### 3. Clear Documentation

```javascript
// Document security requirements
{
  "ssn": {
    "type": "string",
    "security": "sensitive",
    "description": "Social Security Number - PII data",
    "compliance": ["GDPR", "CCPA", "HIPAA"],
    "permissions": {
      "read": {
        "roles": ["hr", "admin"],
        "reason_required": true,
        "audit": true
      }
    }
  }
}
```

## Testing Field Security

### Unit Tests

```javascript
describe('Field Security', () => {
  it('should mask sensitive fields for non-admin users', () => {
    const document = {
      name: 'John Doe',
      ssn: '123-45-6789',
      phone: '555-123-4567'
    };
    
    const filtered = applyFieldSecurity(document, { role: 'user' });
    
    expect(filtered.ssn).toBe('***-**-****');
    expect(filtered.phone).toBe('***-***-4567');
  });
  
  it('should remove inaccessible fields', () => {
    const document = {
      public: 'visible',
      private: 'hidden',
      sensitive: 'very hidden'
    };
    
    const filtered = applyFieldSecurity(document, { role: 'guest' });
    
    expect(filtered).toHaveProperty('public');
    expect(filtered).not.toHaveProperty('private');
    expect(filtered).not.toHaveProperty('sensitive');
  });
});
```

## Next Steps

- Review [RBAC Configuration](./rbac-configuration.md) for role setup
- Read [Security Best Practices](./best-practices.md) for implementation guidelines
- Check [Authentication](./authentication.md) for user context handling