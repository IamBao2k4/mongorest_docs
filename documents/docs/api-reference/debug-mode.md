---
sidebar_position: 4
---

# Debug Mode & Dry Run

Hướng dẫn sử dụng debug mode và dry run để test và optimize queries trong MongoREST.

## Overview

Debug features cho phép:
- Test queries mà không execute
- Xem aggregation pipeline được generate
- Analyze query performance
- Debug relationship queries
- Validate complex operations

## Dry Run Mode

### Basic Dry Run

```bash
# Test query without execution
GET /products?dryRun=true&status=eq.active&price=gte.100

# Response
{
  "success": true,
  "dryRun": true,
  "data": null,
  "debug": {
    "wouldExecute": true,
    "parsedQuery": {
      "filter": {
        "status": "active",
        "price": { "$gte": 100 }
      }
    },
    "estimatedDocuments": 150,
    "indexesAvailable": ["status_1", "price_1"]
  }
}
```

### Dry Run with Complex Query

```bash
# Test complex query with relationships
GET /orders?
  dryRun=true&
  and=(status=eq.completed,total=gte.1000)&
  select=orderNumber,customer(name,email),items(*)&
  sort=createdAt&
  order=desc&
  limit=10

# Response shows what would be executed
{
  "success": true,
  "dryRun": true,
  "data": null,
  "debug": {
    "parsedQuery": {
      "filter": {
        "$and": [
          { "status": "completed" },
          { "total": { "$gte": 1000 } }
        ]
      },
      "relationships": ["customer", "items"],
      "sort": { "createdAt": -1 },
      "limit": 10
    },
    "pipelineStages": 6,
    "estimatedCost": "medium"
  }
}
```

### Dry Run for Mutations

```bash
# Test create operation
POST /products?dryRun=true
Content-Type: application/json

{
  "name": "New Product",
  "price": 99.99,
  "categoryId": "cat_123"
}

# Response
{
  "success": true,
  "dryRun": true,
  "data": null,
  "debug": {
    "operation": "create",
    "validation": {
      "valid": true,
      "schema": "products",
      "fields": ["name", "price", "categoryId"]
    },
    "wouldCreate": {
      "name": "New Product",
      "price": 99.99,
      "categoryId": "cat_123",
      "_id": "[would be generated]",
      "createdAt": "[current time]",
      "updatedAt": "[current time]"
    }
  }
}
```

## Debug Mode

### Basic Debug Info

```bash
# Enable debug mode
GET /products?debug=true&category=eq.electronics

# Response includes debug information
{
  "success": true,
  "data": [...],
  "debug": {
    "query": {
      "raw": "category=eq.electronics",
      "parsed": {
        "filter": { "category": "electronics" }
      }
    },
    "execution": {
      "startTime": "2024-01-25T10:00:00.000Z",
      "endTime": "2024-01-25T10:00:00.045Z",
      "duration": 45,
      "documentsExamined": 500,
      "documentsReturned": 150
    },
    "mongodb": {
      "explainVersion": "1",
      "winningPlan": {
        "stage": "FETCH",
        "inputStage": {
          "stage": "IXSCAN",
          "indexName": "category_1"
        }
      }
    }
  }
}
```

### Aggregation Pipeline Debug

```bash
# Debug relationship query
GET /orders?
  debug=true&
  select=orderNumber,customer(name),total

# Response shows generated pipeline
{
  "success": true,
  "data": [...],
  "debug": {
    "aggregationPipeline": [
      {
        "$match": {}
      },
      {
        "$lookup": {
          "from": "users",
          "localField": "customerId",
          "foreignField": "_id",
          "as": "customer"
        }
      },
      {
        "$addFields": {
          "customer": { "$arrayElemAt": ["$customer", 0] }
        }
      },
      {
        "$project": {
          "orderNumber": 1,
          "customer.name": 1,
          "total": 1
        }
      }
    ],
    "pipelineExplain": {
      "stages": [
        {
          "name": "$match",
          "executionTimeMillis": 5,
          "docsExamined": 1000
        },
        {
          "name": "$lookup",
          "executionTimeMillis": 35,
          "docsExamined": 1000
        }
      ]
    }
  }
}
```

### Performance Analysis

```bash
# Detailed performance debug
GET /products?
  debug=true&
  debugLevel=verbose&
  category.featured=eq.true&
  select=name,price,reviews(rating)

# Response with verbose debug
{
  "success": true,
  "data": [...],
  "debug": {
    "performance": {
      "phases": {
        "parsing": 2,
        "validation": 5,
        "pipelineBuilding": 8,
        "execution": 145,
        "serialization": 10,
        "total": 170
      },
      "memory": {
        "before": 45678900,
        "after": 46789012,
        "peak": 47890123
      }
    },
    "optimization": {
      "indexesUsed": ["category.featured_1"],
      "indexesRecommended": [
        {
          "fields": { "category.featured": 1, "price": -1 },
          "impact": "high",
          "reason": "Would eliminate collection scan"
        }
      ]
    },
    "warnings": [
      "Large number of documents in $lookup stage",
      "Consider adding limit to relationship query"
    ]
  }
}
```

