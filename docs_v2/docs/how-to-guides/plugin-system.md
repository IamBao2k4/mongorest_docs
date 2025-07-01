---
sidebar_position: 4
---

# Use Plugin System

## Tổng Quan

Plugin System của MongoREST cho phép tự động thêm các fields vào documents khi create hoặc update. Điều này giúp đảm bảo consistency và giảm boilerplate code.

## Cách Hoạt Động

Khi gửi request với plugin fields, MongoREST sẽ:
1. Kiểm tra field name trong danh sách supported plugins
2. Nếu `isTurnOn = true`, plugin được kích hoạt
3. Tự động inject giá trị phù hợp vào document

## Plugin Fields Được Hỗ Trợ

### Timestamp Plugins

#### created_at
Tự động thêm timestamp khi tạo document:

```json
{
  "name": "Product Name",
  "price": 99.99,
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  }
}
```

Kết quả:
```json
{
  "name": "Product Name",
  "price": 99.99,
  "created_at": "2024-01-25T10:00:00.000Z"
}
```

#### updated_at
Tự động cập nhật timestamp khi modify document:

```json
{
  "updated_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  }
}
```

### User Tracking Plugins

#### created_by
Tự động thêm user ID người tạo:

```json
{
  "title": "New Post",
  "created_by": {
    "isTurnOn": true,
    "value": ""  // Tự động lấy từ JWT token
  }
}
```

Kết quả:
```json
{
  "title": "New Post",
  "created_by": "user_12345"
}
```

#### updated_by
Track người cập nhật cuối cùng:

```json
{
  "updated_by": {
    "isTurnOn": true,
    "value": ""
  }
}
```

### Multi-tenancy Plugins

#### tenant_id
Tự động gán tenant ID:

```json
{
  "name": "Product",
  "tenant_id": {
    "isTurnOn": true,
    "value": ""  // Lấy từ user context
  }
}
```

### Expiration Plugins

#### expired_at
Set thời gian hết hạn tự động:

```json
{
  "license_key": "ABC123",
  "expired_at": {
    "isTurnOn": true,
    "value": "Date.now() + 365*24*60*60*1000"  // 1 năm
  }
}
```

### Hierarchy Plugins

#### parent_id
Cho hierarchical data:

```json
{
  "name": "Sub Category",
  "parent_id": {
    "isTurnOn": true,
    "value": "507f1f77bcf86cd799439011"
  }
}
```

## Dynamic Value Expressions

### Supported Expressions

1. **Current Timestamp**
   ```json
   "value": "Date.now()"
   ```

2. **Future Date**
   ```json
   "value": "Date.now() + 30*24*60*60*1000"  // 30 ngày
   ```

3. **Past Date**
   ```json
   "value": "Date.now() - 7*24*60*60*1000"  // 7 ngày trước
   ```

4. **Custom Date**
   ```json
   "value": "2025-12-31"
   ```

5. **User Context**
   ```json
   "value": "{{user.id}}"
   "value": "{{user.tenantId}}"
   "value": "{{user.role}}"
   ```

## Practical Examples

### 1. Blog Post với Full Audit Trail

```json
// POST /crud/posts
{
  "title": "Getting Started with MongoREST",
  "content": "MongoREST is amazing...",
  "status": "draft",
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "created_by": {
    "isTurnOn": true,
    "value": ""
  },
  "updated_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "updated_by": {
    "isTurnOn": true,
    "value": ""
  }
}
```

### 2. Subscription với Auto-expiration

```json
// POST /crud/subscriptions
{
  "userId": "user_12345",
  "plan": "premium",
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "expired_at": {
    "isTurnOn": true,
    "value": "Date.now() + 30*24*60*60*1000"  // 30 days
  },
  "tenant_id": {
    "isTurnOn": true,
    "value": ""
  }
}
```

### 3. Task với Parent Relationship

```json
// POST /crud/tasks
{
  "title": "Implement Feature X",
  "description": "Details about the feature",
  "parent_id": {
    "isTurnOn": true,
    "value": "507f1f77bcf86cd799439011"  // Parent task ID
  },
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "created_by": {
    "isTurnOn": true,
    "value": ""
  }
}
```

## Configuration in Schema

### Enable Plugins Globally

Trong schema file:

```json
{
  "collection": "posts",
  "properties": {
    // Field definitions
  },
  "mongorest": {
    "plugins": {
      "timestamps": true,      // Auto created_at, updated_at
      "userTracking": true,    // Auto created_by, updated_by
      "multiTenancy": true,    // Auto tenant_id
      "softDelete": true       // Auto deleted_at instead of hard delete
    }
  }
}
```

### Custom Plugin Configuration

```json
{
  "mongorest": {
    "plugins": {
      "custom": {
        "fields": {
          "created_at": {
            "type": "timestamp",
            "onCreate": true,
            "value": "Date.now()"
          },
          "updated_at": {
            "type": "timestamp",
            "onCreate": true,
            "onUpdate": true,
            "value": "Date.now()"
          },
          "version": {
            "type": "increment",
            "onCreate": 1,
            "onUpdate": "+1"
          }
        }
      }
    }
  }
}
```

