---
sidebar_position: 1
---

# Plugin System

MongoREST cung cấp một hệ thống plugin mạnh mẽ và linh hoạt, cho phép tự động thêm các fields và behaviors vào documents.

## Giới thiệu Plugin System

Plugin system cho phép bạn:
- 🔌 Tự động thêm fields vào documents

## Cách Plugin Hoạt Động

### Plugin Configuration

```json
{
  "title": "Admin Role",
  "is_active": true,
  "tenant_id": "tenant_123",
  "parent_id": {
    "isTurnOn": true,
    "value": ""
  },
  "created_at": {
    "isTurnOn": true,
    "value": "2025-01-01"
  },
  "updated_at": {
    "isTurnOn": true,
    "value": "Date.now() - 2*60*60*1000"
  },
  "expired_at": {
    "isTurnOn": true,
    "value": "Date.now() + 15*24*60*60*1000"
  },
  "created_by": {
    "isTurnOn": true,
    "value": ""
  }
}
```

### Processing Flow

```javascript
// Khi nhận request
function processPlugins(data, pluginList) {
  for (const [fieldName, config] of Object.entries(data)) {
    // Check if field is a plugin
    if (pluginList.includes(fieldName) && config.isTurnOn) {
      // Apply plugin logic
      data[fieldName] = evaluatePluginValue(config.value)
    }
  }
  return data
}

function evaluatePluginValue(value) {
  // Handle dynamic expressions
  if (value.includes('Date.now()')) {
    return eval(value) // Safe eval with sandbox
  }
  
  // Handle empty values
  if (value === '') {
    return getCurrentContext() // e.g., user ID for created_by
  }
  
  return value
}
```

## Built-in Plugins

### 1. Timestamps Plugin

Tự động thêm timestamps vào documents.

```javascript
// Schema configuration
{
  "mongorest": {
    "plugins": {
      "timestamps": true
    }
  }
}

// Automatically adds:
{
  "createdAt": "2024-01-25T10:00:00Z",
  "updatedAt": "2024-01-25T10:00:00Z"
}
```

### 2. Soft Delete Plugin

Soft delete thay vì xóa thật documents.

```javascript
// Schema configuration
{
  "mongorest": {
    "plugins": {
      "softDelete": true
    }
  }
}

// DELETE operation adds:
{
  "deletedAt": "2024-01-25T10:00:00Z"
}

// Queries automatically filter out deleted documents
```

### 3. Audit Plugin

Track ai thực hiện operations.

```javascript
// Schema configuration
{
  "mongorest": {
    "plugins": {
      "audit": true
    }
  }
}

// Automatically adds:
{
  "createdBy": "user_123",
  "updatedBy": "user_456",
  "deletedBy": "admin_789"
}
```

### 4. Versioning Plugin

Track document versions.

```javascript
// Schema configuration
{
  "mongorest": {
    "plugins": {
      "versioning": true
    }
  }
}

// Automatically maintains:
{
  "__v": 3,
  "_versions": [
    { "version": 1, "data": {...}, "changedAt": "..." },
    { "version": 2, "data": {...}, "changedAt": "..." }
  ]
}
```

### 5. Tenant Plugin

Multi-tenancy support.

```javascript
// Schema configuration
{
  "mongorest": {
    "plugins": {
      "tenant": {
        "enabled": true,
        "field": "tenantId"
      }
    }
  }
}

// Automatically adds tenantId to all operations
// Filters all queries by current tenant
```

## Summary

Plugin system trong MongoREST cung cấp:

1. **Flexibility**: Mở rộng functionality không cần sửa core
2. **Consistency**: Apply behaviors across collections
3. **Automation**: Giảm manual work
4. **Extensibility**: Easy to add custom plugins
5. **Performance**: Optimized plugin execution

Next: [Query API →](./query-api)