## Debug Levels

### Level 1: Basic (default)

```bash
GET /products?debug=true

# Shows:
# - Query parsing
# - Execution time
# - Document counts
```

### Level 2: Detailed

```bash
GET /products?debug=true&debugLevel=detailed

# Shows everything from Level 1 plus:
# - Aggregation pipeline
# - Index usage
# - Memory usage
```

### Level 3: Verbose

```bash
GET /products?debug=true&debugLevel=verbose

# Shows everything from Level 2 plus:
# - Query explanation
# - Optimization suggestions
# - Performance warnings
# - Stage-by-stage timings
```

## RBAC Debug

### Permission Debug

```bash
# Debug RBAC filtering
GET /orders?debug=true&debugRbac=true
Authorization: Bearer USER_TOKEN

# Response shows permission filtering
{
  "success": true,
  "data": [...],
  "debug": {
    "rbac": {
      "userRole": "user",
      "collection": "orders",
      "operation": "read",
      "allowedFields": [
        "orderNumber",
        "status",
        "total",
        "customer.name"
      ],
      "hiddenFields": [
        "cost",
        "profit",
        "internalNotes"
      ],
      "filtersApplied": {
        "customerId": "user_123"
      }
    }
  }
}
```

### Field Filtering Debug

```bash
# See how fields are filtered by role
GET /products/123?debug=true&debugRbac=true
Authorization: Bearer GUEST_TOKEN

# Response
{
  "success": true,
  "data": {
    "name": "iPhone 15",
    "price": 999
  },
  "debug": {
    "rbac": {
      "originalFields": [
        "_id", "name", "price", "cost", 
        "supplier", "internalNotes"
      ],
      "roleAllowedFields": ["name", "price"],
      "removedFields": [
        "_id", "cost", "supplier", "internalNotes"
      ]
    }
  }
}
```

## Query Optimization Debug

### Index Analysis

```bash
# Analyze index usage
GET /products?
  debug=true&
  debugIndexes=true&
  status=eq.active&
  price=gte.100&
  category=eq.electronics

# Response
{
  "debug": {
    "indexes": {
      "available": [
        { "name": "status_1", "fields": { "status": 1 } },
        { "name": "price_1", "fields": { "price": 1 } },
        { "name": "category_1_price_-1", "fields": { "category": 1, "price": -1 } }
      ],
      "used": "category_1_price_-1",
      "efficiency": {
        "keysExamined": 150,
        "docsExamined": 150,
        "ratio": 1.0,
        "rating": "optimal"
      },
      "suggestions": [
        {
          "create": { "status": 1, "category": 1, "price": -1 },
          "benefit": "Would allow index-only query",
          "estimatedImprovement": "70%"
        }
      ]
    }
  }
}
```

### Query Plan Comparison

```bash
# Compare query plans
GET /products?
  debug=true&
  comparePlans=true&
  category=eq.electronics&
  price=gte.100

# Response shows alternative plans
{
  "debug": {
    "queryPlans": {
      "winning": {
        "index": "category_1_price_-1",
        "estimatedCost": 150,
        "actualTime": 23
      },
      "rejected": [
        {
          "index": "category_1",
          "estimatedCost": 500,
          "reason": "Higher cost due to additional filtering"
        },
        {
          "index": null,
          "estimatedCost": 10000,
          "reason": "Collection scan"
        }
      ]
    }
  }
}
```

## Error Debugging

### Validation Errors

```bash
# Debug validation errors
POST /products?debug=true
Content-Type: application/json

{
  "name": "",  // Empty name
  "price": -100  // Negative price
}

# Response with detailed validation debug
{
  "success": false,
  "error": "ValidationError",
  "debug": {
    "validation": {
      "schema": "products",
      "errors": [
        {
          "field": "name",
          "value": "",
          "rule": "minLength",
          "expected": 1,
          "message": "Name is required"
        },
        {
          "field": "price",
          "value": -100,
          "rule": "minimum",
          "expected": 0,
          "message": "Price must be positive"
        }
      ],
      "schemaPath": "/properties/price/minimum"
    }
  }
}
```

### Query Parse Errors

```bash
# Debug query parsing errors
GET /products?debug=true&invalidOperator=xyz.value

# Response
{
  "success": false,
  "error": "QueryParseError",
  "debug": {
    "parsing": {
      "raw": "invalidOperator=xyz.value",
      "error": "Unknown operator 'xyz'",
      "validOperators": [
        "eq", "neq", "gt", "gte", "lt", "lte",
        "in", "nin", "like", "regex", "exists", "null"
      ],
      "suggestion": "Did you mean 'eq'?"
    }
  }
}
```

