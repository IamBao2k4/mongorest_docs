---
sidebar_position: 3
---

# Role-Based Access Control (RBAC)

MongoREST implement hệ thống RBAC mạnh mẽ ở field level, cho phép kiểm soát chi tiết quyền truy cập cho từng role.

## Tổng Quan RBAC

RBAC trong MongoREST hoạt động ở nhiều levels:
- **Collection Level**: Kiểm soát access cho toàn bộ collection
- **Operation Level**: Kiểm soát theo HTTP methods (GET, POST, PUT, PATCH, DELETE)
- **Field Level**: Kiểm soát fields nào được read/write
- **Row Level**: Filter documents theo user context (future)

## RBAC Configuration

### Basic Structure

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
      }
    ],
    "POST": [...],
    "PUT": [...],
    "PATCH": [...],
    "DELETE": [...]
  }
}
```

### Complete Example

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
          {"_id": {"type": "string"}},
          {"orderNumber": {"type": "string"}},
          {"customerId": {"type": "string"}},
          {"items": {"type": "object"}},
          {"shippingAddress": {"type": "object"}},
          {"billingAddress": {"type": "object"}},
          {"payment": {"type": "object"}},
          {"subtotal": {"type": "number"}},
          {"tax": {"type": "number"}},
          {"totalAmount": {"type": "number"}},
          {"currency": {"type": "string"}},
          {"status": {"type": "string"}},
          {"orderDate": {"type": "string"}},
          {"shippedDate": {"type": "string"}},
          {"deliveredDate": {"type": "string"}},
          {"notes": {"type": "string"}},
          {"customer": {"type": "relation", "relate_collection": "users"}},
          {"createdAt": {"type": "string"}},
          {"updatedAt": {"type": "string"}}
        ]
      }
    ],
    "POST": [
      {
        "user_role": "user",
        "patterns": [
          {"customerId": {"type": "string", "pattern": "^[a-zA-Z0-9]{24}$"}},
          {"items": {"type": "object", "minItems": 1}},
          {"shippingAddress": {"type": "object", "required": ["street", "city", "postalCode", "country"]}},
          {"billingAddress": {"type": "object"}},
          {"payment": {"type": "object", "required": ["method"], "properties": {"method": {"enum": ["credit_card", "paypal", "bank_transfer"]}}}},
          {"notes": {"type": "string", "maxLength": 500}}
        ]
      },
      {
        "user_role": "admin",
        "patterns": [
          {"orderNumber": {"type": "string", "pattern": "^ORD-[0-9]{8}$"}},
          {"customerId": {"type": "string", "pattern": "^[a-zA-Z0-9]{24}$"}},
          {"items": {"type": "object", "minItems": 1}},
          {"shippingAddress": {"type": "object", "required": ["street", "city", "postalCode", "country"]}},
          {"billingAddress": {"type": "object"}},
          {"payment": {"type": "object", "required": ["method", "status"]}},
          {"subtotal": {"type": "number", "min": 0}},
          {"tax": {"type": "number", "min": 0}},
          {"totalAmount": {"type": "number", "min": 0}},
          {"currency": {"type": "string", "enum": ["USD", "EUR", "VND", "GBP"]}},
          {"status": {"type": "string", "enum": ["pending", "processing", "shipped", "delivered", "cancelled"]}},
          {"orderDate": {"type": "string"}},
          {"notes": {"type": "string", "maxLength": 1000}}
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
          {"shippedDate": {"type": "string"}},
          {"deliveredDate": {"type": "string"}},
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

## Cách RBAC Hoạt Động

### 1. Request Flow

```javascript
// 1. Extract user role từ JWT
const userRole = request.user.role // "user", "admin", etc.

// 2. Get RBAC config cho collection và method và user role
const allowedFields = filterRbacFeatures(collection, request.method ,userRole)

```

### 2. Field Filtering Process

```javascript
private filterDataByProjection(data: any, projection: any): any {
  const result: any = {};

  for (const key in projection) {
      if (projection.hasOwnProperty(key)) {
          const projValue = projection[key];

          if (projValue === 1) {
              // basic field
              if (key in data) {
                  result[key] = data[key];
              }
          } else if (typeof projValue === 'object' && projValue !== null) {
              // nested field
              if (key in data && typeof data[key] === 'object' && data[key] !== null) {
                  result[key] = this.filterDataByProjection(data[key], projValue);
              }
          }
      }
  }

  return result;
}
```

## Field-Level Security

### Nested Field Access

```json
{
  "patterns": [
    // Access to nested fields
    {"payment.status": {"type": "string"}},
    {"payment.method": {"type": "string"}},
    
    // But not payment.cardNumber
    // {"payment.cardNumber": {"type": "string"}} // NOT included
  ]
}
```

### Relationship Access

```json
{
  "patterns": [
    // Allow access to related data
    {"customer": {
      "type": "relation",
      "relate_collection": "users"
    }}
  ]
}
```

## Advanced RBAC Features

### 1. Conditional Permissions

```json
{
  "user_role": "user",
  "patterns": [
    {
      "status": {
        "type": "string",
        "enum": ["draft", "published"]
      }
    }
  ]
}
```

## Deletion Control

### Role-Based Deletion

Khi người dùng gửi request DELETE, hệ thống kiểm tra:

```javascript
// Check delete permission
const deleteConfig = rbacConfig[collection].DELETE
const userRole = jwt.role

const canDelete = deleteConfig.some(config => config.user_role === userRole)

if (!canDelete) {
  throw new ForbiddenError('You do not have permission to delete this document')
}
```

### Example Configuration

```json
{
  "DELETE": [
    {
      "user_role": "admin"
    },
    {
      "user_role": "moderator",
      "conditions": {
        "status": ["draft", "pending"]
      }
    }
  ]
}
```

## RBAC Best Practices

### 1. Principle of Least Privilege

```json
// ✅ Good: Minimal necessary permissions
{
  "user_role": "user",
  "patterns": [
    {"name": {"type": "string"}},
    {"email": {"type": "string"}}
  ]
}

// ❌ Bad: Too permissive
{
  "user_role": "user",
  "patterns": [
    {"*": {"type": "any"}}
  ]
}
```

### 2. Explicit Field Listing

```json
// ✅ Good: Explicit fields
{
  "patterns": [
    {"orderId": {"type": "string"}},
    {"status": {"type": "string"}},
    {"total": {"type": "number"}}
  ]
}

// ❌ Bad: Wildcard access
{
  "patterns": [
    {"*": {"type": "any"}}
  ]
}
```

### 3. Validation Rules

```json
// ✅ Good: Strong validation
{
  "patterns": [
    {
      "email": {
        "type": "string",
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      }
    },
    {
      "age": {
        "type": "number",
        "min": 0,
        "max": 150
      }
    }
  ]
}
```

### 4. Sensitive Data Protection

```json
// Never expose sensitive fields to non-admin
{
  "user_role": "user",
  "patterns": [
    // {"password": {"type": "string"}}, // NEVER
    // {"creditCard": {"type": "string"}}, // NEVER
    // {"ssn": {"type": "string"}}, // NEVER
    {"name": {"type": "string"}},
    {"email": {"type": "string"}}
  ]
}
```

## Summary

RBAC trong MongoREST cung cấp:

1. **Granular Control**: Field-level permissions
2. **Flexibility**: Role-based configuration
3. **Security**: Input validation và filtering
4. **Scalability**: Easy to add new roles
5. **Auditability**: Complete access logs

Next: [Relationship System →](./relationships)
