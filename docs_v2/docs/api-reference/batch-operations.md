---
sidebar_position: 5
---

# Batch Operations

Hướng dẫn thực hiện batch operations với transaction support trong MongoREST.

## Overview

Batch operations cho phép:
- Execute nhiều operations trong một request
- Transaction support với rollback
- Bulk create/update/delete
- Mixed operation types
- Validation trước khi execute

## Basic Batch Operations

### Batch Create

```bash
POST /batch/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "create",
      "data": {
        "name": "iPhone 15",
        "price": 999,
        "categoryId": "cat_123"
      }
    },
    {
      "type": "create",
      "data": {
        "name": "iPhone 15 Pro",
        "price": 1199,
        "categoryId": "cat_123"
      }
    },
    {
      "type": "create",
      "data": {
        "name": "iPhone 15 Pro Max",
        "price": 1399,
        "categoryId": "cat_123"
      }
    }
  ]
}

# Response
{
  "success": true,
  "data": {
    "totalOperations": 3,
    "successful": 3,
    "failed": 0,
    "results": [
      {
        "index": 0,
        "type": "create",
        "status": "success",
        "data": {
          "_id": "prod_001",
          "name": "iPhone 15",
          "price": 999
        }
      },
      // ... more results
    ]
  }
}
```

### Batch Update

```bash
POST /batch/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "update",
      "filter": { "sku": "IPHONE-15" },
      "data": { "price": 899 }
    },
    {
      "type": "update",
      "filter": { "sku": "IPHONE-15-PRO" },
      "data": { "price": 1099 }
    },
    {
      "type": "update",
      "filter": { "category": "old_electronics" },
      "data": { "category": "electronics", "discount": 20 }
    }
  ]
}
```

### Batch Delete

```bash
POST /batch/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "delete",
      "filter": { "status": "discontinued" }
    },
    {
      "type": "delete",
      "filter": { "stock": 0, "lastRestocked": { "$lt": "2023-01-01" } }
    }
  ]
}
```

## Mixed Operations

### Different Operation Types

```bash
POST /batch/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "create",
      "data": {
        "name": "New Product",
        "price": 299
      }
    },
    {
      "type": "update",
      "filter": { "sku": "EXISTING-001" },
      "data": { "stock": 100 }
    },
    {
      "type": "delete",
      "filter": { "sku": "OLD-001" }
    }
  ],
  "options": {
    "validateBeforeExecute": true,
    "stopOnError": false
  }
}
```

### Cross-Collection Operations

```bash
POST /batch
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "collection": "orders",
      "type": "update",
      "filter": { "orderNumber": "ORD-001" },
      "data": { "status": "shipped" }
    },
    {
      "collection": "inventory",
      "type": "update",
      "filter": { "sku": "PROD-001" },
      "data": { "$inc": { "stock": -1 } }
    },
    {
      "collection": "notifications",
      "type": "create",
      "data": {
        "userId": "user_123",
        "message": "Your order has been shipped",
        "type": "order_update"
      }
    }
  ]
}
```

## Transaction Support

### Basic Transaction

```bash
POST /batch/orders?transaction=true
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "update",
      "filter": { "_id": "order_123" },
      "data": { "status": "processing" }
    },
    {
      "type": "update",
      "collection": "inventory",
      "filter": { "sku": "PROD-001" },
      "data": { "$inc": { "reserved": 2 } }
    },
    {
      "type": "create",
      "collection": "order_logs",
      "data": {
        "orderId": "order_123",
        "action": "status_changed",
        "newStatus": "processing",
        "timestamp": "$$NOW"
      }
    }
  ],
  "options": {
    "isolation": "snapshot",
    "maxTimeMS": 5000
  }
}
```

### Transaction with Rollback

```bash
POST /batch?transaction=true
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "update",
      "collection": "accounts",
      "filter": { "accountId": "ACC-001" },
      "data": { "$inc": { "balance": -1000 } }
    },
    {
      "type": "update",
      "collection": "accounts",
      "filter": { "accountId": "ACC-002" },
      "data": { "$inc": { "balance": 1000 } }
    }
  ],
  "options": {
    "rollbackOnError": true,
    "validateConstraints": true
  }
}

# If any operation fails, all are rolled back
```