## Batch Operations Debug

### Batch Dry Run

```bash
# Test batch operations
POST /batch/products?dryRun=true&debug=true
Content-Type: application/json

{
  "operations": [
    {
      "type": "update",
      "filter": { "sku": "PROD-001" },
      "data": { "stock": 100 }
    },
    {
      "type": "delete",
      "filter": { "status": "discontinued" }
    }
  ]
}

# Response
{
  "success": true,
  "dryRun": true,
  "debug": {
    "operations": [
      {
        "index": 0,
        "type": "update",
        "wouldAffect": 1,
        "matchedDocuments": ["507f1f77bcf86cd799439011"]
      },
      {
        "index": 1,
        "type": "delete",
        "wouldAffect": 15,
        "warning": "Would delete 15 documents"
      }
    ],
    "estimatedTime": 120,
    "transactionRequired": false
  }
}
```

## Real-World Debug Examples

### E-commerce Query Debug

```bash
# Debug complex product search
GET /products?
  debug=true&
  debugLevel=detailed&
  and=(
    status=eq.active,
    price=between.100.500,
    or=(category=eq.electronics,category=eq.computers)
  )&
  select=name,price,category(name),avgRating:reviews!avg(rating)&
  sort=avgRating&
  order=desc&
  limit=20

# Detailed debug output helps optimize
{
  "debug": {
    "queryComplexity": "high",
    "estimatedTime": 250,
    "bottlenecks": [
      {
        "stage": "$lookup for reviews",
        "impact": "high",
        "suggestion": "Consider caching avgRating in product document"
      }
    ],
    "indexSuggestions": [
      {
        "fields": { "status": 1, "category": 1, "price": 1 },
        "benefit": "Would reduce documents examined by 80%"
      }
    ]
  }
}
```

### Performance Troubleshooting

```bash
# Debug slow query
GET /orders?
  debug=true&
  debugPerformance=true&
  customer.country=eq.USA&
  items.product.category=eq.electronics&
  select=*,customer(*),items(*)

# Response identifies issues
{
  "debug": {
    "performance": {
      "totalTime": 3500,
      "slowestStage": {
        "name": "$lookup items.product",
        "time": 2800,
        "reason": "No index on items.productId"
      },
      "recommendations": [
        "Add index on items.productId",
        "Limit fields selected from relationships",
        "Consider denormalizing category in items"
      ]
    }
  }
}
```

## Debug Output Formats

### JSON Format (default)

```bash
GET /products?debug=true&debugFormat=json
```

### Table Format

```bash
GET /products?debug=true&debugFormat=table

# Response in tabular format
Debug Information:
┌─────────────────┬─────────────┬────────────┐
│ Stage           │ Time (ms)   │ Documents  │
├─────────────────┼─────────────┼────────────┤
│ Query Parse     │ 2           │ -          │
│ Index Selection │ 5           │ -          │
│ Document Scan   │ 45          │ 1500       │
│ Projection      │ 8           │ 150        │
└─────────────────┴─────────────┴────────────┘
```

### Explain Format

```bash
GET /products?debug=true&debugFormat=explain

# MongoDB explain() output format
{
  "queryPlanner": {...},
  "executionStats": {...},
  "serverInfo": {...}
}
```

## Best Practices

### 1. Use Dry Run for Testing

```bash
# Always test complex queries first
GET /critical-data?dryRun=true&complexQuery...
```

### 2. Progressive Debug Levels

```bash
# Start with basic, increase as needed
debug=true → debugLevel=detailed → debugLevel=verbose
```

### 3. Monitor Production Queries

```javascript
// Enable debug for slow queries only
if (executionTime > 1000) {
  query.debug = true;
  query.debugLevel = 'detailed';
}
```

### 4. Use Debug in Development

```javascript
// Auto-enable in development
const debugMode = process.env.NODE_ENV === 'development';
```

## Limitations

### Performance Impact

```
Debug Mode Performance Impact:
- Basic: ~5% overhead
- Detailed: ~15% overhead  
- Verbose: ~30% overhead
```

### Security Considerations

```javascript
// Disable debug in production for sensitive data
{
  "production": {
    "allowDebug": false,
    "allowedDebugRoles": ["admin", "developer"]
  }
}
```

## Summary

Debug features trong MongoREST:

1. **Comprehensive**: Dry run và multiple debug levels
2. **Insightful**: Performance analysis và optimization hints
3. **Developer-friendly**: Clear error messages và suggestions
4. **Production-safe**: Minimal overhead với proper controls
5. **Actionable**: Specific recommendations cho improvements

Next: [Schema Documentation →](/docs/schema/schema-structure)