## Plugin Combinations

### Full Audit Trail Setup

```json
{
  "data": {
    // Your actual data
  },
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "created_by": {
    "isTurnOn": true,
    "value": ""
  },
  "updated_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "updated_by": {
    "isTurnOn": true,
    "value": ""
  },
  "tenant_id": {
    "isTurnOn": true,
    "value": ""
  }
}
```

### Temporal Data Setup

```json
{
  "event": {
    // Event data
  },
  "valid_from": {
    "isTurnOn": true,
    "value": "Date.now()"
  },
  "valid_until": {
    "isTurnOn": true,
    "value": "Date.now() + 90*24*60*60*1000"  // 90 days
  },
  "expired_at": {
    "isTurnOn": true,
    "value": "Date.now() + 365*24*60*60*1000"  // 1 year
  }
}
```

## Best Practices

### 1. Use Consistent Plugin Sets

Tạo plugin templates cho các use cases:

```javascript
// Audit template
const auditPlugins = {
  created_at: { isTurnOn: true, value: "Date.now()" },
  created_by: { isTurnOn: true, value: "" },
  updated_at: { isTurnOn: true, value: "Date.now()" },
  updated_by: { isTurnOn: true, value: "" }
};

// Multi-tenant template
const tenantPlugins = {
  ...auditPlugins,
  tenant_id: { isTurnOn: true, value: "" }
};
```

### 2. Handle Plugin Fields in Queries

Khi query, nhớ rằng plugin fields tồn tại:

```
// Find documents expiring soon
GET /documents?expired_at=lt.Date.now()+7*24*60*60*1000

// Find by creator
GET /posts?created_by=eq.user_12345

// Multi-tenant filtering (automatic)
GET /products  // Automatically filtered by user's tenant_id
```

### 3. Combine với RBAC

Plugin fields có thể được control qua RBAC:

```json
{
  "GET": [
    {
      "user_role": "user",
      "patterns": [
        // Users cannot see system fields
        {"name": {"type": "string"}},
        {"content": {"type": "string"}}
        // created_by, tenant_id are hidden
      ]
    },
    {
      "user_role": "admin",
      "patterns": []  // Admin sees all including plugin fields
    }
  ]
}
```

### 4. Testing Plugin Values

Trong development, test với specific values:

```json
{
  "test_data": "value",
  "created_at": {
    "isTurnOn": true,
    "value": "2024-01-01T00:00:00Z"  // Fixed date for testing
  }
}
```

## Troubleshooting

### Plugin Not Working

1. **Check field name**: Phải match exactly với supported plugins
2. **Verify isTurnOn**: Must be `true` (boolean, not string)
3. **Check permissions**: User phải có quyền set plugin fields
4. **Validate value**: Expression phải valid

### Debug Plugin Execution

Enable debug mode:

```
POST /products?debug=true
```

Response sẽ include plugin info:

```json
{
  "debug": {
    "pluginsApplied": [
      {
        "field": "created_at",
        "value": "2024-01-25T10:00:00Z",
        "source": "Date.now()"
      },
      {
        "field": "created_by",
        "value": "user_12345",
        "source": "jwt.user.id"
      }
    ]
  }
}
```

## Advanced Plugin Usage

### Conditional Plugins

```json
{
  "status": "published",
  "published_at": {
    "isTurnOn": "{{status === 'published'}}",
    "value": "Date.now()"
  }
}
```

### Computed Values

```json
{
  "price": 100,
  "tax_rate": 0.1,
  "total_price": {
    "isTurnOn": true,
    "value": "{{price * (1 + tax_rate)}}"
  }
}
```

### Reference Other Fields

```json
{
  "title": "My Post",
  "slug": {
    "isTurnOn": true,
    "value": "{{slugify(title)}}"
  }
}
```

## Security Considerations

1. **Validate Expressions**: Only allow safe expressions
2. **Limit User Context**: Don't expose sensitive user data
3. **Audit Plugin Usage**: Log when plugins modify data
4. **Permission Control**: Some plugins may need special permissions
5. **Prevent Injection**: Sanitize dynamic values

## Performance Tips

1. **Batch Operations**: Plugins work với batch inserts
2. **Index Plugin Fields**: Add indexes cho commonly queried plugin fields
3. **Lazy Evaluation**: Plugins only execute when needed
4. **Cache User Context**: Reduce JWT decode overhead

## Integration với Other Features

### With Relationships
```json
{
  "name": "Product",
  "category_id": "507f1f77bcf86cd799439011",
  "created_at": {
    "isTurnOn": true,
    "value": "Date.now()"
  }
}
```

### With Validation
```json
{
  "email": "user@example.com",
  "verified_at": {
    "isTurnOn": false,  // Set to true after email verification
    "value": ""
  }
}
```

### With Hooks
Plugin values có thể trigger hooks:
- `afterCreate`: Send notification when `created_by` is set
- `beforeUpdate`: Log changes when `updated_by` changes