## Bulk Import/Export

### CSV Import

```bash
POST /batch/import/products
Content-Type: multipart/form-data
Authorization: Bearer YOUR_JWT_TOKEN

# Form data:
file: products.csv
options: {
  "mapping": {
    "Product Name": "name",
    "Price": "price",
    "SKU": "sku"
  },
  "validation": true,
  "upsert": true,
  "upsertFields": ["sku"]
}

# Response
{
  "success": true,
  "data": {
    "totalRows": 1000,
    "imported": 980,
    "updated": 15,
    "failed": 5,
    "errors": [
      {
        "row": 45,
        "error": "Invalid price format"
      }
    ]
  }
}
```

### JSON Import

```bash
POST /batch/import/users
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "data": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "admin"
    }
  ],
  "options": {
    "validateSchema": true,
    "generateIds": true,
    "returnCreated": true
  }
}
```

## Validation Options

### Pre-Validation

```bash
POST /batch/products?validate=true&dryRun=true
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "create",
      "data": {
        "name": "Test Product",
        "price": -100  // Invalid price
      }
    }
  ]
}

# Response (dry run with validation)
{
  "success": false,
  "data": {
    "valid": false,
    "errors": [
      {
        "index": 0,
        "field": "price",
        "message": "Price must be positive"
      }
    ]
  }
}
```

### Schema Validation

```bash
POST /batch/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [...],
  "options": {
    "validateSchema": true,
    "schemaOptions": {
      "strict": true,
      "coerceTypes": false,
      "removeAdditional": false
    }
  }
}
```

## Advanced Features

### Conditional Operations

```bash
POST /batch/inventory
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    {
      "type": "update",
      "filter": { "sku": "PROD-001" },
      "data": { "$inc": { "stock": -5 } },
      "condition": { "stock": { "$gte": 5 } }
    }
  ],
  "options": {
    "returnModifiedOnly": true
  }
}
```

### Template Variables

```bash
POST /batch/notifications
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "variables": {
    "timestamp": "$$NOW",
    "sender": "system"
  },
  "operations": [
    {
      "type": "create",
      "data": {
        "userId": "user_001",
        "message": "Welcome!",
        "sentAt": "{{timestamp}}",
        "from": "{{sender}}"
      }
    },
    {
      "type": "create",
      "data": {
        "userId": "user_002",
        "message": "Welcome!",
        "sentAt": "{{timestamp}}",
        "from": "{{sender}}"
      }
    }
  ]
}
```

### Chunked Processing

```bash
POST /batch/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [...1000 operations...],
  "options": {
    "chunkSize": 100,
    "delayBetweenChunks": 1000,
    "onChunkComplete": "webhook:https://example.com/chunk-complete"
  }
}
```

## Real-World Examples

### Order Fulfillment

```bash
POST /batch?transaction=true
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    // Update order status
    {
      "collection": "orders",
      "type": "update",
      "filter": { "_id": "order_123" },
      "data": { 
        "status": "shipped",
        "shippedAt": "$$NOW",
        "trackingNumber": "TRK-123456"
      }
    },
    // Update inventory
    {
      "collection": "inventory",
      "type": "update",
      "filter": { "sku": "PROD-001" },
      "data": { "$inc": { "stock": -2, "reserved": -2 } }
    },
    // Create shipment record
    {
      "collection": "shipments",
      "type": "create",
      "data": {
        "orderId": "order_123",
        "carrier": "FedEx",
        "trackingNumber": "TRK-123456",
        "estimatedDelivery": "2024-01-30"
      }
    },
    // Send notification
    {
      "collection": "notifications",
      "type": "create",
      "data": {
        "userId": "user_456",
        "type": "order_shipped",
        "orderId": "order_123",
        "message": "Your order has been shipped!"
      }
    }
  ]
}
```

### Price Update Campaign

```bash
POST /batch/products
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    // Increase prices by 10% for electronics
    {
      "type": "updateMany",
      "filter": { "category": "electronics" },
      "data": { "$mul": { "price": 1.1 } }
    },
    // Apply discount to old inventory
    {
      "type": "updateMany",
      "filter": { 
        "createdAt": { "$lt": "2023-01-01" },
        "stock": { "$gt": 0 }
      },
      "data": { 
        "discount": 25,
        "tags": { "$addToSet": "clearance" }
      }
    },
    // Log price changes
    {
      "type": "create",
      "collection": "price_history",
      "data": {
        "action": "bulk_price_update",
        "timestamp": "$$NOW",
        "updatedBy": "$$USER_ID"
      }
    }
  ]
}
```

### User Migration

```bash
POST /batch?transaction=true
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "operations": [
    // Migrate user data
    {
      "type": "updateMany",
      "collection": "users",
      "filter": { "version": { "$lt": 2 } },
      "data": {
        "$set": {
          "version": 2,
          "profile": {
            "firstName": "$name.first",
            "lastName": "$name.last"
          }
        },
        "$unset": { "name": "" }
      }
    },
    // Update related data
    {
      "type": "updateMany",
      "collection": "posts",
      "filter": { "authorVersion": { "$lt": 2 } },
      "data": {
        "$set": { "authorVersion": 2 }
      }
    }
  ],
  "options": {
    "maxTimeMS": 300000,
    "writeConcern": { "w": "majority" }
  }
}
```

## Error Handling

### Partial Failures

```json
{
  "success": false,
  "data": {
    "totalOperations": 10,
    "successful": 7,
    "failed": 3,
    "results": [
      {
        "index": 3,
        "status": "failed",
        "error": "Duplicate key error",
        "code": "DUPLICATE_KEY"
      },
      {
        "index": 7,
        "status": "failed",
        "error": "Validation failed: price must be positive"
      }
    ]
  }
}
```

### Transaction Errors

```json
{
  "success": false,
  "error": "Transaction aborted",
  "code": "TRANSACTION_ABORTED",
  "details": {
    "failedOperation": 2,
    "reason": "Insufficient stock",
    "rollbackCompleted": true
  }
}
```

## Performance Tips

### 1. Use Bulk Operations

```bash
# ✅ Good: Single bulk operation
POST /batch/products
{
  "operations": [
    { "type": "updateMany", "filter": {}, "data": {} }
  ]
}

# ❌ Bad: Multiple individual requests
PATCH /products/1
PATCH /products/2
PATCH /products/3
```

### 2. Optimize Chunk Size

```javascript
// For large datasets
{
  "options": {
    "chunkSize": 500,  // Optimal for most cases
    "parallel": false  // Sequential processing
  }
}
```

### 3. Use Appropriate Indexes

```javascript
// Ensure indexes for batch filters
{
  "indexes": [
    { "fields": { "sku": 1 } },
    { "fields": { "status": 1, "createdAt": -1 } }
  ]
}
```

## Best Practices

### 1. Validate Before Execute

```bash
# Always validate complex batches
POST /batch?validate=true&dryRun=true
```

### 2. Use Transactions for Critical Operations

```bash
# Financial or inventory operations
POST /batch?transaction=true&rollbackOnError=true
```

### 3. Monitor Progress

```javascript
// For long-running batches
{
  "options": {
    "trackProgress": true,
    "progressWebhook": "https://example.com/progress"
  }
}
```

### 4. Handle Errors Gracefully

```javascript
// Implement retry logic
{
  "options": {
    "retryFailedOperations": true,
    "maxRetries": 3,
    "retryDelay": 1000
  }
}
```

## Summary

Batch operations trong MongoREST:

1. **Efficient**: Process multiple operations in one request
2. **Transactional**: ACID compliance với MongoDB transactions
3. **Flexible**: Mix different operation types
4. **Reliable**: Validation và error handling
5. **Scalable**: Chunked processing cho large datasets

Next: [Debug Mode →](./debug-mode)
